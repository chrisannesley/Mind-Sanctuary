# Beast Companion - Standalone Quick Reference

**Status**: Ready to deploy as independent app ✅

---

## Running Standalone Locally (2 minutes)

### Terminal 1: Backend
```bash
cd d:\mindwell-app\backend
npm start
# Output: ✅ Beast Companion backend running on http://localhost:3003
```

### Terminal 2: Frontend (Standalone Mode)
```bash
cd d:\mindwell-app\frontend
npm run dev:standalone
# Output: VITE v4.x.x ready in XXX ms
#         ➜ Local: http://localhost:5181/
```

### Access App
```
http://localhost:5181
```

That's it! Standalone app is running.

---

## Switching Between Modes

### Integrated Mode (with Mind Sanctuary)
```bash
# Terminal 1: Backend (shared with Mind Sanctuary)
cd d:\mindwell-app\backend
npm start
# Port 3002

# Terminal 2: Frontend (full Mind Sanctuary app)
cd d:\mindwell-app\frontend
npm run dev
# Port 5180 → /beasts is one section
```

### Standalone Mode (Beast Companion only)
```bash
# Terminal 1: Backend (dedicated)
cd d:\mindwell-app\backend
npm start
# Port 3003 (change in .env)

# Terminal 2: Frontend (standalone)
cd d:\mindwell-app\frontend
npm run dev:standalone
# Port 5181 → / is Beast Companion app
```

---

## File Structure for Standalone

```
d:\mindwell-app\

backend/
├── src/
│   ├── index.js (listens on 3003 for standalone)
│   ├── models/Beast.js
│   └── routes/beasts.js
├── data/
│   └── beasts.json (stores all beasts)
└── .env (standalone: PORT=3003)

frontend/
├── src/
│   ├── AppStandalone.jsx (NEW - standalone entry)
│   ├── mainStandalone.jsx (NEW - standalone import)
│   ├── App.jsx (integrated with Mind Sanctuary)
│   ├── pages/Beasts.jsx
│   ├── components/BeastCompanion.jsx
│   └── ...
├── vite-standalone.config.js (NEW - standalone config)
├── vite.config.js (integrated config)
└── package.json (has dev:standalone script)

Documentation/
├── beast-companion-standalone/README.md
├── beast-companion-standalone/STANDALONE_SETUP.md
├── beast-companion-standalone/DEPLOYMENT.md
└── STANDALONE_QUICK_REFERENCE.md (this file)
```

---

## Standalone Backend Configuration

### .env for Standalone
```
PORT=3003
FRONTEND_URL=http://localhost:5181
NODE_ENV=development
```

### Current Settings (for reference)
- Integrated: PORT=3002, FRONTEND_URL=http://localhost:5180
- Standalone: PORT=3003, FRONTEND_URL=http://localhost:5181

---

## Standalone Frontend Configuration

### vite-standalone.config.js
```javascript
export default defineConfig({
  server: {
    port: 5181,
    strictPort: true
  }
})
```

### AppStandalone.jsx
- Clean header with Beast Companion branding
- Directly renders Beasts page (no navigation)
- Single userId (can add login later)

### npm Scripts
```
npm run dev:standalone         # Run on 5181
npm run build:standalone      # Build for standalone deployment
```

---

## Deployment Paths

### Standalone Deployment (Recommended for Beast Companion as own app)

**Step 1: Backend**
```bash
# Option A: Heroku
heroku create beast-companion-api
heroku config:set PORT=3003
git push heroku main

# Option B: Railway.app
# Create new project, select GitHub repo, auto-deploys

# Option C: Your own VPS
scp -r backend/ user@server:/app/beast-backend
ssh user@server "cd /app/beast-backend && npm install && npm start"
```

**Step 2: Frontend**
```bash
# Option A: Vercel
npm run build:standalone
vercel deploy --prod --scope=your-scope

# Option B: Netlify
netlify deploy --prod --dir=dist

# Option C: Your own VPS
npm run build:standalone
scp -r dist/ user@server:/var/www/beast-frontend
# Configure nginx to serve dist/
```

**Step 3: Connect**
```
Frontend: https://beastcompanion.app
Backend: https://api.beastcompanion.app
Environment: VITE_API_URL=https://api.beastcompanion.app
```

---

### Integrated Deployment (If using with Mind Sanctuary)

**Same backend, integrated frontend:**
```bash
# Deploy entire Mind Sanctuary
npm run build
# Frontend includes /beasts route
# Backend serves both /api/reflection and /api/beasts
```

---

## Environment Setup

### Development
```
Backend: http://localhost:3003
Frontend: http://localhost:5181
API calls: http://localhost:3003/api/beasts/
```

### Production (Standalone)
```
Backend: https://api.beastcompanion.app
Frontend: https://beastcompanion.app
API calls: https://api.beastcompanion.app/api/beasts/
```

### .env.local (Frontend)
```
VITE_API_URL=https://api.beastcompanion.app
```

---

## Key Differences

| Aspect | Integrated | Standalone |
|--------|-----------|-----------|
| **Backend Port** | 3002 | 3003 |
| **Frontend Port** | 5180 | 5181 |
| **Entry Point** | App.jsx + Navigation | AppStandalone.jsx |
| **Data** | Shared with Mind Sanctuary | Isolated in beasts.json |
| **Deployment** | Single app | Two separate deploys |
| **Users** | Shared user system | Independent users |
| **Users See** | /beasts is one feature | / is the entire app |

---

## API for Both Modes

The API is **identical** in both modes:

```
GET  /api/beasts/1               # Get all beasts for user 1
GET  /api/beasts/1/current       # Get active beast
POST /api/beasts/1/generate      # Generate new beast
PUT  /api/beasts/{id}/care/feed  # Feed beast
```

Only difference: Backend port (3002 vs 3003)

---

## Testing Standalone

### Quick Test
```bash
# 1. Start backend
npm start  # in backend folder

# 2. In another terminal, test API
curl http://localhost:3003/health
# Should return: {"status":"ok","message":"..."}

# 3. Start frontend
npm run dev:standalone  # in frontend folder

# 4. Go to http://localhost:5181
# 5. Click "Generate Your First Beast"
# 6. Should see new beast appear
```

### Full Test
- [ ] Generate beast
- [ ] Feed beast
- [ ] Play with beast
- [ ] Check care log
- [ ] View gallery
- [ ] Refresh page (data persists)
- [ ] No console errors

---

## Running Both Modes Simultaneously

You can run **both integrated AND standalone** at the same time:

```bash
# Terminal 1: Integrated Backend (3002)
cd backend
PORT=3002 npm start

# Terminal 2: Integrated Frontend (5180)
cd frontend
npm run dev

# Terminal 3: Standalone Frontend (5181)
cd frontend
npm run dev:standalone

# Now you have:
# - Mind Sanctuary at http://localhost:5180 (includes /beasts)
# - Beast Companion at http://localhost:5181 (standalone)
# - Both use same backend API (handled by routes)
```

Both work independently without conflicts!

---

## Switching Production

### Currently Integrated?
To make standalone in production:

1. Deploy backend to new server/service
2. Deploy frontend standalone version to separate domain
3. Update DNS/routing
4. No code changes needed (just different deployment)

### Want to Combine Later?
To make integrated in production:

1. Keep same backend (it handles both)
2. Deploy integrated frontend
3. Users see /beasts within Mind Sanctuary
4. No data changes needed

---

## Common Issues

### "Cannot GET /api/beasts" 
Backend not running. Use: `npm start` in backend folder

### Frontend won't load
Check port (5181 for standalone) and environment variables

### Data not persisting
Ensure `backend/data/` directory exists and is writable

### CORS errors
Check FRONTEND_URL in backend .env matches frontend URL

---

## Next Steps

### To Deploy Standalone Today
1. Ensure backend running on port 3003
2. Run `npm run dev:standalone` in frontend
3. Access at http://localhost:5181
4. Ready for production deployment

### To Add Features Later
- User authentication/login
- Real AI-generated images
- Breeding system
- Social features
- Mobile app

### To Integrate with Mind Sanctuary
1. Add route: `<Route path="/beasts" element={<Beasts />} />`
2. Add nav link: `{ path: '/beasts', label: 'Beasts', icon: '🐉' }`
3. Deploy integrated frontend
4. Done!

---

**Status**: Standalone ready ✅  
**Current Setup**: Local development  
**Next Step**: Choose deployment method above

🚀 **Let's ship this!**
