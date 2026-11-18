# Crop Production System Backend

FastAPI backend for an MCA project: Andhra Pradesh historical crop analytics and ML production estimates.

## 1. Setup (Windows PowerShell)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```
SQLite is used by default for a quick first run. For MySQL, create a database named `crop_production_db`, edit `.env`, and set:
`DATABASE_URL=mysql+pymysql://crop_admin:your_password@localhost:3306/crop_production_db?charset=utf8mb4`

## 2. Import Andhra Pradesh records
```powershell
python scripts/import_dataset.py
```
This imports Dataset 1 only, to avoid double-counting overlapping historical observations. Dataset 2 is retained for separate yield analysis and cross-checking.

## 3. Train both ML models
```powershell
python -m ml.train
```
This writes model files and `ml/models/metrics.json`. Dataset 1 is historical (through 2015); predictions are estimates from historical patterns, not guarantees.

## 4. Start API
```powershell
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs

## Main endpoints
- `GET /api/health`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/production-by-year`
- `GET /api/dashboard/production-by-district`
- `GET /api/dashboard/production-by-crop`
- `GET /api/filters`
- `GET /api/production`
- `GET /api/ml/metrics`
- `POST /api/ml/predict`
- `GET /api/ml/history`

Prediction JSON example:
```json
{"district":"GUNTUR","crop":"Rice","season":"Kharif","year":2025,"area":1000,"model":"random_forest"}
```

## Data notes
- `datasets/Crop_Production_Datasets/andhra_pradesh/` contains the two filtered Andhra Pradesh CSV files.
- Dataset 1 is the main source for production analytics and model training.
- Dataset 2 contains a yield field and is retained separately. Do not append it to Dataset 1 without deduplication, unit checks and district-boundary harmonization.
- Missing production values are retained as null and excluded from model training.
- Verify district spellings before submitting academic results.
