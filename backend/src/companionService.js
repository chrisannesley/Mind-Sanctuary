/**
 * Companion Service for Mind Sanctuary
 * Manages AI companions with personalities, voices, and avatars
 */

import Replicate from 'replicate'

class CompanionService {
  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })

    // Cache for generated avatars
    this.avatarCache = {}

    // Define companion profiles
    this.companions = {
      lauren: {
        id: 'lauren',
        name: 'Lauren',
        role: 'Reflection Companion',
        personality: 'warm, relaxed, approachable',
        description: 'A warm and approachable companion who creates space for genuine reflection',
        voiceStyle: 'warm, natural, conversational voice',
        systemPromptAddition: 'You embody Lauren: warm, relaxed, and approachable. Speak naturally and conversationally. Make space for reflection.',
        avatar: '/lauren-avatar.jpg',
        color: 'from-rose-50 to-pink-50',
        icon: '💕'
      },
      jon: {
        id: 'jon',
        name: 'Jon',
        role: 'Reflection Companion',
        personality: 'warm, relaxed, approachable',
        description: 'A warm and approachable companion who listens and helps you reflect',
        voiceStyle: 'warm, natural, grounded voice',
        systemPromptAddition: 'You embody Jon: warm, relaxed, and approachable. Speak naturally and conversationally. Make space for reflection.',
        avatar: '/jon-avatar.jpg',
        color: 'from-blue-50 to-cyan-50',
        icon: '💙'
      }
    }

    // Voice IDs mapped to companions
    // To change a voice: replace the voiceId with any ElevenLabs voice ID
    // Find voices at: https://elevenlabs.io/voice-library
    this.companionVoices = {
      lauren: {
        voiceId: 'M7wzTk2Y1hGQyRzr9sbS', // ← Lauren's voice ID — change this to update her voice
        name: 'Lauren',
        stability: 0.75,
        similarityBoost: 0.75
      },
      jon: {
        voiceId: 'Cz0K1kOv9tD8l0b5Qu53', // ← Jon's voice ID — change this to update his voice
        name: 'Jon',
        stability: 0.70,
        similarityBoost: 0.80
      }
    }
  }

  /**
   * Get all companions
   */
  getAllCompanions() {
    return Object.values(this.companions).map(c => ({
      ...c,
      avatar: c.avatar // Include avatar if generated
    }))
  }

  /**
   * Get specific companion
   */
  getCompanion(companionId) {
    return this.companions[companionId] || this.companions.lauren
  }

  /**
   * Generate avatar for a companion using Replicate
   * Uses Stable Diffusion or similar model
   * Includes caching to avoid regenerating
   */
  async generateCompanionAvatar(companionId) {
    try {
      const companion = this.companions[companionId]
      if (!companion) throw new Error('Companion not found')

      // Check cache first
      if (this.avatarCache[companionId]) {
        console.log(`Using cached avatar for ${companion.name}`)
        return this.avatarCache[companionId]
      }

      console.log(`Generating avatar for ${companion.name}...`)

      const prompt = this._buildAvatarPrompt(companion)

      // Add delay to avoid rate limiting (Replicate free tier is ~1 request per 5 seconds)
      const delayMs = 5000
      await new Promise(resolve => setTimeout(resolve, delayMs))

      // Use Replicate to generate avatar image
      // Using a smaller, faster model to avoid timeout and rate limit issues
      const output = await this.replicate.run(
        'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041529f3fb84050acd9e41d42cb7a9c0b',
        {
          prompt: prompt,
          negative_prompt: 'low quality, blurry, distorted, unrealistic, deformed',
          num_outputs: 1,
          height: 256,
          width: 256,
          num_inference_steps: 25,
          guidance_scale: 7.0,
          scheduler: 'euler'
        }
      )

      if (output && output.length > 0) {
        const avatarUrl = output[0]
        this.avatarCache[companionId] = avatarUrl
        companion.avatar = avatarUrl
        console.log(`Avatar generated for ${companion.name}: ${avatarUrl}`)
        return avatarUrl
      }

      throw new Error('No image generated')
    } catch (error) {
      console.error(`Error generating avatar for ${companionId}:`, error.message)
      // Return a placeholder avatar URL instead of failing completely
      // This allows the app to continue working even if avatar generation fails
      const fallbackAvatars = {
        lauren: 'https://via.placeholder.com/256/f472b6/ffffff?text=Lauren+💕',
        jon: 'https://via.placeholder.com/256/06b6d4/ffffff?text=Jon+💙'
      }
      const fallbackUrl = fallbackAvatars[companionId] || fallbackAvatars.lauren
      this.avatarCache[companionId] = fallbackUrl
      return fallbackUrl
    }
  }

  /**
   * Build avatar prompt based on companion personality
   */
  _buildAvatarPrompt(companion) {
    const prompts = {
      lauren: 'A warm, approachable woman with a kind, open expression, natural and inviting presence, gentle and grounded energy, professional portrait illustration style, high quality',
      jon: 'A warm, approachable man with a kind, open expression, natural and inviting presence, calm and grounded energy, professional portrait illustration style, high quality'
    }

    return prompts[companion.id] || 'A warm, approachable person with kind expression, professional portrait style'
  }

  /**
   * Get companion for session mode
   * Smart recommendation based on session type
   */
  recommendCompanionForMode(sessionMode) {
    // Both companions are equally suited - just return the first one
    return this.companions.lauren
  }

  /**
   * Get enhanced system prompt for reflection with companion
   */
  getCompanionEnhancedPrompt(basePrompt, companionId) {
    const companion = this.companions[companionId] || this.companions.lauren

    return `${basePrompt}

COMPANION CHARACTER: ${companion.name}
${companion.systemPromptAddition}

Remember to:
- Embody this companion's unique personality and voice
- Maintain consistency with their character throughout the session
- Let their personality guide your response style, tone, and approach`
  }
}

export default CompanionService
