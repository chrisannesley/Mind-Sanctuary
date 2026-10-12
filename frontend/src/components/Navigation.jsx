import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function Navigation({ user }) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { path: '/home', label: 'Home' },
  ]

  return (
    <>
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(10, 14, 39, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(233, 69, 96, 0.3)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)'
      }}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/home" className="flex items-center space-x-2 hover:opacity-80 transition">
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>Mind Sanctuary</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center space-x-2">
              <Link
                to="/home"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-white transition"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                🏠
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition"
                style={{ background: '#2196F3' }}
              >
                🧭 Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to push content below fixed nav */}
      <div style={{ height: '64px' }}></div>
    </>
  )
}

export default Navigation
