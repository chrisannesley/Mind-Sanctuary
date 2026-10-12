import React, { useState, useEffect } from 'react'
import { getCheckIns, getHabits, getAssessmentResults, getJournalEntries, getSafetyPlan } from '../utils/api'
import '../styles/MyJourney.css'

// ── Milestone definitions ────────────────────────────────────────
// Each milestone has: id, check(data) → date|null, title, reflection
const MILESTONE_DEFS = [
  // Check-in milestones
  {
    id: 'first_checkin',
    category: 'check-in',
    title: 'First check-in completed',
    reflection: 'Taking the first step to understand how you\'re feeling took courage. That matters.',
    check: ({ checkIns }) => checkIns.length >= 1 ? checkIns[0].timestamp : null,
  },
  {
    id: 'checkin_7',
    category: 'check-in',
    title: '7 days of check-ins',
    reflection: 'A week of checking in with yourself. You\'re building a habit of self-awareness.',
    check: ({ checkIns }) => checkIns.length >= 7 ? checkIns[6].timestamp : null,
  },
  {
    id: 'checkin_14',
    category: 'check-in',
    title: '14 days of check-ins',
    reflection: 'Two weeks. You\'re developing a real picture of your patterns.',
    check: ({ checkIns }) => checkIns.length >= 14 ? checkIns[13].timestamp : null,
  },
  {
    id: 'checkin_30',
    category: 'check-in',
    title: '30 days of check-ins',
    reflection: 'A month of consistent self-reflection. The data you\'ve gathered is a genuine gift to your future self.',
    check: ({ checkIns }) => checkIns.length >= 30 ? checkIns[29].timestamp : null,
  },
  {
    id: 'checkin_100',
    category: 'check-in',
    title: '100 check-ins',
    reflection: 'One hundred moments of choosing to understand yourself. That\'s remarkable.',
    check: ({ checkIns }) => checkIns.length >= 100 ? checkIns[99].timestamp : null,
  },

  // Goals milestones
  {
    id: 'first_goal',
    category: 'goals',
    title: 'First goal created',
    reflection: 'You identified something worth working towards and wrote it down. That\'s where change begins.',
    check: ({ habits }) => habits.length >= 1 ? habits[0].createdDate : null,
  },
  {
    id: 'goal_streak_3',
    category: 'goals',
    title: '3-day streak on a goal',
    reflection: 'Three days in a row. Small and consistent is how lasting change happens.',
    check: ({ habits }) => {
      const h = habits.find(h => h.streak >= 3)
      return h ? h.createdDate : null
    },
  },
  {
    id: 'goal_streak_7',
    category: 'goals',
    title: '7-day streak on a goal',
    reflection: 'A full week of following through. You\'re proving to yourself that you can.',
    check: ({ habits }) => {
      const h = habits.find(h => h.streak >= 7)
      return h ? h.createdDate : null
    },
  },
  {
    id: 'goal_streak_30',
    category: 'goals',
    title: '30-day streak on a goal',
    reflection: 'A month of showing up for yourself every day. This is no longer just a goal — it\'s who you are.',
    check: ({ habits }) => {
      const h = habits.find(h => h.streak >= 30)
      return h ? h.createdDate : null
    },
  },
  {
    id: 'five_goals',
    category: 'goals',
    title: '5 goals created',
    reflection: 'You\'ve built a meaningful set of intentions for your wellbeing.',
    check: ({ habits }) => habits.length >= 5 ? habits[4].createdDate : null,
  },

  // Assessment milestones
  {
    id: 'first_assessment',
    category: 'assessment',
    title: 'First assessment completed',
    reflection: 'Understanding where you are is the first step to knowing where you\'re going.',
    check: ({ assessments }) => assessments.length >= 1 ? assessments[0].timestamp : null,
  },
  {
    id: 'three_assessments',
    category: 'assessment',
    title: '3 assessments completed',
    reflection: 'You\'re building a longitudinal picture of your mental health. That\'s genuinely valuable.',
    check: ({ assessments }) => assessments.length >= 3 ? assessments[2].timestamp : null,
  },
  {
    id: 'assessment_improvement',
    category: 'assessment',
    title: 'Assessment score improved',
    reflection: 'Your scores show movement in a positive direction. Your effort is showing up in the data.',
    check: ({ assessments }) => {
      // Group by type, check if latest is lower (better) than first
      const byType = {}
      assessments.forEach(a => {
        if (!byType[a.assessmentId]) byType[a.assessmentId] = []
        byType[a.assessmentId].push(a)
      })
      for (const type of Object.values(byType)) {
        if (type.length >= 2) {
          const sorted = [...type].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp))
          if (sorted[sorted.length-1].percentage < sorted[0].percentage) {
            return sorted[sorted.length-1].timestamp
          }
        }
      }
      return null
    },
  },

  // Journal milestones
  {
    id: 'first_journal',
    category: 'journal',
    title: 'First journal entry written',
    reflection: 'You gave your thoughts a place to exist outside your mind. That\'s a healthy thing.',
    check: ({ journal }) => journal.length >= 1 ? journal[0].timestamp : null,
  },
  {
    id: 'journal_10',
    category: 'journal',
    title: '10 journal entries',
    reflection: 'Ten times you chose to reflect and write. Your journal is becoming a record of your inner life.',
    check: ({ journal }) => journal.length >= 10 ? journal[9].timestamp : null,
  },

  // Safety plan milestones
  {
    id: 'safety_plan_started',
    category: 'safety',
    title: 'Crisis safety plan started',
    reflection: 'Creating a plan for your hardest moments is an act of deep self-care. You\'re looking after future you.',
    check: ({ safetyPlan }) => safetyPlan ? safetyPlan.updatedAt || safetyPlan.createdAt : null,
  },
  {
    id: 'safety_plan_complete',
    category: 'safety',
    title: 'Safety plan fully completed',
    reflection: 'All six steps of your safety plan are in place. This is one of the most important things you can do for yourself.',
    check: ({ safetyPlan }) => {
      if (!safetyPlan) return null
      const done = [
        safetyPlan.step1_warningSigns?.length > 0,
        safetyPlan.step2_internalCoping?.length > 0,
        safetyPlan.step3_contacts?.length > 0,
        safetyPlan.step4_professionals?.length > 0,
        safetyPlan.step5_makeEnvironmentSafe?.trim().length > 0,
        safetyPlan.step6_reasonsToLive?.length > 0,
      ]
      return done.every(Boolean) ? safetyPlan.updatedAt : null
    },
  },

  // Consistency milestones
  {
    id: 'mood_stable_week',
    category: 'wellbeing',
    title: 'Stable mood across 7 check-ins',
    reflection: 'Your mood has been relatively consistent. Stability is something to acknowledge.',
    check: ({ checkIns }) => {
      if (checkIns.length < 7) return null
      const last7 = checkIns.slice(-7).map(c => c.mood).filter(Boolean)
      if (last7.length < 7) return null
      const avg = last7.reduce((a,b) => a+b,0) / 7
      const allClose = last7.every(m => Math.abs(m - avg) <= 2)
      return allClose ? checkIns[checkIns.length-1].timestamp : null
    },
  },
  {
    id: 'mood_improving',
    category: 'wellbeing',
    title: 'Mood trend improving',
    reflection: 'Looking at your recent check-ins, your mood is on an upward trend. That\'s real progress.',
    check: ({ checkIns }) => {
      if (checkIns.length < 6) return null
      const recent = checkIns.slice(-6).map(c => c.mood).filter(Boolean)
      if (recent.length < 6) return null
      const first = recent.slice(0,3).reduce((a,b)=>a+b,0)/3
      const last  = recent.slice(3).reduce((a,b)=>a+b,0)/3
      return last > first + 0.5 ? checkIns[checkIns.length-1].timestamp : null
    },
  },
]

const CATEGORY_META = {
  'check-in':  { label: 'Check-In',   color: '#3b82f6' },
  'goals':     { label: 'Goals',      color: '#10b981' },
  'assessment':{ label: 'Assessment', color: '#8b5cf6' },
  'journal':   { label: 'Journal',    color: '#f59e0b' },
  'safety':    { label: 'Safety Plan',color: '#e94560' },
  'wellbeing': { label: 'Wellbeing',  color: '#06b6d4' },
}

function MyJourney({ userId }) {
  const [loading, setLoading]       = useState(true)
  const [milestones, setMilestones] = useState([])
  const [upcoming, setUpcoming]     = useState([])
  const [stats, setStats]           = useState(null)

  useEffect(() => { loadData() }, [userId])

  const loadData = async () => {
    try {
      const [ciRes, hRes, aRes, jRes, spRes] = await Promise.all([
        getCheckIns(userId),
        getHabits(userId),
        getAssessmentResults(userId),
        getJournalEntries(userId),
        getSafetyPlan(userId),
      ])

      const data = {
        checkIns:    (ciRes.data  || []).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)),
        habits:      hRes.data    || [],
        assessments: (aRes.data   || []).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)),
        journal:     (jRes.data   || []).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)),
        safetyPlan:  spRes.data   || null,
      }

      // Evaluate milestones
      const achieved = []
      const notYet   = []

      MILESTONE_DEFS.forEach(def => {
        const date = def.check(data)
        if (date) {
          achieved.push({ ...def, achievedAt: date })
        } else {
          notYet.push(def)
        }
      })

      // Sort achieved by date descending (most recent first)
      achieved.sort((a,b) => new Date(b.achievedAt) - new Date(a.achievedAt))

      setMilestones(achieved)
      setUpcoming(notYet.slice(0, 4)) // show next 4 not yet achieved

      // Stats
      setStats({
        checkIns:    data.checkIns.length,
        goals:       data.habits.length,
        assessments: data.assessments.length,
        journal:     data.journal.length,
        hasPlan:     !!data.safetyPlan,
        memberSince: data.checkIns.length > 0
          ? new Date(data.checkIns[0].timestamp).toLocaleDateString('en', { year: 'numeric', month: 'long' })
          : null,
      })
    } catch (e) {
      console.error('Error loading journey:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return <div className="journey-container"><div className="journey-loading">Loading your journey...</div></div>
  }

  return (
    <div className="journey-container">

      {/* Header */}
      <div className="journey-header">
        <div>
          <h1>🌱 My Journey</h1>
          <p className="journey-subtitle">A record of your progress in mental wellness</p>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="journey-overview">
          {stats.memberSince && (
            <p className="journey-since">Your journey began in <strong>{stats.memberSince}</strong></p>
          )}
          <div className="journey-stats">
            <div className="jstat">
              <span className="jstat-val">{stats.checkIns}</span>
              <span className="jstat-label">Check-Ins</span>
            </div>
            <div className="jstat">
              <span className="jstat-val">{stats.goals}</span>
              <span className="jstat-label">Goals</span>
            </div>
            <div className="jstat">
              <span className="jstat-val">{stats.assessments}</span>
              <span className="jstat-label">Assessments</span>
            </div>
            <div className="jstat">
              <span className="jstat-val">{stats.journal}</span>
              <span className="jstat-label">Journal Entries</span>
            </div>
            <div className="jstat">
              <span className="jstat-val" style={{ color: stats.hasPlan ? '#10b981' : '#94a3b8' }}>
                {stats.hasPlan ? 'Yes' : 'No'}
              </span>
              <span className="jstat-label">Safety Plan</span>
            </div>
          </div>
        </div>
      )}

      {milestones.length === 0 ? (
        <div className="journey-empty">
          <p>Your journey is just beginning.</p>
          <p>Complete your first daily check-in, create a goal, or write a journal entry — your milestones will appear here as you go.</p>
        </div>
      ) : (
        <>
          {/* Milestone count */}
          <div className="journey-count">
            <span>{milestones.length} milestone{milestones.length !== 1 ? 's' : ''} reached</span>
          </div>

          {/* Timeline */}
          <div className="journey-timeline">
            {milestones.map((m, i) => {
              const cat = CATEGORY_META[m.category]
              return (
                <div key={m.id} className="journey-item">
                  <div className="journey-line-wrap">
                    <div className="journey-dot" style={{ backgroundColor: cat.color }} />
                    {i < milestones.length - 1 && <div className="journey-line" />}
                  </div>
                  <div className="journey-content">
                    <div className="journey-meta">
                      <span className="journey-cat" style={{ color: cat.color }}>{cat.label}</span>
                      <span className="journey-date">{formatDate(m.achievedAt)}</span>
                    </div>
                    <h3 className="journey-title">{m.title}</h3>
                    <p className="journey-reflection">"{m.reflection}"</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* What's ahead */}
      {upcoming.length > 0 && (
        <div className="journey-upcoming">
          <h2>What lies ahead</h2>
          <p className="journey-upcoming-note">These milestones are within reach as you continue your journey.</p>
          <div className="upcoming-list">
            {upcoming.map(m => {
              const cat = CATEGORY_META[m.category]
              return (
                <div key={m.id} className="upcoming-item">
                  <div className="upcoming-dot" style={{ borderColor: cat.color }} />
                  <div>
                    <span className="upcoming-cat" style={{ color: cat.color }}>{cat.label}</span>
                    <span className="upcoming-title">{m.title}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

export default MyJourney
