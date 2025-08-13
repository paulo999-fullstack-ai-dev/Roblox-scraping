from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Roblox Analytics API")

# CORS - allow everything for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "API is working!", "port": os.environ.get("PORT", "unknown")}

@app.get("/health")
async def health():
    return {"status": "healthy", "port": os.environ.get("PORT", "unknown")}

@app.get("/test")
async def test():
    return {"test": "success", "port": os.environ.get("PORT", "unknown")}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    
    # Force uvicorn to work
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    ) 