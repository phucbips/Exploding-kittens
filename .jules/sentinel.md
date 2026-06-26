## 2024-06-26 - [CRITICAL] Fix insecure Firebase Realtime Database rules
**Vulnerability:** The `database.rules.json` file had `".read": true` and `".write": true` set at the root level, meaning anyone with the database URL could read, write, or delete the entire database.
**Learning:** Because the application does not use Firebase Authentication (relying on sessionStorage and custom IDs), we cannot use `auth != null` checks. Thus, default insecure configurations open the entire database to anyone, not just the connected clients playing the game.
**Prevention:** Explicitly deny global access (`".read": false, ".write": false`) at the root and restrict access strictly to the expected data path (`rooms/$roomId`) for unauthenticated games to limit potential exposure.
