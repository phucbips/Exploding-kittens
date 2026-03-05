## 2024-05-15 - [Open Firebase Rules]
**Vulnerability:** Firebase database rules were completely open (`.read: true`, `.write: true`). Anyone could access, modify, or delete the entire database.
**Learning:** Development rules were left in production or the repository.
**Prevention:** Restrict Firebase rules to only allow operations on the `rooms/$roomId` path.
