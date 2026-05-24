## 2024-05-24 - Firebase Insecure Realtime Database Rules
**Vulnerability:** `database.rules.json` had `".read": true` and `".write": true` at the root level, allowing anyone to read and write the entire database.
**Learning:** Default Firebase rules are often overly permissive for initial development but are critical security risks. The application only needs access to `rooms/$roomId`, not the entire database root.
**Prevention:** Always restrict Firebase rules to specific paths (`rooms/$roomId`) and explicitly deny global access (`".read": false, ".write": false` at root).