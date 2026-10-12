/**
 * Claude Service for Mind Sanctuary
 * Reflection-focused companion (NOT therapy, NOT open-ended chat)
 * Integrates with Anthropic Claude API
 * 
 * Philosophy:
 * - Help users understand THEIR OWN patterns through conversation
 * - Never replace therapy or professional help
 * - Bounded, safe, transparent, privacy-first
 * - Conversation serves the pattern engine, not the reverse
 */

import Anthropic from '@anthropic-ai/sdk'

class ClaudeReflectionService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    })
    this.model = 'claude-opus-5-5'
    this.maxTokens = 800
    this.timeout = 120000

    // Crisis detection settings
    this.crisisKeywords = [
      'suicide', 'kill myself', 'die', 'harm myself', 'won\'t make it',
      'no point', 'everyone would be better off', 'self harm', 'cutting',
      'overdose', 'jump', 'hang myself', 'end it all', 'don\'t want to live'
    ]
    this.ambiguousKeywords = ['sad', 'depressed', 'hopeless', 'worthless', 'lonely', 'broken']
  }

  /**
   * Analyze user message for crisis indicators
   * Returns: 'clear', 'ambiguous', or 'low'
   */
  analyzeCrisisRisk(text) {
    const lowerText = text.toLowerCase()
    
    const hasClearCrisis = this.crisisKeywords.some(keyword => lowerText.includes(keyword))
    if (hasClearCrisis) return 'clear'

    const hasAmbiguous = this.ambiguousKeywords.some(keyword => lowerText.includes(keyword))
    if (hasAmbiguous) return 'ambiguous'

    return 'low'
  }

  /**
   * Get crisis response based on risk level
   */
  getCrisisResponse(riskLevel) {
    if (riskLevel === 'clear') {
      return {
        type: 'CRISIS_ESCALATION',
        message: `I'm concerned about your safety. Please reach out to someone who can help right now:

**International Crisis Resources:**
🇦🇺 **Australia** - Call 13 11 14 (Lifeline)
🇻🇳 **Vietnam** - Please reach out to a trusted person or local mental health service
🇬🇧 **UK** - Call 116 123 (Samaritans)
🇺🇸 **USA** - Call or text 988 (Suicide & Crisis Lifeline)
🇨🇦 **Canada** - Call 1-833-456-4566 (Crisis Line)

Or go to your nearest emergency room. You deserve real help, and it's available now.`,
        escalate: true,
        sessionEnd: true
      }
    }

    if (riskLevel === 'ambiguous') {
      return {
        type: 'CRISIS_CHECK_IN',
        message: `I hear that you're struggling right now. That's real and valid.

I want to check: Are you thinking about hurting yourself? If you are, please reach out to a crisis line in your country or a trusted person who can help.

If you're just going through a tough time, I'm here to reflect with you. What's happening?`,
        escalate: false,
        sessionEnd: false
      }
    }

    return null
  }

  /**
   * Build system prompt for reflection companion
   * This is the core: pattern-focused, not therapy, transparent
   */
  _buildReflectionPrompt(userContext = {}, sessionMode = 'guided') {
    const {
      avatarName = 'Your Companion',
      avatarPersonality = 'warm and supportive',
      userName = '',
      recentCheckIns = [],
      detectedPatterns = [],
      mainConcern = 'general wellness'
    } = userContext

    // Format check-in data for context
    let checkInSummary = ''
    if (recentCheckIns.length > 0) {
      const recent = recentCheckIns.slice(0, 5)
      checkInSummary = `\n\nToday's check-in data:\n${
        recent.map(c => `- ${new Date(c.timestamp).toLocaleTimeString()}: Mood ${c.mood}/10, Sleep ${c.sleep?.hours}h, Stress ${c.stress?.level}/10`).join('\n')
      }`
    } else {
      checkInSummary = '\n\nNo check-ins yet today.'
    }

    let patternSummary = ''
    if (detectedPatterns.length > 0) {
      patternSummary = `\n\nPatterns we've noticed:\n${
        detectedPatterns.map(p => `- ${p.description} (${p.correlation}% correlation)`).join('\n')
      }`
    }

    const systemPrompt = `You are ${avatarName}, a reflection companion for ${userName || 'the user'}.

YOUR ROLE (important):
- Help the user understand THEIR OWN patterns through conversation
- Ask clarifying questions about their check-ins and data
- Reflect back what you notice in their patterns
- Support reflection, not give advice
- You are NOT a therapist, counselor, or medical professional
- You are NOT a substitute for professional mental health care

CORE PRINCIPLES:
1. Be honest: You're an AI (Claude, by Anthropic). You have limits.
2. Be bounded: This is a reflection session, not therapy.
3. Be data-grounded: Reference the user's actual check-ins and patterns.
4. Be safe: If someone mentions crisis thoughts, escalate immediately to real resources.
5. Be transparent: Explain your reasoning and acknowledge uncertainty.

YOUR PERSONALITY:
${avatarPersonality}

CONVERSATION STYLE:
- Listen first, ask questions second
- When you notice a pattern, ask if they see it too
- Use "I notice..." and "I wonder..." rather than "You should..."
- Keep responses conversational (2-4 sentences typically)
- Ask one clear question to deepen understanding
- Validate their feelings without fixing them
- Remember: Check-ins are quick wellness surveys. Multiple check-ins today just mean the user did the survey multiple times, NOT that they logged in multiple times.

SESSION MODE: ${sessionMode}
${sessionMode === 'quick' ? '- Keep this brief (5-10 min)' : '- This is a guided 15-30 min reflection'}
${sessionMode === 'guided' ? '- Help them explore one specific pattern or concern' : ''}

${checkInSummary}${patternSummary}

CRITICAL SAFETY:
If the user mentions suicide, self-harm, or crisis thoughts:
- STOP the reflection immediately
- Provide crisis resources (see your safety instructions)
- Do NOT try to talk them through it
- Do NOT minimize their distress
- Escalate to real human help

Remember: Your job is to help them see their own patterns, not to be their emotional support system.`

    return systemPrompt
  }

  /**
   * Generate reflection response for bounded session
   */
  async generateReflection(userMessage, context = {}, sessionMode = 'guided') {
    try {
      // First: Check for crisis
      const crisisRisk = this.analyzeCrisisRisk(userMessage)
      if (crisisRisk !== 'low') {
        const crisisResponse = this.getCrisisResponse(crisisRisk)
        return {
          message: crisisResponse.message,
          type: crisisResponse.type,
          escalate: crisisResponse.escalate,
          sessionEnd: crisisResponse.sessionEnd
        }
      }

      // Second: Generate reflection
      const systemPrompt = this._buildReflectionPrompt(context, sessionMode)
      
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      }, { timeout: this.timeout })

      if (response.content && response.content.length > 0) {
        const textBlock = response.content.find(block => block.type === 'text')
        if (textBlock) {
          return {
            message: textBlock.text,
            type: 'REFLECTION',
            escalate: false,
            sessionEnd: false
          }
        }
      }

      throw new Error('No text in response')
    } catch (error) {
      console.error('Reflection generation error:', error)
      return {
        message: 'I had trouble understanding that. Could you rephrase what you said?',
        type: 'ERROR',
        escalate: false,
        sessionEnd: false
      }
    }
  }

  /**
   * Continue multi-turn reflection conversation
   */
  async continueReflection(messages, context = {}, sessionMode = 'guided') {
    try {
      // Check latest user message for crisis
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      if (lastUserMessage) {
        const crisisRisk = this.analyzeCrisisRisk(lastUserMessage.content)
        if (crisisRisk !== 'low') {
          const crisisResponse = this.getCrisisResponse(crisisRisk)
          return {
            message: crisisResponse.message,
            type: crisisResponse.type,
            escalate: crisisResponse.escalate,
            sessionEnd: crisisResponse.sessionEnd
          }
        }
      }

      const systemPrompt = this._buildReflectionPrompt(context, sessionMode)
      
      // Convert to Claude format
      const claudeMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: systemPrompt,
        messages: claudeMessages
      }, { timeout: this.timeout })

      if (response.content && response.content.length > 0) {
        const textBlock = response.content.find(block => block.type === 'text')
        if (textBlock) {
          return {
            message: textBlock.text,
            type: 'REFLECTION',
            escalate: false,
            sessionEnd: false
          }
        }
      }

      throw new Error('No text in response')
    } catch (error) {
      console.error('Reflection continuation error:', error)
      return {
        message: 'I had trouble understanding that. Could you tell me more?',
        type: 'ERROR',
        escalate: false,
        sessionEnd: false
      }
    }
  }

  /**
   * Get transparent system instructions for user to read
   */
  getTransparentInstructions() {
    return {
      role: 'I am Claude, an AI reflection companion made by Anthropic.',
      purpose: 'Help you understand your own patterns through conversation.',
      scope: 'This is a reflection tool, not therapy or medical advice.',
      safety: 'I will escalate to crisis resources if you mention self-harm or suicide.',
      honesty: [
        'I am an AI, not a human therapist',
        'I can make mistakes or miss important context',
        'I cannot replace professional mental health care',
        'You should talk to a real counselor for serious concerns',
        'I remember only what you tell me in this session'
      ],
      privacy: [
        'Your conversations are stored securely',
        'You can view, edit, or delete any conversation',
        'You can choose whether to let me remember things',
        'I never share your data with third parties',
        'You control what data I can reference'
      ],
      sessionLimits: [
        'This reflection session is 15-30 minutes maximum (or 5-10 for quick mode)',
        'Sessions are independent - I start fresh if you close and return',
        'This is not continuous therapy',
        'If you need ongoing support, please see a therapist'
      ]
    }
  }

  /**
   * Test connection to Claude API
   */
  async testConnection() {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 50,
        system: 'You are a helpful assistant. Respond briefly.',
        messages: [
          {
            role: 'user',
            content: 'Say "Connected!" if you can read this.'
          }
        ]
      }, { timeout: 30000 })

      return response.content && response.content.length > 0
    } catch (error) {
      console.error('Claude connection test failed:', error)
      return false
    }
  }
}

export default ClaudeReflectionService
