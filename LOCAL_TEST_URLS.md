# Beast Companion - Local Test URLs

**Status**: ✅ Both servers running - READY TO TEST

---

## 🌐 Access URLs

### Main App (Integrated with Mind Sanctuary)
```
http://localhost:5180
```
✅ Running now on port 5180

### Beast Companion Feature
```
http://localhost:5180/beasts
```
✅ Direct access to Beast Companion page
🐉 Click "Beast Companion" in navigation

### Standalone Mode (if needed later)
```
http://localhost:5181
```
⏳ For standalone testing: `npm run dev:standalone`

---

## 🔌 API Endpoints (Backend)

**Base URL**: `http://localhost:3002`

### Health Check
```
GET http://localhost:3002/health
```
Response: `{"status":"ok","message":"Mind Sanctuary backend is running"}`

### Beast Operations

#### Generate New Beast
```
POST http://localhost:3002/api/beasts/1/generate
Content-Type: application/json
Body: {}

Response: {
  "id": "uuid",
  "name": "Emberclaw",
  "archetype": "Dragon",
  "health": 100,
  "stage": "egg",
  "generatedImage": "🐉",
  ...
}
```

#### Get All Beasts for User
```
GET http://localhost:3002/api/beasts/1

Response: [
  { beast1 },
  { beast2 },
  ...
]
```

#### Get Current (Active) Beast
```
GET http://localhost:3002/api/beasts/1/current

Response: { current_beast }
```

#### Perform Care Action
```
PUT http://localhost:3002/api/beasts/{beastId}/care/feed
PUT http://localhost:3002/api/beasts/{beastId}/care/play
PUT http://localhost:3002/api/beasts/{beastId}/care/pet
PUT http://localhost:3002/api/beasts/{beastId}/care/groom
PUT http://localhost:3002/api/beasts/{beastId}/care/rest
PUT http://localhost:3002/api/beasts/{beastId}/care/reflect

Response: { updated_beast_with_new_health }
```

#### Update Health from Check-in
```
PUT http://localhost:3002/api/beasts/{beastId}/health
Content-Type: application/json
Body: {
  "moodScore": 8,
  "sleepHours": 7,
  "stressLevel": 3
}

Response: { updated_beast }
```

#### Resurrect Dead Beast
```
POST http://localhost:3002/api/beasts/{beastId}/resurrect

Response: { resurrected_beast }
```

#### Get Beast Gallery (All Past Beasts)
```
GET http://localhost:3002/api/beasts/1/gallery

Response: [
  { beast1_alive },
  { beast2_deceased },
  ...
]
```

---

## 🧪 Test Examples

### In Browser Console (F12)

**Generate Beast**:
```javascript
fetch('http://localhost:3002/api/beasts/1/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}'
})
.then(r => r.json())
.then(data => {
  console.log('Generated:', data.name, data.archetype)
  console.log('ID:', data.id)
})
```

**Feed Beast**:
```javascript
const beastId = 'YOUR_BEAST_ID'
fetch(`http://localhost:3002/api/beasts/${beastId}/care/feed`, {
  method: 'PUT'
})
.then(r => r.json())
.then(data => console.log('New health:', data.health))
```

**Check-in Update**:
```javascript
const beastId = 'YOUR_BEAST_ID'
fetch(`http://localhost:3002/api/beasts/${beastId}/health`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moodScore: 9,
    sleepHours: 8,
    stressLevel: 2
  })
})
.then(r => r.json())
.then(data => console.log('Updated health:', data.health))
```

---

## 📊 Test Data

### User ID
Currently using: `userId = 1`

### Sample Beast Data
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 1,
  "name": "Emberclaw",
  "archetype": "Dragon",
  "stage": "adult",
  "health": 85,
  "happiness": 72,
  "bond": 60,
  "age": 12,
  "isAlive": true,
  "generatedImage": "🐉",
  "genetics": {
    "primaryColor": "#DC143C",
    "secondaryColor": "#FFD700",
    "temperament": "Playful",
    "specialTraits": ["Wings", "Fiery"]
  },
  "careLog": [
    {
      "timestamp": "2026-09-29T10:35:00.000Z",
      "type": "feed",
      "hpChange": 3,
      "note": "Feed completed"
    }
  ]
}
```

---

## 🎮 Quick Test Sequence

1. **Open App**
   ```
   http://localhost:5180/beasts
   ```

2. **Generate Beast**
   - Click "Generate Your First Beast"
   - Verify beast appears

3. **Feed Beast**
   - Click 🍖 Feed button
   - Health should increase by 3

4. **Play with Beast**
   - Click 🎮 Play button
   - Health should increase by 5

5. **Check Care Log**
   - Scroll to "📋 Care Log"
   - Should show your recent actions

6. **Refresh Page**
   - Hit F5 or Ctrl+R
   - Beast and data should persist

7. **View Gallery**
   - Click "🖼️ Gallery" tab
   - Should see your beast

---

## 🔍 Debugging Tools

### Browser DevTools (F12)

**Network Tab**:
- Watch API calls to `/api/beasts/`
- See response status and body
- Check timing

**Console Tab**:
- View any JavaScript errors
- Run test commands (see above)
- Check for warnings

**Application Tab**:
- View localStorage (if used)
- Check cookies

### Backend Logs

Backend terminal shows:
```
✅ Mind Sanctuary backend running on http://localhost:3002
```

If there are errors, they'll appear in that terminal.

### Data File

Check stored data:
```bash
cat d:\mindwell-app\backend\data\beasts.json
```

Should show JSON array of all beasts.

---

## 📱 Mobile Testing

### In Browser
1. Press F12 for DevTools
2. Click the mobile icon (top-left of DevTools)
3. Select device (iPhone, Android, etc.)
4. View should adapt to mobile

**Expected**:
- Buttons stack vertically
- Text remains readable
- No horizontal scroll

---

## ✅ Test Checklist

- [ ] App loads at http://localhost:5180/beasts
- [ ] Can generate beast
- [ ] Beast has name and archetype
- [ ] Health bar shows
- [ ] Feed button works (+3 HP)
- [ ] Play button works (+5 HP)
- [ ] Care log updates
- [ ] Data persists after refresh
- [ ] Gallery shows beasts
- [ ] Achievements visible
- [ ] No console errors
- [ ] Mobile layout works

---

## 🚨 If Something Breaks

### App Won't Load
**Check**:
- Backend running: `curl http://localhost:3002/health`
- Frontend running on 5180
- No console errors (F12)

### Beast Won't Generate
**Check**:
- Backend responding
- Network tab shows successful POST
- No console errors

### Data Won't Save
**Check**:
- Backend/data/ directory exists
- Permission to write files
- backend/data/beasts.json should exist

---

## 📚 Documentation

For more details:
- **LOCAL_TEST_GUIDE.md** - Full testing guide
- **BEAST_QUICK_START.md** - Feature overview
- **FINAL_DEPLOYMENT_GUIDE.md** - Deployment info

---

## 🎉 Ready to Test!

Both servers are running. Start at:

## **→ http://localhost:5180/beasts ←**

Have fun with Beast Companion! 🐉✨
