## 2025-02-14 - [Insecure Random Generation]
**Vulnerability:** Weak PRNG (`Math.random()`) used for shuffling deck, determining random variants, and ID generation (`Math.random().toString(36)`).
**Learning:** `Math.random()` does not provide cryptographically secure numbers, making game mechanics like card shuffling and variant selection predictable. Furthermore, converting `Math.random()` to base36 for IDs is insufficient for uniqueness and security.
**Prevention:** Always use the Web Crypto API (`globalThis.crypto.getRandomValues()` for numbers and `globalThis.crypto.randomUUID()` for IDs) when generating IDs or handling security-sensitive and game-critical randomness.
