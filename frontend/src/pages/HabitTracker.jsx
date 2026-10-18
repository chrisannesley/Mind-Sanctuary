import React, { useState, useEffect } from 'react'
import { createHabit, getHabits, completeHabit, updateHabit, deleteHabit } from '../utils/api'
import Modal from '../components/Modal'
import '../styles/HabitTracker.css'
import { scheduleHabit, cancelHabit } from '../services/NotificationService'

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
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingHabit ? 'Edit Goal' : 'Add New Goal'}
        onConfirm={handleSaveHabit}
        confirmText={editingHabit ? 'Update Goal' : 'Create Goal'}
        cancelText="Cancel"
        showCancel={true}
      >
        <div className="habit-form">
          <div className="form-group">
            <label>Goal Name *</label>
            <input
              type="text"
              placeholder="e.g., Morning Meditation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
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
      </Modal>

      {/* Guidance Modal */}
      <Modal isOpen={showGuide} onClose={() => setShowGuide(false)} title="How to Use My Goals and Achievements">
        <div className="habit-guide">
          <section className="guide-section">
            <h3>🎯 What is a Goal?</h3>
            <p>
              A goal is a behavior or habit you want to build and achieve consistently. Whether it's meditation, exercise, journaling, or better sleep, your goals help you create positive routines that support your mental health journey. Each day you complete a goal, you're building toward your achievements.
            </p>
          </section>

          <section className="guide-section">
            <h3>✨ Key Features</h3>
            <ul className="guide-list">
              <li>
                <strong>Daily Tracking:</strong> Mark each goal as complete when you achieve it. You can only mark it complete once per day.
              </li>
              <li>
                <strong>Streak System:</strong> See your consecutive days counter (🔥). The longer your streak, the more you're achieving toward your goals.
              </li>
              <li>
                <strong>Categories:</strong> Organize goals by type - Wellness, Exercise, Mindfulness, Sleep, Social, Creative, and Daily Tasks (like washing dishes, doing laundry, or going shopping).
              </li>
              <li>
                <strong>Frequency Options:</strong> Choose Daily, Weekly, or Monthly goals based on your aspirations.
              </li>
              <li>
                <strong>Progress Dashboard:</strong> See your achievement rate and how many goals you've completed today.
              </li>
            </ul>
          </section>

          <section className="guide-section">
            <h3>🚀 Getting Started</h3>
            <ol className="guide-list guide-steps">
              <li>Click "+ Add Goal" to create your first goal</li>
              <li>Give it a name and choose a category</li>
              <li>Set the frequency (most goals start daily)</li>
              <li>Add a personal reason to stay motivated</li>
              <li>Each day, mark goals complete when you achieve them</li>
              <li>Build your streak - watch your achievements grow!</li>
            </ol>
          </section>

          <section className="guide-section">
            <h3>💡 Tips for Success</h3>
            <ul className="guide-list">
              <li>
                <strong>Start small:</strong> Don't add too many goals at once. 2-3 at a time is ideal for achieving momentum.
              </li>
              <li>
                <strong>Be specific:</strong> Instead of "exercise", try "30-minute walk" or "yoga session".
              </li>
              <li>
                <strong>Stack goals:</strong> Link new goals to existing routines (e.g., meditation right after coffee).
              </li>
              <li>
                <strong>Celebrate achievements:</strong> Each day completed is progress. Streaks show your dedication to your goals.
              </li>
              <li>
                <strong>Track your patterns:</strong> Your Check-In data combined with your goals shows which achievements improve your mood.
              </li>
            </ul>
          </section>

          <section className="guide-section">
            <h3>📊 Goals + Check-In Connection</h3>
            <p>
              Your daily Check-In tracks mood and wellness, while My Goals and Achievements tracks your actions. Together, they show you which goals improve your mental health. Notice patterns: Does meditation lower stress? Does exercise boost energy? Your data reveals what works best for you.
            </p>
          </section>

          <div className="guide-cta">
            <button className="btn-primary" onClick={() => setShowGuide(false)}>
              Got it, let's track my goals!
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} title="Error">
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ color: '#1a1a1a', fontSize: '1rem', marginBottom: '1.5rem' }}>
            {errorMessage}
          </p>
          <button
            className="btn-save"
            onClick={() => setShowErrorModal(false)}
            style={{ width: '100%' }}
          >
            OK
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={cancelDeleteHabit} title="Delete Goal">
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ color: '#1a1a1a', fontSize: '1rem', marginBottom: '2rem' }}>
            Are you sure you want to delete this goal?<br />
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>This action cannot be undone.</span>
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn-cancel"
              onClick={cancelDeleteHabit}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteHabit}
              style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HabitTracker
