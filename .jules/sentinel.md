## 2025-02-18 - [Insecure Firebase Rules]
**Vulnerability:** Firebase Realtime Database rules were set to public read/write at the root level, allowing any user to modify or delete the entire database.
**Learning:** Default or "test mode" configurations in Firebase often leave the database completely exposed. Developers might assume client-side logic protects the data, but direct API access bypasses this.
**Prevention:** Always scope database rules to the specific paths required by the application (e.g., `rooms/$roomId`) and disable root access by default.
