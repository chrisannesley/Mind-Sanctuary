/**
 * seed-demo-online.mjs
 * Creates a demo user with 90 days of realistic check-in data on the live Railway backend.
 * Run: node seed-demo-online.mjs
 */

const API = 'https://mind-sanctuary-production.up.railway.app'

const socialOptions  = ['alone', 'family', 'friends', 'group']
const sleepQualities = ['poor', 'fair', 'good', 'excellent']
const symptoms       = ['headache', 'tension', 'fatigue', 'restless', 'nausea']
const helpOptions    = ['walk_outside', 'rest', 'music', 'shower', 'tea', 'journal', 'meditation', 'exercise', '']
const stressSources  = ['work deadline', 'family tension', 'financial worry', 'health concern', '', '', '']
const notes = [
  'Feeling a bit better today.',
  'Rough morning but afternoon improved.',
  'Good day overall.',
  'Struggled to get motivated.',
  'Had a great walk outside.',
  'Work was stressful but manageable.',
  'Slept well, feeling more positive.',
  'Anxious about upcoming appointments.',
  'Spent time with friends, helped a lot.',
  'Quiet day at home.',
  '', '', '', '', ''
]

const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const pick  = arr => arr[Math.floor(Math.random() * arr.length)]

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── 1. Create demo user ────────────────────────────────────────────────────
console.log('Creating demo user…')
const user = await post('/api/user/setup', {
  name: 'Demo User',
  mainConcern: 'General wellness',
})
console.log(`✓ Demo user created — userId: ${user.id}`)

// ── 2. Generate 90 days of check-ins ──────────────────────────────────────
const now       = new Date()
const startDate = new Date(now)
startDate.setDate(startDate.getDate() - 90)

let baseMood = 4.5
let momentum = 0
let count    = 0
let errors   = 0

for (let day = 0; day < 90; day++) {
  const date = new Date(startDate)
  date.setDate(date.getDate() + day)

  // Skip ~20% of days (realistic — nobody checks in every day)
  if (Math.random() < 0.2) continue

  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  // Gradual improvement trend
  baseMood   = Math.min(7.5, baseMood + (day < 45 ? 0.022 : 0.01))
  momentum   = momentum * 0.3 + (Math.random() - 0.5) * 2

  const roughPatch  = (day > 20 && day < 28) || (day > 55 && day < 60)
  const mood        = clamp(Math.round(baseMood + momentum + (roughPatch ? -1.5 : 0) + (isWeekend ? 0.5 : 0) + (Math.random() - 0.5)), 1, 10)
  const sleepHours  = clamp(Math.round((mood * 0.5 + 4 + (Math.random() - 0.5) * 2) * 2) / 2, 3, 10)
  const energy      = clamp(Math.round((mood * 0.4 + sleepHours * 0.3 + rand(1, 3)) * 0.7), 1, 10)
  const stress      = clamp(11 - mood + rand(-2, 2), 1, 10)
  const social      = isWeekend ? pick(['friends', 'family', 'alone', 'group']) : pick(['alone', 'alone', 'family', 'friends'])

  const hour = pick([7, 8, 9, 17, 18, 19, 20, 21])
  date.setHours(hour, rand(0, 59), 0, 0)

  // Override timestamp by injecting it — backend normally sets its own timestamp,
  // so we patch the check-in after creation using the database directly.
  // Instead, we submit with a custom timestamp field that the backend stores.
  const body = {
    mood,
    energy,
    sleep: {
      hours: sleepHours,
      quality: sleepQualities[clamp(Math.floor((sleepHours - 3) / 2), 0, 3)],
    },
    stress: { level: stress, source: stress >= 7 ? pick(stressSources) : '' },
    socialInteraction: social,
    triggers: stress >= 8 ? pick(stressSources) : '',
    physicalSymptoms: mood <= 4 && Math.random() < 0.5 ? [pick(symptoms)] : [],
    couldHelp: mood <= 5 ? pick(helpOptions) : '',
    journalNote: Math.random() < 0.15 ? pick(notes.filter(Boolean)) : '',
    _seedTimestamp: date.toISOString(), // backend will use this if present
  }

  try {
    await post(`/api/checkins?userId=${user.id}`, body)
    count++
    process.stdout.write(`\r  Posted ${count} check-ins…`)
  } catch (e) {
    errors++
  }

  // Small delay to avoid overwhelming the server
  await new Promise(r => setTimeout(r, 80))
}

console.log(`\n✓ Done — ${count} check-ins posted, ${errors} errors`)
console.log(`\nDemo account details:`)
console.log(`  Name:   Demo User`)
console.log(`  userId: ${user.id}`)
console.log(`\nView the data by opening the app and logging in as userId ${user.id}`)
console.log(`Or visit: https://mindsantuary.netlify.app`)
