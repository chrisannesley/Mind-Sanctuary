/**
 * NotificationService
 * Single source of truth for all Capacitor LocalNotifications interactions.
 * All public methods silently no-op when not running on a native platform.
 *
 * Architecture: Monolithic Notification Service (see architecture_selection.md)
 */
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getTodayCheckIn, getHabits } from '../utils/api'

// ── Stable notification IDs ──────────────────────────────────────
export const NOTIF_ID_CHECKIN = 1001
export const NOTIF_ID_QUOTE   = 1002
const HABIT_ID_BASE           = 2000  // habitId will be added: 2000 + habitId

// ── Android channel ───────────────────────────────────────────────
const CHANNEL_ID   = 'mindwell_reminders'
const CHANNEL_NAME = 'MindWell Reminders'

// ── Quote list (local, no network required) ───────────────────────
const QUOTES = [
  'You are braver than you believe, stronger than you seem, and smarter than you think.',
  'Progress, not perfection.',
  'Your mental health is a priority, not a luxury.',
  "You've survived 100% of your worst days. You're doing better than you think.",
  'Healing doesn\'t mean the damage never existed. It means the damage no longer controls your life.',
  'Be gentle with yourself. You\'re doing the best you can.',
  'This too shall pass.',
  'You are enough, just as you are.',
  'One step at a time. You don\'t have to see the whole staircase.',
  'Your struggle is part of your story, but it\'s not the whole story.',
  'You are worthy of love and support.',
  'Breathe. You\'re going to be okay.',
  'Every day is a fresh start.',
  'You\'ve got this. One moment at a time.',
  'Your feelings are valid. Your struggles are real. You deserve support.',
  'Healing is not linear. Be patient with yourself.',
  'You are not alone in this.',
  'Small steps lead to big changes.',
  'Your mental health matters. You matter.',
  'Take care of your mind like you would your body.',
  'It\'s okay to ask for help. It takes strength, not weakness.',
  'Rest is not a reward — it\'s a requirement.',
  'You don\'t have to be positive all the time. It\'s okay to feel what you feel.',
  'The present moment is where peace lives.',
  'Growth begins at the edge of your comfort zone.',
]

// ── Platform guard ────────────────────────────────────────────────
function isNative() {
  return Capacitor.isNativePlatform()
}

// ── Parse HH:MM to { hour, minute } ──────────────────────────────
function parseTime(timeStr) {
  const [h, m] = (timeStr || '09:00').split(':').map(Number)
  return { hour: h || 9, minute: m || 0 }
}

// ── Get today's quote deterministically ───────────────────────────
function getTodayQuote() {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  return QUOTES[daysSinceEpoch % QUOTES.length]
}

// ── Habit notification ID ─────────────────────────────────────────
function habitNotifId(habitId) {
  return HABIT_ID_BASE + (typeof habitId === 'number' ? habitId : parseInt(habitId) || 0)
}

// ══════════════════════════════════════════════════════════════════
// Public API
// ══════════════════════════════════════════════════════════════════

/**
 * Call once on app mount.
 * Creates the Android notification channel and requests permission if needed.
 */
export async function init() {
  if (!isNative()) return

  try {
    // Create Android notification channel
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: 3, // IMPORTANCE_DEFAULT
      visibility: 1,
      sound: 'default',
      vibration: true,
    })
  } catch (e) {
    console.warn('[NotificationService] Channel creation failed:', e)
  }
}

/**
 * Request POST_NOTIFICATIONS permission (required Android 13+).
 * Returns 'granted' | 'denied' | 'prompt'
 */
export async function requestPermission() {
  if (!isNative()) return 'granted'
  try {
    const { display } = await LocalNotifications.requestPermissions()
    return display
  } catch (e) {
    console.warn('[NotificationService] Permission request failed:', e)
    return 'denied'
  }
}

/**
 * Check current permission status without prompting.
 */
export async function checkPermission() {
  if (!isNative()) return 'granted'
  try {
    const { display } = await LocalNotifications.checkPermissions()
    return display
  } catch (e) {
    return 'denied'
  }
}

/**
 * Cancel and reschedule ALL notifications based on current preferences.
 * This is atomic — cancels everything first, then schedules.
 * Called after Profile save.
 */
export async function rescheduleAll(userId, preferences) {
  if (!isNative()) return

  // Cancel all known notifications first (atomic)
  await cancelAll(userId)

  if (!preferences?.masterEnabled) return

  const toSchedule = []

  // ── Check-in reminder ──
  if (preferences.checkIn?.enabled) {
    const { hour, minute } = parseTime(preferences.checkIn.time)
    toSchedule.push({
      id: NOTIF_ID_CHECKIN,
      title: 'Time for your daily check-in 🧠',
      body: 'Take a moment to check in with yourself. It only takes a minute.',
      channelId: CHANNEL_ID,
      schedule: {
        on: { hour, minute },
        repeats: true,
        allowWhileIdle: true,
      },
      extra: { route: '/checkin' },
    })
  }

  // ── Motivational quote ──
  if (preferences.quote?.enabled) {
    const { hour, minute } = parseTime(preferences.quote.time)
    toSchedule.push({
      id: NOTIF_ID_QUOTE,
      title: 'Your daily quote ✨',
      body: getTodayQuote().slice(0, 200),
      channelId: CHANNEL_ID,
      schedule: {
        on: { hour, minute },
        repeats: true,
        allowWhileIdle: true,
      },
      extra: { route: '/inspiration' },
    })
  }

  // ── Habit reminders ──
  if (preferences.habits?.enabled) {
    try {
      const res = await getHabits(userId)
      const habits = res.data || []
      const { hour, minute } = parseTime(preferences.habits.time)

      habits.forEach(habit => {
        if (habit.frequency === 'monthly') return // excluded per REQ-2 AC-2.1.3

        const notif = {
          id: habitNotifId(habit.id),
          title: `Goal reminder: ${habit.name}`,
          body: `Don't forget — ${habit.name} is due today. Keep your streak going! 🔥`,
          channelId: CHANNEL_ID,
          extra: { route: '/habits' },
        }

        if (habit.frequency === 'daily') {
          notif.schedule = { on: { hour, minute }, repeats: true, allowWhileIdle: true }
        } else if (habit.frequency === 'weekly') {
          const createdDay = new Date(habit.createdDate).getDay() // 0=Sun
          notif.schedule = { on: { weekday: createdDay + 1, hour, minute }, repeats: true, allowWhileIdle: true }
        }

        toSchedule.push(notif)
      })
    } catch (e) {
      console.warn('[NotificationService] Could not load habits for scheduling:', e)
    }
  }

  if (toSchedule.length === 0) return

  try {
    await LocalNotifications.schedule({ notifications: toSchedule })
  } catch (e) {
    console.warn('[NotificationService] Schedule failed:', e)
  }
}

/**
 * Cancel all known notifications.
 * Used as part of rescheduleAll and when masterEnabled turns off.
 */
export async function cancelAll(userId) {
  if (!isNative()) return
  try {
    // Get habit list to know which IDs to cancel
    let habitIds = []
    try {
      const res = await getHabits(userId)
      habitIds = (res.data || []).map(h => ({ id: habitNotifId(h.id) }))
    } catch (_) {}

    const ids = [
      { id: NOTIF_ID_CHECKIN },
      { id: NOTIF_ID_QUOTE },
      ...habitIds,
    ]
    await LocalNotifications.cancel({ notifications: ids })
  } catch (e) {
    console.warn('[NotificationService] cancelAll failed:', e)
  }
}

/**
 * Cancel today's check-in reminder.
 * Called immediately after a successful check-in submission.
 */
export async function cancelCheckInToday() {
  if (!isNative()) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID_CHECKIN }] })
  } catch (e) {
    console.warn('[NotificationService] cancelCheckInToday failed:', e)
  }
}

/**
 * Schedule a reminder for a specific habit.
 * Called when a new habit is created.
 */
export async function scheduleHabit(habit, preferences) {
  if (!isNative()) return
  if (!preferences?.masterEnabled || !preferences?.habits?.enabled) return
  if (habit.frequency === 'monthly') return

  const { hour, minute } = parseTime(preferences.habits.time)
  const notif = {
    id: habitNotifId(habit.id),
    title: `Goal reminder: ${habit.name}`,
    body: `Don't forget — ${habit.name} is due today. Keep your streak going! 🔥`,
    channelId: CHANNEL_ID,
    extra: { route: '/habits' },
  }

  if (habit.frequency === 'daily') {
    notif.schedule = { on: { hour, minute }, repeats: true, allowWhileIdle: true }
  } else if (habit.frequency === 'weekly') {
    const createdDay = new Date(habit.createdDate).getDay()
    notif.schedule = { on: { weekday: createdDay + 1, hour, minute }, repeats: true, allowWhileIdle: true }
  }

  try {
    await LocalNotifications.schedule({ notifications: [notif] })
  } catch (e) {
    console.warn('[NotificationService] scheduleHabit failed:', e)
  }
}

/**
 * Cancel a specific habit's reminder.
 * Called when a habit is deleted.
 */
export async function cancelHabit(habitId) {
  if (!isNative()) return
  try {
    await LocalNotifications.cancel({ notifications: [{ id: habitNotifId(habitId) }] })
  } catch (e) {
    console.warn('[NotificationService] cancelHabit failed:', e)
  }
}

/**
 * Check if user has already checked in today and suppress the reminder if so.
 * Called on app resume (appStateChange).
 */
export async function checkSuppression(userId) {
  if (!isNative()) return
  try {
    const res = await getTodayCheckIn(userId)
    if (res.data) {
      await cancelCheckInToday()
    }
  } catch (e) {
    console.warn('[NotificationService] checkSuppression failed:', e)
  }
}

/**
 * Register deep-link handler — tapping a notification navigates to the route
 * stored in notification.extra.route.
 */
export function registerTapHandler(navigateFn) {
  if (!isNative()) return
  LocalNotifications.addListener('localNotificationActionPerformed', event => {
    const route = event.notification?.extra?.route
    if (route && navigateFn) {
      navigateFn(route)
    }
  })
}
