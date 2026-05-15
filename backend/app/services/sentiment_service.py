import os
import httpx
from textblob import TextBlob

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")

async def fetch_news(drug_name: str) -> list[dict]:
    if not NEWS_API_KEY or NEWS_API_KEY == "your_news_api_key_here":
        return []

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": drug_name,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 10,
        "apiKey": NEWS_API_KEY,
    }
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, params=params, timeout=5.0)
            data = res.json()
            return data.get("articles", [])
    except Exception as e:
        print(f"NewsAPI Error: {e}")
        return []

def analyse_sentiment(text: str) -> dict:
    try:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
    except Exception:
        polarity = 0.0

    if polarity >= 0.1:
        label = "positive"
    elif polarity <= -0.1:
        label = "negative"
    else:
        label = "neutral"

    return {"polarity": round(polarity, 3), "label": label}

async def get_drug_sentiment(drug_name: str, clinical_risk_score: float) -> dict:
    articles = await fetch_news(drug_name)

    if not articles:
        return {
            "drug": drug_name,
            "articles_found": 0,
            "negative_articles": 0,
            "average_polarity": 0,
            "nocebo_flag": False,
            "nocebo_reason": "No news data available. Please check your NEWS_API_KEY in .env",
            "headlines": []
        }

    results = []
    for a in articles:
        text = f"{a.get('title', '')} {a.get('description', '')}"
        sentiment = analyse_sentiment(text)
        results.append({
            "headline": a.get("title", ""),
            "source": a.get("source", {}).get("name", ""),
            "published": a.get("publishedAt", "")[:10],
            "url": a.get("url", ""),
            "sentiment": sentiment["label"],
            "polarity": sentiment["polarity"],
        })

    negative_count = sum(1 for r in results if r["sentiment"] == "negative")
    avg_polarity   = round(sum(r["polarity"] for r in results) / len(results), 3)

    nocebo_flag   = (negative_count >= 4) and (clinical_risk_score < 45)
    nocebo_reason = ""

    if nocebo_flag:
        nocebo_reason = (
            f"{negative_count} out of {len(results)} recent articles are negative, "
            f"but the clinical risk score is only {clinical_risk_score}. "
            "This may be a nocebo/media-driven spike rather than a genuine safety signal."
        )
    elif negative_count >= 4:
        nocebo_reason = (
            f"High negative media coverage ({negative_count} articles) "
            "aligns with elevated clinical risk score."
        )
    else:
        nocebo_reason = "No unusual social media spike detected."

    return {
        "drug": drug_name,
        "articles_found": len(results),
        "negative_articles": negative_count,
        "average_polarity": avg_polarity,
        "nocebo_flag": nocebo_flag,
        "nocebo_reason": nocebo_reason,
        "headlines": results
    }
