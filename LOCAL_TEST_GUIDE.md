# Beast Companion - Local Testing Guide

**Status**: ✅ Both servers running and ready to test

---

## Servers Running

### Backend ✅
- **Status**: Running on http://localhost:3002
- **Command**: `npm start` (in backend folder)
- **Output**: "✅ Mind Sanctuary backend running on http://localhost:3002"

### Frontend ✅
- **Status**: Running on http://localhost:5180
- **Command**: `npm run dev` (in frontend folder)
- **Output**: "VITE v4.x.x ready in XXX ms"

---

## Access the App

### Integrated Beast Companion (In Mind Sanctuary)
```
http://localhost:5180/beasts
```

**What you'll see**:
- Mind Sanctuary header with banner
- Navigation menu including "🐉 Beast Companion"
- Full Beasts page with statistics, gallery, achievements

---

## Testing Checklist

### Test 1: Generate a Beast
1. Go to http://localhost:5180/beasts
2. Look for "Generate Your First Beast" button (if no beasts yet)
3. Click it
4. **Expected**: New beast appears with:
   - Random name (e.g., "Emberclaw", "RustyHeart")
   - Archetype (Dragon, Fox, Wolf, etc.)
   - Health: 100
   - Stage: egg
   - Emoji: 🐉, 🦊, 🐺, etc.

**Status**: ✅ Should work

---

### Test 2: Perform Care Actions
1. On Beasts page, find the 4 action buttons:
   - 🍖 Feed
   - 🎮 Play
   - ❤️ Pet
   - 😴 Rest
2. Click each button
3. **Expected**:
   - Button triggers animation (beast scale-up)
   - Health increases
   - Care log shows action
   - "FEED", "PLAY", "PET", "REST" appears briefly

**Status**: ✅ Should work

---

### Test 3: Health Changes
1. Click Feed button
   - **Expected**: +3 HP
2. Click Play button
   - **Expected**: +5 HP
3. Refresh page
   - **Expected**: Health value persists

**Status**: ✅ Should work

---

### Test 4: Care Log
1. Perform 3+ care actions
2. Look at "📋 Care Log" section
3. **Expected**: Shows:
   - Time action was performed
   - Action type (Feed, Play, Pet, Rest)
   - HP change (e.g., "+3 HP")

**Status**: ✅ Should work

---

### Test 5: Gallery View
1. Click on "🖼️ Gallery" tab
2. **Expected**:
   - Shows your beast(s)
   - Displays emoji, name, age
   - Can click to select different beast
   - Shows "✓ Alive" or "✗ Deceased" status

**Status**: ✅ Should work

---

### Test 6: Achievements
1. Scroll to Achievements section
2. **Expected**: See 6 achievements:
   - 🎉 Beast Master
   - 📅 Week of Care
   - 👑 Elder's Wisdom
   - 💪 Care Dedication
   - 🔄 Wellness Sync
   - ♻️ Circle of Life
3. Some should be locked, some unlocked based on your activity

**Status**: ✅ Should work

---

### Test 7: Data Persistence
1. Perform care actions (feed, play, etc.)
2. Refresh the page (Ctrl+R)
3. **Expected**:
   - Beast still there
   - Health value unchanged
   - Care log preserved
   - All data survives refresh

**Status**: ✅ Should work (checks backend/data/beasts.json)

---

### Test 8: Mobile Responsive
1. Open DevTools (F12)
2. Toggle device toolbar (mobile view)
3. **Expected**:
   - Layout adapts to small screen
   - Buttons stack vertically
   - Text readable
   - No horizontal scroll

**Status**: ✅ Should work

---

## API Testing (Direct Endpoints)

You can test the backend API directly:

### Test Beast Generation
```bash
# Open terminal or use browser console
curl -X POST http://localhost:3002/api/beasts/1/generate \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: JSON with new beast
```

### Test Get Current Beast
```bash
curl http://localhost:3002/api/beasts/1/current

# Response: Current beast for user 1
```

### Test Care Action
```bash
curl -X PUT http://localhost:3002/api/beasts/{beastId}/care/feed

# Response: Updated beast with new health
```

### Test Health Update from Check-in
```bash
curl -X PUT http://localhost:3002/api/beasts/{beastId}/health \
  -H "Content-Type: application/json" \
  -d '{"moodScore": 8, "sleepHours": 7, "stressLevel": 3}'

# Response: Beast health increased
```

---

## Browser Console Testing

Open DevTools (F12) and try these in console:

### Generate Beast
```javascript
fetch('http://localhost:3002/api/beasts/1/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: '{}'
})
.then(r => r.json())
.then(data => console.log(data))
```

### Get Current Beast
```javascript
fetch('http://localhost:3002/api/beasts/1/current')
  .then(r => r.json())
  .then(data => console.log(data))
```

### Feed Beast
```javascript
const beastId = 'YOUR_BEAST_ID_HERE'
fetch(`http://localhost:3002/api/beasts/${beastId}/care/feed`, {
  method: 'PUT'
})
.then(r => r.json())
.then(data => console.log('New health:', data.health))
```

---

## Troubleshooting During Testing

### "Cannot GET /beasts"
**Issue**: Frontend loaded but route not found  
**Fix**: 
- Make sure backend is running (npm start)
- Refresh frontend page
- Check http://localhost:5180 (should show Mind Sanctuary)

### "API Error" on button clicks
**Issue**: Frontend can't reach backend  
**Fix**:
- Verify backend running: `curl http://localhost:3002/health`
- Check CORS errors in console
- Restart backend: Stop then `npm start`

### No data persists after refresh
**Issue**: Data not saving  
**Fix**:
- Check `backend/data/beasts.json` exists
- Verify directory is writable
- Check console for errors
- Try restarting backend

### Beast not showing
**Issue**: Component renders but no beast  
**Fix**:
- Click "Generate Your First Beast"
- Check browser console for errors
- Verify API response in Network tab
- Try clearing browser cache

---

## Testing Data Files

### Check Stored Beasts
```bash
# View all beasts
cat backend/data/beasts.json

# Pretty print
cat backend/data/beasts.json | python -m json.tool
```

### Manual Data Reset
```bash
# Delete all beasts to start fresh
rm backend/data/beasts.json

# Backend will auto-create empty file on next API call
```

---

## Full Test Scenario (5 minutes)

Follow this to do a complete test:

1. **Access App** (30 sec)
   - Open http://localhost:5180/beasts
   - Verify loads without errors

2. **Generate Beast** (30 sec)
   - Click "Generate Your First Beast"
   - See new beast appear

3. **Perform Actions** (1 min)
   - Feed beast (watch health +3)
   - Play with beast (watch health +5)
   - Pet beast
   - Rest beast

4. **Check Persistence** (1 min)
   - Refresh page
   - Beast still there
   - Health unchanged

5. **Test Features** (1.5 min)
   - View Gallery
   - Check Achievements
   - Read Care Tips
   - See Statistics

6. **Verify Mobile** (30 sec)
   - Press F12 for DevTools
   - Toggle mobile view
   - Check responsive design

**Total time**: ~5 minutes for full verification

---

## Performance Check

During testing, monitor:

1. **Page Load Time**: Should be <2 seconds
2. **Button Response**: Action should feel instant (<100ms)
3. **Refresh Time**: Data should reload <1 second
4. **Console**: Should be clean (no errors/warnings)

---

## Known Behaviors

These are EXPECTED and correct:

✅ First load takes longer (Vite bundling)  
✅ Refresh preserves all data (JSON storage)  
✅ Multiple beasts show in gallery  
✅ Health slowly decreases after 24h no interaction (decay system)  
✅ Beast emoji always shows 🐉 for Dragon, 🦊 for Fox, etc.  

---

## What to Report as Bugs

If you find something broken:

❌ Button doesn't respond  
❌ Console shows errors  
❌ Data doesn't persist  
❌ Page crashes  
❌ Layout breaks on mobile  
❌ API returns error status  

---

## What's NOT Bugs (Expected Limitations)

These are intentional for MVP:

✅ All beasts use emoji (not AI images)  
✅ No user login (testing with userId=1)  
✅ No breeding yet  
✅ No social features  
✅ No achievements notifications  

---

## Next Steps After Local Testing

1. ✅ Complete local test above
2. ✅ Verify all features work
3. ✅ Check no console errors
4. ✅ Confirm data persists
5. 🚀 Ready to deploy!

---

## Testing Commands Quick Reference

```bash
# Start backend
cd d:\mindwell-app\backend
npm start

# Start frontend (new terminal)
cd d:\mindwell-app\frontend
npm run dev

# Test API
curl http://localhost:3002/api/beasts/1/current

# View stored data
cat d:\mindwell-app\backend\data\beasts.json

# Stop either server
Ctrl+C
```

---

## Have Fun! 🐉

Beast Companion is ready to test. Generate some beasts, feed them, watch them evolve!

Questions? Check the console (F12) for error details.

**Status**: ✅ Ready to test - enjoy! 🎉
