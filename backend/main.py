import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from dotenv import load_dotenv

from database import engine, get_db
from models import Base
from routers import games, scraping, analytics

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

# CORS middleware - allow all origins for now
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
    return {"message": "Roblox Game Analytics API", "version": "1.0.0", "status": "working"}

@app.get("/health")
async def health_check():
    try:
        # Test database connection
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "port": os.environ.get("PORT", "unknown")}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Render will automatically detect this app variable 