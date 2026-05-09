## 2024-05-18 - Fix Firebase Realtime Database Rules
**Vulnerability:** Globally permissive Firebase Realtime Database rules (`".read": true, ".write": true` at the root).
**Learning:** This allowed anyone on the internet to read, modify, or delete the entire database. It is a critical security vulnerability that exposes all data.
**Prevention:** Always default root rules to `false` and explicitly allow access only to the specific paths needed by the application.
