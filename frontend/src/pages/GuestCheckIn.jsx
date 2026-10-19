import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnhancedCheckInForm from '../components/EnhancedCheckInForm'

// ── Shared helpers (mirrors CheckIn.jsx) ───────────────────────────────────
function generateFeedback(data) {
  const { mood, energy, sleep, stress } = data
  const messages = []

  if (mood >= 8)      messages.push("Your mood is strong today — that's worth acknowledging.")
  else if (mood >= 6) messages.push("You're in a reasonable place today. That's enough.")
  else if (mood >= 4) messages.push("Today feels a bit challenging. Be gentle with yourself.")
  else                messages.push("It sounds like today is hard. You still showed up — that matters.")

  const sleepHrs = sleep?.hours
  if (sleepHrs !== undefined) {
    if (sleepHrs >= 8)      messages.push("Good sleep last night — your body and mind will thank you.")
    else if (sleepHrs >= 6) messages.push("Your sleep was a little short. Try to rest when you can today.")
    else                    messages.push("Limited sleep can make everything harder. Be kind to yourself today.")
  }

  const stressLvl = stress?.level
  if (stressLvl !== undefined) {
    if (stressLvl >= 8)      messages.push("High stress noted. Consider a coping strategy today.")
    else if (stressLvl >= 5) messages.push("Moderate stress is present. A short breathing exercise might help.")
  }

  if (energy !== undefined && energy <= 3)
    messages.push("Low energy today. Prioritise the essentials and rest where possible.")

  if (mood >= 7 && (stressLvl === undefined || stressLvl <= 5))
    messages.push("Overall you seem to be doing well today.")
  else
    messages.push("Thank you for checking in. Tracking this over time reveals a lot about what affects you.")

  return messages
}

function calculateWellnessScore(data) {
  const { mood, energy, stress } = data
  const values = []
  if (mood)          values.push(mood)
  if (energy)        values.push(energy)
  if (stress?.level) values.push(10 - stress.level)
  if (!values.length) return null
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10
}

function scoreLabel(score) {
  if (score >= 7.5) return { text: 'Doing well',         color: '#10b981' }
  if (score >= 6)   return { text: 'Getting by',         color: '#3b82f6' }
  if (score >= 4)   return { text: 'Having a tough day', color: '#f59e0b' }
  return               { text: 'Struggling today',    color: '#ef4444' }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function GuestCheckIn() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  const handleSubmit = (data) => {
    setResult(data)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const score    = result ? calculateWellnessScore(result) : null
  const label    = score  ? scoreLabel(score)              : null
  const feedback = result ? generateFeedback(result)       : []

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)', padding: '2rem 1rem' }}>

      {/* Header */}
      <div style={{ maxWidth: 640, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img
          src="/mind-sanctuary-icon.png"
          alt="Mind Sanctuary"
          style={{ width: 36, height: 36, borderRadius: '8px', objectFit: 'cover' }}
        />
        <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.05rem' }}>Mind Sanctuary</span>
        <span style={{
          marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8',
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px', padding: '0.25rem 0.75rem', fontWeight: 600,
        }}>
          Try it free — no account needed
        </span>
      </div>

      {/* Results card — shown after submission */}
      {result && (
        <div style={{ maxWidth: 640, margin: '0 auto 1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f3460, #16213e)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px',
            padding: '1.75rem',
            color: '#fff',
          }}>
            {/* Score row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  Today's Wellness Score
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: label.color }}>
                  {score}<span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/10</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: label.color, marginTop: '0.25rem' }}>
                  {label.text}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Mood <strong style={{ color: '#fff' }}>{result.mood}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Energy <strong style={{ color: '#fff' }}>{result.energy}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Stress <strong style={{ color: '#fff' }}>{result.stress?.level}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Sleep <strong style={{ color: '#fff' }}>{result.sleep?.hours}h</strong>
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              {feedback.map((msg, i) => (
                <p key={i} style={{
                  fontSize: '0.88rem',
                  color: i === feedback.length - 1 ? '#94a3b8' : '#cbd5e1',
                  margin: 0, lineHeight: 1.6,
                  fontStyle: i === feedback.length - 1 ? 'italic' : 'normal',
                }}>
                  {msg}
                </p>
              ))}
            </div>

            {/* ── Save your results CTA ── */}
            <div style={{
              marginTop: '1.5rem',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem' }}>
                📈 Want to track this over time?
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem', lineHeight: 1.55 }}>
                Create a free account to save today's result and start spotting patterns in your mood, sleep and stress.
              </p>
              <button
                onClick={() => navigate('/setup')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '12px',
                  padding: '0.85rem 2rem',
                  color: '#fff', fontWeight: 800, fontSize: '1rem',
                  cursor: 'pointer', width: '100%',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                  marginBottom: '0.6rem',
                }}
              >
                Save my results — it's free
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-in form */}
      <EnhancedCheckInForm onSubmit={handleSubmit} loading={false} disabled={false} />

      {/* Footer nudge */}
      {!result && (
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
          Nothing is saved until you create an account · Private · No ads
        </p>
      )}
    </div>
  )
}
