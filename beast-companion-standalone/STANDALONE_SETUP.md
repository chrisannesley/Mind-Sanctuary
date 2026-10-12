# Beast Companion Standalone Setup

This document explains how to run Beast Companion as a completely independent application.

---

## What is Standalone?

Standalone Beast Companion is a **self-contained app** that:
- Runs independently (not integrated into Mind Sanctuary)
- Has its own backend (port 3003)
- Has its own frontend (port 5181)
- Manages its own user data
- Can be deployed as separate app or to its own server

---

## Quick Start (5 minutes)

### 1. Backend Setup
```bash
# Navigate to backend
cd d:\mindwell-app\backend

# Already has all files, just start it:
npm start

# Should see: ✅ Beast Companion backend running on http://localhost:3003
```

### 2. Frontend Setup
```bash
# In new terminal, navigate to frontend
cd d:\mindwell-app\frontend

# Modify to use standalone port:
# Edit vite.config.js - change port to 5181

# Start frontend
npm run dev

# Should see: VITE v4.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5181/
```

### 3. Access the App
```
http://localhost:5181
```

---

## Configuration for Standalone

### Backend (.env)
```
PORT=3003
FRONTEND_URL=http://localhost:5181
NODE_ENV=development
```

### Frontend (vite.config.js)
```javascript
export default {
  server: {
    port: 5181,
    strictPort: true
  }
}
```

---

## Key Differences: Integrated vs Standalone

### Integrated (Mind Sanctuary)
- Backend: Same as Mind Sanctuary (port 3002)
- Frontend: Shared Mind Sanctuary app
- Data: Shared user database
- Routes: /beasts within Mind Sanctuary
- Users: Share Mind Sanctuary users

### Standalone (Beast Companion)
- Backend: Dedicated server (port 3003)
- Frontend: Dedicated app (port 5181)
- Data: Independent beasts.json
- Routes: / is the main beast page
- Users: Independent user system

---

## Standalone Frontend Structure

The standalone version should have:

```
frontend/src/
├── App.jsx (Beast Companion main app)
├── pages/
│   └── Beasts.jsx (main page)
├── components/
│   └── BeastCompanion.jsx (core component)
├── styles/
│   └── index.css
└── main.jsx (entry point)
```

### App.jsx for Standalone
```jsx
import React, { useState } from 'react'
import Beasts from './pages/Beasts'

function App() {
  const [userId] = useState(1) // Single user or login system

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <Beasts userId={userId} />
    </div>
  )
}

export default App
```

---

## Creating Standalone Frontend from Mind Sanctuary

If you want to create a completely separate frontend folder:

### Option 1: Copy and Modify
```bash
# Copy the frontend
cp -r d:\mindwell-app\frontend d:\Beast Companion App\frontend

# Modify:
# 1. Change port in vite.config.js to 5181
# 2. Update API URLs to http://localhost:3003
# 3. Simplify App.jsx to remove Mind Sanctuary navigation
# 4. Remove unneeded components (just keep Beasts)
```

### Option 2: Minimal Standalone
Create a minimal app:

```jsx
// App.jsx - Standalone Beast Companion
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Beasts from './pages/Beasts'

function App() {
  const [userId] = useState(1)

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<Beasts userId={userId} />} />
          <Route path="*" element={<Beasts userId={userId} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

---

## API Configuration

### Standalone Backend
- Base URL: `http://localhost:3003`
- Endpoints: Same as integrated version

### Frontend API Calls
```javascript
// Use this in standalone
const API_BASE = process.env.VITE_API_URL || 'http://localhost:3003'

// Example call
fetch(`${API_BASE}/api/beasts/1/generate`, { method: 'POST' })
```

### Environment Variable
Create `.env.local` in frontend:
```
VITE_API_URL=http://localhost:3003
```

---

## Data Management

### Standalone Data Storage
- Location: `backend/data/beasts.json`
- Size: ~1KB per beast
- Isolated: Separate from Mind Sanctuary

### User Management
Currently uses simple userId (1, 2, 3...):
```javascript
// Simple user ID
const userId = 1

// Or add basic login:
const [userId, setUserId] = useState(null)
```

### Exporting Data
```bash
# Backup all beasts
cp backend/data/beasts.json backup-beasts.json

# Share beasts file
# Just send beasts.json to another standalone instance
```

---

## Deployment: Standalone vs Integrated

### Deploy as Standalone
**Heroku/Railway:**
```bash
# Deploy backend
git push heroku backend-main

# Deploy frontend (to Vercel/Netlify)
npm run build
# Deploy dist/ folder
```

**Environment:**
```
Backend: https://beast-api.herokuapp.com
Frontend: https://beastcompanion.vercel.app
```

### Deploy as Integrated
```bash
# Deploy entire Mind Sanctuary app
# Backend handles both /api/beasts and other endpoints
# Frontend is at main Mind Sanctuary URL
```

---

## Standalone vs Integrated: Which to Choose?

### Choose **Standalone** if:
✅ Want independent deployment  
✅ Targeting non-wellness users  
✅ Plan separate marketing/domain  
✅ Need independent scaling  
✅ Want to license as separate app  

### Choose **Integrated** if:
✅ Focus on mental health users  
✅ Want unified user experience  
✅ Share backend infrastructure  
✅ Simpler deployment  
✅ Cross-feature analytics  

---

## Running Both Simultaneously

You can run integrated AND standalone at same time:

```bash
# Terminal 1: Mind Sanctuary Backend
cd d:\mindwell-app\backend
npm start
# Port 3002, has both /api/reflection and /api/beasts

# Terminal 2: Standalone Beast Backend
# (if separate folder, cd there)
# Runs on port 3003, only has /api/beasts

# Terminal 3: Mind Sanctuary Frontend
cd d:\mindwell-app\frontend
npm run dev
# Port 5180

# Terminal 4: Standalone Frontend
# (if separate folder, cd there)
npm run dev
# Port 5181
```

Both work independently without interfering!

---

## Converting Between Modes

### Integrated → Standalone
1. Copy backend to separate folder
2. Remove Mind Sanctuary routes
3. Create standalone frontend
4. Deploy separately

### Standalone → Integrated
1. Copy backend routes into Mind Sanctuary backend
2. Copy frontend components into Mind Sanctuary
3. Add navigation links
4. Deploy unified

---

## Standalone Checklist

Before launching standalone:

- [ ] Backend running on port 3003
- [ ] Frontend running on port 5181
- [ ] API URLs configured correctly
- [ ] Data directory writable
- [ ] Can generate beasts
- [ ] Can perform care actions
- [ ] Data persists after restart
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Ready for production deployment

---

## Support & Documentation

For standalone deployment:
1. **Local Dev**: This document
2. **Deployment**: DEPLOYMENT.md
3. **Architecture**: BEAST_COMPANION_SPEC.md
4. **Integration**: BEAST_QUICK_START.md (adapt for standalone)

---

**Ready to run Beast Companion standalone! 🚀**
