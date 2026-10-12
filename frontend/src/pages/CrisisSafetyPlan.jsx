import React, { useState, useEffect, useRef } from 'react'
import { getSafetyPlan, saveSafetyPlan } from '../utils/api'
import Modal from '../components/Modal'
import '../styles/CrisisSafetyPlan.css'

// Stanley-Brown Safety Planning Intervention structure
const EMPTY_PLAN = {
  step1_warningSigns: [],          // Signs that a crisis may be developing
  step2_internalCoping: [],        // Things I can do on my own to distract
  step3_socialDistraction: [],     // People / places that provide distraction
  step3_contacts: [],              // Name + phone
  step4_professionals: [],         // Clinician / crisis contacts
  step5_makeEnvironmentSafe: '',   // Things to reduce access to means
  step6_reasonsToLive: [],         // Most important reasons to live
  myName: '',
  crisisContact: { name: '', phone: '' },
  lastUpdated: null
}

const SECTION_INFO = {
  step1: {
    title: 'Step 1 — Warning Signs',
    icon: '🚨',
    color: '#f59e0b',
    description: 'What thoughts, feelings, behaviours, or situations tell me a crisis might be coming?',
    placeholder: 'e.g. Feeling hopeless, withdrawing from friends, not sleeping...',
    examples: [
      'Feeling like a burden to others',
      'Isolating / not answering messages',
      'Sleeping too much or too little',
      'Feeling trapped with no way out',
      'Increased agitation or anxiety',
      'Giving away possessions',
    ]
  },
  step2: {
    title: 'Step 2 — Internal Coping',
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Things I can do on my own, without contacting anyone, to take my mind off my problems:',
    placeholder: 'e.g. Deep breathing, going for a walk, listening to music...',
    examples: [
      'Go for a walk outside',
      'Put on a favourite show or film',
      'Listen to music I love',
      'Take a shower or bath',
      'Do the 5-4-3-2-1 grounding exercise',
      'Write in my journal',
    ]
  },
  step3people: {
    title: 'Step 3a — Social Distraction',
    icon: '🤝',
    color: '#3b82f6',
    description: 'People and places that help take my mind off things (without necessarily discussing the crisis):',
    placeholder: 'e.g. Visit a café, call my friend Sam, go to the library...',
    examples: [
      'Go to a coffee shop',
      'Visit my local park',
      'Call a friend just to chat',
      'Go to the gym or pool',
    ]
  },
  step3contacts: {
    title: 'Step 3b — People I Can Ask for Help',
    icon: '📞',
    color: '#10b981',
    description: 'People I can talk to when I\'m struggling:',
  },
  step4: {
    title: 'Step 4 — Professionals & Crisis Lines',
    icon: '🏥',
    color: '#e94560',
    description: 'Clinicians, services, and crisis lines I can contact:',
  },
  step5: {
    title: 'Step 5 — Making the Environment Safer',
    icon: '🔒',
    color: '#64748b',
    description: 'Steps I or someone I trust can take to reduce access to means during a crisis:',
    placeholder: 'e.g. Ask a family member to hold my medication, remove access to...',
  },
  step6: {
    title: 'Step 6 — Reasons for Living',
    icon: '💛',
    color: '#f59e0b',
    description: 'The most important reasons I have to live — what matters most to me:',
    placeholder: 'e.g. My children, my dog, I want to travel to...',
    examples: [
      'My family',
      'My pet',
      'Things I still want to experience',
      'My friends who care about me',
      'Goals I want to achieve',
    ]
  }
}

const DEFAULT_CRISIS_LINES = [
  { name: 'Lifeline (Australia)', phone: '13 11 14', type: 'crisis' },
  { name: 'Beyond Blue (Australia)', phone: '1300 224 636', type: 'crisis' },
  { name: '988 Lifeline (US)', phone: '988', type: 'crisis' },
  { name: 'Samaritans (UK)', phone: '116 123', type: 'crisis' },
]

function TagInput({ items, onChange, placeholder, examples }) {
  const [inputVal, setInputVal] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const inputRef = useRef(null)

  const addItem = (val) => {
    const trimmed = val.trim()
    if (!trimmed || items.includes(trimmed)) return
    onChange([...items, trimmed])
    setInputVal('')
  }

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx))

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addItem(inputVal)
    }
    if (e.key === 'Backspace' && !inputVal && items.length) {
      removeItem(items.length - 1)
    }
  }

  return (
    <div className="tag-input-wrapper">
      <div className="tag-input-box" onClick={() => inputRef.current?.focus()}>
        {items.map((item, i) => (
          <span key={i} className="tag">
            {item}
            <button className="tag-remove" onClick={() => removeItem(i)}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="tag-input"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addItem(inputVal)}
          placeholder={items.length === 0 ? placeholder : 'Add more...'}
        />
      </div>
      {examples && (
        <div className="tag-examples">
          <button className="examples-toggle" onClick={() => setShowExamples(s => !s)}>
            {showExamples ? 'Hide examples ▲' : 'Show examples ▼'}
          </button>
          {showExamples && (
            <div className="examples-list">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className="example-chip"
                  onClick={() => addItem(ex)}
                  disabled={items.includes(ex)}
                >
                  + {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContactInput({ contacts, onChange, placeholder }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const add = () => {
    if (!name.trim()) return
    onChange([...contacts, { name: name.trim(), phone: phone.trim() }])
    setName('')
    setPhone('')
  }

  const remove = (idx) => onChange(contacts.filter((_, i) => i !== idx))

  return (
    <div className="contact-input-wrapper">
      {contacts.map((c, i) => (
        <div key={i} className="contact-row">
          <span className="contact-name">{c.name}</span>
          {c.phone && <span className="contact-phone">📞 {c.phone}</span>}
          {c.type && <span className="contact-type-badge">{c.type}</span>}
          <button className="contact-remove" onClick={() => remove(i)}>×</button>
        </div>
      ))}
      <div className="contact-add-row">
        <input
          className="contact-add-input"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <input
          className="contact-add-input"
          placeholder="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="contact-add-btn" onClick={add}>Add</button>
      </div>
    </div>
  )
}

function CrisisSafetyPlan({ userId }) {
  const [plan, setPlan]           = useState({ ...EMPTY_PLAN })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [activeStep, setActiveStep] = useState(null) // null = overview
  const [showInfo, setShowInfo]   = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  useEffect(() => { loadPlan() }, [userId])

  const loadPlan = async () => {
    try {
      const res = await getSafetyPlan(userId)
      if (res.data) setPlan({ ...EMPTY_PLAN, ...res.data })
    } catch (e) {
      console.error('Error loading safety plan:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveSafetyPlan(userId, plan)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error('Error saving safety plan:', e)
      alert('Error saving plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const update = (field, value) => setPlan(p => ({ ...p, [field]: value }))

  // Completion score
  const completionSteps = [
    plan.step1_warningSigns?.length > 0,
    plan.step2_internalCoping?.length > 0,
    plan.step3_socialDistraction?.length > 0 || plan.step3_contacts?.length > 0,
    plan.step4_professionals?.length > 0,
    plan.step5_makeEnvironmentSafe?.trim().length > 0,
    plan.step6_reasonsToLive?.length > 0,
  ]
  const completedCount = completionSteps.filter(Boolean).length

  const steps = [
    { key: 'step1', label: 'Warning Signs',         icon: '🚨', color: '#f59e0b', done: completionSteps[0] },
    { key: 'step2', label: 'Internal Coping',        icon: '🧠', color: '#8b5cf6', done: completionSteps[1] },
    { key: 'step3', label: 'Social Support',         icon: '🤝', color: '#3b82f6', done: completionSteps[2] },
    { key: 'step4', label: 'Professionals & Crisis', icon: '🏥', color: '#e94560', done: completionSteps[3] },
    { key: 'step5', label: 'Make Environment Safe',  icon: '🔒', color: '#64748b', done: completionSteps[4] },
    { key: 'step6', label: 'Reasons for Living',     icon: '💛', color: '#f59e0b', done: completionSteps[5] },
  ]

  if (loading) {
    return <div className="csp-container"><div className="csp-loading">Loading your safety plan...</div></div>
  }

  return (
    <div className="csp-container">

      {/* Header */}
      <div className="csp-header">
        <div className="csp-header-left">
          <h1>🛡️ My Crisis Safety Plan</h1>
          <p className="csp-subtitle">A personalised plan to help you through difficult moments</p>
        </div>
        <div className="csp-header-actions">
          <button className="csp-btn-info" onClick={() => setShowInfo(true)}>ℹ️ About</button>
          <button className="csp-btn-print" onClick={() => setShowPrint(true)}>📄 View Plan</button>
          <button
            className={`csp-btn-save ${saved ? 'saved' : ''}`}
            onMouseDown={e => e.preventDefault()}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : '💾 Save Plan'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="csp-progress-wrap">
        <div className="csp-progress-bar">
          <div
            className="csp-progress-fill"
            style={{ width: `${(completedCount / 6) * 100}%` }}
          />
        </div>
        <span className="csp-progress-label">{completedCount}/6 steps complete</span>
      </div>

      {/* Important note */}
      <div className="csp-disclaimer">
        <strong>⚠️ Important:</strong> This safety plan is a personal tool to support you. It is not a substitute for professional mental health care.
        If you are in immediate danger, call <strong>000 (AU)</strong> / <strong>911 (US)</strong> / <strong>999 (UK)</strong> or go to your nearest emergency department.
      </div>

      {/* Step nav cards */}
      {activeStep === null && (
        <>
          <div className="csp-steps-grid">
            {steps.map((s, i) => (
              <button
                key={s.key}
                className={`csp-step-card ${s.done ? 'done' : ''}`}
                style={{ borderColor: s.done ? s.color : 'rgba(255,255,255,0.1)' }}
                onClick={() => setActiveStep(s.key)}
              >
                <div className="csp-step-number" style={{ backgroundColor: s.done ? s.color : 'rgba(255,255,255,0.08)' }}>
                  {s.done ? '✓' : i + 1}
                </div>
                <div className="csp-step-icon">{s.icon}</div>
                <div className="csp-step-label">{s.label}</div>
                <div className="csp-step-status">{s.done ? 'Completed' : 'Tap to fill in'}</div>
              </button>
            ))}
          </div>

          {/* Quick access crisis lines */}
          <div className="csp-card csp-crisis-quick">
            <h2>🆘 Crisis Lines — Always Available</h2>
            <div className="crisis-quick-grid">
              {DEFAULT_CRISIS_LINES.map((l, i) => (
                <a key={i} href={`tel:${l.phone.replace(/\s/g,'')}`} className="crisis-quick-item">
                  <span className="crisis-quick-name">{l.name}</span>
                  <span className="crisis-quick-phone">{l.phone}</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Step Editor Views ── */}

      {activeStep === 'step1' && (
        <StepEditor
          info={SECTION_INFO.step1}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <TagInput
            items={plan.step1_warningSigns}
            onChange={v => update('step1_warningSigns', v)}
            placeholder={SECTION_INFO.step1.placeholder}
            examples={SECTION_INFO.step1.examples}
          />
        </StepEditor>
      )}

      {activeStep === 'step2' && (
        <StepEditor
          info={SECTION_INFO.step2}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <TagInput
            items={plan.step2_internalCoping}
            onChange={v => update('step2_internalCoping', v)}
            placeholder={SECTION_INFO.step2.placeholder}
            examples={SECTION_INFO.step2.examples}
          />
        </StepEditor>
      )}

      {activeStep === 'step3' && (
        <StepEditor
          info={SECTION_INFO.step3people}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <h3 className="csp-sub-heading">Places & activities for distraction</h3>
          <TagInput
            items={plan.step3_socialDistraction}
            onChange={v => update('step3_socialDistraction', v)}
            placeholder={SECTION_INFO.step3people.placeholder}
            examples={SECTION_INFO.step3people.examples}
          />
          <h3 className="csp-sub-heading" style={{ marginTop: '1.5rem' }}>People I can call or visit</h3>
          <p className="csp-field-note">{SECTION_INFO.step3contacts.description}</p>
          <ContactInput
            contacts={plan.step3_contacts}
            onChange={v => update('step3_contacts', v)}
          />
        </StepEditor>
      )}

      {activeStep === 'step4' && (
        <StepEditor
          info={SECTION_INFO.step4}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <p className="csp-field-note" style={{ marginBottom: '0.75rem' }}>
            Add your therapist, GP, psychiatrist, or a crisis line. These are the people to contact when self-help isn't enough.
          </p>
          <ContactInput
            contacts={plan.step4_professionals}
            onChange={v => update('step4_professionals', v)}
          />
          <div className="csp-defaults-note">
            <p>Default crisis lines are always shown on your plan overview. Add your personal clinicians above.</p>
          </div>
        </StepEditor>
      )}

      {activeStep === 'step5' && (
        <StepEditor
          info={SECTION_INFO.step5}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <p className="csp-field-note">
            Reducing access to means is one of the most effective crisis safety strategies. Think about what steps could be taken to make your environment safer during a crisis.
          </p>
          <textarea
            className="csp-textarea"
            rows={5}
            placeholder={SECTION_INFO.step5.placeholder}
            value={plan.step5_makeEnvironmentSafe}
            onChange={e => update('step5_makeEnvironmentSafe', e.target.value)}
          />
        </StepEditor>
      )}

      {activeStep === 'step6' && (
        <StepEditor
          info={SECTION_INFO.step6}
          onBack={() => setActiveStep(null)}
          onSave={handleSave}
          saving={saving}
        >
          <p className="csp-field-note">
            These are your anchors. When everything feels overwhelming, these are the things that matter most and give you a reason to get through this moment.
          </p>
          <TagInput
            items={plan.step6_reasonsToLive}
            onChange={v => update('step6_reasonsToLive', v)}
            placeholder={SECTION_INFO.step6.placeholder}
            examples={SECTION_INFO.step6.examples}
          />
        </StepEditor>
      )}

      {/* About Modal */}
      <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="About Your Safety Plan">
        <div className="csp-info-modal">
          <p>This safety plan follows the <strong>Stanley-Brown Safety Planning Intervention</strong> — an evidence-based tool used by mental health professionals worldwide.</p>
          <p>The six steps guide you from recognising early warning signs through to finding professional support, helping you build a personalised roadmap for getting through a crisis moment.</p>
          <h4>How to use it</h4>
          <ul>
            <li>Fill it in when you're feeling <em>well</em>, not during a crisis</li>
            <li>Work through the steps in order — they're designed to escalate from self-help to professional support</li>
            <li>Share it with a trusted person or clinician</li>
            <li>Review and update it regularly</li>
            <li>During a crisis: start at Step 1 and work down until you feel safe</li>
          </ul>
          <div className="csp-info-disclaimer">
            <strong>This is a personal support tool, not a substitute for professional care.</strong> If you are in immediate danger, call emergency services.
          </div>
          <button className="csp-btn-save" onClick={() => setShowInfo(false)} style={{ width: '100%', marginTop: '1rem' }}>
            Got it
          </button>
        </div>
      </Modal>

      {/* Print / View Plan Modal */}
      <Modal isOpen={showPrint} onClose={() => setShowPrint(false)} title="My Crisis Safety Plan">
        <div className="csp-print-view">
          {plan.myName && <p className="print-name">Plan for: <strong>{plan.myName}</strong></p>}

          <PrintSection icon="🚨" title="Warning Signs" color="#f59e0b" items={plan.step1_warningSigns} />
          <PrintSection icon="🧠" title="Internal Coping Strategies" color="#8b5cf6" items={plan.step2_internalCoping} />
          <PrintSection icon="🤝" title="Social Distraction" color="#3b82f6" items={plan.step3_socialDistraction} />

          {plan.step3_contacts?.length > 0 && (
            <div className="print-section">
              <div className="print-section-title" style={{ color: '#10b981' }}>📞 People I Can Call</div>
              {plan.step3_contacts.map((c, i) => (
                <div key={i} className="print-contact">{c.name}{c.phone ? ` — ${c.phone}` : ''}</div>
              ))}
            </div>
          )}

          {plan.step4_professionals?.length > 0 && (
            <div className="print-section">
              <div className="print-section-title" style={{ color: '#e94560' }}>🏥 Professionals & Crisis Lines</div>
              {plan.step4_professionals.map((c, i) => (
                <div key={i} className="print-contact">{c.name}{c.phone ? ` — ${c.phone}` : ''}</div>
              ))}
              <div className="print-section-title" style={{ color: '#e94560', marginTop: '0.5rem' }}>Default Crisis Lines</div>
              {DEFAULT_CRISIS_LINES.map((l, i) => (
                <div key={i} className="print-contact">{l.name} — {l.phone}</div>
              ))}
            </div>
          )}

          {plan.step5_makeEnvironmentSafe && (
            <div className="print-section">
              <div className="print-section-title" style={{ color: '#64748b' }}>🔒 Make Environment Safe</div>
              <p className="print-text">{plan.step5_makeEnvironmentSafe}</p>
            </div>
          )}

          <PrintSection icon="💛" title="My Reasons for Living" color="#f59e0b" items={plan.step6_reasonsToLive} />

          <div className="print-emergency">
            <strong>🆘 If in immediate danger: call 000 / 911 / 999 or go to your nearest emergency department</strong>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StepEditor({ info, onBack, onSave, saving, children }) {
  return (
    <div className="csp-step-editor">
      <button className="csp-back-btn" onClick={onBack}>← Back to overview</button>
      <div className="csp-editor-header" style={{ borderLeftColor: info.color }}>
        <span className="csp-editor-icon">{info.icon}</span>
        <div>
          <h2>{info.title}</h2>
          <p>{info.description}</p>
        </div>
      </div>
      <div className="csp-editor-body">
        {children}
      </div>
      <div className="csp-editor-footer">
        <button className="csp-btn-back-sm" onClick={onBack}>← Overview</button>
        <button
          className="csp-btn-save"
          onMouseDown={e => e.preventDefault()}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save'}
        </button>
      </div>
    </div>
  )
}

function PrintSection({ icon, title, color, items }) {
  if (!items?.length) return null
  return (
    <div className="print-section">
      <div className="print-section-title" style={{ color }}>{icon} {title}</div>
      {items.map((item, i) => <div key={i} className="print-item">• {item}</div>)}
    </div>
  )
}

export default CrisisSafetyPlan
