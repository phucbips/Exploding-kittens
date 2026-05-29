## 2024-05-29 - Firebase Realtime Database Global Access Vulnerability
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured to allow global, unrestricted read and write access (`".read": true, ".write": true`) to the entire database.
**Learning:** This misconfiguration exposes all data stored in the database to anyone on the internet, allowing unauthorized users to read, modify, or delete data without authentication or authorization checks.
**Prevention:** Always configure Firebase Realtime Database security rules to implement the principle of least privilege. Deny global access by default (`".read": false, ".write": false`) and explicitly grant access only to specific paths (e.g., `rooms/$roomId`) where necessary for the application to function.
