import React, { useState, useEffect } from 'react'
import { Heart, Award, Users } from 'lucide-react'
import PetSelection from './PetSelection'
import { getPetById } from '../data/pets'

/**
 * My Companion Pet - Main Component
 */
export default function PetCompanion({ userId = 1 }) {
  const [currentPet, setCurrentPet] = useState(null)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('main')
  const [showPetSelection, setShowPetSelection] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [lastAction, setLastAction] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPets()
  }, [userId])

  const loadPets = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/beasts/${userId}`)
      const data = await response.json()
      
      if (data.length > 0) {
        const alivePet = data.find(b => b.isAlive) || data[0]
        setCurrentPet(alivePet)
        setPets(data)
      } else {
        setShowPetSelection(true)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading pets:', error)
      setShowPetSelection(true)
      setLoading(false)
    }
  }

  const generateNewPet = async (petTypeId) => {
    try {
      setLoading(true)
      const petType = getPetById(petTypeId)
      
      const response = await fetch(`http://localhost:3002/api/beasts/${userId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energyLevel: 5,
          stressLevel: 5,
          checkInStreak: 0,
          petType: petTypeId
        })
      })

      if (response.ok) {
        const newPet = await response.json()
        newPet.generatedImage = petType.emoji
        newPet.petType = petTypeId
        
        setCurrentPet(newPet)
        setPets([...pets, newPet])
        setShowPetSelection(false)
        setMessage(`🎉 Meet ${newPet.name}, your new ${petType.name} companion!`)
      }
    } catch (error) {
      console.error('Error generating pet:', error)
      const petType = getPetById(petTypeId)
      const mockPet = {
        id: `pet-${Date.now()}`,
        userId,
        name: petType.name,
        archetype: petType.name,
        stage: 'baby',
        health: 75,
        happiness: 80,
        bond: 50,
        age: 0,
        colors: { primary: petType.color, secondary: petType.color },
        specialTraits: [petType.type],
        generatedImage: petType.emoji,
        petType: petTypeId,
        isAlive: true
      }
      setCurrentPet(mockPet)
      setPets([...pets, mockPet])
      setShowPetSelection(false)
      setMessage(`🎉 Meet ${mockPet.name}, your new companion!`)
    } finally {
      setLoading(false)
    }
  }

  const performAction = async (action) => {
    if (!currentPet) return

    setShowAnimation(true)
    setLastAction(action)
    setMessage('')

    try {
      const response = await fetch(`http://localhost:3002/api/beasts/${currentPet.id}/care/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const updatedPet = await response.json()
        setCurrentPet(updatedPet)
        setMessage(`${currentPet.name} loves that!`)
      }
    } catch (error) {
      console.error('Error performing action:', error)
      const hpChange = { feed: 3, play: 5, pet: 2, rest: 15 }[action] || 0
      const newHealth = Math.min(100, currentPet.health + hpChange)
      setCurrentPet(prev => ({
        ...prev,
        health: newHealth,
        happiness: Math.min(100, prev.happiness + 3)
      }))
      setMessage('✨ Your pet is happy!')
    }

    setTimeout(() => setShowAnimation(false), 600)
  }

  const getHealthColor = () => {
    if (!currentPet) return 'from-gray-400 to-gray-500'
    if (currentPet.health >= 80) return 'from-green-400 to-emerald-500'
    if (currentPet.health >= 60) return 'from-blue-400 to-cyan-500'
    if (currentPet.health >= 40) return 'from-yellow-400 to-orange-500'
    if (currentPet.health >= 20) return 'from-orange-400 to-red-500'
    return 'from-red-500 to-red-700'
  }

  const getHealthStatus = () => {
    if (!currentPet) return 'Loading...'
    if (currentPet.health >= 80) return '🌟 Thriving'
    if (currentPet.health >= 60) return '😊 Healthy'
    if (currentPet.health >= 40) return '😐 Okay'
    if (currentPet.health >= 20) return '😟 Needs care'
    return '😢 Critical'
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🐾</div>
          <p className="text-gray-600 text-lg font-semibold">Loading your pets...</p>
        </div>
      </div>
    )
  }

  // Pet selection screen
  if (showPetSelection || !currentPet) {
    return <PetSelection onSelectPet={generateNewPet} />
  }

  // Main pet companion view
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-rose-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🐾</span>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                My Companion Pet
              </h1>
              <p className="text-gray-600 text-sm mt-1">Your personal AI pet game</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Main Pet Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Health bar top */}
          <div className={`bg-gradient-to-r ${getHealthColor()} h-3`}></div>

          <div className="p-10">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Pet Image */}
              <div className="flex-1 flex items-center justify-center">
                <div className={`text-center transition-all ${showAnimation ? 'scale-125' : 'scale-100'}`}>
                  <div className="text-9xl mb-6 drop-shadow-lg hover:drop-shadow-2xl transition">
                    {currentPet.generatedImage || '🐉'}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{currentPet.name}</h2>
                  <p className="text-lg text-gray-500 mt-2">{currentPet.archetype}</p>
                  {message && (
                    <p className="mt-4 text-rose-600 font-bold animate-pulse">{message}</p>
                  )}
                </div>
              </div>

              {/* Stats & Controls */}
              <div className="flex-1 space-y-6">
                {/* Stats Box */}
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Stats</h3>

                  {/* Health */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <span className="font-semibold text-gray-700">Health</span>
                      </div>
                      <span className="font-bold text-gray-800">{currentPet.health}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${getHealthColor()} h-full transition-all duration-300`}
                        style={{ width: `${currentPet.health}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{getHealthStatus()}</p>
                  </div>

                  {/* Happiness */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-gray-700">Happiness</span>
                      </div>
                      <span className="font-bold text-gray-800">{currentPet.happiness}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
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
                      <span className="font-bold text-gray-800">{currentPet.bond}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all duration-300"
                        style={{ width: `${currentPet.bond}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => performAction('feed')}
                    disabled={showAnimation}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    🍖 Feed
                  </button>
                  <button
                    onClick={() => performAction('play')}
                    disabled={showAnimation}
                    className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    🎮 Play
                  </button>
                  <button
                    onClick={() => performAction('pet')}
                    disabled={showAnimation}
                    className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    ❤️ Pet
                  </button>
                  <button
                    onClick={() => performAction('rest')}
                    disabled={showAnimation}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg font-bold transition disabled:opacity-50"
                  >
                    😴 Rest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b-2 border-gray-200 bg-gradient-to-r from-rose-50 to-orange-50">
            {[
              { id: 'info', label: '📋 Info' },
              { id: 'gallery', label: '🖼️ Gallery' },
              { id: 'achievements', label: '🏆 Achievements' }
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

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Archetype</p>
                    <p className="text-2xl font-bold text-blue-700">{currentPet.archetype}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Age</p>
                    <p className="text-2xl font-bold text-green-700">{currentPet.age} days</p>
                  </div>
                </div>

                {currentPet.specialTraits && currentPet.specialTraits.length > 0 && (
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-3">✨ Special Traits</h3>
                    <div className="flex gap-2 flex-wrap">
                      {currentPet.specialTraits.map(trait => (
                        <span key={trait} className="bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">💡 About Your Pet</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentPet.name} is your unique companion. Care for it daily to watch it grow stronger and evolve!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Your collection of companion pets ({pets.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pets.map(pet => (
                    <div
                      key={pet.id}
                      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-center hover:shadow-lg transition cursor-pointer"
                      onClick={() => setCurrentPet(pet)}
                    >
                      <div className="text-5xl mb-3">{pet.generatedImage || '🐉'}</div>
                      <p className="font-bold text-gray-800 text-lg">{pet.name}</p>
                      <p className="text-sm text-gray-600">{pet.archetype}</p>
                      <p className="text-xs text-gray-500 mt-2">{pet.age} days old</p>
                      <div className="mt-3 flex items-center justify-center gap-1">
                        {pet.isAlive ? (
                          <>
                            <span className="text-green-600 text-xl">●</span>
                            <span className="text-xs text-green-600 font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-400 text-xl">●</span>
                            <span className="text-xs text-gray-500">Resting</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {pets.length < 16 && (
                  <button
                    onClick={() => setShowPetSelection(true)}
                    className="w-full mt-6 bg-gradient-to-r from-rose-100 to-orange-100 hover:from-rose-200 hover:to-orange-200 text-rose-700 py-4 rounded-xl font-bold transition"
                  >
                    + Add Another Pet
                  </button>
                )}
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🌟', title: 'First Friend', desc: 'Create your first pet' },
                  { icon: '📅', title: 'Week Together', desc: 'Keep pet alive 7 days' },
                  { icon: '👑', title: 'Elder\'s Wisdom', desc: 'Reach Elder stage' },
                  { icon: '💪', title: 'Care Master', desc: 'Complete 50 care actions' },
                  { icon: '🔄', title: '7-Day Streak', desc: 'Care every day for a week' },
                  { icon: '♻️', title: 'Second Chance', desc: 'Resurrect a pet' }
                ].map((achievement, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div>
                        <p className="font-bold text-gray-800">{achievement.title}</p>
                        <p className="text-sm text-gray-600">{achievement.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-rose-100 to-orange-100 rounded-2xl shadow-lg p-8 border-2 border-rose-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 Care Tips</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-xl">✓</span>
              <span><strong>Feed regularly</strong> - Your pet needs food daily to stay energized</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">✓</span>
              <span><strong>Play together</strong> - Playtime strengthens your bond and boosts happiness</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">✓</span>
              <span><strong>Pet & cuddle</strong> - Show affection to increase your connection</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xl">✓</span>
              <span><strong>Let them rest</strong> - Rest is important for growth and recovery</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 text-center text-gray-600 text-sm border-t border-rose-200">
        <p className="font-semibold mb-2">My Companion Pet • Standalone App</p>
        <p className="text-xs">Backend: <span className="font-mono">http://localhost:3002</span></p>
      </footer>
    </div>
  )
}
