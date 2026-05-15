from app.database.connection import SessionLocal
from app.models.alert import Alert
from datetime import datetime

def create_dummy_alerts():
    db = SessionLocal()
    try:
        # Check if alerts exist
        if db.query(Alert).count() == 0:
            print("Creating dummy alerts...")
            alerts = [
                Alert(
                    drug_name="Warfarin",
                    level="critical",
                    message="Significant spike in intracranial hemorrhage reports observed in elderly patients.",
                    is_sent=True,
                ),
                Alert(
                    drug_name="Ibuprofen",
                    level="high",
                    message="Increased risk of acute kidney injury when co-administered with ACE inhibitors.",
                    is_sent=True,
                ),
                Alert(
                    drug_name="Metformin",
                    level="medium",
                    message="Rare signal of vitamin B12 deficiency detected in long-term users.",
                    is_sent=True,
                )
            ]
            db.add_all(alerts)
            db.commit()
            print("Dummy alerts created.")
        else:
            print("Alerts already exist.")
    finally:
        db.close()

if __name__ == "__main__":
    create_dummy_alerts()
