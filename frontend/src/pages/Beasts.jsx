import React, { useState, useEffect } from 'react'
import { Heart, Award, Trophy, BarChart3, Plus, RotateCcw } from 'lucide-react'
import BeastCompanion from '../components/BeastCompanion'

/**
 * Beasts Page
 * Main page for Beast Companion feature
 * Shows current beast, care options, gallery, and achievements
 */
export default function Beasts({ userId = 1 }) {
  const [currentBeast, setCurrentBeast] = useState(null)
  const [beasts, setBeasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('main') // main, gallery, achievements

  useEffect(() => {
    loadBeastData()
    // Refresh every minute to update age and health decay
    const interval = setInterval(loadBeastData, 60000)
    return () => clearInterval(interval)
  }, [userId])

  const loadBeastData = async () => {
    try {
      // Get all beasts
      const response = await fetch(`http://localhost:3002/api/beasts/${userId}`)
      const data = await response.json()
      setBeasts(data)

      // Get current beast
      const currentResponse = await fetch(`http://localhost:3002/api/beasts/${userId}/current`)
      const current = await currentResponse.json()
      setCurrentBeast(current)
    } catch (error) {
      console.error('Error loading beast data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBeastUpdate = (updatedBeast) => {
    setCurrentBeast(updatedBeast)
    // Update in beasts array
    const index = beasts.findIndex(b => b.id === updatedBeast.id)
    if (index !== -1) {
      const newBeasts = [...beasts]
      newBeasts[index] = updatedBeast
      setBeasts(newBeasts)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🐉</div>
          <p className="text-gray-600">Loading your beasts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Beast Companion</h1>
        <p className="text-gray-600">
          Your AI-generated pet reflects your wellness journey. Complete daily check-ins to keep your beast thriving.
        </p>
      </div>

      {/* Main Beast Component */}
      <BeastCompanion userId={userId} />

      {/* Statistics Section */}
      {beasts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Your Beast Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Beasts</p>
              <p className="text-3xl font-bold text-blue-600">{beasts.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Alive</p>
              <p className="text-3xl font-bold text-green-600">{beasts.filter(b => b.isAlive).length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Care Hours</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.round(beasts.reduce((sum, b) => sum + (b.careLog?.length || 0), 0) / 2)}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Longest Lived</p>
              <p className="text-3xl font-bold text-amber-600">
                {Math.max(...beasts.map(b => b.age || 0))} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats - if beast exists */}
      {currentBeast && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📈 Current Beast Progress</h2>
          <div className="space-y-4">
            {/* Care Streak */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-gray-700">Care Streak</span>
                </div>
                <span className="text-lg font-bold text-amber-600">{currentBeast.careStreak || 0} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min((currentBeast.careStreak || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Linked Stat */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🔗 Wellness Connection</h3>
              <p className="text-sm text-gray-700">
                {currentBeast.name} is linked to your <span className="font-bold capitalize">{currentBeast.linkedStat}</span> level.
                When you maintain good {currentBeast.linkedStat} habits, {currentBeast.name} thrives!
              </p>
            </div>

            {/* Recent Care Log */}
            {currentBeast.careLog && currentBeast.careLog.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">📋 Recent Care</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {currentBeast.careLog.slice(-5).reverse().map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">
                        {event.type === 'feed' && '🍖'}
                        {event.type === 'play' && '🎮'}
                        {event.type === 'pet' && '❤️'}
                        {event.type === 'groom' && '✨'}
                        {event.type === 'rest' && '😴'}
                        {event.type === 'reflect' && '🧘'}
                        {event.type === 'checkin' && '📱'}
                        {' '}{event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                      <span className={`font-bold ${event.hpChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {event.hpChange > 0 ? '+' : ''}{event.hpChange} HP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Beasts Gallery */}
      {beasts.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🖼️ Beast Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {beasts.map(beast => (
              <div
                key={beast.id}
                className="p-4 bg-gray-50 rounded-lg text-center hover:shadow-lg transition cursor-pointer group"
                onClick={() => window.location.reload()} // In production, would navigate to this beast's detail
              >
                <div className="text-5xl mb-2 group-hover:scale-110 transition">
                  {beast.generatedImage || beast.genetics?.archetypeEmoji || '🐉'}
                </div>
                <p className="font-bold text-gray-800 text-sm">{beast.name}</p>
                <p className="text-xs text-gray-600">{beast.archetype}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {beast.isAlive ? (
                    <>
                      <span className="text-green-600 text-lg">●</span>
                      <span className="text-xs text-green-600 font-semibold">Alive</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-400 text-lg">●</span>
                      <span className="text-xs text-gray-500">Deceased</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{beast.age} days</p>
                {!beast.isAlive && (
                  <button
                    onClick={() => {
                      fetch(`http://localhost:3002/api/beasts/${beast.id}/resurrect`, { method: 'POST' })
                        .then(() => loadBeastData())
                        .catch(err => console.error('Error resurrecting:', err))
                    }}
                    className="mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
                  >
                    Resurrect
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Achievements</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: 'first-beast',
              title: 'Beast Master',
              description: 'Adopt your first beast',
              unlocked: beasts.length > 0,
              icon: '🎉'
            },
            {
              id: 'week-care',
              title: 'Week of Care',
              description: 'Keep a beast alive for 7 days',
              unlocked: beasts.some(b => b.age >= 7),
              icon: '📅'
            },
            {
              id: 'elder',
              title: "Elder's Wisdom",
              description: 'Raise a beast to Elder stage',
              unlocked: beasts.some(b => b.stage === 'elder'),
              icon: '👑'
            },
            {
              id: 'care-dedication',
              title: 'Care Dedication',
              description: 'Complete 50 care actions',
              unlocked: beasts.reduce((sum, b) => sum + (b.careLog?.length || 0), 0) >= 50,
              icon: '💪'
            },
            {
              id: 'wellness-sync',
              title: 'Wellness Sync',
              description: 'Maintain 7-day care streak',
              unlocked: currentBeast?.careStreak >= 7,
              icon: '🔄'
            },
            {
              id: 'memorial',
              title: 'Circle of Life',
              description: 'Resurrect a beast',
              unlocked: beasts.some(b => b.resurrectionCount > 0),
              icon: '♻️'
            }
          ].map(achievement => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{achievement.title}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.unlocked && <p className="text-xs text-yellow-700 font-semibold mt-1">✓ Unlocked</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Tips for Beast Care</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span><strong>Daily Check-ins</strong> are the most important. They provide +10 HP and linked stat tracking.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span><strong>Maintain healthy habits</strong> - Sleep 7+ hours, manage stress, and track your mood for a thriving beast.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span><strong>Build your care streak</strong> - Consistent daily care creates a routine that benefits both you and your beast.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span><strong>Don't worry about death</strong> - It's natural. You can resurrect or create a new beast whenever you're ready.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-xl">✓</span>
            <span><strong>Each beast is unique</strong> - No two are ever the same. Your beast's archetype matches your wellness patterns.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
