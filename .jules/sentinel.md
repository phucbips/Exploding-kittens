## 2025-02-18 - Firebase Realtime Database Race Conditions
**Vulnerability:** Race Condition / Inconsistent State in Room Management
**Learning:** Using `get()` followed by `set()` to modify data in Firebase Realtime Database is not atomic. In a high-concurrency environment (like a game lobby), two users joining or creating rooms simultaneously can read the same initial state, and the last writer wins, overwriting the other user's data (e.g., kicking a player out or destroying an active room).
**Prevention:** Always use `runTransaction` when the new state depends on the current state (e.g., adding an item to a list, decrementing a counter, or checking existence before creation). This ensures atomic updates and data integrity.
