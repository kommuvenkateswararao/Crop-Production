
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pathlib import Path
import joblib
import pandas as pd

from .database import Base, engine, get_db
from .models import ProductionRecord, PredictionHistory
from .schemas import PredictionRequest, PredictionResponse


# Create database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI application
app = FastAPI(
    title="Crop Production System API",
    version="1.0.0",
    description="Andhra Pradesh historical crop analytics and ML predictions"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "https://crop-production.kommuvenky8693.workers.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Machine learning model directory
MODEL_DIR = Path(__file__).resolve().parents[1] / "ml" / "models"


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Crop Production System API",
        "docs": "/docs"
    }


# Health check endpoint
@app.get("/api/health")
def health():
    return {"status": "ok"}


# Dashboard summary
@app.get("/api/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    q = db.query(
        func.count(ProductionRecord.id),
        func.coalesce(func.sum(ProductionRecord.area), 0),
        func.coalesce(func.sum(ProductionRecord.production), 0),
        func.count(func.distinct(ProductionRecord.crop)),
        func.count(func.distinct(ProductionRecord.district)),
        func.min(ProductionRecord.year),
        func.max(ProductionRecord.year)
    ).filter(
        ProductionRecord.state.ilike("%andhra pradesh%")
    ).one()

    total_area = float(q[1] or 0)
    total_production = float(q[2] or 0)

    return {
        "record_count": q[0],
        "total_area_hectares": round(total_area, 2),
        "total_production_tonnes": round(total_production, 2),
        "crop_count": q[3],
        "district_count": q[4],
        "min_year": q[5],
        "max_year": q[6],
        "average_yield_tonnes_per_hectare": (
            round(total_production / total_area, 3)
            if total_area else 0
        )
    }


# Production by year
@app.get("/api/dashboard/production-by-year")
def production_by_year(db: Session = Depends(get_db)):
    rows = (
        db.query(
            ProductionRecord.year,
            func.sum(ProductionRecord.production)
        )
        .filter(
            ProductionRecord.state.ilike("%andhra pradesh%"),
            ProductionRecord.production.isnot(None)
        )
        .group_by(ProductionRecord.year)
        .order_by(ProductionRecord.year)
        .all()
    )

    return [
        {
            "year": y,
            "production_tonnes": float(v or 0)
        }
        for y, v in rows
    ]


# Production by district
@app.get("/api/dashboard/production-by-district")
def production_by_district(db: Session = Depends(get_db)):
    rows = (
        db.query(
            ProductionRecord.district,
            func.sum(ProductionRecord.production)
        )
        .filter(
            ProductionRecord.state.ilike("%andhra pradesh%"),
            ProductionRecord.production.isnot(None)
        )
        .group_by(ProductionRecord.district)
        .order_by(
            func.sum(ProductionRecord.production).desc()
        )
        .all()
    )

    return [
        {
            "district": d,
            "production_tonnes": float(v or 0)
        }
        for d, v in rows
    ]


# Production by crop
@app.get("/api/dashboard/production-by-crop")
def production_by_crop(db: Session = Depends(get_db)):
    rows = (
        db.query(
            ProductionRecord.crop,
            func.sum(ProductionRecord.production)
        )
        .filter(
            ProductionRecord.state.ilike("%andhra pradesh%"),
            ProductionRecord.production.isnot(None)
        )
        .group_by(ProductionRecord.crop)
        .order_by(
            func.sum(ProductionRecord.production).desc()
        )
        .limit(15)
        .all()
    )

    return [
        {
            "crop": c,
            "production_tonnes": float(v or 0)
        }
        for c, v in rows
    ]


# Dashboard filters
@app.get("/api/filters")
def filters(db: Session = Depends(get_db)):
    base = db.query(ProductionRecord).filter(
        ProductionRecord.state.ilike("%andhra pradesh%")
    )

    return {
        "districts": [
            x[0] for x in base.with_entities(
                ProductionRecord.district
            ).distinct().order_by(
                ProductionRecord.district
            ).all()
        ],
        "crops": [
            x[0] for x in base.with_entities(
                ProductionRecord.crop
            ).distinct().order_by(
                ProductionRecord.crop
            ).all()
        ],
        "seasons": [
            x[0] for x in base.with_entities(
                ProductionRecord.season
            ).distinct().order_by(
                ProductionRecord.season
            ).all()
        ],
        "years": [
            x[0] for x in base.with_entities(
                ProductionRecord.year
            ).distinct().order_by(
                ProductionRecord.year
            ).all()
        ]
    }


# Production records
@app.get("/api/production")
def production_records(
    district: str | None = None,
    crop: str | None = None,
    season: str | None = None,
    year: int | None = None,
    limit: int = Query(500, ge=1, le=5000),
    db: Session = Depends(get_db)
):
    q = db.query(ProductionRecord).filter(
        ProductionRecord.state.ilike("%andhra pradesh%")
    )

    if district:
        q = q.filter(ProductionRecord.district == district)

    if crop:
        q = q.filter(ProductionRecord.crop == crop)

    if season:
        q = q.filter(ProductionRecord.season == season)

    if year:
        q = q.filter(ProductionRecord.year == year)

    records = (
        q.order_by(ProductionRecord.year.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": r.id,
            "district": r.district,
            "crop": r.crop,
            "season": r.season,
            "year": r.year,
            "area_hectares": r.area,
            "production_tonnes": r.production
        }
        for r in records
    ]


# Machine learning model metrics
@app.get("/api/ml/metrics")
def ml_metrics():
    p = MODEL_DIR / "metrics.json"

    if not p.exists():
        raise HTTPException(
            status_code=404,
            detail="Models not trained yet. Run: python -m ml.train"
        )

    import json

    return json.loads(
        p.read_text(encoding="utf-8")
    )


# Machine learning prediction
@app.post(
    "/api/ml/predict",
    response_model=PredictionResponse
)
def predict(
    payload: PredictionRequest,
    db: Session = Depends(get_db)
):
    name = payload.model.lower()

    if name not in ("decision_tree", "random_forest"):
        raise HTTPException(
            status_code=400,
            detail="model must be decision_tree or random_forest"
        )

    path = MODEL_DIR / f"{name}.joblib"

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="Model not trained. Run: python -m ml.train"
        )

    model = joblib.load(path)

    row = pd.DataFrame([
        {
            "district": payload.district,
            "crop": payload.crop,
            "season": payload.season,
            "year": payload.year,
            "area": payload.area
        }
    ])

    estimate = max(
        0.0,
        float(model.predict(row)[0])
    )

    db.add(
        PredictionHistory(
            district=payload.district,
            crop=payload.crop,
            season=payload.season,
            year=payload.year,
            area=payload.area,
            predicted_production=estimate,
            model_name=name
        )
    )

    db.commit()

    return {
        "model": name,
        "predicted_production_tonnes": round(estimate, 2),
        "estimated_yield_tonnes_per_hectare": round(
            estimate / payload.area, 3
        ),
        "note": (
            "Estimate based on historical dataset patterns; "
            "not a guaranteed real-world outcome."
        )
    }


# Prediction history
@app.get("/api/ml/history")
def prediction_history(db: Session = Depends(get_db)):
    rows = (
        db.query(PredictionHistory)
        .order_by(PredictionHistory.id.desc())
        .limit(100)
        .all()
    )

    return [
        {
            "id": r.id,
            "district": r.district,
            "crop": r.crop,
            "season": r.season,
            "year": r.year,
            "area_hectares": r.area,
            "predicted_production_tonnes": r.predicted_production,
            "model": r.model_name,
            "created_at": r.created_at
        }
        for r in rows
    ]
