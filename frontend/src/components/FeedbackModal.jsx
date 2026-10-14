import React, { useState } from 'react'
import { X, Star } from 'lucide-react'
import { submitFeedback } from '../utils/api'

export default function FeedbackModal({ isOpen, onClose, userId }) {
  const [rating,    setRating]    = useState(0)
  const [hover,     setHover]     = useState(0)
  const [liked,     setLiked]     = useState('')
  const [improve,   setImprove]   = useState('')
  const [bugs,      setBugs]      = useState('')
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState('')

  if (!isOpen) return null

  const reset = () => {
    setRating(0); setHover(0); setLiked(''); setImprove('')
    setBugs(''); setEmail(''); setLoading(false); setSubmitted(false); setError('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { setError('Please give an overall rating.'); return }
    if (!liked.trim() && !improve.trim()) { setError('Please fill in at least one feedback field.'); return }

    setLoading(true)
    setError('')
    try {
      await submitFeedback(userId, { rating, liked, improve, bugs, email })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  }

  const modal = {
    background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: 520,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  }

  const label = { display: 'block', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem' }
  const textarea = {
    width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
    padding: '0.65rem 0.85rem', color: '#f1f5f9', fontSize: '0.88rem',
    resize: 'vertical', outline: 'none', lineHeight: 1.5,
  }
  const input = { ...textarea, resize: 'none' }

  if (submitted) {
    return (
      <div style={overlay} onClick={handleClose}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>
              Thank you!
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your feedback genuinely helps shape Mind Sanctuary. We read every response.
            </p>
            <button
              onClick={handleClose}
              style={{ background: '#6366f1', border: 'none', borderRadius: '10px', padding: '0.75rem 2rem', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay} onClick={handleClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              Beta Feedback
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.25rem' }}>
              Your honest thoughts help us build something better
            </p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Star rating */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={label}>Overall rating</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem' }}
                >
                  <Star
                    size={28}
                    fill={(hover || rating) >= n ? '#fbbf24' : 'none'}
                    color={(hover || rating) >= n ? '#fbbf24' : '#475569'}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', alignSelf: 'center', marginLeft: '0.25rem' }}>
                  {['','Poor','Fair','Good','Great','Excellent'][rating]}
                </span>
              )}
            </div>
          </div>

          {/* What they like */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>What's working well for you? <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={liked}
              onChange={e => setLiked(e.target.value)}
              placeholder="Features you're finding useful, things you enjoy..."
              rows={3}
              style={textarea}
            />
          </div>

          {/* What to improve */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>What could be better? <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={improve}
              onChange={e => setImprove(e.target.value)}
              placeholder="Anything confusing, missing, or frustrating..."
              rows={3}
              style={textarea}
            />
          </div>

          {/* Bugs */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={label}>Any bugs or errors? <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={bugs}
              onChange={e => setBugs(e.target.value)}
              placeholder="Describe what happened and which page you were on..."
              rows={2}
              style={textarea}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={label}>Your email <span style={{ color: '#64748b', fontWeight: 400 }}>(optional — only if you'd like a follow-up)</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={input}
            />
          </div>

          {error && (
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem',
              background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending…' : 'Send Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}
