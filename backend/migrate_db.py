#!/usr/bin/env python3
"""
Migration script to update database schema for BigInteger columns
"""

from sqlalchemy import create_engine, text
from config import settings
import logging

logger = logging.getLogger(__name__)

def migrate_database():
    """Migrate database to use BigInteger for large numbers"""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Drop and recreate game_metrics table with BigInteger columns
            logger.info("Dropping game_metrics table...")
            conn.execute(text("DROP TABLE IF EXISTS game_metrics CASCADE"))
            
            # Create new table with BigInteger columns
            logger.info("Creating game_metrics table with BigInteger columns...")
            conn.execute(text("""
                CREATE TABLE game_metrics (
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
            
            conn.commit()
            logger.info("Database migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise e

if __name__ == "__main__":
    migrate_database() 