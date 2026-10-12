import React, { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import '../styles/MedicationTracker.css'

const STORAGE_KEY = 'mindwell_medications'
const LOG_KEY     = 'mindwell_med_log'

const EMPTY_MED = { name: '', dose: '', time: '', frequency: 'daily', notes: '', color: '#3b82f6' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#e94560','#8b5cf6','#06b6d4','#f97316']

function MedicationTracker() {
  const [meds,       setMeds]       = useState([])
  const [log,        setLog]        = useState([]) // { medId, date, time }
  const [showAdd,    setShowAdd]    = useState(false)
  const [editMed,    setEditMed]    = useState(null)
  const [form,       setForm]       = useState({ ...EMPTY_MED })
  const [showDelete, setShowDelete] = useState(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const savedMeds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      const savedLog  = JSON.parse(localStorage.getItem(LOG_KEY)      || '[]')
      setMeds(savedMeds)
      setLog(savedLog)
    } catch (e) { console.error('Error loading medications:', e) }
  }, [])

  const saveMeds = (updated) => {
    setMeds(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const saveLog = (updated) => {
    setLog(updated)
    localStorage.setItem(LOG_KEY, JSON.stringify(updated))
  }

  const todayStr = () => new Date().toISOString().split('T')[0]

  const isTakenToday = (medId) => log.some(l => l.medId === medId && l.date === todayStr())

  const markTaken = (medId) => {
    if (isTakenToday(medId)) return
    const updated = [...log, { medId, date: todayStr(), time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) }]
    saveLog(updated)
  }

  const undoTaken = (medId) => {
    saveLog(log.filter(l => !(l.medId === medId && l.date === todayStr())))
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editMed !== null) {
      saveMeds(meds.map((m, i) => i === editMed ? { ...m, ...form } : m))
    } else {
      saveMeds([...meds, { ...form, id: Date.now() }])
    }
    setShowAdd(false)
    setEditMed(null)
    setForm({ ...EMPTY_MED })
  }

  const handleEdit = (idx) => {
    setEditMed(idx)
    setForm({ ...meds[idx] })
    setShowAdd(true)
  }

  const handleDelete = (idx) => {
    saveMeds(meds.filter((_, i) => i !== idx))
    setShowDelete(null)
  }

  const takenToday = meds.filter(m => isTakenToday(m.id)).length
  const totalToday = meds.filter(m => m.frequency === 'daily' || m.frequency === 'twice-daily').length

  // History — last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  return (
    <div className="med-container">

      {/* Header */}
      <div className="med-header">
        <div>
          <h1>💊 Medication Tracker</h1>
          <p className="med-subtitle">Track your medications and supplements</p>
        </div>
        <button className="med-btn-add" onClick={() => { setEditMed(null); setForm({ ...EMPTY_MED }); setShowAdd(true) }}>
          + Add Medication
        </button>
      </div>

      <div className="med-body">

        {/* Today summary */}
        {meds.length > 0 && (
          <div className="med-today-card">
            <div className="med-today-title">Today — {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <div className="med-today-progress">
              <div className="med-today-bar">
                <div className="med-today-fill" style={{ width: totalToday ? `${(takenToday/totalToday)*100}%` : '0%' }} />
              </div>
              <span className="med-today-count">{takenToday}/{totalToday} taken</span>
            </div>
          </div>
        )}

        {/* Medication list */}
        {meds.length === 0 ? (
          <div className="med-empty">
            <p>No medications added yet.</p>
            <p>Add your medications, vitamins, or supplements to track them daily.</p>
            <button className="med-btn-add" onClick={() => setShowAdd(true)}>+ Add Your First Medication</button>
          </div>
        ) : (
          <div className="med-list">
            {meds.map((med, idx) => {
              const taken = isTakenToday(med.id)
              return (
                <div key={med.id} className={`med-card ${taken ? 'taken' : ''}`}>
                  <div className="med-dot" style={{ backgroundColor: med.color }} />
                  <div className="med-info">
                    <div className="med-name">{med.name}</div>
                    <div className="med-meta">
                      {med.dose && <span>{med.dose}</span>}
                      {med.time && <span>⏰ {med.time}</span>}
                      <span className="med-freq">{med.frequency}</span>
                    </div>
                    {med.notes && <div className="med-notes">{med.notes}</div>}
                  </div>
                  <div className="med-actions">
                    <button
                      className={`med-btn-take ${taken ? 'taken' : ''}`}
                      onClick={() => taken ? undoTaken(med.id) : markTaken(med.id)}
                    >
                      {taken ? '✓ Taken' : 'Mark Taken'}
                    </button>
                    <button className="med-btn-edit" onClick={() => handleEdit(idx)}>✏️</button>
                    <button className="med-btn-delete" onClick={() => setShowDelete(idx)}>🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 7-day history */}
        {meds.length > 0 && (
          <div className="med-history">
            <h2>Last 7 Days</h2>
            <div className="med-history-grid">
              {last7.map(date => {
                const takenCount = meds.filter(m => log.some(l => l.medId === m.id && l.date === date)).length
                const pct = meds.length ? Math.round((takenCount / meds.length) * 100) : 0
                const label = new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', day: 'numeric' })
                const isToday = date === todayStr()
                return (
                  <div key={date} className={`med-history-day ${isToday ? 'today' : ''}`}>
                    <div className="med-history-bar-wrap">
                      <div className="med-history-bar" style={{ height: `${pct}%`, backgroundColor: pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#ef4444' : 'rgba(255,255,255,0.06)' }} />
                    </div>
                    <div className="med-history-count">{takenCount > 0 ? `${takenCount}` : ''}</div>
                    <div className="med-history-label">{label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditMed(null) }} title={editMed !== null ? 'Edit Medication' : 'Add Medication'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Medication Name *</label>
            <input style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' }}
              placeholder="e.g. Sertraline, Vitamin D, Melatonin"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Dose</label>
              <input style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' }}
                placeholder="e.g. 50mg, 1 tablet"
                value={form.dose}
                onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Time</label>
              <input type="time" style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' }}
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Frequency</label>
            <select style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', color: '#1a1a1a', background: '#fff' }}
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="twice-daily">Twice daily</option>
              <option value="weekly">Weekly</option>
              <option value="as-needed">As needed</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Colour</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: c, border: form.color === c ? '3px solid #1a1a1a' : '2px solid transparent', cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1a1a1a', marginBottom: '0.4rem' }}>Notes (optional)</label>
            <input style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' }}
              placeholder="e.g. Take with food, store in fridge"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button onClick={() => { setShowAdd(false); setEditMed(null) }}
              style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.65rem', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={!form.name.trim()}
              style={{ flex: 1, background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0.65rem', cursor: 'pointer', fontWeight: 700, color: '#fff', opacity: form.name.trim() ? 1 : 0.5 }}>
              {editMed !== null ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={showDelete !== null} onClose={() => setShowDelete(null)} title="Remove Medication">
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <p style={{ color: '#1a1a1a', marginBottom: '1.5rem' }}>
            Remove <strong>{showDelete !== null ? meds[showDelete]?.name : ''}</strong>? This will also clear its history.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowDelete(null)} style={{ flex: 1, background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '0.65rem', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            <button onClick={() => handleDelete(showDelete)} style={{ flex: 1, background: '#ef4444', border: 'none', borderRadius: '8px', padding: '0.65rem', cursor: 'pointer', fontWeight: 700, color: '#fff' }}>Remove</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MedicationTracker
