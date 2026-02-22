## 2026-02-22 - [Critical] Unrestricted Firebase Root Access
**Vulnerability:** The `database.rules.json` file was configured with `.read: true` and `.write: true` at the root level, allowing any user to read, modify, or delete the entire database.
**Learning:** Starter templates and default Firebase setups often use overly permissive rules to simplify development. Explicitly defining access rules for specific paths (e.g., `rooms/$roomId`) is critical.
**Prevention:** Always verify `database.rules.json` during setup and ensure root access is denied by default, only allowing access to specific data paths.
