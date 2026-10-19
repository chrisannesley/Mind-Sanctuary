/**
 * seed-demo-splash.mjs
 * Creates 5 demo users with 90 days of realistic, distinct check-in data.
 * These are displayed on the splash page to show visitors real outcomes.
 *
 * Usage:
 *   node seed-demo-splash.mjs                          (local dev)
 *   SEED_API=https://your-railway-url.app node seed-demo-splash.mjs  (production)
 *
 * Safe to re-run — skips seeding if demo users already exist.
 */

const API = process.env.SEED_API || 'http://localhost:3002'

const sleepQualities = ['poor', 'fair', 'good', 'excellent']
const socialWeekday  = ['alone', 'alone', 'alone', 'family', 'friends']
const socialWeekend  = ['friends', 'family', 'friends', 'group', 'alone']
const stressSources  = ['work deadline', 'family tension', 'financial worry', 'health concern', '']
const symptoms       = ['headache', 'tension', 'fatigue', 'restless']
const helpOptions    = ['walk_outside', 'rest', 'music', 'journal', 'meditation', 'exercise', '']

const rand  = (min, max)   => Math.floor(Math.random() * (max - min + 1)) + min
const clamp = (v, lo, hi)  => Math.max(lo, Math.min(hi, v))
const pick  = arr           => arr[Math.floor(Math.random() * arr.length)]

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

async function get(path) {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`)
  return res.json()
}

// ── Check if demo users already exist ──────────────────────────────────────
console.log(`\nConnecting to ${API}…`)
const existing = await get('/api/demo-users')
if (existing.length >= 5) {
  console.log(`✓ Demo users already seeded (found ${existing.length}). Nothing to do.`)
  console.log(`  User IDs: ${existing.map(u => `${u.id} (${u.name})`).join(', ')}`)
  process.exit(0)
}
console.log(`Found ${existing.length} existing demo users — seeding the rest…\n`)

// ── 5 distinct personas ─────────────────────────────────────────────────────
const PERSONAS = [
  {
    name: 'Sarah',
    avatar: '👩',
    age: 34,
    mainConcern: 'Anxiety, Work / life balance',
    story: 'Discovered her mood drops sharply on Mondays — work stress, not her baseline.',
    // Pattern: weekday stress high, weekends much better, gradual improvement
    generate: (day, date) => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const base = clamp(4.5 + day * 0.025, 4.5, 7.5)
      const noise = (Math.random() - 0.5) * 2
      const roughPatch = (day > 18 && day < 26) ? -2 : 0
      const mood = clamp(Math.round(base + noise + roughPatch + (isWeekend ? 1.5 : 0)), 1, 10)
      const stress = clamp(isWeekend ? rand(1, 4) : rand(5, 9) + roughPatch, 1, 10)
      const sleep = clamp(Math.round((mood * 0.5 + 4.5 + (Math.random() - 0.5)) * 2) / 2, 4, 9)
      return { mood, stress, sleep, social: isWeekend ? pick(socialWeekend) : pick(socialWeekday) }
    }
  },
  {
    name: 'Marcus',
    avatar: '👨',
    age: 28,
    mainConcern: 'Sleep',
    story: 'Sleep was the missing piece. Tracking showed his mood almost perfectly mirrors his sleep hours.',
    // Pattern: sleep improves linearly, mood follows strongly
    generate: (day, date) => {
      const sleepHrs = clamp(3.5 + day * 0.04 + (Math.random() - 0.5) * 1.5, 3, 9)
      const mood = clamp(Math.round(sleepHrs * 0.85 + rand(0, 2) - 1), 1, 10)
      const stress = clamp(11 - mood + rand(-1, 2), 1, 10)
      return { mood, stress, sleep: sleepHrs, social: pick(socialWeekday) }
    }
  },
  {
    name: 'Emma',
    avatar: '👩',
    age: 42,
    mainConcern: 'Grief or loss',
    story: 'Started very low. Had a hard patch at week 7. Three months later, slowly finding her way back.',
    // Pattern: starts low, deep dip at week 7, slow recovery — authentic, not a success story
    generate: (day, date) => {
      const deepDip  = (day > 42 && day < 56) ? -2.5 : 0
      const base = clamp(3.5 + day * 0.022, 3.5, 6.5)
      const noise = (Math.random() - 0.5) * 1.5
      const mood = clamp(Math.round(base + noise + deepDip), 1, 10)
      const stress = clamp(10 - mood + rand(-1, 2), 1, 10)
      const sleep = clamp(Math.round((mood * 0.45 + 4 + (Math.random() - 0.5) * 1.5) * 2) / 2, 3, 8)
      return { mood, stress, sleep, social: pick(['alone', 'alone', 'alone', 'family']) }
    }
  },
  {
    name: 'Dev',
    avatar: '🧑',
    age: 31,
    mainConcern: 'General wellness',
    story: 'Uses the app for self-awareness. Spotted that social time on weekends keeps stress manageable.',
    // Pattern: stable and good, clear weekend social boost, small stress spikes
    generate: (day, date) => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const base = 6.0 + (Math.random() - 0.5) * 0.5
      const noise = (Math.random() - 0.5) * 1.5
      const mood = clamp(Math.round(base + noise + (isWeekend ? 1 : 0)), 1, 10)
      const stress = clamp(isWeekend ? rand(1, 4) : rand(3, 7), 1, 10)
      const sleep = clamp(Math.round((6 + (Math.random() - 0.5) * 2) * 2) / 2, 5, 9)
      return { mood, stress, sleep, social: isWeekend ? pick(socialWeekend) : pick(socialWeekday) }
    }
  },
  {
    name: 'Kezia',
    avatar: '👩',
    age: 19,
    mainConcern: 'Stress, Anxiety',
    story: 'Volatile week-to-week. Exam stress is brutal in the data — but so is the rebound after.',
    // Pattern: high volatility, two bad exam-stress peaks, big weekend boosts
    generate: (day, date) => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const examStress = (day > 25 && day < 34) || (day > 60 && day < 69) ? -3 : 0
      const base = 5.5
      const noise = (Math.random() - 0.5) * 3   // high volatility
      const mood = clamp(Math.round(base + noise + examStress + (isWeekend ? 1.5 : 0)), 1, 10)
      const stress = clamp(mood <= 4 ? rand(7, 10) : rand(3, 7), 1, 10)
      const sleep = clamp(Math.round((mood * 0.4 + 4 + (Math.random() - 0.5) * 2) * 2) / 2, 3, 9)
      return { mood, stress, sleep, social: isWeekend ? pick(['friends', 'friends', 'group', 'family']) : pick(socialWeekday) }
    }
  },
]

// ── Seed each persona ───────────────────────────────────────────────────────
for (const persona of PERSONAS) {
  if (existing.some(u => u.name === persona.name)) {
    console.log(`  Skipping ${persona.name} — already seeded`)
    continue
  }

  process.stdout.write(`Seeding ${persona.name} (${persona.mainConcern})… `)

  const user = await post('/api/user/setup', {
    name: persona.name,
    mainConcern: persona.mainConcern,
    pin: null,
    isDemo: true,
    story: persona.story,
    avatar: persona.avatar,
  })
  const userId = user.id

  const now       = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 90)

  let count = 0
  let errors = 0

  for (let day = 0; day < 90; day++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + day)

    // Skip ~15% of days (realistic but denser than seed-demo-online which skips 20%)
    if (Math.random() < 0.15) continue

    const { mood, stress, sleep, social } = persona.generate(day, date)
    const sleepHours  = typeof sleep === 'number' ? Math.round(sleep * 2) / 2 : sleep
    const sleepQualIdx = clamp(Math.floor((sleepHours - 3) / 2), 0, 3)
    const energy = clamp(Math.round((mood * 0.4 + sleepHours * 0.3 + rand(1, 2)) * 0.7), 1, 10)

    const hour = pick([7, 8, 9, 18, 19, 20, 21])
    date.setHours(hour, rand(0, 59), 0, 0)

    try {
      await post(`/api/checkins?userId=${userId}`, {
        mood,
        energy,
        sleep: { hours: sleepHours, quality: sleepQualities[sleepQualIdx] },
        stress: { level: stress, source: stress >= 7 ? pick(stressSources) : '' },
        socialInteraction: social,
        triggers: stress >= 8 ? pick(stressSources) : '',
        physicalSymptoms: mood <= 3 && Math.random() < 0.5 ? [pick(symptoms)] : [],
        couldHelp: mood <= 5 ? pick(helpOptions) : '',
        journalNote: '',
        _seedTimestamp: date.toISOString(),
      })
      count++
    } catch (e) {
      errors++
    }

    await new Promise(r => setTimeout(r, 30))
  }

  console.log(`✓ ${count} check-ins (${errors} errors) — userId: ${userId}`)
}

console.log('\n✅ All demo users seeded.')
console.log('   The splash page will now show real-looking outcomes to new visitors.\n')
