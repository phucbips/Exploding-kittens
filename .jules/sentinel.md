
## 2024-04-27 - [CRITICAL] Fix Global Firebase Database Access
**Vulnerability:** Firebase Realtime Database rules in `database.rules.json` were configured with `".read": true, ".write": true` at the root level, granting global, unrestricted access to anyone on the internet to read, modify, or delete the entire database.
**Learning:** Default or overly permissive Firebase rules are a severe security risk, especially in rapid prototyping or incomplete configurations.
**Prevention:** Always restrict access by default (`".read": false, ".write": false`) at the root and explicitly grant access only to necessary paths (e.g., `rooms/$roomId`) based on the application's specific data model and authentication state.
