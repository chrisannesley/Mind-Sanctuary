import React, { useState, useEffect, useRef } from 'react'

const MOOD_COLORS = [
  '#374151', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
]

const MA_WINDOW = 7

/**
 * MovingAvgChart — shared chart for mood + 7-day moving average.
 *
 * Props:
 *   checkIns  — raw check-in array (unsorted, unfiltered is fine)
 *   range     — days to show (30 | 60 | 90), if omitted the component manages its own state
 *   setRange  — optional setter (only needed when range is controlled externally)
 *   title     — optional heading string (defaults to "Mood Trend & 7-Day Moving Average")
 */
export default function MovingAvgChart({ checkIns = [], range: rangeProp, setRange: setRangeProp, title }) {
  const [internalRange, setInternalRange] = useState(30)
  const range    = rangeProp    ?? internalRange
  const setRange = setRangeProp ?? setInternalRange

  const containerRef = useRef(null)
  const [width, setWidth] = useState(700)

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      if (entries[0]) setWidth(entries[0].contentRect.width)
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Build dayMap from raw check-ins
  const dayMap = {}
  checkIns.forEach(c => {
    const d = new Date(c.timestamp)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (!dayMap[key]) dayMap[key] = { moods: [], energies: [] }
    if (c.mood)   dayMap[key].moods.push(c.mood)
    if (c.energy) dayMap[key].energies.push(c.energy)
  })

  const getDayData = (key) => {
    const d = dayMap[key]
    if (!d || !d.moods.length) return null
    return {
      avgMood:   Math.round(d.moods.reduce((a,b) => a+b, 0) / d.moods.length),
      avgEnergy: d.energies.length ? Math.round(d.energies.reduce((a,b) => a+b, 0) / d.energies.length) : null,
    }
  }

  // Build day-by-day series
  const now = new Date()
  const series = []
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    const data = getDayData(key)
    series.push({ key, date: d, mood: data?.avgMood ?? null })
  }

  // 7-day moving average (looking back)
  const withMA = series.map((pt, idx) => {
    const window = series.slice(Math.max(0, idx - MA_WINDOW + 1), idx + 1).filter(p => p.mood !== null)
    const ma = window.length >= 2 ? window.reduce((a, p) => a + p.mood, 0) / window.length : null
    return { ...pt, ma }
  })

  // SVG layout
  const PAD    = { top: 20, right: 20, bottom: 40, left: 36 }
  const h      = 200
  const chartW = Math.max(1, width - PAD.left - PAD.right)
  const chartH = h - PAD.top - PAD.bottom
  const Y_MAX  = 10

  const xScale = i => (i / Math.max(range - 1, 1)) * chartW
  const yScale = v => chartH - (v / Y_MAX) * chartH

  // MA polyline — break at gaps
  const maSegments = []
  let seg = []
  withMA.forEach((pt, i) => {
    if (pt.ma !== null) {
      seg.push(`${xScale(i).toFixed(1)},${yScale(pt.ma).toFixed(1)}`)
    } else {
      if (seg.length >= 2) maSegments.push(seg.join(' '))
      seg = []
    }
  })
  if (seg.length >= 2) maSegments.push(seg.join(' '))

  // X-axis labels — ~6 evenly spaced
  const labelStep = Math.max(1, Math.floor(range / 6))
  const xLabels   = withMA.filter((_, i) => i % labelStep === 0 || i === range - 1)

  const hasData = series.some(p => p.mood !== null)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px',
      padding: '1.25rem 1.5rem 1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          📈 {title || `Mood Trend & ${MA_WINDOW}-Day Moving Average`}
        </h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[30, 60, 90].map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              background: range === r ? '#6366f1' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${range === r ? '#6366f1' : 'rgba(255,255,255,0.13)'}`,
              color: range === r ? '#fff' : '#94a3b8',
              padding: '0.3rem 0.7rem', borderRadius: '20px',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            }}>
              {r}D
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
        {!hasData ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0', fontSize: '0.9rem' }}>
            No check-in data in this period yet.
          </p>
        ) : (
          <svg viewBox={`0 0 ${width} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
            <g transform={`translate(${PAD.left},${PAD.top})`}>

              {/* Grid lines */}
              {[2, 4, 6, 8, 10].map(v => (
                <g key={v}>
                  <line x1={0} y1={yScale(v)} x2={chartW} y2={yScale(v)}
                    stroke="rgba(255,255,255,0.22)" strokeWidth={1}
                    strokeDasharray={v === 10 ? 'none' : '4 3'} />
                  <text x={-8} y={yScale(v)} fill="#cbd5e1" fontSize={11} fontWeight="600"
                    textAnchor="end" dominantBaseline="middle">{v}</text>
                </g>
              ))}

              {/* Daily mood dots */}
              {withMA.map((pt, i) => {
                if (pt.mood === null) return null
                return (
                  <circle key={pt.key}
                    cx={xScale(i)} cy={yScale(pt.mood)}
                    r={range > 60 ? 3 : 4}
                    fill={MOOD_COLORS[pt.mood] || '#64748b'}
                    opacity={0.9}
                  />
                )
              })}

              {/* MA line — break at gaps */}
              {maSegments.map((pts, i) => (
                <polyline key={i} points={pts}
                  fill="none" stroke="#a5b4fc" strokeWidth={2.5}
                  strokeLinejoin="round" strokeLinecap="round" />
              ))}

              {/* X-axis labels */}
              {xLabels.map((pt, i) => (
                <text key={i}
                  x={xScale(withMA.indexOf(pt))} y={chartH + 18}
                  fill="#cbd5e1" fontSize={11} fontWeight="600" textAnchor="middle">
                  {pt.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </text>
              ))}
            </g>
          </svg>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
          Daily mood
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ display: 'inline-block', width: 22, height: 3, background: '#a5b4fc', borderRadius: 2 }} />
          {MA_WINDOW}-day moving avg
        </span>
      </div>
    </div>
  )
}
