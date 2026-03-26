## 2025-02-14 - [Firebase Global Read/Write Permissions]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow global read and write access (`".read": true, ".write": true`), potentially exposing all game data and user information.
**Learning:** Default or overly permissive security rules are a common oversight during development, potentially allowing any user to read, modify, or delete the entire database content.
**Prevention:** Always follow the principle of least privilege. In this case, global read/write was denied (`".read": false, ".write": false`), and read/write access was specifically restricted to the `rooms/$roomId` path, limiting exposure exclusively to relevant game rooms.
