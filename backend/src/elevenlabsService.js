/**
 * Text-to-Speech Service for Mind Sanctuary
 * Uses ElevenLabs API for natural-sounding voices
 */

import fetch from 'node-fetch'

class ElevenLabsTTSService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY
    this.apiUrl = 'https://api.elevenlabs.io/v1'
    this.available = !!this.apiKey

    if (this.available) {
      console.log('✓ ElevenLabs TTS initialized')
    } else {
      console.warn('⚠ ElevenLabs API key not configured')
    }

    // Available voices for users to choose from
    this.availableVoices = [
      {
        id: 'DODLEQrClDo8wCz460ld',
        name: 'Default Voice',
        gender: 'neutral',
        description: 'Natural, versatile voice'
      },
      {
        id: 'Cz0K1kOv9tD8l0b5Qu53',
        name: 'Male Voice',
        gender: 'male',
        description: 'Deep, grounded male voice'
      }
    ]

    // Voice IDs mapped to companions
    // Using custom voices from ElevenLabs
    const defaultVoiceId = 'DODLEQrClDo8wCz460ld'
    const maleVoiceId = 'Cz0K1kOv9tD8l0b5Qu53'
    
    this.companionVoices = {
      lauren: {
        voiceId: defaultVoiceId,
        name: 'Lauren',
        stability: 0.75,
        similarityBoost: 0.75
      },
      jon: {
        voiceId: maleVoiceId,
        name: 'Jon',
        stability: 0.70,
        similarityBoost: 0.80
      }
    }
  }

  /**
   * Get all available voices for selection
   */
  getAvailableVoiceOptions() {
    return this.availableVoices
  }

  /**
   * Synthesize speech using ElevenLabs with streaming for faster playback
   * Returns audio buffer
   */
  async synthesizeSpeech(text, companionId = 'luna') {
    if (!this.available) {
      throw new Error('ElevenLabs API key not configured')
    }

    const voiceProfile = this.companionVoices[companionId] || this.companionVoices.luna

    try {
      const response = await fetch(
        `${this.apiUrl}/text-to-speech/${voiceProfile.voiceId}?optimize_streaming_latency=4`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: voiceProfile.stability,
              similarity_boost: voiceProfile.similarityBoost
            }
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`ElevenLabs error: ${response.status} - ${error}`)
      }

      // Return audio buffer
      return await response.buffer()
    } catch (error) {
      console.error('ElevenLabs synthesis error:', error)
      throw error
    }
  }

  /**
   * Get available voices from ElevenLabs account
   */
  async getAvailableVoices() {
    if (!this.available) {
      return Object.values(this.companionVoices)
    }

    try {
      const response = await fetch(`${this.apiUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`)
      }

      const data = await response.json()
      return data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        previewUrl: voice.preview_url
      }))
    } catch (error) {
      console.error('Error fetching voices:', error)
      return Object.values(this.companionVoices)
    }
  }

  /**
   * Check if ElevenLabs is available
   */
  isAvailable() {
    return this.available
  }

  /**
   * Get voice for companion
   */
  getVoiceForCompanion(companionId) {
    return this.companionVoices[companionId] || this.companionVoices.luna
  }
}

export default ElevenLabsTTSService
