# Sentinel's Journal

## 2025-02-18 - [Critical] Open Firebase Rules
**Vulnerability:** The Firebase Realtime Database rules were configured with `.read: true` and `.write: true` at the root level, allowing any user (authenticated or not) to read and modify the entire database.
**Learning:** Default or development rules often start wide open for convenience but are frequently forgotten before production, leading to massive data exposure risks. In serverless apps without backend validation, database rules are the primary defense.
**Prevention:** Always scope database rules to the specific paths required by the application (e.g., `rooms/$roomId`) and deny access to the root by default. Use validation rules where possible.
