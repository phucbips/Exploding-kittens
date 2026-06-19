## 2024-05-24 - Cryptographically Insecure ID Generation
**Vulnerability:** Room IDs and User IDs are generated using `Math.random().toString(36)` and `Date.now()`.
**Learning:** `Math.random()` and `Date.now()` are predictable and not cryptographically secure, which allows an attacker to potentially guess room IDs or user IDs. Predictable IDs can lead to unauthorized access, session hijacking, or other security flaws in games where players join based on simple IDs.
**Prevention:** Use Web Crypto API (`crypto.getRandomValues()` or `crypto.randomUUID()`) to generate secure IDs. For alphanumeric short IDs, use a character map array to sample valid characters from the secure random values.
