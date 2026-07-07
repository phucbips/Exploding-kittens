## 2024-05-18 - [Insecure Firebase Rules]
**Vulnerability:** Firebase Realtime Database rules allowed global read/write access.
**Learning:** Because the application does not use Firebase Authentication (relying instead on sessionStorage and custom IDs), Firebase Realtime Database rules cannot use `auth != null` checks to secure access, leaving it open to global access by default.
**Prevention:** Explicitly deny global read/write access (`".read": false, ".write": false`) and restrict access strictly to the `rooms/$roomId` path.
