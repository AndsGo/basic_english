# v1.56.0 - Daily Mission and Capability Checks

Release date: 2026-10-16

## Changes

- Show a concise daily mission in Today.
- Add Listen -> Respond -> Check practice under Mastery on Days 1, 24, and 26.
- Save Independent, With help, or Practice again results and schedule review after 7, 3, or 1 day.
- Show due capability checks in Review and independently completed scenes in Me.
- Upgrade IndexedDB to version 9 while preserving existing progress.
- Fix the Introduce yourself panel reloading and interrupting speech when its parent updates.
- Keep audio button width and listening feedback space stable to reduce layout movement.

## Scope and Limitations

Capability checks are a three-day pilot. Other days keep their existing flow.
Results use learner self-assessment; they do not automatically grade pronunciation or grammar.
Browser speech availability and voice quality depend on the browser and operating system.

## Release Verification

- Unit and component tests: 415 passed across 45 files.
- Production build: passed.
- Content health: zero errors, with four existing vocabulary-load warnings in Weeks 2-4.
- Desktop Chromium and mobile Chrome end-to-end tests: 16 passed.
