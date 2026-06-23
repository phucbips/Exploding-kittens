## 2024-06-23 - Insecure Random Number Generation for Core Logic
**Vulnerability:** Core logic mechanics like room ID generation, deck shuffling, bomb placement, and user ID assignment were relying on `Math.random()`, which is a predictable PRNG.
**Learning:** `Math.random()` and `Date.now()` are entirely predictable, which could allow attackers to manipulate outcomes or hijack sessions if logic uses those IDs as identifiers, like room states.
**Prevention:** Always use Web Crypto API (`globalThis.crypto.getRandomValues()` and `globalThis.crypto.randomUUID()`) for ID generation and important shuffling/game mechanics instead of predictable algorithms.
