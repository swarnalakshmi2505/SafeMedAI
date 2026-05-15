from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class DoctorReport(Base):
    __tablename__ = "doctor_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(String)
    patient_age = Column(Integer)
    patient_gender = Column(String)
    patient_weight = Column(Float, nullable=True)
    pre_existing_conditions = Column(Text, nullable=True)
    drug_name = Column(String, index=True)
    dosage = Column(String, nullable=True)
    duration_of_use = Column(String, nullable=True)
    symptoms = Column(Text)
    severity = Column(String) # mild/moderate/severe/life-threatening
    onset_date = Column(String, nullable=True)
    patient_recovered = Column(String) # yes/no/unknown
    additional_notes = Column(Text, nullable=True)
    clinical_evidence = Column(Text, nullable=True)
    alternative_causes = Column(Text, nullable=True)
    causality = Column(String) # certain/probable/possible/unlikely
    recommendation = Column(String)
    status = Column(String, default="pending") # pending/reviewed/actioned
    ai_analysis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    doctor = relationship("User", backref="reports")
