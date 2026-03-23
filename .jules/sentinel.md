## 2024-05-24 - [Open Firebase Database Rules]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow unrestricted global read and write access (`".read": true, ".write": true`), allowing anyone to read or modify any data in the database.
**Learning:** This existed because the default or initial setup rules were left in place and not locked down before deployment.
**Prevention:** Always configure explicit security rules denying global access by default (`".read": false, ".write": false`) and only grant access to specific paths (e.g., `rooms/$roomId`) where necessary.
