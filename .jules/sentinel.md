## 2026-04-23 - [Firebase Realtime Database Global Access Exposure]
**Vulnerability:** Firebase Realtime Database `database.rules.json` had default rules `".read": true, ".write": true` at the root level, allowing anyone to read and write all database contents without authentication or authorization.
**Learning:** This existed because the default open testing rules were not updated for production, leaving the entire database fully exposed to the public internet, violating the principle of least privilege.
**Prevention:** Always restrict default rules to `".read": false, ".write": false` globally, and define explicit, path-restricted access rules (e.g., `"rooms": { "$roomId": { ".read": true, ".write": true } }`) mapped closely to the specific application logic.
