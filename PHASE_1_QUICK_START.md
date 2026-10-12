# Phase 1 Quick Start Guide - Testing Mind Sanctuary

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Backend
```bash
cd d:\mindwell-app\backend
npm start
```
Expected output: `✅ MindWell backend running on http://localhost:3002`

### Step 2: Start the Frontend
```bash
cd d:\mindwell-app\frontend
npm run dev
```
Expected output: `VITE v... ready in ... ms`

### Step 3: Open in Browser
Navigate to: http://localhost:5174

You should see the Mind Sanctuary home page with:
- Welcome banner ("Mind Sanctuary - Your private companion...")
- Crisis resources footer (red bar at top)
- Weekly insights section (if any check-ins exist)
- Feature grid
- Crisis resources details
- About section

---

## 🧪 Testing Scenarios

### Scenario 1: First-Time Check-In (NEW)

**Steps**:
1. Click "Daily Check-In" (📝 icon) or go to `/checkin`
2. **Mood**: Set to 6/10
3. **Energy**: Set to 5/10
4. **Sleep**: Enter 7 hours, select "good"
5. **Stress**: Set to 5/10
6. **Social**: Select "with family"
7. Click "▶ Additional Details" to expand
8. **Triggers**: Type "work deadline"
9. **Symptoms**: Check "tension"
10. **What Could Help**: Type "walk outside"
11. **Note**: Type "Busy day but manageable"
12. Click "Save Check-In"
13. Modal appears showing summary - click "Save Check-In" to confirm

**Expected Result**:
- ✅ Green success message
- ✅ Check-in saved (button changes to "Already Checked In Today")
- ✅ Journal prompt appears

---

### Scenario 2: Multiple Check-Ins (Pattern Detection)

**Steps**:
1. Complete scenario 1
2. **Tomorrow** (in test, you can manipulate dates by changing system time OR manually edit the database)
3. Come back to check-in page
4. Fill in different values:
   - Day 1: Mood 5, Stress 8
   - Day 2: Mood 4, Stress 7
   - Day 3: Mood 6, Stress 5
   - etc. (enter at least 7 check-ins with varying stress/mood)
5. Go to Home page (/)

**Expected Result**:
- ✅ "Weekly Patterns" section appears with data
- ✅ Mood trend chart shows all days
- ✅ Patterns detected if correlations >30%
- ✅ Top stressors listed
- ✅ Tips provided for each pattern

---

### Scenario 3: Crisis Resources

**Steps**:
1. Go to Home page
2. Look for red "🆘 You're Not Alone" section at top (compact footer)
3. Change country selector (dropdown at top right)
4. Scroll down to see full Crisis Resources section
5. Click on different countries
6. Try clicking phone number (should open dial)
7. Check if links open

**Expected Result**:
- ✅ Resources load for selected country
- ✅ Phone links are clickable
- ✅ Website links open in new tab
- ✅ Design is attractive and not scary
- ✅ Messaging is compassionate

---

### Scenario 4: Mobile Responsiveness

**Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12" or "Pixel 5"
4. Navigate through all pages:
   - Home
   - Check-In form
   - Assessments
   - Articles
5. Test form fields, buttons, text readability

**Expected Result**:
- ✅ All text readable (16px+ minimum)
- ✅ Buttons large enough to tap
- ✅ Forms don't overflow
- ✅ No horizontal scrolling needed
- ✅ Layout adapts smoothly

---

## 🐛 Known Behaviors (Not Bugs)

1. **One check-in per day**: If you check in once, button disables until tomorrow
   - *Why*: Prevents duplicate daily data
   - *Fix for testing*: Edit system time or database

2. **Patterns need 7 days**: Pattern detection starts at day 7
   - *Why*: Need enough data for statistical confidence
   - *Fix for testing*: Add multiple check-ins manually to DB

3. **Weekly patterns reset Sunday**: Week is Mon-Sun
   - *Why*: Standard business week
   - *Expected*: Friday check shows only 5 days

4. **Energy/Sleep fields optional**: Some might be empty
   - *Why*: User might not want to fill all
   - *Expected*: Shows 0 or N/A in averages

---

## 📊 Test Data Queries

### Check if Data Saved
```bash
# In terminal, from backend directory:
node -e "const fs = require('fs'); console.log(JSON.stringify(JSON.parse(fs.readFileSync('./mindwell.db')).checkIns, null, 2))"
```

### View Latest Check-In
```bash
# Same as above, but look for last item in array
```

### Test Pattern Endpoint Directly
```bash
# In browser console or Postman:
fetch('http://localhost:3002/api/checkins/patterns/1')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

### Test Weekly Summary
```bash
fetch('http://localhost:3002/api/checkins/weekly-summary/1')
  .then(r => r.json())
  .then(d => console.log(JSON.stringify(d, null, 2)))
```

---

## ✅ Acceptance Criteria

### Form Submission
- [ ] All 5 main fields required (mood, energy, sleep, stress, social)
- [ ] Optional fields don't break if empty
- [ ] Modal shows summary before saving
- [ ] Success message appears on save
- [ ] Button disables after today's check-in

### Pattern Detection
- [ ] With <7 check-ins: Shows "need more data"
- [ ] With 7+ check-ins: Shows detected patterns
- [ ] Correlation shows 0-100%
- [ ] Suggestions are specific to pattern type
- [ ] At least one pattern detected if data varies

### Weekly Summary
- [ ] Averages calculated correctly (math check)
- [ ] Trend chart shows all 7 days
- [ ] Top triggers extracted correctly
- [ ] No errors in console
- [ ] Mobile view works

### Crisis Resources
- [ ] At least 7 countries available
- [ ] Phone numbers clickable
- [ ] Links open correctly
- [ ] Design is accessible and not scary
- [ ] Messaging is compassionate

### UI/UX
- [ ] No console errors
- [ ] Form responsive on mobile
- [ ] Colors are readable (AA accessibility)
- [ ] Emojis display correctly
- [ ] Loading states show while data fetches

---

## 🎯 Top 5 Things to Test First

1. **Fill out check-in form completely** - Main user interaction
2. **Verify data saves to database** - Data persistence
3. **Submit 7+ check-ins** - Pattern detection needs data
4. **View weekly insights on home page** - Key feature
5. **Check crisis resources work** - Safety critical

---

## 📱 Recommended Test Devices

- **Desktop**: Chrome (latest)
- **Tablet**: iPad (via DevTools)
- **Mobile**: iPhone 12 or Pixel 5 (via DevTools)

---

## 🐞 Reporting Issues

If you find something wrong:

1. **Write down steps to reproduce**
2. **Note what you expected vs what happened**
3. **Check browser console (F12) for errors**
4. **Include error message if any**
5. **Screenshot if UI issue**

Example:
```
Title: Check-in form doesn't submit
Steps:
  1. Go to /checkin
  2. Fill all fields
  3. Click Save Check-In
  4. Click Save in modal
Expected: Success message appears
Actual: Button stays in loading state, never completes
Console Error: "TypeError: createCheckIn is not defined"
```

---

## 💡 Pro Testing Tips

- **Use different moods/stresses** to create varied data for patterns
- **Test edge cases**: All 1s, all 10s, mix of values
- **Check at different times of day** for realistic usage
- **Test with network slow** (DevTools → Throttling) for UX
- **Test without optional fields** to ensure graceful handling

---

## 🎉 Success Metrics

After testing, you should see:
- ✅ Users can complete daily check-in in <5 minutes
- ✅ Data visualizations appear after 7 days
- ✅ Crisis resources always accessible
- ✅ No errors in console
- ✅ Mobile experience works smoothly
- ✅ Patterns are interesting and actionable

---

## 🚀 Ready to Test?

1. Start backend: `npm start` (from backend dir)
2. Start frontend: `npm run dev` (from frontend dir)
3. Open http://localhost:5174
4. Begin testing with scenarios above
5. Report issues or feedback

**Happy testing! 🧪**

