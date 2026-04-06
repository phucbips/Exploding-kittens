## 2025-04-06 - [Global Database Access Control]
**Vulnerability:** The `database.rules.json` file had global `.read: true` and `.write: true` access, allowing anyone to fully access and manipulate the entire database.
**Learning:** Overly permissive default rules are common during rapid development but must be secured by locking down global paths and explicitly defining access.
**Prevention:** Always restrict default access (e.g., `".read": false, ".write": false`) and only grant permissions explicitly for specific paths like `rooms/$roomId`.
