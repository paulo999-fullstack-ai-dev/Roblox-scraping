@echo off
echo 🚀 Roblox Analytics Platform - Deployment Helper
echo ================================================

echo.
echo 📋 Choose deployment option:
echo 1. Deploy to Render (Recommended - FREE)
echo 2. Deploy to Railway
echo 3. Deploy to Vercel
echo 4. Quick local test with ngrok
echo 5. Exit

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto render
if "%choice%"=="2" goto railway
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto ngrok
if "%choice%"=="5" goto exit
goto invalid

:render
echo.
echo 🌟 Render Deployment (FREE)
echo ===========================
echo.
echo 1. Go to https://render.com and sign up with GitHub
echo 2. Click "New +" → "Web Service"
echo 3. Connect your GitHub repository
echo 4. Use the render.yaml file in this directory
echo 5. Deploy both backend and frontend
echo.
echo Your app will be available at:
echo - Backend: https://roblox-analytics-backend.onrender.com
echo - Frontend: https://roblox-analytics-frontend.onrender.com
echo.
pause
goto exit

:railway
echo.
echo 🚂 Railway Deployment
echo =====================
echo.
echo 1. Go to https://railway.app and sign up
echo 2. Connect your GitHub repository
echo 3. Deploy backend first, then frontend
echo 4. Set environment variables manually
echo.
pause
goto exit

:vercel
echo.
echo 🌐 Vercel Deployment
echo ====================
echo.
echo 1. Go to https://vercel.com and sign up
echo 2. Import your GitHub repository
echo 3. Deploy frontend as Vite app
echo 4. Deploy backend separately
echo.
pause
goto exit

:ngrok
echo.
echo 📱 Quick Local Test with ngrok
echo ===============================
echo.
echo 1. Download ngrok from https://ngrok.com
echo 2. Extract to a folder in your PATH
echo 3. Start your backend: cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
echo 4. In another terminal: ngrok http 8000
echo 5. Share the ngrok URL with your client
echo.
echo Note: This is temporary and will expire
echo.
pause
goto exit

:invalid
echo.
echo ❌ Invalid choice. Please enter 1-5.
echo.
pause
goto exit

:exit
echo.
echo 👋 Good luck with your deployment!
echo.
pause 