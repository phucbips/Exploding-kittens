## 2026-02-14 - Critical: Unrestricted Database Access
**Vulnerability:** Firebase Realtime Database rules were set to `.read: true` and `.write: true` at the root, allowing anyone to wipe the database.
**Learning:** Default Firebase configurations often start insecurely to ease development but must be locked down before any public exposure.
**Prevention:** always restrict root-level write access. Use specific paths for data access (e.g., `rooms/$roomId`).
