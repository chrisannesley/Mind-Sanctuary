import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../utils/api'

// ── Compute weekly mood averages for the sparkline ──────────────────────────
function weeklyAverages(checkIns) {
  const now = new Date()
  const weeks = []

  for (let w = 11; w >= 0; w--) {
    const end   = new Date(now); end.setDate(now.getDate() - w * 7)
    const start = new Date(end); start.setDate(end.getDate() - 7)
    const bucket = checkIns.filter(c => {
      const t = new Date(c.timestamp)
      return t >= start && t < end
    })
    weeks.push(bucket.length > 0
      ? bucket.reduce((s, c) => s + c.mood, 0) / bucket.length
      : null)
  }
  return weeks
}

// ── Derive key stats from raw check-ins ────────────────────────────────────
function computeStats(checkIns) {
  if (!checkIns.length) return null

  const avgMood = checkIns.reduce((s, c) => s + c.mood, 0) / checkIns.length

  // Weekday vs weekend mood
  const weekday = checkIns.filter(c => { const d = new Date(c.timestamp).getDay(); return d > 0 && d < 6 })
  const weekend = checkIns.filter(c => { const d = new Date(c.timestamp).getDay(); return d === 0 || d === 6 })
  const wdAvg   = weekday.length ? weekday.reduce((s, c) => s + c.mood, 0) / weekday.length : null
  const weAvg   = weekend.length ? weekend.reduce((s, c) => s + c.mood, 0) / weekend.length : null
  const weekendDiff = (wdAvg && weAvg) ? +(weAvg - wdAvg).toFixed(1) : null

  // Trend: first-quarter avg vs last-quarter avg
  const sorted   = [...checkIns].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const quarter  = Math.floor(sorted.length / 4)
  const firstAvg = quarter ? sorted.slice(0, quarter).reduce((s, c) => s + c.mood, 0) / quarter : null
  const lastAvg  = quarter ? sorted.slice(-quarter).reduce((s, c) => s + c.mood, 0) / quarter  : null
  const trend    = (firstAvg && lastAvg) ? +(lastAvg - firstAvg).toFixed(1) : null

  return { avgMood: +avgMood.toFixed(1), weekendDiff, trend, days: checkIns.length }
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────
function Sparkline({ weeks }) {
  const W = 260, H = 56
  const filled = weeks.filter(Boolean)
  if (filled.length < 2) return null

  const pts = []
  weeks.forEach((v, i) => {
    if (v === null) return
    const x = (i / 11) * W
    const y = H - ((v - 1) / 9) * H
    pts.push([x, y])
  })

  const polyPoints = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPoints = [
    `${pts[0][0].toFixed(1)},${H}`,
    ...pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`),
    `${pts[pts.length - 1][0].toFixed(1)},${H}`,
  ].join(' ')

  // Color the line by avg mood
  const avg = filled.reduce((s, v) => s + v, 0) / filled.length
  const lineColor = avg >= 7 ? '#10b981' : avg >= 5 ? '#6366f1' : '#f59e0b'

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${lineColor.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#sg-${lineColor.replace('#','')})`} />
      {/* Line */}
      <polyline points={polyPoints} fill="none" stroke={lineColor} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {/* End dot */}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4"
        fill={lineColor} stroke="rgba(15,52,96,0.8)" strokeWidth="1.5" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function DemoProfiles() {
  const navigate = useNavigate()
  const [demoUsers,  setDemoUsers]  = useState([])
  const [checkIns,   setCheckIns]   = useState({})  // { userId: [...] }
  const [activeIdx,  setActiveIdx]  = useState(0)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    apiClient.get('/api/demo-users')
      .then(res => {
        const users = res.data || []
        setDemoUsers(users)
        if (!users.length) { setLoading(false); return }

        // Fetch all check-ins in parallel
        Promise.all(users.map(u => apiClient.get(`/api/checkins?userId=${u.id}`)))
          .then(results => {
            const map = {}
            results.forEach((r, i) => { map[users[i].id] = r.data || [] })
            setCheckIns(map)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !demoUsers.length) return null

  const user   = demoUsers[activeIdx]
  if (!user) return null

  const ci     = checkIns[user.id] || []
  const weeks  = weeklyAverages(ci)
  const stats  = computeStats(ci)

  const trendLabel = !stats?.trend ? null
    : stats.trend >= 1   ? { text: '↑ Improving',   color: '#10b981' }
    : stats.trend <= -1  ? { text: '↓ Declining',   color: '#f59e0b' }
    :                      { text: '→ Stable',       color: '#6366f1' }

  return (
    <div style={{
      maxWidth: 500, width: '100%',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginTop: '2.5rem',
    }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6366f1', fontWeight: 700, marginBottom: '0.25rem' }}>
          Real patterns. Real progress.
        </div>
        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0 }}>
          See what 3 months of tracking reveals
        </p>
      </div>

      {/* User tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {demoUsers.map((u, i) => (
          <button
            key={u.id}
            onClick={() => setActiveIdx(i)}
            style={{
              background: i === activeIdx ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
              border: i === activeIdx ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '0.35rem 0.85rem',
              color: i === activeIdx ? '#c7d2fe' : '#cbd5e1',
              fontSize: '0.82rem', fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {u.avatar} {u.name}
          </button>
        ))}
      </div>

      {/* Active user card */}
      <div>
        {/* Name + concern */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
            {user.avatar} {user.name}
          </span>
          <span style={{ color: '#e2e8f0', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
            — {user.mainConcern}
          </span>
        </div>

        {/* Sparkline */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.68rem', color: '#e2e8f0', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Mood — past 12 weeks
          </div>
          <Sparkline weeks={weeks} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#e2e8f0', marginTop: '0.2rem' }}>
            <span>12 weeks ago</span><span>This week</span>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{stats.avgMood}</div>
              <div style={{ fontSize: '0.65rem', color: '#e2e8f0', marginTop: '0.2rem' }}>avg mood</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{stats.days}</div>
              <div style={{ fontSize: '0.65rem', color: '#e2e8f0', marginTop: '0.2rem' }}>days tracked</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.6rem 0.5rem', textAlign: 'center' }}>
              {trendLabel && (
                <>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: trendLabel.color, lineHeight: 1 }}>{trendLabel.text}</div>
                  <div style={{ fontSize: '0.65rem', color: '#e2e8f0', marginTop: '0.2rem' }}>3-month trend</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Weekend insight */}
        {stats?.weekendDiff !== null && Math.abs(stats.weekendDiff) >= 0.5 && (
          <div style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderLeft: '3px solid #6366f1',
            borderRadius: '8px',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            fontSize: '0.78rem',
            color: '#c7d2fe',
            lineHeight: 1.5,
          }}>
            💡 {stats.weekendDiff > 0
              ? `Weekends are ${stats.weekendDiff} pts better than weekdays`
              : `Weekdays are actually ${Math.abs(stats.weekendDiff)} pts better for this person`
            }
          </div>
        )}

        {/* Story */}
        {user.story && (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.55 }}>
            "{user.story}"
          </p>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/try')}
        style={{
          marginTop: '1.25rem', width: '100%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px',
          padding: '0.7rem',
          color: '#e2e8f0', fontWeight: 600, fontSize: '0.88rem',
          cursor: 'pointer',
        }}
      >
        Start building your own picture →
      </button>
    </div>
  )
}
