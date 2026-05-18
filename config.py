from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, SecretStr

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = Field(..., validation_alias="NEXT_PUBLIC_SUPABASE_URL", description="URL for the Supabase project")
    supabase_key: SecretStr = Field(..., validation_alias="NEXT_PUBLIC_SUPABASE_ANON_KEY", description="Service role or anon key for Supabase")
    
    # AI Generation API Configuration (OpenAI/Stability)
    openai_api_key: SecretStr = Field(..., env="OPENAI_API_KEY", description="API key for OpenAI DALL-E 3")
    openai_base_url: str | None = Field(None, env="OPENAI_BASE_URL", description="Custom base URL for OpenAI-compatible APIs")
    stability_api_key: SecretStr | None = Field(None, env="STABILITY_API_KEY", description="API key for Stability AI (Optional)")

    # Free Image Fallback Settings
    use_free_image: bool = Field(False, env="USE_FREE_IMAGE", description="Force free image mode")
    free_image_provider: str = Field("unsplash", env="FREE_IMAGE_PROVIDER", description="Choose: unsplash | picsum | replicate")
    replicate_token: SecretStr | None = Field(None, env="REPLICATE_TOKEN", description="Replicate API token")

    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

# Global settings instance
settings = Settings()

# Example usage:
# print(settings.supabase_url)
# print(settings.supabase_key.get_secret_value())
