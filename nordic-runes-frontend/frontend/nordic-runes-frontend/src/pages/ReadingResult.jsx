import React, { useState } from 'react'
import { saveReading } from '../utils/api'
import ReactMarkdown from 'react-markdown'

function ReadingResult({ reading, onBack }) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSaveReading = async () => {
    setSaving(true)
    try {
      await saveReading(reading.context, reading.stones, notes)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save reading:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-norse-200 hover:text-norse-100 text-lg"
      >
        ← New Reading
      </button>

      <div className="max-w-4xl w-full">
        {/* Context */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-norse-100 mb-2">{reading.context.title}</h1>
          <p className="text-xl text-norse-300">{reading.readingType}</p>
          <p className="text-lg text-norse-400 mt-2">{reading.readingDescription}</p>
        </div>

        {/* Rune Stones - actual rounded stones, not cards */}
        <div className="flex flex-wrap justify-center gap-12 mb-12 py-8">
          {reading.stones.map((stone, index) => {
            // Different stone shapes and sizes for organic feel
            const stoneShapes = [
              { width: 140, height: 160, borderRadius: '45% 55% 52% 48%' },      // Organic oval
              { width: 130, height: 155, borderRadius: '48% 52% 45% 55%' },      // Tilted oval
              { width: 145, height: 165, borderRadius: '52% 48% 53% 47%' },      // Rounded pebble
              { width: 135, height: 150, borderRadius: '47% 53% 48% 52%' },      // Smooth stone
              { width: 140, height: 160, borderRadius: '50% 50% 48% 52%' },      // Classic pebble
              { width: 135, height: 158, borderRadius: '53% 47% 52% 48%' },      // Natural shape
            ];
            
            const shape = stoneShapes[index % stoneShapes.length];
            
            // Stone colors - earthy and natural
            const stoneColors = [
              { primary: '#5a4a3a', secondary: '#6b5a4a', accent: '#4a3a2a' },   // Dark brown
              { primary: '#6b7280', secondary: '#7b8290', accent: '#5b6270' },   // Gray
              { primary: '#7a5c3a', secondary: '#8a6c4a', accent: '#6a4c2a' },   // Terracotta
              { primary: '#5b6b7a', secondary: '#6b7b8a', accent: '#4b5b6a' },   // Slate
              { primary: '#6a5a4a', secondary: '#7a6a5a', accent: '#5a4a3a' },   // Warm brown
              { primary: '#5a5a5a', secondary: '#6a6a6a', accent: '#4a4a4a' },   // Charcoal
            ];
            
            const colors = stoneColors[index % stoneColors.length];

            return (
              <div
                key={index}
                className="flex flex-col items-center transform transition hover:scale-110 duration-300 hover:-translate-y-2"
              >
                {/* Actual stone - organic rounded shape */}
                <div 
                  style={{
                    width: shape.width,
                    height: shape.height,
                    borderRadius: shape.borderRadius,
                    background: `radial-gradient(ellipse 35% 45% at 35% 35%, ${colors.secondary}, ${colors.primary}, ${colors.accent})`,
                    boxShadow: `
                      0 12px 28px rgba(0, 0, 0, 0.7),
                      inset -4px -6px 12px rgba(0, 0, 0, 0.5),
                      inset 6px 6px 12px rgba(255, 255, 255, 0.1),
                      inset -2px 2px 8px rgba(0, 0, 0, 0.6)
                    `,
                    position: 'relative',
                  }}
                  className="flex items-center justify-center relative"
                >
                  {/* Stone texture */}
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: shape.borderRadius,
                      backgroundImage: `
                        radial-gradient(circle at 20% 25%, rgba(255, 255, 255, 0.12) 0.5px, transparent 1px),
                        radial-gradient(circle at 70% 65%, rgba(0, 0, 0, 0.2) 1px, transparent 2px),
                        radial-gradient(circle at 85% 30%, rgba(0, 0, 0, 0.12) 0.5px, transparent 1px),
                        radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.08) 0.5px, transparent 1px)
                      `,
                      backgroundSize: '12px 12px, 18px 18px, 15px 15px, 10px 10px',
                      opacity: 0.6,
                    }}
                  />

                  {/* Rune symbol - engraved on stone */}
                  <div 
                    className={`text-5xl font-bold transition ${stone.reversed ? 'transform rotate-180' : ''}`}
                    style={{
                      color: '#ffd700',
                      position: 'relative',
                      zIndex: 10,
                      textShadow: `
                        -1px -1px 2px rgba(0, 0, 0, 0.8),
                        1px 1px 2px rgba(255, 255, 255, 0.15),
                        0 0 6px rgba(255, 215, 0, 0.4)
                      `,
                      filter: 'drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.7))',
                    }}
                  >
                    {stone.symbol}
                  </div>
                </div>

                {/* Info below stone - minimal and clean */}
                <div className="text-center mt-6 w-full px-2">
                  {/* Rune name */}
                  <h3 className="text-amber-100 font-bold text-lg" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {stone.name}
                  </h3>
                  
                  {/* Position label */}
                  <p className="text-amber-300 text-sm font-semibold mt-1" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {reading.stones.length === 1 && 'Guidance'}
                    {reading.stones.length === 2 && (index === 0 ? 'Current' : 'Outcome')}
                    {reading.stones.length === 3 && (index === 0 ? 'Past' : index === 1 ? 'Present' : 'Future')}
                  </p>

                  {/* Reversed indicator */}
                  {stone.reversed && (
                    <p className="text-red-400 text-xs font-bold mt-2" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                      ⬇️ REVERSED
                    </p>
                  )}

                  {/* Meaning text */}
                  <p className="text-amber-100 text-xs leading-relaxed mt-3 font-medium max-w-xs mx-auto" style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}>
                    {stone.interpretation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comprehensive Reading */}
        <div className="bg-norse-800 rounded-lg p-8 mb-12 prose prose-invert max-w-none">
          <div className="text-norse-100 prose-headings:text-norse-100 prose-strong:text-norse-200 prose-p:text-norse-200 prose-ul:text-norse-200 prose-li:text-norse-200">
            <ReactMarkdown>{reading.comprehensiveReading}</ReactMarkdown>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-norse-800 rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-norse-100 mb-4">Your Reflections</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your thoughts about this reading..."
            className="w-full h-32 p-4 rounded-lg bg-norse-700 text-norse-100 placeholder-norse-400 focus:outline-none focus:ring-2 focus:ring-norse-500"
          />
          <button
            onClick={handleSaveReading}
            disabled={saving}
            className="mt-4 bg-norse-600 hover:bg-norse-700 disabled:bg-norse-500 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save Reading'}
          </button>
          {saved && (
            <p className="text-green-400 mt-3 font-semibold">✓ Reading saved successfully!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReadingResult
