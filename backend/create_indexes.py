#!/usr/bin/env python3
"""
Create database indexes for faster analytics queries
"""
from sqlalchemy import create_engine, text
from config import settings
import logging

logger = logging.getLogger(__name__)

def create_database_indexes():
    """Create indexes for faster analytics queries"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            logger.info("Creating database indexes for performance...")
            
            # Indexes for games table
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_name ON games(name)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_creator_name ON games(creator_name)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_roblox_created ON games(roblox_created)"))
            
            # Indexes for game_metrics table (most important for analytics)
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_game_id_created_at ON game_metrics(game_id, created_at DESC)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_visits ON game_metrics(visits DESC)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_favorites ON game_metrics(favorites DESC)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_active_players ON game_metrics(active_players DESC)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_latest ON game_metrics(game_id, created_at DESC)"))
            
            # Composite indexes for common query patterns
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_visits_active ON game_metrics(visits DESC, active_players DESC)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_favorites_visits ON game_metrics(favorites DESC, visits DESC)"))
            
            # Indexes for scraping_logs
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_scraping_logs_status ON scraping_logs(status)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_scraping_logs_started_at ON scraping_logs(started_at DESC)"))
            
            # Indexes for analytics_cache
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at)"))
            
            conn.commit()
            logger.info("Database indexes created successfully!")
            
            # Show index information
            result = conn.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE schemaname = 'public' 
                AND tablename IN ('games', 'game_metrics', 'scraping_logs', 'analytics_cache')
                ORDER BY tablename, indexname
            """)).fetchall()
            
            logger.info("Current indexes:")
            for row in result:
                logger.info(f"  {row.tablename}.{row.indexname}")
                
    except Exception as e:
        logger.error(f"Failed to create database indexes: {str(e)}")
        raise e

if __name__ == "__main__":
    create_database_indexes() 