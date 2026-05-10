## 2025-02-14 - [CRITICAL] Global Read/Write in Firebase Realtime Database
**Vulnerability:** The `database.rules.json` file had `".read": true` and `".write": true` at the root level, making the entire database readable and writable by any anonymous user globally.
**Learning:** This is a classic insecure default configuration pattern. For Firebase apps, root access should always be strictly denied unless using authentication. The app logic only needed access to the `rooms/` namespace.
**Prevention:** Always default to `".read": false, ".write": false` at the root and selectively open specific paths using wildcard variables like `$roomId` to enforce the Principle of Least Privilege.
