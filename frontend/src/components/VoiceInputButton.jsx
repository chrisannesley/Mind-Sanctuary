import React, { useState, useEffect } from 'react'
import { getSpeechToText } from '../utils/voiceUtils'

/**
 * VoiceInputButton Component
 * Microphone button for voice input
 * Shows recording status, transcript, and confidence
 */
export default function VoiceInputButton({ 
  onTranscript, 
  placeholder = "Click mic to speak...",
  disabled = false,
  label = "Voice Input"
}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const [isFinal, setIsFinal] = useState(false)

  const stt = getSpeechToText()
  const isSupported = stt.isSupported()

  const handleStartListening = () => {
    if (!isSupported || disabled) return

    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setIsListening(true)

    stt.start(
      (fullTranscript, isFinalResult) => {
        // onResult callback
        const parts = fullTranscript.split(transcript)
        if (parts.length > 1) {
          setInterimTranscript(parts[1])
        }
        setIsFinal(isFinalResult)
      },
      (error) => {
        // onError callback
        console.error('Speech recognition error:', error)
        setError(`Error: ${error}`)
        setIsListening(false)
      },
      (finalTranscript) => {
        // onEnd callback
        setTranscript(finalTranscript)
        setInterimTranscript('')
        setIsListening(false)
        
        if (finalTranscript && onTranscript) {
          onTranscript(finalTranscript)
        }
      }
    )
  }

  const handleStopListening = () => {
    stt.stop()
    setIsListening(false)
  }

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600">{label}</p>
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          title="Speech recognition not supported in your browser"
        >
          🎤 Voice Input Not Available
        </button>
        <p className="text-xs text-gray-500">Try Chrome, Firefox, Safari, or Edge</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      
      <div className="flex gap-2">
        <button
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening}
          disabled={disabled}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-xl">{isListening ? '⏹️' : '🎤'}</span>
          {isListening ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="px-3 py-2 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-sm font-semibold flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          Listening...
        </div>
      )}

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="px-3 py-2 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-xs text-gray-600 mb-1">Transcript:</p>
          <p className="text-gray-800 font-semibold">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic">{interimTranscript}</span>
            )}
          </p>
          {isFinal && (
            <p className="text-xs text-green-600 mt-1">✓ Final</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Placeholder Text */}
      {!transcript && !interimTranscript && !isListening && (
        <p className="text-xs text-gray-500 italic">{placeholder}</p>
      )}
    </div>
  )
}
