# Nordic Runes Frontend

A React-based mobile app for Nordic rune divination and guidance.

## Features

- Beautiful, responsive Nordic-themed UI
- Draw between 1-3 rune stones
- Multiple contexts: Love, Career, Health, Finance, Personal Growth, General
- Detailed rune interpretations
- Save readings with personal notes
- Dark mode by default with Norse color palette

## Pages

### Home
- Introduction to the app
- How rune drawing works
- Start button to begin a reading

### Draw Runes
- Select question context
- Choose number of stones (1, 2, or 3)
- Draw runes based on selection

### Reading Result
- Display drawn runes with symbols
- Show upright and reversed meanings
- Position-based interpretation
- Save reading with notes
- Interpretation guide

## Setup

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5175`

## Technology Stack

- React 18
- Vite
- Tailwind CSS v3
- Axios for API calls

## Styling

Custom Norse color palette with earth tones:
- Primary: `norse-700` (#5a5242) - Deep brown
- Secondary: `norse-600` (#7a7359) - Medium brown
- Accent: `norse-400` (#b8ad96) - Light tan
- Background: `norse-900` (#2a2723) - Very dark brown

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3003)
