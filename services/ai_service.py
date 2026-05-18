import re
import httpx
from openai import AsyncOpenAI
from config import settings

# ----------------------------------------------------------------------
# Regex-based content filter
# ----------------------------------------------------------------------
BANNED_WORDS_REGEX = re.compile(
    r"\b(nsfw|blood|violence|hate|racist|gore|kill|murder)\b",
    re.IGNORECASE,
)

# ----------------------------------------------------------------------
# Helper: fetch a free image URL
# ----------------------------------------------------------------------
def _build_free_image_url() -> str:
    """
    Choose a free image provider based on an ENV switch.
    Set `FREE_IMAGE_PROVIDER` in .env.local to one of:
        unsplash | picsum | replicate
    """
    provider = settings.free_image_provider.lower()

    if provider == "picsum":
        # Simple random placeholder
        return "https://picsum.photos/1024/1024"

    if provider == "replicate":
        # Uses Replicate's free-tier Stable Diffusion model.
        token = settings.replicate_token.get_secret_value() if settings.replicate_token else ""
        if not token:
            raise RuntimeError(
                "REPLICATE_TOKEN missing – add it to .env.local to use Replicate"
            )
        
        payload = {
            "version": "fa6c8b5c1e4f6bdb0bb3cde33d4d61d5c0e86ff0c9e5e5d2bc8b8d6a",  # public stable-diffusion-v1-4
            "input": {"prompt": "placeholder image", "width": 1024, "height": 1024},
        }
        headers = {"Authorization": f"Token {token}", "Content-Type": "application/json"}
        
        async def _call_replicate() -> str:
            import anyio
            async with httpx.AsyncClient() as client:
                r = await client.post(
                    "https://api.replicate.com/v1/predictions", json=payload, headers=headers, timeout=30.0
                )
                r.raise_for_status()
                # Replicate returns a prediction ID – we need to poll until it's completed.
                prediction = r.json()
                prediction_url = prediction["urls"]["get"]
                while True:
                    status_resp = await client.get(prediction_url, headers=headers)
                    status_resp.raise_for_status()
                    data = status_resp.json()
                    if data["status"] == "succeeded":
                        return data["output"][0]  # URL of generated image
                    elif data["status"] in ("failed", "canceled"):
                        raise RuntimeError(f"Replicate generation failed: {data}")
                    await anyio.sleep(1)

        return _call_replicate()

    # Default = Picsum random photo (Unsplash Source is discontinued)
    return "https://picsum.photos/1024/1024"


# ----------------------------------------------------------------------
# Main exported function
# ----------------------------------------------------------------------
async def generate_design_from_prompt(prompt: str) -> str:
    """
    Returns a public image URL that the rest of the pipeline expects.
    """
    # 1. Sanitize prompt
    if BANNED_WORDS_REGEX.search(prompt):
        raise ValueError(
            "Prompt contains banned or inappropriate words. Request rejected."
        )

    # 2. Try OpenAI (paid tier) or skip if forced to free mode
    if not settings.use_free_image:
        try:
            client = AsyncOpenAI(
                api_key=settings.openai_api_key.get_secret_value(),
                base_url=settings.openai_base_url if settings.openai_base_url else None
            )
            response = await client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                n=1,
            )
            return response.data[0].url
        except Exception as openai_err:
            print(f"OpenAI generation failed ({openai_err}); falling back to free image.")
    
    # 3. Fallback / Forced Free mode
    free_url = _build_free_image_url()
    if callable(free_url) or hasattr(free_url, '__await__'):  
        return await free_url() if callable(free_url) else await free_url
    return free_url
