# Beast Companion - Specification & Design

**Project**: Beast Companion (Tamagotchi-inspired, AI-generated pets)  
**Platform**: Mind Sanctuary integration  
**Target Users**: Gamers, wellness-focused millennials  
**Date**: September 28, 2026

---

## 1. CORE CONCEPT

### Overview
A dynamic pet system where:
- **AI generates** unique creatures (no two identical)
- **Pet evolves** through stages (egg → baby → adult → elder)
- **Health linked** to user's daily wellness activities
- **Death mechanics** add stakes (can resurrect/new pet)
- **Integrated** with Mind Sanctuary check-ins
- **Professional UI** matching modern gaming standards

### Pet Lifecycle
```
Egg (12 hours)
  ↓ [User action required]
Baby (7-10 days)
  ↓ [Depends on care quality]
Adult (30-60 days)
  ↓ [Peak abilities]
Elder (20-30 days)
  ↓ [Natural death or resurrection]
Dead → Resurrect or New Pet
```

---

## 2. PET GENERATION SYSTEM

### AI-Generated Uniqueness

Each pet is procedurally unique based on:

#### Base Archetype (randomly selected)
- Dragon
- Phoenix
- Fox
- Wolf
- Gryphon
- Chimera
- Basilisk
- Golem
- Spirit
- Hybrid

#### Physical Traits
- **Size**: Tiny (15cm) → Small (30cm) → Medium (60cm) → Large (120cm) → Massive (200cm+)
- **Color Palette**: 
  - Primary color (RGB random or theme-based)
  - Secondary color (complementary)
  - Accent color (highlights)
  - Pattern (solid, striped, spotted, gradient, iridescent)

#### Personality Archetype
- **Temperament**: Aggressive, Playful, Calm, Anxious, Curious, Lazy
- **Social**: Solitary, Friendly, Protective, Mischievous
- **Energy**: High, Medium, Low (varies by time of day based on user schedule)

#### Special Traits (Rare)
- Wings
- Multiple heads
- Magical aura
- Crystal formations
- Bioluminescence
- Shape-shifter ability
- Elemental affinity (fire, ice, lightning, nature, shadow)

#### Influenced by User Data
```
User's Profile → Pet Characteristics

High Energy User → 
  - Active archetype (Dragon, Phoenix)
  - Energetic temperament
  - High energy stat
  - Fast growth rate

Anxious User →
  - Protective archetype (Wolf, Gryphon)
  - Cautious temperament
  - Needs more reassurance
  - Slower, steadier growth

Sleep-deprived User →
  - Nocturnal archetype (Fox, Basilisk)
  - Works better at night
  - Lazy temperament
  - Prefers rest activities

Social User →
  - Friendly archetype (Phoenix, Chimera)
  - Gregarious temperament
  - Loves interaction
  - Thrives on engagement
```

### Generation Algorithm

```javascript
function generatePet(userData) {
  const archetype = selectArchetype(userData.energy_level);
  const size = randomize(userData.consistency, [15, 30, 60, 120, 200]);
  const primaryColor = generateColor(userData.mood_baseline);
  const secondaryColor = complementaryColor(primaryColor);
  const temperament = matchTemperament(userData.stress_level);
  const specialTraits = rollRareTraits(userData.check_in_streak);
  
  return {
    id: generateUUID(),
    archetype,
    size,
    colors: { primary, secondary, accent },
    temperament,
    traits: specialTraits,
    birthDate: now(),
    generatedImage: callAI(all_parameters),
    genetics: { /* for breeding */ }
  };
}
```

---

## 3. EVOLUTION SYSTEM

### Stage Progression

#### Stage 1: EGG (12-24 hours)
- Appearance: Glowing egg with archetype hints
- Interactions: Limited (can poke, talk to)
- Health: Stable (protected)
- Triggers: First check-in completion
- Transition: "Egg hatches!" animation

#### Stage 2: BABY (7-14 days)
- Appearance: Tiny, cute version of adult form
- Abilities: Sleep, eat, play (limited)
- Needs: More frequent care
- Appearance Changes: 
  - Gets bigger each day
  - Colors intensify
  - Posture changes
  - Expressions develop
- Transition: Reaches full size → becomes Adult

#### Stage 3: ADULT (30-90 days)
- Appearance: Full form, peak aesthetics
- Abilities: Full interaction suite
- Special Power: Unlocks based on archetype + user data
- Appearance Stability: Consistent (may add accessories)
- Optional: Breeding available (requires 2 healthy adults)
- Transition: After 60+ days → shows aging signs

#### Stage 4: ELDER (20-40 days)
- Appearance: Subtle aging (wisps, cracks, frost, weathering)
- Abilities: Full but slower
- Wisdom: Shares insights based on user history
- Health: Declines slowly (unless well cared for)
- Special: Can pass traits to offspring
- Transition: Natural death or resurrection

### Appearance Evolution Details

**Visual Changes During Growth**:
```
EGG
  ↓ grows
HATCHLING (25% adult size, oversized head, big eyes)
  ↓ grows over 3-4 days
JUVENILE (50% adult size, proportions refining)
  ↓ grows over 3-4 days  
YOUNG ADULT (75% adult size, full personality)
  ↓ grows over 2-3 days
ADULT (100% - full form, peak beauty)
  ↓ after 40+ days
AGING (subtle changes, wrinkles, slower movement)
  ↓ after 20+ days
ELDER (wisdom, weathered, glowing aura)
  ↓ can last 10-30 more days
DECEASED
```

**Specific Visual Effects**:
- **Hatchling**: Oversized eyes, wobbly movements, unstable colors
- **Juvenile**: Proportions settling, colors clarifying, personality emerging
- **Young Adult**: Full features, confident stance, colors vivid
- **Adult**: Peak beauty, special effects (glow, particles), accessories
- **Aging**: Lines, cracks, weathering effects, slower animations
- **Elder**: Wisdom glow, ethereal quality, translucent edges, slow graceful movement

---

## 4. HEALTH & CARE SYSTEM

### Health Pool (0-100 HP)

**Gains Health From**:
- ✅ Daily check-in completion (+10 HP)
- ✅ Good mood score (7-10) (+5 HP)
- ✅ 7+ hours sleep (+10 HP)
- ✅ Reflection session completed (+8 HP)
- ✅ Low stress day (+5 HP)
- ✅ User interaction (feed, play, pet) (+2-5 HP)
- ✅ Journal entry (+3 HP)

**Loses Health From**:
- ❌ Missed check-in (-5 HP/day)
- ❌ Poor mood (1-3) (-8 HP)
- ❌ Sleep < 5 hours (-10 HP)
- ❌ High stress day (-8 HP)
- ❌ No interaction for 24 hours (-3 HP/hour after)
- ❌ Neglect for 48+ hours (-15 HP)

**Health States**:
- 80-100: Thriving (happy, energetic, glowing)
- 60-79: Healthy (content, normal activity)
- 40-59: Concerned (sluggish, sad, needs attention)
- 20-39: Sick (visibly ill, needs care urgently)
- 1-19: Critical (dying, emergency mode)
- 0: Dead

### Death Mechanics

**Pet dies when**:
- HP reaches 0 (after extended neglect - typically 7-14 days)
- Natural death in Elder stage (can extend with great care)
- Severe illness without intervention (rare)

**After Death**:
- Memorial screen (shows pet's life stats)
- Option to resurrect (+1 resurrection counter)
- Option to get new pet (starting fresh)
- Can view pet in gallery (permanent record)

---

## 5. INTERACTION SYSTEM

### Daily Activities

#### Feed
- Frequency: 1-3x per day (depends on pet type)
- Mechanics: 
  - Select food (varies by pet preference)
  - Animation of pet eating
  - +3 HP, +1 happiness
- Special: Can give treats (rare items, +5 HP)

#### Play
- Frequency: 1-2x per day
- Mechanics:
  - Mini-game or interaction
  - +5 HP, +8 happiness
  - Strengthens bond
- Options:
  - Chase (tap to follow)
  - Trick (teach behaviors)
  - Puzzle (solve together)

#### Pet/Cuddle
- Frequency: Anytime
- Mechanics:
  - Tap pet, it reacts
  - +2 HP, +3 happiness
  - Shows affection

#### Groom
- Frequency: Daily (optional)
- Mechanics:
  - 30-second activity
  - +3 HP, +5 appearance
  - Unlocks cosmetics

#### Sleep/Rest
- Frequency: Automatic
- Mechanics:
  - Pet sleeps when user sleeps
  - Recovers 15 HP per good sleep
  - Restful state = better growth

#### Talk/Reflect
- Frequency: After reflection sessions
- Mechanics:
  - Pet responds to user's mood
  - Gives feedback based on wellness
  - +3 HP, +6 happiness, +2 bond

### Stat Tracking

```
Health: 0-100 (how alive the pet is)
Happiness: 0-100 (mood/contentment)
Hunger: 0-100 (needs feeding)
Energy: 0-100 (needs rest/play)
Bond: 0-100 (attachment to user)
Growth: % to next stage
```

---

## 6. UI/UX DESIGN

### Main Pet Screen (Professional Gaming Standard)

```
┌─────────────────────────────────────────┐
│  [BACK] Mind Sanctuary > Beasts          │
├─────────────────────────────────────────┤
│                                         │
│         [Large Pet Image]               │ ← Center, high quality render
│         (Animated, interactive)         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Name: "Emberclaw"               │   │ ← Pet Details
│  │ Archetype: Dragon               │   │
│  │ Age: 12 days (Young Adult)      │   │
│  │ Level: 15                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Health:    [████████░░] 85/100        │ ← Status bars
│  Happiness: [███████░░░] 72/100        │
│  Bond:      [██████░░░░] 60/100        │
│                                         │
│  ┌──────┬──────┬──────┬──────┐        │
│  │ Feed │ Play │ Pet  │ Rest │        │ ← Quick Actions
│  └──────┴──────┴──────┴──────┘        │
│                                         │
│  ┌──────┬──────┬──────────────┐       │
│  │ Info │ Care │ Achievements │       │ ← Tabs
│  └──────┴──────┴──────────────┘       │
└─────────────────────────────────────────┘
```

### Pet Information Tab

```
┌──────────────────────────────────┐
│ Emberclaw's Stats                │
├──────────────────────────────────┤
│                                  │
│ Basic Info:                      │
│ • Archetype: Dragon              │
│ • Color: Crimson with gold       │
│ • Special Traits: Wings          │
│ • Personality: Playful & Bold    │
│                                  │
│ Wellness Connection:             │
│ • Linked to: Your Energy         │
│ • When you're energetic,         │
│   Emberclaw is powerful          │
│                                  │
│ Lifetime Stats:                  │
│ • Born: Sep 28, 2026             │
│ • Days Alive: 12                 │
│ • Times Played: 47               │
│ • Total Care Sessions: 23        │
│ • High Score: 95 HP              │
│                                  │
└──────────────────────────────────┘
```

### Care Log Tab

```
┌──────────────────────────────────┐
│ Today's Care Log                 │
├──────────────────────────────────┤
│                                  │
│ ✓ 8:30 AM - Morning Check-in     │
│   +10 HP • Great mood!           │
│                                  │
│ ✓ 9:15 AM - Fed breakfast        │
│   +3 HP • Dragon loves berries   │
│                                  │
│ ✓ 10:00 AM - Played chase        │
│   +5 HP • Emberclaw had fun!     │
│                                  │
│ ✓ 12:00 PM - Reflection session  │
│   +8 HP • Became closer          │
│                                  │
│ ✓ 11:30 PM - Goodnight cuddle    │
│   +2 HP • Sleeping peacefully    │
│                                  │
│ Daily Stats:                     │
│ HP Change: +28 (Good day!)       │
│ Happiness: Excellent              │
│ Bond Level: Growing              │
│                                  │
└──────────────────────────────────┘
```

### Collection/Gallery

```
┌─────────────────────────────────────┐
│ My Beast Collection                 │
├─────────────────────────────────────┤
│                                     │
│ Current Pet: ┌─────────────────┐   │
│              │   Emberclaw     │   │
│              │   (Alive)       │   │ ← Active
│              │ ▲ ▲ Dragon ▲ ▲  │   │
│              └─────────────────┘   │
│                                     │
│ Past Beasts:                        │
│ ┌────────────┐ ┌────────────┐     │
│ │ Frostfang  │ │ Cinderspire│     │
│ │ (Elder)    │ │ (Deceased) │     │
│ │ Wolf       │ │ Phoenix    │     │
│ │ 45 days    │ │ 32 days    │     │
│ └────────────┘ └────────────┘     │
│                                     │
│ ┌────────────┐ ┌────────────┐     │
│ │ Mystra     │ │ [New Pet?] │     │
│ │ (Deceased) │ │            │     │
│ │ Fox        │ │ Generate!  │     │
│ │ 18 days    │ └────────────┘     │
│ └────────────┘                     │
│                                     │
│ Total Beasts: 4 | Total Care: 156 hrs
│                                     │
└─────────────────────────────────────┘
```

### Achievements/Progression

```
┌──────────────────────────────────┐
│ Beast Master Achievements        │
├──────────────────────────────────┤
│                                  │
│ 🏆 First Pet                     │
│    Adopted your first beast      │
│    Unlocked!                     │
│                                  │
│ 🏆 Week of Care                  │
│    Kept pet alive for 7 days     │
│    Unlocked!                     │
│                                  │
│ 🏆 Elder's Wisdom                │
│    Raised beast to Elder stage   │
│    [████████░░] 7/14 days       │
│                                  │
│ 🏆 Perfect Care                  │
│    Achieve 100 HP for 3 days     │
│    [██░░░░░░░░] 2/3 days       │
│                                  │
│ 🏆 Breeder                       │
│    Successfully breed 2 beasts   │
│    Locked (raise 2 adults)      │
│                                  │
│ Statistics:                      │
│ • Beasts Raised: 4              │
│ • Total Care Hours: 156         │
│ • Longest Lifespan: 45 days    │
│ • Achievements: 2/8 unlocked    │
│                                  │
└──────────────────────────────────┘
```

### Health Status Indicator

```
Very Sick (1-19 HP):
🟥 Red background
Pet appears ill/weak
Urgent notifications
"Emberclaw needs immediate care!"

Sick (20-39 HP):
🟠 Orange background
Pet sluggish/sad
"Emberclaw is unwell"

Concerned (40-59 HP):
🟡 Yellow background  
Pet slower/less happy
"Emberclaw needs more attention"

Healthy (60-79 HP):
🟢 Green background
Pet content/normal
"Emberclaw is doing well"

Thriving (80-100 HP):
🟢 Green + glow effect
Pet energetic/happy/shining
"Emberclaw is thriving!"
```

---

## 7. TECHNICAL ARCHITECTURE

### Data Model

```typescript
interface Beast {
  id: UUID;
  userId: number;
  
  // Identity
  name: string;
  archetype: BeestArchetype;
  generatedAt: timestamp;
  generatedImage: URL; // AI-generated
  
  // Genetics
  genetics: {
    primaryColor: RGB;
    secondaryColor: RGB;
    size: number;
    temperament: string;
    specialTraits: string[];
    parentIds?: [UUID, UUID]; // if bred
  };
  
  // Lifecycle
  stage: 'egg' | 'baby' | 'juvenile' | 'adult' | 'elder' | 'deceased';
  birthDate: timestamp;
  deathDate?: timestamp;
  resurrectionCount: number;
  
  // Health
  health: number; // 0-100
  happiness: number; // 0-100
  hunger: number; // 0-100
  energy: number; // 0-100
  bond: number; // 0-100
  growthProgress: number; // 0-100 (to next stage)
  
  // Linked Wellness
  linkedStat: 'energy' | 'mood' | 'sleep' | 'stress'; // what drives pet
  lastCheckIn: timestamp;
  careStreak: number;
  
  // History
  careLog: CareEvent[];
  lifespan: number; // days alive
  
  // Status
  isAlive: boolean;
  lastInteraction: timestamp;
}

interface CareEvent {
  timestamp: timestamp;
  type: 'checkin' | 'feed' | 'play' | 'pet' | 'groom' | 'sleep' | 'reflect';
  hpChange: number;
  note: string;
}
```

### Backend Routes

```
GET  /api/beasts/:userId
  - Get all beasts for user
  
GET  /api/beasts/:userId/current
  - Get current active beast
  
POST /api/beasts/:userId/generate
  - Generate new beast from user data
  
GET  /api/beasts/:beastId
  - Get specific beast details
  
PUT  /api/beasts/:beastId/care/:action
  - Record care action (feed, play, etc.)
  
PUT  /api/beasts/:beastId/health
  - Update health based on check-in data
  
POST /api/beasts/:beastId/resurrect
  - Bring dead beast back to life
  
POST /api/beasts/:userId/breed
  - Breed two beasts
  
GET  /api/beasts/:userId/gallery
  - Get all past beasts (memorial gallery)
```

---

## 8. INTEGRATION WITH MIND SANCTUARY

### Check-in Connection

```
User completes check-in
  ↓
Data sent to Beast System
  ↓
Beast health updated:
  • Mood 7-10 → +10 HP
  • Mood 1-3 → -8 HP
  • Sleep 7+ hrs → +10 HP
  • Stress level affects HP
  ↓
Pet stage evolves if ready
  ↓
UI shows impact: "Emberclaw felt your positive energy!"
```

### Reflection Integration

```
User starts reflection session
  ↓
Pet becomes companion in session
  ↓
Conversation tied to pet's wellness
  ↓
On completion: +8 HP, +6 happiness
  ↓
Special message from pet about user's health
```

### Daily Notifications

```
Morning: "Emberclaw needs breakfast!"
Midday: "How are you doing? Check in to help your beast"
Evening: "Emberclaw misses you - quick play session?"
Night: "Sleep well! Your beast sleeps when you sleep"
```

---

## 9. MONETIZATION (Optional)

### Free Features
- ✅ Unlimited pets
- ✅ Basic care
- ✅ One evolution path

### Premium ($2.99/month)
- 🔓 Custom pet names
- 🔓 Advanced grooming options
- 🔓 Cosmetics (hats, accessories)
- 🔓 Breeding without limits
- 🔓 Pet insurance (no death allowed)

### One-time Purchases
- 💎 Rare Beast Key ($4.99) - Generate rare special beasts
- 💎 Aesthetic Pack ($1.99) - Special visual effects
- 💎 Name Pack ($0.99) - Suggested quality names

---

## 10. ROADMAP

### Phase 1 (MVP - Week 1-2)
- ✅ Beast generation algorithm
- ✅ Basic health system
- ✅ Simple UI
- ✅ Integration with Mind Sanctuary check-ins

### Phase 2 (Evolution - Week 3)
- 🔄 Full evolution system
- 🔄 Professional UI polish
- 🔄 Care interactions
- 🔄 Animation system

### Phase 3 (Enhancement - Week 4+)
- 📅 Breeding system
- 📅 Gallery/memorial
- 📅 Achievements
- 📅 Social features

---

## Success Metrics

- ✅ Daily active users (% doing check-ins via pets)
- ✅ Pet lifespan (longer = better care habits)
- ✅ Check-in completion rate (should increase)
- ✅ User retention (habit formation)
- ✅ Time spent (should feel rewarding, not addictive)

