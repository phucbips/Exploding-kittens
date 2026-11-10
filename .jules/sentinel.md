## 2026-11-10 - Unrestricted Firebase Realtime Database Rules
**Vulnerability:** The `database.rules.json` file had globally open `.read` and `.write` rules (`true`), allowing any unauthenticated user to read, modify, or wipe the entire database.
**Learning:** Default Firebase deployments sometimes start in "test mode" with open rules. Without Firebase Authentication, securing access requires structuring data such that unguessable IDs (like `$roomId`) act as the boundary for open access, rather than leaving the root open.
**Prevention:** Never set global `.read: true` or `.write: true` in production. Always default global rules to `false` and explicitly grant access only to specific paths using wildcards (e.g., `rooms/$roomId`).
