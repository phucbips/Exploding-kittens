## 2025-02-23 - Fix Open Firebase Database Rules
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with global read and write access (`".read": true, ".write": true`), allowing unauthorized users to read, modify, or delete any data in the database.
**Learning:** This is a common and critical misconfiguration, often left over from initial development or quick prototyping. It exposes all application data.
**Prevention:** Always restrict root-level access (`".read": false, ".write": false`) and explicitly grant access only to specific paths (like `rooms/$roomId`) that require it, enforcing the principle of least privilege.
