## 2024-05-24 - [Overly Permissive Firebase Rules]
**Vulnerability:** Firebase Realtime Database rules were set to `.read: true, .write: true` at the root level.
**Learning:** This allowed any client to read and overwrite the entire database without any restriction.
**Prevention:** Follow the principle of least privilege when configuring Firebase Realtime Database rules. Explicitly declare scopes. In this case, read/write access should only be granted to the `rooms/$roomId` path.
