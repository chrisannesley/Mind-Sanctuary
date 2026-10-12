import React, { useState } from 'react'
import Modal from './Modal'

/**
 * EnhancedCheckInForm
 * Captures: mood, energy, sleep, stress, social, triggers, physical symptoms,
 *           substance use (past 24h), and journal note
 */
const EnhancedCheckInForm = React.forwardRef(({ onSubmit, loading = false, disabled = false }, ref) => {
  const [moodRating,      setMoodRating]      = useState(5)
  const [energyRating,    setEnergyRating]    = useState(5)
  const [sleepHours,      setSleepHours]      = useState(7)
  const [sleepQuality,    setSleepQuality]    = useState('good')
  const [stressLevel,     setStressLevel]     = useState(5)
  const [stressSource,    setStressSource]    = useState('')
  const [socialInteraction, setSocialInteraction] = useState('alone')
  const [triggers,        setTriggers]        = useState('')
  const [physicalSymptoms, setPhysicalSymptoms] = useState([])
  const [couldHelp,       setCouldHelp]       = useState('')
  const [journalNote,     setJournalNote]     = useState('')
  const [showAdvanced,    setShowAdvanced]    = useState(false)
  const [showModal,       setShowModal]       = useState(false)

  // Substance use
  const [substanceUsed,   setSubstanceUsed]   = useState([])  // e.g. ['alcohol','cannabis']
  const [substanceAmount, setSubstanceAmount] = useState({})  // e.g. {alcohol:'moderate'}
  const [substanceOther,  setSubstanceOther]  = useState('')

  const SUBSTANCES = [
    { id: 'alcohol',  label: '🍷 Alcohol' },
    { id: 'cannabis', label: '🌿 Cannabis' },
    { id: 'other',    label: '💊 Other' },
  ]

  const AMOUNTS = ['a little', 'moderate', 'quite a bit', 'a lot']

  const toggleSubstance = (id) => {
    setSubstanceUsed(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(s => s !== id)
        // Clear amount if deselected
        setSubstanceAmount(a => { const n = { ...a }; delete n[id]; return n })
        return next
      }
      return [...prev, id]
    })
  }

  const physicalSymptomOptions = [
    { id: 'headache', label: 'Headache' },
    { id: 'tension',  label: 'Muscle Tension' },
    { id: 'fatigue',  label: 'Fatigue' },
    { id: 'restless', label: 'Restlessness' },
    { id: 'nausea',   label: 'Nausea' },
    { id: 'other',    label: 'Other' },
  ]

  const togglePhysicalSymptom = (id) =>
    setPhysicalSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )

  const handleSubmit = () => {
    const checkInData = {
      mood: moodRating,
      energy: energyRating,
      sleep: { hours: sleepHours, quality: sleepQuality },
      stress: { level: stressLevel, source: stressSource },
      socialInteraction,
      triggers,
      physicalSymptoms,
      couldHelp,
      journalNote,
      substanceUse: substanceUsed.length
        ? { used: substanceUsed, amounts: substanceAmount, other: substanceOther }
        : null,
    }
    setShowModal(false)
    onSubmit(checkInData)
  }

  const resetForm = () => {
    setMoodRating(5); setEnergyRating(5); setSleepHours(7); setSleepQuality('good')
    setStressLevel(5); setStressSource(''); setSocialInteraction('alone')
    setTriggers(''); setPhysicalSymptoms([]); setCouldHelp(''); setJournalNote('')
    setShowAdvanced(false); setSubstanceUsed([]); setSubstanceAmount({}); setSubstanceOther('')
  }

  const getMoodEmoji   = r => r <= 2 ? '😢' : r <= 4 ? '😟' : r <= 6 ? '😐' : r <= 8 ? '🙂' : '😄'
  const getEnergyEmoji = r => r <= 2 ? '⚫' : r <= 4 ? '🔴' : r <= 6 ? '🟡' : r <= 8 ? '🟢' : '💚'
  const getStressEmoji = r => r <= 2 ? '☺️' : r <= 4 ? '😐' : r <= 6 ? '😟' : r <= 8 ? '😰' : '😱'

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Check-In</h1>
      <p className="text-gray-600 mb-6">Take 5 minutes to check in with yourself. This helps us understand your patterns.</p>

      {disabled && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
          <p className="text-green-700 font-semibold">✓ You've already checked in today!</p>
          <p className="text-green-600 text-sm mt-1">You can check in again tomorrow.</p>
        </div>
      )}

      <div className="space-y-6">

        {/* Mood */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-800">How are you feeling? {getMoodEmoji(moodRating)}</label>
            <span className="text-2xl font-bold text-blue-600">{moodRating}/10</span>
          </div>
          <input type="range" min="1" max="10" value={moodRating} onChange={e => setMoodRating(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" disabled={disabled} />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Very Low</span><span>Neutral</span><span>Very High</span>
          </div>
        </div>

        {/* Energy */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-800">Energy Level? {getEnergyEmoji(energyRating)}</label>
            <span className="text-2xl font-bold text-yellow-600">{energyRating}/10</span>
          </div>
          <input type="range" min="1" max="10" value={energyRating} onChange={e => setEnergyRating(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" disabled={disabled} />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Exhausted</span><span>Moderate</span><span>Energized</span>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-l-4 border-purple-500">
          <label className="text-lg font-semibold text-gray-800 mb-4 block">Sleep Last Night 😴</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Hours Slept</label>
              <input type="number" min="0" max="12" step="0.5" value={sleepHours}
                onChange={e => setSleepHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Sleep Quality</label>
              <select value={sleepQuality} onChange={e => setSleepQuality(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={disabled}>
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stress */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-800">Stress Level? {getStressEmoji(stressLevel)}</label>
            <span className="text-2xl font-bold text-red-600">{stressLevel}/10</span>
          </div>
          <input type="range" min="1" max="10" value={stressLevel} onChange={e => setStressLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer" disabled={disabled} />
          <div className="flex justify-between text-xs text-gray-600 mt-3">
            <span>Relaxed</span><span>Moderate</span><span>Overwhelmed</span>
          </div>
          {stressLevel >= 6 && (
            <input type="text" placeholder="What's causing the stress? (optional)" value={stressSource}
              onChange={e => setStressSource(e.target.value)}
              className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={disabled} />
          )}
        </div>

        {/* Social Interaction */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
          <label className="text-lg font-semibold text-gray-800 mb-4 block">Social Interaction 👥</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'alone',   label: 'Alone' },
              { value: 'family',  label: 'With Family' },
              { value: 'friends', label: 'With Friends' },
              { value: 'group',   label: 'In Groups' },
            ].map(opt => (
              <button key={opt.value} onClick={() => setSocialInteraction(opt.value)}
                className={`p-3 rounded-lg border-2 transition ${
                  socialInteraction === opt.value
                    ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                    : 'border-gray-300 hover:border-green-300'
                }`}
                disabled={disabled}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* ── Substance Use ── */}
        <div style={{
          background: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          borderLeft: '4px solid #0284c7',
        }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.25rem' }}>
            Substance Use 💊
          </label>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
            Some people find substances affect how they feel. Have you used any of the following in the past 24hrs? <em>(optional — skip anytime)</em>
          </p>

          {/* None + substance toggles */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.9rem' }}>
            <button
              onClick={() => { setSubstanceUsed([]); setSubstanceAmount({}); setSubstanceOther('') }}
              disabled={disabled}
              style={{
                padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                border: substanceUsed.length === 0 ? '2px solid #0284c7' : '2px solid #d1d5db',
                background: substanceUsed.length === 0 ? '#dbeafe' : '#fff',
                color: substanceUsed.length === 0 ? '#1e40af' : '#374151',
              }}
            >
              None
            </button>
            {SUBSTANCES.map(s => (
              <button
                key={s.id}
                onClick={() => toggleSubstance(s.id)}
                disabled={disabled}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  border: substanceUsed.includes(s.id) ? '2px solid #0284c7' : '2px solid #d1d5db',
                  background: substanceUsed.includes(s.id) ? '#dbeafe' : '#fff',
                  color: substanceUsed.includes(s.id) ? '#1e40af' : '#374151',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Amount selectors for alcohol / cannabis */}
          {['alcohol', 'cannabis'].filter(id => substanceUsed.includes(id)).map(id => (
            <div key={id} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', textTransform: 'capitalize' }}>
                How much {id}?
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setSubstanceAmount(prev => ({ ...prev, [id]: amt }))}
                    disabled={disabled}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      border: substanceAmount[id] === amt ? '2px solid #0284c7' : '2px solid #d1d5db',
                      background: substanceAmount[id] === amt ? '#dbeafe' : '#fff',
                      color: substanceAmount[id] === amt ? '#1e40af' : '#374151',
                    }}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Other — free text */}
          {substanceUsed.includes('other') && (
            <input
              type="text"
              placeholder="What substance? (optional)"
              value={substanceOther}
              onChange={e => setSubstanceOther(e.target.value)}
              disabled={disabled}
              style={{
                width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1',
                borderRadius: '8px', fontSize: '0.85rem', color: '#1e293b', boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Advanced Section Toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2" disabled={disabled}>
          {showAdvanced ? '▼' : '▶'} Additional Details (Optional)
        </button>

        {/* Advanced Section */}
        {showAdvanced && (
          <div className="space-y-4 border-t-2 border-gray-200 pt-6">

            {/* Triggers */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Any stressors or triggers today? (optional)</label>
              <textarea value={triggers} onChange={e => setTriggers(e.target.value)}
                placeholder="E.g., difficult conversation, work deadline, family tension..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                rows="2" disabled={disabled} />
            </div>

            {/* Physical Symptoms */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <label className="block text-sm font-semibold text-gray-800 mb-3">Physical symptoms? (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {physicalSymptomOptions.map(symptom => (
                  <label key={symptom.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={physicalSymptoms.includes(symptom.id)}
                      onChange={() => togglePhysicalSymptom(symptom.id)} className="w-4 h-4 rounded" disabled={disabled} />
                    <span className="text-sm text-gray-700">{symptom.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* What Could Help */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <label className="block text-sm font-semibold text-gray-800 mb-2">What would help right now? (optional)</label>
              <select value={couldHelp} onChange={e => setCouldHelp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                disabled={disabled}>
                <option value="">-- Select an option or leave blank --</option>
                <option value="walk_outside">Walk outside / Fresh air</option>
                <option value="talk_someone">Talk to someone</option>
                <option value="rest">Rest / Sleep</option>
                <option value="exercise">Exercise / Movement</option>
                <option value="meditation">Meditation / Breathing</option>
                <option value="creative">Creative activity (art, music, writing)</option>
                <option value="time_nature">Time in nature</option>
                <option value="music">Listen to music</option>
                <option value="shower">Shower / Bath</option>
                <option value="tea">Warm drink / Tea</option>
                <option value="laugh">Watch something funny</option>
                <option value="journal">Journal / Reflect</option>
                <option value="hobby">Favorite hobby</option>
                <option value="hug">Physical contact / Hug</option>
                <option value="professional_help">Talk to a professional</option>
              </select>
            </div>

            {/* Journal Note */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Quick note (optional)</label>
              <textarea value={journalNote} onChange={e => setJournalNote(e.target.value)}
                placeholder="What's on your mind? You can write more in the journal later..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                rows="3" disabled={disabled} />
            </div>
          </div>
        )}

        {/* Submit */}
        <button onClick={() => setShowModal(true)} disabled={disabled || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition">
          {loading ? 'Saving...' : disabled ? 'Already Checked In Today' : 'Save Check-In'}
        </button>

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Why We Ask This</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Mood tracks your emotional state</li>
            <li>• Energy helps identify fatigue patterns</li>
            <li>• Sleep reveals its impact on mood</li>
            <li>• Stress source helps pinpoint triggers</li>
            <li>• Over time, we'll show you patterns!</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showModal}
        title="Confirm Your Check-In"
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText={loading ? 'Saving...' : 'Save Check-In'}
        cancelText="Cancel"
        showCancel={true}
      >
        <div className="space-y-3 text-gray-700">
          <p><strong>Mood:</strong> {moodRating}/10</p>
          <p><strong>Energy:</strong> {energyRating}/10</p>
          <p><strong>Sleep:</strong> {sleepHours}h ({sleepQuality})</p>
          <p><strong>Stress:</strong> {stressLevel}/10 {stressSource && `(${stressSource})`}</p>
          <p><strong>Social:</strong> {socialInteraction}</p>
          {substanceUsed.length > 0 && (
            <p><strong>Substances:</strong> {substanceUsed.map(s =>
              substanceAmount[s] ? `${s} (${substanceAmount[s]})` : s === 'other' && substanceOther ? substanceOther : s
            ).join(', ')}</p>
          )}
          {triggers && <p><strong>Triggers:</strong> {triggers}</p>}
          {physicalSymptoms.length > 0 && <p><strong>Symptoms:</strong> {physicalSymptoms.join(', ')}</p>}
          <hr className="my-3" />
          <p className="text-sm text-gray-600">This check-in will help us build a picture of your patterns over time.</p>
        </div>
      </Modal>
    </div>
  )
})

EnhancedCheckInForm.displayName = 'EnhancedCheckInForm'
export default EnhancedCheckInForm
