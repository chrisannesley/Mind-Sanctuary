import React, { useState, useEffect, useMemo } from 'react'
import { getCheckIns } from '../utils/api'
import '../styles/WellnessTrends.css'

// ── SVG Line Chart ────────────────────────────────────────────────
function LineChart({ data, keys, colors, height = 160, yMin = 0, yMax = 10, labels, maKey, maColor }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
      Not enough data yet
    </div>
  )

  const W = 600, H = height
  const padL = 28, padR = 8, padT = 10, padB = 28

  const xScale = (i) => padL + (i / (data.length - 1)) * (W - padL - padR)
  const yScale = (v) => padT + ((yMax - v) / (yMax - yMin)) * (H - padT - padB)

  const yGridLines = [0, 2, 4, 6, 8, 10].filter(v => v >= yMin && v <= yMax)

  // X-axis date labels — show ~5 evenly spaced
  const xLabelIndices = [0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1]
    .filter((v, i, a) => a.indexOf(v) === i)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      {/* Grid lines */}
      {yGridLines.map(v => (
        <g key={v}>
          <line x1={padL} y1={yScale(v)} x2={W - padR} y2={yScale(v)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x={padL - 4} y={yScale(v) + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">{v}</text>
        </g>
      ))}

      {/* X-axis date labels */}
      {xLabelIndices.map(i => (
        <text key={i} x={xScale(i)} y={H - 2} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
          {data[i]?.label || ''}
        </text>
      ))}

      {/* Lines per key */}
      {keys.map((key, ki) => {
        const points = data.map((d, i) => {
          const v = d[key]
          if (v === null || v === undefined) return null
          return `${xScale(i)},${yScale(v)}`
        }).filter(Boolean)

        if (points.length < 2) return null

        let path = ''
        data.forEach((d, i) => {
          const v = d[key]
          if (v === null || v === undefined) return
          const x = xScale(i), y = yScale(v)
          path += path === '' ? `M${x},${y}` : ` L${x},${y}`
        })

        return (
          <g key={key}>
            <path d={path} fill="none" stroke={colors[ki]} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((d, i) => {
              const v = d[key]
              if (v === null || v === undefined) return null
              return <circle key={i} cx={xScale(i)} cy={yScale(v)} r="2" fill={colors[ki]} />
            })}
          </g>
        )
      })}

      {/* Moving average line — dashed, only in single-line mode */}
      {maKey && maColor && (() => {
        let maPath = ''
        data.forEach((d, i) => {
          const v = d[maKey]
          if (v === null || v === undefined) return
          const x = xScale(i), y = yScale(v)
          maPath += maPath === '' ? `M${x},${y}` : ` L${x},${y}`
        })
        if (!maPath) return null
        return (
          <path
            d={maPath}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.5"
            strokeDasharray="6 3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })()}
    </svg>
  )
}

// ── Insight Card ──────────────────────────────────────────────────
function InsightCard({ icon, title, value, detail, color = '#3b82f6', type = 'neutral' }) {
  const bg = type === 'positive' ? 'rgba(16,185,129,0.1)' : type === 'warning' ? 'rgba(245,158,11,0.1)' : type === 'alert' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)'
  const border = type === 'positive' ? 'rgba(16,185,129,0.25)' : type === 'warning' ? 'rgba(245,158,11,0.25)' : type === 'alert' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem', fontWeight: 700 }}>{title}</div>
          {value && <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{value}</div>}
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>{detail}</div>
        </div>
      </div>
    </div>
  )
}

// ── Chart Toggle Component ────────────────────────────────────────
const CHART_LINES = [
  { key: 'mood',   label: 'Mood',   color: '#f59e0b' },
  { key: 'energy', label: 'Energy', color: '#10b981' },
  { key: 'stress', label: 'Stress', color: '#ef4444' },
]

function ChartToggle({ data }) {
  const [active, setActive] = useState({ mood: true, energy: true, stress: true })

  const toggle = (key) => setActive(prev => {
    const next = { ...prev, [key]: !prev[key] }
    if (!Object.values(next).some(Boolean)) return prev
    return next
  })

  const activeLines  = CHART_LINES.filter(l => active[l.key])
  const activeKeys   = activeLines.map(l => l.key)
  const activeColors = activeLines.map(l => l.color)
  const singleKey    = activeKeys.length === 1 ? activeKeys[0] : null
  const singleColor  = singleKey ? activeColors[0] : null

  // 7-day moving average for single-line mode
  const maData = singleKey ? data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 6), i + 1).map(p => p[singleKey]).filter(v => v != null)
    return { ...d, ma: window.length >= 3 ? window.reduce((a, b) => a + b, 0) / window.length : null }
  }) : null

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {CHART_LINES.map(l => (
          <button
            key={l.key}
            onClick={() => toggle(l.key)}
            style={{
              padding: '0.3rem 0.85rem',
              borderRadius: '20px',
              border: `2px solid ${active[l.key] ? l.color : 'rgba(255,255,255,0.1)'}`,
              background: active[l.key] ? `${l.color}22` : 'transparent',
              color: active[l.key] ? l.color : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {l.label}
          </button>
        ))}
        {singleKey && (
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', alignSelf: 'center', marginLeft: '0.25rem' }}>
            — — 7-day trend
          </span>
        )}
      </div>
      <LineChart
        data={maData || data}
        keys={activeKeys}
        colors={activeColors}
        height={180}
        maKey={singleKey ? 'ma' : null}
        maColor={singleColor ? singleColor + '66' : null}
      />
    </>
  )
}

// ── Main Component ────────────────────────────────────────────────
function WellnessTrends({ userId }) {
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('90')

  useEffect(() => { loadData() }, [userId])

  const loadData = async () => {
    try {
      const res = await getCheckIns(userId)
      setCheckIns(res.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const filtered = useMemo(() => {
    const days = parseInt(timeRange)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return checkIns
      .filter(c => new Date(c.timestamp) >= cutoff && (c.mood || c.moodRating))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  }, [checkIns, timeRange])

  // ── Derived analytics ─────────────────────────────────────────
  const analytics = useMemo(() => {
    if (filtered.length < 3) return null

    const getMood = c => c.mood || c.moodRating || 0
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length

    const moods    = filtered.map(getMood)
    const stresses = filtered.map(c => c.stress?.level).filter(Boolean)
    const sleeps   = filtered.map(c => c.sleep?.hours).filter(Boolean)
    const energies = filtered.map(c => c.energy).filter(Boolean)

    const avgMood    = avg(moods)
    const avgStress  = avg(stresses)
    const avgSleep   = avg(sleeps)
    const avgEnergy  = avg(energies)

    // Trend: first third vs last third
    const third = Math.floor(filtered.length / 3)
    const firstMood = avg(moods.slice(0, third))
    const lastMood  = avg(moods.slice(-third))
    const moodChange = lastMood - firstMood

    // Day of week analysis
    const byDay = Array(7).fill(null).map(() => [])
    filtered.forEach(c => { byDay[new Date(c.timestamp).getDay()].push(getMood(c)) })
    const dayAvgs = byDay.map(d => d.length ? avg(d) : null)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const bestDayIdx  = dayAvgs.reduce((bi, v, i) => (v !== null && (dayAvgs[bi] === null || v > dayAvgs[bi])) ? i : bi, 0)
    const worstDayIdx = dayAvgs.reduce((bi, v, i) => (v !== null && (dayAvgs[bi] === null || v < dayAvgs[bi])) ? i : bi, 0)

    // Sleep vs mood correlation
    const highSleepMoods = filtered.filter(c => (c.sleep?.hours || 0) >= 7).map(getMood)
    const lowSleepMoods  = filtered.filter(c => (c.sleep?.hours || 0) < 6 && c.sleep?.hours).map(getMood)
    const highSleepAvg   = highSleepMoods.length ? avg(highSleepMoods) : null
    const lowSleepAvg    = lowSleepMoods.length  ? avg(lowSleepMoods)  : null

    // Stress vs mood
    const highStressMoods = filtered.filter(c => (c.stress?.level || 0) >= 7).map(getMood)
    const lowStressMoods  = filtered.filter(c => (c.stress?.level || 0) <= 3 && c.stress?.level).map(getMood)
    const highStressAvg   = highStressMoods.length ? avg(highStressMoods) : null
    const lowStressAvg    = lowStressMoods.length  ? avg(lowStressMoods)  : null

    // Trigger analysis
    const triggerMap = {}
    filtered.forEach(c => {
      const t = c.triggers?.trim()
      if (t) {
        if (!triggerMap[t]) triggerMap[t] = { count: 0, moods: [] }
        triggerMap[t].count++
        triggerMap[t].moods.push(getMood(c))
      }
    })
    const topTriggers = Object.entries(triggerMap)
      .map(([name, data]) => ({ name, count: data.count, avgMood: avg(data.moods) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Consecutive low mood days (3+ in a row below 4)
    let maxLowStreak = 0, currentLowStreak = 0
    moods.forEach(m => { if (m <= 4) { currentLowStreak++; maxLowStreak = Math.max(maxLowStreak, currentLowStreak) } else currentLowStreak = 0 })

    // Social interaction vs mood
    const socialMap = {}
    filtered.forEach(c => {
      const s = c.socialInteraction
      if (s) { if (!socialMap[s]) socialMap[s] = []; socialMap[s].push(getMood(c)) }
    })
    const socialAvgs = Object.entries(socialMap).map(([k, v]) => ({ type: k, avg: avg(v), count: v.length })).sort((a, b) => b.avg - a.avg)

    // Chart data — daily averages (group by date for cleaner line)
    const dateMap = {}
    filtered.forEach(c => {
      const d = new Date(c.timestamp).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      if (!dateMap[d]) dateMap[d] = { mood: [], stress: [], sleep: [], energy: [] }
      dateMap[d].mood.push(getMood(c))
      if (c.stress?.level) dateMap[d].stress.push(c.stress.level)
      if (c.sleep?.hours)  dateMap[d].sleep.push(c.sleep.hours)
      if (c.energy)        dateMap[d].energy.push(c.energy)
    })
    const chartData = Object.entries(dateMap).map(([label, vals]) => ({
      label,
      mood:   vals.mood.length   ? avg(vals.mood)   : null,
      stress: vals.stress.length ? avg(vals.stress) : null,
      sleep:  vals.sleep.length  ? avg(vals.sleep)  : null,
      energy: vals.energy.length ? avg(vals.energy) : null,
    }))

    return {
      avgMood, avgStress, avgSleep, avgEnergy,
      moodChange, firstMood, lastMood,
      bestDayIdx, worstDayIdx, dayNames, dayAvgs,
      highSleepAvg, lowSleepAvg,
      highStressAvg, lowStressAvg,
      topTriggers, maxLowStreak, socialAvgs,
      chartData, total: filtered.length
    }
  }, [filtered])

  if (loading) return <div className="wt-container"><div className="wt-loading">Loading your insights...</div></div>

  return (
    <div className="wt-container">
      <div className="wt-header">
        <div>
          <h1>📈 Wellness Insights</h1>
          <p className="wt-subtitle">Your personal patterns — what the data says about you</p>
        </div>
        <div className="wt-range">
          {[['30','30 days'],['60','60 days'],['90','90 days']].map(([v,l]) => (
            <button key={v} className={`wt-range-btn ${timeRange === v ? 'active' : ''}`} onClick={() => setTimeRange(v)}>{l}</button>
          ))}
        </div>
      </div>

      {!analytics || filtered.length < 3 ? (
        <div className="wt-empty"><p>Not enough check-ins in this period.</p><p>Keep checking in daily to unlock your insights.</p></div>
      ) : (
        <div className="wt-body">

          {/* ── Key personal insights — FIRST ── */}
          <h2 className="wt-section-title">🔍 What Your Data Is Telling You</h2>
          <div className="wt-insights-grid">

            {/* Mood trend */}
            <InsightCard
              icon={analytics.moodChange > 0.5 ? '📈' : analytics.moodChange < -0.5 ? '📉' : '➡️'}
              title="Mood Trend"
              value={`${analytics.moodChange > 0 ? '+' : ''}${analytics.moodChange.toFixed(1)} points`}
              detail={
                analytics.moodChange > 0.5
                  ? `Your mood has improved by ${analytics.moodChange.toFixed(1)} points over this period. That's real progress worth acknowledging.`
                  : analytics.moodChange < -0.5
                  ? `Your mood has dipped by ${Math.abs(analytics.moodChange).toFixed(1)} points. Consider reaching out for support or reviewing your coping strategies.`
                  : `Your mood has been relatively stable over this period — averaging ${analytics.avgMood.toFixed(1)}/10.`
              }
              type={analytics.moodChange > 0.5 ? 'positive' : analytics.moodChange < -0.5 ? 'alert' : 'neutral'}
            />

            {/* Best/worst day */}
            <InsightCard
              icon="📅"
              title="Best & Worst Days"
              value={`${analytics.dayNames[analytics.bestDayIdx]} best · ${analytics.dayNames[analytics.worstDayIdx]} worst`}
              detail={`Your mood averages ${analytics.dayAvgs[analytics.bestDayIdx]?.toFixed(1)}/10 on ${analytics.dayNames[analytics.bestDayIdx]}s and ${analytics.dayAvgs[analytics.worstDayIdx]?.toFixed(1)}/10 on ${analytics.dayNames[analytics.worstDayIdx]}s. ${analytics.worstDayIdx === 1 || analytics.worstDayIdx === 2 ? 'The start of the work week is your hardest time.' : 'Consider what makes those days harder and plan support in advance.'}`}
              type="neutral"
            />

            {/* Sleep impact */}
            {analytics.highSleepAvg !== null && analytics.lowSleepAvg !== null && (
              <InsightCard
                icon="🌙"
                title="Sleep Impact on Mood"
                value={`+${(analytics.highSleepAvg - analytics.lowSleepAvg).toFixed(1)} mood points`}
                detail={`On nights with 7+ hours sleep your mood averages ${analytics.highSleepAvg.toFixed(1)}/10. On nights under 6 hours it drops to ${analytics.lowSleepAvg.toFixed(1)}/10. Sleep is having a measurable impact on how you feel.`}
                type={(analytics.highSleepAvg - analytics.lowSleepAvg) > 1.5 ? 'warning' : 'neutral'}
              />
            )}

            {/* Stress impact */}
            {analytics.highStressAvg !== null && analytics.lowStressAvg !== null && (
              <InsightCard
                icon="😤"
                title="Stress Impact on Mood"
                value={`${(analytics.lowStressAvg - analytics.highStressAvg).toFixed(1)} point difference`}
                detail={`High stress days (7+/10) your mood averages just ${analytics.highStressAvg.toFixed(1)}/10. On low stress days it's ${analytics.lowStressAvg.toFixed(1)}/10 — a difference of ${(analytics.lowStressAvg - analytics.highStressAvg).toFixed(1)} points. Managing stress is directly protecting your mood.`}
                type={(analytics.lowStressAvg - analytics.highStressAvg) > 2 ? 'warning' : 'neutral'}
              />
            )}

            {/* Low streak warning */}
            {analytics.maxLowStreak >= 3 && (
              <InsightCard
                icon="⚠️"
                title="Extended Low Periods"
                value={`${analytics.maxLowStreak} consecutive days below 4/10`}
                detail={`You've had a run of ${analytics.maxLowStreak} consecutive low mood days in this period. These patterns are worth discussing with a mental health professional.`}
                type="alert"
              />
            )}

            {/* Social impact */}
            {analytics.socialAvgs.length >= 2 && (
              <InsightCard
                icon="🤝"
                title="Social Life & Mood"
                value={`${analytics.socialAvgs[0].type} days best`}
                detail={`Your mood is highest on days with ${analytics.socialAvgs[0].type} (avg ${analytics.socialAvgs[0].avg.toFixed(1)}/10) and lowest on ${analytics.socialAvgs[analytics.socialAvgs.length-1].type} days (avg ${analytics.socialAvgs[analytics.socialAvgs.length-1].avg.toFixed(1)}/10). ${analytics.socialAvgs[0].type === 'alone' ? 'You seem to recharge well on your own.' : `Spending time with ${analytics.socialAvgs[0].type} genuinely lifts your mood.`}`}
                type="positive"
              />
            )}
          </div>

          {/* ── Mood over time ── */}
          <div className="wt-card">
            <h2>Mood, Energy &amp; Stress Over Time</h2>
            <p className="wt-card-sub">Daily averages — {analytics.total} check-ins</p>
            <ChartToggle data={analytics.chartData} />
          </div>

          {/* ── Sleep line ── */}
          <div className="wt-card">
            <h2>Sleep Hours Over Time</h2>
            <p className="wt-card-sub">Target zone: 7–9h per night</p>
            <LineChart
              data={analytics.chartData}
              keys={['sleep']}
              colors={['#6366f1']}
              height={140}
              yMax={12}
            />
            <div className="wt-legend"><span style={{ color: '#6366f1' }}>■ Sleep hours</span><span style={{ color: 'rgba(99,102,241,0.4)' }}>— Target 7–9h</span></div>
          </div>

          {/* ── Trigger analysis ── */}
          {analytics.topTriggers.length > 0 && (
            <>
              <h2 className="wt-section-title">🎯 Your Triggers</h2>
              <div className="wt-card">
                <p className="wt-card-sub">What you recorded on your lowest days — and how mood compares on trigger vs non-trigger days</p>
                <div className="wt-triggers">
                  {analytics.topTriggers.map((t, i) => {
                    const overallAvg = analytics.avgMood
                    const diff = t.avgMood - overallAvg
                    return (
                      <div key={i} className="wt-trigger-row">
                        <div className="wt-trigger-name">{t.name}</div>
                        <div className="wt-trigger-bar-wrap">
                          <div className="wt-trigger-bar" style={{
                            width: `${(t.avgMood / 10) * 100}%`,
                            backgroundColor: t.avgMood < 4 ? '#ef4444' : t.avgMood < 6 ? '#f59e0b' : '#10b981'
                          }} />
                        </div>
                        <div className="wt-trigger-stats">
                          <span className="wt-trigger-mood">{t.avgMood.toFixed(1)}/10</span>
                          <span className={`wt-trigger-diff ${diff < 0 ? 'neg' : 'pos'}`}>
                            {diff < 0 ? `${diff.toFixed(1)}` : `+${diff.toFixed(1)}`} vs avg
                          </span>
                          <span className="wt-trigger-count">{t.count}×</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="wt-card-note">The bar shows average mood on days when this trigger was recorded. Items with negative variance vs your average are your most impactful stressors.</p>
              </div>
            </>
          )}

          {/* ── Day of week heatmap ── */}
          <h2 className="wt-section-title">📅 Day of Week Patterns</h2>
          <div className="wt-card">
            <p className="wt-card-sub">Average mood by day of the week over {timeRange} days</p>
            <div className="wt-dow">
              {analytics.dayNames.map((name, i) => {
                const val = analytics.dayAvgs[i]
                if (val === null) return (
                  <div key={i} className="wt-dow-col">
                    <div className="wt-dow-bar-wrap"><div className="wt-dow-bar" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }} /></div>
                    <div className="wt-dow-val">–</div>
                    <div className="wt-dow-label">{name}</div>
                  </div>
                )
                const pct = (val / 10) * 100
                const col = val >= 7 ? '#10b981' : val >= 5 ? '#f59e0b' : '#ef4444'
                const isBest = i === analytics.bestDayIdx
                const isWorst = i === analytics.worstDayIdx
                return (
                  <div key={i} className={`wt-dow-col ${isBest ? 'best' : isWorst ? 'worst' : ''}`}>
                    {isBest  && <div className="wt-dow-badge best-badge">best</div>}
                    {isWorst && <div className="wt-dow-badge worst-badge">hardest</div>}
                    {!isBest && !isWorst && <div style={{ height: '16px' }} />}
                    <div className="wt-dow-val" style={{ color: col }}>{val.toFixed(1)}</div>
                    <div className="wt-dow-bar-wrap">
                      <div className="wt-dow-bar" style={{ height: `${Math.max(pct, 5)}%`, backgroundColor: col }} />
                    </div>
                    <div className="wt-dow-label">{name}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Summary stats ── */}
          <div className="wt-stats-row">
            {[
              { label: 'Avg Mood',   val: analytics.avgMood.toFixed(1),   unit: '/10', color: '#f59e0b' },
              { label: 'Avg Energy', val: analytics.avgEnergy.toFixed(1), unit: '/10', color: '#10b981' },
              { label: 'Avg Sleep',  val: analytics.avgSleep.toFixed(1),  unit: 'h',   color: '#6366f1' },
              { label: 'Avg Stress', val: analytics.avgStress.toFixed(1), unit: '/10', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="wt-stat">
                <div className="wt-stat-val" style={{ color: s.color }}>{s.val}<span className="wt-stat-unit">{s.unit}</span></div>
                <div className="wt-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}

export default WellnessTrends
