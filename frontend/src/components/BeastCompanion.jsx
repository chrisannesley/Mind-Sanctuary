import React, { useState, useEffect } from 'react'
import { Heart, Droplet, Zap, Users, Award, Plus, Trash2, RotateCcw } from 'lucide-react'

/**
 * Beast Companion Main Component
 * 
 * Professional gaming UI for pet management
 * Features:
 * - AI-generated unique creatures
 * - Evolution through life stages
 * - Health tied to daily wellness
 * - Interactive care system
 */

export default function BeastCompanion({ userId = 1 }) {
  // Beast state
  const [currentBeast, setCurrentBeast] = useState(null)
  const [beasts, setBeasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('main') // main, info, care, gallery, achievements

  // Animation/UI state
  const [selectedAction, setSelectedAction] = useState(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [lastAction, setLastAction] = useState('')

  // Load beasts on mount
  useEffect(() => {
    loadBeasts()
  }, [userId])

  const loadBeasts = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/beasts/${userId}`)
      const data = await response.json()
      
      if (data.length > 0) {
        // Get current beast if available
        const currentBeast = data.find(b => b.isAlive) || data[0]
        setCurrentBeast(currentBeast)
      }
      
      setBeasts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading beasts:', error)
      // Fallback to mock data if API unavailable
      const mockBeast = {
        id: 'beast-1',
        name: 'Emberclaw',
        archetype: 'Dragon',
        stage: 'adult',
        health: 85,
        happiness: 72,
        bond: 60,
        age: 12,
        colors: {
          primary: '#DC143C',
          secondary: '#FFD700',
          accent: '#FF4500'
        },
        specialTraits: ['Wings', 'Fiery'],
        generatedImage: '🐉',
        birthDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        isAlive: true
      }
      setCurrentBeast(mockBeast)
      setBeasts([mockBeast])
      setLoading(false)
    }
  }

  const performAction = async (action) => {
    if (!currentBeast) return

    setSelectedAction(action)
    setShowAnimation(true)
    setLastAction(action)

    try {
      const response = await fetch(`http://localhost:3002/api/beasts/${currentBeast.id}/care/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (response.ok) {
        const updatedBeast = await response.json()
        setCurrentBeast(updatedBeast)
      } else {
        console.error('Error performing action:', response.statusText)
      }
    } catch (error) {
      console.error('Error performing action:', error)
      // Fallback: local update
      const hpChange = { feed: 3, play: 5, pet: 2, groom: 3, rest: 15 }[action] || 0
      const newHealth = Math.min(100, currentBeast.health + hpChange)
      setCurrentBeast(prev => ({
        ...prev,
        health: newHealth,
        happiness: Math.min(100, prev.happiness + (hpChange > 0 ? 3 : 0))
      }))
    }

    setTimeout(() => setShowAnimation(false), 600)
  }

  const generateNewBeast = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:3002/api/beasts/${userId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energyLevel: 5,
          stressLevel: 5,
          checkInStreak: 0
        })
      })

      if (response.ok) {
        const newBeast = await response.json()
        setCurrentBeast(newBeast)
        setBeasts([...beasts, newBeast])
      } else {
        console.error('Error generating beast:', response.statusText)
      }
    } catch (error) {
      console.error('Error generating beast:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = () => {
    if (currentBeast.health >= 80) return 'from-green-400 to-emerald-500'
    if (currentBeast.health >= 60) return 'from-blue-400 to-cyan-500'
    if (currentBeast.health >= 40) return 'from-yellow-400 to-orange-500'
    if (currentBeast.health >= 20) return 'from-orange-400 to-red-500'
    return 'from-red-500 to-red-700'
  }

  const getHealthStatus = () => {
    if (currentBeast.health >= 80) return 'Thriving'
    if (currentBeast.health >= 60) return 'Healthy'
    if (currentBeast.health >= 40) return 'Concerned'
    if (currentBeast.health >= 20) return 'Sick'
    return 'Critical'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐉</div>
          <p className="text-gray-600">Loading your beasts...</p>
        </div>
      </div>
    )
  }

  if (!currentBeast) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No beasts yet</p>
          <button
            onClick={generateNewBeast}
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Your First Beast'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Beast Companion</h1>
        <p className="text-gray-600">Your AI-generated pet reflects your wellness journey</p>
      </div>

      {/* Main Pet Display Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        {/* Background gradient based on health */}
        <div className={`bg-gradient-to-br ${getHealthColor()} h-2`}></div>

        {/* Pet Container */}
        <div className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Pet Image */}
            <div className="flex-1 flex items-center justify-center">
              <div className={`text-center transition-transform ${showAnimation ? 'scale-110' : 'scale-100'}`}>
                <div 
                  className="text-9xl mb-4"
                  style={{
                    color: currentBeast.colors?.primary || '#DC143C',
                    textShadow: `0 0 20px ${currentBeast.colors?.secondary || '#FFD700'}`
                  }}
                >
                  {currentBeast.generatedImage || currentBeast.genetics?.archetypeEmoji || '🐉'}
                </div>
                <p className="text-xl font-semibold text-gray-800">{currentBeast.name}</p>
                <p className="text-sm text-gray-500">
                  {currentBeast.archetype} • {currentBeast.stage === 'baby' ? 'Hatchling' : currentBeast.stage}
                </p>
                {lastAction && (
                  <div className="mt-2 text-sm text-indigo-600 font-semibold animate-pulse">
                    {lastAction.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Stats and Controls */}
            <div className="flex-1">
              {/* Pet Info Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Emberclaw's Stats</h2>

                {/* Status Bars */}
                <div className="space-y-3">
                  {/* Health */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-semibold text-gray-700">Health</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{currentBeast.health}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${getHealthColor()} h-full transition-all duration-300`}
                        style={{ width: `${currentBeast.health}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{getHealthStatus()}</p>
                  </div>

                  {/* Happiness */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-semibold text-gray-700">Happiness</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{currentBeast.happiness}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-300"
                        style={{ width: `${currentBeast.happiness}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bond */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-semibold text-gray-700">Bond</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{currentBeast.bond}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-400 to-pink-500 h-full transition-all duration-300"
                        style={{ width: `${currentBeast.bond}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => performAction('feed')}
                  disabled={showAnimation}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  🍖 Feed
                </button>
                <button
                  onClick={() => performAction('play')}
                  disabled={showAnimation}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  🎮 Play
                </button>
                <button
                  onClick={() => performAction('pet')}
                  disabled={showAnimation}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  ❤️ Pet
                </button>
                <button
                  onClick={() => performAction('rest')}
                  disabled={showAnimation}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  😴 Rest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'main', label: '🏠 Main', icon: null },
            { id: 'info', label: 'ℹ️ Info', icon: null },
            { id: 'care', label: '📋 Care Log', icon: null },
            { id: 'gallery', label: '🖼️ Gallery', icon: null },
            { id: 'achievements', label: '🏆 Achievements', icon: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Archetype</p>
                  <p className="text-lg font-bold text-gray-800">{currentBeast.archetype}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Age</p>
                  <p className="text-lg font-bold text-gray-800">{currentBeast.age} days</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Stage</p>
                  <p className="text-lg font-bold text-gray-800 capitalize">{currentBeast.stage}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Traits</p>
                  <p className="text-lg font-bold text-gray-800">{currentBeast.specialTraits.length}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Special Traits</h3>
                <div className="flex gap-2 flex-wrap">
                  {currentBeast.specialTraits.map(trait => (
                    <span key={trait} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✨ {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-2">Wellness Connection</h3>
                <p className="text-sm text-gray-700">
                  Your beast thrives when you take care of yourself. When you complete check-ins, sleep well, and manage stress, your beast gets stronger!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-600">📌 <strong>Today's Care Activities:</strong></p>
              </div>
              <div className="space-y-2">
                {[
                  { time: '8:30 AM', action: 'Morning Check-in', hp: '+10 HP' },
                  { time: '9:15 AM', action: 'Fed breakfast', hp: '+3 HP' },
                  { time: '10:00 AM', action: 'Played together', hp: '+5 HP' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.time}</p>
                    </div>
                    <p className="text-green-600 font-bold">{log.hp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <p className="text-gray-600">Your collection of beasts throughout your wellness journey</p>
              <div className="grid grid-cols-2 gap-4">
                {beasts.map(beast => (
                  <div key={beast.id} className="p-4 bg-gray-50 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition" onClick={() => setCurrentBeast(beast)}>
                    <div className="text-6xl mb-2">{beast.generatedImage || beast.genetics?.archetypeEmoji || '🐉'}</div>
                    <p className="font-bold text-gray-800">{beast.name}</p>
                    <p className="text-xs text-gray-500">{beast.age} days old</p>
                    <p className="text-xs text-gray-400 mt-1">{beast.isAlive ? '✓ Alive' : '✗ Deceased'}</p>
                  </div>
                ))}
              </div>
              {beasts.length < 5 && (
                <button
                  onClick={generateNewBeast}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 rounded-lg font-semibold transition"
                >
                  + Generate Another Beast
                </button>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {[
                { icon: '🏆', name: 'First Pet', desc: 'Adopted your first beast' },
                { icon: '📈', name: 'Week of Care', desc: 'Kept pet alive for 7 days' },
                { icon: '👑', name: 'Elder\'s Wisdom', desc: 'Raise a beast to Elder stage' }
              ].map((achievement, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <p className="font-bold text-gray-800">{achievement.name}</p>
                    <p className="text-sm text-gray-600">{achievement.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
