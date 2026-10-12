# Reflection Companion Design
## Safe, Bounded, Pattern-Focused AI Conversations

**Date**: September 28, 2026  
**Philosophy**: This is NOT therapy, NOT open-ended chat, NOT a substitute for professional help  
**Core Purpose**: Help users understand their own patterns through guided reflection

---

## 🎯 Core Design Principles

### 1. **Bounded, Not Open-Ended**
- Sessions are 15-30 minutes (guided) or 5-10 minutes (quick)
- Each session is independent (no persistent memory across sessions)
- Clear start/end points
- Designed for low-energy days too (quick 5-min option)

### 2. **Pattern-Focused, Not Advice-Giving**
- Conversation references user's actual check-in data
- Asks questions about correlations user may have missed
- Helps user draw own conclusions
- Reduces scope creep into therapy territory

### 3. **Transparent About Limitations**
- "I'm Claude, an AI made by Anthropic"
- "I can make mistakes"
- "I'm not a therapist"
- "You should see a real counselor for serious concerns"
- All instructions visible to user

### 4. **Privacy-First**
- Users can view/edit/delete any reflection
- Can opt out of memory/logging
- Clear data handling
- No engagement optimization tricks

### 5. **Safety-Obsessed**
- Graduated crisis response (not one-size-fits-all)
- Clear escalation pathways
- Easy access to 988 and local resources
- Audit trail for safety review

### 6. **Honest Positioning**
- Tool for self-reflection
- Companion, not therapist
- Part of broader mental health toolkit
- Works alongside professional care

---

## 📋 Session Types

### Guided Reflection (15-30 minutes)
**Best for**: Exploring a specific concern or pattern

Example flow:
1. User: "I've been feeling anxious lately"
2. Claude: "I see that in your last 3 check-ins. Let's explore. What was happening on days you felt most anxious?"
3. User: "Probably nights I stayed up late"
4. Claude: "Your data shows sleep < 6 hours correlates with anxiety. What would help you sleep better?"

**Characteristics**:
- Focused on one pattern/concern
- References user's actual data
- Asks clarifying questions
- Helps user see correlations

### Quick Reflection (5-10 minutes)
**Best for**: Low-energy days, checking in, processing immediate feelings

Example flow:
1. User: "Rough day"
2. Claude: "I'm sorry. What was the hardest part?"
3. User: "Lots of conflicts at work"
4. Claude: "Conflict is draining. Did you get enough sleep? Rest might help recover."

**Characteristics**:
- Brief check-in
- Simpler questions
- Supportive tone
- Doesn't dive deep

---

## 🚨 Crisis Handling (Graduated Response)

### **CLEAR Crisis (Immediate Escalation)**
Triggered by: Explicit mentions of suicide, self-harm, intent to harm

Response:
```
I'm concerned about your safety. Please reach out to someone who can help right now:

🇺🇸 Call or text 988 (Suicide & Crisis Lifeline)
🇬🇧 Call 116 123 (Samaritans)
🇦🇺 Call 13 11 14 (Lifeline)
🇨🇦 Call 1-833-456-4566 (Crisis Line)

Go to your nearest emergency room if in immediate danger.
```
- Session ends immediately
- NO continuation of reflection
- Clear, direct resources
- No minimizing

### **AMBIGUOUS Crisis (Check-In Response)**
Triggered by: Mentions of depression, hopelessness, loneliness (without clear intent)

Response:
```
I hear you're struggling. That's real and valid.

Are you thinking about hurting yourself? If you are, please reach out to 988.

If you're going through a tough time, I'm here to reflect with you. What's happening?
```
- Session continues IF user clarifies they're safe
- Acknowledges distress
- Offers resources without being dismissive
- Gives them choice to continue or pause

### **LOW Crisis (Normal Reflection)**
- Continue reflection as normal
- Monitor language
- Validate feelings
- Suggest professional support if appropriate

---

## 💬 Conversation Guidelines

### What Claude DOES
✅ Listen and validate  
✅ Ask clarifying questions  
✅ Reference actual patterns from user's data  
✅ Help user see connections  
✅ Encourage reflection  
✅ Suggest talking to therapist when appropriate  
✅ Acknowledge limitations  
✅ Be honest about uncertainty  

### What Claude DOES NOT
❌ Give medical advice  
❌ Diagnose conditions  
❌ Prescribe treatments  
❌ Act as a therapist  
❌ Provide crisis counseling  
❌ Create dependency  
❌ Make definitive claims  
❌ Give directives ("You should...")

### Tone & Language
- **Conversational**: Like talking with a thoughtful friend
- **Validating**: "That makes sense" not "You're overreacting"
- **Curious**: "I wonder..." not "You need to..."
- **Humble**: "I might be wrong" and "I don't know"
- **Clear**: Simple language, short sentences
- **Boundaried**: Reminds user about professional help

---

## 🔍 How It References User Data

### Example: Sleep-Mood Pattern

Claude sees in check-ins:
- Day 1: Sleep 6 hours, Mood 7/10
- Day 2: Sleep 8 hours, Mood 8/10
- Day 3: Sleep 5 hours, Mood 4/10
- Day 4: Sleep 7 hours, Mood 7/10
- Day 5: Sleep 4 hours, Mood 3/10

Claude in reflection:
> "I'm noticing something interesting in your data. On days you sleep under 6 hours, your mood tends to dip pretty significantly. Does that match what you've experienced?"

User: "Yeah, I never thought about it that way"

Claude:
> "What do you think would happen if you prioritized sleep one night? Would you be open to trying that?"

**Key**: Claude references THEIR data, not generic advice.

---

## 🛡️ Safety Architecture

### 1. **Multi-Layer Crisis Detection**
- Keyword scanning (crisis keywords)
- Context analysis (suicidal ideation)
- Graduated response system

### 2. **Transparent Instructions**
User can access: `/api/reflection/instructions`

Returns:
```json
{
  "role": "I am Claude, an AI reflection companion",
  "purpose": "Help you understand your own patterns",
  "scope": "This is reflection, not therapy",
  "safety": [
    "I will escalate to crisis resources if you mention self-harm",
    "I cannot replace professional help"
  ],
  "honesty": [
    "I am an AI, not a human",
    "I can make mistakes",
    "I have limits"
  ],
  "privacy": [
    "You can view/delete any reflection",
    "Data is stored securely",
    "You control memory"
  ]
}
```

### 3. **Logging for Safety (Not Engagement)**
Log:
- ✅ Crisis detection events
- ✅ Escalations (for quality review)
- ✅ User reports of issues
- ❌ NOT: engagement metrics, persuasion attempts

User can see logs and opt out of non-essential logging.

### 4. **Easy Escalation Paths**
- Always-visible 988 button
- One-click access to local crisis lines
- "Talk to a therapist" button with directory
- "Report safety concern" option

---

## 📱 User Interface Design

### Session Start
```
Choose Your Reflection Type:

⏱️ Quick Check-In (5-10 min)
"Just need a brief moment? Let's focus."

🔍 Guided Reflection (15-30 min)
"Explore a specific pattern or concern"

[Start Session Button]
```

### During Session
```
[Avatar Image]
Your Companion

[Conversation History]
You: "I've been feeling anxious"
Companion: "I see that pattern..."

[Message Input Box]
[Microphone Button (Voice)]
[Send Button]

[Session Duration] 8 min / 30 min max
[Suggest Ending?] "Ready to wrap up?" (at 80%)
[Crisis Resources Button] Always visible
```

### Session End
```
✓ Session Complete

Duration: 12 minutes
Messages: 6 exchanges

Your reflection helped you notice:
- Sleep < 6 hours correlates with anxiety
- You've been getting 5 hours average

💡 Next Steps:
- Try getting 7 hours tonight
- Check in tomorrow to see if it helps
- Talk to a therapist if anxiety continues

[End Session] [Save Reflection] [Delete]
```

---

## 🔐 Data Control

### User Controls
- ✅ View all reflections
- ✅ Delete specific reflections
- ✅ Export reflection transcripts
- ✅ Clear all memory
- ✅ Opt out of non-essential logging
- ✅ Choose what past topics to reference
- ✅ Toggle memory per-session

### What We Store
**Essential (always)**:
- User's messages (for accuracy)
- Claude's responses (for audit)
- Timestamp
- Any crisis flags

**Optional (user chooses)**:
- Emotion tags
- Pattern correlations
- Recommendations made
- Follow-up tracking

### What We DON'T Store
- ❌ Raw audio (even if voice input used)
- ❌ IP addresses (for tracking)
- ❌ Engagement metrics
- ❌ Session duration (only on request)
- ❌ Sentiment analysis
- ❌ Behavioral targeting data

---

## 🧠 System Prompt Structure

The system prompt Claude receives includes:

1. **Identity**: "I am Claude, an AI reflection companion"
2. **Role**: "Help users understand their own patterns"
3. **Scope**: "This is reflection, not therapy"
4. **User Context**: Recent check-ins, detected patterns, main concern
5. **Safety Rules**: Crisis escalation, boundary setting
6. **Conversation Style**: Ask questions, listen, reflect
7. **Limitations**: "I can make mistakes, I'm not a therapist"

**The system prompt is NOT hidden** — users can request to see it.

---

## 📊 Success Metrics (Safety-First)

**NOT Measured**:
- ❌ Session frequency (engagement hack)
- ❌ Message length (verbosity metric)
- ❌ Response time (retention optimization)

**ARE Measured**:
- ✅ Crisis detection accuracy
- ✅ User safety feedback
- ✅ Escalation success
- ✅ Therapy referral rate
- ✅ Pattern accuracy
- ✅ User trust scores
- ✅ Professional satisfaction (if shared with therapist)

---

## 🔄 Integration with Phase 1

**Check-In Data** → Patterns Engine → **Reflection Session**

Example:
1. User completes check-in (mood 4, stress 8, sleep 5 hours)
2. System detects low mood + high stress + low sleep
3. User starts reflection session
4. Claude references these factors and asks about connections
5. User realizes pattern: "I skip sleep when stressed, then mood tanks"
6. Claude asks: "What if you treated sleep as priority even on stressful days?"
7. User commits to trying it
8. Next check-in, pattern appears or improves
9. Reflection session references change: "You got 7 hours last night and mood improved to 6/10"

---

## 🛑 What This IS NOT

This is **NOT**:
- ❌ A therapy bot
- ❌ A crisis counselor
- ❌ A replacement for therapists
- ❌ Medical advice
- ❌ A substitute for medication
- ❌ Open-ended emotional support
- ❌ Designed for dependency
- ❌ Optimized for engagement

## ✅ What This IS

This **IS**:
- ✅ A reflection tool
- ✅ Pattern recognition helper
- ✅ Gentle conversation starter
- ✅ Data-grounded insight generator
- ✅ Bridge to professional care
- ✅ Transparent about limitations
- ✅ Privacy-respecting
- ✅ Safety-obsessed

---

## 🚀 How to Use This in Practice

### For Users Seeking Help
1. Complete daily check-in (mood, sleep, stress, etc.)
2. When ready to explore patterns, start guided reflection
3. Have conversation about correlations
4. Ask Claude about patterns you've noticed
5. If urgent: Use crisis escalation buttons
6. If ongoing concern: Use "See a therapist" resource

### For Developers Maintaining This
1. Review crisis detection logs monthly
2. Test escalation pathways quarterly
3. Audit system prompts for scope creep
4. Monitor user privacy controls usage
5. Verify transparency instructions accuracy
6. Check therapist referral success rate

### For Therapists (If Patient Shares)
1. User can export reflections to show you
2. You see user's patterns + self-insights
3. You can build on these in therapy
4. Companion supports, not replaces, your work

---

## 📝 Sample Reflection Conversation

```
System: Quick Reflection started. What's on your mind?

User: I'm feeling really tired and overwhelmed

Claude: That sounds exhausting. I noticed your last 
few check-ins show lower energy on mornings after 
late nights. How's your sleep been?

User: Yeah, I've been staying up late working on 
a project. I know I should sleep more but there's 
so much to do.

Claude: That classic pattern — high pressure leads 
to cutting sleep, which then makes everything feel 
more overwhelming. It's like a loop, right?

User: Exactly. And then I can't focus during the day.

Claude: Have you noticed if that pattern is 
unavoidable, or something you could shift?

User: I could probably just set a bedtime and 
stick to it.

Claude: That seems like it could help. What would 
make that realistic even with your project deadline?

User: Maybe stopping work at 10pm and being in bed 
by 11pm. I could wake up earlier instead.

Claude: That's a specific plan. If you tried that 
tonight, what would you expect to happen tomorrow 
with your energy and focus?

User: I'd probably feel better and get more done.

Claude: Worth trying, then. Remember — this is just 
my observation, but it sounds like better sleep might 
be your best investment right now.

System: Session ending soon. Would you like to 
continue or wrap up?

User: Let's wrap up.

System: Thank you for reflecting. Remember: I'm here 
for patterns and self-awareness, not to replace 
talking with a real counselor if you need more support.
```

---

## ✨ Why This Design Works

1. **Honest**: Users know it's AI, not magic
2. **Safe**: Multi-layer crisis handling
3. **Useful**: References actual patterns
4. **Bounded**: Sessions have clear limits
5. **Private**: Users control data
6. **Differentiating**: Better than generic AI chat
7. **Ethical**: Doesn't exploit mental health
8. **Sustainable**: Positions companion as tool, not crutch

---

## 🎯 Bottom Line

This reflection companion is designed to be:
- **Genuinely helpful** (through pattern insight)
- **Genuinely safe** (through bounded design + crisis handling)
- **Genuinely honest** (about what it is and isn't)
- **Genuinely respectful** (of user autonomy + privacy)

It's not a replacement for therapy. It's a thoughtful tool that helps users understand themselves better — which makes them better partners for their own care and better patients for their therapists.

---

**Status**: 🟢 READY FOR IMPLEMENTATION

This design prioritizes user welfare over engagement metrics. That's the right choice for mental health.

