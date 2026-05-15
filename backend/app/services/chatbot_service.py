import os
from openai import AsyncOpenAI
from sqlalchemy.orm import Session
from app.models.drug import DrugStatistics, DrugReport
from collections import Counter

# Use AsyncOpenAI for non-blocking calls
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
You are SafeMedAI, an expert AI assistant for a pharmacovigilance platform.
You help pharmacovigilance officers and doctors understand drug safety data.

Your tone is professional, concise, and evidence-based.
You always clarify that your answers are based on adverse event report data,
not clinical trial data, and users should consult a medical professional
for clinical decisions.

When drug data is provided to you, use it as your primary source of truth.
If no data is available for a drug, say so clearly.
"""

def build_drug_context(drug_name: str, db: Session) -> str:
    stat = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug_name.lower()
    ).first()

    if not stat:
        return f"No database records found for '{drug_name}'."

    reactions = db.query(DrugReport.reaction).filter(
        DrugReport.drug_name == drug_name.lower()
    ).all()

    reaction_counts = Counter([r[0] for r in reactions if r[0]])
    top = [r for r, _ in reaction_counts.most_common(5)]

    return f"""
Drug: {stat.drug_name}
Risk Score: {stat.risk_score}/100
Total Adverse Event Reports: {stat.total_reports}
Serious Cases: {stat.serious_reports}
Death Reports: {stat.death_reports}
Top 5 Reported Reactions: {", ".join(top) if top else "No reactions recorded"}
""".strip()

def detect_drug_in_query(query: str, db: Session) -> str | None:
    drugs = db.query(DrugStatistics.drug_name).all()
    q_lower = query.lower()
    for (name,) in drugs:
        if name.lower() in q_lower:
            return name
    return None

async def chat(message: str, history: list[dict], db: Session) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or "sk-" not in api_key:
        return "I'm sorry, my AI brain (OpenAI API Key) is not configured yet. Please add a valid OPENAI_API_KEY to your .env file."

    # Try to detect a drug name in the message
    detected_drug = detect_drug_in_query(message, db)
    drug_context  = ""

    if detected_drug:
        drug_context = f"\n\n[SafeMedAI Database Context]\n{build_drug_context(detected_drug, db)}"

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for turn in history:
        messages.append({"role": turn["role"], "content": turn["content"]})

    user_content = message
    if drug_context:
        user_content = f"{message}\n{drug_context}"

    messages.append({"role": "user", "content": user_content})

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.2,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return f"I encountered an error while processing your request: {str(e)}"
