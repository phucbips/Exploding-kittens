## 2026-02-20 - Insecure Database Rules
**Vulnerability:** Firebase Realtime Database rules were configured with `.read: true` and `.write: true` at the root level, allowing any user to read, write, or delete the entire database.
**Learning:** Default configurations or quick prototyping often leave security rules open.
**Prevention:** Always restrict database access to the narrowest scope required. Used `rooms/$roomId` structure to isolate game instances and restrict access to known paths.
