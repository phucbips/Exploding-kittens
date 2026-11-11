## 2024-05-24 - Secure Firebase Realtime Database rules without Authentication
**Vulnerability:** Firebase Realtime Database rules were globally open to read and write operations (`".read": true, ".write": true`), allowing unauthorized access to the entire database.
**Learning:** In applications that rely on custom identifiers (like session-based IDs) rather than Firebase Authentication, rules cannot use `auth != null`. However, global read/write is still insecure.
**Prevention:** Always restrict access to the specific paths required by the application (e.g., `rooms/$roomId`) and explicitly deny global access (`".read": false, ".write": false`).
