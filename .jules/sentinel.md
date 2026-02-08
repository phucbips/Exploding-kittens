## 2026-02-08 - Insecure Firebase Database Rules
**Vulnerability:** Default Firebase rules (`.read: true`, `.write: true`) allowed unauthorized access to the entire database, enabling deletion or modification of all rooms.
**Learning:** Initial setup of Firebase Realtime Database often defaults to permissive rules for ease of development, but this must be secured before going to production or public repositories.
**Prevention:** Restrict read/write access to specific data structures (e.g., `rooms/$roomId`) and enforce validation rules where possible, even without user authentication.
