import React, { useState, useEffect } from 'react'
import { getWeeklySummary, getCheckInPatterns } from '../utils/api'

/**
 * WeeklyPatterns Component
 * Displays weekly summary and detected patterns from check-ins
 */
export default function WeeklyPatterns({ userId = 1 }) {
  const [summary, setSummary] = useState(null)
  const [patterns, setPatterns] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [summaryRes, patternsRes] = await Promise.all([
          getWeeklySummary(userId),
          getCheckInPatterns(userId)
        ])
        setSummary(summaryRes.data)
        setPatterns(patternsRes.data)
      } catch (err) {
        console.error('Error loading patterns:', err)
        setError('Could not load weekly data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Loading your weekly insights...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <p className="text-yellow-800">{error}</p>
      </div>
    )
  }

  if (!summary || summary.checkInCount === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <p className="text-blue-800 font-semibold">📊 Start checking in daily to see your weekly patterns!</p>
        <p className="text-blue-700 text-sm mt-2">After you've checked in several times, you'll see insights like:</p>
        <ul className="text-blue-700 text-sm mt-2 ml-4">
          <li>• How sleep affects your mood</li>
          <li>• What triggers your stress</li>
          <li>• Your energy trends</li>
          <li>• Social interaction patterns</li>
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Weekly Stats Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 This Week's Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Check-Ins</p>
            <p className="text-3xl font-bold text-blue-600">{summary.checkInCount}</p>
            <p className="text-xs text-gray-500 mt-1">out of 7 days</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm">Avg Mood</p>
            <p className="text-3xl font-bold text-yellow-600">{summary.avgMood}</p>
            <p className="text-xs text-gray-500 mt-1">out of 10</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Avg Energy</p>
            <p className="text-3xl font-bold text-green-600">{summary.avgEnergy}</p>
            <p className="text-xs text-gray-500 mt-1">out of 10</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm">Avg Sleep</p>
            <p className="text-3xl font-bold text-purple-600">{summary.avgSleep}h</p>
            <p className="text-xs text-gray-500 mt-1">hours per night</p>
          </div>
        </div>

        {/* Mood Trend Chart (simple text visualization) */}
        {summary.moodTrend && summary.moodTrend.length > 0 && (
          <div className="bg-white p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Mood Trend (Last 7 Days)</h4>
            <div className="space-y-2">
              {summary.moodTrend.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-16">{day.date}</span>
                  <div className="flex-1 bg-gray-200 h-6 rounded overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-center text-xs font-bold text-white transition ${
                        day.mood >= 7 ? 'bg-green-500' :
                        day.mood >= 5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(day.mood / 10) * 100}%` }}
                    >
                      {day.mood}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 w-8">{day.mood}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Patterns Detection */}
      {patterns && patterns.patterns.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🔍 Patterns We've Noticed</h3>
          
          <div className="space-y-4">
            {patterns.patterns.map((pattern, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800">{pattern.description}</h4>
                  <span className="text-lg font-bold text-green-600">{pattern.correlation}%</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">Strength: {pattern.correlation > 60 ? 'Strong' : pattern.correlation > 30 ? 'Moderate' : 'Weak'}</p>
                <div className="bg-green-50 p-3 rounded border-l-2 border-green-400">
                  <p className="text-sm text-green-800">💡 {pattern.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Triggers */}
      {summary.topTriggers && summary.topTriggers.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Your Top Stressors</h3>
          
          <div className="space-y-2">
            {summary.topTriggers.map((trigger, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border-l-4 border-orange-500">
                <span className="text-2xl">{idx === 0 ? '🔴' : idx === 1 ? '🟠' : '🟡'}</span>
                <span className="text-gray-800 font-semibold">{trigger}</span>
              </div>
            ))}
          </div>
          
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(251, 146, 60, 0.15)',
            border: '1px solid rgba(251, 146, 60, 0.4)',
            borderLeft: '4px solid #f97316',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#fed7aa', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: '#fdba74' }}>💡 Tip:</strong> Notice these patterns? Try to prepare for these stressors or develop coping strategies. Small changes can help!
            </p>
          </div>
        </div>
      )}

      {/* No Patterns Yet */}
      {(!patterns || patterns.patterns.length === 0) && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <p className="text-blue-800 font-semibold">📈 Keep checking in daily!</p>
          <p className="text-blue-700 text-sm mt-2">
            After more data, we'll be able to spot correlations between your sleep, stress, mood, and energy levels.
          </p>
        </div>
      )}
    </div>
  )
}
