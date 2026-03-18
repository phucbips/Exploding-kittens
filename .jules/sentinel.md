## 2024-05-24 - [CRITICAL] Firebase Global Read/Write Exposure
**Vulnerability:** Global read/write access in Firebase Realtime Database rules (`.read: true`, `.write: true`).
**Learning:** This is a common setup during prototyping but poses a massive security risk in production, exposing all game state and player data to anyone. Leaving root rules fully permissive completely negates backend security and makes the database fully public.
**Prevention:** Always default to explicit deny globally (`".read": false, ".write": false`), and only allow access on specific paths (e.g., `rooms/$roomId`) when appropriate.
