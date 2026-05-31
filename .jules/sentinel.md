## 2024-05-31 - [Fix Global Database Access]
**Vulnerability:** Firebase Realtime Database rules (`database.rules.json`) were configured with global read (`".read": true`) and write (`".write": true`) permissions, allowing unauthorized public access to all data.
**Learning:** Default rules often prioritize development ease over security. Allowing global access exposes the entire database, potentially leaking sensitive data or allowing malicious modification.
**Prevention:** Always follow the principle of least privilege. Set global read/write access to `false` and explicitly grant access only to specific necessary paths, such as `rooms/$roomId`, validating access where applicable.
