## 2024-05-18 - [Firebase Realtime Database Global Access Rules]
**Vulnerability:** Firebase Realtime Database rules were configured to allow global read and write access (`".read": true, ".write": true`), which allows anyone to read and write all data in the database.
**Learning:** This is a common misconfiguration in Firebase that exposes the entire database to the public. It occurred because default development rules were likely not updated for production, leaving all endpoints wide open.
**Prevention:** Always default to global deny (`".read": false, ".write": false`) and explicitly whitelist specific paths, such as `rooms/$roomId`, allowing access only where needed.
