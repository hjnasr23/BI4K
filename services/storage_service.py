import uuid
import httpx
from supabase import create_client, Client
from config import settings

# Initialize Supabase client
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_key.get_secret_value()
)

BUCKET_NAME = "ai-generations"

# Default caching: 1 year (public)
CACHE_CONTROL = "public, max-age=31536000, immutable"

async def upload_image_from_url(image_url: str, user_id: str | None = None) -> str:
    """
    Downloads the generated image from the given URL and uploads it to Supabase Storage securely.
    Returns the public URL of the uploaded image.
    """
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(image_url)
        response.raise_for_status()
        image_bytes = response.content
        
    file_ext = "png" # DALL-E typically returns png
    file_path = f"{user_id or 'anonymous'}/{uuid.uuid4()}.{file_ext}"
    
    # Upload to Supabase Storage with optimized headers
    supabase.storage.from_(BUCKET_NAME).upload(
        file=image_bytes,
        path=file_path,
        file_options={
            "content-type": "image/png",
            "cacheControl": CACHE_CONTROL
        }
    )
    
    # Get and return the public URL
    return supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)

def get_optimized_url(public_url: str, width: int = 800, quality: int = 80) -> str:
    """
    Constructs a Supabase Image Transformation URL for on-the-fly optimization.
    Forces WebP format for maximum compression.
    """
    if not public_url:
        return public_url
        
    # Standard Supabase render URL format:
    # {supabase_url}/storage/v1/render/image/public/{bucket}/{path}?width=...
    
    # Convert public URL to render URL if it's a standard storage URL
    if "/storage/v1/object/public/" in public_url:
        optimized = public_url.replace(
            "/storage/v1/object/public/", 
            "/storage/v1/render/image/public/"
        )
        return f"{optimized}?width={width}&quality={quality}&format=webp&resize=contain"
        
    return public_url
