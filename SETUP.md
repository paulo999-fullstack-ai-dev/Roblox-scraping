# Roblox Analytics Platform Setup Guide

This guide will help you set up the complete Roblox analytics platform with backend API, frontend dashboard, and automated scraping.

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Redis server (for Celery)
- PostgreSQL database (Supabase)

## Quick Start (Windows)

1. **Clone and navigate to the project**
   ```bash
   cd "Roblox scraping"
   ```

2. **Run the startup script**
   ```bash
   start.bat
   ```

This will automatically start all services in separate terminals.

## Manual Setup

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
copy env.example .env

# Edit .env file with your database URL
# DATABASE_URL=postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres

# Start the backend API
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### 3. Celery Setup (Background Tasks)

```bash
cd backend

# Start Celery worker (in a new terminal)
celery -A main.celery worker --loglevel=info

# Start Celery beat scheduler (in another terminal)
celery -A main.celery beat --loglevel=info
```

### 4. Redis Setup

You need Redis running for Celery. Install Redis or use Docker:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install Redis locally
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt-get install redis-server
```

## Database Setup

The application uses Supabase PostgreSQL. The connection string is already configured:

```
DATABASE_URL=postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres
```

The database tables will be created automatically when you start the backend.

## Features

### Backend API
- **FastAPI** with automatic API documentation
- **PostgreSQL** database with Supabase
- **Celery** for background task scheduling
- **Roblox scraping** with rate limiting
- **Analytics engine** for retention, growth, and resonance analysis

### Frontend Dashboard
- **React 18** with TypeScript
- **Tailwind CSS** for modern UI
- **Recharts** for data visualization
- **React Query** for data fetching
- **Real-time updates** with auto-refresh

### Key Features
- **Game Discovery**: Detect newly published games
- **Growth Analysis**: Track day-over-day and week-over-week growth
- **Retention Metrics**: Calculate D1, D7 retention
- **Resonance Analysis**: Find games with similar audiences
- **Automated Scraping**: Runs every hour
- **Real-time Dashboard**: Live monitoring and control

## API Endpoints

### Games
- `GET /api/games` - List all games with filtering and sorting
- `GET /api/games/{id}` - Get specific game details
- `GET /api/games/roblox/{roblox_id}` - Get game by Roblox ID

### Scraping
- `POST /api/scrape/start` - Manually trigger scraping
- `GET /api/scrape/status` - Get current scraping status
- `GET /api/scrape/logs` - Get scraping logs

### Analytics
- `GET /api/analytics/retention` - Get retention analytics
- `GET /api/analytics/growth` - Get growth analytics
- `GET /api/analytics/resonance/{game_id}` - Get resonance analysis
- `GET /api/analytics/summary` - Get overall analytics summary
- `GET /api/analytics/trending` - Get trending games

## Dashboard Pages

1. **Dashboard** (`/`) - Overview with key metrics and status
2. **Games** (`/games`) - Browse and search all games
3. **Analytics** (`/analytics`) - Deep dive into retention and growth
4. **Scraping** (`/scraping`) - Control and monitor scraping process
5. **Game Detail** (`/games/{id}`) - Individual game analysis

## Configuration

### Environment Variables (backend/.env)

```env
# Database
DATABASE_URL=postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres

# Redis (for Celery)
REDIS_URL=redis://localhost:6379

# Scraping Settings
SCRAPE_INTERVAL_HOURS=1
MAX_CONCURRENT_SCRAPES=5
REQUEST_DELAY_SECONDS=1

# Analytics Settings
RETENTION_DAYS=[1, 7, 30]
GROWTH_WINDOW_DAYS=7
RESONANCE_THRESHOLD=0.1
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your DATABASE_URL in backend/.env
   - Check if Supabase is accessible

2. **Redis Connection Error**
   - Make sure Redis is running on localhost:6379
   - Install Redis or use Docker

3. **Celery Worker Not Starting**
   - Check if Redis is running
   - Verify Celery configuration in celery_app.py

4. **Frontend Not Loading**
   - Check if backend is running on port 8000
   - Verify proxy configuration in vite.config.ts

5. **Scraping Not Working**
   - Check scraping logs in the Scraping page
   - Verify Roblox API access (currently using sample data)

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `backend/routers/`
2. **Frontend**: Add new pages in `frontend/src/pages/`
3. **Analytics**: Add new calculations in `backend/analytics.py`
4. **Scraping**: Extend `backend/scraper.py` for new data sources

### Database Migrations

The application uses SQLAlchemy with automatic table creation. For schema changes:

1. Update models in `backend/models.py`
2. Restart the backend to apply changes

### Real Roblox Integration

Currently, the scraper uses sample data. To integrate with real Roblox:

1. Update `backend/scraper.py` with actual Roblox API calls
2. Implement proper rate limiting and error handling
3. Add authentication if required by Roblox API

## Production Deployment

For production deployment:

1. **Backend**: Deploy to cloud platform (Heroku, AWS, etc.)
2. **Frontend**: Build and deploy to CDN
3. **Database**: Use managed PostgreSQL service
4. **Redis**: Use managed Redis service
5. **Celery**: Use cloud task queue service

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation at http://localhost:8000/docs
3. Check the console logs for error messages

## License

MIT License - feel free to modify and distribute. 