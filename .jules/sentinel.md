## 2026-02-13 - [CRITICAL] Open Firebase Rules
**Vulnerability:** The Firebase Realtime Database rules were configured to allow full read and write access to the entire database for any unauthenticated user. This means anyone with the database URL could read all game data or modify/delete it.
**Learning:** This likely existed because the project started with default "test mode" rules for rapid development, and security was not prioritized early on. It's a common pattern in early-stage Firebase projects.
**Prevention:** Always start with restrictive rules (deny all by default) and only open specific paths as needed. Use environment variables for configuration. Regularly review security rules before deploying to production.
