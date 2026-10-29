# v1.58.0 — Reading-focused Design

Release date: 2026-10-29

## Changes

- Apply the adopted warm-white and forest-green design standard across Today, Course, Review, Words, and Me, with editorial page titles and coordinated light and dark controls.
- Move desktop navigation to the top and retain five labeled navigation items on mobile. Correct the course header to 52 weeks.
- Present Today's learning in four stages while keeping the original lesson steps and completion requirements. Organize Course as expandable weeks with the current week open.
- Replace the story selector entry with a cover-based catalog of all 53 published books, including title/word search, reading-status filters, and course-stage filters.
- Add a before-reading introduction and a focused reader with stable page controls, scrollable long content, optional Chinese help, and automatic next-page narration using existing speech settings.
- Restore reading position with backward-compatible local records, and preserve catalog filters, scroll position, and cover focus when returning from a book.
- Show saved story sentences in Me. Keep reading, comprehension, sentence saving, review scheduling, and known-word progress independent.
- Document the design standard, interactive reference preview, theme comparisons, and screenshots from the implemented application.

## Verification

- 589 unit/component tests passed across 48 files.
- 28 desktop/mobile browser cases passed. The final catalog layout and theme changes were rechecked in six of those cases.
- Page checks cover 1440px, 390px, and 320px widths, light/dark themes, Chinese help on/off, filtering, focus restoration, reading resumption, semantic records, overflow, and stable navigation.
- Full-library browser checks traverse all 53 books, including images, target-word highlighting, and comprehension questions.
- Production build and diff checks passed. The existing bundle-size warning remains.

Reading records remain on the current device. This release preserves course progression, review rules, speech preferences, and the existing 850-word teaching content.

See the [design standard](https://github.com/AndsGo/basic_english/blob/v1.58.0/DESIGN.md) and [implementation screenshots and checks](https://github.com/AndsGo/basic_english/blob/v1.58.0/docs/design/implementation/README.md).
