"""Import the filtered Andhra Pradesh primary dataset into MySQL/SQLite."""
from pathlib import Path
import sys
import pandas as pd
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.database import Base, engine, SessionLocal
from app.models import ProductionRecord

ROOT = Path(__file__).resolve().parents[2]
CSV = ROOT / "datasets" / "Crop_Production_Datasets" / "andhra_pradesh" / "andhra_pradesh_crop_production_dataset1.csv"

def main():
    Base.metadata.create_all(bind=engine)
    df = pd.read_csv(CSV).dropna(subset=["area"])
    df = df.rename(columns={"district_name":"district"})
    df["production"] = pd.to_numeric(df["production"], errors="coerce")
    db = SessionLocal()
    try:
        db.query(ProductionRecord).delete()
        batch=[]
        for r in df.to_dict("records"):
            batch.append(ProductionRecord(state="Andhra Pradesh",district=str(r["district"]),
                year=int(r["year"]),season=str(r["season"]),crop=str(r["crop"]),
                area=float(r["area"]),production=None if pd.isna(r["production"]) else float(r["production"]),
                source_dataset="crop_production_dataset1"))
            if len(batch)>=1000:
                db.add_all(batch); db.commit(); batch=[]
        if batch: db.add_all(batch); db.commit()
        print(f"Imported {len(df)} Andhra Pradesh rows from {CSV.name}")
    finally: db.close()

if __name__ == "__main__": main()
