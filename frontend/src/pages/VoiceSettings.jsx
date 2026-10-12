import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VoiceSelector from '../components/VoiceSelector'
import { getTextToSpeech } from '../utils/voiceUtils'

/**
 * VoiceSettings Page
 * Allows users to configure their voice preferences
 * Choose avatar voice, adjust speed/pitch, test settings
 */
export default function VoiceSettings({ user, userId }) {
  const navigate = useNavigate()
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(null)
  const [testMessage, setTestMessage] = useState('Hello! I am your companion. How are you feeling today?')
  const tts = getTextToSpeech()

  const handleVoiceSelected = (voiceIndex, voiceData) => {
    setSelectedVoiceIndex(voiceIndex)
    // Could save to backend here
  }

  const handleTestVoice = () => {
    if (selectedVoiceIndex !== null) {
      tts.selectVoice(selectedVoiceIndex)
      tts.speak(testMessage, { rate: 1, pitch: 1, volume: 1 })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">🗣️ Voice Settings</h1>
        <p className="text-lg opacity-90">Personalize how your avatar companion speaks to you</p>
      </div>

      {/* Voice Selector */}
      <div>
        <VoiceSelector onVoiceSelected={handleVoiceSelected} />
      </div>

      {/* Test Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🧪 Test Your Voice</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Test Message
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
            />
          </div>

          <button
            onClick={handleTestVoice}
            disabled={selectedVoiceIndex === null}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
          >
            🔊 Play Test
          </button>
        </div>
      </div>

      {/* Voice Usage Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📱 Voice Input</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Click the microphone button to speak</li>
            <li>• Speak clearly and naturally</li>
            <li>• Your words appear in the transcript</li>
            <li>• Works in check-ins and with your avatar</li>
            <li>• Available on phone, tablet, and desktop</li>
          </ul>
        </div>

        <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-purple-900 mb-3">🔊 Voice Output</h3>
          <ul className="text-purple-800 space-y-2 text-sm">
            <li>• Your companion speaks responses to you</li>
            <li>• Uses the voice you selected here</li>
            <li>• Adjust speed and pitch above</li>
            <li>• Always have text as fallback</li>
            <li>• Can pause/resume speaking anytime</li>
          </ul>
        </div>
      </div>

      {/* Browser Compatibility */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">🌐 Browser Compatibility</h3>
        <p className="text-yellow-800 text-sm mb-3">
          Voice features work best on modern browsers:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'Chrome', emoji: '✅' },
            { name: 'Firefox', emoji: '✅' },
            { name: 'Safari', emoji: '✅' },
            { name: 'Edge', emoji: '✅' },
            { name: 'Opera', emoji: '⚠️' },
            { name: 'IE', emoji: '❌' }
          ].map(browser => (
            <div key={browser.name} className="p-2 bg-white rounded text-center text-sm">
              <span className="text-xl">{browser.emoji}</span>
              <p className="text-gray-700 font-semibold">{browser.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-green-900 mb-2">🔒 Your Privacy</h3>
        <ul className="text-green-800 text-sm space-y-2">
          <li>✓ Voice input is processed locally on your device</li>
          <li>✓ Voice output is generated locally on your device</li>
          <li>✓ No audio is recorded or sent to servers</li>
          <li>✓ Your voice preferences are saved in your browser</li>
          <li>✓ You control when voice features are active</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition"
        >
          ← Back to Home
        </button>
        <button
          onClick={() => navigate('/avatar')}
          className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
        >
          Go to Avatar Chat →
        </button>
      </div>
    </div>
  )
}
