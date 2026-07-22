# Task 3 Report: Question Factory and Reusable Mastery Panel

## Status

Completed Task 3 only. No changes were made to Today, ReviewPage, App, MePage, or Task 1/2 dependencies.

## Implementation

- Added deterministic `MasteryQuestion` construction for word definition choices and pattern sentence-choice, fill-blank, and sentence-order questions.
- Added `MasteryQuestionContentError` for missing course records and insufficient usable English content.
- Added the reusable `MasteryReviewPanel` with due-record loading, local-date session exclusion, remaining daily-cap enforcement, answer feedback, and ordered persistence.
- Saves updated mastery progress before its daily session, then invokes `onChange` only after both saves complete.
- Added scoped `mastery-review-*` styles while reusing existing button styles.

## TDD Evidence

1. Added factory and panel tests before production modules existed.
2. Ran the focused test command and verified the expected red failure: missing `masteryQuestions` and `MasteryReviewPanel` imports.
3. Implemented the minimal factory and panel behavior.
4. During self-review, added a regression test for repeated tokens in sentence ordering. It failed because selecting one duplicate disabled every matching token.
5. Changed ordering selection to track token indices, then reran the focused suite successfully.

## Verification

Passed:

```text
npx vitest run src/domain/masteryQuestions.test.ts src/components/MasteryReviewPanel.test.tsx

Test Files  2 passed (2)
Tests       10 passed (10)
```

`git diff --check` passed with no whitespace errors.

Full TypeScript verification remains blocked outside Task 3 scope. `npx tsc -b` fails because existing `App.test.tsx`, `MePage.test.tsx`, `TodayPage.test.tsx`, and `WordsPage.test.tsx` repository fixtures do not yet supply the required Task 2 mastery methods. Those files were intentionally not changed.
