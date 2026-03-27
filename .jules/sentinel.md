## 2024-03-27 - [Firebase Realtime Database Insecure Global Access]
**Vulnerability:** The Firebase `database.rules.json` file was configured with `".read": true` and `".write": true` at the root, allowing unauthenticated and unauthorized global access to all data in the database.
**Learning:** This typically occurs during prototyping and is forgotten before deployment. Leaving global read/write rules exposes all database contents (including all game rooms and player information) to anyone with the database URL.
**Prevention:** Always follow the Principle of Least Privilege. Default root rules to `".read": false` and `".write": false`. Explicitly open only the paths that need access (e.g., `rooms/$roomId`) and, if applicable, add authentication checks.
