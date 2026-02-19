## 2026-02-19 - Insecure Firebase Rules
**Vulnerability:** `database.rules.json` allowed public read/write access to the entire database root.
**Learning:** Default or test configurations can leave databases completely exposed if not manually secured.
**Prevention:** Always configure security rules to scope access to specific paths (`rooms/$roomId`) and validate data structure.
