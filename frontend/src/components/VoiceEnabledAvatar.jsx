import React, { useState, useEffect } from 'react'
import { getTextToSpeech, getSpeechToText } from '../utils/voiceUtils'
import VoiceInputButton from './VoiceInputButton'

/**
 * VoiceEnabledAvatar Component
 * Avatar that can listen to user input and speak responses
 * Uses Web Speech API for voice interaction
 */
export default function VoiceEnabledAvatar({ 
  avatarImage,
  avatarName,
  personalityTrait,
  onMessageSubmit,
  isLoading = false
}) {
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const [showVoiceMode, setShowVoiceMode] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)

  const tts = getTextToSpeech()
  const stt = getSpeechToText()
  const isVoiceSupported = tts.isSupported() && stt.isSupported()

  useEffect(() => {
    // Load voice preferences
    const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex')
    if (savedVoiceIndex) {
      tts.selectVoice(parseInt(savedVoiceIndex))
      setVoiceEnabled(true)
    }

    const savedVolume = localStorage.getItem('avatarVolume')
    if (savedVolume) setVolume(parseFloat(savedVolume))

    const savedRate = localStorage.getItem('avatarRate')
    if (savedRate) setRate(parseFloat(savedRate))

    const savedPitch = localStorage.getItem('avatarPitch')
    if (savedPitch) setPitch(parseFloat(savedPitch))
  }, [])

  const handleSpeakResponse = (text) => {
    if (!voiceEnabled || !isVoiceSupported) return

    setIsSpeaking(true)
    tts.speak(text, {
      rate,
      pitch,
      volume,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (error) => {
        console.error('Error speaking:', error)
        setIsSpeaking(false)
      }
    })
  }

  const handleVoiceTranscript = (transcript) => {
    setMessageInput(transcript)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return

    const userMessage = { role: 'user', content: messageInput, type: 'text' }
    setMessages(prev => [...prev, userMessage])
    setMessageInput('')

    if (onMessageSubmit) {
      const response = await onMessageSubmit(messageInput)
      
      const avatarMessage = {
        role: 'avatar',
        content: response,
        type: 'text'
      }
      setMessages(prev => [...prev, avatarMessage])

      // If voice enabled, speak the response
      if (voiceEnabled && isVoiceSupported) {
        handleSpeakResponse(response)
      }
    }
  }

  const handleToggleVoiceMode = () => {
    setShowVoiceMode(!showVoiceMode)
  }

  return (
    <div className="bg-gradient-to-b from-purple-50 to-pink-50 rounded-lg shadow-lg p-6">
      {/* Avatar Display */}
      <div className="text-center mb-6">
        {avatarImage && (
          <img
            src={avatarImage}
            alt={avatarName}
            className={`w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-purple-300 shadow-lg transition ${
              isSpeaking ? 'animate-pulse' : ''
            }`}
          />
        )}
        <h2 className="text-2xl font-bold text-gray-800">{avatarName || 'Your Companion'}</h2>
        <p className="text-gray-600 italic">{personalityTrait}</p>
        {isSpeaking && <p className="text-purple-600 font-semibold text-sm mt-2">🔊 Speaking...</p>}
      </div>

      {/* Voice Controls */}
      {isVoiceSupported && (
        <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-purple-500">
          <button
            onClick={() => setShowVoiceMode(!showVoiceMode)}
            className={`w-full px-4 py-2 rounded-lg font-semibold transition ${
              voiceEnabled
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
            }`}
          >
            {voiceEnabled ? '🔊 Voice Enabled' : '🔇 Voice Disabled'}
          </button>
          
          {showVoiceMode && voiceEnabled && (
            <div className="mt-3 space-y-2">
              <div>
                <label className="text-xs text-gray-700">Speed: {(rate * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={(e) => {
                    const newRate = parseFloat(e.target.value)
                    setRate(newRate)
                    localStorage.setItem('avatarRate', newRate)
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700">Pitch: {(pitch * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => {
                    const newPitch = parseFloat(e.target.value)
                    setPitch(newPitch)
                    localStorage.setItem('avatarPitch', newPitch)
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-700">Volume: {(volume * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value)
                    setVolume(newVolume)
                    localStorage.setItem('avatarVolume', newVolume)
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white rounded-lg p-4 mb-4 max-h-64 overflow-y-auto space-y-3 border-l-4 border-purple-300">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 italic py-8">
            Start a conversation with {avatarName || 'your companion'}...
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-100 text-blue-900 ml-8'
                  : 'bg-purple-100 text-purple-900 mr-8'
              }`}
            >
              <p className="font-semibold text-sm">
                {msg.role === 'user' ? 'You' : avatarName || 'Companion'}
              </p>
              <p className="text-sm mt-1">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="p-3 bg-gray-100 text-gray-700 rounded-lg mr-8">
            <p className="text-sm">💭 Thinking...</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        {/* Voice Input Button */}
        {isVoiceSupported && voiceEnabled && (
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            placeholder="Click mic to speak your message..."
            disabled={isLoading}
            label="Speak to your companion"
          />
        )}

        {/* Text Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !messageInput.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:bg-gray-400"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>

        {/* Send with Voice Option */}
        {voiceEnabled && isSpeaking && (
          <button
            type="button"
            onClick={() => tts.stop()}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            🔊 Stop Speaking
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-800">
        <p className="font-semibold">💡 Tip:</p>
        <p>
          {isVoiceSupported
            ? 'You can speak or type. Enable voice above to hear responses.'
            : 'Your browser supports text-only mode. Try Chrome, Firefox, Safari or Edge for voice.'}
        </p>
      </div>
    </div>
  )
}
