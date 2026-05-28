# Basic English V1.4 Scene Remix Design

## Purpose

V1.4 helps learners reuse a completed scene expression in nearby daily-life situations.

The long-term product goal remains:

> A learner can use Basic English to describe common daily-life scenes and express simple personal ideas.

V1.3 made every day end with a saved scene output. V1.4 adds lightweight transfer practice:

```text
Complete a scene -> Try another version -> Review weak remixes later
```

The learner should not only write one scene. They should begin learning how to change the same Basic English structure for a similar scene.

## Scope

### Build in V1.4

- Prewritten scene remix tasks in course content.
- One `Try Another Scene` card on the Today completion page.
- Reference-answer reveal and learner self-marking.
- Scene remix attempt persistence.
- `scene_remix` review item support.
- Review page support for active scene remix review items.
- Duplicate active review prevention for the same remix task.
- Tests for content validation, component behavior, Today integration, Review integration, storage, and E2E.

### Do Not Build in V1.4

- AI feedback.
- grammar scoring.
- pronunciation scoring.
- speech recording.
- automatic remix generation from learner text.
- complex spaced repetition scheduling.
- Scene Map mastery levels.
- Me page remix statistics.
- backend or account sync.

## Product Outcome

After V1.4, the product should communicate:

> I can take a scene I learned and make a nearby version of it.

Examples:

```text
My room is small. -> My office is small.
This is my room. -> This is my kitchen.
The book is on the table. -> The bag is under the chair.
```

V1.4 records remix practice, but it does not change Scene Map status. Scene Map still answers:

> Can I describe this scene?

Remix attempts answer:

> Can I reuse this scene structure in another situation?

## Learning Flow

### Today Completion

The learner completes the existing V1.3 scene output:

```text
Build Sentences -> Make a Scene -> Speak as Dialogue
```

After the day is complete, the completion page shows one extra card:

```text
Try Another Scene
```

The card contains one prewritten remix task.

Example:

```text
Prompt: Change room to office.
Source: My room is small.
Answer: [learner writes]
```

The learner enters an answer, clicks `Show reference`, then self-marks:

```text
Close enough
Need review
```

### Close Enough

If the learner chooses `Close enough`:

- save a `SceneRemixAttempt`.
- do not create a review item.

### Need Review

If the learner chooses `Need review`:

- save a `SceneRemixAttempt`.
- create one active `scene_remix` review item unless one already exists for the same task.

### Review

The Review page shows active `scene_remix` items as remix cards.

The learner:

1. enters a new answer.
2. clicks `Show reference`.
3. chooses `Close enough` or `Need review`.

If the learner chooses `Close enough`, the review item becomes completed.

If the learner chooses `Need review`, the review item stays active and a new attempt is saved.

## Remix Task Types

V1.4 uses three task types conceptually, but implementation can start with `replace` and a small number of `extend` tasks.

### Replace

The learner changes one variable in a sentence.

Example:

```text
Prompt: Change room to office.
Source: My room is small.
Reference: My office is small.
```

This is the easiest remix type and should appear first.

### Extend

The learner writes 2-3 sentences from a prompt.

Example:

```text
Prompt: Describe your office.
Reference:
- This is my office.
- My office is small.
- I have a table in my office.
```

This should appear after the learner has enough words and patterns for the scene.

### Dialogue

The learner turns the scene into a short question-and-answer exchange.

Example:

```text
Prompt: Ask and answer about your room.
Reference:
A: Is this your room?
B: Yes. This is my room.
```

Dialogue can be added gradually after V1.4 if needed. The type exists so content can grow without changing storage.

## Data Model

Add a prewritten remix task model to course content.

Recommended type:

```ts
type SceneRemixTaskType = 'replace' | 'extend' | 'dialogue';

type SceneRemixTask = {
  id: string;
  type: SceneRemixTaskType;
  prompt: string;
  source?: string;
  referenceAnswers: string[];
};
```

Attach remix tasks to a day. The implementation may place tasks directly on `Day` or in a `sceneRemixTasksByDayId` content map. A map is acceptable if it keeps the existing course data smaller.

Example:

```ts
{
  id: 'day-008-remix-office',
  type: 'replace',
  prompt: 'Change room to office.',
  source: 'My room is small.',
  referenceAnswers: ['My office is small.']
}
```

Persist attempts separately:

```ts
type SceneRemixSelfMark = 'close' | 'review';

type SceneRemixAttempt = {
  id: string;
  dayId: string;
  taskId: string;
  userAnswer: string;
  selfMark: SceneRemixSelfMark;
  createdAt: string;
};
```

If `Need review` is selected, create a review item with type `scene_remix`.

The review item should include:

- `sourceDayId`
- `taskId`
- `prompt`
- `source`
- `userAnswer`
- `referenceAnswer`
- `status`
- timestamps consistent with existing review items

## Initial Content

V1.4 should add a small, high-quality starter set.

### Day 1: Self

Suggested tasks:

```text
Replace: Change China to Japan.
Source: I am from China.
Reference: I am from Japan.

Replace: Change student to teacher.
Source: I am a student.
Reference: I am a teacher.
```

### Day 8: Room

Suggested tasks:

```text
Replace: Change room to office.
Source: My room is small.
Reference: My office is small.

Replace: Change bed to table.
Source: I have a bed.
Reference: I have a table.

Extend: Describe your office.
Reference:
This is my office.
My office is small.
I have a table in my office.
```

### Day 9: Things in My Room

Suggested tasks:

```text
Replace: Change book to phone.
Source: There is a book in my room.
Reference: There is a phone in my room.

Replace: Change cup to bag.
Source: I have a cup.
Reference: I have a bag.
```

### Day 10: Where Things Are

Suggested tasks:

```text
Replace: Change on to under.
Source: The book is on the table.
Reference: The book is under the table.

Replace: Change table to chair.
Source: The bag is near the table.
Reference: The bag is near the chair.
```

## Components

### SceneRemixCard

Use this component in both Today completion and Review.

Responsibilities:

- show the remix prompt.
- show the optional source sentence.
- collect learner answer.
- reveal reference answers after `Show reference`.
- show self-mark buttons only after reference is visible.
- call back with `{ userAnswer, selfMark }`.

Expected labels:

```text
Try Another Scene
Show reference
Close enough
Need review
```

Use English UI text to preserve the all-English learning environment.

## Today Integration

CompletionSummary should render one `Try Another Scene` card when the completed day has remix tasks.

Rules:

- show only the first available remix task in V1.4.
- do not block day completion on remix.
- save an attempt when the learner self-marks.
- create a `scene_remix` review item only for `Need review`.
- avoid duplicate active review items for the same task.

This keeps the daily burden light.

## Review Integration

ReviewPage should render `scene_remix` review items with `SceneRemixCard`.

Rules:

- `Close enough` marks the review item completed.
- `Need review` keeps the review item active.
- every self-mark saves a new `SceneRemixAttempt`.
- reference answers are shown before self-marking.

V1.4 does not need interval scheduling. Active review items continue to appear.

## Duplicate Review Prevention

When Today creates a review item for a remix task, check existing active review items first.

If an active item already exists for the same `taskId`, do not create another active item.

Still save the new attempt.

This prevents one weak remix from flooding the Review page.

## Storage

Extend the existing local IndexedDB repository with remix attempt methods.

Recommended repository additions:

```ts
saveSceneRemixAttempt(attempt: SceneRemixAttempt): Promise<void>;
listSceneRemixAttempts(dayId?: string): Promise<SceneRemixAttempt[]>;
```

Review items already exist. Add `scene_remix` as a review item type while preserving existing word, exercise, translation, and output review items.

If an IndexedDB schema upgrade is needed, it must preserve existing learner progress.

## Error Handling

- If a day has no remix tasks, do not render `Try Another Scene`.
- If a remix attempt save fails, keep the UI usable and leave the learner answer in the current component state.
- If review item creation fails after an attempt is saved, do not duplicate attempts; report the existing review save failure path if available.
- If a review item references a missing remix task, show the stored prompt/reference data from the review item.

## Testing

### Content Validation Tests

Cover:

- remix task ids are unique.
- task type is valid.
- prompt is non-empty.
- reference answers are non-empty.
- Day 1 and Day 8 have at least one remix task.
- all remix task day ids reference valid days.

### Component Tests

Cover `SceneRemixCard`:

- answer input updates.
- reference answers are hidden before `Show reference`.
- reference answers appear after `Show reference`.
- self-mark buttons appear only after reference reveal.
- `Close enough` callback includes answer and `close`.
- `Need review` callback includes answer and `review`.

### Today Tests

Cover:

- completed scene day shows `Try Another Scene`.
- `Close enough` saves an attempt and does not create a review item.
- `Need review` saves an attempt and creates one `scene_remix` review item.
- repeated `Need review` for the same task does not create duplicate active review items.
- days without remix tasks do not show the card.

### Review Tests

Cover:

- Review page renders active `scene_remix` item.
- `Close enough` completes the review item.
- `Need review` keeps the item active.
- both self-marks save attempts.

### Storage Tests

Cover:

- save and list remix attempts.
- list attempts by day id.
- old progress still loads after schema upgrade.
- review item type `scene_remix` persists and reloads.

### E2E Tests

Cover:

1. Complete Day 1 scene output.
2. Complete `Try Another Scene` with `Need review`.
3. Open Review and see the scene remix item.
4. Complete the review with `Close enough`.
5. Reload and verify the review item stays completed.
6. Verify Scene Map remains based on scene completion, not remix attempts.

## Acceptance Criteria

V1.4 is complete when:

- Today completion can show one remix task for supported days.
- learner can reveal reference answers and self-mark.
- remix attempts persist locally.
- `Need review` creates an active `scene_remix` review item.
- duplicate active review items are prevented for the same task.
- Review page can complete or keep active a scene remix item.
- Scene Map status is unchanged by remix attempts.
- existing V1.3 scene output flow still works.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.

## Non-Goals

V1.4 does not include:

- AI correction.
- automatic sentence parsing.
- automatic remix generation from user output.
- speech recording.
- pronunciation scoring.
- advanced spaced repetition.
- Scene Map mastery levels.
- Me page remix analytics.
- account login or cloud sync.
