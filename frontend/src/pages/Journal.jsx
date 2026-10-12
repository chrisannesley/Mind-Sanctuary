import React, { useState, useEffect } from 'react'
import { createJournalEntry, getJournalEntries } from '../utils/api'
import VoiceInputButton from '../components/VoiceInputButton'
import Modal from '../components/Modal'

function Journal({ user, userId }) {
  const [entries, setEntries] = useState([])
  const [journalText, setJournalText] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEntries()
  }, [userId])

  const loadEntries = async () => {
    try {
      const res = await getJournalEntries(userId)
      setEntries(res.data || [])
    } catch (error) {
      console.error('Error loading journal entries:', error)
    }
  }

  const handleVoiceTranscript = (transcript) => {
    // Append voice transcript to existing text with a space
    setJournalText(prev => prev ? `${prev} ${transcript}` : transcript)
  }

  const handleSubmit = async () => {
    if (!journalText.trim()) {
      alert('Please write something in your journal')
      return
    }

    setLoading(true)
    try {
      await createJournalEntry(userId, journalText)
      setSubmitted(true)
      setJournalText('')
      setShowModal(false)
      setTimeout(() => setSubmitted(false), 3000)
      // Reload entries
      loadEntries()
    } catch (error) {
      console.error('Error saving journal entry:', error)
      alert('Error saving journal entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #333333 0%, #000000 100%)', borderBottom: '3px solid #e94560', padding: '1.5rem 2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>✍️ My Journal</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Your private space to write freely</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>

        {submitted && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.85rem 1.1rem', marginBottom: '1.25rem', color: '#6ee7b7', fontSize: '0.9rem' }}>
            ✓ Journal entry saved!
          </div>
        )}

        {/* New Entry Button */}
        <button
          onClick={() => setShowModal(true)}
          style={{ width: '100%', background: '#2196F3', border: 'none', color: '#fff', fontWeight: 700, padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', marginBottom: '1.75rem', transition: 'background 0.2s' }}
        >
          ✍️ Write a New Entry
        </button>

        {/* Modal for Journal Entry */}
        <Modal
          isOpen={showModal}
          title="Write in Your Journal"
          onClose={() => setShowModal(false)}
          onConfirm={handleSubmit}
          confirmText={loading ? 'Saving...' : 'Save Entry'}
          cancelText="Cancel"
          showCancel={true}
        >
          <div className="space-y-4">
            <p className="text-gray-700 font-semibold mb-3">What's on your mind today?</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <VoiceInputButton
                onTranscript={handleVoiceTranscript}
                label="🎤 Voice to Text"
                placeholder="Click to start speaking..."
              />
            </div>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write your thoughts, feelings, reflections..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none resize-none"
              rows="8"
              autoFocus
            />
            <p className="text-sm text-gray-600">Your journal is private. Each entry is automatically dated.</p>
          </div>
        </Modal>

        {/* Journal Entries */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Your Entries
        </h2>

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' }}>No journal entries yet.</p>
            <p style={{ fontSize: '0.88rem' }}>Start writing to begin your journaling journey.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {entries.map((entry) => {
              const { date, time } = formatDateTime(entry.timestamp)
              return (
                <div key={entry.id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderLeft: '4px solid #2196F3',
                  borderRadius: '12px',
                  padding: '1.25rem 1.4rem'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginRight: '1rem' }}>📅 {date}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>🕐 {time}</span>
                  </div>
                  <p style={{ color: '#e0e0e0', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{entry.text}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Tips */}
        <div style={{ marginTop: '2rem', background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.2)', borderRadius: '12px', padding: '1.1rem 1.25rem' }}>
          <h3 style={{ fontWeight: 600, color: '#93c5fd', marginBottom: '0.6rem', fontSize: '0.9rem' }}>💡 Journaling Tips</h3>
          <ul style={{ color: '#60a5fa', fontSize: '0.82rem', paddingLeft: '1.1rem', margin: 0, lineHeight: 1.7 }}>
            <li>Write freely without judgment</li>
            <li>Express your true feelings</li>
            <li>Note patterns and triggers</li>
            <li>Celebrate positive moments</li>
            <li>Visit as often as you need throughout the day</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Journal
