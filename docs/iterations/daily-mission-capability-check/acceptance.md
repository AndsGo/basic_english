# Acceptance Checklist

Verified on 2026-09-25 in the local implementation.

- [x] Day 1 shows the mission and one capability check under Mastery.
- [x] Day 1 Continue stays disabled until the check is saved.
- [x] Listening selection, three-sentence minimum, meaning check, and clarity control work with keyboard-accessible form controls.
- [x] Opening any support changes a clear result from Independent to With help.
- [x] Incomplete or unclear self-assessment saves as Practice again.
- [x] Results schedule the next check after 7, 3, or 1 day.
- [x] Review renders due checks and removes a completed due check by loading the new latest attempt.
- [x] Me shows only latest Independent results in Scenes I Can Describe and avoids a duplicate legacy section.
- [x] Desktop and Pixel 5 E2E cover the Day 1 path.
- [x] IndexedDB version 9 persistence and filtering are covered by repository tests.
- [x] `npm run content:health`, `npm test`, `npm run build`, and `npm run test:e2e` pass.

Release recheck on 2026-10-16: 415 unit/component tests and 16 desktop/mobile E2E tests passed. Production build and content health passed; content health reports four existing vocabulary-load warnings in Weeks 2-4. The callback replacement regression test also passes, covering the Introduce yourself panel reload and speech interruption fix.

Browser speech quality remains platform-dependent and is not an acceptance claim.
