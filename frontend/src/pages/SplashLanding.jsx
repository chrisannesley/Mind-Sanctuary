import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPublicStats } from '../utils/api'
import DemoProfiles from '../components/DemoProfiles'

function SplashLanding({ hasAccount }) {
  const navigate   = useNavigate()
  const [count, setCount] = useState(null)

  useEffect(() => {
    getPublicStats()
      .then(res => setCount(res.data.users))
      .catch(() => {}) // fail silently — counter just won't show
  }, [])

  const handleEnter = () => {
    navigate(hasAccount ? '/dashboard' : '/setup')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0a14',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Background image */}
      <img
        src="/mind-sanctuary-icon.png"
        alt="Mind Sanctuary"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', opacity: 1, zIndex: 0,
        }}
      />

      {/* Dark gradient overlay — stronger at bottom so text is readable */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.88) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        textAlign: 'center', maxWidth: 500, width: '100%',
        paddingBottom: '3rem',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          fontWeight: 800, color: '#fff',
          marginBottom: '0.75rem', lineHeight: 1.15,
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          Mind Sanctuary
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          color: '#e2d9f3',
          lineHeight: 1.65,
          marginBottom: '2rem',
          textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        }}>
          Understand yourself better. Track your mood, sleep and stress — and discover what actually affects how you feel.
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
          justifyContent: 'center', marginBottom: '2rem',
        }}>
          {['Daily Check-In', 'Mood Trends', 'Personal Insights', 'AI Companion'].map(f => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px', padding: '0.3rem 0.85rem',
              fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600,
            }}>{f}</span>
          ))}
        </div>

        {/* Live user counter */}
        {count !== null && count > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px', padding: '0.4rem 1rem',
            marginBottom: '1.25rem', fontSize: '0.85rem', color: '#e2e8f0',
          }}>
            <span style={{ display: 'flex', gap: '-4px' }}>
              {['#6366f1','#8b5cf6','#a78bfa'].map((c, i) => (
                <span key={i} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: c, border: '2px solid rgba(0,0,0,0.3)',
                  display: 'inline-block', marginLeft: i > 0 ? -6 : 0,
                }}/>
              ))}
            </span>
            <span>
              <strong style={{ color: '#fff' }}>{count.toLocaleString()}</strong>
              {count === 1 ? ' person is' : ' people are'} already using Mind Sanctuary
            </span>
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleEnter}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '14px',
            padding: '1rem 2.5rem',
            color: '#fff', fontWeight: 800, fontSize: '1.1rem',
            cursor: 'pointer', width: '100%', maxWidth: 320,
            boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.45)' }}
        >
          {hasAccount ? 'Enter the Sanctuary →' : 'Get Started — It\'s Free'}
        </button>

        {/* Secondary actions */}
        {hasAccount ? (
          /* Already logged in — offer a way to switch account */
          <button
            onClick={() => {
              localStorage.removeItem('mw_userId')
              navigate('/login')
            }}
            style={{
              marginTop: '0.85rem', background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Not you? Sign in as someone else
          </button>
        ) : (
          /* No session — try-first link + sign-in */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem' }}>
            <button
              onClick={() => navigate('/try')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '0.65rem 1.5rem',
                color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600,
                cursor: 'pointer', width: '100%', maxWidth: 320,
              }}
            >
              Try a check-in first — no account needed
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem',
                cursor: 'pointer', textDecoration: 'underline',
              }}
            >
              Already have an account? Sign in
            </button>
          </div>
        )}

        <p style={{
          marginTop: '1rem', fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.45)',
        }}>
          Private · No ads · Your data stays yours
        </p>

        {/* Demo profiles — shows real-looking outcomes */}
        <DemoProfiles />
      </div>
    </div>
  )
}

export default SplashLanding
