## 2025-02-28 - Client-Trust Architecture Risks
**Vulnerability:** Game state (including deck and opponent hands) is fully client-controlled and stored in Firebase Realtime Database with minimal validation.
**Learning:** In serverless multiplayer games relying on Firebase RTDB, "trust the client" is the default unless strict validation rules or Cloud Functions are used. This allows simple development but exposes the game to trivial cheating and state corruption.
**Prevention:** For future features, move sensitive logic (drawing cards, shuffling) to Cloud Functions or backend API, and use RTDB only for state synchronization, not state mutation authority. Alternatively, implement exhaustive `.validate` rules for every state transition (complex).
