## 2024-05-18 - [Insecure Random Number Generation for Core Game IDs]
**Vulnerability:** Weak, predictable ID generation using `Math.random().toString(36)` and `Date.now()`.
**Learning:** `Math.random()` and `Date.now()` are not cryptographically secure and can be predicted, leading to potential game state manipulation or ID collisions, violating the core directive "Room IDs, user IDs, and game logic must use the Web Crypto API".
**Prevention:** Always use `globalThis.crypto.randomUUID()` or `globalThis.crypto.getRandomValues()` for generating random IDs or values in security-sensitive contexts like game logic and session management.
