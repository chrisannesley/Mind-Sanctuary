import React, { useState, useEffect } from 'react'
import ReflectionSession from '../components/ReflectionSession'
import CrisisResources from '../components/CrisisResources'

export default function Reflection() {
  const [userVoicePreference, setUserVoicePreference] = useState(null)
  const [userVoiceSettings, setUserVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1
  })
  const [userId, setUserId] = useState(1)

  // Load voice preferences from localStorage
  useEffect(() => {
    const savedVoice = localStorage.getItem('preferredVoice')
    const savedSettings = localStorage.getItem('voiceSettings')
    
    if (savedVoice) {
      setUserVoicePreference(JSON.parse(savedVoice))
    }
    
    if (savedSettings) {
      setUserVoiceSettings(JSON.parse(savedSettings))
    }

    // Load user ID from context or localStorage
    const savedUserId = localStorage.getItem('userId')
    if (savedUserId) {
      setUserId(parseInt(savedUserId))
    }
  }, [])

  const handleSessionEnd = (sessionData) => {
    console.log('Session ended:', sessionData)
    // Could log to analytics or save session data here
  }

  return (
    <div className="w-full">
      <ReflectionSession 
        onSessionEnd={handleSessionEnd}
        userId={userId}
        userVoicePreference={userVoicePreference}
        userVoiceSettings={userVoiceSettings}
      />
    </div>
  )
}
