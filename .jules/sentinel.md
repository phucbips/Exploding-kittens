## 2025-05-15 - Insecure Firebase Database Rules
**Vulnerability:** The Firebase Realtime Database rules were configured with `.read: true` and `.write: true` at the root level, allowing any user (authenticated or not) to read and overwrite the entire database.
**Learning:** Default Firebase rules often start open for development convenience but must be locked down before any deployment. The application relies on client-side logic for security, which is insufficient.
**Prevention:** Always restrict database access to the specific paths required by the application (e.g., `rooms/`) and validate data structure where possible. Use Firebase Authentication for stronger identity verification.
