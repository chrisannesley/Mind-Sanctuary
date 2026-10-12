import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'backend', 'mindwell.db')

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

const socialOptions = ['alone', 'family', 'friends', 'group']
const sleepQualities = ['poor', 'fair', 'good', 'excellent']
const symptoms = ['headache', 'tension', 'fatigue', 'restless', 'nausea']
const helpOptions = ['walk_outside', 'rest', 'music', 'shower', 'tea', 'journal', 'meditation', 'exercise', '']
const stressSources = ['work deadline', 'family tension', 'financial worry', 'health concern', '', '', '', '']
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
  '',  '', '', '', ''  // mostly no notes
]

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate 90 days of data starting 90 days ago
const now = new Date()
const startDate = new Date(now)
startDate.setDate(startDate.getDate() - 90)

let nextId = Math.max(...db.checkIns.map(c => c.id), 0) + 1
const newCheckIns = []

// Base mood trend: starts at 4.5, gradually improves to ~6.5 over 90 days
// with natural daily variation and some bad patches
let baseMood = 4.5
let momentum = 0  // momentum carries over day to day slightly

for (let day = 0; day < 90; day++) {
  const date = new Date(startDate)
  date.setDate(date.getDate() + day)

  // Skip ~20% of days (nobody checks in every single day)
  if (Math.random() < 0.2) continue

  const dayOfWeek = date.getDay() // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  // Gradual improvement trend
  baseMood = Math.min(7.5, baseMood + (day < 45 ? 0.02 : 0.01))

  // Momentum — good days tend to follow good days slightly
  momentum = momentum * 0.3 + (Math.random() - 0.5) * 2

  // Occasional rough patches (simulate bad weeks)
  const roughPatch = (day > 20 && day < 28) || (day > 55 && day < 60)
  const patchMod = roughPatch ? -1.5 : 0

  // Weekend boost
  const weekendBoost = isWeekend ? 0.5 : 0

  const mood = clamp(Math.round(baseMood + momentum + patchMod + weekendBoost + (Math.random() - 0.5)), 1, 10)

  // Sleep correlates loosely with mood
  const sleepHours = clamp(
    Math.round((mood * 0.5 + 4 + (Math.random() - 0.5) * 2) * 2) / 2,
    3, 10
  )
  const sleepQualityIdx = clamp(Math.floor((sleepHours - 3) / 2), 0, 3)
  const sleepQuality = sleepQualities[sleepQualityIdx]

  // Energy correlates with sleep and mood
  const energy = clamp(Math.round((mood * 0.4 + sleepHours * 0.3 + rand(1, 3)) * 0.7), 1, 10)

  // Stress inversely correlates with mood
  const stress = clamp(11 - mood + rand(-2, 2), 1, 10)

  // Social interaction more likely on weekends
  const social = isWeekend
    ? pick(['friends', 'family', 'alone', 'group'])
    : pick(['alone', 'alone', 'family', 'friends'])

  // Physical symptoms more likely when mood is low
  const hasSymptoms = mood <= 4 && Math.random() < 0.5
  const physicalSymptoms = hasSymptoms ? [pick(symptoms)] : []

  // Time of day — mostly morning/evening
  const hour = pick([7, 8, 9, 17, 18, 19, 20, 21])
  const minute = rand(0, 59)
  date.setHours(hour, minute, 0, 0)

  newCheckIns.push({
    id: nextId++,
    userId: 1,
    mood,
    energy,
    sleep: { hours: sleepHours, quality: sleepQuality },
    stress: { level: stress, source: stress >= 7 ? pick(stressSources) : '' },
    socialInteraction: social,
    triggers: stress >= 8 ? pick(stressSources) : '',
    physicalSymptoms,
    couldHelp: mood <= 5 ? pick(helpOptions) : '',
    journalNote: Math.random() < 0.15 ? pick(notes).replace('', '') : '',
    timestamp: date.toISOString(),
    source: 'full'
  })
}

// Add to existing check-ins
db.checkIns = [...db.checkIns, ...newCheckIns]
db.nextCheckInId = nextId

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
console.log(`✓ Added ${newCheckIns.length} check-ins spanning 90 days`)
console.log(`  Mood range: ${Math.min(...newCheckIns.map(c=>c.mood))} – ${Math.max(...newCheckIns.map(c=>c.mood))}`)
console.log(`  Total check-ins in DB: ${db.checkIns.length}`)
