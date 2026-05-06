
## 2024-05-24 - [Overly Permissive Firebase Rules]
**Vulnerability:** Firebase Realtime Database rules were set to `".read": true, ".write": true` at the root, allowing unauthenticated read/write access to the entire database.
**Learning:** Default configuration or rapid prototyping often leaves global access enabled, which is a critical security risk.
**Prevention:** Always configure Firebase rules to explicitly deny global access and selectively allow access to necessary nodes (like `rooms/$roomId`) using secure scoping.
