import React, { useState, useEffect } from 'react'

function Avatar({ isActive, message, onRespond }) {
  const [displayMessage, setDisplayMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)

  // Typewriter effect for messages
  useEffect(() => {
    if (!message) {
      setDisplayMessage('')
      return
    }

    setIsTyping(true)
    let index = 0
    const interval = setInterval(() => {
      if (index < message.length) {
        setDisplayMessage(message.substring(0, index + 1))
        index++
        // Toggle mouth for typing effect
        setMouthOpen(index % 2 === 0)
      } else {
        setIsTyping(false)
        clearInterval(interval)
        setMouthOpen(false)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [message])

  if (!isActive) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Avatar Container */}
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-xs">
        {/* Avatar Head */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24">
            {/* Head */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-full border-4 border-yellow-300 flex items-center justify-center">
              {/* Eyes */}
              <div className="absolute top-6 left-6 w-3 h-3 bg-black rounded-full"></div>
              <div className="absolute top-6 right-6 w-3 h-3 bg-black rounded-full"></div>

              {/* Mouth */}
              <div className="absolute bottom-4">
                {mouthOpen ? (
                  <div className="w-6 h-4 bg-red-400 rounded-full"></div>
                ) : (
                  <div className="w-6 h-1 bg-black rounded-full"></div>
                )}
              </div>

              {/* Blinking animation */}
              <style>{`
                @keyframes blink {
                  0%, 90%, 100% { height: 3px; }
                  95% { height: 0px; }
                }
              `}</style>
            </div>

            {/* Thinking bubble indicator */}
            {isTyping && (
              <div className="absolute -top-2 -right-2 flex gap-1">
                <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Message Bubble */}
        <div className="bg-mindwell-50 border-2 border-mindwell-300 rounded-lg p-4 mb-4 min-h-16">
          <p className="text-gray-800 text-sm leading-relaxed">
            {displayMessage}
            {isTyping && <span className="animate-pulse">▌</span>}
          </p>
        </div>

        {/* Status */}
        <div className="text-center text-xs text-gray-500">
          {isTyping ? '🤔 Thinking...' : '✓ Ready to chat'}
        </div>
      </div>
    </div>
  )
}

export default Avatar
