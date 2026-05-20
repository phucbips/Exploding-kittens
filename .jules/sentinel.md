## 2026-05-20 - [CRITICAL] Global Firebase Database Access Vulnerability

**Vulnerability:** The `database.rules.json` file allowed global, unauthenticated read and write access (`".read": true, ".write": true`) to the entire Firebase Realtime Database.
**Learning:** During MVP or initial prototyping, security rules are often set to true for convenience, but this can easily be overlooked before moving toward production, exposing all data (like game rooms, player hands, IDs, etc.) to malicious actors who could manipulate or exfiltrate game states.
**Prevention:** Always restrict access by default (`".read": false, ".write": false`) and only open up specific paths required by the application. In this case, access is only permitted under `rooms/$roomId`. Consider adding further validation within those paths for complete security.
