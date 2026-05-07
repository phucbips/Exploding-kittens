## 2025-02-12 - Insecure Firebase Realtime Database Rules
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow global read and write access (`".read": true, ".write": true`), which could allow unauthorized users to read, modify, or delete any data in the database.
**Learning:** The database rules lacked proper path-based access control, exposing all paths globally rather than limiting access to the specific paths needed by the application (e.g., `rooms/$roomId`).
**Prevention:** Always configure Firebase Realtime Database rules with explicit deny by default (`".read": false, ".write": false`) at the root level and grant read/write access strictly at the specific path levels required by the application structure.
