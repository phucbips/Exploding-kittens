## 2026-07-04 - [Firebase Global DB Access]
**Vulnerability:** Firebase Realtime Database was configured with global read/write access (`.read: true`, `.write: true`), allowing unauthorized read and modification of the entire database.
**Learning:** Because the application does not use Firebase Authentication (relying instead on sessionStorage and custom IDs), we cannot use the standard `auth != null` rules.
**Prevention:** Configure explicitly path-based rules. Disable global access (`".read": false, ".write": false`) and restrict permissions strictly to paths like `rooms/$roomId`.