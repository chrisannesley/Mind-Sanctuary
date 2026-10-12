# Testing Mind Sanctuary Reflection Companion

**Frontend Port**: 5180 ✅ (Updated)  
**Backend Port**: 3002 ✅ (Ready)  
**Status**: Ready for testing  

---

## 🚀 Start Testing in 2 Minutes

### Open Two Terminals

**Terminal 1 - Backend:**
```bash
cd d:\mindwell-app\backend
npm start
```
✅ Runs on: `http://localhost:3002`

**Terminal 2 - Frontend:**
```bash
cd d:\mindwell-app\frontend
npm run dev
```
✅ Runs on: `http://localhost:5180`

### Open Browser
```
http://localhost:5180/reflection
```

---

## 🌐 Testing URLs

### Main Testing URL
```
http://localhost:5180/reflection
```

### All Available URLs
| Feature | URL |
|---------|-----|
| **Reflection (NEW)** | http://localhost:5180/reflection |
| Home | http://localhost:5180 |
| Daily Check-In | http://localhost:5180/checkin |
| Voice Settings | http://localhost:5180/voice-settings |
| Journal | http://localhost:5180/journal |
| Assessments | http://localhost:5180/assessments |
| Crisis Resources | http://localhost:5180/crisis |
| Profile | http://localhost:5180/profile |

### Backend API
| Function | URL |
|----------|-----|
| Health | http://localhost:3002/health |
| Reflection API | http://localhost:3002/api/reflection/* |

---

## ✅ Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts on port 5180
- [ ] Can open http://localhost:5180
- [ ] Can navigate to Reflection: http://localhost:5180/reflection
- [ ] Can select session mode (Quick or Guided)
- [ ] Can type and send messages
- [ ] Companion responds
- [ ] Session timer shows
- [ ] Can end session
- [ ] No console errors (F12)

---

## 🧪 Test the Reflection Feature

### Test 1: Basic Conversation (3 minutes)
1. Go to http://localhost:5180/reflection
2. Click "Quick Check-In"
3. Type: "How do I reduce stress?"
4. Send message
5. Read companion's response
6. Type a follow-up
7. Continue 2-3 exchanges
8. Click X to end
9. Check summary

**Expected**: ✅ Companion responds coherently, references patterns

### Test 2: With Voice (Optional, 2 minutes)
1. First go to http://localhost:5180/voice-settings
2. Select a voice and test preview
3. Go to http://localhost:5180/reflection
4. Click "Quick Check-In"
5. Click microphone button
6. Say: "I've been feeling anxious"
7. Watch text appear
8. Hear companion respond in voice

**Expected**: ✅ Microphone works, voice speaks

### Test 3: Session Timer (2 minutes)
1. Go to http://localhost:5180/reflection
2. Click "Guided Reflection" (30 min max)
3. Watch timer count up
4. After few messages, watch timer display
5. Timer should show: "X / 30 minutes"
6. At 24 minutes (~80%), "Ready to wrap up?" should appear

**Expected**: ✅ Timer accurate, prompt appears at 80%

### Test 4: Crisis Detection (1 minute)
1. Go to http://localhost:5180/reflection
2. Click "Quick Check-In"
3. Type: "I want to hurt myself"
4. Watch for red background on message
5. See 988 button appear
6. See crisis resources display
7. Session ends

**Expected**: ✅ Crisis detected, resources shown, session ends

---

## 🔧 Environment Variables

### Backend (.env)
Make sure these are set:
```
CLAUDE_API_KEY=sk-ant-YOUR-KEY-HERE
FRONTEND_URL=http://localhost:5180
PORT=3002
```

Check it's set:
```bash
echo $CLAUDE_API_KEY
```

---

## 🐛 Troubleshooting

### Frontend not loading
```
Problem: http://localhost:5180 won't load
Solution:
1. Check npm run dev is running in terminal
2. Check terminal for errors
3. Try http://localhost:5180 (not localhost:5174)
4. Clear browser cache (Ctrl+Shift+Delete)
5. Restart: Ctrl+C, then npm run dev
```

### Backend not responding
```
Problem: Companion doesn't respond
Solution:
1. Check npm start is running in terminal
2. Check CLAUDE_API_KEY is set and valid
3. Verify no errors in backend terminal
4. Try: curl http://localhost:3002/health
5. Restart: Ctrl+C, then npm start
```

### CORS error
```
Problem: "Cross-Origin Request Blocked"
Solution:
1. Already fixed! Backend updated for port 5180
2. Make sure you use http:// not https://
3. Restart backend if issue persists
```

### Voice not working
```
Problem: Microphone button does nothing
Solution:
1. Set voice first: http://localhost:5180/voice-settings
2. Grant microphone permission when asked
3. Try Chrome/Firefox
4. Check browser console (F12) for errors
5. Try voice settings page to test
```

### Companion not responding
```
Problem: No response to messages
Solution:
1. Check CLAUDE_API_KEY is valid (starts with sk-ant-)
2. Check backend logs for "Error" messages
3. Check Network tab (F12) for failed requests
4. Try: curl http://localhost:3002/health
5. Check Anthropic API status page
```

---

## 📊 What to Verify

### Core Features
- ✅ Session creation works
- ✅ Messages send and receive
- ✅ Companion responds from Claude
- ✅ Session timer displays correctly
- ✅ "Wrap up" prompt appears at 80%
- ✅ Manual end works
- ✅ Completion summary shows

### Voice Features
- ✅ Voice preferences load
- ✅ Microphone button works
- ✅ Speech captured as text
- ✅ Companion speaks response
- ✅ Voice settings apply

### Safety
- ✅ Crisis keywords detected
- ✅ Crisis UI displays (red)
- ✅ Resources shown
- ✅ 988 button visible
- ✅ Session ends on crisis

### Mobile (Optional)
- ✅ Works at 375px width
- ✅ Buttons are touchable
- ✅ Text is readable
- ✅ Portrait and landscape work

---

## 📝 Test Scenarios

### Scenario 1: Morning Energy Dip
```
User: "I've been tired in the mornings lately"
Expected: Companion asks about sleep schedule
User: "Yeah, I stay up late scrolling"
Expected: Companion references sleep-mood correlation
User: "What if I put my phone away at 10pm?"
Expected: Companion asks about feasibility
Outcome: User decides to try new bedtime routine
```

### Scenario 2: Work Stress
```
User: "Work has been overwhelming"
Expected: Companion asks about specific stressors
User: "Too many meetings, can't focus"
Expected: Companion explores patterns with check-in data
User: "I notice I'm more stressed on meeting days"
Expected: Companion helps identify pattern
Outcome: User decides to block focus time
```

### Scenario 3: Low Motivation
```
User: "I don't feel like doing anything today"
Expected: Companion validates feeling
User: "Just want to stay in bed"
Expected: Companion asks about physical factors
User: "I slept 5 hours, had lots of caffeine"
Expected: Companion connects dots
Outcome: User decides to prioritize sleep tonight
```

---

## 🎤 Voice Testing

### Setup
1. Go to http://localhost:5180/voice-settings
2. Browse available voices
3. Click preview to hear options
4. Select your favorite
5. Adjust speed/pitch/volume
6. Save preferences

### Test
1. Go to http://localhost:5180/reflection
2. Start session
3. Type a message
4. Wait for response - **You should hear it spoken**
5. Click microphone
6. Say: "Tell me about my patterns"
7. Watch text appear
8. Hear companion respond

---

## 🔍 Developer Tools

### Browser DevTools (F12)
```
Console: Check for JS errors
Network: See API calls to :3002
React DevTools: Inspect component state
  - ReflectionSession.sessionState
  - ReflectionSession.messages
  - ReflectionSession.sessionDuration
```

### Backend Terminal
Watch for:
```
POST /api/reflection/start
POST /api/reflection/message  
POST /api/reflection/end
Error messages (if any)
Claude API calls
Response times
```

### Database
File: `d:\mindwell-app\backend\mindwell.db`
Open with text editor to see:
- Users
- Check-ins (for pattern context)
- Sessions
- Reflection conversations

---

## 📋 Complete Test Checklist

**Before Testing**
- [ ] Both terminals open and ready
- [ ] Backend running on 3002
- [ ] Frontend running on 5180
- [ ] CLAUDE_API_KEY is set
- [ ] Browser ready (Chrome, Firefox, Safari, or Edge)

**Core Functionality**
- [ ] Can open http://localhost:5180
- [ ] Can navigate to Reflection
- [ ] Can select session mode
- [ ] Can type message
- [ ] Can send message
- [ ] Companion responds
- [ ] Messages display correctly
- [ ] Session timer shows
- [ ] Can read complete conversation
- [ ] Can end session

**Session Modes**
- [ ] Quick mode works (5-10 min)
- [ ] Guided mode works (15-30 min)
- [ ] Each mode has correct max duration
- [ ] Timer counts correctly

**Session Features**
- [ ] "Ready to wrap up?" appears at 80%
- [ ] Manual end button (X) works
- [ ] Session completion shows summary
- [ ] Can start new session after ending

**Voice (Optional)**
- [ ] Voice settings page loads
- [ ] Can select voice
- [ ] Can hear voice preview
- [ ] Settings save
- [ ] Companion speaks response
- [ ] Microphone button appears
- [ ] Microphone captures speech
- [ ] Transcript displays

**Safety (Important)**
- [ ] Crisis message detected
- [ ] Red styling appears
- [ ] 988 button visible
- [ ] Resources display
- [ ] Session ends
- [ ] Escalation works

**Mobile (Optional)**
- [ ] Works at 375px
- [ ] Buttons touchable
- [ ] Text readable
- [ ] Portrait/landscape work

**Errors**
- [ ] No JavaScript errors (Console)
- [ ] No network errors (Network tab)
- [ ] Backend responding
- [ ] API calls successful
- [ ] No CORS errors

**Performance**
- [ ] Messages display instantly
- [ ] No lag when typing
- [ ] Voice responds quickly
- [ ] Mobile scrolls smoothly

---

## ✨ Expected Behavior

### What Should Happen
✅ Session starts with greeting matching mode (Quick/Guided)  
✅ Companion references user's check-in data  
✅ Conversation feels natural and empathetic  
✅ Questions help user discover patterns  
✅ Timer shows accurate duration  
✅ Session suggests ending at 80%  
✅ Crisis immediately escalates  
✅ Voice input captures speech accurately  
✅ Voice output sounds natural  

### What Should NOT Happen
❌ Companion gives medical advice  
❌ Companion suggests it's a therapist  
❌ Session tries to keep user engaged past time limit  
❌ No responses to messages  
❌ Crashes or errors  
❌ CORS issues  
❌ Voice not working without clear reason  

---

## 📞 Support

**Not working?**
1. Check Troubleshooting section above
2. Check backend terminal for errors
3. Check browser console (F12)
4. Verify CLAUDE_API_KEY
5. Check both servers running

**Found a bug?**
1. Note exact steps to reproduce
2. Screenshot if helpful
3. Check backend logs
4. Report with: steps, expected, actual

---

## 🎯 Success Criteria

✅ **You're done when:**
- Session creates and ends successfully
- Companion responds to messages
- Voice works (if enabled)
- Crisis detection triggers correctly
- No console errors
- Mobile layout works
- Timer is accurate

---

## Summary

```
🚀 START:
  Terminal 1: cd backend && npm start
  Terminal 2: cd frontend && npm run dev

🌐 TEST:
  http://localhost:5180/reflection

✅ CHECK:
  - Messages send/receive
  - Companion responds
  - Timer shows
  - Can end session
  - No errors

🎉 READY FOR QA!
```

---

**Happy Testing! 🎉**

Frontend: `http://localhost:5180`  
Backend: `http://localhost:3002`  
Reflection: `http://localhost:5180/reflection`
