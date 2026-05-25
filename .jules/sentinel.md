## 2024-05-25 - Insecure Firebase Database Rules
**Vulnerability:** Firebase Realtime Database rules were configured with global read/write access (`".read": true, ".write": true`), allowing anyone to read or modify any data in the database.
**Learning:** Default or development Firebase rules are often left completely open, which is a critical security risk when deployed. The game only needs access to specific room paths.
**Prevention:** Explicitly deny global read/write access and restrict access strictly to required paths (e.g., `rooms/$roomId`).
