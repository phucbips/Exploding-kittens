## 2024-06-19 - [Predictable IDs and Insecure Randomness]
**Vulnerability:** The application used `Math.random()` and `Date.now()` to generate `roomId`, `playerData.id`, card IDs, and for shuffling decks. This creates predictability, which could allow malicious users to guess room IDs, impersonate players (IDOR), or predict card draws.
**Learning:** `Math.random()` and time-based generators are not cryptographically secure and should never be used for identifiers or security-sensitive game mechanics.
**Prevention:** Always use the Web Crypto API (`globalThis.crypto.getRandomValues()` and `globalThis.crypto.randomUUID()`) for generating secure random numbers and unique identifiers.
