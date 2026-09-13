# Basic English Mastery Review Design

## Goal

Turn the existing review experience into a measurable learning loop: after learning a word or pattern, the learner receives a short later verification. The result controls what is due next and updates an ability map organized by daily-life scenario.

This iteration supports the course goal of describing everyday situations in Basic English. It does not expand course content, introduce automatic evaluation of free writing, or replace the existing manual-review system.

## Product Decision

Use an independent mastery-progress model, rather than extending the existing manual `reviewItems` queue.

- Manual review remains for items explicitly added by the learner or created from drills, translation, scene remix, picture description, and personal output.
- Mastery review is a separate, automatically scheduled validation flow for words and patterns.
- The learner has at most eight mastery questions due on a day.
- The first release covers words and patterns only.
- The personal progress page presents mastery through life-scenario capabilities rather than a word-count-only dashboard.

## Mastery Model

Each word and pattern has its own mastery record. A record is scoped to one content item and stores the scenario capability it contributes to, current state, consecutive correct answers, next due time, and most recent answer time.

### States and scheduling

| State | Meaning | Next validation |
| --- | --- | --- |
| `pending_validation` | Learned but not yet passed a validation question | next day |
| `learning` | Recently incorrect or early in the review ladder | 1 day |
| `stable` | Two consecutive correct answers | 3 days |
| `mastered` | Three consecutive correct answers | 7 days |
| `needs_reinforcement` | Incorrect after reaching `stable` or `mastered` | next day, then lower one level |

The first correct answer moves a pending item to `learning`. A second consecutive correct answer moves it to `stable`; a third moves it to `mastered`. An incorrect answer resets the consecutive-correct count and schedules the item for the next day. Incorrect answers from `stable` and `mastered` also lower the visible state to `needs_reinforcement` before the item climbs again.

## Daily Selection Rules

Mastery review has a strict daily limit of eight completed questions. The engine selects eligible content in this order:

1. Overdue `needs_reinforcement` items.
2. Other overdue `learning` or `stable` items.
3. Due `pending_validation` items.
4. Due `mastered` items.

Tie-breakers prefer the oldest due time, then the least recently answered item. A content item may appear at most once per local calendar day. Items beyond the limit stay due for the next day; they are never discarded.

## Question Types

All mastery questions are objectively scored and remain in English to preserve the product's English-first learning environment.

### Word questions

- Choose the correct English explanation from three choices.
- Match an English word to its English explanation.

### Pattern questions

- Choose the grammatically correct Basic English sentence.
- Fill one missing word in a familiar pattern.
- Put three to five tokens in the correct order.

Each answer immediately shows whether it is correct and provides the correct answer. The product does not use free writing, picture description, or automatic language scoring in this iteration.

## User Experience

### Today

The Today flow begins with a distinct **Mastery review** step when questions are due. It is separate from the existing previous-day quick review.

1. Mastery review: up to eight automatically scheduled questions.
2. Previous-day review: existing quick recap of the preceding day's words and patterns.
3. Today's new lesson: existing words, patterns, drills, translation, scene remix, picture description, and output steps.

When the learner completes a day's new lesson, that day's words and patterns receive `pending_validation` records. They are scheduled for a later day, not asked again immediately.

If no questions are due, the Mastery review step communicates that there is nothing due and allows the learner to continue normally. Storage or question-generation failures display an understandable error without blocking the main lesson.

### Review page

The Review page has two clearly labeled sections:

- **Mastery review**: automatically scheduled word and pattern questions due today, showing completed count out of eight.
- **Practice again**: existing manual review items for drills, translation, output, scene remix, and picture description.

The two sections must not create, delete, or resolve each other's records.

### My Progress

The existing **I Can Say** section becomes a scenario ability map. Each scenario card shows:

- Status: `Not started`, `Building`, `Ready`, or `Strong`.
- The proportion of associated key words and patterns at `stable` or `mastered`.
- A concrete next action, such as reviewing a named group of home words or completing a required course day.

Scenario thresholds:

- `Not started`: no prerequisite learning completion.
- `Building`: prerequisites have started, but fewer than 70% of associated content is `stable` or `mastered`.
- `Ready`: at least 70% of associated content is `stable` or `mastered`.
- `Strong`: at least 90% is `stable` or `mastered`, and no associated item is `needs_reinforcement`.

## Data and Compatibility

Add a separate `masteryProgress` store to the local progress repository. It is the source of truth for automatic validation and ability-map calculations.

Existing stores keep their responsibilities:

- `wordProgress`: learner's self-mark on flashcards.
- `reviewItems`: manually requested or error-driven practice.
- `dayProgress`: course-step completion.
- `masteryProgress`: verified word and pattern knowledge.

Existing learners have no mastery history. Their previously completed content is introduced gradually as `pending_validation` items, subject to the eight-question limit. It must not be treated as already mastered.

The daily limit is persisted by local calendar date and completed question IDs so refreshing the page cannot lose progress or repeat a completed question.

## Non-goals

- New course weeks or word-image generation.
- Automatic scoring of free-form writing or picture descriptions.
- Replacing the current manual review queue.
- Cross-device sync or cloud accounts.
- User-configurable spaced-repetition intervals.

## Acceptance Criteria

- Completing a lesson creates pending-validation records for its words and patterns.
- The next eligible day schedules those records for mastery questions.
- Daily selection respects the eight-question cap, priority order, and no-repeat-per-day rule.
- Correct and incorrect answers follow the documented state and scheduling transitions.
- Existing manual review items remain intact and appear only in Practice again.
- Scenario ability status and recommendation update after mastery answers change.
- Empty states and storage failures do not block lessons.
- Unit tests cover selection, state transitions, scheduling, question construction, and capability calculations.
- Component tests cover Today, Review, and My Progress behavior.
- End-to-end tests cover completing a lesson, returning on a later day, answering mastery questions, and observing the updated capability map.

## Implementation Notes

- IndexedDB database version 6 adds the `masteryProgress` and `masteryReviewSessions` stores.
- The Today sequence includes the `mastery-review` step before the existing previous-day review.
- A completed lesson seeds unique word and pattern records idempotently. Existing completed lessons are backfilled gradually, so returning learners begin later verification without being marked as mastered.
- Mastery transitions use local calendar days for next-day scheduling. The persisted session records completed item IDs, preserving the eight-question limit and preventing same-day repetition after refresh.
- Saving an answer updates its mastery record and local-date session in one IndexedDB transaction. Hydrated legacy day progress is normalized before the Today flow uses it.
- Mastery loading, question creation, and backfill errors are visible but non-blocking: the learner can continue to the previous-day review and new lesson.
- Final verification commands:
  - `npx vitest run --exclude ".worktrees/**"`
  - `npm run build`
  - `npm run content:health`
  - `npm run test:e2e`
