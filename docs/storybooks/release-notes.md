# v1.57.0 - Storybook Reading

Release date: 2026-10-28

## Changes

- Add Words → Stories with 52 weekly stories and the open companion: 53 books, 212 pages, and 207 reviewed square illustrations.
- Teach one word sense through a short everyday story, with 3–5 review words, a meaning check, and a personal sentence task.
- Read the next page automatically using the existing speech settings; keep Chinese help optional.
- Save reading status, meaning-check answers, and personal sentences independently on the device. Add target words to the existing review queue without automatically marking them known.
- Present quantity, time, observation, letters, conditions, and cause/effect explanations as accessible page text alongside the artwork.
- Correct 31 source word entries and add curriculum, asset provenance, vocabulary coverage, and validation records.

## Scope and Limitations

The books supplement the 850-word course. Their core-word index distinguishes 52 primary targets, 82 review words, 92 words in reading text only, 45 in exercises/output only, and 579 requiring future story extensions. Seeing a word in a story does not establish mastery.

Reading records are local to the device. Speech availability and voice quality depend on the browser and operating system. Personal sentences are saved for practice, not automatically graded.

## Verification

- Unit and component tests: 585 passed across 48 files.
- Desktop Chromium and mobile Chrome: all 22 end-to-end cases passed; the two full-library cases passed after correcting a case-sensitive test assertion for sentence-initial “If”.
- All 53 stories traversed on desktop and at 320px width, including image dimensions, stable navigation, overflow, highlighting, and meaning checks.
- Story build and content audit: 53/53 ready, no errors or unresolved reading support.
- All 207 referenced illustrations are 512×512; no unreferenced image files.
- Production build passed. Course health has zero errors and four existing vocabulary-load warnings in Weeks 2–4. The existing main-bundle size warning remains.

See [the curriculum and outlines](README.md) and [acceptance evidence](execution-plan.md).
