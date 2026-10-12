import React, { useState, useEffect, useRef } from 'react'
import '../styles/BreathingTimer.css'

const EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal counts for inhale, hold, exhale, hold. Used by Navy SEALs to stay calm under pressure.',
    benefit: 'Reduces stress & anxiety',
    phases: [
      { label: 'Inhale',    duration: 4, color: '#3b82f6' },
      { label: 'Hold',      duration: 4, color: '#8b5cf6' },
      { label: 'Exhale',    duration: 4, color: '#10b981' },
      { label: 'Hold',      duration: 4, color: '#6366f1' },
    ]
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'Inhale for 4, hold for 7, exhale for 8. Activates the parasympathetic nervous system quickly.',
    benefit: 'Calms anxiety fast',
    phases: [
      { label: 'Inhale',    duration: 4, color: '#3b82f6' },
      { label: 'Hold',      duration: 7, color: '#8b5cf6' },
      { label: 'Exhale',    duration: 8, color: '#10b981' },
    ]
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Simple slow breathing. Inhale for 5, exhale for 5. Good for beginners.',
    benefit: 'Gentle relaxation',
    phases: [
      { label: 'Inhale',    duration: 5, color: '#3b82f6' },
      { label: 'Exhale',    duration: 5, color: '#10b981' },
    ]
  },
  {
    id: 'energise',
    name: 'Energising Breath',
    description: 'Short inhale, longer exhale. Wakes you up without caffeine.',
    benefit: 'Boosts alertness',
    phases: [
      { label: 'Inhale',    duration: 3, color: '#f59e0b' },
      { label: 'Exhale',    duration: 6, color: '#10b981' },
    ]
  }
]

function BreathingTimer() {
  const [selected,    setSelected]    = useState(null)
  const [running,     setRunning]     = useState(false)
  const [phaseIdx,    setPhaseIdx]    = useState(0)
  const [countdown,   setCountdown]   = useState(0)
  const [cycles,      setCycles]      = useState(0)
  const [totalCycles, setTotalCycles] = useState(5)
  const [done,        setDone]        = useState(false)

  const timerRef = useRef(null)

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), [])

  const startExercise = (ex) => {
    setSelected(ex)
    setPhaseIdx(0)
    setCountdown(ex.phases[0].duration)
    setCycles(0)
    setDone(false)
    setRunning(false)
  }

  const handleStart = () => {
    setRunning(true)
    setDone(false)
  }

  const handleStop = () => {
    clearInterval(timerRef.current)
    setRunning(false)
  }

  const handleReset = () => {
    clearInterval(timerRef.current)
    setRunning(false)
    setPhaseIdx(0)
    setCountdown(selected.phases[0].duration)
    setCycles(0)
    setDone(false)
  }

  // Countdown tick
  useEffect(() => {
    if (!running || !selected) return
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1

        // Move to next phase
        setPhaseIdx(pi => {
          const nextPi = (pi + 1) % selected.phases.length
          const isNewCycle = nextPi === 0

          if (isNewCycle) {
            setCycles(c => {
              const newCycles = c + 1
              if (newCycles >= totalCycles) {
                clearInterval(timerRef.current)
                setRunning(false)
                setDone(true)
                return newCycles
              }
              return newCycles
            })
          }

          setCountdown(selected.phases[nextPi].duration)
          return nextPi
        })
        return 0
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [running, selected, totalCycles])

  const currentPhase = selected ? selected.phases[phaseIdx] : null
  const cycleProgress = selected ? ((phaseIdx / selected.phases.length) + (1 - countdown / currentPhase?.duration) / selected.phases.length) : 0
  const overallProgress = selected ? (cycles / totalCycles) + (cycleProgress / totalCycles) : 0

  // Circle animation
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const phaseProgress = currentPhase ? (1 - countdown / currentPhase.duration) : 0
  const strokeDash = circumference * phaseProgress

  return (
    <div className="breath-container">

      {/* Header */}
      <div className="breath-header">
        <div>
          <h1>🫁 Breathing Timer</h1>
          <p className="breath-subtitle">Guided breathing exercises for calm and focus</p>
        </div>
      </div>

      <div className="breath-body">

        {/* Exercise selector */}
        {!selected || !running ? (
          <div className="breath-exercises">
            {EXERCISES.map(ex => (
              <button
                key={ex.id}
                className={`breath-ex-card ${selected?.id === ex.id ? 'active' : ''}`}
                onClick={() => startExercise(ex)}
              >
                <div className="breath-ex-name">{ex.name}</div>
                <div className="breath-ex-benefit">{ex.benefit}</div>
                <div className="breath-ex-phases">
                  {ex.phases.map((p, i) => (
                    <span key={i} className="breath-ex-phase" style={{ backgroundColor: p.color }}>
                      {p.label} {p.duration}s
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        {/* Active timer */}
        {selected && (
          <div className="breath-timer">

            <div className="breath-info">
              <h2>{selected.name}</h2>
              {!running && !done && <p className="breath-desc">{selected.description}</p>}
            </div>

            {/* Cycles selector */}
            {!running && !done && (
              <div className="breath-cycles-row">
                <span className="breath-cycles-label">Cycles:</span>
                {[3, 5, 7, 10].map(n => (
                  <button
                    key={n}
                    className={`breath-cycle-btn ${totalCycles === n ? 'active' : ''}`}
                    onClick={() => setTotalCycles(n)}
                  >{n}</button>
                ))}
              </div>
            )}

            {/* Circle */}
            {(running || done) && (
              <div className="breath-circle-wrap">
                <svg className="breath-svg" viewBox="0 0 200 200">
                  {/* Background circle */}
                  <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  {/* Progress arc */}
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke={done ? '#10b981' : currentPhase?.color || '#3b82f6'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s' }}
                  />
                  {/* Centre text */}
                  {done ? (
                    <>
                      <text x="100" y="95" textAnchor="middle" fill="#10b981" fontSize="28" fontWeight="bold">✓</text>
                      <text x="100" y="118" textAnchor="middle" fill="#6ee7b7" fontSize="13">Done!</text>
                    </>
                  ) : (
                    <>
                      <text x="100" y="90" textAnchor="middle" fill="#fff" fontSize="42" fontWeight="800">{countdown}</text>
                      <text x="100" y="115" textAnchor="middle" fill={currentPhase?.color} fontSize="15" fontWeight="600">
                        {currentPhase?.label}
                      </text>
                      <text x="100" y="135" textAnchor="middle" fill="#64748b" fontSize="11">
                        Cycle {cycles + 1} of {totalCycles}
                      </text>
                    </>
                  )}
                </svg>
              </div>
            )}

            {/* Overall progress bar */}
            {running && (
              <div className="breath-overall-bar">
                <div className="breath-overall-fill" style={{ width: `${overallProgress * 100}%` }} />
              </div>
            )}

            {/* Controls */}
            <div className="breath-controls">
              {!running && !done && (
                <button className="breath-btn breath-btn-start" onClick={handleStart}>
                  ▶ Start
                </button>
              )}
              {running && (
                <>
                  <button className="breath-btn breath-btn-stop" onClick={handleStop}>⏸ Pause</button>
                  <button className="breath-btn breath-btn-reset" onClick={handleReset}>↺ Reset</button>
                </>
              )}
              {done && (
                <>
                  <div className="breath-done-msg">
                    Well done! {totalCycles} cycles complete. Take a moment to notice how you feel.
                  </div>
                  <button className="breath-btn breath-btn-start" onClick={handleReset}>Do it again</button>
                  <button className="breath-btn breath-btn-reset" onClick={() => setSelected(null)}>Choose another</button>
                </>
              )}
              {!running && !done && selected && (
                <button className="breath-btn breath-btn-reset" onClick={() => setSelected(null)}>← Back</button>
              )}
            </div>
          </div>
        )}

        {/* No selection prompt */}
        {!selected && (
          <div className="breath-prompt">
            <p>Choose an exercise above to begin</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BreathingTimer
