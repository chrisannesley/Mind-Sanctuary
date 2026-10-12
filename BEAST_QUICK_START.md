# Beast Companion - Quick Start Guide
**For**: Next developer integrating into Mind Sanctuary  
**Estimated Time**: 30 minutes  
**Difficulty**: Low

---

## Current Status
✅ Backend: Complete and tested  
✅ Frontend components: Complete and styled  
⏳ Integration: Not yet wired into app  

---

## What Needs to Be Done

### 1. Add Navigation Link (2 min)
Edit: `frontend/src/components/Navigation.jsx`

```jsx
// Find the navigation menu items array, add:
{
  icon: '🐉',
  label: 'Beasts',
  href: '/beasts'
}
```

### 2. Add Route (2 min)
Edit: `frontend/src/App.jsx`

```jsx
// Add import at top
import Beasts from './pages/Beasts'

// Add route in your route configuration:
<Route path="/beasts" element={<Beasts userId={userId} />} />
```

### 3. Hook Check-in Completion (10 min)
Edit: `frontend/src/pages/CheckIn.jsx`

Find where check-in is submitted/saved, add after:

```jsx
// After check-in is completed successfully:
const updateBeastHealth = async () => {
  try {
    // Get user's current beast
    const beastResponse = await fetch(`http://localhost:3002/api/beasts/${userId}/current`)
    if (!beastResponse.ok) return
    
    const beast = await beastResponse.json()
    if (!beast || !beast.id) return
    
    // Update beast health from check-in data
    const healthResponse = await fetch(
      `http://localhost:3002/api/beasts/${beast.id}/health`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodScore: checkInData.mood || 5,
          sleepHours: checkInData.sleep?.hours || 7,
          stressLevel: checkInData.stress?.level || 5
        })
      }
    )
    
    if (healthResponse.ok) {
      const updatedBeast = await healthResponse.json()
      console.log(`Beast health updated: ${updatedBeast.name} is now ${updatedBeast.health}HP`)
      // Optional: Show toast notification to user
      // showNotification(`${updatedBeast.name} gained ${healthResponse.hpChange} HP from your check-in!`)
    }
  } catch (error) {
    console.error('Error updating beast health:', error)
    // Silently fail - don't break check-in flow
  }
}

// Call after check-in submission
await updateBeastHealth()
```

### 4. Optional: Display Beast on Home (10 min)
Edit: `frontend/src/pages/Home.jsx` or dashboard component

```jsx
// Add to home page
import { useState, useEffect } from 'react'

function BeastStatus({ userId }) {
  const [beast, setBeast] = useState(null)
  
  useEffect(() => {
    fetch(`http://localhost:3002/api/beasts/${userId}/current`)
      .then(r => r.json())
      .then(setBeast)
      .catch(err => console.error('Error loading beast:', err))
  }, [userId])
  
  if (!beast) return null
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="text-5xl">{beast.generatedImage || '🐉'}</div>
        <div className="flex-1">
          <p className="text-xl font-bold">{beast.name}</p>
          <p className="text-gray-600">{beast.archetype} • {beast.stage}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">Health</span>
              <span className="text-sm font-bold">{beast.health}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${beast.health}%` }}
              />
            </div>
          </div>
        </div>
        <a 
          href="/beasts"
          className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Care
        </a>
      </div>
    </div>
  )
}
```

---

## Testing After Integration

### 1. Generate a Beast
- Navigate to Beasts page
- Click "Generate Your First Beast"
- Verify beast appears with random name, archetype, traits

### 2. Perform Care Action
- Click Feed/Play/Pet/Rest button
- Verify:
  - Beast shows animation
  - Health increases
  - Action appears in care log

### 3. Complete Check-in
- Go to Check-in page
- Complete a check-in with good mood/sleep
- Return to Beasts page
- Verify health increased

### 4. Check Persistence
- Refresh page
- Verify beast data still there
- Check backend/data/beasts.json file exists

---

## Troubleshooting

### "Cannot GET /api/beasts/1"
**Issue**: Backend not running  
**Fix**: Ensure backend running: `npm start` in backend directory

### Beast not appearing after generation
**Issue**: Frontend not calling API  
**Fix**: Check browser console for errors, verify API URL is correct

### Check-in hook not updating beast
**Issue**: Hook not called or bad request  
**Fix**: Check network tab in DevTools, verify JSON format matches spec

### Beasts data lost after restart
**Issue**: Backend not persisting  
**Fix**: Check that `backend/data/beasts.json` exists and is writable

---

## API Reference (For Testing)

### Generate Beast
```bash
curl -X POST http://localhost:3002/api/beasts/1/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Get Current Beast
```bash
curl http://localhost:3002/api/beasts/1/current
```

### Feed Beast
```bash
curl -X PUT http://localhost:3002/api/beasts/{beastId}/care/feed
```

### Update Health from Check-in
```bash
curl -X PUT http://localhost:3002/api/beasts/{beastId}/health \
  -H "Content-Type: application/json" \
  -d '{"moodScore": 8, "sleepHours": 7, "stressLevel": 3}'
```

### Get All Beasts
```bash
curl http://localhost:3002/api/beasts/1
```

---

## File Locations

| Component | Location |
|-----------|----------|
| Main Backend | `backend/src/models/Beast.js` |
| API Routes | `backend/src/routes/beasts.js` |
| UI Component | `frontend/src/components/BeastCompanion.jsx` |
| Full Page | `frontend/src/pages/Beasts.jsx` |
| Data Storage | `backend/data/beasts.json` |
| Spec Document | `BEAST_COMPANION_SPEC.md` |
| Implementation Docs | `BEAST_BACKEND_IMPLEMENTATION.md` |

---

## Code Snippets Ready to Copy

### Navigation Link
```jsx
{
  icon: '🐉',
  label: 'Beasts',
  href: '/beasts',
  onClick: () => navigate('/beasts')
}
```

### Route Configuration
```jsx
<Route path="/beasts" element={<Beasts userId={userId} />} />
```

### Check-in Hook (Minimal)
```jsx
// In check-in submission handler
const updateBeastHealth = async () => {
  try {
    const current = await fetch(`http://localhost:3002/api/beasts/${userId}/current`).then(r => r.json())
    if (current?.id) {
      await fetch(`http://localhost:3002/api/beasts/${current.id}/health`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodScore: mood,
          sleepHours: sleep,
          stressLevel: stress
        })
      })
    }
  } catch (error) {
    console.error('Beast health update failed:', error)
  }
}
await updateBeastHealth()
```

---

## Key Concepts (For Understanding)

### Beast Lifecycle
```
User does daily check-in
  ↓
Beast health updated from mood/sleep/stress
  ↓
If health > threshold, beast gets happy
  ↓
If health < threshold, beast gets sad
  ↓
If health = 0, beast dies
  ↓
User can resurrect or create new beast
```

### Health Formula
- **Check-in**: +10 HP baseline
- **Good mood (7-10)**: Additional +5 HP
- **Good sleep (7+ hrs)**: Additional +5 HP
- **Low stress**: Additional +5 HP
- **Decay**: -3 HP/hour after 24 hrs no interaction

### Why It Works
- Gamers understand pet mechanics
- Death creates stakes (no "always win" mentality)
- Wellness habits = pet health (natural connection)
- No grinding required (daily check-in sufficient)
- Optional engagement (care actions boost faster)

---

## What NOT to Change

❌ Don't modify Beast.js model logic  
❌ Don't change health calculation formulas  
❌ Don't add database yet (use file storage MVP)  
❌ Don't add real image generation yet (emoji MVP)  

---

## What You CAN Customize

✅ UI colors/styling in BeastCompanion.jsx  
✅ Beast archetype list (add more in Beast.js)  
✅ Care action names/icons  
✅ Achievement definitions in Beasts.jsx  
✅ Notification messages  
✅ Care tips content  

---

## Success Checklist

After integration, verify:

- [ ] Beasts link appears in navigation
- [ ] Beasts page loads and renders correctly
- [ ] Can generate new beast
- [ ] Can perform care actions (feed/play/pet/rest)
- [ ] Health bar updates on actions
- [ ] Care log shows recent activities
- [ ] Gallery displays all beasts
- [ ] Achievements unlock properly
- [ ] Check-in completion increases beast health
- [ ] Data persists after page reload
- [ ] No console errors

---

## Estimated Time Breakdown

| Task | Time |
|------|------|
| Add Navigation Link | 2 min |
| Add Route | 2 min |
| Check-in Hook | 10 min |
| Testing & Verification | 10 min |
| Optional: Home Display | 10 min |
| **Total** | **30 min** |

---

## Additional Resources

- **Full Spec**: `BEAST_COMPANION_SPEC.md` (design + architecture)
- **Backend Docs**: `BEAST_BACKEND_IMPLEMENTATION.md` (API details)
- **Implementation Notes**: `BEAST_COMPANION_IMPLEMENTATION_SUMMARY.md` (overview)

---

## Questions? Check Here

**Q: Where's the beast data stored?**  
A: `backend/data/beasts.json` - JSON file, auto-created

**Q: Can multiple users have beasts?**  
A: Yes, they're isolated by `userId`

**Q: What if backend is down?**  
A: Frontend falls back to mock data

**Q: Can I delete beasts?**  
A: Currently, only resurrect or let them die naturally. Add delete endpoint if needed.

**Q: How do I add new archetypes?**  
A: Edit `ARCHETYPES` array in `Beast.js`, add emoji mapping

**Q: When will AI images be added?**  
A: Design phase complete, implementation planned for Phase 2

---

**Ready to integrate? You've got this! 🚀**
