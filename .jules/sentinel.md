## 2024-05-18 - [Fix Open Firebase Database]
**Vulnerability:** Firebase Realtime Database rules were configured with `".read": true` and `".write": true` at the root level, allowing anyone to read, modify, or delete all data in the database.
**Learning:** This is a common misconfiguration that exposes all database contents globally, representing a critical security flaw.
**Prevention:** Always restrict root-level access by setting global `".read": false` and `".write": false`. Explicitly grant read/write access only to specific paths (e.g., `rooms/$roomId`) where necessary for application functionality.
