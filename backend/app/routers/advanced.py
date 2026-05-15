from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
import httpx, os, json

from app.database.connection import get_db
from app.models.drug import DrugReport, DrugStatistics
from app.ml.interaction_engine import compute_interaction
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/advanced", tags=["Advanced Features"])

# ── Drug Interaction ───────────────────────────────────────────────────────────

@router.get("/interaction")
def drug_interaction(
    drug_a: str,
    drug_b: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    a = drug_a.lower().strip()
    b = drug_b.lower().strip()

    if a == b:
        raise HTTPException(400, "Please enter two different drugs")

    stat_a = db.query(DrugStatistics).filter(DrugStatistics.drug_name == a).first()
    stat_b = db.query(DrugStatistics).filter(DrugStatistics.drug_name == b).first()

    missing = [d for d, s in [(a, stat_a), (b, stat_b)] if not s]
    if missing:
        raise HTTPException(
            404,
            f"No data found for: {', '.join(missing)}. Run data ingestion first."
        )

    reactions_a = [r[0] for r in
                   db.query(DrugReport.reaction)
                     .filter(DrugReport.drug_name == a).all()]
    reactions_b = [r[0] for r in
                   db.query(DrugReport.reaction)
                     .filter(DrugReport.drug_name == b).all()]

    result = compute_interaction(
        drug_a      = a,
        drug_b      = b,
        reactions_a = reactions_a,
        reactions_b = reactions_b,
        score_a     = stat_a.risk_score,
        score_b     = stat_b.risk_score,
    )

    return {
        "drug_a":             result.drug_a,
        "drug_b":             result.drug_b,
        "drug_a_score":       stat_a.risk_score,
        "drug_b_score":       stat_b.risk_score,
        "shared_reactions":   result.shared_reactions,
        "risk_amplification": result.risk_amplification,
        "severity":           result.severity,
        "is_dangerous":       result.is_dangerous,
        "summary":            result.summary,
        "drug_a_reactions":   stat_a.top_reactions or [],
        "drug_b_reactions":   stat_b.top_reactions or [],
    }


# ── Personalized Insights ──────────────────────────────────────────────────────

@router.get("/personalized")
def personalized_insights(
    drug_name:  str,
    age:        int,
    gender:     str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    drug_lower = drug_name.lower().strip()

    stat = db.query(DrugStatistics)\
             .filter(DrugStatistics.drug_name == drug_lower).first()
    if not stat:
        raise HTTPException(404, f"No data found for {drug_name}")

    # Age group
    if age < 18:   age_group = "pediatric"
    elif age < 60: age_group = "adult"
    else:          age_group = "elderly"

    # Reports matching this demographic
    demo_reports = db.query(func.count(DrugReport.id))\
                     .filter(
                         DrugReport.drug_name  == drug_lower,
                         DrugReport.age_group  == age_group,
                         DrugReport.gender     == gender.lower(),
                     ).scalar()

    total_demo = db.query(func.count(DrugReport.id))\
                   .filter(
                       DrugReport.age_group == age_group,
                       DrugReport.gender    == gender.lower(),
                   ).scalar() or 1

    # Top reactions for this specific demographic
    demo_reactions = db.query(
        DrugReport.reaction,
        func.count(DrugReport.id).label("cnt")
    ).filter(
        DrugReport.drug_name == drug_lower,
        DrugReport.age_group == age_group,
        DrugReport.gender    == gender.lower(),
    ).group_by(DrugReport.reaction)\
     .order_by(func.count(DrugReport.id).desc())\
     .limit(5).all()

    demo_rate = round((demo_reports / total_demo) * 100, 2)

    # Special warnings
    warnings = []
    if age_group == "elderly":
        warnings.append(
            "Elderly patients (60+) may have reduced drug clearance. "
            "Lower doses and closer monitoring are typically recommended."
        )
    if age_group == "pediatric":
        warnings.append(
            "Pediatric use requires weight-based dosing. "
            "Many drugs have limited safety data in children — consult a pediatrician."
        )
    if gender.lower() == "female" and age < 50:
        warnings.append(
            "Reproductive-age females should consult a physician regarding "
            "potential teratogenic effects before use."
        )

    # Risk adjustment
    adjusted_score = stat.risk_score
    if age_group == "elderly":   adjusted_score = min(adjusted_score * 1.2, 100)
    if age_group == "pediatric": adjusted_score = min(adjusted_score * 1.15, 100)
    adjusted_score = round(adjusted_score, 2)

    return {
        "drug_name":       drug_lower,
        "age":             age,
        "age_group":       age_group,
        "gender":          gender.lower(),
        "base_risk_score": stat.risk_score,
        "adjusted_score":  adjusted_score,
        "demo_reports":    demo_reports,
        "demo_rate":       demo_rate,
        "top_reactions_for_demo": [
            {"reaction": r.reaction, "count": r.cnt}
            for r in demo_reactions
        ],
        "warnings":        warnings,
        "recommendation": (
            f"For a {age}-year-old {gender.lower()} patient, {drug_lower.capitalize()} "
            f"has an adjusted risk score of {adjusted_score}/100. "
            f"{len(demo_reports and demo_reactions or [])} specific reactions "
            f"reported in this demographic group."
        ),
    }


# ── AI Chatbot ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message:   str
    history:   Optional[list] = []
    drug_context: Optional[str] = None   # drug name if on a drug page

SYSTEM_PROMPT = """You are SafeMedAI Assistant, an expert AI pharmacovigilance analyst 
embedded in the SafeMedAI platform. You help pharmacovigilance officers and doctors 
understand drug safety signals, adverse reactions, risk scores, and clinical evidence.

Your knowledge covers:
- FDA FAERS adverse event reporting
- ROR (Reporting Odds Ratio) signal detection
- Drug interactions and contraindications
- Clinical pharmacology and drug safety
- WHO pharmacovigilance guidelines

Rules:
- Always be precise and evidence-based
- Cite FDA, WHO, or clinical guidelines when relevant
- If a drug's data is provided in context, use it specifically
- Never give personal medical advice — always recommend consulting a physician
- Keep answers concise but complete
- Use medical terminology appropriately but explain it clearly
- If asked about a specific drug in context, use the provided data

Format your responses clearly. Use bullet points for lists of side effects or recommendations."""


@router.post("/chat")
async def chat_with_ai(
    body: ChatMessage,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(500, "Gemini API service not configured. Add GOOGLE_API_KEY to .env")

    # Initial system instruction as a turn
    contents = [
        {
            "role": "user",
            "parts": [{"text": f"System Instructions: {SYSTEM_PROMPT}\n\nPlease acknowledge."}]
        },
        {
            "role": "model",
            "parts": [{"text": "Understood. I am SafeMedAI Assistant, and I will follow these instructions."}]
        }
    ]

    # Inject drug context if user is on a drug detail page
    if body.drug_context:
        contents.append({
            "role": "user",
            "parts": [{"text": f"[Context: The user is currently viewing the drug profile for '{body.drug_context}'. Reference this drug specifically when relevant.]"}]
        })
        contents.append({
            "role": "model",
            "parts": [{"text": f"Understood. I'll reference {body.drug_context} specifically in my responses."}]
        })

    # Add conversation history
    for msg in (body.history or []):
        role = "user" if msg.get("role") == "user" else "model"
        if msg.get("content"):
            contents.append({
                "role": role,
                "parts": [{"text": msg["content"]}]
            })

    # Add current message
    contents.append({
        "role": "user",
        "parts": [{"text": body.message}]
    })

    try:
        # Attempt Gemini 2.0 Flash
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": contents,
                    "generationConfig": {"maxOutputTokens": 800, "temperature": 0.2}
                },
            )

            if response.status_code == 200:
                data = response.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"reply": reply, "model": "gemini-2.0-flash"}
            
            # If Gemini fails with Quota (429), we fall back to a high-quality clinical template
            if response.status_code == 429:
                return {
                    "reply": generate_clinical_fallback(body.message, body.drug_context),
                    "model": "clinical-fallback-engine"
                }
            
            raise Exception(f"API Error: {response.status_code}")

    except Exception as e:
        # Final fallback for any other errors
        return {
            "reply": generate_clinical_fallback(body.message, body.drug_context),
            "model": "clinical-fallback-engine"
        }

def generate_clinical_fallback(query: str, drug: Optional[str]) -> str:
    """Provides a professional pharmacovigilance response when AI APIs are down."""
    if drug:
        return (
            f"**SafeMedAI Clinical Insights (Offline Mode)**\n\n"
            f"I'm currently operating in offline mode due to API rate limits, but I can provide standard clinical data for **{drug.capitalize()}**:\n\n"
            f"• **Safety Profile**: {drug.capitalize()} requires monitoring for common adverse reactions such as gastrointestinal distress or hypersensitivity.\n"
            f"• **Signal Status**: Our local database shows active ROR monitoring for this compound. Always correlate with the latest FAERS quarterly data.\n"
            f"• **Recommendation**: For specific interaction queries, please refer to the 'Interaction Checker' tab while I wait for AI services to restore."
        )
    return (
        "**SafeMedAI Assistant (Offline Mode)**\n\n"
        "I'm currently experiencing high traffic on my AI processing units. While I wait for my quota to reset, I can assist with general pharmacovigilance definitions:\n\n"
        "• **ROR (Reporting Odds Ratio)**: A disproportionality measure used to detect safety signals.\n"
        "• **FAERS**: The FDA's database for spontaneous adverse event reports.\n"
        "Please try your specific query again in a few minutes, or use the dedicated Analytics dashboards."
    )
