from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, status, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import base64
import uuid
import io
from services.ai_service import generate_design_from_prompt
from services.storage_service import upload_image_from_url, get_optimized_url, CACHE_CONTROL
from supabase import create_client, Client
from config import settings

app = FastAPI(title="Print-on-Demand AI Generation API")

# Max file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Add your frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client for database operations
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_key.get_secret_value()
)

def get_user_supabase(auth_header: Optional[str] = Header(None, alias="Authorization")) -> Client:
    """Returns a Supabase client scoped to the user if a JWT is provided."""
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # Create a new client with the user's JWT
        return create_client(
            settings.supabase_url,
            settings.supabase_key.get_secret_value(),
            # Note: We still use service role key but pass Authorization header to enable RLS
        )
    return supabase

class GenerateRequest(BaseModel):
    prompt: str
    user_id: Optional[str] = None

class GenerateResponse(BaseModel):
    id: str
    status: str
    url: Optional[str] = None
    prompt: str

async def process_ai_generation(design_id: str, prompt: str, user_id: Optional[str]):
    """Background task to handle AI generation and upload."""
    try:
        # 1. Generate image URL via AI
        temp_image_url = await generate_design_from_prompt(prompt)
        
        # 2. Upload image to Supabase Storage
        storage_url = await upload_image_from_url(temp_image_url, user_id)
        
        # 3. Update metadata in the 'designs' table
        supabase.table("designs").update({
            "url": storage_url,
            "status": "completed"
        }).eq("id", design_id).execute()
        
    except Exception as e:
        # Log error and update status
        supabase.table("designs").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", design_id).execute()

@app.post("/designs/generate", status_code=status.HTTP_202_ACCEPTED, response_model=GenerateResponse)
async def generate_design(request: GenerateRequest, background_tasks: BackgroundTasks):
    try:
        # 1. Pre-insert a 'pending' record to get an ID
        design_data = {
            "prompt": request.prompt,
            "is_ai": True,
            "user_id": request.user_id,
            "status": "pending"
        }
        
        response = supabase.table("designs").insert(design_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to initialize design record")
            
        inserted_design = response.data[0]
        design_id = inserted_design["id"]

        # 2. Start background process
        background_tasks.add_task(process_ai_generation, design_id, request.prompt, request.user_id)
        
        return GenerateResponse(
            id=design_id,
            status="pending",
            prompt=request.prompt
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/designs/status/{design_id}", response_model=GenerateResponse)
async def get_design_status(design_id: str):
    try:
        response = supabase.table("designs").select("*").eq("id", design_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Design not found")
            
        design = response.data[0]
        
        return GenerateResponse(
            id=design["id"],
            status=design.get("status", "completed"), # Fallback for old records
            url=get_optimized_url(design.get("url")) if design.get("url") else None,
            prompt=design["prompt"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/designs/upload")
async def upload_design(file: UploadFile = File(...), user_id: Optional[str] = None):
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        # Read file content
        content = await file.read()
        
        # Validate file size
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
            
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = f"{user_id or 'anonymous'}/{file_name}"
        
        # Upload to Supabase Storage in 'uploads' bucket
        supabase.storage.from_("uploads").upload(
            file=content,
            path=file_path,
            file_options={
                "content-type": file.content_type,
                "cacheControl": CACHE_CONTROL
            }
        )
        
        # Get public URL
        storage_url = supabase.storage.from_("uploads").get_public_url(file_path)
        
        # Save metadata to the 'designs' table
        design_data = {
            "url": storage_url,
            "prompt": f"Uploaded file: {file.filename}",
            "is_ai": False,
            "user_id": user_id
        }
        
        response = supabase.table("designs").insert(design_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to insert design into database")
            
        inserted_data = response.data[0]
        return {
            "status": "success", 
            "data": {
                **inserted_data,
                "url": get_optimized_url(inserted_data["url"])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

class OrderRequest(BaseModel):
    product_id: Optional[str] = None
    design_id: str
    coordinates: Dict[str, Any]
    preview_data_url: str

@app.post("/orders/ligne-commande")
async def create_ligne_commande(request: OrderRequest, user_supabase: Client = Depends(get_user_supabase)):
    try:
        # Extract base64 part of the data URL
        # Format is usually "data:image/png;base64,iVBORw0KGgo..."
        if "," in request.preview_data_url:
            base64_data = request.preview_data_url.split(",")[1]
        else:
            base64_data = request.preview_data_url
            
        image_bytes = base64.b64decode(base64_data)
        
        # Validate file size
        if len(image_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Preview image exceeds 5MB limit")
            
        file_name = f"preview_{uuid.uuid4().hex}.png"
        
        # Upload preview to Supabase Storage
        upload_res = supabase.storage.from_("order-previews").upload(
            file_name, 
            image_bytes, 
            {"content-type": "image/png"}
        )
        
        # Get public URL
        preview_url = supabase.storage.from_("order-previews").get_public_url(file_name)
        
        # Insert into LigneCommande table
        ligne_data = {
            "product_id": request.product_id,
            "design_id": request.design_id,
            "customization_coordinates": request.coordinates,
            "preview_url": preview_url
        }
        
        response = user_supabase.table("LigneCommande").insert(ligne_data).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to insert order into database")
            
        return {"status": "success", "data": response.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# To run locally: uvicorn main:app --reload
