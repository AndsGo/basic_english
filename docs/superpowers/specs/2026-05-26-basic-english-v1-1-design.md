# Basic English V1.1 Product Design

## Purpose

V1.1 turns the current Week 1 MVP from a guided demo into a playable learning loop.

The product goal remains:

> A learner can use Basic English to describe daily-life scenes and express simple personal ideas.

V1.1 focuses on Week 1 only:

> The learner can progress from Day 1 to Day 7, complete real practice actions, review weak items, and finish the week able to introduce themselves and another person in Basic English.

V1.1 does not add Week 2. It strengthens the Week 1 loop before expanding content.

## Scope

### Build in V1.1

- Current-day selection across Day 1-7.
- Day unlock rules and Course day states.
- Step completion requirements.
- Active drill inputs for all exercise types.
- Translation input before reference answers.
- Output completion checks.
- Review item creation and resolution.
- Review page with usable active items.
- Day complete summary with next-day CTA.
- Week 1 progress, streak, review count, and saved outputs.
- E2E coverage for the Week 1 learning loop.

### Do Not Build in V1.1

- Week 2 content.
- Full 12-week content map beyond a simple future-week preview.
- AI correction.
- Speech recognition.
- Pronunciation scoring.
- Complex badges or reward economy.
- Account system.
- Backend or cloud sync.

## Success Criteria

V1.1 is successful when:

- A new user starts at Day 1.
- Completing Day 1 unlocks Day 2.
- Day 7 is locked until Days 1-6 are complete.
- Today shows the current unlocked day instead of always Day 1.
- Course shows Day 1-7 as completed, current, locked, or review needed.
- The learner cannot complete a day without answering drills, writing a translation, and writing the required output.
- Incorrect answers and weak self-ratings create Review items.
- Review items are visible and can be resolved.
- Progress survives page refresh.
- Mobile layout remains usable.

## Learning Flow

Today keeps the existing six-step structure:

1. Review
2. Words
3. Patterns
4. Drills
5. Translate
6. Output

Each step must produce a learning action before the learner can continue.

### Review

Day 1 has no required review.

Day 2-7 show:

- words marked `Review`.
- incorrect exercise attempts.
- translations marked `Need review`.
- outputs self-rated `Hard`.
- a small set of previous words or patterns selected from prior days.

Review actions:

- `I know this`: marks the item known and removes it from active review.
- `Review again`: keeps the item active.
- `Practice now`: optional in V1.1; may open the relevant content in-place or link back to the source day.

### Words

Each word card shows:

- English word.
- English definition.
- Basic English example.
- read button.
- optional Chinese help when enabled in settings.

The learner must mark every current-day word as either:

- `Know`
- `Review`

Words marked `Review` create active Review items.

### Patterns

Each pattern card shows:

- pattern.
- simple English use.
- examples.
- read button.

The learner must interact with each pattern before the step is complete.

V1.1 accepted interactions:

- `Practice this`
- or a small replacement input matching the pattern.

### Drills

All drills must receive an answer.

Exercise behavior:

- `choice`: user selects one option; app shows `Correct` or `Try again`.
- `fill_blank`: user types an answer; app checks accepted answers.
- `sentence_order`: user taps word tokens into order.
- `replacement`: user writes a sentence, then compares with the reference.

Incorrect answers do not block day completion. They create Review items.

### Translate

Translation teaches reformulation, not word-by-word translation.

Required flow:

1. Read the prompt and core meaning.
2. Write an English sentence.
3. Show reference answer.
4. Self-mark as `Close enough` or `Need review`.

`Need review` creates a Review item.

### Output

The learner must write personal sentences.

Minimum sentence count:

- Day 1-6: use each day content requirement, normally 4-5 sentences.
- Day 7: at least 6 sentences.

Completion checklist:

- I used today's pattern.
- I used lesson words.
- Each sentence has a subject.
- My meaning is clear.

Self-rating:

- Easy
- OK
- Hard

`Hard` creates an output Review item.

## Completion Rules

V1.1 uses a warm completion rule:

> The learner must do the core actions, but does not need to get everything correct.

A day can be completed when:

- all current-day words are marked `Know` or `Review`.
- all required patterns are practiced.
- all drills have answers.
- each translation has a user answer and self-mark.
- output reaches the required sentence count.
- all output checklist items are checked.
- output self-rating is selected.

Errors and weak items feed Review instead of blocking progress.

## Course Page

Course becomes the Week 1 learning map.

Each day card shows:

- day number.
- title.
- goal.
- status.
- estimated time.
- output requirement.

Day statuses:

- `Completed`
- `Current`
- `Locked`
- `Review needed`

Unlock rules:

- Day 1 is current by default.
- Completing Day N unlocks Day N+1.
- Completed days can be reopened for review.
- Locked days cannot be started.
- Day 7 unlocks only after Days 1-6 are complete.

Course header shows:

```text
Week 1: People, Identity, and Basic Sentences
3 / 7 days completed
Current: Day 4 - This Is
Review: 6 items
```

## Review Page

Review becomes a usable learning center instead of an empty page.

Review item types:

- `word`
- `pattern`
- `exercise`
- `translation`
- `output`

Each item shows:

- type.
- source day.
- source step.
- prompt or learning target.
- last user answer when available.
- reference answer when available.
- priority.
- actions.

Actions:

- `I know this`: mark known and remove from active review.
- `Review again`: keep active.
- `Practice now`: optional lightweight practice in V1.1.

Empty state:

```text
No review items. Start today's task.
```

## Me Page

Me becomes a light learning profile.

It shows:

- completed days: `3 / 7`.
- current streak.
- active review item count.
- Week 1 status.
- saved outputs.

Saved outputs show:

- day title.
- date.
- self-rating.
- short preview.
- view/edit action.

The page should answer:

> What can I already say in Basic English?

## Lightweight Game Feedback

V1.1 uses light game mechanics that support learning.

### Step Feedback

After a step is complete:

```text
Step complete
You practiced 6 words.
2 items will come back in Review.
```

### Day Complete Summary

After completing a day:

```text
Day 3 complete
You can now say what you have.

Today you practiced:
- 6 words
- 1 pattern
- 5 drills
- 1 translation
- 4 personal sentences

Review tomorrow:
- 2 words
- 1 drill
```

### Next-Day CTA

After Day N:

- show `Start Day N+1` when the next day is unlocked.
- show `View Week 1 result` after Day 7.

### Streak

Simple streak only:

- completing one day on a local date counts for that date.
- completing the same day again on the same date does not add another streak day.
- missing a local calendar day resets streak.

### Review Badge

The Review navigation item shows the active item count.

Example:

```text
Review 6
```

### Week 1 Result

After Day 7:

```text
Week 1 complete
You can introduce yourself and another person in Basic English.
```

The result shows:

- sentence count.
- used patterns.
- active review items.
- self-rating.
- suggested next action.

V1.1 may show the rubric UI without full automated scoring.

## Data Model

V1.1 extends the existing IndexedDB repository. It does not introduce a backend or global state library.

### DayProgress

Add or support:

```ts
status: "locked" | "not_started" | "in_progress" | "completed";
completedStepIds: StepId[];
```

Purpose:

- find current day.
- unlock next day.
- show Course state.

### StepCompletion

```ts
interface StepCompletion {
  id: string;
  dayId: string;
  stepId: StepId;
  isComplete: boolean;
  completedAt?: string;
  summary: {
    practicedCount?: number;
    reviewCreatedCount?: number;
    missingRequirements?: string[];
  };
}
```

Purpose:

- control Continue.
- support step feedback.
- build Day complete summary.

### ReviewItem

```ts
interface ReviewItem {
  id: string;
  type: "word" | "pattern" | "exercise" | "translation" | "output";
  sourceDayId: string;
  sourceStepId: StepId;
  prompt: string;
  userAnswer?: string;
  referenceAnswer?: string;
  priority: "low" | "normal" | "high";
  status: "active" | "known";
  createdAt: string;
  updatedAt: string;
}
```

### ExerciseAttempt

Use attempts to generate Review items.

```ts
result: "correct" | "incorrect" | "self_mark_close" | "self_mark_review";
```

### UserOutput

Add or derive:

```ts
sentenceCount: number;
selfRating: "easy" | "ok" | "hard";
checklist: {
  usedTargetPattern: boolean;
  usedLessonWords: boolean;
  hasSubjects: boolean;
  meaningIsClear: boolean;
};
```

## Architecture

Keep the existing frontend-only architecture.

Recommended module boundaries:

- `src/domain/progress.ts`: day unlocks, current day, completion rules.
- `src/domain/review.ts`: review item creation, review updates, review counts.
- `src/domain/exercises.ts`: answer checking and sentence counting.
- `src/storage/progressRepository.ts`: repository interfaces for progress, outputs, attempts, and review items.
- `src/components/*`: UI rendering and user actions only.

No large state management library is needed in V1.1.

## Testing

### Unit Tests

Add or update tests for:

- Day 1 default current state.
- completing Day 1 unlocks Day 2.
- Day 7 unlocks only after Days 1-6 are complete.
- Words step requires every word to be marked.
- Drills step requires all answers.
- incorrect drill attempts create Review items.
- translation `Need review` creates Review items.
- output `Hard` creates Review items.
- Review `I know this` removes an active item.
- sentence counting handles simple punctuation and new lines.

### Component Tests

Add or update tests for:

- Today shows current day instead of hard-coded Day 1.
- Continue is blocked or explains missing requirements until the current step is complete.
- Course shows completed, current, locked, and review-needed states.
- Review page lists active items and can mark one known.
- Me shows completed days, streak, review count, and saved outputs.

### E2E Tests

Cover:

1. New user starts on Day 1.
2. User completes Words, Patterns, Drills, Translate, and Output.
3. Day 1 complete unlocks Day 2.
4. Course shows `1 / 7 days completed`.
5. A wrong drill creates a Review item.
6. Review item can be marked known.
7. Refresh preserves progress.
8. Mobile viewport supports Today, Course, Review, Words, and Me.

## Acceptance Criteria

V1.1 is complete when:

- all V1.1 success criteria pass manually and in tests.
- `npm test` passes.
- `npm run build` passes.
- E2E tests cover the main Week 1 loop.
- GitHub Pages build remains deployable.

The learner experience after V1.1 should be:

> I completed a real day of learning. I know what I can now say. I know what to review. I know what to do next.
