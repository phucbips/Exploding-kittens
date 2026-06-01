## 2025-02-14 - Fix Firebase Realtime Database global read/write access vulnerability
**Vulnerability:** Firebase `database.rules.json` had global `".read": true` and `".write": true` set, allowing anyone on the internet to read and modify any data in the database.
**Learning:** Default rules were probably left over from initial prototyping. Global access exposes the entire dataset to potential theft or malicious alteration.
**Prevention:** Always restrict default rules to false and apply principle of least privilege, explicitly enabling access only to the necessary paths (e.g., `rooms/$roomId`) for application functionality.
