/**
 * Pet Logic & Calculations
 * Handles aging, evolution, health decay, etc.
 */

export const PET_STAGES = {
  EGG: 'egg',
  BABY: 'baby',
  JUVENILE: 'juvenile',
  YOUNG_ADULT: 'young_adult',
  ADULT: 'adult',
  ELDER: 'elder',
  DECEASED: 'deceased'
}

export const STAGE_DURATIONS = {
  egg: { min: 0.5, max: 1 }, // hours
  baby: { min: 2, max: 4 },
  juvenile: { min: 3, max: 5 },
  young_adult: { min: 5, max: 7 },
  adult: { min: 30, max: 60 },
  elder: { min: 20, max: 30 }
}

export const STAGE_NAMES = {
  egg: '🥚 Egg',
  baby: '👶 Baby',
  juvenile: '🧒 Juvenile',
  young_adult: '👦 Young Adult',
  adult: '💪 Adult',
  elder: '👴 Elder',
  deceased: '⚰️ Deceased'
}

export const STAGE_EMOJIS = {
  egg: '🥚',
  baby: '👶',
  juvenile: '🧒',
  young_adult: '👦',
  adult: '💪',
  elder: '👴',
  deceased: '⚰️'
}

/**
 * Calculate current stage based on age
 */
export function calculateStage(ageInDays) {
  if (ageInDays < 0.5) return PET_STAGES.EGG
  if (ageInDays < 4.5) return PET_STAGES.BABY
  if (ageInDays < 9.5) return PET_STAGES.JUVENILE
  if (ageInDays < 16.5) return PET_STAGES.YOUNG_ADULT
  if (ageInDays < 76.5) return PET_STAGES.ADULT
  return PET_STAGES.ELDER
}

/**
 * Calculate growth progress to next stage (0-100)
 */
export function calculateGrowthProgress(ageInDays, currentStage) {
  const stages = [
    { stage: PET_STAGES.EGG, min: 0, max: 0.5 },
    { stage: PET_STAGES.BABY, min: 0.5, max: 4.5 },
    { stage: PET_STAGES.JUVENILE, min: 4.5, max: 9.5 },
    { stage: PET_STAGES.YOUNG_ADULT, min: 9.5, max: 16.5 },
    { stage: PET_STAGES.ADULT, min: 16.5, max: 76.5 },
    { stage: PET_STAGES.ELDER, min: 76.5, max: 120 }
  ]

  const current = stages.find(s => s.stage === currentStage)
  if (!current) return 100

  const progress = ((ageInDays - current.min) / (current.max - current.min)) * 100
  return Math.max(0, Math.min(100, progress))
}

/**
 * Calculate health decay based on neglect
 */
export function calculateHealthDecay(lastInteractionTime) {
  const now = Date.now()
  const hoursSinceInteraction = (now - lastInteractionTime) / (1000 * 60 * 60)

  if (hoursSinceInteraction < 1) return 0
  if (hoursSinceInteraction < 24) return hoursSinceInteraction * 0.5 // -0.5 HP/hour
  if (hoursSinceInteraction < 48) return 12 + (hoursSinceInteraction - 24) * 1 // -12 + extra
  return 12 + 24 + (hoursSinceInteraction - 48) * 2 // accelerating decay
}

/**
 * Get pet personality description based on traits
 */
export function getPetPersonality(archetype, traits = []) {
  const personalities = {
    dragon: 'Bold, adventurous, and sometimes mischievous',
    phoenix: 'Magical, wise, and majestic',
    unicorn: 'Gentle, kind, and magical',
    fox: 'Clever, playful, and quick-witted',
    owl: 'Wise, mysterious, and thoughtful',
    penguin: 'Fun-loving, loyal, and goofy',
    panda: 'Gentle, calm, and peaceful',
    wolf: 'Loyal, protective, and strong',
    cat: 'Independent, sassy, and affectionate',
    rabbit: 'Energetic, bouncy, and friendly',
    'dragon-blue': 'Cool, calm, and intelligent',
    gryphon: 'Powerful, regal, and brave',
    butterfly: 'Delicate, beautiful, and peaceful',
    bear: 'Strong, gentle, and cuddly',
    slime: 'Weird, fun, and unpredictable',
    robot: 'Technical, futuristic, and loyal'
  }

  return personalities[archetype] || 'Unique and special'
}

/**
 * Get interaction responses based on pet mood
 */
export const INTERACTION_RESPONSES = {
  feed: [
    'nom nom nom! 🍖',
    'Thank you! So delicious! 😋',
    'Mmm, my favorite! 💕',
    'Yummy yummy! 🤤',
    'You take good care of me! 😊'
  ],
  play: [
    'This is so much fun! 🎉',
    'Wheee! Again! 🏃',
    'I love playing with you! 💕',
    'This makes me so happy! 😄',
    'Best friend ever! 🌟'
  ],
  pet: [
    'That feels nice... 😸',
    'I love you! 💕',
    'You\'re so sweet! 🥰',
    'purrrr... 😻',
    'Your touch makes me happy! 🌈'
  ],
  rest: [
    'zzzzz... 😴',
    'Sweet dreams... 💤',
    'Thank you for caring... 🌙',
    'I needed that! 😴',
    'Sleep tight... 💫'
  ]
}

/**
 * Calculate pet's daily bonus/penalty
 */
export function calculateDailyImpact(lastDailyCheckTime) {
  const now = Date.now()
  const hoursSinceDaily = (now - lastDailyCheckTime) / (1000 * 60 * 60)

  // Reset daily if 24 hours have passed
  if (hoursSinceDaily >= 24) {
    return { bonusHP: -5, bonusHappiness: -10, canGetDaily: true }
  }

  return { bonusHP: 0, bonusHappiness: 0, canGetDaily: false }
}
