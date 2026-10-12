/**
 * Beast Companion Model
 * Handles beast generation, storage, and state management
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Data file paths
const BEASTS_DIR = path.join(__dirname, '../../data')
const BEASTS_FILE = path.join(BEASTS_DIR, 'beasts.json')

// Ensure data directory exists
if (!fs.existsSync(BEASTS_DIR)) {
  fs.mkdirSync(BEASTS_DIR, { recursive: true })
}

// Initialize beasts file if it doesn't exist
if (!fs.existsSync(BEASTS_FILE)) {
  fs.writeFileSync(BEASTS_FILE, JSON.stringify([], null, 2))
}

/**
 * Beast Archetypes and their characteristics
 */
const ARCHETYPES = [
  'Dragon',
  'Phoenix',
  'Fox',
  'Wolf',
  'Gryphon',
  'Chimera',
  'Basilisk',
  'Golem',
  'Spirit',
  'Hybrid'
]

const TEMPERAMENTS = [
  'Aggressive',
  'Playful',
  'Calm',
  'Anxious',
  'Curious',
  'Lazy',
  'Protective',
  'Mischievous'
]

const SPECIAL_TRAITS = [
  'Wings',
  'Multiple Heads',
  'Magical Aura',
  'Crystal Formations',
  'Bioluminescence',
  'Shape-shifter',
  'Elemental Affinity',
  'Fiery',
  'Frosty',
  'Ethereal'
]

/**
 * Generate a random color as RGB hex
 */
function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Get complementary color
 */
function getComplementaryColor(hexColor) {
  const rgb = parseInt(hexColor.slice(1), 16)
  const r = 255 - (rgb >> 16) & 255
  const g = 255 - (rgb >> 8) & 255
  const b = 255 - rgb & 255
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

/**
 * Select archetype based on user energy level
 */
function selectArchetype(energyLevel = 5) {
  // High energy users get active creatures
  if (energyLevel > 7) {
    return ARCHETYPES[Math.floor(Math.random() * 3)] // Dragon, Phoenix, Fox
  }
  // Low energy users get calm creatures
  if (energyLevel < 3) {
    return ARCHETYPES[Math.floor(Math.random() * 3) + 3] // Wolf, Gryphon, Chimera
  }
  // Medium energy gets random
  return ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)]
}

/**
 * Match temperament to stress level
 */
function matchTemperament(stressLevel = 5) {
  if (stressLevel > 7) {
    return 'Protective' // Protective beasts for anxious users
  }
  if (stressLevel < 3) {
    return 'Playful' // Playful beasts for relaxed users
  }
  return TEMPERAMENTS[Math.floor(Math.random() * TEMPERAMENTS.length)]
}

/**
 * Roll for rare traits based on streak
 */
function rollRareTraits(checkInStreak = 0) {
  const traits = []
  const traitProbability = Math.min(checkInStreak / 10, 0.5) // Max 50% chance

  for (let i = 0; i < 3; i++) {
    if (Math.random() < traitProbability) {
      const randomTraits = SPECIAL_TRAITS.filter(
        t => !traits.includes(t)
      )
      if (randomTraits.length > 0) {
        traits.push(randomTraits[Math.floor(Math.random() * randomTraits.length)])
      }
    }
  }

  return traits.length > 0 ? traits : [SPECIAL_TRAITS[Math.floor(Math.random() * SPECIAL_TRAITS.length)]]
}

/**
 * Generate a new unique beast
 */
export function generateBeast(userId, userData = {}) {
  const primaryColor = generateRandomColor()
  const secondaryColor = getComplementaryColor(primaryColor)
  const accentColor = generateRandomColor()

  const archetype = selectArchetype(userData.energyLevel || 5)
  const temperament = matchTemperament(userData.stressLevel || 5)
  const traits = rollRareTraits(userData.checkInStreak || 0)

  const beast = {
    id: crypto.randomUUID(),
    userId,
    name: generateBeastName(archetype),
    archetype,
    stage: 'egg',
    health: 100,
    happiness: 80,
    hunger: 50,
    energy: 75,
    bond: 50,
    growthProgress: 0,
    birthDate: new Date().toISOString(),
    deathDate: null,
    resurrectionCount: 0,
    isAlive: true,
    lastInteraction: new Date().toISOString(),
    lifespan: 0,
    genetics: {
      primaryColor,
      secondaryColor,
      accentColor,
      size: Math.floor(Math.random() * 5) + 1, // 1-5 (15cm to 200cm+)
      temperament,
      specialTraits: traits,
      archetypeEmoji: getArchetypeEmoji(archetype)
    },
    linkedStat: selectLinkedStat(userData),
    careStreak: 0,
    careLog: [],
    lastCheckIn: null
  }

  return beast
}

/**
 * Generate a name for a beast based on archetype
 */
function generateBeastName(archetype) {
  const prefixes = {
    Dragon: ['Ember', 'Inferno', 'Scale', 'Sky', 'Flame', 'Ash'],
    Phoenix: ['Blaze', 'Ember', 'Cinder', 'Flame', 'Inferno', 'Spark'],
    Fox: ['Whisper', 'Swift', 'Sly', 'Cunning', 'Fawn', 'Rusty'],
    Wolf: ['Frost', 'Shadow', 'Storm', 'Silver', 'Fang', 'Howl'],
    Gryphon: ['Valor', 'Sage', 'Noble', 'Crown', 'Crest', 'Royal'],
    Chimera: ['Chaos', 'Wonder', 'Myth', 'Echo', 'Cipher', 'Rune'],
    Basilisk: ['Venom', 'Gaze', 'Serpent', 'Coil', 'Sting', 'Hiss'],
    Golem: ['Stone', 'Iron', 'Titan', 'Boulder', 'Granite', 'Ore'],
    Spirit: ['Wisp', 'Spectre', 'Ghost', 'Phantom', 'Wraith', 'Echo'],
    Hybrid: ['Chimeric', 'Blend', 'Fusion', 'Fusion', 'Synth', 'Anomaly']
  }

  const suffixes = ['fang', 'claw', 'wing', 'fire', 'storm', 'heart', 'soul', 'bane', 'ward', 'blade']

  const prefixList = prefixes[archetype] || prefixes['Hybrid']
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]

  return `${prefix}${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`
}

/**
 * Get emoji representation for archetype
 */
function getArchetypeEmoji(archetype) {
  const emojis = {
    Dragon: '🐉',
    Phoenix: '🔥',
    Fox: '🦊',
    Wolf: '🐺',
    Gryphon: '🦅',
    Chimera: '🦁',
    Basilisk: '🐍',
    Golem: '🗿',
    Spirit: '👻',
    Hybrid: '✨'
  }
  return emojis[archetype] || '🐉'
}

/**
 * Select which user stat the beast is linked to
 */
function selectLinkedStat(userData) {
  const stats = ['energy', 'mood', 'sleep', 'stress']
  return stats[Math.floor(Math.random() * stats.length)]
}

/**
 * Calculate beast age in days
 */
function calculateAge(birthDate) {
  const birth = new Date(birthDate)
  const now = new Date()
  const diffTime = Math.abs(now - birth)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Determine beast stage based on age
 */
function determineStage(birthDate, age) {
  if (age < 1) return 'egg'
  if (age < 8) return 'baby'
  if (age < 20) return 'juvenile'
  if (age < 70) return 'adult'
  if (age < 100) return 'elder'
  return 'deceased'
}

/**
 * Record a care action and update health
 */
export function recordCareAction(beast, action) {
  const healthChanges = {
    feed: 3,
    play: 5,
    pet: 2,
    groom: 3,
    sleep: 0, // Handled separately
    reflect: 8,
    checkin: 10
  }

  const hpChange = healthChanges[action] || 0
  const newHealth = Math.min(100, Math.max(0, beast.health + hpChange))
  const happinessChange = action === 'play' ? 8 : action === 'feed' ? 2 : action === 'pet' ? 3 : 0

  beast.health = newHealth
  beast.happiness = Math.min(100, beast.happiness + happinessChange)
  beast.lastInteraction = new Date().toISOString()
  beast.careStreak = Math.max(beast.careStreak + 1, 1)

  const careEvent = {
    timestamp: new Date().toISOString(),
    type: action,
    hpChange,
    note: `${action.charAt(0).toUpperCase()}${action.slice(1)} completed`
  }

  beast.careLog.push(careEvent)

  return beast
}

/**
 * Update beast health based on check-in data
 */
export function updateHealthFromCheckIn(beast, checkInData) {
  let healthChange = 0

  // Mood impact
  if (checkInData.moodScore) {
    if (checkInData.moodScore >= 7) healthChange += 10
    else if (checkInData.moodScore <= 3) healthChange -= 8
  }

  // Sleep impact
  if (checkInData.sleepHours) {
    if (checkInData.sleepHours >= 7) healthChange += 10
    else if (checkInData.sleepHours < 5) healthChange -= 10
  }

  // Stress impact
  if (checkInData.stressLevel) {
    if (checkInData.stressLevel <= 3) healthChange += 5
    else if (checkInData.stressLevel >= 8) healthChange -= 8
  }

  beast.health = Math.min(100, Math.max(0, beast.health + healthChange))
  beast.lastCheckIn = new Date().toISOString()
  
  recordCareAction(beast, 'checkin')

  return beast
}

/**
 * Apply decay for neglect
 */
export function applyDecay(beast) {
  const lastInteraction = new Date(beast.lastInteraction)
  const now = new Date()
  const hoursSinceInteraction = (now - lastInteraction) / (1000 * 60 * 60)

  // -3 HP per hour after 24 hours of neglect
  if (hoursSinceInteraction > 24) {
    const decayHours = Math.floor(hoursSinceInteraction - 24)
    const decayAmount = decayHours * 3
    beast.health = Math.max(0, beast.health - decayAmount)
  }

  // Auto-death at 0 HP
  if (beast.health <= 0 && beast.isAlive) {
    beast.isAlive = false
    beast.deathDate = new Date().toISOString()
  }

  return beast
}

/**
 * Evolve beast to next stage
 */
export function evolveBeast(beast) {
  const age = calculateAge(beast.birthDate)
  const newStage = determineStage(beast.birthDate, age)

  if (newStage !== beast.stage) {
    beast.stage = newStage
    beast.growthProgress = 0
    return { beast, evolved: true, newStage }
  }

  return { beast, evolved: false }
}

/**
 * Save all beasts to file
 */
function saveBeasts(beasts) {
  fs.writeFileSync(BEASTS_FILE, JSON.stringify(beasts, null, 2))
}

/**
 * Load all beasts from file
 */
function loadBeasts() {
  try {
    const data = fs.readFileSync(BEASTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading beasts:', error)
    return []
  }
}

/**
 * Get all beasts for a user
 */
export function getUserBeasts(userId) {
  const beasts = loadBeasts()
  return beasts.filter(b => b.userId === parseInt(userId))
}

/**
 * Get current (alive) beast for a user
 */
export function getCurrentBeast(userId) {
  const beasts = getUserBeasts(userId)
  return beasts.find(b => b.isAlive) || null
}

/**
 * Get specific beast by ID
 */
export function getBeastById(beastId) {
  const beasts = loadBeasts()
  return beasts.find(b => b.id === beastId) || null
}

/**
 * Create and save a new beast
 */
export function createBeast(userId, userData) {
  const beast = generateBeast(userId, userData)
  const beasts = loadBeasts()
  beasts.push(beast)
  saveBeasts(beasts)
  return beast
}

/**
 * Update and save a beast
 */
export function updateBeast(beastId, updates) {
  const beasts = loadBeasts()
  const index = beasts.findIndex(b => b.id === beastId)

  if (index === -1) return null

  beasts[index] = { ...beasts[index], ...updates }
  saveBeasts(beasts)
  return beasts[index]
}

/**
 * Resurrect a dead beast
 */
export function resurrectBeast(beastId) {
  const beast = getBeastById(beastId)
  if (!beast) return null

  beast.isAlive = true
  beast.deathDate = null
  beast.resurrectionCount += 1
  beast.health = 50
  beast.lastInteraction = new Date().toISOString()

  return updateBeast(beastId, beast)
}

export default {
  generateBeast,
  recordCareAction,
  updateHealthFromCheckIn,
  applyDecay,
  evolveBeast,
  getUserBeasts,
  getCurrentBeast,
  getBeastById,
  createBeast,
  updateBeast,
  resurrectBeast,
  calculateAge,
  determineStage
}
