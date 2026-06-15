## 2024-05-31 - [Predictable ID Generation]
**Vulnerability:** Room IDs and User IDs were generated using `Math.random().toString(36)` and `Date.now()`.
**Learning:** `Math.random` and `Date.now` are cryptographically insecure and predictable. Using them for room and user IDs allows an attacker to easily guess IDs and potentially spoof users or access active rooms. `Math.random().toString(36)` is specifically a bad pattern.
**Prevention:** Use the Web Crypto API (`globalThis.crypto.getRandomValues()` and `globalThis.crypto.randomUUID()`) for generating secure IDs. When generating short string IDs, map randomly selected values from a typed array to a character set.
