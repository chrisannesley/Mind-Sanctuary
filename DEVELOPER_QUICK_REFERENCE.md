# Developer Quick Reference - Reflection Companion

**One-page guide to get up and running**

---

## Quick Start (5 minutes)

### 1. Setup Backend
```bash
cd backend
npm install  # Install @anthropic-ai/sdk
echo 'CLAUDE_API_KEY=sk-ant-YOUR-KEY-HERE' > .env
npm start
# ✅ Server runs on http://localhost:3002
```

### 2. Setup Frontend
```bash
cd frontend
npm install  # Already has dependencies
npm run dev
# ✅ App runs on http://localhost:5174
```

### 3. Test Reflection
```
1. Go to http://localhost:5174
2. Click "Reflection (💭)" in menu
3. Choose "Quick Check-In"
4. Start chatting
```

---

## File Map

### Frontend Components
| File | Purpose | Status |
|------|---------|--------|
| `src/components/ReflectionSession.jsx` | Main UI component (500 lines) | ✅ Complete |
| `src/pages/Reflection.jsx` | Page wrapper | ✅ Complete |
| `src/App.jsx` | Routes config | ✅ Updated |
| `src/components/Navigation.jsx` | Menu | ✅ Updated |

### Backend Services
| File | Purpose | Status |
|------|---------|--------|
| `src/claudeService.js` | Claude API wrapper | ✅ Complete |
| `src/index.js` | Express server + routes | ✅ Updated |
| `package.json` | Dependencies | ✅ Updated |

### Documentation
| File | Purpose |
|------|---------|
| `PHASE_2_REFLECTION_FRONTEND_COMPLETE.md` | Technical deep dive |
| `REFLECTION_COMPANION_DESIGN.md` | Philosophy + design |
| `REFLECTION_QUICK_START.md` | User/QA guide |
| `IMPLEMENTATION_STATUS.md` | Project status |
| This file | Developer reference |

---

## API Reference

### Start Session
```javascript
POST /api/reflection/start
{
  "sessionMode": "guided" | "quick"
}

Response:
{
  "sessionId": "1-1695844232123",
  "mode": "guided",
  "message": "Welcome to reflection..."
}
```

### Send Message
```javascript
POST /api/reflection/message
{
  "sessionId": "1-1695844232123",
  "message": "I've been feeling stressed"
}

Response:
{
  "message": "I notice that pattern...",
  "type": "REFLECTION" | "CRISIS_ESCALATION",
  "sessionEnd": false,
  "suggestEnd": false,
  "duration": 5,
  "maxDuration": 30
}
```

### End Session
```javascript
POST /api/reflection/end
{
  "sessionId": "1-1695844232123"
}

Response:
{
  "sessionId": "1-1695844232123",
  "status": "closed",
  "duration": 12,
  "messageCount": 6
}
```

### Get Instructions
```javascript
GET /api/reflection/instructions

Response:
{
  "identity": "I am Claude...",
  "purpose": "Help you understand...",
  "scope": "This is reflection...",
  ...
}
```

---

## Component Props

### ReflectionSession
```javascript
<ReflectionSession
  onSessionEnd={(data) => {}}        // Called when session ends
  userId={1}                          // Current user ID
  userVoicePreference="Google UK...} // TTS voice object
  userVoiceSettings={{               // Voice settings
    rate: 1,
    pitch: 1,
    volume: 1
  }}
/>
```

### Reflection (Page)
```javascript
// No props needed - loads everything from localStorage
<Route path="/reflection" element={<Reflection />} />
```

---

## Component State

### ReflectionSession State
```javascript
sessionState:     // 'MODE_SELECT' | 'ACTIVE' | 'ENDED'
sessionMode:      // 'guided' | 'quick' | null
sessionId:        // string from backend
messages:         // array of {role, content, timestamp, ...}
isLoading:        // boolean (waiting for response)
sessionDuration:  // number (minutes elapsed)
maxDuration:      // 10 or 30 minutes
suggestEnd:       // boolean (show wrap-up at 80%)
crisisDetected:   // boolean (crisis message received)
showInstructions: // boolean (modal open)
instructions:     // object from API
```

---

## Common Tasks

### Add a New Route
```javascript
// In frontend/src/App.jsx
import MyNewPage from './pages/MyNewPage'

<Route path="/mynew" element={<MyNewPage />} />

// In frontend/src/components/Navigation.jsx
{ path: '/mynew', label: 'My New', icon: '🆕' }
```

### Test Crisis Detection
In reflection session, try:
- "I want to hurt myself"
- "I'm thinking about ending it"
- "I've been suicidal"

Expected: Crisis UI appears, resources shown, session ends

### Enable Voice
Voice works if:
1. User has set a voice preference in VoiceSettings
2. Browser supports Web Speech API (Chrome, Firefox, Safari, Edge)
3. Microphone permission granted

### Debug API Issues
```bash
# Check backend is running
curl http://localhost:3002/health

# Check session endpoint
curl -X POST http://localhost:3002/api/reflection/start \
  -H "Content-Type: application/json" \
  -d '{"sessionMode":"quick"}'

# Check Claude API key is set
echo $CLAUDE_API_KEY  # Should show your key
```

### Check Component Errors
```javascript
// In browser console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API calls
```

---

## Environment Variables

### Backend (.env)
```
CLAUDE_API_KEY=sk-ant-...          # Required: Anthropic API key
FRONTEND_URL=http://localhost:5174  # CORS origin
PORT=3002                            # Server port
```

### Frontend (.env.local or .env)
```
VITE_BACKEND_URL=http://localhost:3002  # API base URL
```

---

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",              // Web server
  "cors": "^2.8.5",                  // Cross-origin
  "dotenv": "^16.0.3",               // Env variables
  "body-parser": "^1.20.2",          // JSON parsing
  "@anthropic-ai/sdk": "^0.20.0"     // Claude API (NEW)
}
```

### Frontend (Already installed)
```
react, react-router-dom, tailwindcss, lucide-react
```

---

## Session Flow (Developer View)

```
┌─ MODE_SELECT ─┐
│               │
│  Quick or     │ POST /api/reflection/start
│  Guided?      │
│               ↓
└─ ACTIVE ──────┐
│               │
│  User input   │ POST /api/reflection/message
│  ↓            │
│  AI response  │
│  (repeat)     │
│               │
│  Crisis?  ────┼──→ CRISIS_ESCALATION
│  Time up? ─────┼──→ suggestEnd: true
│  User end?────┼──→ POST /api/reflection/end
│               ↓
└─ ENDED ───────┐
│               │
│  Show summary │
│  Offer replay │
│               │
└───────────────┘
```

---

## Testing Checklist

### Happy Path
- [ ] Session starts
- [ ] Can send message
- [ ] Response appears
- [ ] Session ends
- [ ] Summary shows

### Voice
- [ ] Voice settings load
- [ ] Voice input works
- [ ] Voice output plays
- [ ] Indicator shows on messages

### Crisis
- [ ] Crisis message detected
- [ ] Resources shown
- [ ] Session ends
- [ ] 988 link works

### Mobile
- [ ] Renders on 375px width
- [ ] Can type and send
- [ ] Can use voice
- [ ] Resources visible

### Error Handling
- [ ] Backend down → error message
- [ ] Claude API error → error message
- [ ] Invalid session ID → 404 handled
- [ ] Network timeout → retry or error

---

## Useful Console Commands (Browser)

```javascript
// Check if voice preferences loaded
localStorage.getItem('preferredVoice')

// Get user ID
localStorage.getItem('userId')

// Clear all app data
localStorage.clear()

// Check API response
fetch('/api/reflection/instructions')
  .then(r => r.json())
  .then(d => console.log(d))

// Get component state (requires React DevTools)
// In React DevTools → Components → ReflectionSession → state
```

---

## Troubleshooting Flowchart

```
Problem: Session not starting
├─ Backend running? → curl localhost:3002/health
├─ CLAUDE_API_KEY set? → echo $CLAUDE_API_KEY
├─ Console errors? → Check F12 console
└─ Network error? → Check Network tab

Problem: No voice output
├─ Voice saved? → Check localStorage
├─ Browser support? → Try Chrome/Firefox
├─ Audio muted? → Check browser audio
└─ Code error? → Check console

Problem: Crisis not detected
├─ Clear session? → All new session
├─ Try keywords? → "suicide", "hurt myself"
├─ Backend log? → Check server console
└─ Claude issue? → Check API response

Problem: Mobile doesn't work
├─ Responsive? → Check media queries
├─ Touch targets? → Buttons > 44px
├─ Overflow? → Check CSS
└─ Performance? → Check Network tab
```

---

## Performance Tips

### Frontend
- ReflectionSession re-renders only on state changes (optimized)
- Messages auto-scroll with ref (smooth)
- Voice handlers async (non-blocking)
- No unnecessary API calls

### Backend
- Sessions stored in memory (fast) but don't scale
- Claude API calls async
- Error handling graceful
- CORS configured for security

### Scale Considerations
```
Current: 10-100 concurrent users → OK with memory sessions
Growth: 100+ users → Migrate to Redis
Large: 1000+ users → Add load balancer, database, caching
```

---

## Code Conventions

### Component Files
```javascript
// ✅ Do
import React, { useState } from 'react'
export default function ComponentName() {
  return <div>content</div>
}

// ❌ Don't
import React, { Component } from 'react'
class ComponentName extends Component { }
```

### Naming
```
Components:    PascalCase (ReflectionSession)
Functions:     camelCase (handleSessionStart)
Constants:     UPPER_SNAKE (MAX_DURATION)
Variables:     camelCase (sessionDuration)
```

### Comments
```javascript
// ✅ Do - Explain WHY
// Scroll to latest message for UX feedback
messagesEndRef.current?.scrollIntoView()

// ❌ Don't - Obvious code
// Set isLoading to false
setIsLoading(false)
```

---

## Git Workflow

### New Feature
```bash
git checkout -b feature/my-feature
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
# Create PR
```

### After Merge
```bash
git checkout main
git pull origin main
npm install  # If dependencies changed
npm start
```

---

## Resources

### Documentation
- `REFLECTION_COMPANION_DESIGN.md` - Philosophy
- `PHASE_2_REFLECTION_FRONTEND_COMPLETE.md` - Technical details
- Inline code comments

### External
- [Anthropic Docs](https://docs.anthropic.com)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Support
- Check existing documentation first
- Review component code comments
- Trace through data flow
- Test with console logs
- Check browser DevTools

---

## Quick Decision Matrix

| Scenario | Action |
|----------|--------|
| Adding new field to message | Edit ReflectionSession state + update message object |
| Changing voice behavior | Edit `Reflection.jsx` or `voiceUtils.js` |
| Adding new API endpoint | Add route to `backend/src/index.js` |
| Styling tweaks | Check `ReflectionSession.jsx` Tailwind classes |
| Crisis handling changes | Update `claudeService.js` + test thoroughly |
| Mobile issues | Check media queries, touch targets, viewport |
| Performance issues | Check React DevTools, Network tab, Console |
| Safety concerns | Alert team immediately, disable if needed |

---

## Version Info

```
Frontend: React 18, Tailwind CSS, React Router v6
Backend: Express 4, Node ES modules
Claude: claude-3-5-sonnet-20241022
Date: September 28, 2026
Status: 🟢 Production Ready
```

---

## Emergency Contacts

**Can't figure it out?**
1. Check documentation
2. Check code comments
3. Run `git log --oneline` to see what changed
4. Test in isolation (vs whole app)
5. Ask team → Document solution

---

## Last Updated
September 28, 2026

**Happy coding! 🚀**
