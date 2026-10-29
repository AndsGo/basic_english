# v1.59.0 — Shared UI Components

Release date: 2026-10-29

## Changes

- Apply shared buttons, icon actions, checkboxes, switches, radio groups, text fields, text areas, and selects across settings, learning, review, story practice, and vocabulary search/filter pages.
- Preserve the warm-white and forest-green design, coordinated dark theme, visible keyboard focus, native form semantics, and responsive controls.
- Present selected, correct, retry, and locked answers through AnswerOption while keeping scoring and persistence in the existing pages. Radio navigation remains separate from explicit answer activation.
- Add controlled loading states to saving actions and retain existing course progression, review scheduling, speech preferences, automatic next-page narration, and Chinese-help settings.
- Provide an independent component workshop at `?view=components`, with isolated demo state and no writes to learning records.
- Update DESIGN.md 1.2, document component adoption, remove replaced control styles, and add fresh application screenshots.

## Verification

- 597 unit/component tests passed across 49 files.
- All 32 desktop/mobile browser cases passed; the final workshop integration was rechecked in four browser cases.
- Checks cover 1440px, 390px, and 320px widths, light/dark themes, Chinese help on/off, keyboard interaction, loading, high contrast, 200% text, and overflow.
- Existing learning flows and the complete 53-story library passed browser regression checks.
- Production build and diff checks passed. The existing bundle-size warning remains.

Browser automation uses Chromium. Safari and real screen-reader verification remain outside this release's completed checks.

See the [component guide and application screenshots](https://github.com/AndsGo/basic_english/blob/v1.59.0/docs/design/components/README.md) and [design standard](https://github.com/AndsGo/basic_english/blob/v1.59.0/DESIGN.md).
