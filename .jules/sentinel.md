## 2025-03-01 - [Firebase Global Read/Write Exposure]
**Vulnerability:** The Firebase Realtime Database rules (`database.rules.json`) were configured with global `.read: true` and `.write: true`, allowing anyone to access or modify any data in the database.
**Learning:** Default configuration or quick prototyping setups often default to open security rules. When deploying, these must be locked down to specific valid paths to avoid leaking user data or game state.
**Prevention:** Always follow the principle of least privilege. In Firebase rules, ensure root paths are strictly `false` for both read and write, and only open the specific child paths needed for the application (`rooms/$roomId` in this case).
