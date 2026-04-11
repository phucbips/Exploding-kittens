## 2025-04-11 - [MEDIUM] Insecure Random Number Generation

**Vulnerability:** The application was using `Math.random()` and `Date.now()` to generate room IDs, user IDs, player IDs, card IDs, random card variants, deck shuffling and bomb placements. `Math.random()` and `Date.now()` are predictable and not cryptographically secure, which could allow attackers to predict game states, force certain draws or hijack sessions if they can guess the IDs.
**Learning:** In Next.js/Browser environments, you should use the Web Crypto API (`crypto.getRandomValues` or `crypto.randomUUID`) which provides cryptographically secure pseudo-random number generators (CSPRNG).
**Prevention:** Avoid `Math.random()` and `Date.now()` for security-sensitive logic (such as identifiers, session tokens, or game logic like shuffling decks). Use `crypto.getRandomValues()` for generating random numbers and `crypto.randomUUID()` for unique identifiers.
