## 2025-02-14 - Fix Overly Permissive Firebase Database Rules
**Vulnerability:** Firebase Realtime Database rules were set to globally allow all reads and writes (`".read": true, ".write": true`), which could allow unauthorized actors to read or modify any data in the database.
**Learning:** Default configuration or initial development rules were left in place, leaving the entire database fully exposed without any form of structural access control. The application actually only needs access scoped to `rooms/$roomId`.
**Prevention:** Always scope Firebase rules strictly to the specific paths required by the application (e.g., `rooms/$roomId`) and ensure the root-level global access default is explicitly denied (`".read": false, ".write": false`).
