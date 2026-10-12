/**
 * Beast Companion - Standalone App
 * Main entry point for running Beast Companion as independent app
 */

import React, { useState, useEffect } from 'react'
import Beasts from './pages/Beasts'

function AppStandalone() {
  const [userId] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🐉</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Beast Companion</h1>
              <p className="text-gray-600 text-sm">Your AI-generated pet wellness app</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Beasts userId={userId} />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-gray-600 text-sm">
        <p>Beast Companion • Standalone Version</p>
        <p className="mt-1">Backend: <span className="font-mono">http://localhost:3003</span></p>
      </footer>
    </div>
  )
}

export default AppStandalone
