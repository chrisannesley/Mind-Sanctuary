/**
 * insightsEngine.js
 * Computes pattern insights from an array of check-in objects.
 * Returns an array of { icon, accent, title, body, type } cards.
 * Needs at least 5 check-ins to produce anything useful.
 */
export function computeInsights(checkIns = []) {
  const valid = checkIns.filter(c => c.mood)
  if (valid.length < 5) return []

  const cards = []

  // ── Social context vs mood ───────────────────────────────────────────────
  const socialMap = {}
  valid.forEach(c => {
    const s = c.socialInteraction || 'alone'
    if (!socialMap[s]) socialMap[s] = []
    socialMap[s].push(c.mood)
  })
  const socialAvgs = Object.entries(socialMap)
    .map(([k, v]) => ({ label: k, avg: v.reduce((a, b) => a + b, 0) / v.length, n: v.length }))
    .filter(x => x.n >= 2)
    .sort((a, b) => b.avg - a.avg)

  if (socialAvgs.length >= 2) {
    const best  = socialAvgs[0]
    const worst = socialAvgs[socialAvgs.length - 1]
    if (best.avg - worst.avg > 0.5) {
      cards.push({
        type:   'social',
        icon:   '🤝',
        accent: '#10b981',
        title:  'Social environment affects your mood',
        body:   `You average ${best.avg.toFixed(1)}/10 when ${best.label} — ${(best.avg - worst.avg).toFixed(1)} pts higher than when ${worst.label} (${worst.avg.toFixed(1)}/10).`,
      })
    }
  }

  // ── Recurring triggers ───────────────────────────────────────────────────
  const triggerCount = {}
  valid.forEach(c => {
    if (c.triggers?.trim()) {
      c.triggers.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        .forEach(t => { triggerCount[t] = (triggerCount[t] || 0) + 1 })
    }
  })
  const topTriggers = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]).slice(0, 4)
  if (topTriggers.length > 0) {
    cards.push({
      type:   'triggers',
      icon:   '⚡',
      accent: '#f97316',
      title:  `${topTriggers.length > 1 ? 'Recurring' : 'Common'} stressor${topTriggers.length > 1 ? 's' : ''} identified`,
      body:   topTriggers.map(([t, n]) => `"${t}" (${n}×)`).join('  ·  '),
    })
  }

  // ── Day-of-week pattern ──────────────────────────────────────────────────
  const dowMap = Array(7).fill(null).map(() => [])
  valid.forEach(c => { dowMap[new Date(c.timestamp).getDay()].push(c.mood) })
  const dowAvgs = dowMap
    .map((arr, i) => ({ day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i], avg: arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null }))
    .filter(d => d.avg !== null)
  const bestDay  = dowAvgs.length ? dowAvgs.reduce((a, b) => a.avg > b.avg ? a : b) : null
  const worstDay = dowAvgs.length ? dowAvgs.reduce((a, b) => a.avg < b.avg ? a : b) : null

  if (bestDay && worstDay && bestDay.day !== worstDay.day && bestDay.avg - worstDay.avg > 0.5) {
    cards.push({
      type:   'dayofweek',
      icon:   '📅',
      accent: '#6366f1',
      title:  'Your mood follows a weekly pattern',
      body:   `${bestDay.day}s are your best days (avg ${bestDay.avg.toFixed(1)}/10). ${worstDay.day}s tend to be harder (avg ${worstDay.avg.toFixed(1)}/10).`,
    })
  }

  // ── Sleep vs mood ────────────────────────────────────────────────────────
  const goodSleep = valid.filter(c => c.sleep?.hours >= 7).map(c => c.mood)
  const poorSleep = valid.filter(c => c.sleep?.hours >  0 && c.sleep.hours < 6).map(c => c.mood)
  const avgGS = goodSleep.length >= 3 ? goodSleep.reduce((a,b)=>a+b,0)/goodSleep.length : null
  const avgPS = poorSleep.length >= 3 ? poorSleep.reduce((a,b)=>a+b,0)/poorSleep.length : null

  if (avgGS && avgPS && avgGS - avgPS > 0.5) {
    cards.push({
      type:   'sleep',
      icon:   '😴',
      accent: '#a855f7',
      title:  'Sleep has a measurable impact on your mood',
      body:   `After 7h+ sleep your mood averages ${avgGS.toFixed(1)}/10. Under 6h it drops to ${avgPS.toFixed(1)}/10 — a ${(avgGS - avgPS).toFixed(1)} pt difference.`,
    })
  }

  return cards
}

/**
 * Pick the single most relevant insight given what the user just submitted.
 * Prefers insights that match the dominant signal in the latest check-in.
 */
export function pickRelevantInsight(checkIns, latestCheckIn) {
  const all = computeInsights(checkIns)
  if (!all.length) return null

  if (!latestCheckIn) return all[0]

  const { sleep, stress, socialInteraction, triggers } = latestCheckIn

  // Prefer sleep insight if sleep was short
  if (sleep?.hours < 6) {
    const s = all.find(c => c.type === 'sleep')
    if (s) return s
  }

  // Prefer trigger insight if stress was high and triggers noted
  if ((stress?.level >= 7) && triggers) {
    const s = all.find(c => c.type === 'triggers')
    if (s) return s
  }

  // Prefer social insight based on what they logged
  if (socialInteraction) {
    const s = all.find(c => c.type === 'social')
    if (s) return s
  }

  // Fall back to today's day-of-week insight or first
  const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
  const dow = all.find(c => c.type === 'dayofweek' && c.body.includes(today))
  return dow || all[0]
}
