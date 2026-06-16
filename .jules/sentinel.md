## 2024-05-18 - Web Crypto API for secure short IDs and UUIDs
**Vulnerability:** Weak PRNG (`Math.random()`) and predictable timestamp (`Date.now()`) used for generating room IDs and user IDs respectively.
**Learning:** `Math.random().toString(36)` and `Date.now()` are insecure for identifier generation, leading to predictable IDs that could be exploited by attackers to guess session or room IDs.
**Prevention:** Use `globalThis.crypto.getRandomValues()` with a character map for generating secure short string IDs, and `globalThis.crypto.randomUUID()` for generating secure v4 UUIDs for user identifiers.
