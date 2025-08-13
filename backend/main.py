from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Optional
import os
import logging
from dotenv import load_dotenv

from database import engine, get_db
from models import Base
from routers import games, scraping, analytics
# from celery_app import celery  # Commented out for development without Redis
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        # Startup
        logger.info("Starting up Roblox Analytics API...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        yield
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise
    finally:
        # Shutdown
        logger.info("Shutting down Roblox Analytics API...")
        pass

app = FastAPI(
    title="Roblox Game Analytics API",
    description="API for scraping and analyzing Roblox games",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - allow all origins for now to fix the issue
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(games.router, prefix="/api/games", tags=["games"])
app.include_router(scraping.router, prefix="/api/scrape", tags=["scraping"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Roblox Game Analytics API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    try:
        # Test database connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    # Get port from environment variable (for Render) or use default
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"  # Always bind to all interfaces for Render
    
    logger.info(f"Starting server on {host}:{port}")
    logger.info(f"Environment PORT: {os.environ.get('PORT', 'Not set')}")
    logger.info(f"Current working directory: {os.getcwd()}")
    
    try:
        # Use uvicorn.run with explicit configuration
        uvicorn.run(
            app,  # Pass the app directly instead of string
            host=host, 
            port=port, 
            reload=False, 
            log_level="info",
            access_log=True
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise 