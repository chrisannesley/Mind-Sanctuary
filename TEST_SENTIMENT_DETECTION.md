# 🧪 Sentiment Detection Test Cases

## Test the Fix

Go to http://localhost:5174/avatar and try these messages:

---

## ✅ Should Get STRUGGLING Response

### Test 1: The Original Problem
```
User: "I'm not doing that great today"
Expected: Struggling response acknowledging "not doing well"
Example: "I hear you, and I'm really sorry you're not doing well today..."
```

### Test 2: Negated Good
```
User: "I'm not feeling good"
Expected: Struggling response
```

### Test 3: Negated Great
```
User: "I'm not doing great"
Expected: Struggling response
```

### Test 4: Negated Okay
```
User: "I'm not okay"
Expected: Struggling response
```

### Test 5: Negated Well
```
User: "I'm not doing well"
Expected: Struggling response
```

### Test 6: Direct Struggling
```
User: "I'm struggling"
Expected: Struggling response
```

### Test 7: Anxious
```
User: "I'm feeling anxious"
Expected: Struggling response
```

### Test 8: Overwhelmed
```
User: "I'm overwhelmed"
Expected: Struggling response
```

### Test 9: Depressed
```
User: "I'm feeling depressed"
Expected: Struggling response
```

### Test 10: Stressed
```
User: "I'm really stressed"
Expected: Struggling response
```

---

## ✅ Should Get POSITIVE Response

### Test 11: Actual Good
```
User: "I'm feeling good today!"
Expected: Positive response celebrating
Example: "That's wonderful to hear! I'm genuinely happy for you..."
```

### Test 12: Actual Great
```
User: "I'm doing great!"
Expected: Positive response
```

### Test 13: Happy
```
User: "I'm feeling happy!"
Expected: Positive response
```

### Test 14: Amazing
```
User: "I'm feeling amazing!"
Expected: Positive response
```

### Test 15: Wonderful
```
User: "I'm having a wonderful day!"
Expected: Positive response
```

### Test 16: Excellent
```
User: "Everything is excellent!"
Expected: Positive response
```

### Test 17: Fantastic
```
User: "I'm feeling fantastic!"
Expected: Positive response
```

### Test 18: Love
```
User: "I love how I'm feeling!"
Expected: Positive response
```

---

## ✅ Should Get NEUTRAL Response

### Test 19: Thinking
```
User: "I've been thinking about my future"
Expected: Neutral response asking more
Example: "That's interesting. How does that make you feel?..."
```

### Test 20: Uncertain
```
User: "I'm not sure how I feel"
Expected: Neutral response
```

### Test 21: Reflecting
```
User: "I'm just reflecting on things"
Expected: Neutral response
```

### Test 22: Wondering
```
User: "I've been wondering about things"
Expected: Neutral response
```

### Test 23: Considering
```
User: "I'm considering some changes"
Expected: Neutral response
```

---

## Critical Test: The Original Problem

**This is the most important test:**

```
User: "I'm not doing that great today"
Old (WRONG): "That's a really healthy approach. I'm genuinely proud of you for taking these steps. What's been helping you feel this way?"
New (CORRECT): "I hear you, and I'm really sorry you're not doing well today. That sounds tough. Can you tell me what's been making today particularly difficult?"
```

**Verify**: The response should acknowledge that you're NOT doing well, not celebrate you.

---

## How to Run Tests

1. Go to http://localhost:5174/avatar
2. Click "Start Conversation"
3. Type each test message
4. Check if the response matches the expected type
5. Note any mismatches

---

## What to Look For

✅ **Struggling Response Should**:
- Acknowledge you're not doing well
- Show empathy
- Ask what's wrong
- Offer support
- Use your name if available

✅ **Positive Response Should**:
- Celebrate your success
- Show genuine happiness
- Ask what's helping
- Encourage continuation

✅ **Neutral Response Should**:
- Show genuine interest
- Ask open-ended questions
- Invite deeper sharing
- Not assume positive or negative

---

## Reporting Issues

If a response is wrong:
1. Note the exact message you typed
2. Note what response you got
3. Note what response you expected
4. Report it so we can refine further

---

**Status**: Ready for testing  
**Last Updated**: May 28, 2026
