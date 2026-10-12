import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTodayCheckIn, getRandomQuote } from '../utils/api'
import QuickCheckIn from '../components/QuickCheckIn'
import '../styles/Home.css'

function Home({ user, setUser, userId, setUserId }) {
  const [todayCheckIn, setTodayCheckIn] = useState(null)
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [checkInRes, quoteRes] = await Promise.all([
          getTodayCheckIn(userId),
          getRandomQuote()
        ])
        setTodayCheckIn(checkInRes.data)
        setQuote(quoteRes.data)
      } catch (error) {
        console.error('Error loading home data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [userId])

  return (
    <div className="home-container" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Dark overlay for home page — global icon watermark handles the background image */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0,
        background: 'linear-gradient(135deg, rgba(15,52,96,0.5) 0%, rgba(22,33,62,0.55) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Page content above overlay */}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* Welcome Header */}
      <div className="home-header">
        <div className="home-welcome">
          <img src="/mind-sanctuary-icon.png" alt="Mind Sanctuary" className="home-icon" />
          <div className="home-welcome-text">
            <h1>Welcome, {user?.name || 'Guest User'}</h1>
            <p>Your personal sanctuary for mental wellness</p>
          </div>
        </div>
      </div>

      <div className="home-content">

        {/* Quick Check-In */}
        {todayCheckIn ? (
          <>
            <div className="checkin-card completed">
              <h3>✓ Check-in completed today</h3>
              <p>
                Most recent — {new Date(todayCheckIn.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                {' • '}Mood: {todayCheckIn.mood}/10 • Energy: {todayCheckIn.energy}/10
              </p>
            </div>
            <QuickCheckIn userId={userId} onComplete={(data) => setTodayCheckIn(data)} />
          </>
        ) : (
          <QuickCheckIn userId={userId} onComplete={(data) => setTodayCheckIn(data)} />
        )}

        {/* Daily Inspiration */}
        {quote && (
          <div className="quote-hero">
            <div className="quote-hero-label">✨ Daily Inspiration</div>
            <p className="quote-hero-text">"{quote.text}"</p>
            <p className="quote-hero-author">— {quote.author}</p>
          </div>
        )}

        {/* Navigation shortcuts */}
        <div className="home-shortcuts">
          <Link to="/dashboard" className="shortcut-btn shortcut-explore">
            <span className="shortcut-icon">🧭</span>
            <div>
              <div className="shortcut-title">Explore Features</div>
              <div className="shortcut-desc">All tools &amp; resources</div>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/dashboard" className="shortcut-btn shortcut-patterns">
            <span className="shortcut-icon">📈</span>
            <div>
              <div className="shortcut-title">Your Patterns</div>
              <div className="shortcut-desc">Weekly insights &amp; trends</div>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/checkin" className="shortcut-btn shortcut-checkin">
            <span className="shortcut-icon">📝</span>
            <div>
              <div className="shortcut-title">Full Check-In</div>
              <div className="shortcut-desc">Sleep, stress, triggers &amp; more</div>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/crisis" className="shortcut-btn shortcut-crisis">
            <span className="shortcut-icon">🆘</span>
            <div>
              <div className="shortcut-title">Crisis Help</div>
              <div className="shortcut-desc">Emergency support resources</div>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>
        </div>

      </div>
      </div>
    </div>
  )
}

export default Home
