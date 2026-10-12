# Mind Sanctuary — Deployment Guide

## Architecture
- **Frontend** → Vercel (free tier)
- **Backend** → Railway (free tier)

---

## Step 1 — Deploy the Backend to Railway

1. Go to [railway.app](https://railway.app) and log in
2. Click **New Project → Deploy from GitHub repo**
3. Connect your GitHub account and select this repo
4. Set the **Root Directory** to `backend`
5. Railway will auto-detect Node.js and use `node src/index.js`

### Set Environment Variables on Railway:
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `ELEVENLABS_API_KEY` | your ElevenLabs key |
| `CLAUDE_API_KEY` | your Anthropic key |
| `REPLICATE_API_TOKEN` | your Replicate token |
| `FRONTEND_URL` | your Vercel URL (set after step 2) |
| `DB_PATH` | `/data/mindwell.db` (if using a volume) |

### Add a Volume (recommended — keeps data between deployments):
1. In your Railway project → **Add Volume**
2. Mount path: `/data`
3. Set `DB_PATH=/data/mindwell.db` in environment variables

6. Note your Railway URL: `https://your-app.railway.app`

---

## Step 2 — Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **New Project → Import Git Repository**
3. Set the **Root Directory** to `frontend`
4. Framework preset: **Vite**

### Set Environment Variables on Vercel:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-app.railway.app` (from step 1) |

5. Deploy → note your Vercel URL: `https://your-app.vercel.app`

---

## Step 3 — Connect them

1. Go back to Railway → update `FRONTEND_URL` to your Vercel URL
2. Redeploy the backend (Railway does this automatically on env var changes)

---

## Sending to Beta Testers

Share the Vercel URL. First-time visitors will see the setup screen and create their own profile. Each device gets its own account stored in localStorage + the backend.

**Note:** The file-based database resets if the Railway container restarts without a Volume. For beta testing, add a Volume as described above.

---

## Local Development

```bash
# Terminal 1 — backend
cd backend && npm start

# Terminal 2 — frontend  
cd frontend && npm run dev
```

Frontend runs on http://localhost:5180, backend on http://localhost:3002.
