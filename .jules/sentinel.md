## 2025-04-28 - [CRITICAL] Fix insecure Firebase database rules
**Vulnerability:** Firebase database rules were set to global read/write, allowing unauthorized access to the entire database.
**Learning:** Default database rules must be changed immediately to restrict access strictly to the required paths (e.g., `rooms/$roomId`).
**Prevention:** Always verify and enforce strict Firebase security rules that deny global access by default and explicitly allow access only to specific paths using `$roomId` or user authentication.