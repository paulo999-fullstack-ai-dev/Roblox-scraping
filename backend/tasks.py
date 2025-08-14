import requests
import time
import logging
import datetime
from typing import Optional, Dict, Any
from database import SessionLocal, engine
from models import Game, GameMetric, ScrapingLog
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_roblox_timestamp(timestamp_str: str) -> datetime.datetime:
    """Parse Roblox timestamp string to datetime object"""
    try:
        # Remove 'Z' and add UTC offset
        if timestamp_str.endswith('Z'):
            timestamp_str = timestamp_str[:-1] + '+00:00'
        return datetime.datetime.fromisoformat(timestamp_str)
    except Exception as e:
        logger.error(f"Failed to parse timestamp {timestamp_str}: {e}")
        return datetime.datetime.utcnow()  # Use UTC time as fallback

def scrape_games(log_id: Optional[int] = None) -> Dict[str, Any]:
    """Scrape trending games from Roblox"""
    start_time = datetime.datetime.utcnow()  # Use UTC time
    games_scraped = 0
    new_games_found = 0
    errors = []
    
    try:
        # Get trending games
        url = f"{settings.ROBLOX_API_BASE_URL}/games/list-sortable"
        params = {
            "sortType": "Popularity",
            "limit": 50
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        games_data = response.json()
        trending_games = games_data.get("games", [])
        
        logger.info(f"Found {len(trending_games)} trending games")
        
        db = SessionLocal()
        try:
            for game_data in trending_games:
                try:
                    # Check if game already exists
                    existing_game = db.query(Game).filter(Game.roblox_id == str(game_data["id"])).first()
                    
                    if existing_game:
                        # Update existing game
                        existing_game.name = game_data["name"]
                        existing_game.description = game_data.get("description", "")
                        existing_game.creator_id = str(game_data.get("creatorTargetId", ""))
                        existing_game.creator_name = game_data.get("creatorName", "")
                        existing_game.genre = game_data.get("genre", "")
                        existing_game.roblox_created = parse_roblox_timestamp(game_data.get("created", ""))
                        existing_game.roblox_updated = parse_roblox_timestamp(game_data.get("updated", ""))
                        existing_game.updated_at = datetime.datetime.utcnow()  # Use UTC time
                        
                        # Get current metrics
                        existing_game.visits = game_data.get("visits", 0)
                        existing_game.favorites = game_data.get("favorites", 0)
                        existing_game.likes = game_data.get("likes", 0)
                        existing_game.dislikes = game_data.get("dislikes", 0)
                        existing_game.active_players = game_data.get("playing", 0)
                        
                        games_scraped += 1
                        logger.info(f"Updated existing game: {game_data['name']}")
                        
                    else:
                        # Create new game
                        new_game = Game(
                            roblox_id=str(game_data["id"]),
                            name=game_data["name"],
                            description=game_data.get("description", ""),
                            creator_id=str(game_data.get("creatorTargetId", "")),
                            creator_name=game_data.get("creatorName", ""),
                            genre=game_data.get("genre", ""),
                            roblox_created=parse_roblox_timestamp(game_data.get("created", "")),
                            roblox_updated=parse_roblox_timestamp(game_data.get("updated", "")),
                            visits=game_data.get("visits", 0),
                            favorites=game_data.get("favorites", 0),
                            likes=game_data.get("likes", 0),
                            dislikes=game_data.get("dislikes", 0),
                            active_players=game_data.get("playing", 0)
                        )
                        db.add(new_game)
                        db.flush()  # Get the ID
                        
                        new_games_found += 1
                        games_scraped += 1
                        logger.info(f"Added new game: {game_data['name']}")
                    
                    # Create metric entry
                    metric = GameMetric(
                        game_id=existing_game.id if existing_game else new_game.id,
                        visits=game_data.get("visits", 0),
                        favorites=game_data.get("favorites", 0),
                        likes=game_data.get("likes", 0),
                        dislikes=game_data.get("dislikes", 0),
                        active_players=game_data.get("playing", 0)
                    )
                    db.add(metric)
                    
                    # Rate limiting
                    time.sleep(settings.REQUEST_DELAY_SECONDS)
                    
                except Exception as e:
                    error_msg = f"Error processing game {game_data.get('name', 'Unknown')}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
                    continue
            
            # Commit all changes
            db.commit()
            logger.info(f"Successfully scraped {games_scraped} games, {new_games_found} new")
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            
    except Exception as e:
        error_msg = f"Scraping failed: {str(e)}"
        errors.append(error_msg)
        logger.error(error_msg)
        raise e
    
    finally:
        # Update scraping log
        if log_id:
            end_time = datetime.datetime.utcnow()  # Use UTC time
            duration = (end_time - start_time).total_seconds()
            
            db = SessionLocal()
            try:
                log = db.query(ScrapingLog).filter(ScrapingLog.id == log_id).first()
                if log:
                    log.status = "success" if not errors else "completed_with_errors"
                    log.games_scraped = games_scraped
                    log.new_games_found = new_games_found
                    log.completed_at = end_time  # Use UTC time
                    log.duration_seconds = duration
                    if errors:
                        log.errors = "; ".join(errors)
                    db.commit()
                    logger.info(f"Updated scraping log {log_id}")
            except Exception as e:
                logger.error(f"Failed to update scraping log: {e}")
            finally:
                db.close()
    
    return {
        "success": True,
        "games_scraped": games_scraped,
        "new_games_found": new_games_found,
        "errors": errors,
        "duration_seconds": (datetime.datetime.utcnow() - start_time).total_seconds()  # Use UTC time
    }

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
