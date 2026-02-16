## 2024-05-23 - Open Database Rules
**Vulnerability:** The `database.rules.json` file allowed root-level read/write access (`.read: true`, `.write: true`) to the entire Firebase Realtime Database.
**Learning:** Default or template rules often prioritize development speed over security, leaving applications vulnerable to complete data loss or manipulation.
**Prevention:** Always audit security rules before deployment. Restrict access to specific paths and require authentication where possible.
