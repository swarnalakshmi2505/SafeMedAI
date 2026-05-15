from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, nullable=False)
    risk_score = Column(Integer, nullable=False)
    level = Column(String, nullable=False)   # "medium" | "high" | "critical"
    message = Column(String, nullable=False)
    is_reviewed = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())