import React, { useState, useEffect } from 'react'
import { getTextToSpeech } from '../utils/voiceUtils'

/**
 * VoiceSelector Component
 * Allows users to select their favorite avatar voice
 * Preview voices and set preferences
 */
export default function VoiceSelector({ onVoiceSelected = null }) {
  const [voices, setVoices] = useState([])
  const [voicesByGender, setVoicesByGender] = useState({ male: [], female: [], neutral: [] })
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const [previewText, setPreviewText] = useState('Hello! I am your Mind Sanctuary companion. I am here to listen and support you.')
  const [activeTab, setActiveTab] = useState('female')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)
  const [loading, setLoading] = useState(true)

  const tts = getTextToSpeech()

  useEffect(() => {
    const loadVoices = async () => {
      // Add a small delay to ensure voices are loaded
      await new Promise(resolve => setTimeout(resolve, 100))
      const allVoices = tts.getAvailableVoices()
      const byGender = tts.getVoicesByGender()
      
      setVoices(allVoices)
      setVoicesByGender({
        male: byGender.male.map((v, i) => ({ ...v, index: tts.voices.indexOf(v) })),
        female: byGender.female.map((v, i) => ({ ...v, index: tts.voices.indexOf(v) })),
        neutral: byGender.neutral.map((v, i) => ({ ...v, index: tts.voices.indexOf(v) }))
      })

      // Load saved voice preference
      const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex')
      if (savedVoiceIndex) {
        setSelectedVoiceIndex(parseInt(savedVoiceIndex))
        tts.selectVoice(parseInt(savedVoiceIndex))
      } else if (byGender.female.length > 0) {
        // Default to first female voice
        const firstFemaleIndex = tts.voices.indexOf(byGender.female[0])
        setSelectedVoiceIndex(firstFemaleIndex)
        tts.selectVoice(firstFemaleIndex)
      }

      setLoading(false)
    }

    loadVoices()
  }, [])

  const handlePreviewVoice = (voiceIndex) => {
    if (isPlayingPreview) {
      tts.stop()
      setIsPlayingPreview(false)
      return
    }

    setIsPlayingPreview(true)
    tts.selectVoice(voiceIndex)
    
    tts.speak(previewText, {
      rate,
      pitch,
      volume,
      onEnd: () => setIsPlayingPreview(false),
      onError: (error) => {
        console.error('Error speaking:', error)
        setIsPlayingPreview(false)
      }
    })
  }

  const handleSelectVoice = (voiceIndex) => {
    setSelectedVoiceIndex(voiceIndex)
    tts.selectVoice(voiceIndex)
    localStorage.setItem('selectedVoiceIndex', voiceIndex)
    
    if (onVoiceSelected) {
      onVoiceSelected(voiceIndex, tts.voices[voiceIndex])
    }
  }

  const getGenderEmoji = (gender) => {
    switch (gender) {
      case 'female': return '👩'
      case 'male': return '👨'
      case 'neutral': return '🧑'
      default: return '🗣️'
    }
  }

  const getLanguageFlag = (lang) => {
    const langCode = lang?.split('-')[1]?.toUpperCase()
    if (langCode === 'US') return '🇺🇸'
    if (langCode === 'GB') return '🇬🇧'
    if (langCode === 'AU') return '🇦🇺'
    if (langCode === 'CA') return '🇨🇦'
    if (langCode === 'IE') return '🇮🇪'
    if (langCode === 'IN') return '🇮🇳'
    return '🌍'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Loading available voices...</p>
      </div>
    )
  }

  if (voices.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <p className="text-yellow-800 font-semibold">🔊 Voice Support Not Available</p>
        <p className="text-yellow-700 text-sm mt-2">
          Your browser doesn't support text-to-speech. Try using Chrome, Firefox, Safari, or Edge.
        </p>
      </div>
    )
  }

  const currentGenderVoices = voicesByGender[activeTab]

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🗣️ Choose Your Avatar's Voice</h2>
      <p className="text-gray-600 mb-6">Select a voice that resonates with you. This is how your companion will speak to you.</p>

      {/* Preview Settings */}
      <div className="bg-white p-4 rounded-lg mb-6 border-l-4 border-purple-500">
        <h3 className="font-semibold text-gray-800 mb-3">Voice Settings</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Speed: <span className="text-purple-600 font-semibold">{(rate * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Pitch: <span className="text-purple-600 font-semibold">{(pitch * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Volume: <span className="text-purple-600 font-semibold">{(volume * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-700 mb-2">Preview Text</label>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            rows="2"
          />
        </div>
      </div>

      {/* Voice Gender Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-300">
        {['female', 'male', 'neutral'].map(gender => (
          <button
            key={gender}
            onClick={() => setActiveTab(gender)}
            className={`px-4 py-2 font-semibold transition capitalize border-b-2 ${
              activeTab === gender
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-purple-600'
            }`}
          >
            {getGenderEmoji(gender)} {gender}
          </button>
        ))}
      </div>

      {/* Voice List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {currentGenderVoices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No voices available in this category</p>
        ) : (
          currentGenderVoices.map((voice, idx) => (
            <div
              key={voice.index}
              onClick={() => handleSelectVoice(voice.index)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedVoiceIndex === voice.index
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{voice.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {getLanguageFlag(voice.lang)} {voice.lang}
                    {voice.localService && ' • Local'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedVoiceIndex === voice.index && (
                    <span className="text-purple-600 font-bold">✓ Selected</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviewVoice(voice.index)
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      isPlayingPreview && selectedVoiceIndex === voice.index
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {isPlayingPreview && selectedVoiceIndex === voice.index ? '⏹️ Stop' : '▶️ Preview'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedVoiceIndex !== null && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ Your avatar will speak in this voice
          </p>
          <p className="text-green-700 text-sm mt-1">
            You can change this anytime in your settings.
          </p>
        </div>
      )}
    </div>
  )
}
