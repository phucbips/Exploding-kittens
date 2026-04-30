## 2024-05-10 - [Global Read/Write Firebase Rules]
**Vulnerability:** The `database.rules.json` file allowed unauthenticated global read and write access to the entire Realtime Database.
**Learning:** Default Firebase configuration must be hardened immediately. Leaving ".read": true, ".write": true exposes all user data to potential theft, modification, and deletion.
**Prevention:** Always restrict access to the specific paths required by the application logic (e.g., `rooms/`) and explicitly deny global access at the root.
