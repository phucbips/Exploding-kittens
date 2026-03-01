## 2025-03-01 - [Open Database Rules]
**Vulnerability:** Firebase Realtime Database rules were set to `.read: true, .write: true` globally, allowing anyone to read or wipe the entire database.
**Learning:** Default open rules are a critical vulnerability. Even without authentication, data must be restricted to specific known paths to prevent arbitrary data dumps or modifications at the root level.
**Prevention:** Always restrict `.read` and `.write` rules to only the specific paths that require access (e.g., `rooms/$roomId`) and explicitly set global access to `false`.
