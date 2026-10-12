import React, { useState, useEffect } from 'react'
import { getContexts, drawRunes } from '../utils/api'

function DrawRunes({ onReadingComplete, onBack }) {
  const [contexts, setContexts] = useState({})
  const [selectedContext, setSelectedContext] = useState('')
  const [stoneCount, setStoneCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadContexts = async () => {
      try {
        const response = await getContexts()
        setContexts(response.data)
        const firstKey = Object.keys(response.data)[0]
        setSelectedContext(firstKey)
      } catch (err) {
        setError('Failed to load contexts')
        console.error(err)
      }
    }
    loadContexts()
  }, [])

  const handleDraw = async () => {
    if (!selectedContext) {
      setError('Please select a context')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await drawRunes(stoneCount, selectedContext)
      onReadingComplete(response.data)
    } catch (err) {
      setError('Failed to draw runes. Please try again.')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-norse-200 hover:text-norse-100 text-lg"
      >
        ← Back
      </button>

      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-norse-100 mb-8 text-center">Prepare Your Reading</h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-norse-800 rounded-lg p-8 space-y-8">
          {/* Context Selection */}
          <div>
            <label className="block text-lg font-bold text-norse-100 mb-4">
              What is your question about?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contexts).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelectedContext(key)}
                  className={`p-4 rounded-lg text-left transition ${
                    selectedContext === key
                      ? 'bg-norse-600 border-2 border-norse-300 text-white'
                      : 'bg-norse-700 border-2 border-norse-600 text-norse-200 hover:border-norse-500'
                  }`}
                >
                  <h3 className="font-bold text-lg">{value.title}</h3>
                  <p className="text-sm mt-1">{value.interpretation}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Stone Count Selection */}
          <div>
            <label className="block text-lg font-bold text-norse-100 mb-4">
              How many stones do you want to draw?
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  onClick={() => setStoneCount(count)}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition ${
                    stoneCount === count
                      ? 'bg-norse-600 text-white border-2 border-norse-300'
                      : 'bg-norse-700 text-norse-200 border-2 border-norse-600 hover:border-norse-500'
                  }`}
                >
                  {count} Stone{count > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <p className="text-norse-300 text-sm mt-3">
              {stoneCount === 1 && '📍 A single stone provides direct guidance on your question.'}
              {stoneCount === 2 && '📍 Two stones show the current situation and potential outcome.'}
              {stoneCount === 3 && '📍 Three stones reveal past influence, present situation, and future guidance.'}
            </p>
          </div>

          {/* Draw Button */}
          <div className="pt-6">
            <button
              onClick={handleDraw}
              disabled={loading || !selectedContext}
              className={`w-full py-4 px-6 rounded-lg font-bold text-xl transition ${
                loading || !selectedContext
                  ? 'bg-norse-600 text-norse-300 cursor-not-allowed opacity-50'
                  : 'bg-norse-500 hover:bg-norse-600 text-white cursor-pointer transform hover:scale-105'
              }`}
            >
              {loading ? 'Drawing Runes...' : 'Draw Runes'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-norse-700 rounded-lg p-4 text-norse-200 text-sm">
            <p>🧿 Take a moment to focus on your question before drawing. The runes will guide you with ancient wisdom.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrawRunes
