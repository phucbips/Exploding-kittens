## 2025-06-05 - Restrict Global Firebase Database Access
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with global read/write access (`".read": true, ".write": true`), exposing the entire database to unauthorized reading, modification, or deletion.
**Learning:** Default or overly permissive rules during development can easily leak into production. Without explicit path restrictions, an attacker could wipe all rooms or inject malicious data at the root level.
**Prevention:** Always follow the principle of least privilege in Firebase security rules. Deny global access by default (`".read": false, ".write": false`) and explicitly whitelist necessary paths (e.g., `rooms/$roomId`) for application functionality.
