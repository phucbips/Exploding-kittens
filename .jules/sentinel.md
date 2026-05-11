## 2025-02-23 - Insecure Global Firebase Realtime Database Rules
**Vulnerability:** The `database.rules.json` file contained explicit global read and write permissions (`".read": true, ".write": true`), allowing unauthenticated attackers to read all data, modify existing records, and delete the entire database.
**Learning:** Default or overly permissive global rules are a catastrophic failure for database security. When using Firebase, security rules must default to false and be precisely scoped to the needed paths (e.g., `rooms/$roomId`).
**Prevention:** Always verify `database.rules.json` during setup to ensure `".read": false` and `".write": false` are the global defaults. Use targeted rules for specific data nodes.
