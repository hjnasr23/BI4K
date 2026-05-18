import os
import requests
import json
import subprocess
import time

# Configuration
SUPABASE_URL = "https://htnagmiuapyxaqoptzju.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bmFnbWl1YXB5eGFxb3B0emp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ2NjMzOSwiZXhwIjoyMDkyMDQyMzM5fQ.E1sTNj7_arjPhhx5j-Dlq7-85JPK1tF6o8yxGD_ssdQ"
BUCKET_NAME = "fashion"
DB_URL = "postgresql://postgres.htnagmiuapyxaqoptzju:3CKmcWfsDquqCtQH@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

files = [
    "vecteezy_ai-generated-classic-crewneck-t-shirt-mockup-with-model-9_38095951.jpg",
    "vecteezy_closeup-t-shirt-on-men-illustration_23692581.jpg",
    "vecteezy_closeup-t-shirt-on-men-illustration_23692721.jpg",
    "vecteezy_cropped-image-of-man-in-white-blank-t-shirt-on-black-background_26415904.jpg",
    "vecteezy_cute-boy-wearing-blank-empty-purple-t-shirt-mockup-for_33334442.jpg",
    "vecteezy_cute-boy-wearing-blank-empty-white-t-shirt-mockup-for-design_33333288.jpg"
]

def categorize(filename):
    filename_l = filename.lower()
    
    # Target Audience
    if any(x in filename_l for x in ["boy", "kids", "child"]):
        audience = "kids"
    elif any(x in filename_l for x in ["man", "men", "model"]):
        audience = "men"
    elif any(x in filename_l for x in ["woman", "girl", "women"]):
        audience = "women"
    else:
        audience = "men" # Default to men based on user's primary categories
        
    # Cloth Type
    if "t-shirt" in filename_l:
        cloth = "t-shirt"
    elif "hoodie" in filename_l:
        cloth = "hoodie"
    elif "mug" in filename_l:
        cloth = "mug"
    else:
        cloth = "t-shirt" # Default
        
    # View
    if "back" in filename_l:
        view = "back"
    else:
        view = "front"
        
    return cloth, audience, view

results = []

for filename in files:
    print(f"Processing {filename}...")
    cloth, audience, view = categorize(filename)
    
    # Upload to Storage with retry
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    
    success = False
    for attempt in range(3):
        try:
            with open(filename, 'rb') as f:
                headers = {
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "image/jpeg",
                    "x-upsert": "true"
                }
                response = requests.post(upload_url, headers=headers, data=f, timeout=30)
                
            if response.status_code in [200, 201]:
                print(f"  Uploaded to storage.")
                success = True
                break
            else:
                print(f"  Upload attempt {attempt+1} failed: {response.text}")
        except Exception as e:
            print(f"  Upload attempt {attempt+1} error: {e}")
            time.sleep(2)
            
    if success:
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        
        # Insert into Database
        sql = f"INSERT INTO \"Mockup\" (name, url, cloth_type, target_audience, view) VALUES ('{filename}', '{public_url}', '{cloth}', '{audience}', '{view}');"
        try:
            subprocess.run(["psql", DB_URL, "-c", sql], check=True)
            print(f"  Inserted into DB: {cloth}, {audience}, {view}")
            results.append({
                "file": filename,
                "url": public_url,
                "cloth": cloth,
                "audience": audience,
                "view": view
            })
        except subprocess.CalledProcessError as e:
            print(f"  DB Insert failed for {filename}: {e}")
    else:
        print(f"  Failed to upload {filename} after 3 attempts.")

# Save results for documentation
with open("upload_results.json", "w") as f:
    json.dump(results, f, indent=2)
