from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DoctorReportBase(BaseModel):
    patient_age: int
    patient_gender: str
    patient_weight: Optional[float] = None
    pre_existing_conditions: Optional[str] = None
    drug_name: str
    dosage: Optional[str] = None
    duration_of_use: Optional[str] = None
    symptoms: str
    severity: str
    onset_date: Optional[str] = None
    patient_recovered: str
    additional_notes: Optional[str] = None
    clinical_evidence: Optional[str] = None
    alternative_causes: Optional[str] = None
    causality: str
    recommendation: str

class DoctorReportCreate(DoctorReportBase):
    pass

class DoctorReportOut(DoctorReportBase):
    id: int
    report_id: str
    doctor_id: int
    patient_id: str
    status: str
    ai_analysis: Optional[str] = None
    created_at: datetime
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True
