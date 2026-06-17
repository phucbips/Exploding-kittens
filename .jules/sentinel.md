## 2025-02-12 - Insecure Room and User ID Generation
**Vulnerability:** Weak PRNG (`Math.random()`) and predictable timestamp (`Date.now()`) were used to generate security-sensitive Room IDs and User IDs in `app/page.tsx`.
**Learning:** `Math.random()` and `Date.now()` are easily guessable and not cryptographically secure, which could allow attackers to predict room IDs or hijack user sessions since User IDs are used directly for authorization.
**Prevention:** Always use the Web Crypto API (`globalThis.crypto.getRandomValues()` and `globalThis.crypto.randomUUID()`) when generating unpredictable IDs for sessions, authorization tokens, or room access keys.
