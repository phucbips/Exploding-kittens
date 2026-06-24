## 2024-06-24 - [Insecure Randomness for Identifiers]
**Vulnerability:** Room IDs and User IDs were generated using `Math.random().toString(36)` and `Date.now()`, which are predictable and insecure, allowing potential guessing of identifiers.
**Learning:** `Math.random()` and timestamp-based identifiers should never be used for security-critical identifiers. Also, using `.toString(36)` on `crypto.getRandomValues()` results in flawed distribution.
**Prevention:** Use `globalThis.crypto.randomUUID()` for generic UUIDs and `globalThis.crypto.getRandomValues()` with a character map array to generate secure short IDs like Room IDs.
