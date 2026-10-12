/**
 * Available Pets for My Companion Pet
 * Kid-friendly pets (ages 6-16)
 */

export const AVAILABLE_PETS = [
  {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    description: 'A powerful fire-breathing dragon! Bold and adventurous.',
    color: '#FF6B6B',
    type: 'Mythical'
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '🔥🦅',
    description: 'A majestic bird that rises from the ashes. Magical and rare!',
    color: '#FF8C42',
    type: 'Mythical'
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    emoji: '🦄',
    description: 'A magical horse with a sparkly horn. Super cute and kind!',
    color: '#C77DFF',
    type: 'Magical'
  },
  {
    id: 'fox',
    name: 'Fox',
    emoji: '🦊',
    description: 'A clever and playful fox. Quick, smart, and fun!',
    color: '#FF8C42',
    type: 'Animal'
  },
  {
    id: 'owl',
    name: 'Owl',
    emoji: '🦉',
    description: 'A wise and mysterious owl. Perfect for night owls!',
    color: '#8B7355',
    type: 'Animal'
  },
  {
    id: 'penguin',
    name: 'Penguin',
    emoji: '🐧',
    description: 'An adorable waddling penguin. Cool and funny!',
    color: '#333333',
    type: 'Animal'
  },
  {
    id: 'panda',
    name: 'Panda',
    emoji: '🐼',
    description: 'A fluffy and gentle panda. Loves bamboo and cuddles!',
    color: '#000000',
    type: 'Animal'
  },
  {
    id: 'wolf',
    name: 'Wolf',
    emoji: '🐺',
    description: 'A loyal and strong wolf. Your fierce protector!',
    color: '#8B8B8B',
    type: 'Animal'
  },
  {
    id: 'cat',
    name: 'Cat',
    emoji: '🐱',
    description: 'An independent and sassy cat. Mysterious and fun!',
    color: '#FFB347',
    type: 'Animal'
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    emoji: '🐰',
    description: 'A bouncy and energetic rabbit. Always ready to play!',
    color: '#FFB6C1',
    type: 'Animal'
  },
  {
    id: 'dragon-blue',
    name: 'Ice Dragon',
    emoji: '🐲',
    description: 'A cool and icy dragon. Chill and awesome!',
    color: '#87CEEB',
    type: 'Mythical'
  },
  {
    id: 'gryphon',
    name: 'Gryphon',
    emoji: '🦅',
    description: 'A powerful eagle-lion hybrid. Strong and majestic!',
    color: '#DAA520',
    type: 'Mythical'
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    emoji: '🦋',
    description: 'A beautiful and delicate butterfly. Colorful and graceful!',
    color: '#FF69B4',
    type: 'Insect'
  },
  {
    id: 'bear',
    name: 'Bear',
    emoji: '🐻',
    description: 'A big, strong, and cuddly bear. A gentle giant!',
    color: '#8B4513',
    type: 'Animal'
  },
  {
    id: 'slime',
    name: 'Slime',
    emoji: '💚',
    description: 'A gooey and squishy slime creature. Weird and cool!',
    color: '#7FFF00',
    type: 'Fantasy'
  },
  {
    id: 'robot',
    name: 'Robot',
    emoji: '🤖',
    description: 'A futuristic robot pet. Beeps and boops included!',
    color: '#C0C0C0',
    type: 'Tech'
  }
]

export const getPetById = (id) => {
  return AVAILABLE_PETS.find(pet => pet.id === id)
}

export const getPetsByType = (type) => {
  return AVAILABLE_PETS.filter(pet => pet.type === type)
}
