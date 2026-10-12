import React, { useState, useEffect, useMemo } from 'react'
import { getCheckIns, getCheckInStats, getWeeklySummary, deleteCheckIn } from '../utils/api'
import { TrendingUp, TrendingDown, Activity, AlertCircle, Calendar, Trash2, ChevronDown, ChevronRight, Download } from 'lucide-react'
import MovingAvgChart from '../components/MovingAvgChart'
import Modal from '../components/Modal'
import { computeInsights } from '../utils/insightsEngine'
import '../styles/Home.css'

// ── helpers ──────────────────────────────────────────────────────────────────

function rowTint(mood) {
  if (mood >= 8) return 'rgba(16,185,129,0.10)'
  if (mood >= 6) return 'rgba(59,130,246,0.08)'
  if (mood >= 4) return 'rgba(245,158,11,0.10)'
  return 'rgba(239,68,68,0.12)'
}

function moodColor(v) {
  if (v >= 7) return '#10b981'
  if (v >= 5) return '#f59e0b'
  return '#ef4444'
}
function stressColor(v) {
  if (v <= 4) return '#10b981'
  if (v <= 6) return '#f59e0b'
  return '#ef4444'
}
function sleepColor(v) {
  if (v >= 7) return '#10b981'
  if (v >= 6) return '#f59e0b'
  return '#ef4444'
}

function exportCSV(rows) {
  const headers = ['Date & Time','Mood','Energy','Stress','Sleep','Social','Triggers','Journal Note']
  const lines = rows.map(c => [
    new Date(c.timestamp).toLocaleString('en-GB'),
    c.mood ?? '',
    c.energy ?? '',
    c.stress?.level ?? '',
    c.sleep?.hours ?? '',
    c.socialInteraction ?? '',
    c.triggers ?? '',
    (c.journalNote ?? '').replace(/"/g,'""'),
  ].map(v => `"${v}"`).join(','))
  const blob = new Blob([[headers.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'checkin-history.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Pattern insights ──────────────────────────────────────────────────────────

function PatternInsights({ checkIns }) {
  const cards = useMemo(() => computeInsights(checkIns), [checkIns])
  if (!cards.length) return null

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>🔍 Your Personal Insights</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          Patterns detected from your {checkIns.length} check-ins
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {cards.map((card, i) => (
          <div key={i} style={{
            background: `${card.accent}15`,
            border: `1px solid ${card.accent}40`,
            borderLeft: `4px solid ${card.accent}`,
            borderRadius: '10px',
            padding: '1rem 1.1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.3rem' }}>{card.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', lineHeight: 1.3 }}>{card.title}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Streak banner ─────────────────────────────────────────────────────────────

function Streaks({ checkIns }) {
  const today = new Date(); today.setHours(0,0,0,0)

  // Check-in streak: consecutive days with at least one check-in
  let checkInStreak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const ds = d.toDateString()
    if (checkIns.some(c => new Date(c.timestamp).toDateString() === ds)) checkInStreak++
    else break
  }

  // Good mood streak: consecutive days with avg mood ≥ 6
  let goodStreak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const ds = d.toDateString()
    const dayMoods = checkIns.filter(c => new Date(c.timestamp).toDateString() === ds && c.mood).map(c=>c.mood)
    if (dayMoods.length === 0) break
    const avg = dayMoods.reduce((a,b)=>a+b,0)/dayMoods.length
    if (avg >= 6) goodStreak++
    else break
  }

  if (checkInStreak < 2 && goodStreak < 2) return null

  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
      {checkInStreak >= 2 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))',
          border: '1px solid rgba(99,102,241,0.5)',
          borderRadius: '12px', padding: '0.85rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🔥</span>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{checkInStreak}</div>
            <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>day check-in streak</div>
          </div>
        </div>
      )}
      {goodStreak >= 2 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.1))',
          border: '1px solid rgba(16,185,129,0.5)',
          borderRadius: '12px', padding: '0.85rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>⭐</span>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{goodStreak}</div>
            <div style={{ fontSize: '0.72rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.15rem' }}>day good mood streak</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

function CheckInHistory({ userId = 1 }) {
  const [checkIns,      setCheckIns]      = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [loading,       setLoading]       = useState(true)

  // View controls
  const [timeRange,   setTimeRange]   = useState('all')
  const [showTrend,   setShowTrend]   = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Table controls
  const [sortCol,    setSortCol]    = useState('timestamp')
  const [sortDir,    setSortDir]    = useState('desc')
  const [filterText, setFilterText] = useState('')
  const [filterSocial, setFilterSocial] = useState('all')
  const [filterMoodMin, setFilterMoodMin] = useState(1)
  const [expandedRow,   setExpandedRow]   = useState(null)

  // Delete
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [ciRes, wsRes] = await Promise.all([
          getCheckIns(userId),
          getWeeklySummary(userId),
        ])
        setCheckIns(ciRes.data || [])
        setWeeklySummary(wsRes.data || null)
      } catch (e) {
        console.error('Error loading check-in history:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  // Base filter by time range
  const timeFiltered = useMemo(() => {
    if (timeRange === 'all') return checkIns
    const now  = new Date()
    const from = new Date()
    if (timeRange === 'week')  from.setDate(now.getDate() - 7)
    if (timeRange === 'month') from.setMonth(now.getMonth() - 1)
    return checkIns.filter(c => new Date(c.timestamp) >= from)
  }, [checkIns, timeRange])

  // Social options from data
  const socialOptions = useMemo(() => {
    const s = new Set(checkIns.map(c => c.socialInteraction).filter(Boolean))
    return ['all', ...Array.from(s).sort()]
  }, [checkIns])

  // Full filtered + sorted table rows
  const tableRows = useMemo(() => {
    let rows = timeFiltered.filter(c => c.mood || c.moodRating)

    // Text filter (triggers + journal note)
    if (filterText.trim()) {
      const q = filterText.toLowerCase()
      rows = rows.filter(c =>
        (c.triggers || '').toLowerCase().includes(q) ||
        (c.journalNote || '').toLowerCase().includes(q)
      )
    }

    // Social filter
    if (filterSocial !== 'all') {
      rows = rows.filter(c => c.socialInteraction === filterSocial)
    }

    // Mood min
    if (filterMoodMin > 1) {
      rows = rows.filter(c => (c.mood || c.moodRating || 0) >= filterMoodMin)
    }

    // Sort
    rows = [...rows].sort((a, b) => {
      let av, bv
      if (sortCol === 'timestamp') { av = new Date(a.timestamp); bv = new Date(b.timestamp) }
      else if (sortCol === 'mood')   { av = a.mood || 0;           bv = b.mood || 0 }
      else if (sortCol === 'energy') { av = a.energy || 0;         bv = b.energy || 0 }
      else if (sortCol === 'stress') { av = a.stress?.level || 0;  bv = b.stress?.level || 0 }
      else if (sortCol === 'sleep')  { av = a.sleep?.hours || 0;   bv = b.sleep?.hours || 0 }
      else { av = 0; bv = 0 }
      return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1)
    })

    return rows
  }, [timeFiltered, filterText, filterSocial, filterMoodMin, sortCol, sortDir])

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCheckIn(deleteTarget)
      setCheckIns(prev => prev.filter(c => c.id !== deleteTarget))
      setDeleteTarget(null)
    } catch (e) {
      alert('Error deleting. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Summary stats from time-filtered data
  const validMoods = timeFiltered.filter(c => c.mood).map(c => c.mood)
  const avgMood    = validMoods.length ? (validMoods.reduce((a,b)=>a+b,0)/validMoods.length).toFixed(1) : '–'
  const avgSleep   = (() => {
    const sl = timeFiltered.filter(c=>c.sleep?.hours).map(c=>c.sleep.hours)
    return sl.length ? (sl.reduce((a,b)=>a+b,0)/sl.length).toFixed(1) : '–'
  })()
  const avgStress  = (() => {
    const st = timeFiltered.filter(c=>c.stress?.level).map(c=>c.stress.level)
    return st.length ? (st.reduce((a,b)=>a+b,0)/st.length).toFixed(1) : '–'
  })()

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ color: '#475569', fontSize: 10 }}>↕</span>
    return <span style={{ color: '#a5b4fc', fontSize: 10 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
  }

  const thStyle = (col) => ({
    padding: '0.6rem 0.75rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  })

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-header" style={{ padding: '0.75rem 2rem' }}>
          <div className="home-welcome">
            <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary" className="home-icon" />
            <div className="home-welcome-text"><h1>Check-In History</h1></div>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div className="home-container">

      {/* Header */}
      <div className="home-header" style={{ padding: '0.75rem 2rem' }}>
        <div className="home-welcome">
          <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary" className="home-icon" />
          <div className="home-welcome-text">
            <h1>Check-In History</h1>
            <p>Monitor your wellbeing over time</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>

        {/* Time range */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[['week','Past Week'],['month','Past Month'],['all','All Time']].map(([v,l]) => (
            <button key={v} onClick={() => setTimeRange(v)} style={{
              padding: '0.45rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              background: timeRange === v ? '#6366f1' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${timeRange === v ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
              color: timeRange === v ? '#fff' : '#94a3b8',
            }}>{l}</button>
          ))}
        </div>

        {/* Streak banners */}
        <Streaks checkIns={checkIns} />

        {/* Stats cards */}
        {timeFiltered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Avg Mood',     val: `${avgMood}/10`,   color: '#60a5fa' },
              { label: 'Check-ins',    val: timeFiltered.length, color: '#60a5fa' },
              { label: 'Avg Sleep',    val: `${avgSleep}h`,    color: '#a78bfa' },
              { label: 'Avg Stress',   val: `${avgStress}/10`, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.9rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.65rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Weekly summary */}
        {weeklySummary?.checkInCount > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.9rem' }}>This Week's Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(100px,1fr))', gap: '0.6rem' }}>
              {[
                { label: 'Avg Mood',   val: weeklySummary.avgMood?.toFixed(1),   color: moodColor(weeklySummary.avgMood)   },
                { label: 'Avg Stress', val: weeklySummary.avgStress?.toFixed(1),  color: stressColor(weeklySummary.avgStress) },
                { label: 'Avg Sleep',  val: `${weeklySummary.avgSleep?.toFixed(1)}h`, color: sleepColor(weeklySummary.avgSleep) },
                { label: 'Avg Energy', val: weeklySummary.avgEnergy?.toFixed(1),  color: moodColor(weeklySummary.avgEnergy)  },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            {weeklySummary.topTriggers?.length > 0 && (
              <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f97316', marginBottom: '0.4rem' }}>Top Triggers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {weeklySummary.topTriggers.map((t,i) => (
                    <span key={i} style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', color: '#fdba74' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mood Trend toggle */}
        {checkIns.length > 0 && (
          <>
            <button onClick={() => setShowTrend(v => !v)} style={{
              width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '0.85rem 1.25rem', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            }}>
              <span>📈 Mood Trend</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{showTrend ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showTrend && (
              <div style={{ marginBottom: '1.25rem' }}>
                <MovingAvgChart checkIns={checkIns} />
              </div>
            )}
          </>
        )}

        {/* Detailed History toggle */}
        {checkIns.length > 0 && (
          <>
            <button onClick={() => setShowHistory(v => !v)} style={{
              width: '100%', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '0.85rem 1.25rem', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            }}>
              <span>📋 Detailed History</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{showHistory ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showHistory && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0 0 12px 12px', padding: '1rem', marginBottom: '1.5rem' }}>

                {/* Pattern insights */}
                <PatternInsights checkIns={timeFiltered.filter(c=>c.mood)} />

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    placeholder="Search triggers or notes…"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    style={{ flex: 2, minWidth: 160, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.45rem 0.75rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                  <select
                    value={filterSocial}
                    onChange={e => setFilterSocial(e.target.value)}
                    style={{ flex: 1, minWidth: 110, background: 'rgba(30,30,60,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.45rem 0.6rem', color: '#cbd5e1', fontSize: '0.85rem' }}
                  >
                    {socialOptions.map(s => <option key={s} value={s}>{s === 'all' ? 'All social' : s}</option>)}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Mood ≥</span>
                    <select
                      value={filterMoodMin}
                      onChange={e => setFilterMoodMin(parseInt(e.target.value))}
                      style={{ background: 'rgba(30,30,60,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.45rem 0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}
                    >
                      {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => exportCSV(tableRows)}
                    title="Export to CSV"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '8px', padding: '0.45rem 0.75rem', cursor: 'pointer', color: '#6ee7b7', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Download size={14} /> CSV
                  </button>
                  {(filterText || filterSocial !== 'all' || filterMoodMin > 1) && (
                    <button onClick={() => { setFilterText(''); setFilterSocial('all'); setFilterMoodMin(1) }}
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.45rem 0.7rem', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem' }}>
                      Clear
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.6rem' }}>
                  {tableRows.length} {tableRows.length === 1 ? 'entry' : 'entries'}
                  {(filterText || filterSocial !== 'all' || filterMoodMin > 1) && ` (filtered from ${timeFiltered.length})`}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        {[
                          { col: 'timestamp', label: 'Date & Time' },
                          { col: 'mood',      label: 'Mood' },
                          { col: 'energy',    label: 'Energy' },
                          { col: 'stress',    label: 'Stress' },
                          { col: 'sleep',     label: 'Sleep' },
                        ].map(({ col, label }) => (
                          <th key={col} style={thStyle(col)} onClick={() => handleSort(col)}>
                            {label} <SortIcon col={col} />
                          </th>
                        ))}
                        <th style={{ ...thStyle('social'), cursor: 'default' }}>Social</th>
                        <th style={{ ...thStyle('triggers'), cursor: 'default' }}>Triggers</th>
                        <th style={{ ...thStyle('actions'), cursor: 'default', width: 60 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((c, idx) => {
                        const mood      = c.mood || c.moodRating || 0
                        const isTough   = mood <= 4 && (c.stress?.level || 0) >= 7
                        const isExpanded = expandedRow === c.id
                        const hasNote   = c.journalNote || c.physicalSymptoms?.length || c.couldHelp

                        return (
                          <React.Fragment key={c.id || idx}>
                            <tr
                              style={{ background: rowTint(mood), borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: hasNote ? 'pointer' : 'default' }}
                              onClick={() => hasNote && setExpandedRow(isExpanded ? null : c.id)}
                            >
                              <td style={{ padding: '0.55rem 0.75rem', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {hasNote && (isExpanded ? <ChevronDown size={12} color="#94a3b8" /> : <ChevronRight size={12} color="#94a3b8" />)}
                                  {isTough && <span title="Tough day" style={{ fontSize: '0.65rem' }}>⚠️</span>}
                                  {new Date(c.timestamp).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                                  {' '}
                                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    {new Date(c.timestamp).toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit' })}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: moodColor(mood) }}>{mood}/10</td>
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: c.energy ? moodColor(c.energy) : '#475569' }}>{c.energy ? `${c.energy}/10` : '—'}</td>
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: c.stress?.level ? stressColor(c.stress.level) : '#475569' }}>{c.stress?.level ? `${c.stress.level}/10` : '—'}</td>
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: c.sleep?.hours ? sleepColor(c.sleep.hours) : '#475569' }}>{c.sleep?.hours ? `${c.sleep.hours}h` : '—'}</td>
                              <td style={{ padding: '0.55rem 0.75rem', color: '#cbd5e1', textTransform: 'capitalize' }}>{c.socialInteraction || '—'}</td>
                              <td style={{ padding: '0.55rem 0.75rem', color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.triggers || '—'}</td>
                              <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center' }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setDeleteTarget(c.id) }}
                                  title="Delete entry"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>

                            {/* Expanded row */}
                            {isExpanded && (
                              <tr style={{ background: 'rgba(99,102,241,0.07)' }}>
                                <td colSpan={8} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                  {c.journalNote && (
                                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.83rem', color: '#c7d2fe', fontStyle: 'italic', lineHeight: 1.5 }}>
                                      ✍️ "{c.journalNote}"
                                    </p>
                                  )}
                                  {c.physicalSymptoms?.length > 0 && (
                                    <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                                      🩺 Physical: {c.physicalSymptoms.join(', ')}
                                    </p>
                                  )}
                                  {c.couldHelp && (
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                                      💡 What might help: {c.couldHelp}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {checkIns.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            No check-ins yet. Start with a daily check-in to see your history here.
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        title="Delete Check-In"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        cancelText="Cancel"
        showCancel
      >
        <div>
          <p style={{ color: '#1a1a1a', marginBottom: '0.75rem' }}>Are you sure you want to delete this check-in? This cannot be undone.</p>
          <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '6px', padding: '0.65rem 0.9rem', fontSize: '0.85rem', color: '#b91c1c' }}>
            The entry and all its data will be permanently removed.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CheckInHistory
