from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Use Supabase PostgreSQL database
    DATABASE_URL: str = "postgresql://postgres.hkgastbktxpqqxbpokmy:Roblox500$@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
    
    # Redis (for Celery) - use local Redis or disable for development
    REDIS_URL: str = "redis://localhost:6379"
    
    # Roblox API settings
    ROBLOX_API_BASE_URL: str = "https://games.roblox.com/v1"
    ROBLOX_API_KEY: str = ""
    
    # Application settings
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-here"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://127.0.0.1:3001", "http://0.0.0.0:3001", "*"]
    
    # Scraping settings
    SCRAPE_INTERVAL_HOURS: int = 1
    MAX_CONCURRENT_SCRAPES: int = 5
    REQUEST_DELAY_SECONDS: float = 0.2  # Reduced for faster processing
    
    # Analytics settings
    RETENTION_DAYS: List[int] = [1, 7, 30]
    GROWTH_WINDOW_DAYS: int = 7
    RESONANCE_THRESHOLD: float = 0.1
    
    class Config:
        env_file = ".env"

settings = Settings() 