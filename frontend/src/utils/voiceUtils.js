/**
 * Voice Utilities for Mind Sanctuary
 * Handles Speech-to-Text (STT) using Web Speech API
 * Handles Text-to-Speech (TTS) using ElevenLabs API for natural voices
 */

// Speech Recognition (STT) - Web Speech API
class SpeechToTextHandler {
  constructor(language = 'en-US') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      this.supported = false
      return
    }
    this.supported = true
    this.recognition = new SpeechRecognition()
    this.isListening = false
    this.transcript = ''
    
    // Configure recognition
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.language = language
    this.recognition.lang = language
  }

  setLanguage(language) {
    this.language = language
    this.recognition.lang = language
  }

  start(onResult, onError, onEnd) {
    if (!this.supported) {
      onError('Speech Recognition not supported')
      return
    }

    this.isListening = true
    this.transcript = ''

    this.recognition.onstart = () => {
      console.log('Speech recognition started')
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        
        if (event.results[i].isFinal) {
          this.transcript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = this.transcript + interimTranscript
      onResult(fullTranscript, event.results[event.results.length - 1]?.isFinal)
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      onError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      const finalTranscript = this.transcript.trim()
      onEnd(finalTranscript)
    }

    try {
      this.recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      onError('Failed to start speech recognition')
    }
  }

  stop() {
    if (this.supported && this.isListening) {
      this.recognition.stop()
    }
  }

  abort() {
    if (this.supported) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  isSupported() {
    return this.supported
  }
}

// Text-to-Speech (TTS) - ElevenLabs API for natural voices
class TextToSpeechHandler {
  constructor(language = 'en-US', apiUrl = 'http://localhost:3002') {
    this.supported = true
    this.isSpeaking = false
    this.currentAudio = null
    this.language = language
    this.apiUrl = apiUrl
    console.log('TextToSpeechHandler initialized with API URL:', apiUrl)
  }

  setLanguage(language) {
    this.language = language
  }

  getLanguage() {
    return this.language
  }

  /**
   * Speak text using ElevenLabs API with optimized latency
   */
  async speak(text, options = {}) {
    if (this.isSpeaking) {
      console.log('Already speaking, stopping current audio')
      this.stop()
    }

    const {
      companionId = 'lauren',
      onStart = null,
      onEnd = null,
      onError = null
    } = options

    this.isSpeaking = true
    const startTime = performance.now()
    console.log('TTS: Starting speech for companion:', companionId)

    if (onStart) {
      onStart()
    }

    try {
      // Call backend TTS endpoint with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
      
      console.log('TTS: Calling API endpoint:', `${this.apiUrl}/api/tts/synthesize`)
      const response = await fetch(`${this.apiUrl}/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          companionId
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log('TTS: API response status:', response.status, 'Time:', performance.now() - startTime)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`TTS API failed: ${response.status} - ${errorText}`)
      }

      // Get audio blob
      const audioBlob = await response.blob()
      console.log('TTS: Received audio blob, size:', audioBlob.size, 'Time:', performance.now() - startTime)
      
      const audioUrl = URL.createObjectURL(audioBlob)

      // Create audio element and start playback immediately
      this.currentAudio = new Audio(audioUrl)
      
      this.currentAudio.onended = () => {
        console.log('TTS: Audio playback ended, total time:', performance.now() - startTime)
        this.isSpeaking = false
        if (onEnd) onEnd()
        URL.revokeObjectURL(audioUrl)
      }

      this.currentAudio.onerror = (error) => {
        console.error('TTS: Audio playback error:', error)
        this.isSpeaking = false
        if (onError) onError(error)
        URL.revokeObjectURL(audioUrl)
      }

      // Play audio immediately
      console.log('TTS: Starting audio playback, time from request:', performance.now() - startTime)
      const playPromise = this.currentAudio.play()
      
      // Handle play promise for modern browsers
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('TTS: Error playing audio:', error)
          this.isSpeaking = false
          if (onError) onError(error)
        })
      }
      
      return true
    } catch (error) {
      console.error('TTS error:', error)
      this.isSpeaking = false
      if (onError) onError(error)
      return false
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.isSpeaking = false
    }
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause()
    }
  }

  resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play()
    }
  }

  isSpeakingNow() {
    return this.isSpeaking
  }

  isSupported() {
    return this.supported
  }

  // Dummy methods for compatibility
  getAvailableVoices() {
    return []
  }

  selectBestEnglishVoice() {
    return true
  }

  selectVoice() {
    return true
  }

  getSelectedVoice() {
    return null
  }
}

// Create singleton instances with English default
let sttInstance = null
let ttsInstance = null

export function getSpeechToText(language = 'en-US') {
  if (!sttInstance) {
    sttInstance = new SpeechToTextHandler(language)
  }
  return sttInstance
}

export function getTextToSpeech(language = 'en-US', apiUrl = 'http://localhost:3002') {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechHandler(language, apiUrl)
  }
  return ttsInstance
}

// Helper to check if voice is available
export function isVoiceSupported() {
  // Voice is supported as long as we have speech recognition (for input)
  // TTS now uses ElevenLabs API, so it doesn't depend on browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  return !!SpeechRecognition
}

// Helper to speak with default settings
export function speak(text, companionId = 'luna', apiUrl = 'http://localhost:3002') {
  const tts = getTextToSpeech('en-US', apiUrl)
  return tts.speak(text, { companionId })
}

// Helper to listen and get transcript
export function listen(onResult, onError, onEnd) {
  const stt = getSpeechToText()
  stt.start(onResult, onError, onEnd)
}

export default {
  getSpeechToText,
  getTextToSpeech,
  isVoiceSupported,
  speak,
  listen
}
