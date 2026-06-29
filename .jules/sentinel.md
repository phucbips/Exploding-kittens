## 2025-02-18 - [CRITICAL] Fix Globally Open Firebase Database Rules
**Vulnerability:** The Firebase Realtime Database security rules (`database.rules.json`) had `.read` and `.write` set to `true` globally, allowing anyone to read and write all data without restrictions.
**Learning:** This is a critical security vulnerability that exposes all game data to unauthorized access. Because the application does not use Firebase Authentication, rules cannot use `auth != null` checks.
**Prevention:** Always restrict access strictly to the paths necessary, such as `rooms/$roomId`, to prevent unauthorized access. Ensure global `.read` and `.write` are set to `false`.
