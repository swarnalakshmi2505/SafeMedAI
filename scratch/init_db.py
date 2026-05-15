from app.database.connection import engine, Base
# Import models to register them with Base
from app.models.user import User, DownloadHistory
from app.models.drug import DrugReport, DrugStatistics, YearlyTrend, ExternalEvidenceSignal
from app.models.alert import Alert
from app.models.doctor_report import DoctorReport

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    init_db()
