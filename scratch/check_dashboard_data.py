from app.database.connection import SessionLocal
from app.models.drug import DrugStatistics, DrugReport
from app.models.user import User
from app.models.doctor_report import DoctorReport
from app.models.alert import Alert

def check_data():
    db = SessionLocal()
    try:
        drug_stats_count = db.query(DrugStatistics).count()
        drug_reports_count = db.query(DrugReport).count()
        doctor_reports_count = db.query(DoctorReport).count()
        alerts_count = db.query(Alert).count()
        
        print(f"DrugStatistics: {drug_stats_count}")
        print(f"DrugReports: {drug_reports_count}")
        print(f"DoctorReports: {doctor_reports_count}")
        print(f"Alerts: {alerts_count}")
        
        if drug_stats_count > 0:
            top_drugs = db.query(DrugStatistics).order_by(DrugStatistics.risk_score.desc()).limit(5).all()
            print("\nTop 5 High Risk Drugs:")
            for d in top_drugs:
                print(f"- {d.drug_name}: {d.risk_score}")
        else:
            print("\nNo DrugStatistics found. Run ingestion!")

    finally:
        db.close()

if __name__ == "__main__":
    check_data()
