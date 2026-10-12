import React, { useState, useEffect } from 'react'
import { getQuotes, getRandomQuote } from '../utils/api'

function Inspiration({ userId }) {
  const [quotes, setQuotes] = useState([])
  const [currentQuote, setCurrentQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const [allQuotesRes, randomRes] = await Promise.all([
          getQuotes(),
          getRandomQuote()
        ])
        setQuotes(allQuotesRes.data)
        setCurrentQuote(randomRes.data)
      } catch (error) {
        console.error('Error loading quotes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [])

  const handleNewQuote = async () => {
    try {
      const response = await getRandomQuote()
      setCurrentQuote(response.data)
    } catch (error) {
      console.error('Error loading new quote:', error)
    }
  }

  const categoryEmojis = {
    courage: '💪', resilience: '🌟', 'self-care': '🧘', growth: '🌱',
    encouragement: '🎯', healing: '💚', 'self-compassion': '🤗', perspective: '🔍',
    'self-worth': '👑', progress: '📈', calm: '🌊', hope: '🌈',
    validation: '✓', connection: '🤝', strength: '⚡'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading inspiration...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #333333 0%, #000000 100%)', borderBottom: '3px solid #e94560', padding: '1.5rem 2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>✨ Daily Inspiration</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Motivation and encouragement for your journey</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>

        {/* Featured Quote */}
        {currentQuote && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(33,150,243,0.15))',
            border: '1px solid rgba(233,69,96,0.35)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.3rem', fontStyle: 'italic', color: '#fff', lineHeight: 1.7, marginBottom: '1rem' }}>
              "{currentQuote.text}"
            </p>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>— {currentQuote.author}</p>
            <button
              onClick={handleNewQuote}
              style={{
                background: '#e94560',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
            >
              Get Another Quote ✨
            </button>
          </div>
        )}

        {/* All Quotes */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          All Quotes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
          {quotes.map((quote) => (
            <div key={quote.id} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '4px solid #2196F3',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <p style={{ color: '#e0e0e0', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '0.6rem', fontSize: '0.9rem' }}>
                "{quote.text}" <span style={{ fontSize: '1.1rem' }}>{categoryEmojis[quote.category] || '✨'}</span>
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.6rem' }}>— {quote.author}</p>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span style={{ background: 'rgba(33,150,243,0.15)', color: '#60a5fa', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  {quote.category}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  {quote.mood}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reflection */}
        <div style={{ background: 'rgba(33,150,243,0.08)', border: '1px solid rgba(33,150,243,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontWeight: 600, color: '#93c5fd', marginBottom: '0.6rem', fontSize: '0.9rem' }}>💭 Daily Reflection</h3>
          <p style={{ color: '#60a5fa', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
            Take a moment to reflect on one of these quotes. How does it relate to your current situation? 
            Consider journaling about your thoughts or sharing this quote with someone who might need it.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Inspiration
