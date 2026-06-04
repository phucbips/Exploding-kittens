## 2024-06-04 - [Insecure Random Number Generation]
**Vulnerability:** Weak random number generation (`Math.random()`) used for creating session IDs (`userId`, `roomId`, etc.) and shuffling arrays.
**Learning:** `Math.random()` and `Date.now()` are predictable and not cryptographically secure, which allows attackers to guess session IDs or predict shuffled card orders, leading to potential game state manipulation or session hijacking.
**Prevention:** Always use Web Crypto API (`crypto.getRandomValues()` or `crypto.randomUUID()`) for generating unpredictable IDs, keys, and shuffling mechanisms.
