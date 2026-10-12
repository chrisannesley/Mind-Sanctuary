/**
 * pageVisits.js
 * Records and reads last-visit timestamps per route in localStorage.
 * No backend needed — pure client-side.
 */

const PREFIX = 'mw_visit_'

export const recordVisit = (pathname) => {
  const route = pathname.split('?')[0].replace(/\/$/, '') || '/'
  localStorage.setItem(PREFIX + route, Date.now().toString())
}

export const daysSince = (pathname) => {
  const route = pathname.split('?')[0].replace(/\/$/, '') || '/'
  const val   = localStorage.getItem(PREFIX + route)
  if (!val) return Infinity
  return (Date.now() - parseInt(val)) / (1000 * 60 * 60 * 24)
}

/**
 * TRACKED_ROUTES — route → threshold in days.
 * Routes not listed here are not tracked (daily tasks, reference pages).
 */
export const TRACKED_ROUTES = {
  // Weekly cadence
  '/journal':             7,
  '/breathing':           7,
  '/coping':              7,
  '/assessments':         7,
  '/sleep':               7,
  '/trends':              7,
  '/mood-calendar':       7,
  '/reflection':          7,
  '/todos':               7,
  '/checkin-history':     7,
  '/assessment-history':  7,
  // Fortnightly
  '/journey':             14,
  '/safety-plan':         14,
  '/share-report':        14,
}
