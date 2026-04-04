## 2024-05-24 - [CRITICAL] Open Firebase Rules

**Vulnerability:** Global read/write access was enabled for all Firebase Realtime Database entries.
**Learning:** `database.rules.json` defaulted to global access, failing to restrict operations to specific contexts.
**Prevention:** Always enforce path-based access control, e.g. allowing read/write strictly inside scoped namespaces like `rooms/$roomId`.
