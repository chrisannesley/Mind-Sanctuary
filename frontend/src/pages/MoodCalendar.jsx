import React, { useState, useEffect } from 'react'
import { getCheckIns } from '../utils/api'
import MovingAvgChart from '../components/MovingAvgChart'
import '../styles/MoodCalendar.css'

const MOOD_COLORS = [
  '#374151', // 0 — no data
  '#ef4444', // 1
  '#f97316', // 2
  '#f59e0b', // 3
  '#eab308', // 4
  '#84cc16', // 5
  '#22c55e', // 6
  '#10b981', // 7
  '#14b8a6', // 8
  '#06b6d4', // 9
  '#3b82f6', // 10
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function MoodCalendar({ userId }) {
  const [checkIns,    setCheckIns]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [viewYear,    setViewYear]    = useState(new Date().getFullYear())
  const [viewMonth,   setViewMonth]   = useState(new Date().getMonth())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { loadData() }, [userId])

  const loadData = async () => {
    try {
      const res = await getCheckIns(userId)
      setCheckIns(res.data || [])
    } catch (e) {
      console.error('Error loading check-ins:', e)
    } finally {
      setLoading(false)
    }
  }

  // Build a map: "YYYY-MM-DD" -> { avgMood, avgEnergy, count, entries[] }
  const dayMap = {}
  checkIns.forEach(c => {
    const d = new Date(c.timestamp)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (!dayMap[key]) dayMap[key] = { moods: [], energies: [], entries: [] }
    if (c.mood)   dayMap[key].moods.push(c.mood)
    if (c.energy) dayMap[key].energies.push(c.energy)
    dayMap[key].entries.push(c)
  })

  // Aggregate
  const getDayData = (key) => {
    const d = dayMap[key]
    if (!d) return null
    const avgMood   = Math.round(d.moods.reduce((a,b)=>a+b,0) / d.moods.length)
    const avgEnergy = Math.round(d.energies.reduce((a,b)=>a+b,0) / (d.energies.length || 1))
    return { avgMood, avgEnergy, count: d.entries.length, entries: d.entries }
  }

  // Calendar grid for current month
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  // Stats for current month
  const monthKeys = []
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    monthKeys.push(key)
  }
  const monthData = monthKeys.map(k => getDayData(k)).filter(Boolean)
  const monthAvgMood   = monthData.length ? (monthData.map(d=>d.avgMood).reduce((a,b)=>a+b,0)/monthData.length).toFixed(1) : '–'
  const monthCheckIns  = monthData.reduce((a,d) => a + d.count, 0)
  const daysTracked    = monthData.length

  const [chartRange, setChartRange] = useState(30)

  if (loading) {
    return <div className="mcal-container"><div className="mcal-loading">Loading your mood calendar...</div></div>
  }

  return (
    <div className="mcal-container">

      {/* Header */}
      <div className="mcal-header">
        <div>
          <h1>📅 Mood Calendar</h1>
          <p className="mcal-subtitle">Every day you checked in, colour-coded by mood</p>
        </div>
      </div>

      <div className="mcal-body">

        {/* Month navigator */}
        <div className="mcal-nav">
          <button className="mcal-nav-btn" onClick={prevMonth}>‹</button>
          <h2 className="mcal-month-title">{MONTHS[viewMonth]} {viewYear}</h2>
          <button
            className="mcal-nav-btn"
            onClick={nextMonth}
            disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
          >›</button>
        </div>

        {/* Month stats */}
        <div className="mcal-stats">
          <div className="mcal-stat">
            <span className="mcal-stat-val">{daysTracked}</span>
            <span className="mcal-stat-label">Days tracked</span>
          </div>
          <div className="mcal-stat">
            <span className="mcal-stat-val">{monthCheckIns}</span>
            <span className="mcal-stat-label">Check-ins</span>
          </div>
          <div className="mcal-stat">
            <span className="mcal-stat-val">{monthAvgMood}</span>
            <span className="mcal-stat-label">Avg mood</span>
          </div>
          <div className="mcal-stat">
            <span className="mcal-stat-val">{Math.round((daysTracked / daysInMonth) * 100)}%</span>
            <span className="mcal-stat-label">Consistency</span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="mcal-grid-wrap">
          {/* Day headers */}
          <div className="mcal-grid mcal-grid-header">
            {DAYS.map(d => <div key={d} className="mcal-day-label">{d}</div>)}
          </div>

          {/* Day cells */}
          <div className="mcal-grid">
            {/* Empty cells for offset */}
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="mcal-cell mcal-cell-empty" />
            ))}

            {/* Day cells */}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day   = i + 1
              const key   = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const data  = getDayData(key)
              const isToday = today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear
              const isSel = selectedDay === key
              const color = data ? MOOD_COLORS[data.avgMood] : null

              return (
                <div
                  key={key}
                  className={`mcal-cell ${data ? 'has-data' : ''} ${isToday ? 'is-today' : ''} ${isSel ? 'selected' : ''}`}
                  style={color ? { backgroundColor: color } : {}}
                  onClick={() => data && setSelectedDay(isSel ? null : key)}
                  title={data ? `Mood: ${data.avgMood}/10` : 'No check-in'}
                >
                  <span className="mcal-day-num">{day}</span>
                  {data && <span className="mcal-mood-num">{data.avgMood}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Colour legend */}
        <div className="mcal-legend">
          <span className="mcal-legend-label">Low</span>
          <div className="mcal-legend-bar">
            {MOOD_COLORS.slice(1).map((c, i) => (
              <div key={i} className="mcal-legend-swatch" style={{ backgroundColor: c }} title={`${i+1}/10`} />
            ))}
          </div>
          <span className="mcal-legend-label">High</span>
        </div>

        {/* ── Moving Average Chart ── */}
        <div className="mcal-chart-section" style={{ padding: 0, background: 'none', border: 'none' }}>
          <MovingAvgChart checkIns={checkIns} range={chartRange} setRange={setChartRange} />
        </div>

        {/* Selected day detail */}
        {selectedDay && dayMap[selectedDay] && (
          <div className="mcal-detail">
            <h3>
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            {dayMap[selectedDay].entries.map((e, i) => (
              <div key={i} className="mcal-detail-entry">
                <div className="mcal-detail-time">
                  {new Date(e.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="mcal-detail-metrics">
                  <span>😊 Mood <strong>{e.mood}/10</strong></span>
                  <span>⚡ Energy <strong>{e.energy}/10</strong></span>
                  {e.sleep?.hours && <span>🌙 Sleep <strong>{e.sleep.hours}h</strong></span>}
                  {e.stress?.level && <span>😤 Stress <strong>{e.stress.level}/10</strong></span>}
                </div>
                {e.journalNote && <p className="mcal-detail-note">"{e.journalNote}"</p>}
              </div>
            ))}
          </div>
        )}

        {/* No data state */}
        {monthData.length === 0 && (
          <div className="mcal-empty">
            <p>No check-ins recorded this month.</p>
            <p>Complete daily check-ins to see your mood calendar fill up.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MoodCalendar
