import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '../utils/api'
import { rescheduleAll, requestPermission, checkPermission } from '../services/NotificationService'

const DEFAULT_NOTIF_PREFS = {
  masterEnabled: false,
  checkIn: { enabled: true,  time: '09:00' },
  habits:  { enabled: true,  time: '08:00' },
  quote:   { enabled: false, time: '07:30' },
}

function Profile({ user, setUser, userId }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name:                 user?.name || '',
    mainConcerns:         user?.mainConcerns || [],
    email:                user?.email || '',
    phone:                user?.phone || '',
    notificationsEnabled: user?.notificationsEnabled || false,
    notificationType:     user?.notificationType || 'email',
    notificationPreferences: {
      ...DEFAULT_NOTIF_PREFS,
      ...(user?.notificationPreferences || {}),
    },
  })
  const [loading,   setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error,     setError]     = useState(null)
  const [permDenied, setPermDenied] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'mainConcern') {
      setFormData(prev => {
        const concerns = [...prev.mainConcerns]
        if (checked) { if (!concerns.includes(value)) concerns.push(value) }
        else { const i = concerns.indexOf(value); if (i > -1) concerns.splice(i, 1) }
        return { ...prev, mainConcerns: concerns }
      })
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  // Update nested notificationPreferences
  const updateNotifPref = (path, value) => {
    setFormData(prev => {
      const prefs = { ...prev.notificationPreferences }
      const parts = path.split('.')
      if (parts.length === 1) {
        prefs[parts[0]] = value
      } else {
        prefs[parts[0]] = { ...prefs[parts[0]], [parts[1]]: value }
      }
      return { ...prev, notificationPreferences: prefs }
    })
  }

  const handleMasterToggle = async (e) => {
    const enabled = e.target.checked
    if (enabled) {
      // Request permission when enabling
      const status = await requestPermission()
      if (status !== 'granted') {
        setPermDenied(true)
      } else {
        setPermDenied(false)
      }
    }
    updateNotifPref('masterEnabled', enabled)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await updateUser(userId, formData)
      setUser(response.data)
      // Reschedule all notifications atomically after save
      await rescheduleAll(userId, formData.notificationPreferences)
      setSubmitted(true)
      setTimeout(() => navigate('/home'), 2000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.response?.data?.error || err.message || 'Error updating profile.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const prefs = formData.notificationPreferences

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)', paddingBottom: '3rem' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #333333 0%, #000000 100%)', borderBottom: '3px solid #e94560', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#fff', margin: '0 0 0.2rem' }}>👤 Your Profile</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Manage your personal information and preferences</p>
        </div>
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.5rem' }}>

        {submitted && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.85rem 1.1rem', marginBottom: '1.25rem', color: '#6ee7b7' }}>
            ✓ Profile saved! Redirecting...
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.85rem 1.1rem', marginBottom: '1.25rem', color: '#fca5a5' }}>
            ✗ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Personal Info ── */}
          <Section title="Personal Information">
            <Field label="Name">
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
            </Field>
            <Field label="Phone">
              <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
            </Field>
          </Section>

          {/* ── Mental Health Concerns ── */}
          <Section title="Mental Health Concerns">
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Select all that apply:</p>
            {['Depression','Anxiety','PTSD','Sleep Issues','Stress','Other','General wellness'].map(concern => (
              <label key={concern} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="mainConcern" value={concern} checked={formData.mainConcerns.includes(concern)} onChange={handleChange} style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: '0.88rem', color: '#e0e0e0' }}>{concern}</span>
              </label>
            ))}
          </Section>

          {/* ── Push Notifications ── */}
          <Section title="Push Notifications">

            {permDenied && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#fde68a' }}>
                ⚠️ Notification permission was denied. Go to Android Settings → Apps → Mind Sanctuary → Notifications to enable it.
              </div>
            )}

            <ToggleRow
              label="Enable push notifications"
              checked={prefs.masterEnabled}
              onChange={handleMasterToggle}
            />

            {prefs.masterEnabled && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>

                {/* Check-in reminder */}
                <NotifChannel
                  label="Daily check-in reminder"
                  enabled={prefs.checkIn.enabled}
                  time={prefs.checkIn.time}
                  onToggle={v => updateNotifPref('checkIn.enabled', v)}
                  onTime={v => updateNotifPref('checkIn.time', v)}
                />

                {/* Habit reminders */}
                <NotifChannel
                  label="Goal & habit reminders"
                  enabled={prefs.habits.enabled}
                  time={prefs.habits.time}
                  onToggle={v => updateNotifPref('habits.enabled', v)}
                  onTime={v => updateNotifPref('habits.time', v)}
                />

                {/* Daily quote */}
                <NotifChannel
                  label="Daily motivational quote"
                  enabled={prefs.quote.enabled}
                  time={prefs.quote.time}
                  onToggle={v => updateNotifPref('quote.enabled', v)}
                  onTime={v => updateNotifPref('quote.time', v)}
                />
              </div>
            )}
          </Section>

          {/* ── Submit ── */}
          <button type="submit" disabled={loading} style={{ background: '#2196F3', border: 'none', color: '#fff', fontWeight: 700, padding: '0.85rem', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>

          {/* Account info */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.3rem' }}><strong style={{ color: '#94a3b8' }}>User ID:</strong> {userId}</p>
            {user?.createdDate && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}><strong style={{ color: '#94a3b8' }}>Member since:</strong> {new Date(user.createdDate).toLocaleDateString()}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Helper sub-components ─────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>{label}</label>
      {React.cloneElement(children, {
        style: { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#e0e0e0', fontSize: '0.88rem', padding: '0.55rem 0.85rem', boxSizing: 'border-box', outline: 'none' }
      })}
    </div>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
      <span style={{ fontSize: '0.9rem', color: '#e0e0e0', fontWeight: 600 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 18, height: 18, accentColor: '#2196F3' }} />
    </label>
  )
}

function NotifChannel({ label, enabled, time, onToggle, onTime }) {
  // Build 15-minute increment options
  const timeOptions = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2,'0')
      const mm = String(m).padStart(2,'0')
      timeOptions.push(`${hh}:${mm}`)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
        <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#2196F3' }} />
        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{label}</span>
      </label>
      {enabled && (
        <select
          value={time}
          onChange={e => onTime(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#e0e0e0', fontSize: '0.82rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
        >
          {timeOptions.map(t => (
            <option key={t} value={t} style={{ background: '#1e2a4a' }}>{t}</option>
          ))}
        </select>
      )}
    </div>
  )
}

export default Profile
