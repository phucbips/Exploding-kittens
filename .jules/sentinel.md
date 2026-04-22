## 2024-12-07 - Insecure Randomness in Game State
**Vulnerability:** Use of `Math.random()` and `Date.now()` for shuffling the deck, generating room IDs, and creating user IDs.
**Learning:** `Math.random()` is not cryptographically secure, which allows players to potentially predict deck shuffling and short IDs. Using `Date.now()` for user IDs makes them predictable, leading to potential spoofing or room hijacking since there is no server-side authentication.
**Prevention:** Always use the Web Crypto API (`globalThis.crypto.getRandomValues()` or `globalThis.crypto.randomUUID()`) when generating short room identifiers, user session IDs, and shuffling decks in client-side card games.
