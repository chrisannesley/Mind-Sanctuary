import React, { useState, useEffect } from 'react'
import { getCopingStrategies } from '../utils/api'
import { Play, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'

// ── shared dark-theme tokens ──────────────────────────────────────────────
const card = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '14px',
  padding: '1.5rem',
}

const cardSm = { ...card, padding: '1.25rem' }

const pill = (color) => ({
  display: 'inline-block',
  padding: '0.2rem 0.65rem',
  borderRadius: '20px',
  fontSize: '0.72rem',
  fontWeight: 700,
  background: `${color}22`,
  border: `1px solid ${color}55`,
  color,
})

const metaBox = (accent) => ({
  flex: 1,
  background: `${accent}18`,
  border: `1px solid ${accent}33`,
  borderRadius: '10px',
  padding: '0.75rem 1rem',
})

const btn = (bg, hover) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.8rem 1.5rem',
  background: bg,
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
})

// ─────────────────────────────────────────────────────────────────────────────

function CopingStrategies() {
  const [strategies, setStrategies]         = useState([])
  const [selectedStrategy, setSelected]     = useState(null)
  const [guideMode, setGuideMode]           = useState(false)
  const [currentStep, setCurrentStep]       = useState(0)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCopingStrategies()
        const cleaned = (res.data || []).map(({ youtubeUrl, youtubeTitle, ...rest }) => rest)
        setStrategies(cleaned)
      } catch (e) {
        console.error('Error loading coping strategies:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openGuide = (strategy) => {
    setSelected(strategy)
    setGuideMode(true)
    setCurrentStep(0)
  }

  const closeGuide = () => {
    setSelected(null)
    setGuideMode(false)
    setCurrentStep(0)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        Loading coping strategies…
      </div>
    )
  }

  // ── Guide Mode ────────────────────────────────────────────────────────────
  if (guideMode && selectedStrategy?.steps) {
    const step     = selectedStrategy.steps[currentStep]
    const total    = selectedStrategy.steps.length
    const progress = ((currentStep + 1) / total) * 100
    const isLast   = currentStep === total - 1

    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem' }}>

        {/* Header card */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {selectedStrategy.name}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Guided Practice</p>
            </div>
            <button
              onClick={closeGuide}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              <span>Step {currentStep + 1} of {total}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 999 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#6366f1', borderRadius: 999, transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={metaBox('#6366f1')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0', fontSize: '0.88rem' }}>{selectedStrategy.duration}</div>
            </div>
            <div style={metaBox('#10b981')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Difficulty</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0', fontSize: '0.88rem' }}>{selectedStrategy.difficulty}</div>
            </div>
            <div style={metaBox('#a855f7')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0', fontSize: '0.88rem', textTransform: 'capitalize' }}>{selectedStrategy.category}</div>
            </div>
          </div>
        </div>

        {/* Current step card */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a5b4fc', marginBottom: '0.75rem' }}>
            Step {currentStep + 1}: {step.title}
          </h2>
          <p style={{ fontSize: '1rem', color: '#e0e0e0', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {step.instruction}
          </p>
          <div style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderLeft: '4px solid #6366f1',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.85rem',
            color: '#c7d2fe',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: '#a5b4fc' }}>💡 Tip:</strong> Take your time with this step. There's no rush — re-read as many times as you need.
          </div>
        </div>

        {/* Completion message */}
        {isLast && (
          <div style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
            color: '#6ee7b7',
          }}>
            🎉 <strong style={{ color: '#a7f3d0' }}>Great job!</strong> You've reached the final step. Click "Complete" when you're ready to finish.
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setCurrentStep(s => s - 1)}
            disabled={currentStep === 0}
            style={{
              ...btn('rgba(255,255,255,0.08)'),
              flex: 1,
              border: '1px solid rgba(255,255,255,0.15)',
              color: currentStep === 0 ? '#475569' : '#e0e0e0',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {isLast ? (
            <button onClick={closeGuide} style={{ ...btn('#10b981'), flex: 1 }}>
              <CheckCircle size={18} /> Complete
            </button>
          ) : (
            <button onClick={() => setCurrentStep(s => s + 1)} style={{ ...btn('#6366f1'), flex: 1 }}>
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Detail View ───────────────────────────────────────────────────────────
  if (selectedStrategy) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
        <button
          onClick={() => setSelected(null)}
          style={{ background: 'none', border: 'none', color: '#a5b4fc', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <ChevronLeft size={16} /> Back to Strategies
        </button>

        <div style={card}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {selectedStrategy.name}
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {selectedStrategy.description}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={metaBox('#6366f1')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0' }}>{selectedStrategy.duration}</div>
            </div>
            <div style={metaBox('#10b981')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Difficulty</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0' }}>{selectedStrategy.difficulty}</div>
            </div>
            <div style={metaBox('#a855f7')}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</div>
              <div style={{ fontWeight: 700, color: '#e0e0e0', textTransform: 'capitalize' }}>{selectedStrategy.category}</div>
            </div>
          </div>

          {/* Overview */}
          <div style={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderLeft: '4px solid #6366f1',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.4rem' }}>Overview</div>
            <p style={{ color: '#c7d2fe', lineHeight: 1.6, margin: 0 }}>{selectedStrategy.technique}</p>
          </div>

          {/* Start button */}
          {selectedStrategy.steps?.length > 0 ? (
            <button
              onClick={() => openGuide(selectedStrategy)}
              style={{ ...btn('linear-gradient(135deg, #6366f1, #8b5cf6)'), width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1rem' }}
            >
              <Play size={20} /> Start Guided Practice
            </button>
          ) : (
            <button
              disabled
              style={{ ...btn('rgba(255,255,255,0.06)'), width: '100%', marginBottom: '1rem', padding: '1rem', color: '#475569', cursor: 'not-allowed' }}
            >
              <Play size={20} /> Guided Practice Not Available
            </button>
          )}

          <div style={{
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            fontSize: '0.85rem',
            color: '#93c5fd',
          }}>
            💡 <strong style={{ color: '#bfdbfe' }}>Tip:</strong> Follow the guided steps at your own pace. You can stop and return any time.
          </div>
        </div>
      </div>
    )
  }

  // ── Strategy List ─────────────────────────────────────────────────────────
  const categoryColor = (cat) => {
    const map = {
      breathing: '#6366f1',
      mindfulness: '#a855f7',
      physical: '#10b981',
      cognitive: '#3b82f6',
      relaxation: '#06b6d4',
      social: '#f59e0b',
    }
    return map[(cat || '').toLowerCase()] || '#6366f1'
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
        🧘 Coping Strategies
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
        Practical techniques to manage stress and difficult emotions. Each strategy includes a guided step-by-step practice.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {strategies.map((strategy) => {
          const accent = categoryColor(strategy.category)
          return (
            <div
              key={strategy.id}
              onClick={() => setSelected(strategy)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `4px solid ${accent}`,
                borderRadius: '14px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', margin: 0 }}>{strategy.name}</h3>
                {strategy.steps?.length > 0 && (
                  <span style={pill('#10b981')}>Guided</span>
                )}
              </div>

              {strategy.category && (
                <span style={{ ...pill(accent), marginBottom: '0.6rem', display: 'inline-block', textTransform: 'capitalize' }}>
                  {strategy.category}
                </span>
              )}

              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {strategy.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>⏱️ {strategy.duration}</span>
                <span style={{ color: accent, fontWeight: 600 }}>Begin →</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CopingStrategies
