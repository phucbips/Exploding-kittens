## 2024-05-24 - [Insecure Randomness in Core Game Logic and Room IDs]
**Vulnerability:** Core logic used `Math.random()` to shuffle the deck, pick card variants, choose the bomb insertion index, and generate Room IDs and identifiers.
**Learning:** `Math.random()` is predictable, which allows an attacker to figure out deck orders, predict when the bomb will appear, or brute force game IDs to interact maliciously with rooms.
**Prevention:** Always use the Web Crypto API (`crypto.getRandomValues()` and `crypto.randomUUID()`) for anything related to security boundaries, unpredictability of game state, or unique identifiers.
