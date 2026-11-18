from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .database import Base

class ProductionRecord(Base):
    __tablename__ = "production_records"
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(120), index=True, nullable=False)
    year = Column(Integer, index=True, nullable=False)
    season = Column(String(50), index=True, nullable=False)
    crop = Column(String(120), index=True, nullable=False)
    area = Column(Float, nullable=False)
    production = Column(Float, nullable=True)
    source_dataset = Column(String(80), default="dataset1")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(120), nullable=False)
    crop = Column(String(120), nullable=False)
    season = Column(String(50), nullable=False)
    year = Column(Integer, nullable=False)
    area = Column(Float, nullable=False)
    predicted_production = Column(Float, nullable=False)
    model_name = Column(String(80), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
