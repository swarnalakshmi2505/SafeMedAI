import httpx
import os
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.models.doctor_report import DoctorReport
from app.models.user import User, UserRole
from app.schemas.doctor_report import DoctorReportCreate, DoctorReportOut
from app.routers.auth import get_current_user, require_officer, require_doctor

router = APIRouter(prefix="/doctor-reports", tags=["Doctor Reports"])

def generate_report_id(db: Session):
    year = datetime.now().year
    count = db.query(DoctorReport).filter(DoctorReport.report_id.like(f"RPT-{year}%")).count()
    return f"RPT-{year}{str(count + 1).zfill(4)}"

async def analyze_report_with_ai(report: DoctorReport, db: Session):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        report.ai_analysis = "AI analysis skipped: ANTHROPIC_API_KEY not configured."
        db.commit()
        return

    prompt = f"""You are a pharmacovigilance expert. Analyze this adverse event report and provide:
1. Causality assessment validation
2. Signal strength based on reported symptoms
3. Similar known adverse events for this drug
4. Recommended follow-up actions
5. Risk level (Low/Medium/High/Critical)

Be concise and clinical. Use WHO-UMC causality categories.

REPORT DATA:
- Drug: {report.drug_name}
- Symptoms: {report.symptoms}
- Severity: {report.severity}
- Patient: {report.patient_age}y, {report.patient_gender}
- Dosage: {report.dosage}
- Duration: {report.duration_of_use}
- Onset: {report.onset_date}
- Clinical Evidence: {report.clinical_evidence}
- Causality (Doctor's assessment): {report.causality}
- Recommendation: {report.recommendation}
- Pre-existing conditions: {report.pre_existing_conditions}
- Alternative causes considered: {report.alternative_causes}
"""

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-3-5-sonnet-20240620", # Updated to a valid version close to the request
                    "max_tokens": 800,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            if response.status_code == 200:
                data = response.json()
                report.ai_analysis = data["content"][0]["text"]
            else:
                report.ai_analysis = f"AI analysis failed: {response.text[:200]}"
    except Exception as e:
        report.ai_analysis = f"AI analysis error: {str(e)}"
    
    db.commit()

@router.post("/submit", response_model=DoctorReportOut)
async def submit_report(
    data: DoctorReportCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    if not current_user.is_verified:
        raise HTTPException(status_code=403, detail="Only verified doctors can submit reports")
    
    report_id = generate_report_id(db)
    
    # Generate random 6-char PAT-XXXXXX patient ID if not provided or just as a rule
    patient_id = "PAT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

    new_report = DoctorReport(
        **data.dict(),
        report_id=report_id,
        doctor_id=current_user.id,
        patient_id=patient_id,
        status="pending"
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    # Trigger AI analysis in background
    background_tasks.add_task(analyze_report_with_ai, new_report, db)
    
    new_report.doctor_name = current_user.full_name
    return new_report

@router.get("/my-reports", response_model=list[DoctorReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    reports = db.query(DoctorReport)\
        .filter(DoctorReport.doctor_id == current_user.id)\
        .order_by(desc(DoctorReport.created_at))\
        .all()
    
    for r in reports:
        r.doctor_name = current_user.full_name
        
    return reports

@router.get("/{report_id}", response_model=DoctorReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(DoctorReport).filter(DoctorReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.doctor:
        report.doctor_name = report.doctor.full_name
        
    return report

@router.get("/", response_model=list[DoctorReportOut])
def get_all_reports(
    status: str = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_officer)
):
    query = db.query(DoctorReport)
    if status:
        query = query.filter(DoctorReport.status == status)
    
    reports = query.order_by(desc(DoctorReport.created_at)).all()
    
    for r in reports:
        if r.doctor:
            r.doctor_name = r.doctor.full_name
            
    return reports

@router.patch("/{report_id}/review", response_model=DoctorReportOut)
def review_report(
    report_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_officer)
):
    report = db.query(DoctorReport).filter(DoctorReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = "reviewed"
    db.commit()
    db.refresh(report)
    
    if report.doctor:
        report.doctor_name = report.doctor.full_name
        
    return report

@router.post("/{report_id}/analyze", response_model=DoctorReportOut)
async def manual_analyze_report(
    report_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user)
):
    report = db.query(DoctorReport).filter(DoctorReport.report_id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    await analyze_report_with_ai(report, db)
    db.refresh(report)
    
    if report.doctor:
        report.doctor_name = report.doctor.full_name
        
    return report
