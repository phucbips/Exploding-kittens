## 2025-04-03 - [Insecure PRNG for Game Identifiers]
**Vulnerability:** Weak PRNG (`Math.random()`) and predictable timestamp (`Date.now()`) were used for generating session IDs, room IDs, and in-game entity IDs.
**Learning:** Using predictable sources allows an attacker to guess active room IDs, impersonate users by guessing user IDs, or possibly predict game actions/cards. Web Crypto API provides `crypto.getRandomValues` and `crypto.randomUUID()` which are safe.
**Prevention:** Always use `globalThis.crypto.randomUUID()` for identifiers, and `crypto.getRandomValues()` for generating random numbers that affect application state/security. Do not use `Math.random()` or `Date.now()` for unique values.
