import React, { useState, useEffect } from 'react'
import { Heart, Award, Users, Zap, Plus, RefreshCw } from 'lucide-react'
import PetSelection from './PetSelection'
import { getPetById } from '../data/pets'
import { 
  calculateStage, 
  calculateGrowthProgress,
  STAGE_NAMES,
  STAGE_EMOJIS,
  getPetPersonality,
  INTERACTION_RESPONSES
} from '../utils/petLogic'

/**
 * Enhanced My Companion Pet Component
 * Fully frontend-based - NO BACKEND REQUIRED
 * Features: Aging, Evolution, Detailed Interactions, Animations, Emotions
 */
export default function PetCompanionEnhanced({ userId = 1 }) {
  const [currentPet, setCurrentPet] = useState(null)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('main')
  const [showPetSelection, setShowPetSelection] = useState(false)
  
  // Animation & UI state
  const [petAnimation, setPetAnimation] = useState('idle')
  const [showParticles, setShowParticles] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [emotionState, setEmotionState] = useState('happy')
  const [particles, setParticles] = useState([])

  // Mini-game state
  const [showMiniGame, setShowMiniGame] = useState(false)
  const [miniGameType, setMiniGameType] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    loadPetsFromStorage()
    
    // Auto-age pets every 30 seconds
    const interval = setInterval(() => {
      setCurrentPet(prev => {
        if (prev) {
          const updated = {
            ...prev,
            age: prev.age + 0.0069 // ~1 hour per second for demo
          }
          updated.stage = calculateStage(updated.age)
          savePetToStorage(updated)
          return updated
        }
        return prev
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const loadPetsFromStorage = () => {
    try {
      const stored = localStorage.getItem('myCompanionPets')
      if (stored) {
        const data = JSON.parse(stored)
        setPets(data)
        if (data.length > 0) {
          setCurrentPet(data[0])
        } else {
          setShowPetSelection(true)
        }
      } else {
        setShowPetSelection(true)
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
      setShowPetSelection(true)
    }
    setLoading(false)
  }

  const savePetToStorage = (pet) => {
    try {
      const updated = pets.map(p => p.id === pet.id ? pet : p)
      localStorage.setItem('myCompanionPets', JSON.stringify(updated))
      setPets(updated)
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }

  const generateNewPet = (petTypeId) => {
    try {
      const petType = getPetById(petTypeId)
      
      const newPet = {
        id: `pet-${Date.now()}`,
        userId,
        name: petType.name,
        archetype: petType.name,
        petType: petTypeId,
        stage: 'egg',
        health: 100,
        happiness: 80,
        bond: 30,
        age: 0,
        colors: { primary: petType.color, secondary: petType.color },
        specialTraits: [petType.type],
        generatedImage: petType.emoji,
        isAlive: true,
        createdAt: new Date().toISOString(),
        lastInteraction: new Date().toISOString(),
        careLog: []
      }
      
      const updatedPets = [...pets, newPet]
      localStorage.setItem('myCompanionPets', JSON.stringify(updatedPets))
      
      setCurrentPet(newPet)
      setPets(updatedPets)
      setShowPetSelection(false)
      setActionMessage(`🎉 Meet ${newPet.name}! Your new ${petType.name} friend!`)
    } catch (error) {
      console.error('Error generating pet:', error)
    }
  }

  const performAction = (action) => {
    if (!currentPet) return

    setPetAnimation(action)
    const response = INTERACTION_RESPONSES[action][Math.floor(Math.random() * INTERACTION_RESPONSES[action].length)]
    setActionMessage(response)
    
    // Create particles
    const newParticles = Array(5).fill(0).map(() => ({
      id: Math.random(),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      emoji: ['❤️', '⭐', '✨', '🌟', '💕'][Math.floor(Math.random() * 5)]
    }))
    setParticles(newParticles)
    setShowParticles(true)

    // Update pet stats
    const hpChange = { feed: 5, play: 8, pet: 3, rest: 15 }[action] || 0
    const happinessChange = { feed: 3, play: 10, pet: 5, rest: 8 }[action] || 0
    const bondChange = { feed: 1, play: 3, pet: 4, rest: 2 }[action] || 0

    const updatedPet = {
      ...currentPet,
      health: Math.min(100, currentPet.health + hpChange),
      happiness: Math.min(100, currentPet.happiness + happinessChange),
      bond: Math.min(100, currentPet.bond + bondChange),
      lastInteraction: new Date().toISOString(),
      careLog: [
        ...(currentPet.careLog || []),
        { action, timestamp: new Date().toISOString(), hpChange }
      ]
    }

    // Determine emotion
    if (updatedPet.happiness > 80) setEmotionState('ecstatic')
    else if (updatedPet.happiness > 60) setEmotionState('happy')
    else if (updatedPet.happiness > 40) setEmotionState('neutral')
    else if (updatedPet.happiness > 20) setEmotionState('sad')
    else setEmotionState('upset')

    setCurrentPet(updatedPet)
    savePetToStorage(updatedPet)

    setTimeout(() => {
      setPetAnimation('idle')
      setShowParticles(false)
      setActionMessage('')
    }, 1500)
  }

  const getEmotionEmoji = () => {
    const emotions = {
      ecstatic: '😄',
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      upset: '😠'
    }
    return emotions[emotionState] || '😊'
  }

  const getStageDisplay = () => {
    if (!currentPet) return ''
    const stage = calculateStage(currentPet.age || 0)
    return STAGE_NAMES[stage] || stage
  }

  const getGrowthProgress = () => {
    if (!currentPet) return 0
    const stage = calculateStage(currentPet.age || 0)
    return calculateGrowthProgress(currentPet.age || 0, stage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐾</div>
          <p className="text-gray-600 text-lg font-semibold">Loading your companion...</p>
        </div>
      </div>
    )
  }

  if (showPetSelection || !currentPet) {
    return <PetSelection onSelectPet={generateNewPet} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-rose-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🐾</span>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                  My Companion Pet
                </h1>
                <p className="text-gray-600 text-sm">Care for {currentPet.name}!</p>
              </div>
            </div>
            <button
              onClick={() => setShowPetSelection(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Pet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Main Pet Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Health bar */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${currentPet.health}%` }}></div>

          <div className="p-10">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Pet Visual */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="relative">
                  {/* Main pet emoji with animation */}
                  <div className={`text-9xl transition-all duration-300 ${
                    petAnimation === 'play' ? 'animate-bounce' :
                    petAnimation === 'feed' ? 'scale-95' :
                    petAnimation === 'rest' ? 'opacity-50' :
                    'scale-100'
                  }`}>
                    {currentPet.generatedImage}
                  </div>

                  {/* Emotion */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-4xl">
                    {getEmotionEmoji()}
                  </div>

                  {/* Stage indicator */}
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    {getStageDisplay()}
                  </div>

                  {/* Particles */}
                  {showParticles && particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute text-3xl animate-bounce"
                      style={{
                        left: `calc(50% + ${particle.x}px)`,
                        top: `calc(50% + ${particle.y}px)`,
                        animation: `float 1.5s ease-out forwards`
                      }}
                    >
                      {particle.emoji}
                    </div>
                  ))}
                </div>

                {/* Pet name and personality */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <h2 className="text-3xl font-bold text-gray-800">{currentPet.name}</h2>
                  <p className="text-sm text-gray-600 italic">"{getPetPersonality(currentPet.petType)}"</p>
                  {actionMessage && (
                    <p className="mt-2 text-rose-600 font-bold animate-pulse text-lg">{actionMessage}</p>
                  )}
                </div>
              </div>

              {/* Stats & Controls */}
              <div className="flex-1 space-y-6">
                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">💖 Status</h3>

                  {/* Health */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span className="font-semibold text-gray-700">Health</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.health)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.health}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Happiness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-gray-700">Happiness</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.happiness)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.happiness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bond */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-500" />
                        <span className="font-semibold text-gray-700">Bond</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.bond)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.bond}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Age & Growth */}
                  <div className="border-t-2 border-orange-200 pt-4 mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-bold">{Math.round(currentPet.age * 10) / 10}</span> days old
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full transition-all duration-500"
                        style={{ width: `${getGrowthProgress()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Growing to next stage...</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">🎮 Interactions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => performAction('feed')}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      🍖<br/>Feed
                    </button>
                    <button
                      onClick={() => performAction('play')}
                      className="bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      🎮<br/>Play
                    </button>
                    <button
                      onClick={() => performAction('pet')}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      ❤️<br/>Pet
                    </button>
                    <button
                      onClick={() => performAction('rest')}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      😴<br/>Rest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
            {[
              { id: 'about', label: '📖 About' },
              { id: 'history', label: '📜 Life Story' },
              { id: 'gallery', label: '🖼️ Gallery' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-bold transition ${
                  activeTab === tab.id
                    ? 'text-rose-600 border-b-4 border-rose-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Type</p>
                    <p className="text-2xl font-bold text-blue-700">{currentPet.archetype}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Stage</p>
                    <p className="text-2xl font-bold text-green-700">{getStageDisplay()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Age</p>
                    <p className="text-2xl font-bold text-purple-700">{Math.round(currentPet.age * 10) / 10} days</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Bond Level</p>
                    <p className="text-2xl font-bold text-orange-700">{Math.round(currentPet.bond)}%</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-100 to-orange-100 p-6 rounded-lg border-2 border-rose-200">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">✨ Personality</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentPet.name} is a {currentPet.archetype} with a {getPetPersonality(currentPet.petType).toLowerCase()} nature.
                    Every interaction strengthens your bond and helps {currentPet.name} grow!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-800 mb-4">📚 {currentPet.name}'s Journey</h3>
                <div className="space-y-3">
                  {[
                    { stage: 'Egg', emoji: '🥚', desc: 'Just beginning...' },
                    { stage: 'Baby', emoji: '👶', desc: 'Learning & growing' },
                    { stage: 'Juvenile', emoji: '🧒', desc: 'Exploring the world' },
                    { stage: 'Young Adult', emoji: '👦', desc: 'Becoming stronger' },
                    { stage: 'Adult', emoji: '💪', desc: 'Reached full potential' },
                    { stage: 'Elder', emoji: '👴', desc: 'Wise and graceful' }
                  ].map((s, idx) => {
                    const completed = calculateStage(currentPet.age || 0) !== s.stage.toLowerCase()
                    const isCurrent = getStageDisplay().includes(s.stage)
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 transition ${
                          isCurrent
                            ? 'bg-gradient-to-r from-rose-100 to-orange-100 border-rose-400'
                            : completed
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{s.emoji}</div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{s.stage} {isCurrent && '👈 Current'}</p>
                            <p className="text-sm text-gray-600">{s.desc}</p>
                          </div>
                          {completed && <div className="text-2xl">✅</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Your pet collection ({pets.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pets.map(pet => (
                    <div
                      key={pet.id}
                      className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center cursor-pointer transition hover:shadow-lg ${
                        pet.id === currentPet.id ? 'ring-4 ring-rose-400' : ''
                      }`}
                      onClick={() => setCurrentPet(pet)}
                    >
                      <div className="text-5xl mb-3">{pet.generatedImage}</div>
                      <p className="font-bold text-gray-800 text-lg">{pet.name}</p>
                      <p className="text-sm text-gray-600">{pet.archetype}</p>
                      <p className="text-xs text-gray-500 mt-2">Age: {Math.round(pet.age * 10) / 10} days</p>
                      <div className="mt-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          pet.isAlive
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {pet.isAlive ? '✓ Active' : 'Resting'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {pets.length < 16 && (
                  <button
                    onClick={() => setShowPetSelection(true)}
                    className="w-full mt-6 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    + Create Another Companion
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl shadow-lg p-8 border-2 border-rose-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 Care Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🌱 Growth Stages</h4>
              <p className="text-sm text-gray-700">Your pet grows through 6 stages: Egg → Baby → Juvenile → Young Adult → Adult → Elder</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">❤️ Keep Healthy</h4>
              <p className="text-sm text-gray-700">Feed, play, and pet your companion daily to maintain high health & happiness</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🔗 Build Bonds</h4>
              <p className="text-sm text-gray-700">The more you interact, the stronger your bond. Unlocks special features!</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">⏰ Time Matters</h4>
              <p className="text-sm text-gray-700">Check in regularly! Your pet needs care every day to stay happy</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm border-t border-rose-200">
        <p className="font-semibold mb-2">My Companion Pet • Standalone Offline App</p>
      </footer>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
      `}</style>
    </div>
  )
}

  const performAction = (action) => {
    if (!currentPet) return

    setPetAnimation(action)
    const response = INTERACTION_RESPONSES[action][Math.floor(Math.random() * INTERACTION_RESPONSES[action].length)]
    setActionMessage(response)
    
    // Create particles
    const newParticles = Array(5).fill(0).map(() => ({
      id: Math.random(),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      emoji: ['❤️', '⭐', '✨', '🌟', '💕'][Math.floor(Math.random() * 5)]
    }))
    setParticles(newParticles)
    setShowParticles(true)

    // Update pet stats
    const hpChange = { feed: 5, play: 8, pet: 3, rest: 15 }[action] || 0
    const happinessChange = { feed: 3, play: 10, pet: 5, rest: 8 }[action] || 0
    const bondChange = { feed: 1, play: 3, pet: 4, rest: 2 }[action] || 0

    const updatedPet = {
      ...currentPet,
      health: Math.min(100, currentPet.health + hpChange),
      happiness: Math.min(100, currentPet.happiness + happinessChange),
      bond: Math.min(100, currentPet.bond + bondChange),
      lastInteraction: new Date()
    }

    // Determine emotion
    if (updatedPet.happiness > 80) setEmotionState('ecstatic')
    else if (updatedPet.happiness > 60) setEmotionState('happy')
    else if (updatedPet.happiness > 40) setEmotionState('neutral')
    else if (updatedPet.happiness > 20) setEmotionState('sad')
    else setEmotionState('upset')

    setCurrentPet(updatedPet)

    setTimeout(() => {
      setPetAnimation('idle')
      setShowParticles(false)
      setActionMessage('')
    }, 1500)
  }

  const playMiniGame = (type) => {
    setMiniGameType(type)
    setShowMiniGame(true)
    performAction('play')
  }

  const getEmotionEmoji = () => {
    const emotions = {
      ecstatic: '😄',
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      upset: '😠'
    }
    return emotions[emotionState] || '😊'
  }

  const getStageDisplay = () => {
    if (!currentPet) return ''
    const stage = calculateStage(currentPet.age || 0)
    return STAGE_NAMES[stage] || stage
  }

  const getGrowthProgress = () => {
    if (!currentPet) return 0
    const stage = calculateStage(currentPet.age || 0)
    return calculateGrowthProgress(currentPet.age || 0, stage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🐾</div>
          <p className="text-gray-600 text-lg font-semibold">Loading your companion...</p>
        </div>
      </div>
    )
  }

  if (showPetSelection || !currentPet) {
    return <PetSelection onSelectPet={generateNewPet} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-rose-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🐾</span>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                  My Companion Pet
                </h1>
                <p className="text-gray-600 text-sm">Care for {currentPet.name}!</p>
              </div>
            </div>
            <button
              onClick={() => setShowPetSelection(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Pet
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Main Pet Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Health bar */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${currentPet.health}%` }}></div>

          <div className="p-10">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Pet Visual */}
              <div className="flex-1 flex items-center justify-center relative">
                <div className="relative">
                  {/* Main pet emoji with animation */}
                  <div className={`text-9xl transition-all duration-300 ${
                    petAnimation === 'play' ? 'animate-bounce' :
                    petAnimation === 'feed' ? 'scale-95' :
                    petAnimation === 'rest' ? 'opacity-50' :
                    'scale-100'
                  }`}>
                    {currentPet.generatedImage}
                  </div>

                  {/* Emotion */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-4xl">
                    {getEmotionEmoji()}
                  </div>

                  {/* Stage indicator */}
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                    {getStageDisplay()}
                  </div>

                  {/* Particles */}
                  {showParticles && particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute text-3xl animate-bounce"
                      style={{
                        left: `calc(50% + ${particle.x}px)`,
                        top: `calc(50% + ${particle.y}px)`,
                        animation: `float 1.5s ease-out forwards`
                      }}
                    >
                      {particle.emoji}
                    </div>
                  ))}
                </div>

                {/* Pet name and personality */}
                <div className="absolute bottom-0 left-0 right-0 text-center">
                  <h2 className="text-3xl font-bold text-gray-800">{currentPet.name}</h2>
                  <p className="text-sm text-gray-600 italic">"{getPetPersonality(currentPet.petType)}"</p>
                  {actionMessage && (
                    <p className="mt-2 text-rose-600 font-bold animate-pulse text-lg">{actionMessage}</p>
                  )}
                </div>
              </div>

              {/* Stats & Controls */}
              <div className="flex-1 space-y-6">
                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">💖 Status</h3>

                  {/* Health */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span className="font-semibold text-gray-700">Health</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.health)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.health}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Happiness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-gray-700">Happiness</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.happiness)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.happiness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bond */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-pink-500" />
                        <span className="font-semibold text-gray-700">Bond</span>
                      </div>
                      <span className="font-bold text-gray-800">{Math.round(currentPet.bond)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all duration-500"
                        style={{ width: `${currentPet.bond}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Age & Growth */}
                  <div className="border-t-2 border-orange-200 pt-4 mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-bold">{Math.round(currentPet.age * 10) / 10}</span> days old
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full transition-all duration-500"
                        style={{ width: `${getGrowthProgress()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Growing to next stage...</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3">🎮 Interactions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => performAction('feed')}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      🍖<br/>Feed
                    </button>
                    <button
                      onClick={() => playMiniGame('play')}
                      className="bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      🎮<br/>Play
                    </button>
                    <button
                      onClick={() => performAction('pet')}
                      className="bg-purple-500 hover:bg-purple-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      ❤️<br/>Pet
                    </button>
                    <button
                      onClick={() => performAction('rest')}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-4 rounded-lg font-bold transition hover:scale-105 active:scale-95"
                    >
                      😴<br/>Rest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b-2 border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
            {[
              { id: 'about', label: '📖 About' },
              { id: 'history', label: '📜 Life Story' },
              { id: 'gallery', label: '🖼️ Gallery' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-bold transition ${
                  activeTab === tab.id
                    ? 'text-rose-600 border-b-4 border-rose-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Type</p>
                    <p className="text-2xl font-bold text-blue-700">{currentPet.archetype}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Stage</p>
                    <p className="text-2xl font-bold text-green-700">{getStageDisplay()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Age</p>
                    <p className="text-2xl font-bold text-purple-700">{Math.round(currentPet.age * 10) / 10} days</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold mb-1">Bond Level</p>
                    <p className="text-2xl font-bold text-orange-700">{Math.round(currentPet.bond)}%</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-100 to-orange-100 p-6 rounded-lg border-2 border-rose-200">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">✨ Personality</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentPet.name} is a {currentPet.archetype} with a {getPetPersonality(currentPet.petType).toLowerCase()} nature.
                    Every interaction strengthens your bond and helps {currentPet.name} grow!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-800 mb-4">📚 {currentPet.name}'s Journey</h3>
                <div className="space-y-3">
                  {[
                    { stage: 'Egg', emoji: '🥚', desc: 'Just beginning...' },
                    { stage: 'Baby', emoji: '👶', desc: 'Learning & growing' },
                    { stage: 'Juvenile', emoji: '🧒', desc: 'Exploring the world' },
                    { stage: 'Young Adult', emoji: '👦', desc: 'Becoming stronger' },
                    { stage: 'Adult', emoji: '💪', desc: 'Reached full potential' },
                    { stage: 'Elder', emoji: '👴', desc: 'Wise and graceful' }
                  ].map((s, idx) => {
                    const completed = calculateStage(currentPet.age || 0) !== s.stage.toLowerCase()
                    const isCurrent = getStageDisplay().includes(s.stage)
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 transition ${
                          isCurrent
                            ? 'bg-gradient-to-r from-rose-100 to-orange-100 border-rose-400'
                            : completed
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{s.emoji}</div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{s.stage} {isCurrent && '👈 Current'}</p>
                            <p className="text-sm text-gray-600">{s.desc}</p>
                          </div>
                          {completed && <div className="text-2xl">✅</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Your pet collection ({pets.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pets.map(pet => (
                    <div
                      key={pet.id}
                      className={`p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center cursor-pointer transition hover:shadow-lg ${
                        pet.id === currentPet.id ? 'ring-4 ring-rose-400' : ''
                      }`}
                      onClick={() => setCurrentPet(pet)}
                    >
                      <div className="text-5xl mb-3">{pet.generatedImage}</div>
                      <p className="font-bold text-gray-800 text-lg">{pet.name}</p>
                      <p className="text-sm text-gray-600">{pet.archetype}</p>
                      <p className="text-xs text-gray-500 mt-2">Age: {Math.round(pet.age * 10) / 10} days</p>
                      <div className="mt-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          pet.isAlive
                            ? 'bg-green-200 text-green-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          {pet.isAlive ? '✓ Active' : 'Resting'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {pets.length < 16 && (
                  <button
                    onClick={() => setShowPetSelection(true)}
                    className="w-full mt-6 bg-gradient-to-r from-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    + Create Another Companion
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl shadow-lg p-8 border-2 border-rose-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 Care Guide</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🌱 Growth Stages</h4>
              <p className="text-sm text-gray-700">Your pet grows through 6 stages: Egg → Baby → Juvenile → Young Adult → Adult → Elder</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">❤️ Keep Healthy</h4>
              <p className="text-sm text-gray-700">Feed, play, and pet your companion daily to maintain high health & happiness</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">🔗 Build Bonds</h4>
              <p className="text-sm text-gray-700">The more you interact, the stronger your bond. Unlocks special features!</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2">⏰ Time Matters</h4>
              <p className="text-sm text-gray-700">Check in regularly! Your pet needs care every day to stay happy</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm border-t border-rose-200">
        <p className="font-semibold mb-2">My Companion Pet • Interactive Adventure</p>
      </footer>

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
      `}</style>
    </div>
  )
}
