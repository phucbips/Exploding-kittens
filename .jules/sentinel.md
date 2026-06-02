## 2026-06-02 - [Insecure Firebase Rules]
**Vulnerability:** Firebase Realtime Database was configured with global read/write access (`".read": true, ".write": true`), allowing anyone with the database URL to read or modify all data in the database.
**Learning:** This existed because the default or development rules were committed. It's a critical architectural gap because it bypasses all application-level logic and exposes everything.
**Prevention:** Always ensure `database.rules.json` explicitly denies global access (`".read": false, ".write": false`) and only grants access to specific, required paths (e.g., `rooms/$roomId`).
