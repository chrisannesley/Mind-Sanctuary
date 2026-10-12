import React, { useState, useEffect } from 'react'
import './App.css'
import Home from './pages/Home'
import DrawRunes from './pages/DrawRunes'
import ReadingResult from './pages/ReadingResult'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [reading, setReading] = useState(null)

  const handleStartReading = () => {
    setCurrentPage('draw')
  }

  const handleReadingComplete = (readingData) => {
    setReading(readingData)
    setCurrentPage('result')
  }

  const handleBackHome = () => {
    setCurrentPage('home')
    setReading(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-norse-900 via-norse-800 to-norse-900">
      {currentPage === 'home' && (
        <Home onStartReading={handleStartReading} />
      )}
      {currentPage === 'draw' && (
        <DrawRunes onReadingComplete={handleReadingComplete} onBack={handleBackHome} />
      )}
      {currentPage === 'result' && (
        <ReadingResult reading={reading} onBack={handleBackHome} />
      )}
    </div>
  )
}

export default App
