## 2024-03-22 - Hardcoded Firebase Credentials
**Vulnerability:** Hardcoded Firebase API keys and project identifiers were found directly committed in `lib/firebase.js`.
**Learning:** Convenience during initial development often leads to committing secrets. While Firebase API keys are technically public, hardcoding them makes environment separation impossible and encourages bad practices for other secrets.
**Prevention:** Always use environment variables (`process.env`) for configuration from day one, even for public keys, to enforce a separation of concerns and allow for different environments (dev/prod).
