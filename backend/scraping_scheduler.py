"""
Minimal Scraping Scheduler - Basic working version
"""
import threading
import datetime
from database import SessionLocal
from models import ScrapingLog
import logging

logger = logging.getLogger(__name__)

class MinimalScrapingScheduler:
    def __init__(self):
        self.current_job = None
        self.is_running = False
        self.next_scheduled_run = None
        self.scheduler_active = False
        self.scheduler_thread = None
        
        # Start the scheduler thread
        self._start_scheduler_thread()
        
        logger.info("MinimalScrapingScheduler initialized successfully")
    
    def _start_scheduler_thread(self):
        """Start the background scheduler thread"""
        try:
            self.scheduler_thread = threading.Thread(target=self._scheduler_loop, daemon=True)
            self.scheduler_thread.start()
            logger.info("Scheduler thread started successfully")
        except Exception as e:
            logger.error(f"Failed to start scheduler thread: {str(e)}")
    
    def _scheduler_loop(self):
        """Main scheduler loop - checks every minute if it's time to run"""
        while True:
            try:
                import time
                time.sleep(60)  # Check every minute
                
                if (self.scheduler_active and 
                    self.next_scheduled_run and 
                    datetime.datetime.now() >= self.next_scheduled_run and
                    not self.is_running):
                    
                    logger.info(f"Scheduled run time reached: {self.next_scheduled_run}")
                    self._start_scheduled_scraping()
                    
            except Exception as e:
                logger.error(f"Scheduler loop error: {str(e)}")
                import time
                time.sleep(60)  # Wait before retrying
    
    def start_scraping(self) -> dict:
        """Start scraping manually"""
        try:
            logger.info("Starting manual scraping job...")
            
            # Check if already running
            if self.is_running:
                return {
                    "success": False,
                    "message": "Scraping is already running"
                }
            
            # Create new scraping log
            db = SessionLocal()
            try:
                log = ScrapingLog(
                    status="running",
                    started_at=datetime.datetime.now()
                )
                db.add(log)
                db.commit()
                db.refresh(log)
                
                self.current_job = log
                self.is_running = True
                
                # Calculate next scheduled run (1 hour from now)
                now = datetime.datetime.now()
                self.next_scheduled_run = now.replace(
                    minute=now.minute, 
                    second=0, 
                    microsecond=0
                ) + datetime.timedelta(hours=1)
                
                # Activate scheduler
                self.scheduler_active = True
                
                logger.info(f"Created scraping log {log.id}, next run scheduled for {self.next_scheduled_run}")
                
                # Start scraping in background thread
                scraping_thread = threading.Thread(
                    target=self._run_scraping,
                    args=(log.id,),
                    daemon=True
                )
                scraping_thread.start()
                
                logger.info(f"Started scraping job {log.id}")
                
                return {
                    "success": True,
                    "message": "Scraping started successfully",
                    "job_id": log.id,
                    "next_run": self.next_scheduled_run.isoformat()
                }
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Failed to start scraping: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to start scraping: {str(e)}"
            }
    
    def stop_scraping(self) -> dict:
        """Stop current scraping"""
        try:
            logger.info("Stopping scraping...")
            
            # Stop current job if running
            if self.current_job and self.is_running:
                self.is_running = False
                
                # Update log status
                db = SessionLocal()
                try:
                    log = db.query(ScrapingLog).filter(ScrapingLog.id == self.current_job.id).first()
                    if log:
                        log.status = "cancelled"
                        log.completed_at = datetime.datetime.now()
                        log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                        db.commit()
                        logger.info(f"Stopped scraping job {log.id}")
                finally:
                    db.close()
            
            # Cancel scheduler
            self.scheduler_active = False
            self.next_scheduled_run = None
            
            return {
                "success": True,
                "message": "Scraping stopped successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to stop scraping: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to stop scraping: {str(e)}"
            }
    
    def get_status(self) -> dict:
        """Get current scraping status"""
        try:
            if not self.current_job:
                return {
                    "is_running": False,
                    "last_run": None,
                    "next_run": self.next_scheduled_run.isoformat() if self.next_scheduled_run else None,
                    "total_games_scraped": 0,
                    "new_games_found": 0,
                    "scheduler_active": self.scheduler_active
                }
            
            # Get latest log info
            db = SessionLocal()
            try:
                log = db.query(ScrapingLog).filter(ScrapingLog.id == self.current_job.id).first()
                if not log:
                    return {
                        "is_running": False,
                        "last_run": None,
                        "next_run": self.next_scheduled_run.isoformat() if self.next_scheduled_run else None,
                        "total_games_scraped": 0,
                        "new_games_found": 0,
                        "scheduler_active": self.scheduler_active
                    }
                
                return {
                    "is_running": self.is_running and log.status == "running",
                    "last_run": log.started_at.isoformat() if log.started_at else None,
                    "next_run": self.next_scheduled_run.isoformat() if self.next_scheduled_run else None,
                    "total_games_scraped": log.games_scraped or 0,
                    "new_games_found": log.new_games_found or 0,
                    "scheduler_active": self.scheduler_active
                }
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Failed to get status: {str(e)}")
            return {
                "is_running": False,
                "last_run": None,
                "next_run": None,
                "total_games_scraped": 0,
                "new_games_found": 0,
                "scheduler_active": False
            }
    
    def _run_scraping(self, log_id: int):
        """Run the actual scraping process"""
        try:
            logger.info(f"Starting scraping for log {log_id}")
            
            # Import and run scraping
            try:
                from tasks import scrape_games
                logger.info(f"Successfully imported scrape_games function")
                
                logger.info(f"Calling scrape_games with log_id: {log_id}")
                scrape_games(log_id=log_id)
                logger.info(f"scrape_games function completed for log_id: {log_id}")
                
            except ImportError as import_error:
                logger.error(f"Failed to import scrape_games: {str(import_error)}")
                raise import_error
            except Exception as scrape_error:
                logger.error(f"scrape_games function failed: {str(scrape_error)}")
                raise scrape_error
            
            # Update log with success
            if self.is_running:  # Only update if not cancelled
                db = SessionLocal()
                try:
                    log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                    if log:
                        log.status = "success"
                        log.completed_at = datetime.datetime.now()
                        log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                        db.commit()
                        logger.info(f"Scraping job {log_id} completed successfully")
                except Exception as e:
                    logger.error(f"Failed to update log {log_id}: {str(e)}")
                finally:
                    db.close()
            
            self.is_running = False
            logger.info(f"Scraping job {log_id} finished")
            
        except Exception as e:
            logger.error(f"Scraping job {log_id} failed: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Update log with failure
            try:
                db = SessionLocal()
                log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                if log:
                    log.status = "failed"
                    log.errors = str(e)
                    log.completed_at = datetime.datetime.now()
                    log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                    db.commit()
            except Exception as update_error:
                logger.error(f"Failed to update failed log {log_id}: {str(update_error)}")
            finally:
                db.close()
            
            self.is_running = False
            logger.info(f"Scraping job {log_id} failed, is_running set to False")
    
    def _start_scheduled_scraping(self):
        """Start a scheduled scraping run"""
        try:
            logger.info("Starting scheduled scraping run...")
            
            # Create new scraping log for scheduled run
            db = SessionLocal()
            try:
                log = ScrapingLog(
                    status="running",
                    started_at=datetime.datetime.now()
                )
                db.add(log)
                db.commit()
                db.refresh(log)
                
                self.current_job = log
                self.is_running = True
                
                logger.info(f"Created scheduled scraping log {log.id}")
                
                # Start scraping in background thread
                scraping_thread = threading.Thread(
                    target=self._run_scheduled_scraping,
                    args=(log.id,),
                    daemon=True
                )
                scraping_thread.start()
                
                logger.info(f"Started scheduled scraping job {log.id}")
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Failed to start scheduled scraping: {str(e)}")
            self.is_running = False
    
    def _run_scheduled_scraping(self, log_id: int):
        """Run scheduled scraping and schedule next run"""
        try:
            logger.info(f"Starting scheduled scraping for log {log_id}")
            
            # Import and run scraping
            try:
                from tasks import scrape_games
                logger.info(f"Successfully imported scrape_games function")
                
                logger.info(f"Calling scrape_games with log_id: {log_id}")
                scrape_games(log_id=log_id)
                logger.info(f"scrape_games function completed for log_id: {log_id}")
                
            except ImportError as import_error:
                logger.error(f"Failed to import scrape_games: {str(import_error)}")
                raise import_error
            except Exception as scrape_error:
                logger.error(f"scrape_games function failed: {str(scrape_error)}")
                raise scrape_error
            
            # Update log with success
            if self.is_running:  # Only update if not cancelled
                db = SessionLocal()
                try:
                    log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                    if log:
                        log.status = "success"
                        log.completed_at = datetime.datetime.now()
                        log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                        db.commit()
                        logger.info(f"Scheduled scraping job {log_id} completed successfully")
                except Exception as e:
                    logger.error(f"Failed to update log {log_id}: {str(e)}")
                finally:
                    db.close()
            
            # Schedule next run (1 hour from start time, not current time)
            if self.scheduler_active:
                # Get the start time of this job to calculate next run
                db = SessionLocal()
                try:
                    log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                    if log and log.started_at:
                        # Calculate next run from the start time of this job
                        start_time = log.started_at
                        self.next_scheduled_run = start_time.replace(
                            minute=start_time.minute, 
                            second=0, 
                            microsecond=0
                        ) + datetime.timedelta(hours=1)
                        logger.info(f"Scheduled next run for {self.next_scheduled_run} (1 hour from start time)")
                    else:
                        # Fallback: calculate from current time
                        now = datetime.datetime.now()
                        self.next_scheduled_run = now.replace(
                            minute=now.minute, 
                            second=0, 
                            microsecond=0
                        ) + datetime.timedelta(hours=1)
                        logger.info(f"Scheduled next run for {self.next_scheduled_run} (fallback)")
                except Exception as e:
                    logger.error(f"Failed to get start time for scheduling: {str(e)}")
                    # Fallback: calculate from current time
                    now = datetime.datetime.now()
                    self.next_scheduled_run = now.replace(
                        minute=now.minute, 
                        second=0, 
                        microsecond=0
                    ) + datetime.timedelta(hours=1)
                    logger.info(f"Scheduled next run for {self.next_scheduled_run} (fallback)")
                finally:
                    db.close()
            
            self.is_running = False
            logger.info(f"Scheduled scraping job {log_id} finished")
            
        except Exception as e:
            logger.error(f"Scheduled scraping job {log_id} failed: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Update log with failure
            try:
                db = SessionLocal()
                log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                if log:
                    log.status = "failed"
                    log.errors = str(e)
                    log.completed_at = datetime.datetime.now()
                    log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                    db.commit()
            except Exception as update_error:
                logger.error(f"Failed to update failed log {log_id}: {str(update_error)}")
            finally:
                db.close()
            
            self.is_running = False
            logger.info(f"Scheduled scraping job {log_id} failed, is_running set to False")

# Global scheduler instance
scraping_scheduler = MinimalScrapingScheduler() 