## 2024-03-14 - Fix Insecure Firebase Database Rules
**Vulnerability:** Global read/write access allowed in `database.rules.json`.
**Learning:** Default Firebase rules often allow open access, which is a critical risk for production applications, allowing anyone to read or modify the entire database.
**Prevention:** Always restrict access to specific paths (e.g., `rooms/$roomId`) and explicitly deny global access (`".read": false, ".write": false`).
