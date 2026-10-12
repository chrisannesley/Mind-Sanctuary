# Beast Companion - Standalone App

This is a standalone version of Beast Companion that can be deployed separately from Mind Sanctuary.

## Quick Start

### Backend
```bash
cd beast-companion-standalone/backend
npm install
npm start
# Runs on http://localhost:3003
```

### Frontend
```bash
cd beast-companion-standalone/frontend
npm install
npm run dev
# Runs on http://localhost:5181
```

## Features

- 🐉 AI-generated unique beasts
- 💚 Health system tied to wellness habits
- 📈 Evolution through 6 life stages
- 🎮 Professional gaming UI
- 📊 Statistics & achievements
- 💾 Persistent data storage
- 🔄 Multi-user support

## Architecture

### Backend (Port 3003)
- Express.js server
- RESTful API for beast management
- File-based data persistence
- Standalone, no database required

### Frontend (Port 5181)
- React with Tailwind CSS
- Gaming-standard UI
- Real-time state management
- Mobile responsive

## API Endpoints

```
GET  /api/beasts/:userId              - Get all user beasts
GET  /api/beasts/:userId/current      - Get active beast
POST /api/beasts/:userId/generate     - Generate new beast
PUT  /api/beasts/:beastId/care/:action - Record care action
PUT  /api/beasts/:beastId/health      - Update from wellness data
POST /api/beasts/:beastId/resurrect   - Resurrect dead beast
GET  /api/beasts/:userId/gallery      - Get all past beasts
```

## Data Storage

All beast data is stored in `backend/data/beasts.json`:
- Automatically created on first use
- ~1KB per beast
- Supports 10,000+ beasts per instance
- Easy migration to database later

## Deployment

### Heroku/Railway
```bash
# Backend deployment:
# Set PORT environment variable
# Ensure data directory is writable

# Frontend deployment:
# Build: npm run build
# Deploy dist/ folder
```

### Docker
See Dockerfile templates in deployment/ folder

## Contributing

Beast Companion is designed to prioritize user welfare:
- No engagement optimization/dark patterns
- Death mechanics are real (creates stakes)
- Wellness habits = pet health (natural connection)
- Optional engagement (check-ins sufficient)

## License

MIT
