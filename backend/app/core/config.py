import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediOracle Healthcare Workforce Portal"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "medioracle_super_secret_jwt_key_32_chars_long_min_spec!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Database
    DATABASE_URL: str = "sqlite:///./medioracle.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Mock integration keys
    MAPS_API_KEY: str = "mock_google_maps_key_sandbox"
    OCR_API_KEY: str = "mock_tesseract_ocr_key_sandbox"
    PAYMENT_API_KEY: str = "mock_stripe_payment_key_sandbox"
    NMBI_API_KEY: str = "mock_nmbi_licensing_key_sandbox"
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
