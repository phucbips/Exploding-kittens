## 2024-06-05 - [Insecure PRNG for Room and User ID Generation]
**Vulnerability:** Room IDs and Card IDs were generated using `Math.random().toString(36)`. User IDs were generated using `Date.now()`. These methods are predictable and can lead to ID collision or brute-force guessing of IDs.
**Learning:** For cryptographically secure short ID generation, applying `.toString(36)` to a TypedArray populated by `crypto.getRandomValues()` yields flawed outputs because it operates on the typed array element rather than creating random characters. A character map should be used.
**Prevention:** Use `globalThis.crypto.randomUUID()` for unique IDs, and `globalThis.crypto.getRandomValues()` with a character map array when creating shorter deterministic strings like Room IDs.
