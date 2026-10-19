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
  const navigate   = useNavigate()
  const [step,     setStep]     = useState(1)   // 1 = name, 2 = concerns
  const [name,     setName]     = useState('')
  const [concerns, setConcerns] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const toggleConcern = (c) =>
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  // Step 1 → Step 2
  const handleNext = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }
    setError('')
    setStep(2)
  }

  // Step 2 → create account
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!concerns.length) { setError('Please select at least one area.'); return }

    setLoading(true)
    setError('')
    try {
      const res  = await setupUser(name.trim(), concerns.join(', '), null, null)
      const user = res.data
      localStorage.setItem('mw_userId', String(user.id))
      onSetup(user)
      navigate('/dashboard')
    } catch (err) {
      console.error('Setup error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        maxWidth: 460, width: '100%',
      }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/mind-sanctuary-icon.png"
            alt="Mind Sanctuary"
            style={{ width: 72, height: 72, borderRadius: '16px', margin: '0 auto 1rem', display: 'block', objectFit: 'cover' }}
          />
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.3rem' }}>
            {step === 1 ? 'Welcome to Mind Sanctuary' : `Nice to meet you, ${name} 👋`}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {step === 1
              ? "Your private space for mental wellness. Let's get you set up — takes under a minute."
              : 'What brings you here? We\'ll personalise your experience around what matters most to you.'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.75rem', justifyContent: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              height: 4, flex: 1, maxWidth: 80, borderRadius: 4,
              background: s <= step ? '#6366f1' : 'rgba(255,255,255,0.12)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <form onSubmit={handleNext}>
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
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', padding: '0.85rem 1rem',
                color: '#f1f5f9', fontSize: '1rem', outline: 'none',
                marginBottom: '1.25rem',
              }}
            />

            {error && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              style={{
                width: '100%', padding: '0.9rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          </form>
        )}

        {/* ── Step 2: Concerns ── */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {CONCERNS.map(c => {
                const selected = concerns.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                      cursor: 'pointer', textAlign: 'left',
                      border: selected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.12)',
                      background: selected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                      color: selected ? '#c7d2fe' : '#94a3b8',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
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

            {error && (
              <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.9rem',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                marginBottom: '0.75rem',
              }}
            >
              {loading ? 'Setting up…' : 'Enter the Sanctuary →'}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError('') }}
              style={{
                width: '100%', background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem',
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              ← Back
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.72rem', color: '#475569', lineHeight: 1.5 }}>
          Your data stays on this server and is never shared. Private · No ads.
        </p>
      </div>
    </div>
  )
}
