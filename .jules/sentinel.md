## 2025-02-18 - [Firebase Root Database Exposed]
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with global read (`".read": true`) and write (`".write": true`) access.
**Learning:** Default configurations or quick-start setups often leave the entire database open. Because this app does not use Firebase Authentication (`auth != null` cannot be used), relying on obfuscation (secret paths) is not sufficient. If the root is exposed, attackers can download the whole database, enumerate active rooms, or wipe all data.
**Prevention:** Always restrict `.read` and `.write` at the root to `false` and explicitly grant access only to the necessary sub-nodes (e.g., `rooms/$roomId`).
