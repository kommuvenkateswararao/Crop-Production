# Crop Production System – Backend + Datasets

This package contains the FastAPI backend and the two uploaded agriculture datasets.

## Quick start
1. Extract this ZIP.
2. Open the extracted `Crop-Production-System` folder in Cursor.
3. Follow `backend/README.md`.
4. Start with SQLite for easiest local setup; MySQL can be configured in `.env`.

The React frontend is not included in this package; this ZIP is the backend and datasets only.

## Folder structure
- `backend/` – FastAPI, SQLAlchemy, import and ML training code
- `datasets/` – original India-wide CSVs and Andhra Pradesh-filtered CSVs

## Dataset selection
Dataset 1 is the primary dataset for the dashboard and production model. Dataset 2 is supplementary for yield analysis and cross-checking. The periods differ and overlap, so they should not be blindly merged.
