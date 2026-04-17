## 2024-05-18 - Insecure ID Generation

**Vulnerability:** Weak, predictable random number generation was used for crucial IDs (`roomId`, `userId`). The implementation relied on `Math.random().toString(36)` and `Date.now()`. Predictable IDs might allow unauthorized access or collisions, especially in a game session management context.
**Learning:** `Math.random()` generates deterministic, predictable sequences and `Date.now()` is completely predictable. This codebase initially relied on these for ID generation in `app/page.tsx` and elsewhere. Using Web Crypto API instead of `Math.random()` provides cryptographically secure unpredictability.
**Prevention:** For any security-sensitive or globally unique identifiers, use `globalThis.crypto.randomUUID()` for full UUIDs, or `globalThis.crypto.getRandomValues()` when a specific character set or length is needed. Avoid simple string manipulations on `Math.random()` or `Date.now()` for security purposes.
