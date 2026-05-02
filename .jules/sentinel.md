
## 2024-05-27 - [Insecure Firebase Rules]
**Vulnerability:** Firebase Realtime Database rules allowed global `.read: true` and `.write: true`, effectively granting anyone on the internet full access to the database.
**Learning:** Default configurations or quick setups for Firebase often leave rules completely open, leading to massive data exposure risks.
**Prevention:** Always restrict `.read` and `.write` rules. Start with a deny-all approach (`".read": false, ".write": false`) and explicitly whitelist necessary paths (like `rooms/$roomId`).
