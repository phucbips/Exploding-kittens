## 2024-03-24 - [CRITICAL] Global Firebase Database Access
**Vulnerability:** The `database.rules.json` file was configured with global `".read": true` and `".write": true`, allowing any external actor to read, modify, or delete the entire database.
**Learning:** In architectures without Firebase Authentication (e.g., relying on sessionStorage and unguessable room IDs), global rules must still explicitly deny root access. Security relies on restricting access strictly to isolated paths (like `rooms/$roomId`) to prevent mass data breaches or wipeouts.
**Prevention:** Always default to `".read": false` and `".write": false` at the root level in Firebase rules, and only open specific paths necessary for the application to function.
