from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import datetime

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    roblox_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    creator_id = Column(String)
    creator_name = Column(String)
    genre = Column(String)
    # Roblox API timestamps
    roblox_created = Column(DateTime)  # From Roblox API 'created' field
    roblox_updated = Column(DateTime)  # From Roblox API 'updated' field
    # Database timestamps
    created_at = Column(DateTime, default=func.now())  # When we first scraped this game
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())  # When we last updated this game
    
    # Relationships
    metrics = relationship("GameMetric", back_populates="game")

class GameMetric(Base):
    __tablename__ = "game_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"))
    visits = Column(BigInteger, default=0)
    favorites = Column(BigInteger, default=0)
    likes = Column(BigInteger, default=0)
    dislikes = Column(BigInteger, default=0)
    active_players = Column(BigInteger, default=0)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    game = relationship("Game", back_populates="metrics")



class ScrapingLog(Base):
    __tablename__ = "scraping_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String)  # success, failed, running
    games_scraped = Column(Integer, default=0)
    new_games_found = Column(Integer, default=0)
    errors = Column(Text)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)

class AnalyticsCache(Base):
    __tablename__ = "analytics_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    cache_key = Column(String, unique=True, index=True)
    data = Column(JSON)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now()) 