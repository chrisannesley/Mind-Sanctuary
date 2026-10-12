import React, { useState, useEffect } from 'react'
import { getCheckIns } from '../utils/api'
import '../styles/SleepTracker.css'

function SleepTracker({ userId }) {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getCheckIns(userId)
      setCheckIns(res.data || [])
    } catch (error) {
      console.error('Error loading sleep data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter to time range, only check-ins that have sleep data
  const getFiltered = () => {
    const days = parseInt(timeRange)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return checkIns
      .filter(c => new Date(c.timestamp) >= cutoff && c.sleep?.hours !== undefined)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }

  const filtered = getFiltered()

  // ── Stats ──────────────────────────────────────────────────────
  const sleepHours  = filtered.map(c => c.sleep?.hours || 0)
  const avgSleep    = sleepHours.length
    ? (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1)
    : '–'
  const bestNight   = sleepHours.length ? Math.max(...sleepHours) : '–'
  const worstNight  = sleepHours.length ? Math.min(...sleepHours) : '–'
  const daysGoodSleepBasic = sleepHours.filter(h => h >= 7).length
  const pctGoodSleep  = sleepHours.length
    ? Math.round((daysGoodSleepBasic / sleepHours.length) * 100)
    : 0

  // Sleep quality counts
  const qualityCounts = filtered.reduce((acc, c) => {
    const q = c.sleep?.quality || 'unknown'
    acc[q] = (acc[q] || 0) + 1
    return acc
  }, {})

  // Sleep vs mood table — group by hours bucket
  const buckets = [
    { label: '< 5h',  min: 0,  max: 5  },
    { label: '5–6h',  min: 5,  max: 6  },
    { label: '6–7h',  min: 6,  max: 7  },
    { label: '7–8h',  min: 7,  max: 8  },
    { label: '8–9h',  min: 8,  max: 9  },
    { label: '9h+',   min: 9,  max: 99 },
  ]
  const sleepMoodBuckets = buckets.map(b => {
    const entries = filtered.filter(c => {
      const h = c.sleep?.hours || 0
      return h >= b.min && h < b.max
    })
    const avgMood = entries.length
      ? (entries.map(c => c.mood || 0).reduce((a, v) => a + v, 0) / entries.length).toFixed(1)
      : null
    return { ...b, count: entries.length, avgMood }
  })

  // Best sleep bucket for the current filtered range
  const bestBucket = sleepMoodBuckets
    .filter(b => b.avgMood !== null && b.count >= 2)
    .sort((a, b) => parseFloat(b.avgMood) - parseFloat(a.avgMood))[0] || null

  // Trend: compare first half vs second half
  const getTrend = () => {
    if (sleepHours.length < 4) return null
    const mid = Math.floor(sleepHours.length / 2)
    const first  = sleepHours.slice(0, mid).reduce((a, b) => a + b, 0) / mid
    const second = sleepHours.slice(mid).reduce((a, v) => a + v, 0) / (sleepHours.length - mid)
    const diff = second - first
    if (diff > 0.3)  return { label: 'Improving', icon: '↑', cls: 'trend-up',     diff: `+${diff.toFixed(1)}h` }
    if (diff < -0.3) return { label: 'Declining',  icon: '↓', cls: 'trend-down',   diff: `${diff.toFixed(1)}h` }
    return              { label: 'Stable',    icon: '→', cls: 'trend-stable', diff: '~0h' }
  }
  const trend = getTrend()

  // Quality colour
  const qualityColor = q =>
    q === 'excellent' ? '#10b981'
    : q === 'good'    ? '#3b82f6'
    : q === 'fair'    ? '#f59e0b'
    : '#ef4444'

  // Bar colour by hours
  const hoursColor = h =>
    h >= 8 ? '#10b981'
    : h >= 7 ? '#3b82f6'
    : h >= 6 ? '#f59e0b'
    : '#ef4444'

  // ── Personalised sleep target ─────────────────────────────────
  // Uses ALL check-ins with sleep data (not just the filtered view)
  const allSleepCheckIns = checkIns.filter(c => c.sleep?.hours && c.mood)
  const hasEnoughData = allSleepCheckIns.length >= 60

  // Composite wellness: mood + energy + inverted stress (uses whatever is available per entry)
  const compositeWellness = (c) => {
    const vals = []
    if (c.mood)          vals.push(c.mood)
    if (c.energy)        vals.push(c.energy)
    if (c.stress?.level) vals.push(10 - c.stress.level)
    return vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : null
  }

  // After 60 days: find the average sleep duration on the user's top-25% wellness days
  // That average becomes their personal target — genuinely derived from their own data
  let targetMin = 8
  let targetMax = 9
  let personalTargetHours = null

  if (hasEnoughData) {
    const scored = allSleepCheckIns
      .map(c => ({ hours: c.sleep.hours, wellness: compositeWellness(c) }))
      .filter(c => c.wellness !== null)
      .sort((a, b) => b.wellness - a.wellness)

    const topCount = Math.max(5, Math.floor(scored.length * 0.25))
    const topDays  = scored.slice(0, topCount)
    const rawTarget = topDays.reduce((a, c) => a + c.hours, 0) / topDays.length

    // Round to nearest 0.5h and clamp to a sensible range
    personalTargetHours = Math.round(rawTarget * 2) / 2
    personalTargetHours = Math.max(6, Math.min(10, personalTargetHours))

    targetMin = Math.max(5.5, personalTargetHours - 0.5)
    targetMax = personalTargetHours + 0.5
  }

  const remaining = Math.max(0, 60 - allSleepCheckIns.length)
  const targetLabel = hasEnoughData && personalTargetHours
    ? `Your personal target: ~${personalTargetHours}h (avg sleep on your best wellness days)`
    : `Standard target: 8–9h · ${remaining > 0 ? `${remaining} more check-ins to personalise` : 'calculating your personal target…'}`

  // Dynamic position for the target band on the bar chart (bars span 0–10h, chart has padding-bottom: 2rem)
  const targetBandStyle = {
    bottom: `calc(2rem + ${(targetMin / 10) * 100}%)`,
    height: `${((targetMax - targetMin) / 10) * 100}%`,
  }

  // Sleep debt: hours below personal/default target, last 7 nights
  const last7 = filtered.slice(-7)
  const sleepDebt = last7.length
    ? last7.reduce((acc, c) => acc + Math.max(0, targetMin - (c.sleep?.hours || 0)), 0).toFixed(1)
    : null

  // % of nights meeting target
  const daysGoodSleep = sleepHours.filter(h => h >= targetMin && h <= targetMax + 1).length

  // Chart data — last 14
  const chartData = filtered.slice(-14).map(c => ({
    date:    new Date(c.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    hours:   c.sleep?.hours || 0,
    quality: c.sleep?.quality || 'unknown',
    mood:    c.mood || 0,
  }))

  if (loading) {
    return (
      <div className="sleep-container">
        <div className="sleep-loading">Loading your sleep data...</div>
      </div>
    )
  }

  return (
    <div className="sleep-container">

      {/* Header */}
      <div className="sleep-header">
        <div>
          <h1>🌙 Sleep Tracker</h1>
          <p className="sleep-subtitle">Your sleep patterns from daily check-ins</p>
        </div>
        <div className="sleep-range-picker">
          {['7', '14', '30', '90'].map(d => (
            <button
              key={d}
              className={`range-btn ${timeRange === d ? 'active' : ''}`}
              onClick={() => setTimeRange(d)}
            >
              {d === '90' ? '3M' : `${d}D`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sleep-empty">
          <p>🌙 No sleep data in this time range yet.</p>
          <p>Complete your daily check-ins to start tracking sleep patterns.</p>
        </div>
      ) : (
        <>
          {/* ── Summary Cards ── */}
          <div className="sleep-summary">
            <div className="sleep-stat-card">
              <div className="sleep-stat-value" style={{ color: '#6366f1' }}>{avgSleep}h</div>
              <div className="sleep-stat-label">Avg / Night</div>
              {trend && (
                <div className={`sleep-trend ${trend.cls}`}>
                  {trend.icon} {trend.label}
                </div>
              )}
            </div>
            <div className="sleep-stat-card">
              <div className="sleep-stat-value" style={{ color: '#10b981' }}>{bestNight}h</div>
              <div className="sleep-stat-label">Best Night</div>
            </div>
            <div className="sleep-stat-card">
              <div className="sleep-stat-value" style={{ color: '#ef4444' }}>{worstNight}h</div>
              <div className="sleep-stat-label">Worst Night</div>
            </div>
            <div className="sleep-stat-card">
              <div className="sleep-stat-value" style={{ color: '#3b82f6' }}>{pctGoodSleep}%</div>
              <div className="sleep-stat-label">Nights in target</div>
            </div>
            {sleepDebt !== null && (
              <div className="sleep-stat-card">
                <div className="sleep-stat-value" style={{ color: parseFloat(sleepDebt) > 5 ? '#ef4444' : parseFloat(sleepDebt) > 2 ? '#f59e0b' : '#10b981' }}>
                  {sleepDebt}h
                </div>
                <div className="sleep-stat-label">Sleep Debt (7 days)</div>
              </div>
            )}
          </div>

          {/* Target explanation */}
          <div style={{ fontSize: '0.78rem', color: hasEnoughData ? '#10b981' : '#94a3b8', marginBottom: '1rem', padding: '0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{hasEnoughData ? '🎯' : '📊'}</span>
            <span>{targetLabel}</span>
          </div>

          {/* ── Sleep hours bar chart ── */}
          <div className="sleep-card">
            <h2>😴 Sleep Hours</h2>
            <p className="sleep-chart-sub">Last {Math.min(14, filtered.length)} check-ins. Target: {targetMin}–{targetMax}h</p>

            {/* Target line labels */}
            <div className="sleep-chart-wrap">
              <div className="sleep-target-labels">
                <span style={{ bottom: '90%' }}>9h</span>
                <span style={{ bottom: '70%' }}>7h</span>
                <span style={{ bottom: '50%' }}>5h</span>
                <span style={{ bottom: '0%'  }}>0h</span>
              </div>
              <div className="sleep-bar-chart">
                {/* Target band — position driven by personal/default target */}
                <div className="sleep-target-band" style={targetBandStyle} />

                {chartData.map((d, i) => (
                  <div key={i} className="sleep-bar-col">
                    <div className="sleep-bar-value">{d.hours}h</div>
                    <div className="sleep-bar-wrap">
                      <div
                        className="sleep-bar"
                        style={{
                          height: `${(d.hours / 10) * 100}%`,
                          backgroundColor: hoursColor(d.hours),
                        }}
                        title={`${d.date}: ${d.hours}h (${d.quality})`}
                      />
                    </div>
                    <div className="sleep-bar-label">{d.date}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sleep-chart-legend">
              <span style={{ color: '#10b981' }}>■ 8h+</span>
              <span style={{ color: '#3b82f6' }}>■ 7–8h</span>
              <span style={{ color: '#f59e0b' }}>■ 6–7h</span>
              <span style={{ color: '#ef4444' }}>■ Under 6h</span>
              <span className="legend-band">■ Target zone {targetMin}–{targetMax}h</span>
            </div>
          </div>

          {/* ── Sleep Quality breakdown ── */}
          <div className="sleep-two-col">
            <div className="sleep-card">
              <h2>⭐ Sleep Quality</h2>
              <p className="sleep-chart-sub">{filtered.length} nights recorded</p>
              {Object.keys(qualityCounts).length === 0 ? (
                <p className="sleep-no-data">No quality data yet</p>
              ) : (
                <div className="quality-list">
                  {Object.entries(qualityCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([q, count]) => {
                      const pct = Math.round((count / filtered.length) * 100)
                      return (
                        <div key={q} className="quality-row">
                          <div className="quality-dot" style={{ backgroundColor: qualityColor(q) }} />
                          <div className="quality-label">{q}</div>
                          <div className="quality-bar-wrap">
                            <div className="quality-bar" style={{ width: `${pct}%`, backgroundColor: qualityColor(q) }} />
                          </div>
                          <div className="quality-pct">{pct}%</div>
                          <div className="quality-count">({count})</div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* ── Sleep vs Mood ── */}
            <div className="sleep-card">
              <h2>😊 Sleep vs Mood</h2>
              <p className="sleep-chart-sub">Average mood per sleep duration</p>
              <div className="svm-list">
                {sleepMoodBuckets.map((b, i) => (
                  <div key={i} className="svm-row">
                    <div className="svm-label">{b.label}</div>
                    <div className="svm-bar-wrap">
                      {b.avgMood !== null ? (
                        <div
                          className="svm-bar"
                          style={{
                            width: `${(parseFloat(b.avgMood) / 10) * 100}%`,
                            backgroundColor: hoursColor(b.min + 0.5),
                          }}
                        />
                      ) : (
                        <div className="svm-bar-none">no data</div>
                      )}
                    </div>
                    <div className="svm-value">
                      {b.avgMood !== null ? `${b.avgMood}/10` : '–'}
                    </div>
                    <div className="svm-count">{b.count > 0 ? `${b.count}×` : ''}</div>
                  </div>
                ))}
              </div>
              {bestBucket && (
                <div className="sleep-insight-box">
                  💡 Your mood scores highest with <strong>{bestBucket.label}</strong> of sleep (avg {bestBucket.avgMood}/10).
                </div>
              )}
            </div>
          </div>

          {/* ── Recent nights log ── */}
          <div className="sleep-card">
            <h2>📋 Recent Nights</h2>
            <p className="sleep-chart-sub">Your last {Math.min(10, filtered.length)} recorded nights</p>
            <div className="nights-table">
              <div className="nights-header">
                <span>Date</span>
                <span>Hours</span>
                <span>Quality</span>
                <span>Mood</span>
                <span>Assessment</span>
              </div>
              {filtered.slice(-10).reverse().map((c, i) => {
                const h = c.sleep?.hours || 0
                const q = c.sleep?.quality || '–'
                const assessment =
                  h >= 8 && (q === 'good' || q === 'excellent') ? { label: 'Great', color: '#10b981' }
                  : h >= 7 ? { label: 'Good', color: '#3b82f6' }
                  : h >= 6 ? { label: 'Fair', color: '#f59e0b' }
                  : { label: 'Poor', color: '#ef4444' }
                return (
                  <div key={i} className="nights-row">
                    <span>{new Date(c.timestamp).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span style={{ color: hoursColor(h), fontWeight: '600' }}>{h}h</span>
                    <span style={{ textTransform: 'capitalize', color: qualityColor(q) }}>{q}</span>
                    <span>{c.mood || '–'}/10</span>
                    <span>
                      <span className="assessment-badge" style={{ backgroundColor: assessment.color }}>
                        {assessment.label}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Tips based on data ── */}
          <div className="sleep-card sleep-tips">
            <h2>💡 Personalised Sleep Tips</h2>
            <div className="tips-grid">
              {parseFloat(avgSleep) < 6 && (
                <div className="tip-item tip-red">
                  <span className="tip-icon">⚠️</span>
                  <div>
                    <strong>Sleep deprivation detected</strong>
                    <p>You're averaging under 6 hours. This significantly affects mood, memory, and mental health. Prioritise getting to bed 30 minutes earlier each night.</p>
                  </div>
                </div>
              )}
              {parseFloat(avgSleep) >= 6 && parseFloat(avgSleep) < targetMin && (
                <div className="tip-item tip-amber">
                  <span className="tip-icon">🟡</span>
                  <div>
                    <strong>Slightly below your target</strong>
                    <p>You're averaging {avgSleep}h but your target is {targetMin}h. Try moving your bedtime 20–30 minutes earlier.</p>
                  </div>
                </div>
              )}
              {parseFloat(avgSleep) >= targetMin && (
                <div className="tip-item tip-green">
                  <span className="tip-icon">✅</span>
                  <div>
                    <strong>Meeting your sleep target</strong>
                    <p>You're averaging {avgSleep}h — right at or above your {targetMin}h target. Keep the consistency going, even on weekends.</p>
                  </div>
                </div>
              )}
              {qualityCounts['poor'] > (filtered.length * 0.3) && (
                <div className="tip-item tip-amber">
                  <span className="tip-icon">😟</span>
                  <div>
                    <strong>Frequent poor quality sleep</strong>
                    <p>Over 30% of your nights are poor quality. Try reducing screens 1 hour before bed, keeping the room cool and dark.</p>
                  </div>
                </div>
              )}
              {parseFloat(sleepDebt) > 7 && (
                <div className="tip-item tip-red">
                  <span className="tip-icon">🔋</span>
                  <div>
                    <strong>{sleepDebt}h sleep debt this week</strong>
                    <p>You've built up a notable sleep debt. You can't fully "catch up" but a couple of longer nights will help recovery.</p>
                  </div>
                </div>
              )}
              <div className="tip-item tip-blue">
                <span className="tip-icon">🕙</span>
                <div>
                  <strong>Consistency matters</strong>
                  <p>Going to bed and waking at the same time every day — including weekends — is the single most impactful sleep habit you can build.</p>
                </div>
              </div>
              <div className="tip-item tip-blue">
                <span className="tip-icon">📵</span>
                <div>
                  <strong>Wind-down routine</strong>
                  <p>A 30-minute wind-down with no screens, dim lights, and calm activity (reading, stretching) signals your brain it's time to sleep.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SleepTracker
