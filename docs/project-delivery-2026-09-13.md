# Project Delivery and Next Milestones

## Delivered on main

- Integrated mastery scheduling, objective mastery review, and scenario mastery progress.
- Integrated daily learning reports and optional two-to-three-question reinforcement.
- Kept reinforcement history separate from formal mastery and manual review records.
- Fixed feedback advancing to the next question before the learner chooses Next question; regression verified failing before the fix and passing afterward.
- Fixed the E2E ordering helper to select only enabled tokens.
- Preserved optional report loading independently of the main progress display.

## Measured Content Baseline

The current playable course contains 12 weeks, 84 days, 227 active words, and 497 exercises. Picture description, scene goals, and scene remix each cover 84 of 84 days.

The health report measures 176 of 855 dictionary entries covered by course words. This is not full Basic English vocabulary coverage. The difference between the product's 850-word label and the 855 stored entries needs a documented lexical audit before using the count as an acceptance target.

Week 2-4 load warnings remain: 33, 48, and 39 new words respectively; Week 2 also averages 11.7 active word references per day. These are existing curriculum issues, not resolved by this delivery.

## Ordered Follow-up Backlog

1. Audit dictionary entries, variants, and support words. Produce an exact missing-word list and explain the 850/855 distinction without deleting entries to fit a label.
2. Audit the existing 84-day curriculum for natural English and scenario coverage. Track each correction by day and preserve saved-progress identifiers.
3. Rebalance the heavy early weeks using review and optional extension activities; validate impact on existing learner progress before moving lesson content.
4. Review the existing untracked expansion proposal against the original three-month foundation goal. Additional weeks are an extension, not a silent change to that goal. Build future lessons in small, fully tested batches with approved image samples.
5. Improve loading performance using measured browser results. Preserve image content during any compression.

## Delivery Gates

Verification on the integrated workspace: 390 tests passed across 38 files (including three tests from the preserved untracked expansion draft); production build passed; content health reported zero errors and four existing load warnings; all 14 desktop/mobile E2E tests passed.

- Unit and component tests, production build, content health, and desktop/mobile E2E must pass on the integrated branch.
- Document curriculum warnings separately from validation errors.
- Any future content batch requires complete word images, picture tasks, scene goals, and remix tasks.
- Local integration does not establish that GitHub Pages has been deployed. Remote publication needs a verified remote commit and successful deployment run.

## Workspace Preservation

Existing untracked expansion files, UX audit artifacts, and unrelated API documentation were preserved. The dependency lockfile modification in the feature worktree was not included in this integration.
