import React, { useState, useEffect, useRef } from 'react'
import HumanAvatar from '../components/HumanAvatar'
import Modal from '../components/Modal'
import { generateRealisticAvatar, getRandomAvatarName, getRandomPersonality } from '../utils/avatarGenerator'

function AvatarChat({ user, userId }) {
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [avatarImage, setAvatarImage] = useState(null)
  const [avatarName, setAvatarName] = useState('Your Support Companion')
  const [loadingAvatar, setLoadingAvatar] = useState(false)
  const messagesEndRef = useRef(null)

  // Sample questions based on mental health concern
  const questionsByConcern = {
    depression: [
      "How have you been sleeping lately?",
      "What's one thing that brought you joy today?",
      "Are you taking care of yourself physically?",
      "How are your energy levels today?",
      "Have you reached out to anyone today?",
      "What's been the hardest part of your day?",
      "What would help you feel a bit better right now?"
    ],
    anxiety: [
      "What's been worrying you most today?",
      "Have you tried any grounding techniques?",
      "How's your breathing right now?",
      "What usually helps calm you down?",
      "Are you feeling overwhelmed?",
      "What's one thing you can control right now?",
      "Would it help to talk about what's on your mind?"
    ],
    ptsd: [
      "How are you feeling right now?",
      "Have you had any triggers today?",
      "What's a safe place for you?",
      "Would grounding techniques help?",
      "How's your support system?",
      "What helps you feel safe?",
      "Would you like to talk about what happened?"
    ],
    'general wellness': [
      "How are you feeling today?",
      "What's been on your mind?",
      "Have you done anything for yourself today?",
      "What's one positive thing that happened?",
      "How can I support you?",
      "What would make today better?",
      "Are you taking care of your mental health?"
    ]
  }

  const supportiveResponses = {
    positive: [
      "That's wonderful to hear! I'm genuinely happy for you. Keep up that positive momentum - you're doing amazing.",
      "I'm so glad you're taking care of yourself. That's really important, and it shows real strength. Keep going.",
      "You're doing great! I can see you're making positive choices for yourself. That takes real courage.",
      "That's a really healthy approach. I'm genuinely proud of you for taking these steps.",
      "You're showing real strength here. The fact that you're feeling good tells me you're on the right path."
    ],
    struggling: [
      `I hear you, and I'm really sorry you're not doing well today. That sounds tough. ${user?.name ? `${user.name}, ` : ''}thank you for being honest with me about how you're really feeling. Can you tell me what's been making today particularly difficult? Is there something specific that's been weighing on you, or is it just one of those days where everything feels harder? I'm here to listen without judgment.`,
      
      `Thank you for sharing that with me, ${user?.name || 'friend'}. I appreciate your honesty about not doing great today. That takes courage. Can you tell me more about what's been going on? What's making today feel this way? Is it something specific, or has it been building up? I'm here to listen to whatever you need to talk about.`,
      
      `I hear you - not doing great today. I'm sorry you're going through this. ${user?.name ? `${user.name}, ` : ''}I want you to know that what you're feeling is valid, and I'm here for you. Can you help me understand what's been happening? What's been the hardest part of today for you? Please feel free to share - everything you tell me stays between us.`,
      
      `I'm sorry to hear you're not doing well today. Thank you for trusting me with that. ${user?.name ? `${user.name}, ` : ''}I really want to understand what you're going through. Can you tell me what's been making today difficult? Is there something specific that's been on your mind, or are you just feeling overwhelmed in general? I'm listening, and I care.`,
      
      `Not doing great today - I hear you, and I'm glad you felt comfortable sharing that with me. ${user?.name ? `${user.name}, ` : ''}that's completely valid. Some days are just harder than others. Can you tell me what's been going on? What would help you feel a bit better right now? I'm here to support you through this.`
    ],
    neutral: [
      `Tell me more about that, ${user?.name || 'friend'}. I'm genuinely interested in what you're thinking and feeling.`,
      `That's interesting. How does that make you feel? I'd love to understand more about what's going on in your mind right now.`,
      `I'm listening, and I really care about what you're saying. What else is on your mind? Feel free to share as much as you'd like.`,
      `That's important to me. I want to understand you better. How can I support you right now? What would help?`,
      `I understand. Thank you for sharing that with me. What would help you feel a bit better right now? I'm here for you.`,
      `I hear you. That sounds like something that's been on your mind. Can you tell me more about it? I'm here to listen and support you.`
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Generate initial avatar on component mount
  useEffect(() => {
    generateAvatarImage()
  }, [])

  const startSession = () => {
    setSessionStarted(true)
    setShowModal(false)
    const concern = user?.mainConcern?.toLowerCase() || 'general wellness'
    const userName = user?.name || 'there'
    
    // More warm and welcoming greeting
    const greetings = [
      `Hi ${userName}! 👋 I'm so glad you're here. I'm ${avatarName.split(' - ')[0]}, and I'm here to listen and support you. How are you feeling today?`,
      `Hello ${userName}! 💙 Welcome. I'm ${avatarName.split(' - ')[0]}, and I want you to know that this is a safe space for you to share whatever's on your mind. How are things going for you?`,
      `Hi ${userName}! 🌟 I'm ${avatarName.split(' - ')[0]}, and I'm really glad you're here. I'm here to listen without judgment. What's been going on with you lately?`,
      `Welcome, ${userName}! 💬 I'm ${avatarName.split(' - ')[0]}, and I'm here for you. This is your space to share anything you'd like. How are you doing today?`
    ]
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)]
    setAvatarMessage(greeting)
    setMessages([{ type: 'avatar', text: greeting }])
  }

  const generateAvatarImage = async () => {
    setLoadingAvatar(true)
    try {
      const avatarUrl = await generateRealisticAvatar()
      setAvatarImage(avatarUrl)
      
      // Also generate a random name and personality
      const name = getRandomAvatarName()
      const personality = getRandomPersonality()
      setAvatarName(`${name} - ${personality}`)
      
    } catch (error) {
      console.error('Error generating avatar:', error)
      // Fallback
      setAvatarImage(`https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}&scale=80&backgroundColor=random`)
    }
    setLoadingAvatar(false)
  }

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    // Add user message
    const newMessages = [...messages, { type: 'user', text: userInput }]
    setMessages(newMessages)
    setUserInput('')

    // Simulate avatar thinking
    setIsAvatarSpeaking(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate avatar response
    const concern = user?.mainConcern?.toLowerCase() || 'general wellness'
    const questions = questionsByConcern[concern] || questionsByConcern['general wellness']
    
    // Determine response type based on user input with context-aware sentiment detection
    let responseType = 'neutral'
    const lowerInput = userInput.toLowerCase()
    
    // Count struggling indicators (these are more reliable)
    const strugglingKeywords = ['bad', 'worse', 'sad', 'struggling', 'difficult', 'hard', 'low', 'down', 
                                'depressed', 'anxious', 'worried', 'scared', 'overwhelmed', 'stressed', 'hurt',
                                'not doing', 'not feeling', 'not good', 'not great', 'not well', 'not okay',
                                'not okay', 'not okay', 'struggling with', 'dealing with', 'having trouble',
                                'having a hard time', 'having difficulty', 'can\'t', 'cannot', 'don\'t know',
                                'unsure', 'uncertain', 'confused', 'lost', 'empty', 'numb', 'tired', 'exhausted',
                                'worn out', 'burnt out', 'burnout', 'hopeless', 'helpless', 'alone', 'lonely',
                                'isolated', 'disconnected', 'broken', 'shattered', 'devastated', 'miserable']
    
    let strugglingScore = 0
    strugglingKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) {
        strugglingScore++
      }
    })
    
    // Count positive indicators (but be careful with context)
    const positiveKeywords = ['good', 'great', 'better', 'happy', 'amazing', 'wonderful', 'excellent', 
                              'fantastic', 'love', 'awesome', 'brilliant', 'wonderful', 'perfect', 'blessed',
                              'grateful', 'thankful', 'proud', 'accomplished', 'energized', 'motivated',
                              'inspired', 'hopeful', 'optimistic', 'positive', 'uplifted', 'joyful']
    
    let positiveScore = 0
    positiveKeywords.forEach(keyword => {
      if (lowerInput.includes(keyword)) {
        // Check if it's negated (not good, not great, etc.)
        const beforeKeyword = lowerInput.substring(Math.max(0, lowerInput.indexOf(keyword) - 10), lowerInput.indexOf(keyword))
        if (!beforeKeyword.includes('not ') && !beforeKeyword.includes('not\n') && !beforeKeyword.includes('don\'t')) {
          positiveScore++
        }
      }
    })
    
    // Determine response type based on scores
    if (strugglingScore > 0) {
      responseType = 'struggling'
    } else if (positiveScore > 0) {
      responseType = 'positive'
    } else {
      responseType = 'neutral'
    }

    const responses = supportiveResponses[responseType]
    const response = responses[Math.floor(Math.random() * responses.length)]
    
    // For struggling responses, don't add a generic follow-up - the response already includes the question
    let fullResponse = response
    
    // For positive and neutral, add contextual follow-up
    if (responseType !== 'struggling') {
      const followUpQuestions = {
        positive: [
          "What's been helping you feel this way?",
          "How long have you been feeling this good?",
          "What's one thing you did today that made you proud?",
          "Who have you shared this good news with?",
          "What would you like to do more of?"
        ],
        neutral: [
          "How long have you been feeling this way?",
          "Is there anything specific that's been on your mind?",
          "What do you think would help you feel better?",
          "Have you talked to anyone else about this?",
          "What's one thing you could do for yourself today?"
        ]
      }
      
      const followUpList = followUpQuestions[responseType] || followUpQuestions.neutral
      const followUp = followUpList[Math.floor(Math.random() * followUpList.length)]
      fullResponse = `${response} ${followUp}`
    }

    setAvatarMessage(fullResponse)
    setMessages(prev => [...prev, { type: 'avatar', text: fullResponse }])
    setIsAvatarSpeaking(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat with Your Support Companion</h1>
        <p className="text-gray-600 mb-6">Have a supportive conversation with your AI companion</p>

        {!sessionStarted ? (
          <div className="text-center py-12">
            <div className="mb-6">
              {loadingAvatar ? (
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="animate-spin">⏳</div>
                </div>
              ) : avatarImage ? (
                <img
                  src={avatarImage}
                  alt="Your Support Companion"
                  className="w-32 h-32 mx-auto rounded-full border-4 border-mindwell-500 object-cover"
                />
              ) : (
                <div className="text-6xl mb-4">👤</div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to chat?</h2>
            <p className="text-gray-600 mb-6">Your support companion is here to listen and help you reflect on your feelings.</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={generateAvatarImage}
                disabled={loadingAvatar}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                {loadingAvatar ? 'Generating...' : 'Generate New Avatar'}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-mindwell-600 hover:bg-mindwell-700 text-white font-bold py-3 px-8 rounded-lg transition"
              >
                Start Conversation
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chat Messages */}
            <div className="bg-gray-50 rounded-lg p-6 h-96 overflow-y-auto space-y-4 border border-gray-200">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-mindwell-600 text-white rounded-br-none'
                        : 'bg-white border-2 border-mindwell-300 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isAvatarSpeaking && (
                <div className="flex justify-start">
                  <div className="bg-white border-2 border-mindwell-300 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-mindwell-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Avatar Display */}
            <div className="flex justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-mindwell-500 shadow-lg">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt="Support Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-mindwell-200 to-mindwell-400 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts... (Press Enter to send)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mindwell-500 resize-none"
                rows="3"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isAvatarSpeaking}
                className="bg-mindwell-600 hover:bg-mindwell-700 disabled:bg-gray-400 text-white font-bold px-6 rounded-lg transition h-fit"
              >
                Send
              </button>
            </div>

            {/* End Session Button */}
            <button
              onClick={() => {
                setSessionStarted(false)
                setMessages([])
                setAvatarMessage('')
              }}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            >
              End Conversation
            </button>
          </div>
        )}

        {/* Start Session Modal */}
        <Modal
          isOpen={showModal}
          title="Start a Conversation"
          onClose={() => setShowModal(false)}
          onConfirm={startSession}
          confirmText="Start Chatting"
          cancelText="Cancel"
          showCancel={true}
        >
          <div className="space-y-3">
            <p className="text-gray-700 font-semibold">Welcome to your support chat! 👋</p>
            <p className="text-gray-600 text-sm">
              Your companion is here to listen and support you. Share your thoughts and feelings, and I'll respond with care and understanding.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This is a supportive tool for reflection. For crisis support, please use the Crisis Resources page.
              </p>
            </div>
          </div>
        </Modal>

        {/* Information */}
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 About Your Companion</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Your companion asks caring questions based on your mental health concern</li>
            <li>• Responses are supportive and non-judgmental</li>
            <li>• Use this for reflection and self-awareness</li>
            <li>• All conversations are private and stored locally</li>
            <li>• This is not a substitute for professional help</li>
            <li>• Click "Generate New Avatar" to create a different companion</li>
          </ul>
        </div>
      </div>

      {/* Human Avatar Component */}
      <HumanAvatar
        isActive={sessionStarted}
        message={avatarMessage}
        avatarImage={avatarImage}
      />
    </div>
  )
}

export default AvatarChat
