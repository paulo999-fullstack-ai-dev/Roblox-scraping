"""
Minimal Scraping Scheduler - Basic working version
"""
import threading
import time
import logging
import datetime
from typing import Optional, Dict, Any
from database import SessionLocal
from models import ScrapingLog
from tasks import scrape_games

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedScrapingScheduler:
    def __init__(self):
        self.is_running = False
        self.scheduler_active = False
        self.next_scheduled_run: Optional[datetime.datetime] = None
        self._lock = threading.Lock()
        self._scheduler_thread: Optional[threading.Thread] = None
        self._start_scheduler_thread()
    
    def start_scraping(self) -> Dict[str, Any]:
        """Start a new scraping job and schedule next run"""
        with self._lock:
            if self.is_running:
                return {"status": "already_running", "message": "Scraping is already running"}
            
            # Cancel any existing running jobs in DB
            self._cleanup_all_running_jobs()
            
            # Create new log entry
            db = SessionLocal()
            try:
                log = ScrapingLog(
                    status="running",
                    games_scraped=0,
                    new_games_found=0,
                    started_at=datetime.datetime.utcnow()  # Use UTC time
                )
                db.add(log)
                db.commit()
                log_id = log.id
                
                # Set next scheduled run (1 hour from start time)
                now = datetime.datetime.utcnow()  # Use UTC time
                self.next_scheduled_run = now + datetime.timedelta(hours=1)
                self.scheduler_active = True
                
                logger.info(f"Starting scraping job {log_id}, next run scheduled for {self.next_scheduled_run}")
                
                # Start scraping in background thread
                self.is_running = True
                thread = threading.Thread(target=self._run_scraping, args=(log_id,))
                thread.daemon = True
                thread.start()
                
                return {
                    "status": "started",
                    "log_id": log_id,
                    "next_run": self.next_scheduled_run.isoformat(),
                    "message": "Scraping started successfully"
                }
                
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to start scraping: {e}")
                return {"status": "error", "message": str(e)}
            finally:
                db.close()
    
    def stop_scraping(self) -> Dict[str, Any]:
        """Stop the current scraping job"""
        with self._lock:
            if not self.is_running:
                return {"status": "not_running", "message": "No scraping job is currently running"}
            
            self.is_running = False
            self.scheduler_active = False
            
            # Update log status to cancelled
            db = SessionLocal()
            try:
                running_logs = db.query(ScrapingLog).filter(ScrapingLog.status == "running").all()
                for log in running_logs:
                    log.status = "cancelled"
                    log.completed_at = datetime.datetime.utcnow()  # Use UTC time
                db.commit()
                logger.info("Scraping stopped and all running logs marked as cancelled")
                
                return {"status": "stopped", "message": "Scraping stopped successfully"}
                
            except Exception as e:
                db.rollback()
                logger.error(f"Failed to stop scraping: {e}")
                return {"status": "error", "message": str(e)}
            finally:
                db.close()
    
    def get_status(self) -> Dict[str, Any]:
        """Get current scraping status"""
        with self._lock:
            db = SessionLocal()
            try:
                # Get latest log
                latest_log = db.query(ScrapingLog).order_by(ScrapingLog.started_at.desc()).first()
                
                status_info = {
                    "is_running": self.is_running,
                    "scheduler_active": self.scheduler_active,
                    "total_games_scraped": 0,
                    "new_games_found": 0
                }
                
                if latest_log:
                    status_info.update({
                        "last_run": latest_log.started_at.isoformat() if latest_log.started_at else None,
                        "total_games_scraped": latest_log.games_scraped or 0,
                        "new_games_found": latest_log.new_games_found or 0
                    })
                
                if self.next_scheduled_run:
                    status_info["next_run"] = self.next_scheduled_run.isoformat()
                
                return status_info
                
            except Exception as e:
                logger.error(f"Failed to get status: {e}")
                return {"status": "error", "message": str(e)}
            finally:
                db.close()
    
    def _cleanup_all_running_jobs(self):
        """Cancel all running jobs in the database"""
        db = SessionLocal()
        try:
            running_logs = db.query(ScrapingLog).filter(ScrapingLog.status == "running").all()
            for log in running_logs:
                log.status = "cancelled"
                log.completed_at = datetime.datetime.utcnow()  # Use UTC time
            db.commit()
            logger.info(f"Cancelled {len(running_logs)} running jobs")
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to cleanup running jobs: {e}")
        finally:
            db.close()
    
    def _start_scheduler_thread(self):
        """Start the background scheduler thread"""
        if self._scheduler_thread and self._scheduler_thread.is_alive():
            return
        
        self._scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
        self._scheduler_thread.start()
        logger.info("Scheduler thread started")
    
    def _scheduler_loop(self):
        """Main scheduler loop that runs every minute"""
        while True:
            try:
                time.sleep(60)  # Check every minute
                
                with self._lock:
                    if (self.next_scheduled_run and 
                        datetime.datetime.utcnow() >= self.next_scheduled_run and  # Use UTC time
                        not self.is_running):
                        
                        logger.info("Scheduled run time reached, starting scraping")
                        self._start_scheduled_scraping()
                        
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                time.sleep(60)  # Wait before retrying
    
    def _start_scheduled_scraping(self):
        """Start a scheduled scraping job"""
        try:
            # Create new log for scheduled run
            db = SessionLocal()
            log = ScrapingLog(
                status="running",
                games_scraped=0,
                new_games_found=0,
                started_at=datetime.datetime.utcnow()  # Use UTC time
            )
            db.add(log)
            db.commit()
            log_id = log.id
            db.close()
            
            # Schedule next run (1 hour from this start time)
            now = datetime.datetime.utcnow()  # Use UTC time
            self.next_scheduled_run = now + datetime.timedelta(hours=1)
            
            logger.info(f"Starting scheduled scraping job {log_id}, next run scheduled for {self.next_scheduled_run}")
            
            # Start scraping in background thread
            self.is_running = True
            thread = threading.Thread(target=self._run_scheduled_scraping, args=(log_id,))
            thread.daemon = True
            thread.start()
            
        except Exception as e:
            logger.error(f"Failed to start scheduled scraping: {e}")
            self.is_running = False
    
    def _run_scraping(self, log_id: int):
        """Run the scraping job"""
        try:
            logger.info(f"Running scraping job {log_id}")
            result = scrape_games(log_id=log_id)
            logger.info(f"Scraping job {log_id} completed: {result}")
            
        except Exception as e:
            logger.error(f"Scraping job {log_id} failed: {e}")
            
            # Update log with error
            db = SessionLocal()
            try:
                log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                if log:
                    log.status = "failed"
                    log.errors = str(e)
                    log.completed_at = datetime.datetime.utcnow()  # Use UTC time
                    db.commit()
            except Exception as db_error:
                logger.error(f"Failed to update log with error: {db_error}")
            finally:
                db.close()
        
        finally:
            self.is_running = False
    
    def _run_scheduled_scraping(self, log_id: int):
        """Run a scheduled scraping job"""
        try:
            logger.info(f"Running scheduled scraping job {log_id}")
            result = scrape_games(log_id=log_id)
            logger.info(f"Scheduled scraping job {log_id} completed: {result}")
            
        except Exception as e:
            logger.error(f"Scheduled scraping job {log_id} failed: {e}")
            
            # Update log with error
            db = SessionLocal()
            try:
                log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                if log:
                    log.status = "failed"
                    log.errors = str(e)
                    log.completed_at = datetime.datetime.utcnow()  # Use UTC time
                    db.commit()
            except Exception as db_error:
                logger.error(f"Failed to update log with error: {db_error}")
            finally:
                db.close()
        
        finally:
            self.is_running = False

# Global scheduler instance
scraping_scheduler = EnhancedScrapingScheduler() 