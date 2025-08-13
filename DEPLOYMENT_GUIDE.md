# 🚀 Free Deployment Guide for Roblox Analytics Platform

This guide will show you how to deploy the Roblox Analytics Platform for **FREE** so your client can review it.

## 🌟 Free Deployment Options

### Option 1: Render (Recommended - Completely Free)
**Best for:** Full-stack applications with database
**Free Tier:** 750 hours/month, auto-sleep after 15 minutes of inactivity

### Option 2: Railway
**Best for:** Quick deployment with database
**Free Tier:** $5 credit monthly (usually enough for small projects)

### Option 3: Vercel + Supabase
**Best for:** Frontend + Database separation
**Free Tier:** Vercel (unlimited), Supabase (500MB database, 2GB bandwidth)

## 🎯 Recommended: Render Deployment (100% Free)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/roblox-analytics.git
git push -u origin main
```

2. **Create a `render.yaml` file in your root directory:**
```yaml
services:
  - type: web
    name: roblox-analytics-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        value: postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres
      - key: DEBUG
        value: false
      - key: CORS_ORIGINS
        value: "*"
      - key: REQUEST_DELAY_SECONDS
        value: 0.2

  - type: web
    name: roblox-analytics-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://your-backend-name.onrender.com
```

### Step 2: Deploy on Render

1. **Go to [render.com](https://render.com) and sign up with GitHub**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `roblox-analytics-backend`
   - **Environment:** Python
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

5. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres
   DEBUG=false
   CORS_ORIGINS=*
   REQUEST_DELAY_SECONDS=0.2
   ```

6. **Deploy the frontend as a separate static site:**
   - **Name:** `roblox-analytics-frontend`
   - **Environment:** Static Site
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`

### Step 3: Update Frontend Configuration

Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
```

Update `frontend/src/lib/api.ts`:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://your-backend-name.onrender.com',
  timeout: 600000,
})
```

## 🚀 Alternative: Railway Deployment

### Step 1: Deploy Backend
1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Create new project → Deploy from GitHub repo**
4. **Set environment variables:**
   ```
   DATABASE_URL=postgresql://postgres:Roblox500$@db.hkgastbktxpqqxbpokmy.supabase.co:5432/postgres
   DEBUG=false
   CORS_ORIGINS=*
   ```

### Step 2: Deploy Frontend
1. **Create another service for frontend**
2. **Build Command:** `cd frontend && npm install && npm run build`
3. **Output Directory:** `frontend/dist`

## 🌐 Alternative: Vercel + Supabase

### Step 1: Deploy Frontend on Vercel
1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Framework Preset:** Vite
4. **Root Directory:** `frontend`
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`

### Step 2: Deploy Backend on Vercel
1. **Create `vercel.json` in backend folder:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

2. **Deploy backend as separate project**

## 📱 Quick Test Deployment (5 minutes)

### Option A: Local Network Sharing
1. **Get your local IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. **Update backend config:**
   ```python
   # backend/config.py
   CORS_ORIGINS: List[str] = ["http://YOUR_IP:3001", "http://YOUR_IP:3000", "*"]
   ```

3. **Start services:**
   ```bash
   # Terminal 1 - Backend
   cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev -- --host 0.0.0.0
   ```

4. **Share the frontend URL:** `http://YOUR_IP:3001`

### Option B: ngrok (Temporary Public URL)
1. **Install ngrok:** Download from [ngrok.com](https://ngrok.com)
2. **Expose backend:**
   ```bash
   ngrok http 8000
   ```
3. **Update CORS in backend:**
   ```python
   CORS_ORIGINS: List[str] = ["https://YOUR_NGROK_URL.ngrok.io", "*"]
   ```
4. **Share the ngrok URL with your client**

## 🔧 Pre-deployment Checklist

### Backend
- [ ] All imports are correct
- [ ] Database connection works
- [ ] CORS is configured for production
- [ ] Environment variables are set
- [ ] No hardcoded localhost URLs

### Frontend
- [ ] API base URL is configurable
- [ ] Build process works locally
- [ ] No hardcoded localhost URLs
- [ ] Error handling is robust

### Database
- [ ] Supabase connection is working
- [ ] Tables are created
- [ ] Sample data exists for testing

## 🚨 Common Issues & Solutions

### Issue: CORS errors
**Solution:** Update `CORS_ORIGINS` to include your frontend URL

### Issue: Database connection fails
**Solution:** Check if Supabase allows external connections

### Issue: Frontend can't connect to backend
**Solution:** Verify the API URL in frontend configuration

### Issue: Build fails
**Solution:** Check if all dependencies are in `requirements.txt` and `package.json`

## 📊 Performance Optimization

### Backend
- Add caching headers
- Implement rate limiting
- Use connection pooling

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading

## 🔒 Security Considerations

1. **Environment Variables:** Never commit secrets to Git
2. **CORS:** Restrict to specific domains in production
3. **Rate Limiting:** Implement API rate limiting
4. **Input Validation:** Validate all user inputs

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test locally first
4. Check browser console for errors

## 🎉 Success!

Once deployed, your client can access:
- **Frontend:** `https://your-app-name.onrender.com`
- **Backend API:** `https://your-backend-name.onrender.com`

The platform will be accessible 24/7 and automatically scale based on usage!

---

**Recommended for your client:** Use the **Render deployment** option as it's completely free and provides both backend and frontend hosting with automatic scaling. 