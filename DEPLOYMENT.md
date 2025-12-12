# Deployment Guide

This guide covers deploying the AI Drawing Station app with a split architecture:
- **Frontend**: Vercel (or similar static hosting)
- **Backend**: Railway, Render, Fly.io, or similar Node.js hosting

## Architecture Overview

The app uses WebSocket for real-time tablet/desktop communication. When deploying separately:
- Frontend connects to the backend via environment variables
- Backend handles API routes and WebSocket connections
- CORS is configured to allow cross-origin requests

## Environment Variables

### Frontend (Vercel)

Set these in your Vercel project settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.railway.app` |
| `VITE_WS_URL` | WebSocket URL | `wss://your-backend.railway.app/ws` |

### Backend (Railway/Render/Fly.io)

Set these in your backend hosting platform:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (usually auto-set) | `3000` |
| `NODE_ENV` | Environment | `production` |
| `API_ONLY` | Skip static file serving | `true` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://your-app.vercel.app` |

## Deployment Steps

### 1. Deploy Backend First

#### Option A: Railway

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the root directory to project root
4. Add environment variables:
   - `API_ONLY=true`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
5. Railway will auto-detect Node.js and run `npm start`
6. Note your backend URL (e.g., `https://your-app.railway.app`)

#### Option B: Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables as above
6. Note your service URL

#### Option C: Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in your project directory
3. Set secrets:
   ```bash
   fly secrets set API_ONLY=true
   fly secrets set ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
4. Deploy: `fly deploy`

### 2. Deploy Frontend to Vercel

1. Create a new Vercel project
2. Connect your GitHub repository
3. Set the framework to "Vite"
4. Set root directory to `client` (or leave as root if using vercel.json)
5. Add environment variables:
   - `VITE_API_BASE_URL=https://your-backend-url.railway.app`
   - `VITE_WS_URL=wss://your-backend-url.railway.app/ws`
6. Deploy

### 3. Update Backend CORS

After Vercel deployment, update your backend's `ALLOWED_ORIGINS` to include your Vercel URL.

## Testing the Deployment

1. Open the frontend URL in a browser
2. Check browser console for WebSocket connection
3. Test tablet and desktop modes:
   - Desktop: `https://your-app.vercel.app?mode=desktop`
   - Tablet: `https://your-app.vercel.app?mode=tablet`
4. Verify real-time sync between tablet and desktop views

## Troubleshooting

### WebSocket Connection Failed

- Ensure `VITE_WS_URL` uses `wss://` (not `ws://`) for HTTPS sites
- Check backend logs for WebSocket upgrade requests
- Verify CORS allows your frontend origin

### CORS Errors

- Add your Vercel domain to `ALLOWED_ORIGINS`
- Include `https://` prefix in the origin

### API Requests Failing

- Verify `VITE_API_BASE_URL` is set correctly
- Check network tab for the actual request URL
- Ensure backend health endpoint works: `GET /health`

## Local Development with Split Setup

To test the split setup locally:

1. Start backend:
   ```bash
   API_ONLY=true PORT=3001 npm run dev
   ```

2. In another terminal, start frontend only:
   ```bash
   cd client
   VITE_API_BASE_URL=http://localhost:3001 VITE_WS_URL=ws://localhost:3001/ws npm run dev
   ```

## Health Check

The backend exposes a health endpoint for monitoring:

```
GET /health
Response: { "status": "ok", "timestamp": "2024-..." }
```

Use this for deployment platform health checks and uptime monitoring.
