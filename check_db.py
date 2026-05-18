import asyncio
from supabase import create_client, Client
from config import settings

async def main():
    supabase: Client = create_client(
        settings.supabase_url,
        settings.supabase_key.get_secret_value()
    )
    
    tables = ['Mockup', 'Category', 'Product', 'designs', 'LigneCommande']
    for table in tables:
        print(f"--- Checking {table} Table ---")
        try:
            response = supabase.table(table).select("*").limit(1).execute()
            print(f"{table} found: {response.data}")
        except Exception as e:
            print(f"{table} Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
