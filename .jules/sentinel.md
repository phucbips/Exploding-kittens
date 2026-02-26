## 2025-02-17 - Hardcoded Firebase Credentials
**Vulnerability:** Found hardcoded Firebase API keys and project IDs in `lib/firebase.js`.
**Learning:** Direct inclusion of configuration secrets in source code, even if they are technically public identifiers, exposes them in the repository history. This makes rotation difficult and risks accidental exposure of more sensitive keys if the pattern is copied.
**Prevention:** Use environment variables (e.g., `process.env.NEXT_PUBLIC_...`) and `.env` files to manage configuration. Always ensure `.env` files are in `.gitignore`.
