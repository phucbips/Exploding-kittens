## 2024-03-30 - Predictable Identifiers Used for Security Contexts
**Vulnerability:** Room IDs and User IDs were generated using `Math.random().toString(36)` and `Date.now()`.
**Learning:** `Math.random()` and `Date.now()` are entirely predictable and lack the entropy required for generating security-sensitive IDs like session identifiers or private room access links. Using them introduces a high risk of session hijacking or unauthorized room access because attackers can easily guess the IDs.
**Prevention:** Always use cryptographically secure methods, specifically the Web Crypto API (`crypto.randomUUID()` or `crypto.getRandomValues()`), for generating IDs related to users, sessions, or any security boundary.
