import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base workspace path
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "FaultForge AI"
    VERSION: str = "1.0.0-MVP"
    API_PREFIX: str = "/api"
    
    # AI Engine Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"  # Default fast multimodal model
    
    # Persistence
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/faultforge.db"
    
    # Upload limits (8 MB)
    MAX_IMAGE_SIZE_BYTES: int = 8 * 1024 * 1024
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
