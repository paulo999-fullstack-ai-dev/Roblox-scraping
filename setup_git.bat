@echo off
echo Setting up Git repository for Roblox Scraping Platform...
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo Error: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

REM Check if already a git repository
if exist ".git" (
    echo Repository already exists. Current status:
    git status
    echo.
    echo To add all files and commit:
    echo git add .
    echo git commit -m "Initial commit"
    pause
    exit /b 0
)

REM Initialize git repository
echo Initializing Git repository...
git init

REM Add all files
echo Adding all files...
git add .

REM Make initial commit
echo Making initial commit...
git commit -m "Initial commit: Roblox Game Analytics & Discovery Platform

- FastAPI backend with Roblox API integration
- React frontend with real-time analytics dashboard
- Automated scraping scheduler with hourly runs
- Supabase PostgreSQL database integration
- Comprehensive analytics (retention, growth, resonance)
- Free deployment guides for Render, Railway, and Vercel"

echo.
echo Git repository initialized successfully!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Add the remote origin: git remote add origin YOUR_REPO_URL
echo 3. Push to GitHub: git push -u origin main
echo.
echo Repository URL format: https://github.com/username/repository-name
echo.
pause 