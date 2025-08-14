# Roblox Game Analytics & Discovery Platform

A comprehensive platform for scraping, analyzing, and discovering Roblox games with real-time monitoring and trend detection.

## Features

- **Game Discovery**: Detect newly published games in near real-time
- **Growth Analysis**: Track day-over-day and week-over-week growth with precise calculations
- **Engagement Metrics**: Calculate D1, D7 retention with 3-decimal precision
- **Resonance Analysis**: Find games with similar audiences using group membership data
- **Automated Scraping**: Scheduled scraping every hour with manual override capability
- **Real-time Dashboard**: Modern React frontend with live data visualization
- **Cloud Database**: Supabase PostgreSQL integration

## Tech Stack

### Backend
- **FastAPI** (Python) - High-performance web framework
- **PostgreSQL** (Supabase) - Cloud database with connection pooling
- **SQLAlchemy** - ORM for database operations
- **Uvicorn** - ASGI server
- **Roblox API Integration** - Real-time data scraping from Roblox APIs

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Supabase account and database

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd roblox-scraping
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with your Supabase credentials
cp .env.example .env  # if you have an example file
# Or create .env manually with:
# DATABASE_URL=postgresql://username:password@host:port/database
# CORS_ORIGINS=http://localhost:3000

# Set up database
python setup_database.py
python create_indexes.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Set up environment variables (if needed)
# Create .env file with your backend API URL
```

### 4. Start Services
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## API Endpoints

### Games
- `GET /api/games` - List all games with pagination and search
- `GET /api/games/{game_id}` - Get specific game details and metrics

### Scraping
- `POST /api/scrape/start` - Start manual scraping job
- `POST /api/scrape/stop` - Stop current scraping job
- `GET /api/scrape/status` - Get scraping status and scheduler info
- `GET /api/scrape/logs` - Get scraping activity logs

### Analytics
- `GET /api/analytics/summary` - Get overall analytics summary
- `GET /api/analytics/game/{game_id}` - Get analytics for specific game
- `GET /api/analytics/resonance/{game_id}` - Get resonance analysis

## Database Schema

### Core Tables
- `games` - Game metadata (name, description, creator, Roblox dates)
- `game_metrics` - Historical metrics (visits, favorites, likes, dislikes, active players)
- `scraping_logs` - Scraping activity logs and status tracking

### Key Fields
- **Metrics**: All stored as BIGINT to handle large numbers
- **Timestamps**: UTC timestamps with proper timezone handling
- **Roblox Data**: Original creation and update dates from Roblox

## How It Works

### 1. Data Collection
- Scrapes trending games from Roblox Explore API
- Enriches game data using Roblox Games API
- Stores metrics every hour automatically

### 2. Analytics Calculation
- **Retention**: Calculated using visit patterns, engagement ratios, and growth trends
- **Growth**: Compares recent metrics vs. older metrics for realistic growth analysis
- **Resonance**: Finds similar games based on audience overlap

### 3. Scheduling
- **Manual Start**: Triggers immediate scraping and schedules hourly runs
- **Automatic**: Runs every hour from the start time
- **Rescheduling**: New manual starts cancel previous schedules and set new ones

## Deployment

### Free Deployment Options
- **Render**: Backend deployment with automatic scaling
- **Vercel**: Frontend deployment with global CDN
- **Supabase**: Database hosting with generous free tier

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## Development

### Project Structure
```
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   ├── models.py           # Database models
│   ├── analytics.py        # Analytics calculations
│   ├── scraper.py          # Roblox API integration
│   ├── tasks.py            # Scraping logic
│   └── scraping_scheduler.py # Job scheduling
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities and API calls
│   └── package.json
└── docs/                   # Documentation
```

### Key Features
- **Real-time Updates**: Auto-refresh data every 30 seconds
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful fallbacks and user feedback
- **Performance**: Optimized queries and caching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Your chosen license]

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation in `docs/` folder
- Review the deployment guide for common problems 