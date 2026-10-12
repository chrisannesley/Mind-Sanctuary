import React, { useState } from 'react'
import Beasts from './components/Beasts'
import './App.css'

function App() {
  const [userId] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐉</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Beast Companion</h1>
              <p className="text-gray-600 text-sm">Your AI-generated pet wellness game</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Beasts userId={userId} />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-600 text-sm border-t">
        <p>Beast Companion • Standalone Version</p>
        <p className="mt-1">Backend: <span className="font-mono">http://localhost:3002</span></p>
      </footer>
    </div>
  )
}

export default App
