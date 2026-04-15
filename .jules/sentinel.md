## 2026-04-15 - [Insecure Firebase Database Rules]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow global read and write access (`".read": true, ".write": true`), exposing the entire database to anyone with the project ID.
**Learning:** The open rules were likely left as a default during early development, forgetting to restrict them later. This meant anyone could read or overwrite the game data without joining a room.
**Prevention:** Always follow the principle of least privilege. In this architecture, deny global read/write access explicitly and restrict access exclusively to specific paths like `rooms/$roomId`. Validate the security rules early and update them as part of releasing changes.
