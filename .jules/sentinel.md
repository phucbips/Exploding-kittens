## 2026-03-10 - [Critical Firebase Rules Vulnerability]
**Vulnerability:** Firebase Realtime Database rules were configured with overly permissive global read/write access (`".read": true, ".write": true`).
**Learning:** This exposes the entire database to unauthorized access, contradicting the intended design of restricting access to the `rooms/$roomId` path. It allows anyone to read or manipulate game states and player data.
**Prevention:** Always follow the principle of least privilege. In this case, restrict global read/write to `false` and explicitly grant access only to the necessary paths, such as `rooms/$roomId`, allowing users to read/write only within specific game rooms.
