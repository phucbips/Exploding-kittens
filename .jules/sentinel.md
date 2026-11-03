## 2024-02-09 - [Insecure Firebase Realtime Database Rules]
**Vulnerability:** The Firebase Realtime Database had global read/write access enabled, allowing anyone to read or modify any data in the database.
**Learning:** The application does not use Firebase Authentication, relying instead on sessionStorage and custom IDs. Therefore, Firebase Realtime Database rules cannot use `auth != null` checks to secure access, but they must still restrict access to the specific paths used by the application, such as `rooms/$roomId`.
**Prevention:** Always configure Firebase security rules to explicitly deny global access (`".read": false, ".write": false`) and restrict access to specific required paths.
