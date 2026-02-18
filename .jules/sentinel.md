## 2024-03-24 - [Race Condition in Room Join Logic]
**Vulnerability:** The room joining logic used a `get` followed by `set` pattern, creating a race condition where concurrent joins could overwrite player data.
**Learning:** Firebase Realtime Database updates must use `runTransaction` when the new state depends on the current state to ensure atomicity.
**Prevention:** Always use `runTransaction` for appending to lists or updating shared counters/state in Firebase.

## 2024-03-24 - [Insecure Database Rules]
**Vulnerability:** The database rules were set to `.read: true` and `.write: true` at the root level, allowing anyone to wipe the entire database.
**Learning:** Default Firebase rules are insecure for production. Rules must be scoped to specific paths.
**Prevention:** Use granular rules like `rooms/$roomId` and deny root access by default.
