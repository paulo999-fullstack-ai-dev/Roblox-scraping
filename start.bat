@echo off
echo Starting Roblox Analytics Platform...
echo.

echo 1. Starting Backend API...
cd backend
start "Backend API" cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..

echo 2. Starting Frontend Development Server...
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"
cd ..

echo 3. Starting Celery Worker (in new terminal)...
cd backend
start "Celery Worker" cmd /k "celery -A main.celery worker --loglevel=info"
cd ..

echo 4. Starting Celery Beat Scheduler (in new terminal)...
cd backend
start "Celery Beat" cmd /k "celery -A main.celery beat --loglevel=info"
cd ..

echo.
echo All services are starting...
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause > nul 