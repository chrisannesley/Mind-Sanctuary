import React from 'react'
import { useNavigate } from 'react-router-dom'

function SplashLanding({ hasAccount }) {
  const navigate = useNavigate()

  const handleEnter = () => {
    navigate(hasAccount ? '/dashboard' : '/setup')
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 cursor-pointer relative overflow-hidden"
      onClick={handleEnter}
      style={{
        backgroundColor: '#f5f1ed',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
    >
      {/* Background Icon - covering entire page */}
      <img 
        src="/mind-sanctuary-icon.png" 
        alt="Mind Sanctuary" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 1,
          zIndex: 0
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-center text-white mb-4">Mind Sanctuary</h1>
        <p className="text-xl text-white text-center mb-12">Your space for mental wellbeing</p>
        <p className="text-sm text-white text-center">{hasAccount ? 'Click anywhere to enter' : 'Click anywhere to get started'}</p>
      </div>

      {/* Optional overlay for click feedback */}
      <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity duration-300 z-20"></div>
    </div>
  )
}

export default SplashLanding
