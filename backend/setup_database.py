#!/usr/bin/env python3
"""
Database setup script - creates all tables and adds new timestamp columns
"""
from sqlalchemy import create_engine, text
from config import settings
import logging

print("Starting database setup...")

logger = logging.getLogger(__name__)

def setup_database():
    """Create all database tables and add new columns"""
    try:
        print(f"Connecting to database: {settings.DATABASE_URL}")
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            print("Setting up database tables...")
            
            # Create games table
            print("Creating games table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS games (
                    id SERIAL PRIMARY KEY,
                    roblox_id VARCHAR UNIQUE NOT NULL,
                    name VARCHAR NOT NULL,
                    description TEXT,
                    creator_id VARCHAR,
                    creator_name VARCHAR,
                    genre VARCHAR,
                    roblox_created TIMESTAMP,
                    roblox_updated TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create game_metrics table
            print("Creating game_metrics table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS game_metrics (
                    id SERIAL PRIMARY KEY,
                    game_id INTEGER REFERENCES games(id),
                    visits BIGINT DEFAULT 0,
                    favorites BIGINT DEFAULT 0,
                    likes BIGINT DEFAULT 0,
                    dislikes BIGINT DEFAULT 0,
                    active_players BIGINT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Create scraping_logs table
            print("Creating scraping_logs table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS scraping_logs (
                    id SERIAL PRIMARY KEY,
                    status VARCHAR,
                    games_scraped INTEGER DEFAULT 0,
                    new_games_found INTEGER DEFAULT 0,
                    errors TEXT,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    duration_seconds FLOAT
                )
            """))
            
            # Create analytics_cache table
            print("Creating analytics_cache table...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS analytics_cache (
                    id SERIAL PRIMARY KEY,
                    cache_key VARCHAR UNIQUE NOT NULL,
                    data JSONB,
                    expires_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """))
            
            # Add indexes for better performance
            print("Creating indexes...")
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_roblox_id ON games(roblox_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_games_updated_at ON games(updated_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_game_id ON game_metrics(game_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_game_metrics_created_at ON game_metrics(created_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_scraping_logs_started_at ON scraping_logs(started_at)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(cache_key)"))
            
            conn.commit()
            print("Database setup completed successfully!")
            
    except Exception as e:
        print(f"Database setup failed: {str(e)}")
        logger.error(f"Database setup failed: {str(e)}")
        raise e

if __name__ == "__main__":
    setup_database() 