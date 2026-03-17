## 2024-05-18 - [Firebase Realtime Database Global Read/Write Access]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with global read/write access (`".read": true, ".write": true`).
**Learning:** This exposes the entire database, potentially allowing anyone with the database URL to read or modify any data, not just game rooms.
**Prevention:** Always default to explicitly denying global access (`".read": false, ".write": false`) and only grant access to specific paths required by the application, such as `rooms/$roomId` in this case.
