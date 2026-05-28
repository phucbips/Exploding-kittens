## 2024-05-24 - [CRITICAL] Open Firebase Database Rules
**Vulnerability:** Firebase Realtime Database rules were configured with `".read": true, ".write": true` at the root level, allowing completely open read, write, and delete access to the entire database by any unauthenticated user on the internet.
**Learning:** Default or quickly scaffolded Firebase projects often leave root-level rules open for easy initial development, but this presents a critical risk if deployed to production or left exposed. It violates the principle of least privilege.
**Prevention:** Always default root rules to `false`. Explicitly scope permissions to specific paths (e.g., `rooms/$roomId`) and, when applicable, enforce authentication (`auth != null`) and data validation within the rules.
