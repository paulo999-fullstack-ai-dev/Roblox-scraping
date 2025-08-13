from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import ScrapingLog
from schemas import ScrapingStatusResponse, ScrapingLogResponse
from scraping_scheduler import scraping_scheduler
import datetime

router = APIRouter()

@router.post("/start")
async def start_scraping():
    """Start scraping process and schedule next run - SIMPLE SCHEDULER"""
    try:
        result = scraping_scheduler.start_scraping()
        
        if result["success"]:
            return {
                "message": result["message"],
                "job_id": result["job_id"],
                "next_run": result["next_run"]
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start scraping: {str(e)}")

@router.post("/stop")
async def stop_scraping():
    """Stop current scraping and cancel scheduled runs""" 
    try:
        result = scraping_scheduler.stop_scraping()
        
        if result["success"]:
            return {"message": result["message"]}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop scraping: {str(e)}")

@router.get("/status", response_model=ScrapingStatusResponse)
async def get_scraping_status():
    """Get current scraping status"""
    try:
        status = scraping_scheduler.get_status()
        return ScrapingStatusResponse(**status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.get("/logs", response_model=List[ScrapingLogResponse])
async def get_scraping_logs(
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get scraping logs"""
    logs = db.query(ScrapingLog).order_by(ScrapingLog.started_at.desc()).limit(limit).all()
    return logs

@router.get("/logs/{log_id}", response_model=ScrapingLogResponse)
async def get_scraping_log(log_id: int, db: Session = Depends(get_db)):
    """Get specific scraping log"""
    log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log 