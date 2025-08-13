from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Game, GameMetric
from schemas import GameResponse, GameListResponse, GameMetricResponse
from sqlalchemy import desc, func
import datetime

router = APIRouter()

@router.get("/", response_model=List[GameListResponse])
async def get_games(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    search: Optional[str] = None,
    sort_by: str = Query("updated_at", regex="^(name|visits|favorites|likes|dislikes|active_players|roblox_created|roblox_updated|created_at|updated_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Get list of games with optional filtering and sorting"""
    query = db.query(Game)
    
    if search and search.strip():
        query = query.filter(Game.name.ilike(f"%{search.strip()}%"))
    
    # Add sorting
    if sort_order == "desc":
        query = query.order_by(desc(getattr(Game, sort_by)))
    else:
        query = query.order_by(getattr(Game, sort_by))
    
    games = query.offset(skip).limit(limit).all()
    
    # Get latest metrics for each game
    result = []
    for game in games:
        latest_metric = db.query(GameMetric).filter(
            GameMetric.game_id == game.id
        ).order_by(desc(GameMetric.created_at)).first()
        
        game_data = GameListResponse(
            id=game.id,
            roblox_id=game.roblox_id,
            name=game.name,
            creator_name=game.creator_name,
            genre=game.genre,
            roblox_created=game.roblox_created,
            roblox_updated=game.roblox_updated,
            created_at=game.created_at,
            updated_at=game.updated_at,
            visits=latest_metric.visits if latest_metric else 0,
            favorites=latest_metric.favorites if latest_metric else 0,
            likes=latest_metric.likes if latest_metric else 0,
            dislikes=latest_metric.dislikes if latest_metric else 0,
            active_players=latest_metric.active_players if latest_metric else 0
        )
        result.append(game_data)
    
    return result

@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: Session = Depends(get_db)):
    """Get specific game details"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get all metrics for this game
    metrics = db.query(GameMetric).filter(
        GameMetric.game_id == game_id
    ).order_by(desc(GameMetric.created_at)).all()
    
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
    
    return GameResponse(
        id=game.id,
        roblox_id=game.roblox_id,
        name=game.name,
        description=game.description,
        creator_id=game.creator_id,
        creator_name=game.creator_name,
        genre=game.genre,
        roblox_created=game.roblox_created,
        roblox_updated=game.roblox_updated,
        created_at=game.created_at,
        updated_at=game.updated_at,
        metrics=metric_responses
    )

@router.get("/roblox/{roblox_id}", response_model=GameResponse)
async def get_game_by_roblox_id(roblox_id: str, db: Session = Depends(get_db)):
    """Get game by Roblox ID"""
    game = db.query(Game).filter(Game.roblox_id == roblox_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Get all metrics for this game
    metrics = db.query(GameMetric).filter(
        GameMetric.game_id == game.id
    ).order_by(desc(GameMetric.created_at)).all()
    
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
    
    return GameResponse(
        id=game.id,
        roblox_id=game.roblox_id,
        name=game.name,
        description=game.description,
        creator_id=game.creator_id,
        creator_name=game.creator_name,
        genre=game.genre,
        roblox_created=game.roblox_created,
        roblox_updated=game.roblox_updated,
        created_at=game.created_at,
        updated_at=game.updated_at,
        metrics=metric_responses
    ) 