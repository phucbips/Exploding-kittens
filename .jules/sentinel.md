
## 2026-05-03 - Insecure PRNG Usage (`Math.random`)
**Vulnerability:** Weak PRNG using `Math.random()` and `Date.now()` across the codebase to generate critical session data such as Room IDs, Player IDs, Card IDs, and Game/Shuffle states. This predictability allows attackers to predict game flow or hijack sessions.
**Learning:** React developers often default to native JavaScript utilities out of habit when needing temporary unique strings or array shuffles without considering the cryptographic implications.
**Prevention:** Implement and enforce a standard Web Crypto utility (e.g. `utils/secureRandom.js`) that wraps `globalThis.crypto.getRandomValues()` and `crypto.randomUUID()`. Ensure developers reach for these helper functions instead of `Math.random` when dealing with deterministic state, IDs, and session management.
