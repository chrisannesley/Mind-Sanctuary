# Requirements Document

# Push Notifications — Requirements

## Introduction

MindWell (Mind Sanctuary) will deliver timely, opt-in local push notifications to the user's Android device via Capacitor Local Notifications. No server-side push infrastructure is required. All scheduling and delivery happens on-device. The feature has three notification channels: daily check-in reminders, goal/habit reminders, and a daily motivational quote. Users configure each channel independently in their Profile settings, and preferences are persisted in the existing backend user profile (JSON file database).

---

## Requirements

### REQ-1 — Daily Check-In Reminder

**REQ-1.1** The app shall schedule a daily local notification to remind the user to complete their daily check-in at a time chosen by the user.

**Acceptance Criteria:**
- AC-1.1.1: When the user enables the check-in reminder and saves their profile, a repeating daily local notification is scheduled using Capacitor Local Notifications at the exact time specified by the user (HH:MM, 24-hour, device local time).
- AC-1.1.2: The notification title shall be "Time for your daily check-in 🧠" and the body shall be "Take a moment to check in with yourself. It only takes a minute." (or an equivalent copy-approved string stored in a constants file).
- AC-1.1.3: Tapping the notification shall deep-link the user directly to the `/check-in` route within the app.
- AC-1.1.4: If the user has already completed a check-in for the current calendar day (as determined by the `getTodayCheckIn` API returning a non-null result), the app shall cancel any pending check-in reminder for that day so the notification is not delivered.
- AC-1.1.5: The suppression check in AC-1.1.4 shall be evaluated at app foreground/resume as well as at the scheduled notification time (using a `beforePresent` guard or equivalent Capacitor hook).
- AC-1.1.6: If the check-in reminder is disabled by the user and the profile is saved, any existing scheduled check-in notification shall be cancelled immediately.
- AC-1.1.7: When the user changes their preferred check-in reminder time and saves, the old scheduled notification shall be cancelled and a new one scheduled for the updated time before the save completes.
- AC-1.1.8: The check-in reminder shall not fire on days when the user's `notificationsEnabled` master switch is off (see REQ-4).

---

### REQ-2 — Goal / Habit Due Reminder

**REQ-2.1** The app shall send a local notification reminding the user when a goal or habit is due, based on that goal's frequency setting.

**Acceptance Criteria:**
- AC-2.1.1: For each goal with `frequency: 'daily'`, a daily repeating notification shall be scheduled at the user's configured habit reminder time (a single, shared time for all habit reminders).
- AC-2.1.2: For each goal with `frequency: 'weekly'`, a weekly repeating notification shall be scheduled at the user's configured habit reminder time on the same day of the week the goal was created (or a day the user has specified, if that field is added).
- AC-2.1.3: Goals with `frequency: 'monthly'` shall not generate push notifications in this version. Monthly goals are excluded because reliable monthly scheduling on Android via Capacitor Local Notifications requires additional date-calculation complexity that is out of scope.
- AC-2.1.4: The notification title shall be "Goal reminder: {goal name}" and the body shall be "Don't forget — {goal name} is due today. Keep your streak going! 🔥".
- AC-2.1.5: Tapping the notification shall deep-link the user to the `/habits` route.
- AC-2.1.6: If a goal has already been marked complete for the current period (today for daily, current week for weekly), the reminder for that goal shall not be delivered. The same `beforePresent` guard pattern used in REQ-1 applies.
- AC-2.1.7: When a goal is deleted (`deleteHabit`), its associated scheduled notification shall be cancelled immediately.
- AC-2.1.8: When a goal is edited and its name or frequency changes, the old notification shall be cancelled and a new one rescheduled to reflect the updated values.
- AC-2.1.9: When a new goal is created, its reminder notification shall be scheduled immediately if the user has goal reminders enabled (see REQ-4.3).
- AC-2.1.10: Goal reminders shall not fire when the master `notificationsEnabled` switch is off (see REQ-4).

---

### REQ-3 — Daily Motivational Quote Notification

**REQ-3.1** The app shall optionally send one motivational quote notification per day at a time the user chooses.

**Acceptance Criteria:**
- AC-3.1.1: When the motivational quote notification is enabled and the profile is saved, a daily repeating notification shall be scheduled at the user's specified quote delivery time.
- AC-3.1.2: The notification shall display a quote drawn from a predefined list of at least 20 mental-health-appropriate, royalty-free quotes stored locally on the device (no network call required for delivery).
- AC-3.1.3: The quote displayed each day shall rotate through the list in a deterministic, non-repeating order (e.g., quote index = `daysSinceEpoch % quoteCount`), so the user sees a different quote each day without requiring a server.
- AC-3.1.4: The notification title shall be "Your daily quote ✨" and the body shall contain the selected quote text (truncated to 200 characters if necessary).
- AC-3.1.5: Tapping the notification shall deep-link the user to the `/inspiration` route (the existing Inspiration page).
- AC-3.1.6: The motivational quote notification is **off by default** for all users (opt-in, not opt-out).
- AC-3.1.7: If the motivational quote notification is disabled and the profile is saved, any existing scheduled quote notification shall be cancelled immediately.
- AC-3.1.8: Quote notifications shall not fire when the master `notificationsEnabled` switch is off (see REQ-4).

---

### REQ-4 — User Notification Preferences

**REQ-4.1** The app shall provide a Notification Preferences section within the existing Profile page (`/profile`) that allows the user to configure all notification channels independently.

**Acceptance Criteria:**
- AC-4.1.1: The Profile page shall include a "Push Notifications" section containing the following controls:
  - A master on/off toggle labelled "Enable push notifications". When this is off, no notifications from any channel are delivered.
  - A toggle labelled "Daily check-in reminder" with a time picker for the reminder time (default: 09:00).
  - A toggle labelled "Goal & habit reminders" with a time picker for the reminder time (default: 08:00).
  - A toggle labelled "Daily motivational quote" with a time picker for the delivery time (default: 07:30).
- AC-4.1.2: Individual channel toggles (check-in, habits, quote) shall only be visible and interactive when the master notification toggle is on.
- AC-4.1.3: Time pickers shall allow selection of any time in 15-minute increments (00:00–23:45).
- AC-4.1.4: All preference values shall be included in the form data submitted to `PUT /api/users/:userId` (or equivalent `updateUser` call) and persisted to the backend's JSON user profile store.
- AC-4.1.5: When the Profile page loads, the notification preference controls shall be pre-populated with the values stored in the user's profile (loaded via the existing `user` prop / `setUser` state).
- AC-4.1.6: Saving the profile (existing "Save Profile" button) shall atomically persist all notification preferences and immediately re-schedule (or cancel) notifications to reflect the new preferences, before showing the success message.
- AC-4.1.7: If the user denies the Android notification permission at the OS level, the app shall display an inline warning in the Notification Preferences section explaining that permission is required and linking to Android Settings. The preference controls shall still be saved but notifications will not fire until permission is granted.
- AC-4.1.8: The app shall request the Android POST_NOTIFICATIONS permission (required on Android 13+) on first enable of any notification channel, using the Capacitor `LocalNotifications.requestPermissions()` API.

---

### REQ-5 — Android / Capacitor Delivery

**REQ-5.1** All notifications shall be delivered via the Capacitor `@capacitor/local-notifications` plugin and shall function correctly on Android API level 26 (Oreo) and above.

**Acceptance Criteria:**
- AC-5.1.1: The `@capacitor/local-notifications` package shall be added to the project's frontend dependencies and the Android platform project shall be synced (`npx cap sync android`) before release.
- AC-5.1.2: The app shall create a dedicated Android notification channel with ID `mindwell_reminders`, name "MindWell Reminders", and importance level `IMPORTANCE_DEFAULT` during app initialisation (before any notification is scheduled).
- AC-5.1.3: All scheduled notifications shall reference the `mindwell_reminders` channel ID.
- AC-5.1.4: Notifications shall persist across device reboots. The `@capacitor/local-notifications` plugin handles boot-time rescheduling natively on Android; the feature shall not introduce any additional rescheduling workaround that conflicts with this behaviour.
- AC-5.1.5: The feature shall not use Firebase Cloud Messaging (FCM) or any server-side push mechanism. All scheduling is local and on-device only.
- AC-5.1.6: Each notification type shall use a stable, unique numeric ID:
  - Check-in reminder: ID `1001`
  - Motivational quote: ID `1002`
  - Goal reminders: IDs starting at `2000 + habitId` (or a deterministic hash of the habit UUID if IDs are non-numeric)
- AC-5.1.7: When running in a browser (non-Capacitor environment, e.g., during `vite dev`), all `LocalNotifications` calls shall be silently no-op'd via a platform check (`Capacitor.isNativePlatform()`), so development is not disrupted.

---

### REQ-6 — Backend Preference Storage

**REQ-6.1** Notification preferences shall be stored as part of the existing user record in the backend JSON file database, extending the current user profile schema.

**Acceptance Criteria:**
- AC-6.1.1: The backend user profile object shall be extended with a `notificationPreferences` field with the following structure:

  ```json
  {
    "notificationPreferences": {
      "masterEnabled": false,
      "checkIn": {
        "enabled": true,
        "time": "09:00"
      },
      "habits": {
        "enabled": true,
        "time": "08:00"
      },
      "quote": {
        "enabled": false,
        "time": "07:30"
      }
    }
  }
  ```

- AC-6.1.2: The existing `PUT /api/users/:userId` endpoint shall accept and persist the `notificationPreferences` object when present in the request body, merging it into the existing user record without overwriting other fields.
- AC-6.1.3: The existing `GET /api/users/:userId` endpoint shall include `notificationPreferences` in the response payload.
- AC-6.1.4: If `notificationPreferences` is absent from a user record (existing users before this feature is deployed), the backend shall return a default `notificationPreferences` object with `masterEnabled: false` and all channel `enabled` values set to `false`, so the frontend never receives `undefined`.
- AC-6.1.5: The `time` values shall be stored and transmitted as strings in `HH:MM` 24-hour format (e.g., `"09:00"`, `"21:30"`). The backend shall validate that any submitted time value matches the regex `^([01]\d|2[0-3]):[0-5]\d$` and return HTTP 400 with a descriptive error message if validation fails.
- AC-6.1.6: The existing `notificationsEnabled` and `notificationType` fields on the user profile shall be preserved unchanged to avoid breaking any existing functionality.

---

### REQ-7 — Check-In Completion Suppression

**REQ-7.1** The app shall not deliver a check-in reminder on any day the user has already completed their daily check-in.

**Acceptance Criteria:**
- AC-7.1.1: On every app resume (Capacitor `App.addListener('appStateChange')` where `isActive === true`), the app shall call `getTodayCheckIn(userId)`. If a check-in record is returned for the current calendar day, any pending check-in notification scheduled for later that day shall be cancelled via `LocalNotifications.cancel()`.
- AC-7.1.2: When the user successfully submits a check-in (the `handleCheckInSubmit` function in `CheckIn.jsx` resolves without error), the app shall immediately cancel the check-in reminder notification for that day without waiting for the next app resume cycle.
- AC-7.1.3: Suppression applies only to the current calendar day, determined by the device's local time zone. The next day's notification shall be rescheduled automatically by the recurring schedule (no manual re-schedule required).
- AC-7.1.4: Suppression shall not affect the goal/habit or motivational quote notification channels.

---

## Glossary

| Term | Definition |
|------|-----------|
| Local Notification | A notification scheduled and delivered entirely on-device by the OS, requiring no server or network. |
| Capacitor Local Notifications | The `@capacitor/local-notifications` plugin that wraps Android's `NotificationManager` API. |
| Channel (Android) | An Android notification channel (`NotificationChannel`) that groups related notifications and controls their default sound, vibration, and importance level. |
| Master switch | The top-level "Enable push notifications" toggle that gates all notification channels. |
| Check-in | The daily mood/wellness self-assessment submitted via the `/check-in` route. |
| Goal / Habit | A user-created wellness behaviour tracked in the Habit Tracker (`/habits`), with a `frequency` of `daily`, `weekly`, or `monthly`. |
| Motivational quote | A short positive statement displayed once per day, drawn from a local quote list. |
| `notificationPreferences` | The JSON sub-object added to the user profile to store all push-notification settings. |
| `HH:MM` | 24-hour time string format, e.g., `"09:00"` or `"21:30"`. |
| `beforePresent` guard | A check performed just before a notification fires (or on app resume) that suppresses delivery if the triggering condition has already been satisfied. |

---

## Out of Scope (This Version)

- iOS / Apple Push Notification Service (APNs) support.
- Server-side push notifications (FCM, APNs, WebPush).
- In-app notification inbox or notification history log.
- Notification snooze/dismiss actions.
- Per-goal custom reminder times (all goals share one reminder time).
- Monthly goal reminders (see AC-2.1.3).
- Email or SMS notifications (the existing `notificationType` field covers a future phase).
- Notification sound or vibration customisation beyond Android channel defaults.
