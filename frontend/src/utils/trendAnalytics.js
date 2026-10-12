/**
 * trendAnalytics.js
 * Shared analytics engine for wellness trend data.
 * Used by WellnessTrends page, Dashboard snapshot, and post-check-in card.
 */

const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
const getMood = c => c.mood || c.moodRating || 0

/**
 * Compute a trend summary over the last `days` days.
 * Returns null if there isn't enough data to say anything meaningful.
 */
export function computeTrendSummary(checkIns, days = 30) {
  if (!checkIns?.length) return null

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const filtered = checkIns
    .filter(c => new Date(c.timestamp) >= cutoff && (c.mood || c.moodRating))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  if (filtered.length < 3) return null

  const moods    = filtered.map(getMood)
  const stresses = filtered.map(c => c.stress?.level).filter(Boolean)
  const sleeps   = filtered.map(c => c.sleep?.hours).filter(Boolean)
  const energies = filtered.map(c => c.energy).filter(Boolean)

  const avgMood   = avg(moods)
  const avgStress = avg(stresses)
  const avgSleep  = avg(sleeps)
  const avgEnergy = avg(energies)

  // Trend: compare first third vs last third
  const third     = Math.max(1, Math.floor(filtered.length / 3))
  const firstMood = avg(moods.slice(0, third))
  const lastMood  = avg(moods.slice(-third))
  const moodChange = lastMood - firstMood

  // Consecutive low mood days
  let maxLowStreak = 0, cur = 0
  moods.forEach(m => { if (m <= 4) { cur++; maxLowStreak = Math.max(maxLowStreak, cur) } else cur = 0 })

  // Sleep impact
  const highSleepMoods = filtered.filter(c => (c.sleep?.hours || 0) >= 7).map(getMood)
  const lowSleepMoods  = filtered.filter(c => (c.sleep?.hours || 0) < 6 && c.sleep?.hours).map(getMood)

  const direction =
    moodChange > 0.5  ? 'improving' :
    moodChange < -0.5 ? 'declining' : 'stable'

  return {
    direction,
    moodChange,
    avgMood,
    avgStress,
    avgSleep,
    avgEnergy,
    maxLowStreak,
    total: filtered.length,
    days,
    firstMood,
    lastMood,
    highSleepAvg: avg(highSleepMoods),
    lowSleepAvg:  avg(lowSleepMoods),
  }
}

/**
 * Returns a message to show in the post-check-in feedback card.
 * Always surfaces BOTH improvements and declines — never only the negative.
 * Returns null if there isn't enough data or nothing notable to say.
 */
export function computeCheckInTrendMessage(checkIns) {
  const summary = computeTrendSummary(checkIns, 7)  // last 7 days
  if (!summary || summary.total < 4) return null

  const { direction, moodChange, avgMood, maxLowStreak } = summary

  if (direction === 'improving') {
    const magnitude = Math.abs(moodChange)
    const encouragement =
      magnitude >= 2   ? "That's a big improvement — something is really working for you." :
      magnitude >= 1   ? "That's real progress worth acknowledging." :
                         "Small but steady progress. Keep it up."
    return {
      type:    'positive',
      accent:  '#10b981',
      icon:    '📈',
      title:   `Your mood is improving`,
      message: `Up ${magnitude.toFixed(1)} points over the past 7 days. ${encouragement}`,
    }
  }

  if (direction === 'declining') {
    const concern =
      maxLowStreak >= 4 ? "A longer difficult stretch — consider speaking to someone." :
      avgMood < 4       ? "Be gentle with yourself today. Reaching out to someone can help." :
                          "A few harder days is normal. Consider a coping strategy from the app."
    return {
      type:    'gentle',
      accent:  '#6366f1',
      icon:    '💙',
      title:   `A little harder lately`,
      message: `Mood has dipped ${Math.abs(moodChange).toFixed(1)} points over the past 7 days. ${concern}`,
    }
  }

  // Stable — only surface if mood is notably good
  if (avgMood >= 7) {
    return {
      type:    'positive',
      accent:  '#10b981',
      icon:    '✨',
      title:   `You're on a good run`,
      message: `Averaging ${avgMood.toFixed(1)}/10 this week and holding steady. Whatever you're doing — keep doing it.`,
    }
  }

  return null
}

/**
 * Returns a compact snapshot for the Dashboard banner.
 * Designed to be read in 2 seconds.
 */
export function computeDashboardSnapshot(checkIns) {
  const week  = computeTrendSummary(checkIns, 7)
  const month = computeTrendSummary(checkIns, 30)
  const s = week || month
  if (!s) return null

  const period = week ? 'this week' : 'this month'

  if (s.direction === 'improving') {
    return {
      accent:    '#10b981',
      icon:      '📈',
      label:     'Mood improving',
      headline:  `Up ${Math.abs(s.moodChange).toFixed(1)} pts ${period}`,
      sub:       `Averaging ${s.avgMood.toFixed(1)}/10 — you're heading in the right direction.`,
      type:      'positive',
    }
  }

  if (s.direction === 'declining') {
    return {
      accent:    '#6366f1',
      icon:      '💙',
      label:     'Check in with yourself',
      headline:  `Mood down ${Math.abs(s.moodChange).toFixed(1)} pts ${period}`,
      sub:       s.maxLowStreak >= 3
        ? `${s.maxLowStreak} consecutive harder days. The Trends page has more detail.`
        : `A few tougher days lately. The Trends page has more detail.`,
      type:      'gentle',
    }
  }

  if (s.avgMood >= 7) {
    return {
      accent:    '#10b981',
      icon:      '✨',
      label:     'Doing well',
      headline:  `Steady at ${s.avgMood.toFixed(1)}/10 ${period}`,
      sub:       'Mood is stable and in a good range. Keep the routine going.',
      type:      'positive',
    }
  }

  return null
}
