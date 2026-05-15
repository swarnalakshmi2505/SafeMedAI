import httpx
import asyncio

async def test():
    drug_name = "aspirin"
    url = "https://api.fda.gov/drug/label.json"
    
    # Original
    params1 = {"search": f"openfda.brand_name:{drug_name}+OR+openfda.generic_name:{drug_name}", "limit": 1}
    
    # Spaced
    params2 = {"search": f'openfda.brand_name:"{drug_name}" OR openfda.generic_name:"{drug_name}"', "limit": 1}

    async with httpx.AsyncClient() as client:
        r1 = await client.get(url, params=params1)
        print("Original status:", r1.status_code)
        
        r2 = await client.get(url, params=params2)
        print("Spaced status:", r2.status_code)

asyncio.run(test())
