## 2025-02-14 - [Insecure Firebase Rules]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with `".read": true, ".write": true` at the root. This allowed unauthenticated, global read/write access to the entire database, potentially allowing attackers to read, modify, or delete all active game rooms.
**Learning:** Due to the application's reliance on custom session IDs rather than Firebase Authentication (`auth != null` cannot be used), path-based security scoping is strictly required to lock down access.
**Prevention:** Always restrict `.read` and `.write` at the root path to `false`. Instead, grant explicit read/write access only to necessary sub-paths (like `rooms/$roomId`), minimizing the attack surface.
