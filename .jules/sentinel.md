## 2025-02-23 - Insecure Firebase Rules
**Vulnerability:** The `database.rules.json` file was configured with `.read: true` and `.write: true` at the root level, allowing any user (authenticated or not) to read and write to the entire database.
**Learning:** Default configurations or quick setups can leave databases completely exposed if not explicitly locked down. Assuming client-side validation is enough is a common pitfall.
**Prevention:** Always implement granular security rules in Firebase. Restrict access to specific paths (e.g., `rooms/$roomId`) and deny root-level access by default. Regularly audit security rules.
