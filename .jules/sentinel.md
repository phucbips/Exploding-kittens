## 2026-05-21 - [Restrict Firebase Realtime Database rules]
**Vulnerability:** Global read and write access were enabled (`".read": true, ".write": true`) in `database.rules.json`.
**Learning:** Default Firebase RTDB rules are often set to open, allowing anyone with the database URL to read or modify any data.
**Prevention:** Explicitly deny global access by default and whitelist specific paths (like `rooms/$roomId`) that require read/write access.
