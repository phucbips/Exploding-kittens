## 2024-05-24 - Firebase Insecure Rules
**Vulnerability:** Firebase realtime database had global read/write access ( `.read: true`, `.write: true` ), which is a critical misconfiguration exposing the entire database.
**Learning:** Default Firebase rules on setup or simple tests often leave databases wide open. Needs explicit restriction.
**Prevention:** Always restrict access to the specific paths required by the application. E.g., using `rooms/$roomId` to limit the access specifically to the room data instead of global scope.
