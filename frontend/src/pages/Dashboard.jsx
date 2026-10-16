import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import WeeklyPatterns from '../components/WeeklyPatterns'
import CrisisResources from '../components/CrisisResources'
import FeedbackModal from '../components/FeedbackModal'
import AdminPanel from '../components/AdminPanel'
import { getTodayCheckIn, getHabits, getCheckIns } from '../utils/api'
import { computeInsights } from '../utils/insightsEngine'
import { computeDashboardSnapshot } from '../utils/trendAnalytics'
import { daysSince, TRACKED_ROUTES } from '../utils/pageVisits'
import '../styles/Home.css'

const MED_KEY = 'mindwell_medications'
const LOG_KEY = 'mindwell_med_log'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// Returns 'pending' | 'done' | null (null = not a daily item or data unavailable)
function useDailyStatus(userId) {
  const [status, setStatus] = useState({
    checkin: null,
    medications: null,
    habits: null,
  })

  useEffect(() => {
    const today = todayStr()

    // ── Check-in ──────────────────────────────────────────────
    getTodayCheckIn(userId)
      .then(res => setStatus(s => ({ ...s, checkin: res.data ? 'done' : 'pending' })))
      .catch(() => {})

    // ── Medications (localStorage) ────────────────────────────
    try {
      const meds = JSON.parse(localStorage.getItem(MED_KEY) || '[]')
      const log  = JSON.parse(localStorage.getItem(LOG_KEY)  || '[]')
      const dailyMeds = meds.filter(m => m.frequency === 'daily' || m.frequency === 'twice-daily')
      if (dailyMeds.length > 0) {
        const allTaken = dailyMeds.every(m => log.some(l => l.medId === m.id && l.date === today))
        setStatus(s => ({ ...s, medications: allTaken ? 'done' : 'pending' }))
      }
      // If no meds added yet → leave null (no indicator)
    } catch (e) {}

    // ── Habits ────────────────────────────────────────────────
    getHabits(userId)
      .then(res => {
        const habits = res.data || []
        const daily  = habits.filter(h => h.frequency === 'daily')
        if (daily.length === 0) return
        const today = new Date().toDateString() // e.g. "Sat Oct 10 2026"
        const allDone = daily.every(h =>
          (h.completions || []).some(c => new Date(c.completionDate).toDateString() === today)
        )
        setStatus(s => ({ ...s, habits: allDone ? 'done' : 'pending' }))
      })
      .catch(() => {})
  }, [userId])

  return status
}

// Helper to get className for a nav item
function itemClass(state) {
  if (state === 'pending') return 'nav-grid-item daily-pending'
  if (state === 'done')    return 'nav-grid-item daily-done'
  return 'nav-grid-item'
}

// Badge shown in corner of pending/done items
function Badge({ state }) {
  if (!state) return null
  return (
    <span className="daily-badge">
      {state === 'done' ? '✓' : '●'}
    </span>
  )
}

// NavCard — handles daily state badge + visit-staleness clock badge
function NavCard({ to, children, dailyState, className = '' }) {
  const threshold = TRACKED_ROUTES[to]
  const stale = threshold ? daysSince(to) > threshold : false
  // Don't show clock if the daily indicator is already drawing attention
  const showClock = stale && !dailyState

  return (
    <Link to={to} className={`${itemClass(dailyState)} ${className}`}>
      <Badge state={dailyState} />
      {showClock && (
        <span className="daily-badge" style={{ color: '#64748b', fontSize: '0.7rem' }} title="You haven't visited this recently">
          🕐
        </span>
      )}
      {children}
    </Link>
  )
}

function Dashboard({ userId }) {
  const daily    = useDailyStatus(userId)
  const [insights,      setInsights]      = useState([])
  const [snapshot,      setSnapshot]      = useState(null)
  const [showFeedback,  setShowFeedback]  = useState(false)
  const [showAdmin,     setShowAdmin]     = useState(false)
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(
    () => sessionStorage.getItem('mw_fb_dismissed') !== '1'
  )

  const dismissBanner = () => {
    sessionStorage.setItem('mw_fb_dismissed', '1')
    setShowFeedbackBanner(false)
  }

  useEffect(() => {
    getCheckIns(userId)
      .then(res => {
        const data = res.data || []
        setInsights(computeInsights(data))
        setSnapshot(computeDashboardSnapshot(data))
      })
      .catch(() => {})
  }, [userId])

  return (
    <div className="home-container">

      {/* Header */}
      <div className="home-header" style={{ padding: '0.75rem 2rem' }}>
        <div className="home-welcome">
          <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary" className="home-icon" />
          <div className="home-welcome-text">
            <h1>Explore Mind Sanctuary</h1>
            <p>All your wellness tools in one place</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Admin button */}
          <button onClick={() => setShowAdmin(true)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px', padding: '0.55rem 1rem', color: '#94a3b8',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>🛡️ Admin</button>
          <button onClick={() => setShowFeedback(true)} style={{
            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)',
            borderRadius: '10px', padding: '0.55rem 1rem', color: '#a5b4fc',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
          }}>💬 Give Feedback</button>
        </div>
      </div>

      <FeedbackModal isOpen={showFeedback} onClose={() => setShowFeedback(false)} userId={userId} />
      <AdminPanel    isOpen={showAdmin}    onClose={() => setShowAdmin(false)} />

      {/* Feedback reminder banner */}
      {showFeedbackBanner && (
        <div style={{
          maxWidth: 900, margin: '0.75rem auto 0', padding: '0 1.5rem',
        }}>
          <div style={{
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: '10px', padding: '0.7rem 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <span style={{ fontSize: '0.85rem', color: '#fde68a', lineHeight: 1.4 }}>
              💬 <strong>You're a beta tester — your feedback shapes this app.</strong> Tell us what's working and what isn't.
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => { setShowFeedback(true); dismissBanner() }} style={{
                background: '#fbbf24', border: 'none', borderRadius: '7px',
                padding: '0.35rem 0.85rem', color: '#1a1a1a', fontWeight: 700,
                fontSize: '0.78rem', cursor: 'pointer',
              }}>Give Feedback</button>
              <button onClick={dismissBanner} style={{
                background: 'none', border: 'none', color: '#92400e',
                fontSize: '1rem', cursor: 'pointer', padding: '0 0.25rem', lineHeight: 1,
              }}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Snapshot banner */}
      {snapshot && (
        <div style={{ maxWidth: 900, margin: '0.75rem auto 0', padding: '0 1.5rem' }}>
          <Link to="/trends" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              background: `${snapshot.accent}18`,
              border: `1px solid ${snapshot.accent}45`,
              borderLeft: `4px solid ${snapshot.accent}`,
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}>
              <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{snapshot.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: snapshot.accent, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{snapshot.label}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>{snapshot.headline}</span>
                </div>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>{snapshot.sub}</p>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', flexShrink: 0, fontWeight: 600 }}>View trends →</span>
            </div>
          </Link>
        </div>
      )}

      {/* Legend */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 0.5rem', display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: '#94a3b8', flexWrap: 'wrap' }}>
        <span style={{ color: '#fbbf24' }}>● Needs completing today</span>
        <span style={{ color: '#34d399' }}>✓ Done for today</span>
        <span style={{ color: '#94a3b8' }}>🕐 Not visited recently</span>
      </div>

      <div className="home-content">

        {/* Your Insights — shown first so users see them immediately */}
        {insights.length > 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto 1.5rem', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>🔍 Your Personal Insights</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>Patterns found in your check-in history</div>
              </div>
              <Link to="/checkin-history" style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
                Full details →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {insights.map((card, i) => (
                <div key={i} style={{
                  background: `${card.accent}15`,
                  border: `1px solid ${card.accent}40`,
                  borderLeft: `4px solid ${card.accent}`,
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#f1f5f9', lineHeight: 1.3 }}>{card.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.55 }}>{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="nav-grid-section">
          <div className="nav-grid">

            {/* ── Daily Tracking ── */}
            <div className="nav-group-header">📊 Daily Tracking</div>
            <NavCard to="/checkin" dailyState={daily.checkin}>
              <h3>Daily Check-In</h3><p>Track your wellness</p>
            </NavCard>
            <NavCard to="/checkin-history">
              <h3>Check-In History</h3><p>View your tracking</p>
            </NavCard>
            <NavCard to="/mood-calendar">
              <h3>Mood Calendar</h3><p>Daily mood at a glance</p>
            </NavCard>

            {/* ── Goals & Progress ── */}
            <div className="nav-group-header">🎯 Goals &amp; Progress</div>
            <NavCard to="/habits" dailyState={daily.habits}>
              <h3>My Goals &amp; Achievements</h3><p>Track your progress</p>
            </NavCard>
            <NavCard to="/journey">
              <h3>My Journey</h3><p>Your wellness milestones</p>
            </NavCard>
            <NavCard to="/trends">
              <h3>Wellness Trends</h3><p>Mood &amp; pattern insights</p>
            </NavCard>
            <NavCard to="/sleep">
              <h3>Sleep Tracker</h3><p>Your sleep patterns</p>
            </NavCard>

            {/* ── Mental Health ── */}
            <div className="nav-group-header">🧠 Mental Health</div>
            <NavCard to="/assessments">
              <h3>Mental Health Assessments</h3><p>Evidence-based tools</p>
            </NavCard>
            <NavCard to="/assessment-history">
              <h3>Assessment History</h3><p>Your results</p>
            </NavCard>

            {/* ── Reflection & Wellbeing ── */}
            <div className="nav-group-header">📝 Reflection &amp; Wellbeing</div>
            <NavCard to="/journal">
              <h3>Journal</h3><p>Write and reflect</p>
            </NavCard>
            <NavCard to="/coping">
              <h3>Coping Strategies</h3><p>Manage stress</p>
            </NavCard>
            <NavCard to="/breathing">
              <h3>Breathing Timer</h3><p>Box, 4-7-8 &amp; more</p>
            </NavCard>
            <NavCard to="/articles">
              <h3>Articles</h3><p>Mental health resources</p>
            </NavCard>
            <NavCard to="/inspiration">
              <h3>Inspiration</h3><p>Daily motivation</p>
            </NavCard>

            {/* ── Tools & Support ── */}
            <div className="nav-group-header">🛠 Tools &amp; Support</div>
            <NavCard to="/todos">
              <h3>To Do List</h3><p>Manage tasks</p>
            </NavCard>
            <NavCard to="/medications" dailyState={daily.medications}>
              <h3>Medications</h3><p>Track meds &amp; supplements</p>
            </NavCard>
            <NavCard to="/safety-plan">
              <h3>My Safety Plan</h3><p>Personal crisis plan</p>
            </NavCard>
            <NavCard to="/share-report">
              <h3>Share with Clinician</h3><p>Send report to your team</p>
            </NavCard>
            <NavCard to="/crisis">
              <h3>Crisis Help</h3><p>Emergency resources</p>
            </NavCard>

            {/* AI Companion */}
            <NavCard to="/reflection" className="nav-grid-item-large">
              <h3>Talk With Your AI Wellness Companion</h3>
              <p>Guided conversations for support</p>
            </NavCard>
          </div>
        </div>

        {/* Your Patterns */}
        <div className="patterns-section">
          <h2>Your Patterns</h2>
          <div className="patterns-card">
            <WeeklyPatterns userId={userId} />
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="crisis-section">
          <CrisisResources collapsed={false} />
        </div>

      </div>
    </div>
  )
}

export default Dashboard
