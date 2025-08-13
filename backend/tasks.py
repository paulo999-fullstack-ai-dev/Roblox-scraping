# from celery_app import celery  # Commented out for development without Redis
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Game, GameMetric, ScrapingLog
from scraper import RobloxScraper
from config import settings
import datetime
import time
import logging

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('scraping.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

def scrape_games(log_id=None):
    """Main scraping task - runs every hour"""
    logger.info("Starting Roblox games scraping process...")
    db = SessionLocal()
    scraper = RobloxScraper()
    
    # No need to import stop flag - scheduler handles this now
    
    # Use existing log if provided, otherwise create new one
    if log_id:
        log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
        if not log:
            logger.error(f"ScrapingLog with ID {log_id} not found")
            return
        logger.info(f"Using existing scraping log {log_id}")
    else:
        # Create scraping log with retry mechanism (for standalone usage)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                log = ScrapingLog(
                    status="running",
                    started_at=datetime.datetime.now()
                )
                db.add(log)
                db.commit()
                break
            except Exception as e:
                logger.warning(f"Database connection attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error("Failed to create scraping log after all retries")
                    return
                db.rollback()
                time.sleep(1)  # Wait before retry
    
    try:
        logger.info("Fetching popular games from Roblox...")
        
        # Scrape popular games
        games_scraped = 0
        new_games_found = 0
        
        # Get trending games from Roblox (more accurate data)
        try:
            trending_games = scraper.get_trending_games()
            logger.info(f"Found {len(trending_games)} trending games to process")
        except Exception as e:
            logger.error(f"Failed to fetch trending games: {str(e)}")
            trending_games = []
            # Update log with error
            log.status = "failed"
            log.errors = f"Failed to fetch trending games: {str(e)}"
            log.completed_at = datetime.datetime.now()
            log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
            db.commit()
            return
        
        for i, game_data in enumerate(trending_games, 1):
            # Process each game (scheduler handles stopping)
                
            try:
                logger.info(f"Processing game {i}/{len(trending_games)}: {game_data.get('name', 'Unknown')} (ID: {game_data.get('id', 'Unknown')})")
                
                # Create a new database session for each game to avoid transaction issues
                game_db = SessionLocal()
                try:
                    # Check if game already exists
                    existing_game = game_db.query(Game).filter(
                        Game.roblox_id == str(game_data['id'])
                    ).first()
                
                    # Parse Roblox timestamps
                    def parse_roblox_timestamp(timestamp_str):
                        """Parse Roblox timestamp string to datetime object"""
                        if not timestamp_str:
                            return None
                        try:
                            # Roblox timestamps are in ISO format like "2025-03-04T04:46:49.73Z"
                            return datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                        except Exception as e:
                            logger.warning(f"Failed to parse timestamp '{timestamp_str}': {str(e)}")
                            return None
                    
                    roblox_created = parse_roblox_timestamp(game_data.get('created', ''))
                    roblox_updated = parse_roblox_timestamp(game_data.get('updated', ''))
                    
                    if not existing_game:
                        # Create new game
                        logger.info(f"Creating new game: {game_data['name']}")
                        game = Game(
                            roblox_id=str(game_data['id']),
                            name=game_data['name'],
                            description=game_data.get('description', ''),
                            creator_id=str(game_data.get('creator', {}).get('id', '')),
                            creator_name=game_data.get('creator', {}).get('name', ''),
                            genre=game_data.get('genre', ''),
                            roblox_created=roblox_created,
                            roblox_updated=roblox_updated
                        )
                        game_db.add(game)
                        game_db.commit()
                        game_db.refresh(game)
                        new_games_found += 1
                        logger.info(f"New game created: {game.name} (ID: {game.id})")
                    else:
                        # Update existing game with new Roblox timestamps
                        game = existing_game
                        game.roblox_updated = roblox_updated  # Update the Roblox updated timestamp
                        game_db.commit()
                        logger.info(f"Updated existing game: {game.name} (ID: {game.id})")
                    
                    # Get metrics from enriched data (already fetched in get_trending_games)
                    logger.info(f"Processing metrics for game: {game.name}")
                    try:
                        # Use the enriched data directly - no need for separate API call
                        visits = game_data.get('visits', 0)
                        favorites = game_data.get('favorited_count', 0)
                        likes = game_data.get('likes', 0)  # From trending API
                        dislikes = game_data.get('dislikes', 0)  # From trending API
                        active_players = game_data.get('playing', 0)
                        
                        game_metric = GameMetric(
                            game_id=game.id,
                            visits=visits,
                            favorites=favorites,
                            likes=likes,
                            dislikes=dislikes,
                            active_players=active_players
                        )
                        game_db.add(game_metric)
                        game_db.commit()
                        logger.info(f"Metrics saved - Visits: {visits}, Favorites: {favorites}, Likes: {likes}, Dislikes: {dislikes}, Active: {active_players}")
                    except Exception as e:
                        logger.error(f"Failed to process metrics for game {game.name}: {str(e)}")
                        game_db.rollback()
                        
                    games_scraped += 1
                    
                except Exception as e:
                    logger.error(f"Error processing game {game_data.get('id', 'unknown')}: {str(e)}")
                    game_db.rollback()
                finally:
                    game_db.close()
                
                # Rate limiting
                if i < len(trending_games):  # Don't sleep after the last game
                    logger.info(f"Rate limiting: waiting {settings.REQUEST_DELAY_SECONDS} seconds...")
                    time.sleep(settings.REQUEST_DELAY_SECONDS)
                
            except Exception as e:
                logger.error(f"Error scraping game {game_data.get('id', 'unknown')}: {str(e)}")
                continue
        
        # Update scraping log with retry mechanism
        max_retries = 3
        for attempt in range(max_retries):
            try:
                log.status = "success"
                log.games_scraped = games_scraped
                log.new_games_found = new_games_found
                log.completed_at = datetime.datetime.now()
                log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                db.commit()
                break
            except Exception as e:
                logger.warning(f"Final log update attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error("Failed to update final log after all retries")
                db.rollback()
                time.sleep(1)  # Wait before retry
        
        logger.info("Scraping completed successfully!")
        logger.info("Summary:")
        logger.info(f"   - Total games processed: {games_scraped}")
        logger.info(f"   - New games found: {new_games_found}")
        logger.info(f"   - Duration: {log.duration_seconds:.2f} seconds")
        if games_scraped > 0:
            logger.info(f"   - Average time per game: {log.duration_seconds/games_scraped:.2f} seconds")
        else:
            logger.info("   - Average time per game: N/A (no games processed)")
        
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        # Update log with error using retry mechanism
        max_retries = 3
        for attempt in range(max_retries):
            try:
                log.status = "failed"
                log.errors = str(e)
                log.completed_at = datetime.datetime.now()
                log.duration_seconds = (log.completed_at - log.started_at).total_seconds()
                db.commit()
                break
            except Exception as db_error:
                logger.warning(f"Error log update attempt {attempt + 1} failed: {db_error}")
                if attempt == max_retries - 1:
                    logger.error("Failed to update error log after all retries")
                db.rollback()
                time.sleep(1)  # Wait before retry
        raise e
    finally:
        db.close()
        logger.info("Scraping session ended")

def update_analytics():
    """Update analytics cache - runs daily"""
    db = SessionLocal()
    try:
        logger.info("Updating analytics cache...")
        # This would update cached analytics data
        # For now, just log that it's running
        logger.info("Analytics update completed")
    except Exception as e:
        logger.error(f"Analytics update failed: {str(e)}")
        raise e
    finally:
        db.close()
