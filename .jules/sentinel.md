## 2024-04-13 - [Cryptographically Insecure Randomness]
**Vulnerability:** Core game logic (deck shuffling) and unique identifiers (room IDs, user IDs) were generated using `Math.random()` and `Date.now()`.
**Learning:** `Math.random()` is not cryptographically secure and can be predictable, allowing malicious actors to potentially infer deck order or guess room/session IDs.
**Prevention:** Always use Web Crypto API (`globalThis.crypto.getRandomValues()` and `globalThis.crypto.randomUUID()`) for security-sensitive random generation.
