# Basic English Daily Learning Insights Design

## Goal

Help learners understand whether today's study improved their ability to describe everyday situations in Basic English. After a lesson, show a concise English-first learning report, link its findings to life-scenario capability, and offer an optional three-minute reinforcement practice.

This iteration improves the learning loop. It does not add course weeks, change the course order, alter the formal mastery schedule, or introduce automatic scoring of free writing.

## Product Decision

Use a rule-driven, explainable diagnostic model based on existing local learning records.

- The primary feedback surface is a daily learning report.
- The report links each finding to an existing daily-life scenario capability.
- The learner may start or skip an optional reinforcement session of two to three objectively scored questions.
- Reinforcement is additional practice only. Its answers do not promote or demote `masteryProgress`.
- Existing manual `reviewItems` and automatic mastery review keep their current responsibilities.

## User Experience

### Daily learning report

After the learner completes the current day's lesson, the completion view shows a compact report with:

- Today's completion state: completed lesson steps, submitted exercises, and completed reviews.
- A clear outcome: `Strong today`, `Keep practicing`, or `Focus on N items`.
- One to three named weak items, each with an English explanation of why it was selected.
- The daily-life scenario capability associated with each item.
- A `Start 3-minute practice` action when reinforcement questions are available.

The My Progress page shows the most recent report summary and links learners to the related scenario capability cards.

### Reinforcement practice

The reinforcement flow contains two or three questions, selected from the report's weak items. It displays progress such as `1 of 3`, immediate correct or incorrect feedback, and the correct answer after each response.

The learner can skip the practice without affecting lesson completion, manual review, or mastery scheduling. Completing it stores the response history and refreshes the report summary, but does not claim that an item is mastered.

### Empty and failure states

- If no weak content is found, the report says there is no targeted practice due and provides no artificial task.
- If insufficient data exists for a conclusion, the report uses an accurate neutral state instead of claiming scenario ability.
- Report calculation, question construction, or storage errors appear as understandable messages and never block the completion view, future lessons, manual review, or mastery review.

## Diagnostic Model

`dailyLearningInsight` is a derived model. It combines existing records at read time and does not become a new source of truth for mastery.

The model selects at most three unique content items using this priority order:

1. A word or pattern explicitly recorded as incorrect in today's or the latest available mastery-review session.
2. A learned item currently in `needs_reinforcement` or `learning` mastery state.
3. A content item with an unresolved manual review item, including an item created by a drill, translation, scene remix, picture description, or output task.
4. An item from a scenario whose prerequisite lessons are complete but whose verified mastery proportion is below the `Ready` threshold.

Ties prefer the most recent failure, then the oldest pending due time, then deterministic content ID order. A content item appears no more than once in one report.

Each insight includes:

- content type and ID;
- scenario capability ID and title;
- priority source;
- an English explanation selected from a controlled set of reason strings;
- a link to the content needed to construct a reinforcement question.

## Question Rules

Reinforcement reuses the existing English-only objective question factory:

- word definition choice;
- pattern sentence choice;
- pattern fill-in-the-blank;
- pattern ordering only when it contains three to five tokens.

Question selection is deterministic for a content item and local date. A session includes no duplicate content IDs and has a maximum of three questions. A missing or invalid question falls back to the next candidate; it never produces a broken practice flow.

## Data and Compatibility

Add a separate persisted `reinforcementPracticeSessions` store for optional practice answers. A session is keyed by local date and report identity and stores selected content IDs, answer results, skipped/completed state, and timestamps.

`dailyLearningInsight` itself is recalculated from the course and existing progress so that reports remain compatible with existing learners and update when their underlying mastery or manual-review records change.

`masteryReviewSessions` gains an optional `incorrectProgressIds` field. New sessions persist the IDs answered incorrectly; legacy sessions without this field are treated as having unknown answer outcomes, never as incorrect answers.

Existing data responsibilities remain unchanged:

- `dayProgress`: lesson step and completion state.
- `reviewItems`: manually requested or error-driven practice.
- `masteryProgress` and `masteryReviewSessions`: verified automatic review.
- `reinforcementPracticeSessions`: optional short-practice history only.

All date limits use the learner's local calendar date. Legacy learners without mastery history can still receive reports based on lesson completion and manual review; no missing record is interpreted as failure.

## Non-goals

- Adaptive reordering of future course lessons.
- Changing mastery scheduling or mastery state transitions.
- Automatic assessment of free writing, scene remix, or picture descriptions.
- Cloud sync, accounts, or cross-device persistence.
- New curriculum weeks or image generation.

## Implementation Notes

- IndexedDB v7 adds `reinforcementPracticeSessions`, keyed by local date and insight identity.
- Daily insights are derived from existing course and learner records at read time; they are not stored as a new source of truth.
- Reinforcement answers and completion state never change `masteryProgress` or `reviewItems`.
- Release verification runs `npx vitest run --exclude ".worktrees/**"`, `npm run build`, `npm run content:health`, and `npm run test:e2e`.

## Acceptance Criteria

- A completed lesson shows a non-blocking daily learning report.
- The report gives an explainable, English-first reason for each selected item and connects it to a scenario capability.
- Selection follows the documented priority order, is deterministic, and has no duplicate items.
- A learner can start, answer, complete, or skip a two-to-three-question reinforcement session.
- Reinforcement answers never mutate `masteryProgress` or resolve existing `reviewItems`.
- Empty, insufficient-data, and storage-failure states leave the learner able to continue normally.
- My Progress shows a recent report summary without overstating mastery.
- Unit, storage, component, and desktop/mobile E2E coverage validates selection, persistence, interaction, and non-blocking failure behavior.

