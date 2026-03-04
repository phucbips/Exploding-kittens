## 2025-03-04 - [Insecure Random Number Generation]
**Vulnerability:** Core game logic (shuffling, initial room IDs, and random bomb re-insertion) relied on `Math.random()`, which is not cryptographically secure and can lead to predictability of the game state and IDs.
**Learning:** Usage of `Math.random()` in security-sensitive or core logic is predictable and insecure. Even though this is a game, randomizing core state should rely on a cryptographically strong PRNG.
**Prevention:** Replace all sensitive occurrences of `Math.random()` with `window.crypto.getRandomValues()` (wrapped via `secureRandom` in `utils/crypto.ts`).
