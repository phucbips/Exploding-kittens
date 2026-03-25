## 2024-05-24 - [Insecure Random Number Generation]
**Vulnerability:** Weak random number generation using `Math.random()` for sensitive operations like room ID and card ID generation.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which can lead to attacks like guessing room IDs or card IDs. The codebase heavily uses it.
**Prevention:** Use `crypto.getRandomValues()` or `crypto.randomUUID()` for cryptographically secure random number generation.
