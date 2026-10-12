import React from 'react'

function Home({ onStartReading }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Dark Viking background with image overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(10, 10, 20, 0.7) 0%, rgba(20, 15, 35, 0.7) 50%, rgba(10, 10, 20, 0.7) 100%),
            url('/viking-bg.jpg')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-center max-w-3xl px-6">
        
        {/* Main title with striking effect */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-8xl font-black text-white mb-4 drop-shadow-2xl"
            style={{
              textShadow: `
                0 0 20px rgba(255, 215, 0, 0.5),
                0 0 40px rgba(255, 215, 0, 0.3),
                -2px -2px 4px rgba(0, 0, 0, 0.8),
                2px 2px 8px rgba(255, 100, 0, 0.3)
              `,
              letterSpacing: '0.05em',
              fontFamily: 'Georgia, serif'
            }}>
            NORDIC RUNES
          </h1>
          
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-amber-600 text-lg">✦</span>
            <span className="text-amber-600 text-lg">✦</span>
            <span className="text-amber-600 text-lg">✦</span>
          </div>

          <p className="text-2xl md:text-3xl text-amber-200 font-light tracking-widest mb-4"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
            ANCIENT WISDOM. TIMELESS GUIDANCE.
          </p>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)' }}>
            Harness the power of the Elder Futhark. Cast the stones and receive guidance from the ancient Norse tradition.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black bg-opacity-60 border-2 border-amber-700 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500 transition"
            style={{ boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)' }}>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Draw Runes</h3>
            <p className="text-gray-400 text-sm">Cast 1-3 stones for your reading</p>
          </div>

          <div className="bg-black bg-opacity-60 border-2 border-amber-700 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500 transition"
            style={{ boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)' }}>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Deep Insight</h3>
            <p className="text-gray-400 text-sm">Contextual wisdom for your question</p>
          </div>

          <div className="bg-black bg-opacity-60 border-2 border-amber-700 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500 transition"
            style={{ boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)' }}>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Save Journey</h3>
            <p className="text-gray-400 text-sm">Keep your readings and reflections</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStartReading}
          className="relative px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-500 transition transform hover:scale-105 active:scale-95 shadow-2xl"
          style={{
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
            boxShadow: `
              0 0 30px rgba(255, 215, 0, 0.4),
              0 10px 30px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          }}
        >
          BEGIN YOUR READING
        </button>

        {/* Footer text */}
        <div className="mt-12 text-sm text-gray-500 space-y-2">
          <p>✦ Runes as divination guide ✦</p>
          <p>Seek clarity. Find your path. Embrace your destiny.</p>
        </div>
      </div>

      {/* Decorative Norse runes border */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black to-transparent opacity-50 z-5"></div>
    </div>
  )
}

export default Home
