# Local Testing URLs - Mind Sanctuary

**Updated**: September 28, 2026  
**Frontend Port**: 5180 (configured)  
**Backend Port**: 3002 (configured)  

---

## 🚀 Quick Start

### Terminal 1: Start Backend
```bash
cd d:\mindwell-app\backend
npm start
```
✅ Backend runs on `http://localhost:3002`

### Terminal 2: Start Frontend
```bash
cd d:\mindwell-app\frontend
npm run dev
```
✅ Frontend runs on `http://localhost:5180`

---

## 🌐 Testing URLs

### Main App
```
http://localhost:5180
```

### Specific Pages
| Page | URL |
|------|-----|
| Home | http://localhost:5180/ |
| Daily Check-In | http://localhost:5180/checkin |
| **Reflection (NEW)** | **http://localhost:5180/reflection** |
| Journal | http://localhost:5180/journal |
| Assessments | http://localhost:5180/assessments |
| Articles | http://localhost:5180/articles |
| Coping Strategies | http://localhost:5180/coping |
| Inspiration | http://localhost:5180/inspiration |
| Crisis Resources | http://localhost:5180/crisis |
| Profile | http://localhost:5180/profile |
| To-Do List | http://localhost:5180/todos |
| Voice Settings | http://localhost:5180/voice-settings |

### Backend API Endpoints
| Endpoint | URL |
|----------|-----|
| Health Check | http://localhost:3002/health |
| **Reflection Start** | **POST http://localhost:3002/api/reflection/start** |
| **Reflection Message** | **POST http://localhost:3002/api/reflection/message** |
| **Reflection End** | **POST http://localhost:3002/api/reflection/end** |
| **Reflection Instructions** | **GET http://localhost:3002/api/reflection/instructions** |
| User Profile | http://localhost:3002/api/user |
| Check-ins | http://localhost:3002/api/checkins |
| Crisis Resources | http://localhost:3002/api/crisis-resources/US |

---

## 🧪 Testing the Reflection Companion

### Step 1: Navigate to Reflection
```
http://localhost:5180/reflection
```

### Step 2: Choose Session Type
- **Quick Check-In** (5-10 minutes) - Click to test
- **Guided Reflection** (15-30 minutes) - Click to test

### Step 3: Start Conversation
1. Type a message or click microphone
2. Click Send
3. Watch companion respond
4. Continue the conversation

### Step 4: Test Features
- **Text Input**: Type and send messages
- **Voice Input**: Click microphone to speak
- **Voice Output**: Hear companion respond (if voice preference set)
- **Session Timer**: Watch duration count up
- **Crisis**: Try typing "I want to hurt myself" to test crisis escalation
- **Wrap Up**: Session suggests ending at 80% of max time

---

## 🔧 Environment Setup

### Backend (.env)
```
CLAUDE_API_KEY=sk-ant-YOUR-API-KEY-HERE
FRONTEND_URL=http://localhost:5180
PORT=3002
```

### Frontend (auto-configured)
```
VITE_BACKEND_URL=http://localhost:3002
```

---

## 📊 Key Testing Scenarios

### Scenario 1: Quick Reflection
```
URL: http://localhost:5180/reflection
1. Click "Quick Check-In"
2. Type: "I'm feeling stressed today"
3. Watch companion respond with pattern insights
4. Continue for 5-10 minutes
5. Session ends automatically or manually
```

### Scenario 2: Guided Reflection
```
URL: http://localhost:5180/reflection
1. Click "Guided Reflection"
2. Type: "I've been anxious lately"
3. Watch companion ask clarifying questions
4. Share details about sleep, work, etc.
5. See patterns referenced from your check-ins
6. Session ends after 15-30 minutes
```

### Scenario 3: Voice Input/Output
```
URL: http://localhost:5180/voice-settings
1. First, set your preferred voice
2. Go to http://localhost:5180/reflection
3. Start a quick session
4. Click microphone button
5. Speak: "How have you been feeling?"
6. Watch companion speak the response
```

### Scenario 4: Crisis Detection
```
URL: http://localhost:5180/reflection
1. Start any session
2. Type: "I'm thinking about harming myself"
3. Watch red crisis UI appear
4. See 988 Lifeline button
5. Click 988 button or close
6. Session ends
```

---

## 🐛 Troubleshooting

### Frontend Not Loading
```
Issue: "Cannot connect to http://localhost:5180"
Fix:
1. Make sure npm is running: npm run dev
2. Check terminal output for errors
3. Try http://localhost:5180 in browser
4. Clear browser cache (Ctrl+Shift+Delete)
```

### Backend Not Responding
```
Issue: "Cannot connect to http://localhost:3002"
Fix:
1. Make sure backend is running: npm start
2. Check CLAUDE_API_KEY is set: echo $CLAUDE_API_KEY
3. Verify no other process using port 3002
4. Check backend logs in terminal
```

### CORS Error
```
Issue: "Cross-origin request blocked"
Fix:
1. Backend CORS already updated to http://localhost:5180
2. Make sure you're using http:// not https://
3. Restart backend after code changes
```

### Voice Not Working
```
Issue: "Microphone button does nothing"
Fix:
1. Set voice preference in http://localhost:5180/voice-settings
2. Grant microphone permission when browser asks
3. Try Chrome/Firefox/Safari/Edge
4. Check browser console (F12) for errors
```

### Claude API Error
```
Issue: "Error processing reflection message"
Fix:
1. Verify CLAUDE_API_KEY is set and valid
2. Check Anthropic API status
3. Look for "Invalid API key" in backend logs
4. Make sure API key starts with "sk-ant-"
```

---

## 💻 Developer Tools

### Browser DevTools
```
1. Open http://localhost:5180/reflection
2. Press F12 to open DevTools
3. Go to Console tab
4. Go to Network tab to see API calls
5. Go to Components tab (if React DevTools installed)
```

### Backend Logs
```
Terminal output shows:
- Request: POST /api/reflection/start
- Request: POST /api/reflection/message
- Claude API calls
- Error messages
- Response times
```

### Database
```
File-based DB at: d:\mindwell-app\backend\mindwell.db
Contains: users, check-ins, sessions, etc.
View: Open with text editor (it's JSON)
```

---

## 🚀 Performance Testing

### Load Testing
```
1. Start multiple sessions
2. Send rapid messages
3. Monitor API response times
4. Check browser memory usage (DevTools → Memory)
5. Look for memory leaks or slowdowns
```

### Mobile Testing
```
1. Get your PC IP: ipconfig (look for IPv4)
2. On mobile, go to: http://YOUR-PC-IP:5180
3. Test on actual phone size
4. Test portrait and landscape
5. Test voice features on mobile
```

### Voice Testing
```
1. Set different voices in settings
2. Test microphone capture
3. Test speaker output
4. Test in different browsers
5. Test on mobile (iOS/Android)
```

---

## 📝 Test Checklist

### Feature Testing
- [ ] Session mode selection works
- [ ] Quick session (5-10 min) works
- [ ] Guided session (15-30 min) works
- [ ] Messages send and display
- [ ] Timer counts correctly
- [ ] "Ready to wrap up?" appears at 80%
- [ ] Can end session manually
- [ ] Session summary shows

### Voice Testing
- [ ] Voice preferences load
- [ ] Microphone button appears
- [ ] Microphone captures speech
- [ ] Text displays from voice input
- [ ] Companion speaks response
- [ ] Voice settings (rate, pitch) apply

### Crisis Testing
- [ ] Crisis message detected
- [ ] Red styling appears
- [ ] 988 button visible
- [ ] Session ends
- [ ] Resources displayed

### Mobile Testing
- [ ] Responsive at 375px
- [ ] Can type and send
- [ ] Can use voice
- [ ] Buttons are touchable
- [ ] Text readable

### Error Handling
- [ ] Backend down → shows error
- [ ] Network error → shows error
- [ ] Invalid session → 404 handled
- [ ] API error → shows message

---

## 🔗 Important Links

### Documentation
- `http://localhost:5180` - Main app
- `d:\mindwell-app\REFLECTION_QUICK_START.md` - Testing guide
- `d:\mindwell-app\DEVELOPER_QUICK_REFERENCE.md` - Dev guide
- `d:\mindwell-app\PHASE_2_REFLECTION_FRONTEND_COMPLETE.md` - Technical details

### External
- Anthropic Docs: https://docs.anthropic.com
- React DevTools: https://react.dev/learn/react-developer-tools
- Tailwind CSS: https://tailwindcss.com

---

## 📞 Support

**Something not working?**
1. Check troubleshooting section above
2. Review backend terminal logs
3. Check browser console (F12)
4. Check CLAUDE_API_KEY is set
5. Try restarting both servers

**Found a bug?**
1. Note the exact steps to reproduce
2. Screenshot or video if possible
3. Check backend logs
4. Report with: steps, expected, actual, screenshots

---

## Summary

```
🚀 START TESTING:
  Frontend:  http://localhost:5180
  Backend:   http://localhost:3002
  
🎯 TEST REFLECTION:
  http://localhost:5180/reflection
  
📊 MAIN FEATURES:
  - Quick/Guided sessions
  - Voice input/output
  - Crisis detection
  - Pattern insights
  - Timer & wrap-up
  
✅ READY FOR QA
```

---

**Happy Testing! 🎉**

Frontend: `http://localhost:5180`  
Backend: `http://localhost:3002`  
Reflection: `http://localhost:5180/reflection`
