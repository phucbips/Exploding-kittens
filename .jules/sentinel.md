
## 2024-05-20 - [Insecure Randomness in Core Game Logic]
**Vulnerability:** Client-side random generation for game logic like shuffling the deck and replacing bombs relied on `Math.random()`. This PRNG is predictable and non-cryptographic.
**Learning:** In a card game scenario, predictable randomness completely compromises the integrity of the game. A malicious client could predict the exact layout of the shuffled deck or exactly where the bomb is inserted back.
**Prevention:** Always use cryptographically secure pseudo-random number generators (CSPRNG) like `crypto.getRandomValues()` for any core game logic involving randomness, such as card drawing, shuffling, or assigning secrets.
