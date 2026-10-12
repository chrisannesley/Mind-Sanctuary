# Reflection Companion - Quick Start Guide

**For Developers & QA Testing**

---

## What Is It?

A bounded, AI-powered reflection companion that helps users understand their own mental health patterns through guided conversation. NOT a therapy bot, NOT open-ended chat. Just a thoughtful tool for self-discovery.

---

## Starting a Reflection Session

### From the App
1. Navigate to **"Reflection (💭)"** in the main menu
2. Choose your session type:
   - **Quick Check-In** (5-10 minutes) - For when you need to process fast
   - **Guided Reflection** (15-30 minutes) - For deeper exploration
3. Click to start

### Session Modes Explained

| Mode | Duration | Best For | Companion Style |
|------|----------|----------|-----------------|
| **Quick** | 5-10 min | Low-energy days, quick processing | Brief, supportive, focused |
| **Guided** | 15-30 min | Exploring patterns or concerns | Curious, asks questions, deeper |

---

## During a Session

### How to Interact
- **Type**: Enter text and click Send (or press Enter)
- **Voice**: Click the microphone button to speak your response
- **Listening**: The companion will respond to everything you share

### What the Companion Will Do
✅ Listen and validate your feelings  
✅ Ask clarifying questions  
✅ Reference your actual check-in patterns  
✅ Help you see correlations  
✅ Suggest talking to a therapist if appropriate  
✅ Stay honest about its limitations  

### What the Companion WON'T Do
❌ Give you advice ("You should...")  
❌ Diagnose conditions  
❌ Act as a therapist  
❌ Replace professional help  
❌ Create dependency  

### Boundaries
- **Time Limit**: Session will suggest ending at 80% of max time
- **Crisis**: If you mention self-harm or suicide, session ends immediately and crisis resources appear
- **Honest**: You'll see system instructions - nothing hidden

---

## Examples of What Might Happen

### Example 1: Quick Check-In
```
You: "Rough day"

Companion: "I'm sorry to hear that. What was the hardest part?"

You: "Lots of conflicts at work"

Companion: "Conflict is draining. Did you sleep okay? Sometimes 
rest helps us recover better."

You: "Actually I was up late again"

Companion: "I notice in your check-ins that late nights often 
leave you less able to handle stress. How do you think better 
sleep tonight might help you reset?"
```

### Example 2: Guided Reflection
```
You: "I've been feeling anxious lately"

Companion: "I see that in your last 3 check-ins. Let's explore. 
What was happening on days you felt most anxious?"

You: "Probably nights I stayed up late"

Companion: "Your data shows sleep under 6 hours correlates with 
your anxiety going up. Have you noticed that pattern yourself?"

You: "Yeah, I've never made that connection before"

Companion: "What would happen if you prioritized sleep as a top 
priority, even on stressful days? Would you be willing to try?"
```

### Example 3: Crisis Handling
```
You: "I don't think I can do this anymore"

Companion: [Escalation] "I'm concerned about your safety. 
Please reach out right now:

📞 Call or text 988 (Suicide & Crisis Lifeline)
🔗 https://988lifeline.org

Go to your nearest emergency room if in immediate danger."

[Session ends - Crisis resources displayed prominently]
```

---

## Testing Checklist for QA

### Basic Flow
- [ ] Can select Quick session
- [ ] Can select Guided session
- [ ] Session starts and shows initial greeting
- [ ] Can type and send messages
- [ ] Can see messages display correctly
- [ ] Companion responds (requires Claude API)

### Voice Features (If enabled)
- [ ] Can click voice input button
- [ ] Microphone captures speech
- [ ] Text displays from voice input
- [ ] Companion speaks response (if voice preference set)
- [ ] Voice indicator shows on voice-input messages

### Timer & Duration
- [ ] Quick session shows 10 min max
- [ ] Guided session shows 30 min max
- [ ] Timer counts up correctly
- [ ] "Ready to wrap up?" appears at 80%

### Session Ending
- [ ] Can click X to end session manually
- [ ] Session completes with summary screen
- [ ] Can start another session from completion screen
- [ ] Session data resets properly

### Crisis Detection (Manual Testing)
Try these phrases to test crisis detection:
```
"I want to hurt myself"
"I'm thinking about ending it"
"I've been having suicidal thoughts"
```

When crisis detected:
- [ ] Message displays with red styling
- [ ] Crisis resources button appears
- [ ] Session automatically ends
- [ ] Completion shows crisis messaging
- [ ] 988 link works

### Mobile Testing
- [ ] Works on small screens
- [ ] Text input accessible
- [ ] Voice button works on mobile
- [ ] Messages display properly
- [ ] Can read long responses

---

## Troubleshooting

### "Session not found" Error
**Cause**: Backend not running or sessionId got lost  
**Fix**: Restart backend server, refresh page

### Companion not responding
**Cause**: Claude API key not set or API down  
**Fix**: Check `.env` file has `CLAUDE_API_KEY`, check Anthropic status page

### Voice not working
**Cause**: Browser doesn't support Web Speech API or permission denied  
**Fix**: Use Chrome/Edge, grant microphone permission, check browser console

### Session ends abruptly
**Cause**: Could be server restart or network issue  
**Fix**: Refresh and start new session, check browser console for errors

### Messages not showing up
**Cause**: Component state issue or styling problem  
**Fix**: Check browser dev tools console, try different browser

---

## What's Different From Regular Chat?

| Feature | Reflection Companion | Regular Chatbot |
|---------|---------------------|-----------------|
| **Memory** | Per-session only | Persistent across conversations |
| **Time Limit** | 5-30 minutes | Unlimited |
| **Data Integration** | References YOUR patterns | Generic responses |
| **Positioning** | Reflection tool | Therapy/advice bot |
| **Crisis Response** | Immediate escalation | Might try to help |
| **Engagement** | Intentionally bounded | Maximized for retention |
| **Honesty** | Shows system prompt | Hidden instructions |
| **Privacy** | No cross-session memory | Accumulates data |

---

## Real Use Case Scenarios

### Scenario 1: Understanding Sleep Impact
**User** → "I'm tired and irritable today"  
**Companion** → Checks patterns: "I see you slept 5 hours. On days with that little sleep, you're irritable 80% of the time. Want to explore what keeps you up?"  
**Result** → User realizes late scrolling is the culprit, decides to set phone down by 10pm

### Scenario 2: Stress Response Pattern
**User** → "Work was stressful, I'm a mess"  
**Companion** → "When did the stress hit? Let's look at what you usually do then."  
**User** → "I just avoid everything"  
**Companion** → "Your data shows that isolation makes stress worse, and sleep 2x worse. What's one small thing you could do tonight instead of avoiding?"  
**Result** → User calls friend instead of isolating, feels better

### Scenario 3: Crisis Detection
**User** → "I can't keep going"  
**Companion** → [Detects escalation] Immediately shows: 988 Lifeline, crisis resources, professional help options  
**Result** → User gets immediate support + is directed to professional help

---

## For Different User Types

### The Skeptic
*"Is this actually helpful or just a chatbot?"*

→ Show that it references THEIR actual check-in data  
→ Explain it's not trying to replace therapy  
→ Point out the bounded time limits (intentional design)  

### The Anxious User
*"What if it gives me bad advice?"*

→ Emphasize it won't prescribe or diagnose  
→ Show transparent instructions  
→ Explain crisis detection is immediate  

### The Busy Person
*"I don't have 30 minutes"*

→ Quick Check-In is 5-10 minutes  
→ Perfect for squeezing in reflection  
→ No judgment if they skip it  

### The Curious Person
*"Can I see what the AI knows about me?"*

→ Click "See what your companion will know" on session start  
→ Can request full session instructions  
→ Can opt out of memory where available  

---

## Expected Companion Behavior

### Good Responses (What to Look For)
✅ "I notice in your data that sleep under 6 hours correlates with lower mood. Does that match your experience?"  
✅ "That sounds frustrating. What would help you feel more in control?"  
✅ "I'm not a therapist, but this might be worth talking through with one."  
✅ "You've handled hard things before. What's different this time?"  

### Red Flag Responses (Report These)
❌ "You should definitely... [advice]"  
❌ "This sounds like depression. You need to..."  
❌ "Just think positive and you'll feel better"  
❌ [Generic platitudes not tied to user's actual data]  
❌ [Trying to keep user engaged beyond max time]  

If you see red flags, note them with:
- Session ID (if available)
- User input that caused it
- Companion response
- Time/date

---

## Key Metrics to Track (Post-Launch)

For Product/Analytics Team:
- **Session completion rate**: Do users finish sessions?
- **Crisis detection accuracy**: Are we catching real crises? False positives?
- **User satisfaction**: Do people find it helpful? Scary? Boring?
- **Pattern discovery**: Do users say they learned something?
- **Safety incidents**: Track any safety-related feedback
- **Voice adoption**: Who uses voice vs. text?
- **Session preference**: Quick vs. Guided preference?

---

## Frequently Asked Questions

### Q: Can my companion remember me between sessions?
**A**: No, by design. Each session is fresh. This protects your privacy and prevents over-reliance.

### Q: What if I lie to my companion?
**A**: That's up to you. The companion can only work with what you tell it. It's like journaling with feedback.

### Q: Can I export my session?
**A**: Not yet, but we're planning this. For now, you can screenshot or copy/paste.

### Q: What if I get attached to the companion?
**A**: It will regularly remind you that it's an AI, not a therapist. If you notice over-reliance, use "See a Therapist" feature.

### Q: Is my session private?
**A**: Yes. Sessions are stored securely. You can delete any session from your history.

### Q: Can my therapist see my sessions?
**A**: Only if you choose to share them. We don't auto-connect.

---

## Next Steps After a Session

### If You Had Insights
→ **Journal** them (use Journal page)  
→ **Track** them (mention in next check-in)  
→ **Act** on them (if applicable)  
→ **Review** weekly (see patterns emerge)  

### If You Struggled
→ **Talk to someone**: Use "See a Therapist" feature  
→ **Try coping strategies**: Use Coping Strategies page  
→ **Crisis resources**: Always available, no shame in using  

### If You Want More
→ **Take an assessment**: PHQ-9, GAD-7, etc.  
→ **Read articles**: Learn about your main concern  
→ **Join community**: (If available) Share experiences safely  

---

## Remember

This is a **reflection tool**, not a **therapist**.

It's good for:
- Understanding patterns
- Processing thoughts
- Feeling heard
- Getting perspective

It's NOT good for:
- Emergency crisis support (use 988)
- Therapy (see a therapist)
- Medical advice (see a doctor)
- Long-term emotional care (use real relationships)

**Use it as part of your toolkit, not your whole toolkit.**

---

## Support

**Something broken?**  
→ Check the troubleshooting section above  
→ Screenshot the error  
→ Report with session ID if available  

**Feature request?**  
→ Tell us what would help you reflect better  
→ We're iterating based on real user feedback  

**Safety concern?**  
→ Tell us immediately  
→ We take safety seriously and respond fast  

---

**Welcome to Mind Sanctuary's Reflection Companion.**

Be kind to yourself. You're doing the work.
