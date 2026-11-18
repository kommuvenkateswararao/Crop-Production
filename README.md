
# CropVision – Crop Production System

A web-based Crop Production Analysis and Prediction System focused on Andhra Pradesh, India. The project analyzes historical crop production data and uses machine learning to predict crop production.

## Features

- Dashboard with crop production statistics
- Crop-wise production analysis
- District-wise production analysis
- Year-wise production trends
- Machine learning-based crop production prediction
- Decision Tree and Random Forest model comparison
- Historical prediction records

## Technology Stack

**Frontend**
- React.js
- Vite
- CSS
- Recharts
- Axios
- Lucide React

**Backend**
- Python
- FastAPI
- SQLAlchemy

**Database**
- SQLite (default)
- MySQL (optional)

**Machine Learning**
- Decision Tree
- Random Forest
- Scikit-learn
- Pandas
- NumPy

## Project Structure

```text
Crop-Production-System/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── ml/
│   ├── scripts/
│   ├── requirements.txt
│   └── ...
│
├── datasets/
│   └── Crop_Production_Datasets/
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Crop-Production-System.git
cd Crop-Production-System
```

### 2. Backend setup

Open PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Import the dataset

Run the backend dataset import script from the backend directory:

```powershell
python -m scripts.import_data
```

If your project uses a different import script name, use the corresponding script provided in `backend/scripts/`.

### 4. Train the machine learning models

```powershell
python -m scripts.train_model
```

If your project uses a different training script name, use the corresponding script provided in `backend/scripts/`.

### 5. Start the backend

```powershell
python -m uvicorn app.main:app --reload --port 8001
```

Backend URL:

http://127.0.0.1:8001

API documentation:

http://127.0.0.1:8001/docs

### 6. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal by Vite.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome |
| GET | `/api/health` | API health check |
| GET | `/api/dashboard/summary` | Dashboard statistics |
| GET | `/api/dashboard/production-by-year` | Year-wise production |
| GET | `/api/dashboard/production-by-district` | District-wise production |
| GET | `/api/dashboard/production-by-crop` | Crop-wise production |
| GET | `/api/filters` | Available filters |
| GET | `/api/production` | Production records |
| GET | `/api/ml/metrics` | Model performance |
| POST | `/api/ml/predict` | Predict crop production |
| GET | `/api/ml/history` | Prediction history |

## Dataset

This project uses historical crop production datasets covering Indian states and districts, with a focus on Andhra Pradesh.

The datasets include information such as:
- State
- District
- Crop
- Season
- Year
- Area
- Production
- Yield (where available)

Refer to the dataset documentation and original sources for attribution and redistribution terms.

## Machine Learning

The system uses two regression models:

1. Decision Tree Regressor
2. Random Forest Regressor

Model performance is evaluated using:
- Mean Absolute Error (MAE)
- Root Mean Squared Error (RMSE)
- R² Score

The trained model with better evaluation results is selected for prediction.

## Project Objective

The objective of CropVision is to analyze historical crop production data and provide useful insights and production predictions to support agricultural planning and decision-making.

## Future Enhancements

- Live weather data integration
- Fertilizer and crop recommendation
- More advanced machine learning models
- User authentication
- Interactive reports and exports

## Author

MCA Academic Project
