import React, { useState, useEffect } from 'react'
import { createHabit, getHabits, completeHabit, updateHabit, deleteHabit } from '../utils/api'
import { scheduleHabit, cancelHabit } from '../services/NotificationService'
import '../styles/HabitTracker.css'

function HabitTracker({ userId }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState(null)
  const [editingHabit, setEditingHabit] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', frequency: 'daily', category: 'wellness', goal: '' })
  const [filter, setFilter] = useState('all')

  const categories = [
    { value: 'wellness', label: '🧘 Wellness', color: '#8b5cf6' },
    { value: 'exercise', label: '💪 Exercise', color: '#ef4444' },
    { value: 'mindfulness', label: '🧠 Mindfulness', color: '#3b82f6' },
    { value: 'sleep', label: '😴 Sleep', color: '#6366f1' },
    { value: 'social', label: '🤝 Social', color: '#ec4899' },
    { value: 'creative', label: '🎨 Creative', color: '#f59e0b' },
    { value: 'tasks', label: '✓ Daily Tasks', color: '#10b981' }
  ]

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.color : '#64748b'
  }

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  useEffect(() => {
    loadHabits()
  }, [userId])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const response = await getHabits(userId)
      setHabits(response.data)
    } catch (error) {
      console.error('Error loading habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddHabit = () => {
    setEditingHabit(null)
    setFormData({ name: '', description: '', frequency: 'daily', category: 'wellness', goal: '' })
    setShowAddModal(true)
  }

  const handleEditHabit = (habit) => {
    setEditingHabit(habit)
    setFormData({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      category: habit.category,
      goal: habit.goal
    })
    setShowAddModal(true)
  }

  const handleSaveHabit = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Goal name is required')
      setShowErrorModal(true)
      return
    }

    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, formData)
        // Cancel old and reschedule with new details
        await cancelHabit(editingHabit.id)
        const updated = { ...editingHabit, ...formData }
        const user = JSON.parse(localStorage.getItem('mindwell_user') || '{}')
        await scheduleHabit(updated, user?.notificationPreferences)
      } else {
        const res = await createHabit(userId, formData)
        const newHabit = res.data
        const user = JSON.parse(localStorage.getItem('mindwell_user') || '{}')
        await scheduleHabit(newHabit, user?.notificationPreferences)
      }
      setShowAddModal(false)
      setFormData({ name: '', description: '', frequency: 'daily', category: 'wellness', goal: '' })
      loadHabits()
    } catch (error) {
      console.error('Error saving habit:', error)
      setErrorMessage(error.response?.data?.error || 'Error saving goal. Please try again.')
      setShowErrorModal(true)
    }
  }

  const handleCompleteHabit = async (habitId) => {
    try {
      await completeHabit(habitId)
      loadHabits()
    } catch (error) {
      console.error('Error completing habit:', error)
      setErrorMessage(error.response?.data?.error || 'Error completing goal. Please try again.')
      setShowErrorModal(true)
    }
  }

  const handleDeleteHabit = (habitId) => {
    setHabitToDelete(habitId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteHabit = async () => {
    if (!habitToDelete) return
    try {
      await deleteHabit(habitToDelete)
      await cancelHabit(habitToDelete)  // cancel its notification
      setShowDeleteConfirm(false)
      setHabitToDelete(null)
      loadHabits()
    } catch (error) {
      console.error('Error deleting habit:', error)
      setErrorMessage('Error deleting goal. Please try again.')
      setShowErrorModal(true)
      setShowDeleteConfirm(false)
      setHabitToDelete(null)
    }
  }

  const cancelDeleteHabit = () => {
    setShowDeleteConfirm(false)
    setHabitToDelete(null)
  }

  const isCompletedToday = (habit) => {
    const today = new Date().toDateString()
    return habit.completions?.some(c => new Date(c.completionDate).toDateString() === today)
  }

  const getStreakColor = (streak) => {
    if (streak === 0) return '#94a3b8'
    if (streak < 3) return '#fbbf24'
    if (streak < 7) return '#34d399'
    return '#10b981'
  }

  const filteredHabits = filter === 'all' ? habits : habits.filter(h => h.frequency === filter)

  const completedToday = habits.filter(h => isCompletedToday(h)).length
  const totalHabits = habits.length

  if (loading) {
    return <div className="habit-tracker"><p>Loading habits...</p></div>
  }

  return (
    <div className="habit-tracker">
      <div className="habit-header">
        <div>
          <h1>🎯 My Goals and Achievements</h1>
          <p className="habit-subtitle">Make your goals new habits</p>
        </div>
        <div className="habit-header-actions">
          <button className="btn-info" onClick={() => setShowGuide(true)} title="Learn how to use My Goals and Achievements">
            ℹ️ How it works
          </button>
          <button className="btn-add-habit" onClick={handleAddHabit}>
            + Add Goal
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {totalHabits > 0 && (
        <div className="habit-stats">
          <div className="stat-card">
            <div className="stat-number">{completedToday}</div>
            <div className="stat-label">Completed Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalHabits}</div>
            <div className="stat-label">Total Goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{Math.round((completedToday / totalHabits) * 100)}%</div>
            <div className="stat-label">Daily Progress</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {totalHabits > 0 && (
        <div className="habit-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'daily' ? 'active' : ''}`}
            onClick={() => setFilter('daily')}
          >
            Daily
          </button>
          <button
            className={`filter-btn ${filter === 'weekly' ? 'active' : ''}`}
            onClick={() => setFilter('weekly')}
          >
            Weekly
          </button>
        </div>
      )}

      {/* Habits List */}
      <div className="habits-list">
        {filteredHabits.length === 0 ? (
          <div className="empty-state">
            <p>No goals yet. Start tracking your wellness goals today!</p>
            <button className="btn-primary" onClick={handleAddHabit}>
              Create Your First Goal
            </button>
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const completed = isCompletedToday(habit)
            const categoryColor = getCategoryColor(habit.category)
            return (
              <div key={habit.id} className={`habit-card ${completed ? 'completed' : ''}`}>
                <div className="habit-card-header">
                  <div className="habit-title-section">
                    <div
                      className="habit-category-badge"
                      style={{ backgroundColor: categoryColor }}
                    >
                      {getCategoryLabel(habit.category).charAt(0)}
                    </div>
                    <div>
                      <h3 className="habit-name">{habit.name}</h3>
                      {habit.description && <p className="habit-description">{habit.description}</p>}
                    </div>
                  </div>
                  <div className="habit-actions">
                    <button
                      className="btn-streak"
                      style={{ backgroundColor: getStreakColor(habit.streak) }}
                      title="Current streak"
                    >
                      🔥 {habit.streak}
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditHabit(habit)}
                      title="Edit goal"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteHabit(habit.id)}
                      title="Delete goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="habit-details">
                  <span className="habit-frequency">📅 {habit.frequency}</span>
                  {habit.goal && <span className="habit-goal">🎯 {habit.goal}</span>}
                </div>

                <button
                  className={`btn-complete ${completed ? 'completed' : ''}`}
                  onClick={() => handleCompleteHabit(habit.id)}
                  disabled={completed}
                >
                  {completed ? '✅ Completed Today' : 'Mark Complete'}
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: '#1e2a45', border: '1px solid rgba(233,69,96,0.3)',
            borderRadius: '12px', width: '100%', maxWidth: '480px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                {editingHabit ? 'Edit Goal' : 'Add New Goal'}
              </h2>
            </div>

            {/* Scrollable form body */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flexGrow: 1 }}>
              <div className="habit-form">
                <div className="form-group">
                  <label>Goal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Morning Meditation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Why is this goal important to you?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Frequency *</label>
                  <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Target or Goal</label>
                  <input
                    type="text"
                    placeholder="e.g., 30 days consistent, complete 50 sessions"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div style={{
              padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0,
              background: '#1e2a45', borderRadius: '0 0 12px 12px',
            }}>
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleSaveHabit}>
                {editingHabit ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guidance Modal */}
      {showGuide && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '560px',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', flexShrink: 0, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>How to Use My Goals and Achievements</h2>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flexGrow: 1 }}>
              <div className="habit-guide">{/* guide content */}
                <section className="guide-section">
                  <h3>🎯 What is a Goal?</h3>
                  <p>A goal is a behavior or habit you want to build and achieve consistently. Whether it's meditation, exercise, journaling, or better sleep, your goals help you create positive routines that support your mental health journey.</p>
                </section>
                <section className="guide-section">
                  <h3>✨ Key Features</h3>
                  <ul className="guide-list">
                    <li><strong>Daily Tracking:</strong> Mark each goal as complete when you achieve it.</li>
                    <li><strong>Streak System:</strong> See your consecutive days counter 🔥</li>
                    <li><strong>Categories:</strong> Organize by Wellness, Exercise, Mindfulness, Sleep, Social, Creative, or Daily Tasks.</li>
                    <li><strong>Frequency Options:</strong> Daily, Weekly, or Monthly goals.</li>
                  </ul>
                </section>
                <section className="guide-section">
                  <h3>🚀 Getting Started</h3>
                  <ol className="guide-list guide-steps">
                    <li>Click "+ Add Goal" to create your first goal</li>
                    <li>Give it a name and choose a category</li>
                    <li>Set the frequency (most goals start daily)</li>
                    <li>Each day, mark goals complete when you achieve them</li>
                  </ol>
                </section>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn-save" onClick={() => setShowGuide(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '360px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Error</h2>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#1a1a1a', marginBottom: '1.5rem' }}>{errorMessage}</p>
              <button className="btn-save" style={{ width: '100%' }} onClick={() => setShowErrorModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '360px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: '12px 12px 0 0' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Delete Goal</h2>
            </div>
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>Are you sure you want to delete this goal?</p>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>This cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-cancel" style={{ flex: 1 }} onClick={cancelDeleteHabit}>Cancel</button>
                <button style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.75rem', fontWeight: 700, cursor: 'pointer' }} onClick={confirmDeleteHabit}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitTracker
