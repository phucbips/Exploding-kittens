## 2026-04-19 - [Insecure Firebase Database Rules]
**Vulnerability:** Firebase database rules were globally permissive ('.read': true, '.write': true), allowing any anonymous user to read, modify, or delete all game data, room states, and potentially disrupt the entire backend.
**Learning:** Default generated or dev environment rules often use global true values. These should never make it to production as they present a critical unauthorized access vector.
**Prevention:** Always restrict Firebase access immediately by denying root access and explicitly defining path-based rules. For instance, restrict read/write exclusively to the 'rooms/$roomId' path or enforce authentication.
