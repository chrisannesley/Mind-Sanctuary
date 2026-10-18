import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/api'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [name,    setName]    = useState('')
  const [pin,     setPin]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name.'); return }

    setLoading(true); setError('')
    try {
      // Pass pin as empty string when skipped — backend handles no-PIN accounts
      const res  = await loginUser(name.trim(), pin.trim())
      const user = res.data
      localStorage.setItem('mw_userId', String(user.id))
      onLogin(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'No account found. Check your name and PIN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '2.5rem 2rem', maxWidth: 420, width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary"
            style={{ width: 72, height: 72, borderRadius: '16px', margin: '0 auto 1rem', display: 'block' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.3rem' }}>
            Welcome back
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Enter your name to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Your name
            </label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="The name you signed up with" autoFocus
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.7rem 1rem', color: '#f1f5f9', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              4-digit PIN <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.8rem' }}>(if you set one)</span>
            </label>
            <input
              type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,4))}
              placeholder="•••• or leave blank" maxLength={4} inputMode="numeric"
              style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '0.7rem 1rem', color: '#f1f5f9', fontSize: '1.2rem', outline: 'none', letterSpacing: '0.3em', textAlign: 'center' }}
            />
          </div>

          {error && <p style={{ color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.85rem',
            background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button onClick={() => navigate('/setup')} style={{
            background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem',
            cursor: 'pointer', textDecoration: 'underline',
          }}>
            New here? Create an account
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: '#334155', lineHeight: 1.5 }}>
          No PIN? Just leave it blank and sign in with your name.
        </p>
      </div>
    </div>
  )
}
