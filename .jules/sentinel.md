## 2024-05-24 - [Insecure Firebase Rules]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with global read and write access (`".read": true, ".write": true`). This is a critical security vulnerability that allows anyone to read, modify, or delete the entire database.
**Learning:** This insecure pattern is common in development or initial setup phases, but must be replaced with proper access controls before deploying to production.
**Prevention:** Always restrict Firebase rules to specific required paths (e.g., `rooms/$roomId`) and explicitly deny global access (`".read": false, ".write": false`).
