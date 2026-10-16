import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setupUser } from '../utils/api'

const CONCERNS = [
  'General wellness',
  'Anxiety',
  'Depression',
  'Stress',
  'Sleep',
  'Work / life balance',
  'Relationships',
  'Grief or loss',
  'Trauma / PTSD',
  'Other',
]

export default function UserSetup({ onSetup }) {
  const navigate    = useNavigate()
  const [name,      setName]      = useState('')
  const [concerns,  setConcerns]  = useState([])
  const [pin,       setPin]       = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const toggleConcern = (c) => {
    setConcerns(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim())     { setError('Please enter your name.'); return }
    if (!concerns.length) { setError('Please select at least one area.'); return }
    if (pin.length !== 4) { setError('Please choose a 4-digit PIN — you\'ll need it to sign in later.'); return }

    setLoading(true)
    setError('')
    try {
      // Backend expects a single mainConcern string — join multiples
      const res  = await setupUser(name.trim(), concerns.join(', '), null, pin)
      const user = res.data
      localStorage.setItem('mw_userId', String(user.id))
      onSetup(user)
      navigate('/dashboard')
    } catch (e) {
      console.error('Setup error:', e)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        maxWidth: 460,
        width: '100%',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary"
            style={{ width: 80, height: 80, borderRadius: '18px', margin: '0 auto 1rem', display: 'block', objectFit: 'cover' }} />
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem' }}>
            Welcome to Mind Sanctuary
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Your private space for mental wellness. Let's set up your profile — it only takes a moment.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name or a nickname"
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', padding: '0.75rem 1rem', color: '#f1f5f9',
                fontSize: '0.95rem', outline: 'none',
              }}
            />
          </div>

          {/* Concerns — multi-select */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.88rem' }}>
                What brings you here?
              </label>
              {concerns.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                  {concerns.length} selected
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Select all that apply
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {CONCERNS.map(c => {
                const selected = concerns.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      border: selected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.12)',
                      background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                      color: selected ? '#c7d2fe' : '#94a3b8',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span style={{
                      width: 14, height: 14, borderRadius: '3px', flexShrink: 0,
                      border: selected ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.2)',
                      background: selected ? '#6366f1' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff',
                    }}>
                      {selected ? '✓' : ''}
                    </span>
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>
          )}

          <button
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Setting up…' : 'Get Started →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
          Your data stays on this server and is never shared. This is a safe, private space.
        </p>
      </div>
    </div>
  )
}
