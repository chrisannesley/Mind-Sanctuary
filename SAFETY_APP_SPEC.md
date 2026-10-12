# Safety App Spec: Risk Homeostasis-Based Pre-Shift Assessment

## Overview

A mobile-first web app that helps contractors assess their personal state and awareness level before starting their workday. The app identifies behavioral and personal factors that increase risk appetite (based on risk homeostasis theory) and provides personalized guidance to help workers make safer decisions.

**Core Principle:** Workers maintain a target risk level. When distracted, pressured, or impaired, they unconsciously compensate by taking more risks. This app helps them recognize when they're more vulnerable and adjust accordingly.

---

## Problem Statement

Construction contractors frequently work despite conditions that increase their accident risk:
- Sleep deprivation, hangovers, illness
- Personal/family stress and distraction
- Financial pressure and tight deadlines
- Emotional distress or mental health challenges

Risk homeostasis theory explains this: they compensate for perceived safety by working faster, cutting corners, skipping steps. They perceive a **net benefit** (faster job = more money, less pressure) that outweighs the risk.

**Goal:** Help contractors recognize when they're operating at elevated risk and give them tools to recalibrate their cost-benefit analysis.

---

## Core Features (MVP)

### 1. Daily Pre-Shift Assessment
- **Timing:** 2-3 minutes, once per workday
- **Method:** Simple questionnaire on 8 key risk factors
- **Data:** User's personal state only (fully private)
- **Output:** Risk score + personalized recommendation

### 2. Job/Hazard Selection
- **Input:** User selects their primary task/role for the day
- **Library:** Basic hazard categories (general labor, roofing, electrical, etc.)
- **Purpose:** Contextualizes their personal state against job-specific risks

### 3. Risk Calculation & Display
- **Algorithm:** Personal state score × job hazard level = adjusted risk profile
- **Output:** Risk level (Low/Medium/High) with brief explanation
- **Presentation:** Simple, clear, non-judgmental

### 4. Recommendation Engine
- **Based on:** Personal state factors + risk level
- **Output:** 2-3 actionable suggestions (e.g., "Take a break before starting," "Let crew know you're having an off day," "Buddy up on high-hazard tasks")
- **Purpose:** Help them rebalance costs/benefits consciously

### 5. Consequence Acceptance Question (CRITICAL)
- **Trigger:** Only shown if Medium or High risk detected
- **Question:** "Are you willing to accept the potential negative consequences of working under these conditions today? (Injury, hospitalization, loss of income, impact on family, etc.)"
- **Options:** "Yes, I accept the risk" / "No, I need to change something"
- **Purpose:** Force conscious deliberation of true costs; interrupt automatic risk-taking
- **Design Note:** Non-judgmental, factual framing. Makes consequences salient and personal.

### 5. Optional History Tracking
- **Scope:** Trends only (not detailed logging initially)
- **Use:** Identify personal patterns ("I'm always higher risk on Mondays," "Hangovers are my biggest risk factor")
- **Privacy:** All data local/user-controlled

### 6. Optional Take 5 Integration
- **Scope:** Allow user to add standard hazard checklist
- **Purpose:** Combine personal state assessment with job hazard identification
- **Data:** Standard form, can be saved/printed

---

## Assessment Questions (8 Core Factors)

Based on 20 years of safety/risk expertise and risk homeostasis theory.

1. **Sleep Quality:** How well did you sleep last night? (1-5 scale)
   - *Addresses:* Hangovers, fatigue, cognitive impairment

2. **Physical Health:** How's your physical health/energy today? (1-5 scale)
   - *Addresses:* Illness, not feeling well, low energy

3. **Stress/Worry Level:** What's your stress level about money, work, life? (1-5 scale)
   - *Addresses:* Financial pressure, overwhelm, distraction

4. **Emotional/Personal Issues:** Anything troubling you today? (Family conflict, relationship stress, grief, etc.) (1-5 scale)
   - *Addresses:* Fighting with partner, sick family, bad mood, road rage aftermath

5. **Mental Health:** How's your mental health today? (Anxiety, depression, emotional stability) (1-5 scale)
   - *Addresses:* Depression, anxiety, mental health challenges

6. **Substance Use:** Any alcohol/drugs in your system or recent use? (Yes/No or 1-5)
   - *Addresses:* Hangovers, under the influence, substance dependency

7. **Time/Work Pressure:** How much pressure are you under to finish work quickly or meet deadlines today? (1-5 scale)
   - *Addresses:* Time constraints, supervisor/client pressure, financial incentive to rush

8. **Competency/Confidence:** Do you have the skills, knowledge, and confidence for today's tasks? (1-5 scale)
   - *Addresses:* Not feeling equipped, lack of confidence, skill gaps

**Scoring:** Each factor scored 1-5 (low to high concern). Aggregate into personal state score (8-40 range).

---

## Job/Hazard Categories (Initial)

Contractors select their primary task. Each has a baseline hazard level.

**Examples (expand as needed):**
- General labor (low-medium)
- Roofing/heights (high)
- Electrical work (high)
- Heavy equipment operation (high)
- Confined spaces (very high)
- Demolition (very high)
- Scaffold/formwork (high)
- Ground-level tasks (low-medium)

---

## Algorithm (Risk Calculation)

### Personal State Score
```
Score = (Sleep + Health + Stress + Emotional + Mental + Substance + Pressure + Competency) / 8
Range: 1.0 - 5.0
```

### Risk Adjustment
```
Adjusted Risk Level = Base Job Hazard × (1 + (Personal State Score - 3) × 0.25)

Example:
- Base job hazard: Medium (3/5)
- Personal state: 4.2/5 (elevated concerns)
- Adjustment factor: 1 + (4.2 - 3) × 0.25 = 1.3
- Adjusted risk: 3 × 1.3 = 3.9 (approaching High)
```

### Risk Level Classification
- **Low Risk:** 1.0 - 2.5
- **Medium Risk:** 2.5 - 3.5
- **High Risk:** 3.5 - 5.0

---

## Recommendation Logic

**Based on risk level + which factors are elevated:**

### Low Risk
- "You're well-positioned today. Standard precautions apply."
- "Keep your usual routine and stay alert."

### Medium Risk
- If elevated stress: "You're managing multiple pressures today. Take a 10-min break before starting."
- If elevated fatigue: "You're tired. Let your crew know so they can watch for you."
- If low confidence: "You're uncertain about this task. Ask for a buddy or clarification before starting."
- If time pressure: "You're under the gun. Resist the urge to skip steps — quality saves time."

### High Risk
- "Your personal situation today puts you at higher risk than usual."
- "Strong recommendation: Let your supervisor know you're having an off day."
- "Consider a buddy system for high-hazard tasks."
- "Take breaks to reset your focus."
- "If possible, defer high-risk tasks to tomorrow."

---

## Consequence Acceptance Question (Critical Gate)

**Shown only for Medium/High risk:**

> "Are you willing to NOT achieve your expected goal?
>
> Working under your current state (tired, stressed, under pressure, distracted, etc.) means:
> - You might take longer to finish
> - You might make mistakes needing rework
> - You might miss your deadline or financial target
> - Quality might suffer
> - Your team might be impacted
>
> If rushing creates these risks, are you willing to NOT achieve what you intended?"

**Options:**
- **"Yes, I accept these consequences"** → Acknowledge their choice, show recommendations, let them proceed with eyes open
- **"No, I need to change my approach"** → Show options:
  - "Delay work if possible"
  - "Talk to supervisor about realistic timeline"
  - "Buddy up with someone to stay focused"
  - "Take a break/reset before starting"
  - "Work at a sustainable pace instead of rushing"

**Purpose:** 
- Reframe from abstract "avoiding injury" to concrete "achieving your goals"
- Highlight the irony: rushing because stressed often leads to opposite outcome (mistakes, delays, lost money)
- Make them consciously choose: full speed (risky outcome) vs. sustainable pace (better outcomes)
- Interrupt the unconscious cost-benefit calculation that justifies risk-taking

**Why this works:**
- Contractors take risks because they believe it helps them achieve outcomes (finish faster, earn more)
- This forces them to admit: "Working under my current state, speed might actually hurt my goal"
- Shifts from abstract danger to concrete business outcome they care about

---

## Data Architecture

### What's Private (Never Visible to Employer/Others)
- Personal state assessment answers
- Personal state score
- Personal notes/reflections
- Health/family/financial/emotional details

### What's Optional (User Controls)
- Take 5 form (standard hazard checklist) — can save/print/share
- History tracking (daily scores, trends) — local storage only
- Accident/near-miss notes (private reflection tool)

### Storage
- **Local Storage:** Primary (browser-based, fully private)
- **Optional Backend:** If user wants cloud sync/history (end-to-end encrypted)

---

## User Flows

### Daily Use (Happy Path)
1. User opens app
2. Sees: "Time for your pre-shift check-in"
3. Answers 8 questions (2 min)
4. Selects job for the day
5. Sees: Risk level + 2-3 recommendations
6. Optional: Review history, add notes
7. Optional: Complete Take 5 form
8. Closes app, goes to work

### First-Time Setup
1. Welcome screen (explain what this app does)
2. Privacy promise (your data is yours only)
3. Quick tutorial on the 8 factors
4. First assessment
5. Create job/hazard list (or use defaults)
6. Onboarded

### History/Trends (If Enabled)
1. User can view past week/month of assessments
2. See which factors they struggle with most
3. Identify patterns (e.g., "Mondays are always harder")
4. Optional notes for each day
5. Export as CSV or share insights with trusted person (optional)

---

## UI/UX Principles

- **Simple & Fast:** 2-3 min max for daily check-in
- **Non-judgmental:** No "you're unsafe" messaging, only observations + options
- **Mobile-first:** Contractors use on-site, likely on phone
- **Clear design:** Avoid jargon; use plain language
- **Visual feedback:** Color coding (green/yellow/red for risk levels)
- **Actionable:** Recommendations are things they can actually do

---

## Tech Stack

- **Frontend:** React (reuse your existing skills)
- **Styling:** CSS (responsive, mobile-optimized)
- **Storage:** LocalStorage (v1), optional Firebase/backend for sync (v2)
- **Hosting:** Vercel, Netlify, or similar (you already know this)
- **Mobile:** Responsive web app (PWA, installable on home screen)

---

## MVP Scope (Phase 1)

What's included:
- ✅ 8-factor assessment questionnaire
- ✅ Job selection (5-7 hazard categories)
- ✅ Risk calculation & display
- ✅ Recommendation engine
- ✅ Optional local history tracking
- ✅ Mobile-responsive UI
- ✅ Private data (LocalStorage only)

What's NOT included (future):
- ❌ Backend/cloud sync
- ❌ Employer integration/dashboards
- ❌ Take 5 form (can add later)
- ❌ Incident correlation
- ❌ Advanced analytics
- ❌ Multi-language support
- ❌ Offline mode (if online is default)

---

## Success Metrics (Post-Launch)

- Adoption: % of target users who open daily
- Engagement: Average daily check-ins per week
- Insights: Which factors correlate with actual incidents?
- Feedback: User satisfaction, perceived usefulness

---

## Open Questions for You

1. **Job categories:** What contractor roles should we start with? (General labor, roofing, electrical, etc.?)
2. **Recommendation tone:** How direct should we be? ("High risk today, consider telling supervisor" vs. "You might want to let your team know you're having an off day")
3. **History tracking:** Local-only (v1) or include backend sync option?
4. **Branding/Name:** What should we call this app?
5. **Target audience:** Contractors in specific sectors, or general construction?

---

## Next Steps

1. Validate/refine the 8 assessment questions
2. Define job/hazard categories
3. Finalize recommendation messaging
4. Design wireframes/UI
5. Start building (React components)
6. Test with real contractors

