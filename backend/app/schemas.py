from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    district: str
    crop: str
    season: str
    year: int = Field(ge=1900, le=2100)
    area: float = Field(gt=0)
    model: str = "random_forest"

class PredictionResponse(BaseModel):
    model: str
    predicted_production_tonnes: float
    estimated_yield_tonnes_per_hectare: float
    note: str
