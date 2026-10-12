import React, { useState, useEffect, useRef } from 'react'
import { AlertCircle, Send, Mic, MicOff, Clock, X, Volume2, VolumeX } from 'lucide-react'
import { getTextToSpeech, getSpeechToText, isVoiceSupported } from '../utils/voiceUtils'
import CompanionSelector from './CompanionSelector'
import LanguageSelector from './LanguageSelector'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// ── shared dark-theme tokens ──────────────────────────────────────
const card = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '14px',
  padding: '1.5rem',
}

const btn = (bg) => ({
  border: 'none', borderRadius: '10px', padding: '0.7rem 1.25rem',
  background: bg, color: '#fff', fontWeight: 700, cursor: 'pointer',
  fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
})

// ─────────────────────────────────────────────────────────────────

export default function ReflectionSession({ onSessionEnd, userId = 1, userVoicePreference = null, userVoiceSettings = {} }) {
  const [sessionState,       setSessionState]       = useState('COMPANION_SELECT')
  const [sessionMode,        setSessionMode]        = useState(null)
  const [selectedCompanion,  setSelectedCompanion]  = useState(null)
  const [sessionId,          setSessionId]          = useState(null)
  const [messages,           setMessages]           = useState([])
  const [inputValue,         setInputValue]         = useState('')
  const [isLoading,          setIsLoading]          = useState(false)
  const [sessionDuration,    setSessionDuration]    = useState(0)
  const [maxDuration,        setMaxDuration]        = useState(30)
  const [suggestEnd,         setSuggestEnd]         = useState(false)
  const [isVoiceRecording,   setIsVoiceRecording]   = useState(false)
  const [crisisDetected,     setCrisisDetected]     = useState(false)
  const [showInstructions,   setShowInstructions]   = useState(false)
  const [instructions,       setInstructions]       = useState(null)
  const [errorMessage,       setErrorMessage]       = useState(null)
  const [showErrorModal,     setShowErrorModal]     = useState(false)
  const [voiceEnabled,       setVoiceEnabled]       = useState(isVoiceSupported())
  const [isTextToSpeechPlaying, setIsTextToSpeechPlaying] = useState(false)
  const [preferredLanguage,  setPreferredLanguage]  = useState(() => localStorage.getItem('preferredLanguage') || 'en-US')

  const messagesEndRef      = useRef(null)
  const sessionStartTimeRef = useRef(null)
  const sttRef = useRef(null)
  const ttsRef = useRef(null)

  useEffect(() => {
    if (voiceEnabled) {
      sttRef.current = getSpeechToText(preferredLanguage)
      ttsRef.current = getTextToSpeech(preferredLanguage, API_URL)
      if (sttRef.current) sttRef.current.setLanguage(preferredLanguage)
      if (ttsRef.current) ttsRef.current.setLanguage(preferredLanguage)
    }
  }, [voiceEnabled, preferredLanguage])

  useEffect(() => {
    if (sessionState !== 'ACTIVE') return
    const interval = setInterval(() => {
      const duration = Math.floor((new Date() - sessionStartTimeRef.current) / 60000)
      setSessionDuration(duration)
      if (duration > maxDuration * 0.8) setSuggestEnd(true)
    }, 1000)
    return () => clearInterval(interval)
  }, [sessionState, maxDuration])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    fetch(`${API_URL}/api/reflection/instructions`)
      .then(r => r.json()).then(setInstructions)
      .catch(e => console.error('Error fetching instructions:', e))
  }, [])

  const startSession = async (mode) => {
    setSessionMode(mode)
    setMaxDuration(mode === 'quick' ? 10 : 30)
    try {
      const res = await fetch(`${API_URL}/api/reflection/start?userId=${userId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionMode: mode })
      })
      if (!res.ok) throw new Error(`API returned HTTP ${res.status}. Ensure the backend server is running.`)
      const data = await res.json()
      setSessionId(data.sessionId)
      setSessionState('ACTIVE')
      sessionStartTimeRef.current = new Date()
      setMessages([{ role: 'assistant', content: data.message, timestamp: new Date().toISOString() }])
    } catch (e) {
      setErrorMessage(`Failed to start session: ${e.message}`)
      setShowErrorModal(true)
    }
  }

  const sendMessage = async (text, isVoiceInput = false) => {
    if (!text.trim() || isLoading) return
    setMessages(p => [...p, { role: 'user', content: text, timestamp: new Date().toISOString(), isVoiceInput }])
    setInputValue('')
    setIsLoading(true)
    try {
      const res  = await fetch(`${API_URL}/api/reflection/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text })
      })
      const data = await res.json()
      if (data.type === 'CRISIS_ESCALATION') {
        setCrisisDetected(true)
        setMessages(p => [...p, { role: 'assistant', content: data.message, timestamp: new Date().toISOString(), isCrisis: true }])
        setTimeout(() => endSession('crisis'), 2000)
      } else {
        setMessages(p => [...p, { role: 'assistant', content: data.message, timestamp: new Date().toISOString(), type: data.type }])
        if (voiceEnabled && ttsRef.current) playTTS(data.message)
        if (data.sessionEnd) endSession('completed')
      }
    } catch (e) {
      setMessages(p => [...p, { role: 'system', content: 'Sorry, an error occurred. Please try again.', timestamp: new Date().toISOString() }])
    } finally {
      setIsLoading(false)
    }
  }

  const endSession = async (reason = 'user') => {
    if (!sessionId) return
    try { await fetch(`${API_URL}/api/reflection/end`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) }) }
    catch (e) { console.error('Error ending session:', e) }
    setSessionState('ENDED')
    onSessionEnd?.({ sessionId, duration: sessionDuration, messageCount: messages.length, reason })
  }

  const handleVoiceInput = () => {
    if (!voiceEnabled || !sttRef.current) return
    setIsVoiceRecording(true)
    sttRef.current.start(
      (transcript) => setInputValue(transcript),
      (error) => { console.error('STT error:', error); setIsVoiceRecording(false) },
      (final) => { setIsVoiceRecording(false); if (final) setInputValue(final) }
    )
  }

  const playTTS = (text) => {
    if (!voiceEnabled || !ttsRef.current) return
    setIsTextToSpeechPlaying(true)
    ttsRef.current.speak(text, {
      companionId: selectedCompanion?.id || 'luna',
      onEnd:   () => setIsTextToSpeechPlaying(false),
      onError: () => setIsTextToSpeechPlaying(false),
    })
  }

  // ── Error modal ────────────────────────────────────────────────
  const ErrorModal = () => !showErrorModal ? null : (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ ...card, maxWidth: 440, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <AlertCircle size={22} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>Error</div>
            <p style={{ fontSize: '0.85rem', color: '#fca5a5', lineHeight: 1.5, margin: 0 }}>{errorMessage}</p>
          </div>
        </div>
        <button onClick={() => setShowErrorModal(false)} style={{ ...btn('#ef4444'), width: '100%', justifyContent: 'center' }}>Close</button>
      </div>
    </div>
  )

  // ── Instructions modal ─────────────────────────────────────────
  const InstructionsModal = () => !showInstructions ? null : (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
      <div style={{ ...card, maxWidth: 580, width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>Session Instructions</div>
          <button onClick={() => setShowInstructions(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.2rem' }}><X size={18} /></button>
        </div>
        {instructions ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {['identity','purpose','scope'].map(k => instructions[k] ? (
              <div key={k}>
                <div style={{ fontWeight: 700, color: '#a5b4fc', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{k}</div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>{instructions[k]}</p>
              </div>
            ) : null)}
          </div>
        ) : (
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading…</p>
        )}
      </div>
    </div>
  )

  // ── COMPANION_SELECT ───────────────────────────────────────────
  if (sessionState === 'COMPANION_SELECT') {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: '1rem', right: '1.5rem' }}>
          <LanguageSelector defaultLanguage={preferredLanguage} onLanguageChange={setPreferredLanguage} />
        </div>
        <div style={{ maxWidth: 800, width: '100%' }}>
          <CompanionSelector
            sessionMode="guided"
            onCompanionSelected={(companion) => {
              setSelectedCompanion(companion)
              setSessionState('MODE_SELECT')
            }}
          />
        </div>
      </div>
    )
  }

  // ── MODE_SELECT ────────────────────────────────────────────────
  if (sessionState === 'MODE_SELECT') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <ErrorModal />
        <InstructionsModal />

        <div style={{ ...card, maxWidth: 460, width: '100%' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', textAlign: 'center', marginBottom: '0.35rem' }}>
            Reflection Session
          </h1>
          <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
            Choose your reflection type
          </p>

          {/* Quick */}
          <button
            onClick={() => startSession('quick')}
            style={{
              width: '100%', marginBottom: '0.9rem', textAlign: 'left', cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', padding: '1.1rem 1.25rem', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Clock size={22} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.2rem' }}>Quick Check-In</div>
                <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginBottom: '0.35rem' }}>5–10 minutes</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Perfect for low-energy days. Brief, focused reflection.
                </div>
              </div>
            </div>
          </button>

          {/* Guided */}
          <button
            onClick={() => startSession('guided')}
            style={{
              width: '100%', marginBottom: '1.5rem', textAlign: 'left', cursor: 'pointer',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px', padding: '1.1rem 1.25rem', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Clock size={22} color="#a5b4fc" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '0.2rem' }}>Guided Reflection</div>
                <div style={{ fontSize: '0.78rem', color: '#a5b4fc', marginBottom: '0.35rem' }}>15–30 minutes</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Explore a specific pattern or concern. Deeper dive into what's on your mind.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowInstructions(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', color: '#64748b', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            See what your companion will know about this session
          </button>
        </div>
      </div>
    )
  }

  // ── ACTIVE ─────────────────────────────────────────────────────
  if (sessionState === 'ACTIVE') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

        {/* Header */}
        <div style={{ background: 'rgba(10,14,39,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem 1.25rem', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                {sessionMode === 'quick' ? '⚡ Quick Check-In' : '🌀 Guided Reflection'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                {sessionDuration} / {maxDuration} min
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {suggestEnd && (
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', padding: '0.25rem 0.65rem' }}>
                  Ready to wrap up?
                </span>
              )}
              <button onClick={() => endSession('user')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Crisis alert */}
        {crisisDetected && (
          <div style={{ background: 'rgba(239,68,68,0.12)', borderBottom: '2px solid #ef4444', padding: '0.75rem 1.25rem', flexShrink: 0 }}>
            <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5' }}>
                We're concerned about your safety. Please reach out to crisis resources immediately.
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user'
                    ? '#6366f1'
                    : msg.isCrisis
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(255,255,255,0.08)',
                  border: msg.role === 'user'
                    ? 'none'
                    : msg.isCrisis
                    ? '1px solid rgba(239,68,68,0.35)'
                    : '1px solid rgba(255,255,255,0.1)',
                }}>
                  {msg.isVoiceInput && (
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem', fontWeight: 600 }}>🎤 Voice</div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.88rem', color: msg.isCrisis ? '#fca5a5' : '#f1f5f9', lineHeight: 1.6 }}>
                    {msg.content}
                  </p>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.35rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 100, 200].map(d => (
                    <div key={d} style={{ width: 8, height: 8, background: '#94a3b8', borderRadius: '50%', animation: `bounce 1s ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Crisis resources */}
        {crisisDetected && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderTop: '1px solid rgba(239,68,68,0.2)', padding: '0.85rem 1.25rem', flexShrink: 0 }}>
            <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.6rem' }}>Need immediate help?</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[['🇦🇺 13 11 14','tel:131114'],['🇬🇧 116 123','tel:116123'],['🇺🇸 988','tel:988']].map(([l,h]) => (
                  <a key={h} href={h} style={{ background: '#ef4444', color: '#fff', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>{l}</a>
                ))}
                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.4rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(239,68,68,0.4)' }}>Find More →</a>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ background: 'rgba(10,14,39,0.92)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '0.85rem 1.25rem', flexShrink: 0 }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter' && !isLoading) sendMessage(inputValue) }}
              placeholder="Share what's on your mind…"
              disabled={isLoading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px', padding: '0.65rem 1rem', color: '#f1f5f9', fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            {voiceEnabled && (
              <button
                onClick={handleVoiceInput}
                disabled={isLoading || isVoiceRecording}
                style={{
                  ...btn(isVoiceRecording ? '#ef4444' : 'rgba(255,255,255,0.08)'),
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.65rem',
                }}
              >
                {isVoiceRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              style={{ ...btn('#6366f1'), padding: '0.65rem 1rem', opacity: (isLoading || !inputValue.trim()) ? 0.5 : 1 }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ENDED ──────────────────────────────────────────────────────
  if (sessionState === 'ENDED') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ ...card, maxWidth: 460, width: '100%' }}>
          {crisisDetected ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>Safety First</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  We're here to support you, but your safety comes first.
                </p>
              </div>
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: '#fca5a5', marginBottom: '0.75rem' }}>Crisis Resources</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[['🇦🇺 13 11 14 (Lifeline)','tel:131114'],['🇬🇧 116 123 (Samaritans)','tel:116123'],['🇺🇸 988 (Lifeline)','tel:988'],['🌍 findahelpline.com','https://findahelpline.com']].map(([l,h]) => (
                    <a key={h} href={h} target={h.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: '#fca5a5', textDecoration: 'underline' }}>{l}</a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem' }}>Session Complete</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                  {sessionDuration} minutes · {Math.ceil(messages.length / 2)} exchanges
                </p>
              </div>
              <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.4rem' }}>What Helped?</div>
                <p style={{ fontSize: '0.82rem', color: '#c7d2fe', lineHeight: 1.6, margin: 0 }}>
                  {sessionMode === 'quick'
                    ? 'You took time to check in with yourself. Notice any patterns that emerged.'
                    : 'You explored your feelings and patterns. Reflection is a powerful tool for understanding yourself.'}
                </p>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginBottom: '1.1rem', lineHeight: 1.5 }}>
                Remember: I'm a reflection tool, not a therapist. For ongoing concerns, please reach out to a mental health professional.
              </p>
            </>
          )}

          <button
            onClick={() => { setSessionState('MODE_SELECT'); setMessages([]); setSessionId(null); setCrisisDetected(false) }}
            style={{ ...btn('#6366f1'), width: '100%', justifyContent: 'center' }}
          >
            {crisisDetected ? 'Return to Home' : 'Start Another Session'}
          </button>
        </div>
      </div>
    )
  }
}
