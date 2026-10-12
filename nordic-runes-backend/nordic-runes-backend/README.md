# Nordic Runes Backend

A Node.js/Express backend API for the Nordic Runes divination app.

## Features

- Draw 1-3 random rune stones
- Contextual readings based on user's question (love, career, health, finance, personal growth, general)
- Full rune database with meanings and reversed interpretations
- Save readings with personal notes

## API Endpoints

### Runes
- `GET /api/runes` - Get all available runes
- `GET /api/runes/:id` - Get a specific rune by ID

### Contexts
- `GET /api/contexts` - Get all question contexts

### Draw
- `POST /api/draw` - Draw runes
  - Body: `{ count: 1-3, context: "love|career|health|finance|personal|general" }`

### Readings
- `POST /api/readings` - Save a reading
  - Body: `{ context, stones, notes }`

## Setup

```bash
npm install
npm start
```

Backend runs on `http://localhost:3003`

## Environment Variables

- `PORT` - Server port (default: 3003)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5175)

## Runes Database

24 Elder Futhark runes with:
- Name and symbol
- Upright meaning
- Reversed meaning
- Context-aware interpretation

## Technology Stack

- Express.js
- CORS
- Body Parser
