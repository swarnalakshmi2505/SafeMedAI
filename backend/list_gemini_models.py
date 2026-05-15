import httpx
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

async def list_models():
    if not api_key:
        print("ERROR: No GOOGLE_API_KEY found")
        return
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            models = response.json().get("models", [])
            print("AVAILABLE MODELS:")
            for m in models:
                print(f" - {m['name']}")
        else:
            print(f"ERROR ({response.status_code}): {response.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(list_models())
