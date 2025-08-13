#!/usr/bin/env python3
"""
Migration script to add Roblox timestamp columns to games table
"""
from sqlalchemy import create_engine, text
from config import settings
import logging

logger = logging.getLogger(__name__)

def migrate_timestamps():
    """Add Roblox timestamp columns to games table"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            logger.info("Adding roblox_created column to games table...")
            conn.execute(text("""
                ALTER TABLE games 
                ADD COLUMN IF NOT EXISTS roblox_created TIMESTAMP
            """))
            
            logger.info("Adding roblox_updated column to games table...")
            conn.execute(text("""
                ALTER TABLE games 
                ADD COLUMN IF NOT EXISTS roblox_updated TIMESTAMP
            """))
            
            conn.commit()
            logger.info("Timestamp columns migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise e

if __name__ == "__main__":
    migrate_timestamps() 