## 2024-05-15 - Unrestricted Firebase Realtime Database Access
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow global read and write access (`".read": true, ".write": true`).
**Learning:** This exposes all game data to anyone with the Firebase configuration, allowing unauthorized reading and manipulation of game states, potentially ruining games and exposing player identifiers.
**Prevention:** Always restrict access by default (`".read": false, ".write": false`) and only open up specific paths (like `rooms/$roomId`) as required. Ideally, incorporate authentication and specific user validation.
