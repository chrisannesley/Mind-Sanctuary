import React, { useState, useEffect } from 'react'
import { createCheckIn, getTodayCheckIn, getCheckIns } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import EnhancedCheckInForm from '../components/EnhancedCheckInForm'
import { cancelCheckInToday } from '../services/NotificationService'
import { pickRelevantInsight } from '../utils/insightsEngine'
import { computeCheckInTrendMessage } from '../utils/trendAnalytics'

// Generate personalised feedback based on check-in data
function generateFeedback(data) {
  const { mood, energy, sleep, stress } = data
  const messages = []

  // Mood feedback
  if (mood >= 8) messages.push("Your mood is strong today — that's worth acknowledging.")
  else if (mood >= 6) messages.push("You're in a reasonable place today. That's enough.")
  else if (mood >= 4) messages.push("Today feels a bit challenging. Be gentle with yourself.")
  else messages.push("It sounds like today is hard. You still showed up — that matters.")

  // Sleep feedback
  const sleepHrs = sleep?.hours
  if (sleepHrs !== undefined) {
    if (sleepHrs >= 8) messages.push("Good sleep last night — your body and mind will thank you.")
    else if (sleepHrs >= 6) messages.push("Your sleep was a little short. Try to rest when you can today.")
    else messages.push("Limited sleep can make everything harder. Be kind to yourself today.")
  }

  // Stress feedback
  const stressLvl = stress?.level
  if (stressLvl !== undefined) {
    if (stressLvl >= 8) messages.push("High stress noted. Consider using a coping strategy from the app today.")
    else if (stressLvl >= 5) messages.push("Moderate stress is present. A short breathing exercise might help.")
  }

  // Energy feedback
  if (energy !== undefined) {
    if (energy <= 3) messages.push("Low energy today. Prioritise the essentials and rest where possible.")
  }

  // Positive close
  if (mood >= 7 && (stressLvl === undefined || stressLvl <= 5)) {
    messages.push("Overall you seem to be doing well today.")
  } else {
    messages.push("Thank you for taking the time to check in. This data helps you understand yourself better over time.")
  }

  return messages
}

// Overall wellness score (simple average of mood, energy, inverted stress)
function calculateWellnessScore(data) {
  const { mood, energy, stress } = data
  const values = []
  if (mood)           values.push(mood)
  if (energy)         values.push(energy)
  if (stress?.level)  values.push(10 - stress.level) // invert stress
  if (!values.length) return null
  return Math.round(values.reduce((a,b) => a+b, 0) / values.length * 10) / 10
}

function scoreLabel(score) {
  if (score >= 7.5) return { text: 'Doing well',     color: '#10b981' }
  if (score >= 6)   return { text: 'Getting by',     color: '#3b82f6' }
  if (score >= 4)   return { text: 'Having a tough day', color: '#f59e0b' }
  return               { text: 'Struggling today', color: '#ef4444' }
}

function CheckIn({ user, userId }) {
  const [loading,      setLoading]      = useState(false)
  const [todayCheckIn, setTodayCheckIn] = useState(null)
  const [lastResult,   setLastResult]   = useState(null)
  const [insight,      setInsight]      = useState(null)
  const [trendMsg,     setTrendMsg]     = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const checkInRes = await getTodayCheckIn(userId)
        setTodayCheckIn(checkInRes.data)
      } catch (error) {
        console.error('Error loading check-in data:', error)
      }
    }
    loadData()
  }, [userId])

  const handleCheckInSubmit = async (checkInData) => {
    setLoading(true)
    try {
      const response = await createCheckIn(userId, checkInData)
      setLastResult(checkInData)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      cancelCheckInToday()

      const checkInRes = await getTodayCheckIn(userId)
      setTodayCheckIn(checkInRes.data)

      // Compute a contextual insight from history
      try {
        const historyRes = await getCheckIns(userId)
        const allCheckIns = historyRes.data || []
        const picked = pickRelevantInsight(allCheckIns, checkInData)
        setInsight(picked)
        const trend = computeCheckInTrendMessage(allCheckIns)
        setTrendMsg(trend)
      } catch (_) {}
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Error submitting check-in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const score  = lastResult ? calculateWellnessScore(lastResult) : null
  const label  = score ? scoreLabel(score) : null
  const feedback = lastResult ? generateFeedback(lastResult) : []

  return (
    <div className="min-h-screen bg-gray-50 py-8">

      {/* ── Check-In Feedback Card (shown after submission) ── */}
      {lastResult && (
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div style={{
            background: 'linear-gradient(135deg, #0f3460, #16213e)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.75rem',
            color: '#fff'
          }}>
            {/* Score */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                  Today's Wellness Score
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: label.color }}>
                  {score}<span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/10</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: label.color, marginTop: '0.25rem' }}>
                  {label.text}
                </div>
              </div>

              {/* Mini metric pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Mood <strong style={{ color: '#fff' }}>{lastResult.mood}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Energy <strong style={{ color: '#fff' }}>{lastResult.energy}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Stress <strong style={{ color: '#fff' }}>{lastResult.stress?.level}/10</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Sleep <strong style={{ color: '#fff' }}>{lastResult.sleep?.hours}h</strong>
                </div>
              </div>
            </div>

            {/* Feedback messages */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {feedback.map((msg, i) => (
                <p key={i} style={{
                  fontSize: '0.88rem',
                  color: i === feedback.length - 1 ? '#94a3b8' : '#cbd5e1',
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: i === feedback.length - 1 ? 'italic' : 'normal'
                }}>
                  {msg}
                </p>
              ))}
            </div>

            {/* Weekly trend message — positive OR gentle concern */}
            {trendMsg && (
              <div style={{
                marginTop: '1.25rem',
                background: `${trendMsg.accent}18`,
                border: `1px solid ${trendMsg.accent}40`,
                borderLeft: `4px solid ${trendMsg.accent}`,
                borderRadius: '10px',
                padding: '0.9rem 1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{trendMsg.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', marginBottom: '0.25rem' }}>
                    {trendMsg.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.55 }}>
                    {trendMsg.message}
                  </p>
                </div>
              </div>
            )}

            {/* Insight from history */}
            {insight && (
              <div style={{
                marginTop: '1.25rem',
                background: `${insight.accent}18`,
                border: `1px solid ${insight.accent}40`,
                borderLeft: `4px solid ${insight.accent}`,
                borderRadius: '10px',
                padding: '0.9rem 1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  💡 A pattern from your history
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{insight.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#f1f5f9' }}>{insight.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.55 }}>{insight.body}</p>
              </div>
            )}

            {/* Journal prompt */}
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/journal')}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#e0e0e0',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                ✍️ Write in Journal
              </button>
              {lastResult.stress?.level >= 6 && (
                <button
                  onClick={() => navigate('/coping')}
                  style={{
                    flex: 1,
                    background: 'rgba(233,69,96,0.15)',
                    border: '1px solid rgba(233,69,96,0.3)',
                    color: '#fca5a5',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  🧘 Coping Strategies
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <EnhancedCheckInForm
        onSubmit={handleCheckInSubmit}
        loading={loading}
        disabled={false}
      />
    </div>
  )
}

export default CheckIn
