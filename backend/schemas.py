from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Game schemas
class GameMetricBase(BaseModel):
    visits: int
    favorites: int
    likes: int
    dislikes: int
    active_players: int
    created_at: datetime

class GameMetricResponse(GameMetricBase):
    id: int
    game_id: int

class GameBase(BaseModel):
    roblox_id: str
    name: str
    description: Optional[str] = None
    creator_id: Optional[str] = None
    creator_name: Optional[str] = None
    genre: Optional[str] = None

class GameResponse(GameBase):
    id: int
    roblox_created: Optional[datetime] = None
    roblox_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    metrics: List[GameMetricResponse]

class GameListResponse(BaseModel):
    id: int
    roblox_id: str
    name: str
    creator_name: Optional[str] = None
    genre: Optional[str] = None
    roblox_created: Optional[datetime] = None
    roblox_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    visits: int
    favorites: int
    likes: int
    dislikes: int
    active_players: int

# Scraping schemas
class ScrapingStatusResponse(BaseModel):
    is_running: bool
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    total_games_scraped: int
    new_games_found: int
    scheduler_active: Optional[bool] = False

class ScrapingLogResponse(BaseModel):
    id: int
    status: str
    games_scraped: int
    new_games_found: int
    errors: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None

# Analytics schemas
class RetentionResponse(BaseModel):
    game_id: int
    game_name: str
    d1_retention: Optional[float] = None
    d7_retention: Optional[float] = None
    d30_retention: Optional[float] = None
    avg_playtime_minutes: Optional[float] = None
    total_visits: int
    unique_visitors: int

class GrowthResponse(BaseModel):
    game_id: int
    game_name: str
    growth_percent: float
    visits_growth: float
    favorites_growth: float
    likes_growth: float
    active_players_growth: float
    period_start: datetime
    period_end: datetime

class ResonanceResponse(BaseModel):
    game_id: int
    game_name: str
    overlap_percent: float
    resonance_score: float
    shared_groups: List[str]
    genre_similarity: float

class GameAnalyticsResponse(BaseModel):
    game_id: int
    game_name: str
    retention: Optional[RetentionResponse] = None
    growth: Optional[GrowthResponse] = None
    resonance: List[ResonanceResponse]
    metrics: List[GameMetricResponse]

class AnalyticsSummaryResponse(BaseModel):
    total_games: int
    total_visits: int
    total_active_players: int
    avg_d1_retention: float
    avg_growth_rate: float
    last_updated: str

 