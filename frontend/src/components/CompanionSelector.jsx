import React, { useState, useEffect } from 'react'
import { Sparkles, Heart } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export default function CompanionSelector({ onCompanionSelected, sessionMode = 'guided' }) {
  const [companions,        setCompanions]        = useState([])
  const [selectedCompanion, setSelectedCompanion] = useState(null)
  const [loadingAvatars,    setLoadingAvatars]    = useState({})

  useEffect(() => {
    const fetch$ = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/companions`)
        const data = await res.json()
        setCompanions(data)
        const rec  = await fetch(`${API_URL}/api/companions/recommend/${sessionMode}`)
        const rData = await rec.json()
        setSelectedCompanion(rData.id)
      } catch (e) { console.error('Error fetching companions:', e) }
    }
    fetch$()
  }, [sessionMode])

  // Generate missing avatars
  useEffect(() => {
    const gen = async () => {
      const missing = companions.filter(c => !c.avatar)
      for (let i = 0; i < missing.length; i++) {
        const c = missing[i]
        if (i > 0) await new Promise(r => setTimeout(r, 5000))
        try {
          setLoadingAvatars(p => ({ ...p, [c.id]: true }))
          const res  = await fetch(`${API_URL}/api/companions/${c.id}/generate-avatar`, { method: 'POST' })
          const data = await res.json()
          if (data.avatar) setCompanions(p => p.map(x => x.id === c.id ? { ...x, avatar: data.avatar } : x))
        } catch (e) {
          console.error(`Avatar error for ${c.id}:`, e)
        } finally {
          setLoadingAvatars(p => ({ ...p, [c.id]: false }))
        }
      }
    }
    if (companions.length > 0) gen()
  }, [companions])

  const icon = id => ({ lauren: '💕', jon: '💙' }[id] || '✨')

  const handleSelect = (id) => {
    setSelectedCompanion(id)
    onCompanionSelected(companions.find(c => c.id === id))
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center', maxWidth: 560, margin: '0 auto 1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem' }}>
          Choose Your Reflection Companion
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Each companion brings a unique energy to your session
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', justifyItems: 'center', maxWidth: 560, margin: '0 auto' }}>
        {companions.map(companion => {
          const selected = selectedCompanion === companion.id
          return (
            <div
              key={companion.id}
              onClick={() => handleSelect(companion.id)}
              style={{
                padding: '1.5rem',
                borderRadius: '14px',
                border: selected ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                width: '100%',
                maxWidth: 260,
              }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              {/* Avatar */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                {loadingAvatars[companion.id] ? (
                  <div style={{ width: 96, height: 96, borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={32} color="#94a3b8" />
                  </div>
                ) : companion.avatar ? (
                  <img src={companion.avatar} alt={companion.name} style={{ width: 96, height: 96, borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 96, height: 96, borderRadius: '12px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                    {icon(companion.id)}
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                {companion.name}
              </h3>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '0.5rem' }}>
                {companion.role}
              </p>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.9rem' }}>
                {companion.description}
              </p>

              {/* Personality tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {companion.personality?.split(', ').slice(0, 3).map((trait, i) => (
                  <span key={i} style={{ padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.07)', borderRadius: '20px', fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>
                    {trait}
                  </span>
                ))}
              </div>

              {selected && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#a5b4fc', fontWeight: 700, fontSize: '0.82rem' }}>
                  <Heart size={14} fill="#a5b4fc" /> Selected
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedCompanion && (
        <div style={{ marginTop: '1.25rem', padding: '0.85rem 1.1rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', fontSize: '0.85rem', color: '#c7d2fe', maxWidth: 560, margin: '1.25rem auto 0', textAlign: 'center' }}>
          ✨ You've selected <strong>{companions.find(c => c.id === selectedCompanion)?.name}</strong> as your companion for this session.
        </div>
      )}
    </div>
  )
}
