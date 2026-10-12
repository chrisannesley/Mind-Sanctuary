// Realistic Avatar Generator
// Uses multiple high-quality human face APIs

const REALISTIC_AVATAR_SOURCES = [
  // This Person Does Not Exist - Ultra realistic AI faces
  {
    name: 'TPDNE',
    url: () => `https://thispersondoesnotexist.com/image?cache=${Math.random()}`,
    quality: 'ultra-realistic',
    type: 'ai-generated'
  },
  
  // Unsplash - Real human portraits
  {
    name: 'Unsplash',
    url: () => `https://source.unsplash.com/256x256/?portrait,headshot,face&${Math.random()}`,
    quality: 'realistic',
    type: 'real-photos'
  },
  
  // Lorem Picsum - Realistic portraits
  {
    name: 'Picsum',
    url: () => `https://picsum.photos/256/256?random=${Math.random()}`,
    quality: 'realistic',
    type: 'real-photos'
  },
  
  // DiceBear Personas - Illustrated realistic
  {
    name: 'DiceBear Personas',
    url: () => `https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}&scale=80&backgroundColor=random`,
    quality: 'illustrated-realistic',
    type: 'illustrated'
  },
  
  // DiceBear Lorelei - Artistic realistic
  {
    name: 'DiceBear Lorelei',
    url: () => `https://api.dicebear.com/7.x/lorelei/svg?seed=${Math.random()}&scale=80&backgroundColor=random`,
    quality: 'artistic-realistic',
    type: 'illustrated'
  },
  
  // Pravatar - Diverse realistic avatars
  {
    name: 'Pravatar',
    url: () => `https://i.pravatar.cc/256?img=${Math.floor(Math.random() * 70)}&u=${Math.random()}`,
    quality: 'realistic',
    type: 'illustrated'
  },
]

// Generate a realistic avatar
export const generateRealisticAvatar = async () => {
  try {
    // Prefer ultra-realistic sources first
    const preferredSources = REALISTIC_AVATAR_SOURCES.filter(s => 
      s.quality === 'ultra-realistic' || s.quality === 'realistic'
    )
    
    // Shuffle array
    const shuffled = [...preferredSources].sort(() => Math.random() - 0.5)
    
    // Try each source
    for (let source of shuffled) {
      try {
        const url = source.url()
        
        // Test if image loads
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors'
        })
        
        if (response.ok || response.status === 0) {
          return url
        }
      } catch (e) {
        // Continue to next source
        console.log(`Avatar source ${source.name} failed, trying next...`)
      }
    }
    
    // Fallback to illustrated realistic
    const fallbackSource = REALISTIC_AVATAR_SOURCES.find(s => s.name === 'DiceBear Personas')
    return fallbackSource.url()
    
  } catch (error) {
    console.error('Error generating realistic avatar:', error)
    // Ultimate fallback
    return `https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}&scale=80&backgroundColor=random`
  }
}

// Get avatar info
export const getAvatarInfo = () => {
  return {
    sources: REALISTIC_AVATAR_SOURCES,
    totalSources: REALISTIC_AVATAR_SOURCES.length,
    description: 'Generates realistic human avatars from multiple high-quality sources'
  }
}

// Get random avatar name
export const getRandomAvatarName = () => {
  const names = [
    'Sarah',
    'Alex',
    'Jordan',
    'Casey',
    'Morgan',
    'Riley',
    'Taylor',
    'Jamie',
    'Cameron',
    'Quinn',
    'Avery',
    'Blake',
    'Dakota',
    'Finley',
    'Harper',
    'Indigo',
    'Justice',
    'Kai',
    'Logan',
    'Morgan'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

// Get avatar personality
export const getRandomPersonality = () => {
  const personalities = [
    'Warm and nurturing',
    'Calm and grounding',
    'Strong and understanding',
    'Compassionate and caring',
    'Patient and supportive',
    'Empathetic and kind',
    'Gentle and encouraging',
    'Wise and thoughtful'
  ]
  return personalities[Math.floor(Math.random() * personalities.length)]
}

export default {
  generateRealisticAvatar,
  getAvatarInfo,
  getRandomAvatarName,
  getRandomPersonality
}
