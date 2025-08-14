from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from database import get_db
from models import Game, GameMetric, AnalyticsCache
from schemas import (
    RetentionResponse, GrowthResponse, ResonanceResponse,
    GameAnalyticsResponse, AnalyticsSummaryResponse, GameMetricResponse
)
from sqlalchemy import desc, func, and_
from analytics import (
    calculate_retention, calculate_growth, calculate_resonance,
    get_analytics_summary
)
import datetime

router = APIRouter()

@router.get("/retention", response_model=List[RetentionResponse])
async def get_retention_analytics(
    days: int = Query(7, ge=1, le=30),
    min_visits: int = Query(1000, ge=0),
    db: Session = Depends(get_db)
):
    """Get retention analytics for games - FAST VERSION"""
    from analytics_fast import get_fast_retention_data
    return get_fast_retention_data(db, days, min_visits)

@router.get("/growth", response_model=List[GrowthResponse])
async def get_growth_analytics(
    window_days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db)
):
    """Get growth analytics for games - FAST VERSION"""
    from analytics_fast import get_fast_growth_data
    return get_fast_growth_data(db, window_days)

@router.get("/resonance/{game_id}", response_model=List[ResonanceResponse])
async def get_resonance_analysis(
    game_id: int,
    limit: int = Query(100, ge=1, le=1000),
    min_overlap: float = Query(0.01, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """Get resonance analysis for a specific game"""
    return calculate_resonance(db, game_id, limit, min_overlap)

@router.get("/game/{game_id}", response_model=GameAnalyticsResponse)
async def get_game_analytics(
    game_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics for a specific game"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get metrics for the last 30 days
    thirty_days_ago = datetime.datetime.now() - datetime.timedelta(days=30)
    metrics = db.query(GameMetric).filter(
        and_(
            GameMetric.game_id == game_id,
            GameMetric.created_at >= thirty_days_ago
        )
    ).order_by(GameMetric.created_at).all()
    
    if not metrics:
        raise HTTPException(status_code=404, detail="No metrics found for this game")
    
    # Calculate analytics
    retention_data = calculate_retention(db, 7, 0, game_id)
    growth_data = calculate_growth(db, 7, 0, game_id)
    resonance_data = calculate_resonance(db, game_id, 10, 0.01)
    
    # Convert metrics to Pydantic models
    metric_responses = []
    for metric in metrics:
        metric_responses.append(GameMetricResponse(
            id=metric.id,
            game_id=metric.game_id,
            visits=metric.visits,
            favorites=metric.favorites,
            likes=metric.likes,
            dislikes=metric.dislikes,
            active_players=metric.active_players,
            created_at=metric.created_at
        ))
    
    return GameAnalyticsResponse(
        game_id=game_id,
        game_name=game.name,
        retention=retention_data[0] if retention_data else None,
        growth=growth_data[0] if growth_data else None,
        resonance=resonance_data[:5] if resonance_data else [],
        metrics=metric_responses
    )

@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def get_analytics_summary(db: Session = Depends(get_db)):
    """Get overall analytics summary"""
    from analytics_fast import get_fast_analytics_summary
    return get_fast_analytics_summary(db)

@router.get("/games-table", response_model=List[Dict[str, Any]])
async def get_games_analytics_table(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),  # Reduced default limit
    sort_by: str = Query("visits", regex="^(name|visits|favorites|likes|dislikes|active_players|d1_retention|d7_retention|growth_percent)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get comprehensive games table with analytics for the analytics page"""
    try:
        from analytics_fast import get_fast_games_table_data
        import asyncio
        
        # Add timeout to prevent hanging
        try:
            # Run the database query with a timeout
            result = await asyncio.wait_for(
                asyncio.to_thread(get_fast_games_table_data, db, skip, limit, sort_by, sort_order),
                timeout=30.0  # 30 second timeout
            )
            return result
        except asyncio.TimeoutError:
            # If timeout occurs, return empty list
            return []
            
    except Exception as e:
        # Log error and return empty list
        print(f"Error in get_games_analytics_table: {str(e)}")
        return []

@router.get("/daily-growth-chart", response_model=List[Dict[str, Any]])
async def get_daily_growth_chart(
    game_ids: str = Query(..., description="Comma-separated list of game IDs"),
    db: Session = Depends(get_db)
):
    """Get daily growth chart data for the current displayed games"""
    try:
        from analytics_fast import get_daily_growth_chart_data
        
        # Parse game IDs from comma-separated string
        game_id_list = [int(id.strip()) for id in game_ids.split(',') if id.strip().isdigit()]
        
        if not game_id_list:
            return []
        
        # Get the daily growth data
        result = get_daily_growth_chart_data(db, game_id_list)
        return result
        
    except Exception as e:
        print(f"Error in get_daily_growth_chart: {str(e)}")
        return []

@router.get("/trending", response_model=List[GameAnalyticsResponse])
async def get_trending_games(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get trending games based on growth and engagement"""
    # Get games with highest growth in the last 7 days
    growth_data = calculate_growth(db, 7, 5.0)
    
    trending_games = []
    for growth in growth_data[:limit]:
        game = db.query(Game).filter(Game.id == growth.game_id).first()
        if game:
            retention_data = calculate_retention(db, 7, 0, growth.game_id)
            resonance_data = calculate_resonance(db, growth.game_id, 5, 0.01)
            
            trending_games.append(GameAnalyticsResponse(
                game_id=growth.game_id,
                game_name=game.name,
                retention=retention_data[0] if retention_data else None,
                growth=growth,
                resonance=resonance_data[:3] if resonance_data else [],
                metrics=[]
            ))
    
    return trending_games 