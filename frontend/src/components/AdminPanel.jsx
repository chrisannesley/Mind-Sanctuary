import React, { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { getAdminSummary } from '../utils/api'

export default function AdminPanel({ isOpen, onClose }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminSummary()
      setData(res.data)
    } catch (e) {
      setError('Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (isOpen) load() }, [isOpen])

  if (!isOpen) return null

  const card = (label, value, color = '#60a5fa') => (
    <div style={{
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', padding: '0.9rem 1rem', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>{label}</div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '16px', padding: '1.75rem',
        maxWidth: 480, width: '100%', maxHeight: '80vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
              🛡️ Admin Overview
            </h2>
            {data && (
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                {new Date(data.generatedAt).toLocaleString('en-GB')}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={load} title="Refresh"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading…</div>
        )}

        {error && (
          <div style={{ color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>{error}</div>
        )}

        {data && (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {card('Total Users',     data.users.total,          '#60a5fa')}
              {card('New This Week',   data.users.newThisWeek,    '#34d399')}
              {card('Check-ins Today', data.checkIns.today,       '#fbbf24')}
              {data.feedback?.total > 0 && card('Avg Rating', `${data.feedback.avgRating}★`, '#a78bfa')}
            </div>

            {/* Last signup */}
            {data.users.lastSignup && (
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', fontSize: '0.83rem', color: '#c7d2fe' }}>
                🆕 Latest signup: <strong>{data.users.lastSignup.name}</strong> on {data.users.lastSignup.date}
              </div>
            )}

            {/* Users list — first names only */}
            {data.userActivity?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                  Beta Testers ({data.userActivity.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {data.userActivity.map((u, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0.85rem',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#a5b4fc' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.88rem' }}>{u.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>{u.checkIns} check-ins</span>
                        <span>Last: {u.lastCheckIn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent feedback */}
            {data.feedback?.recent?.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                  Recent Feedback
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {data.feedback.recent.slice(0, 5).map((f, i) => (
                    <div key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{f.userName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{'★'.repeat(f.rating)}</span>
                      </div>
                      {f.liked && <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0 0 0.2rem', lineHeight: 1.4 }}>👍 {f.liked}</p>}
                      {f.improve && <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>💡 {f.improve}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
