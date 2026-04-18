## 2024-05-18 - [CRITICAL] Firebase Realtime Database Global Read/Write Access
**Vulnerability:** Firebase `database.rules.json` had global `".read": true` and `".write": true`, allowing anyone to read and modify the entire database.
**Learning:** Default Firebase rules might be overly permissive for testing but must be locked down before deployment. Always check `database.rules.json`.
**Prevention:** Configure `database.rules.json` to explicitly deny global access (`".read": false, ".write": false`) and restrict access to specific paths like `"rooms/$roomId"` with appropriate rules.
