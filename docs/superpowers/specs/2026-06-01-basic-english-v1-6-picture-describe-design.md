# Basic English V1.6 Picture Describe Design

## Goal

V1.6 adds picture-based expression practice to the daily learning loop so learners produce their own Basic English descriptions of everyday life scenes. The feature should strengthen the product goal: after learning Basic English, the learner can describe daily-life scenes and express simple thoughts clearly.

The first version uses local rule-based feedback. It should be designed so AI feedback can be added later, but V1.6 must work without an external API.

## Scope

V1.6 includes:

- A new `Picture Describe` step in Today.
- Fourteen picture description tasks covering Week 1 and Week 2.
- New generated scene images for those tasks.
- Local `Check` feedback.
- Saved picture description drafts and checked results.
- Manual `Add to Review`.
- Review support for picture description tasks.
- A `My Descriptions` area on Me.

V1.6 does not include:

- AI-generated feedback.
- Speech scoring or pronunciation scoring.
- Random task selection.
- Required perfect completion before continuing.

## Today Flow

The Today sequence becomes:

`Review -> Words -> Patterns -> Drills -> Translate -> Picture Describe -> Output -> Complete`

`Picture Describe` sits before `Output` as an expression warm-up. It connects the controlled practice steps to the learner's final free output.

## Picture Describe Experience

Each task shows:

- A scene image.
- A short scene goal, such as `Say what you can see in this room.`
- Target words.
- Suggested Basic English patterns.
- A multiline writing box.
- Sentence progress, such as `2 / 3 sentences`.
- `Check`, `Add to Review`, and `Continue` actions.

Rules:

- The learner writes at least 3 sentences for Week 1 and Week 2.
- The learner must click `Check` before `Continue` is enabled.
- `Continue` is enabled after checking, even if feedback says the answer needs work.
- `Add to Review` is available when the learner has written text.
- The learner's text and feedback are saved.

The UI should stay English-first. Chinese help should not be part of this step unless a later global setting explicitly adds it.

## Course Tasks

V1.6 adds one picture description task per day for the first 14 days.

### Week 1: People, Self, Study

1. Day 1: `Self Introduction`
   - Target words: `name`, `I`, `student`, `English`
   - Patterns: `My name is ...`, `I am ...`, `I study ...`

2. Day 2: `Student at Desk`
   - Target words: `student`, `happy`, `study`, `English`
   - Patterns: `This is ...`, `He is ...`, `I can see ...`

3. Day 3: `I Have a Question`
   - Target words: `question`, `student`, `study`, `English`
   - Patterns: `I have ...`, `This is ...`, `There is ...`

4. Day 4: `My Friend`
   - Target words: `friend`, `my`, `this`, `happy`
   - Patterns: `This is my ...`, `He is ...`, `She is ...`

5. Day 5: `Kind Person`
   - Target words: `he`, `she`, `kind`, `friend`
   - Patterns: `He is ...`, `She is ...`, `This is ...`

6. Day 6: `Study English`
   - Target words: `study`, `English`, `learn`, `because`
   - Patterns: `I study ...`, `I want ...`, `because ...`

7. Day 7: `My Week 1 Scene`
   - Target words: `name`, `student`, `friend`, `English`
   - Patterns: `My name is ...`, `I am ...`, `I have ...`

### Week 2: Home, Things, Daily Routine

8. Day 8: `My Room`
   - Target words: `room`, `bed`, `table`, `window`
   - Patterns: `This is ...`, `There is ...`, `I can see ...`

9. Day 9: `Things on a Table`
   - Target words: `table`, `book`, `cup`, `pen`, `paper`
   - Patterns: `There is ...`, `There are ...`, `I have ...`

10. Day 10: `Morning at Home`
    - Target words: `home`, `room`, `door`, `window`
    - Patterns: `This is ...`, `It is ...`, `I can see ...`

11. Day 11: `Kitchen and Breakfast`
    - Target words: `cup`, `table`, `home`, `friend`
    - Patterns: `There is ...`, `I have ...`, `This is ...`

12. Day 12: `Cleaning the Room`
    - Target words: `room`, `table`, `chair`, `box`
    - Patterns: `I can ...`, `There is ...`, `It is ...`

13. Day 13: `Evening at Home`
    - Target words: `home`, `book`, `chair`, `friend`
    - Patterns: `This is ...`, `I can see ...`, `It is ...`

14. Day 14: `My Home Check`
    - Target words: `home`, `room`, `table`, `bed`, `friend`
    - Patterns: `This is ...`, `There is ...`, `I have ...`

Each task must also include a `simpleVersion`: 3 Basic English example sentences.

## Image Assets

Generate 14 new scene images under a new asset folder, for example:

`src/assets/picture-describe/`

Image requirements:

- Daily-life learning illustration.
- Clear scene with objects and actions.
- No text, letters, logos, brand names, or watermark.
- Soft clean style consistent with existing flashcard images.
- Enough detail for 3 simple sentences, but not visually crowded.
- Optimized for web delivery before commit.

## Local Feedback

Local feedback checks only whether the description is clear enough to move forward. It is not a full grammar checker.

Checks:

1. Sentence count
   - Week 1 and Week 2 require 3 sentences.
   - Future weeks can increase by week number: Week 3-6 require 4, Week 7-12 require 5.
   - Sentences can be counted by `.`, `!`, `?`, or line breaks.

2. Target words
   - The answer should include at least 2 target words.
   - Matching is case-insensitive.

3. Basic sentence patterns
   - The answer should include at least one simple pattern, such as:
     - `This is`
     - `There is`
     - `There are`
     - `I can see`
     - `I have`
     - `I am`
     - `He is`
     - `She is`

4. Meaningful sentence length
   - A sentence should contain roughly 3 or more English words.
   - Inputs like `room. bed. table.` should not be treated as ready.

Feedback result:

- `ready`: sentence count is met and either target words or simple patterns are present.
- `needs_work`: sentence count is too low, sentences are too short, or both target words and patterns are missing.

Feedback display:

- Show at most 2 actionable messages.
- Always show the task's `simpleVersion`.
- Do not show a long correction list.

Example messages:

- `Add one more sentence about the picture.`
- `Use picture words like room, table, bed.`
- `Try one simple pattern: There is ...`

## Data Model

Add course content for picture description tasks:

```ts
type PictureDescribeTask = {
  id: string;
  dayId: string;
  title: string;
  goal: string;
  image: string;
  targetWords: string[];
  suggestedPatterns: string[];
  requiredSentenceCount: number;
  simpleVersion: string[];
};
```

Add saved user output:

```ts
type PictureDescription = {
  id: string;
  dayId: string;
  taskId: string;
  text: string;
  checkedAt?: string;
  feedback?: {
    status: 'ready' | 'needs_work';
    messages: string[];
    simpleVersion: string[];
  };
  addedToReviewAt?: string;
  updatedAt: string;
};
```

Repository support should include:

- `savePictureDescription`
- `getPictureDescription`
- `listPictureDescriptions`

## Review Integration

Add a ReviewItem type for picture description, for example `picture_description`.

The review item should store:

- `taskId`
- `sourceDayId`
- prompt or scene title
- user's original answer
- reference/simple version
- enough metadata to detect active duplicates

`Add to Review` behavior:

- Creates one active picture description ReviewItem.
- Does not create duplicate active items for the same task.
- Shows feedback that it was added.

Review page behavior:

- Shows the scene title.
- Shows the image.
- Shows target words.
- Shows the user's original text.
- Shows the simple version.
- Provides a textbox for a new attempt or revision.
- `I know this` marks the review item known.

## Me Page Integration

Add `My Descriptions` to Me.

Display checked descriptions:

- Scene title.
- Day label.
- Short preview of the learner's text.
- Feedback status.

This section is evidence for the learner's progress toward describing daily life scenes.

## Error Handling

- If image loading fails, show a stable fallback panel with the scene title.
- If storage save fails, keep the current text in memory and show a concise error.
- If feedback cannot run, show a fallback message and keep `Continue` disabled until a successful check.
- Repeated `Add to Review` clicks must not create duplicate active items.

## Testing Strategy

Unit tests:

- Feedback rule tests for sentence count, target words, patterns, and short fragments.
- Review duplicate helper tests for picture description review items.
- Repository tests for saving and listing descriptions.

Component tests:

- Picture Describe renders image, target words, patterns, simple version after check.
- Text is saved and restored.
- `Continue` is disabled before Check and enabled after Check.
- `Add to Review` creates one active review item.
- Review page renders picture description review content and can mark known.
- Me page lists checked descriptions.

E2E tests:

- Day 1 flow includes Picture Describe between Translate and Output.
- Learner writes 3 sentences, checks, continues to Output.
- Add to Review creates a Review entry.
- Review page can complete the picture description review.
- Me page shows the checked description.

## Acceptance Criteria

- Every Week 1 and Week 2 day has one Picture Describe task.
- Today includes Picture Describe after Translate and before Output.
- Learner text is saved and restored.
- Local Check produces clear feedback and a simple version.
- Continue unlocks only after Check.
- Add to Review does not duplicate active review items.
- Review supports picture description items.
- Me shows checked descriptions.
- New images are local, optimized, and render in production build.
- Existing Today, Review, Words, Course, and Me tests remain passing.
