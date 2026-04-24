## 2024-04-24 - Firebase Global Read/Write Access

**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured to allow global read and write access (`".read": true, ".write": true`), exposing the entire database to anyone.
**Learning:** Default or overly permissive database rules are a common misconfiguration that leads to critical data exposure. Applications must use principle of least privilege.
**Prevention:** Always default to `".read": false, ".write": false` globally, and only open specific paths (e.g., `rooms/$roomId`) as required by the application structure.
