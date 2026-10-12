import React, { useState } from 'react'
import { createCheckIn } from '../utils/api'
import './QuickCheckIn.css'

function QuickCheckIn({ userId, onComplete }) {
  const [mood,    setMood]    = useState(5)
  const [energy,  setEnergy]  = useState(5)
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)

  const moodEmoji = mood <= 2 ? '😢' : mood <= 4 ? '😟' : mood <= 6 ? '😐' : mood <= 8 ? '🙂' : '😄'
  const energyEmoji = energy <= 2 ? '⚫' : energy <= 4 ? '🔴' : energy <= 6 ? '🟡' : energy <= 8 ? '🟢' : '💚'

  const handleQuickSubmit = async () => {
    setSaving(true)
    try {
      await createCheckIn(userId, {
        mood,
        energy,
        sleep: { hours: 7, quality: 'good' },
        stress: { level: 5, source: '' },
        socialInteraction: 'alone',
        triggers: '',
        physicalSymptoms: [],
        couldHelp: '',
        journalNote: ''
      })
      setDone(true)
      setTimeout(() => {
        if (onComplete) onComplete({ mood, energy })
      }, 1800)
    } catch (e) {
      console.error('Quick check-in failed:', e)
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div className="qci-done">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span className="qci-done-icon">✓</span>
          <span className="qci-done-text">Check-in saved! Mood {mood}/10 · Energy {energy}/10</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          💡 The <a href="/checkin" style={{ color: '#60a5fa', textDecoration: 'none' }}>full check-in</a> captures sleep, stress, triggers and more — giving you deeper insights into your patterns over time.
        </p>
      </div>
    )
  }

  return (
    <div className="qci-card">
      <div className="qci-title">
        <span>⚡ Quick Check-In</span>
        <span className="qci-subtitle">How are you right now?</span>
      </div>

      <div className="qci-sliders">
        {/* Mood */}
        <div className="qci-row">
          <span className="qci-label">Mood {moodEmoji}</span>
          <input
            type="range" min="1" max="10" value={mood}
            onChange={e => setMood(parseInt(e.target.value))}
            className="qci-range qci-range-mood"
          />
          <span className="qci-value">{mood}</span>
        </div>

        {/* Energy */}
        <div className="qci-row">
          <span className="qci-label">Energy {energyEmoji}</span>
          <input
            type="range" min="1" max="10" value={energy}
            onChange={e => setEnergy(parseInt(e.target.value))}
            className="qci-range qci-range-energy"
          />
          <span className="qci-value">{energy}</span>
        </div>
      </div>

      <div className="qci-footer">
        <button className="qci-btn" onClick={handleQuickSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <a href="/checkin" className="qci-full-link">Full check-in (more detail) →</a>
      </div>
    </div>
  )
}

export default QuickCheckIn
