import React, { useState, useEffect } from 'react'

function HumanAvatar({ isActive, message, onRespond, avatarImage }) {
  const [displayMessage, setDisplayMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

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
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [message])

  if (!isActive) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Human Avatar Container */}
      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm overflow-hidden">
        {/* Avatar Image */}
        <div className="flex justify-center mb-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-mindwell-500 shadow-lg">
            {avatarImage ? (
              <img
                src={avatarImage}
                alt="Support Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-mindwell-200 to-mindwell-400 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-center mb-3">
          <h3 className="font-bold text-gray-800">Your Support Companion</h3>
          <p className="text-xs text-gray-500">Always here to listen</p>
        </div>

        {/* Message Bubble */}
        <div className="bg-mindwell-50 border-2 border-mindwell-300 rounded-lg p-4 mb-4 min-h-20">
          <p className="text-gray-800 text-sm leading-relaxed">
            {displayMessage}
            {isTyping && <span className="animate-pulse">▌</span>}
          </p>
        </div>

        {/* Status */}
        <div className="text-center text-xs text-gray-500">
          {isTyping ? '💭 Thinking...' : '✓ Ready to chat'}
        </div>
      </div>
    </div>
  )
}

export default HumanAvatar
