## 2026-05-04 - [CRITICAL] Fix Overly Permissive Firebase Realtime Database Rules
**Vulnerability:** The `database.rules.json` file contained overly permissive access rules (`".read": true, ".write": true` at the root level). This would allow unauthenticated users global read/write access to all data in the Firebase database.
**Learning:** Default Firebase configuration can easily leave databases exposed if explicit path restrictions are omitted or global access is granted for debugging purposes and then left unchecked.
**Prevention:** Configure explicit database rules at granular path levels, such as `rooms/$roomId`, and deny root access (`".read": false, ".write": false` globally). Always review configuration prior to deployment.
