## 2026-02-11 - [Critical: Open Firebase Database Access]
**Vulnerability:** The `database.rules.json` file was configured with `.read: true` and `.write: true` at the root level, allowing any unauthenticated user to read, write, and delete the entire database.
**Learning:** Default Firebase rules often start open for development ease, but failing to lock them down before production leaves the application completely vulnerable.
**Prevention:** Always implement granular security rules from the start. Use path-based restrictions (e.g., `rooms/$roomId`) to scope access and prevent root-level writes.
