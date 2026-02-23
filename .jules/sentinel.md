## 2026-02-23 - [Critical: Open Database Access]
**Vulnerability:** The `database.rules.json` file was configured with `.read: true` and `.write: true` at the root level, allowing any unauthenticated user to read or modify the entire database.
**Learning:** This is a common misconfiguration in Firebase Realtime Database when developers prioritize ease of development over security. It exposes all application data to potential loss or manipulation.
**Prevention:** Always restrict database access to the specific paths required by the application (e.g., `rooms/$roomId`) and deny access to the root by default. Regularly audit security rules.
