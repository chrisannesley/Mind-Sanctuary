# Architecture Selection: Push Notifications

## Recommended Architecture: Monolithic Notification Service (Candidate A)

### Rationale
A single `NotificationService` module centralises all OS interactions, invariant enforcement, and scheduling logic. This minimises cross-cutting requirements (28% vs 57% for alternatives) and achieves the lowest evolvability cost (1.3 avg components changed per new requirement). All six scheduling invariants — including the master switch (INV-1), same-day suppression (INV-2), and atomic reschedule-on-save (INV-6) — are enforced in one place with no cross-component coordination. The trade-off is a service module that owns approximately 67% of notification-related state; this is acceptable because it is a stateless utility (no UI state) whose high ownership reflects appropriate responsibility concentration rather than coupling.

### Components

| Component | Owned State | Responsibility |
|-----------|-------------|----------------|
| `NotificationService` | `scheduledNotifications[]`, `permissionStatus` | All Capacitor LocalNotifications calls: channel setup, permission request, schedule, cancel, quote rotation, suppression logic, platform guard |
| `Profile.jsx` (extended) | Notification preference form state | UI controls for master toggle + per-channel toggles + time pickers; writes to backend on save; calls NotificationService.rescheduleAll() after save |
| `CheckIn.jsx` (extended) | — | Calls `NotificationService.cancelCheckInToday()` after successful check-in submission |
| `HabitTracker.jsx` (extended) | — | Calls `NotificationService.scheduleHabit()` / `cancelHabit()` on habit CRUD |
| `App.jsx` (extended) | — | Calls `NotificationService.init()` on mount; calls `NotificationService.checkSuppression()` on `appStateChange` |
| Backend `/api/users` | `notificationPreferences` (persisted in user JSON) | Store and retrieve notification preferences as part of user record; validate HH:MM format |

### Information Flow

| From \ To | NotificationService | Profile.jsx | CheckIn.jsx | HabitTracker.jsx | App.jsx | Backend |
|-----------|--------------------|--------------|--------------|--------------------|---------|---------|
| **App.jsx** | init(), checkSuppression() | | | | | |
| **Profile.jsx** | rescheduleAll() | | | | | PUT /api/users |
| **CheckIn.jsx** | cancelCheckInToday() | | | | | |
| **HabitTracker.jsx** | scheduleHabit(), cancelHabit() | | | | | |
| **NotificationService** | | | | | | GET /api/users (prefs), getTodayCheckIn(), getHabits() |
| **Backend** | | ← prefs on load | | | | |

### Requirement Allocation

| Requirement | Component(s) |
|-------------|--------------|
| REQ-1 Daily Check-In Reminder | NotificationService (scheduling/suppression), App.jsx (appStateChange hook) |
| REQ-2 Goal/Habit Reminders | NotificationService (scheduling), HabitTracker.jsx (CRUD hooks) |
| REQ-3 Motivational Quote | NotificationService (scheduling, quote rotation) |
| REQ-4 User Notification Preferences | Profile.jsx (UI), NotificationService (apply on save) |
| REQ-5 Android/Capacitor Delivery | NotificationService (all Capacitor calls, channel setup, ID assignment, platform guard) |
| REQ-6 Backend Preference Storage | Backend `/api/users` (schema extension, validation) |
| REQ-7 Check-In Suppression | NotificationService (cancel logic), CheckIn.jsx (post-submit hook), App.jsx (resume hook) |

### Key Design-Induced Invariants

- **INV-A:** `NotificationService` is the **only** module that calls `LocalNotifications.*`. No other component imports or calls Capacitor LocalNotifications directly.
- **INV-B:** `NotificationService.init()` must complete before any other NotificationService method is called. App.jsx is responsible for sequencing this.
- **INV-C:** All public methods of `NotificationService` silently no-op when `Capacitor.isNativePlatform()` is false, so the dev server never throws.
- **INV-D:** `rescheduleAll()` is always atomic: cancel all existing, then schedule all new. It never partially applies.

### Alternatives Considered

| Candidate | Strength | Weakness | Why Not Selected |
|-----------|----------|----------|-----------------|
| Event-Driven (Candidate B) | Clear SoC, extensible rule engine | High evolvability cost (2.1), event bus indirection unnecessary at 3 channels | Over-engineered; adds 2 extra components (RuleEngine, PreferenceStore) without proportionate benefit |
| Persistence-First (Candidate C) | Backend as source of truth, multi-device ready | Network dependency for device-local feature; backend unreachable → no notifications | Structural mismatch: local notifications should not require backend roundtrip for scheduling |

### Metrics Summary

| Metric | Selected (A) | Event-Driven (B) | Persistence-First (C) |
|--------|-------------|------------------|-----------------------|
| Cross-cutting reqs % | **28%** | 57% | 57% |
| Cross-cutting invariants % | **14%** | 28% | 28% |
| Flow density | **0.17** | 0.17 | 0.25 |
| God object score | 67% | **25%** | 50% |
| Sync cycles | **0** | **0** | **0** |
| Max fan-in | 4 | **3** | 3 |
| Max fan-out | **1** | **1** | 2 |
| Evolvability cost (avg components/REQ) | **1.3** | 2.1 | 2.4 |
