
## $(date +%Y-%m-%d) - [Firebase Database Missing Authorization Checks]
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with global `".read": true` and `".write": true`, exposing the entire database to unauthorized public access and manipulation.
**Learning:** Default or overly permissive database rules are a critical vulnerability, especially in applications lacking robust authentication, allowing malicious actors to read, modify, or delete sensitive application data (like all game rooms and player states). Because the application relies on `sessionStorage` rather than Firebase Auth, `auth != null` rules cannot be used.
**Prevention:** Always enforce the principle of least privilege in database security rules. Explicitly deny read and write access at the root level (`".read": false, ".write": false`) and restrict access exclusively to the specific paths required by the application (e.g., `"rooms/$roomId"`).
