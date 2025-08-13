# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with FastAPI backend and React frontend
- Roblox API integration for game discovery and metrics
- Automated scraping scheduler with hourly runs
- Analytics calculation (retention, growth, resonance)
- Real-time dashboard with charts and metrics
- Supabase PostgreSQL database integration
- Comprehensive deployment guide for free hosting

### Changed
- Improved retention calculation algorithm for more accurate results
- Enhanced growth analysis with proper positive/negative calculations
- Fixed scheduler timing to run from start time, not end time
- Updated chart display to show exact timestamps
- Improved error handling and user feedback

### Fixed
- Duplicate scraping job creation issue
- Timezone handling for database timestamps
- Chart axis direction (dates now increase left to right)
- Growth analysis data availability for games with limited history
- Retention calculation monotony (different values for different games)

## [1.0.0] - 2024-08-13

### Added
- Core scraping functionality for Roblox trending games
- Game metrics tracking (visits, favorites, likes, dislikes, active players)
- Analytics dashboard with retention and growth metrics
- Game details page with historical data visualization
- Search and filtering capabilities
- Responsive design for mobile and desktop

### Technical Features
- FastAPI backend with automatic API documentation
- React frontend with TypeScript and Tailwind CSS
- PostgreSQL database with connection pooling
- Automated job scheduling with manual override
- Real-time data updates and caching 