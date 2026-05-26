# Basic English 12 Weeks MVP v1 Product Design

## Purpose

This document revises the original 12-week product design into a smaller, testable MVP.

The long-term product goal remains:

> After finishing the 12-week course, the learner should be able to describe common daily-life situations with Basic English.

For MVP v1, the goal is narrower:

> Prove that a Chinese-speaking beginner can complete one week of Today-based Basic English training and produce a simple self-introduction and daily-life description using Basic English patterns.

MVP v1 is not the full 12-week product. It is the first usable learning slice.

## Product Wedge

Basic English 12 Weeks is not a general English app, vocabulary app, or AI chat product.

The differentiator is:

> Structured daily output training using limited Basic English vocabulary for Chinese beginners who freeze when they need to speak or write.

The product teaches learners to express real life with simple words, reusable patterns, and guided output.

## MVP v1 Scope

### Build in v1

- Week 1 complete course content: 7 days.
- Reusable Today task flow.
- Mobile-first Today experience.
- Local progress persistence.
- Simple review system.
- Non-AI feedback scaffolding.
- Week 1 performance check.
- Minimal Course Map.
- Minimal Progress summary.
- Small Word Bank for Week 1 words only.

### Do Not Build in v1

- Full 12-week content.
- Full 850-word bank.
- Full Practice Center.
- Full Progress dashboard.
- Account system.
- Backend.
- Cloud sync.
- AI correction.
- AI conversation.
- Voice recording.
- Speech recognition.
- Pronunciation scoring.
- Community features.
- Payment.

## v1 Success Criteria

### Product Usability

- A new user understands the product within 30 seconds.
- The first screen clearly shows the next action.
- A daily task can be completed in 20-35 minutes.
- The learner can stop during a task, refresh, and continue.
- Day completion is saved locally.
- The next day unlocks after completion.
- The site works well on mobile.

### Learning Outcome

After Week 1, the learner can:

- introduce themselves in 5-8 Basic English sentences.
- introduce one family member or friend.
- use `I am`, `I have`, `This is`, `He/She is`, and `I study English because`.
- answer simple questions about identity and people.
- write a short personal paragraph without copying the full template.

### Final 12-Week Outcome Definition

For the full product, the broad goal "describe common daily-life situations" must be tested like this:

- Given 20 daily-life scenario prompts, the learner can answer at least 16.
- For each passed scenario, the learner can produce 5-8 understandable Basic English sentences.
- The learner uses at least two connectors across the answer set: `because`, `but`, `so`, `if`.
- The learner can speak or write without fully copying a template.
- The expression is understandable even if not perfect.

Scenario prompt examples:

- Introduce yourself.
- Describe your room.
- Say what you do every day.
- Order food.
- Ask for help.
- Ask for directions.
- Buy something.
- Describe a health problem.
- Talk about yesterday.
- Talk about tomorrow.
- Explain why you study English.
- Describe a problem.
- Say what is important to you.
- Talk about your future plan.

## Today Page v1

Today is the home page. There is no marketing landing page.

### First-Run State

Show a short explanation:

```text
One task per day.
Finish 5 short steps.
Your progress is saved on this browser.
```

Primary CTA:

```text
Start Day 1
```

### Returning User State

Header:

- `Week 1 / Day 3`
- Day title.
- Plain-language goal.
- Estimated time.
- Streak or completed days.

Primary CTA:

- `Start today's task` when not started.
- `Continue Step 3` when in progress.
- `Review today's work` when completed.

The five-step list is shown as a progress stepper, not as competing navigation.

### Daily Time Budget

Target: 20-35 minutes.

Recommended step budget:

| Step | Time |
|---|---:|
| Review | 3-5 min |
| Words | 5-6 min |
| Patterns | 5-6 min |
| Drills | 8-10 min |
| Translate Simply | 4-6 min |
| Express Yourself | 6-8 min |

If a learner wants more, offer optional extra practice after completion.

## Daily Learning Flow v1

### Step 0: Review

Review is part of MVP v1.

Each day after Day 1 includes:

- 2-4 words from yesterday.
- 1 sentence pattern from yesterday.
- review items previously marked `Review`.

Later full-product review should include:

- yesterday.
- 3 days ago.
- 7 days ago.
- weak items.

### Step 1: Words

Each day introduces 6-10 words in v1.

Word card:

- English word.
- Chinese meaning.
- Basic English example.
- `Know` button.
- `Review` button.

### Step 2: Patterns

Each day introduces 1-2 sentence patterns in v1.

Pattern card:

- English structure.
- Chinese purpose.
- 2-3 examples.
- replaceable slots.

Example:

```text
I am ___.

Use: say who you are or how you are.

Examples:
I am a student.
I am from China.
I am happy today.
```

### Step 3: Drills

Each day includes 5-8 controlled drills.

Types:

- choice.
- fill blank.
- sentence ordering.
- replacement.

Minimum completion:

- Complete all required drills.
- Correct at least key pattern drills.
- Incorrect items go to review.

### Step 4: Translate Simply

This step teaches reformulation, not word-by-word translation.

Flow:

1. Read the Chinese idea.
2. Choose the core meaning.
3. Choose a Basic English pattern.
4. Write a simple English sentence.
5. Compare with reference answers.
6. Self-mark as `Close enough` or `Need review`.

Example:

```text
中文：我想提高英语。
Core meaning: I want my English to be better.
Pattern: I want to ___ / make ___ better.
Reference:
- I want to make my English better.
- I want to get better at English.
```

### Step 5: Express Yourself

Each day ends with personal output.

Requirements:

- Write 4-6 sentences in v1.
- Use at least one target pattern.
- Use at least two words from today's lesson.
- Save automatically.
- Self-check before completion.

Self-check:

```text
I used today's pattern.
I used at least two lesson words.
Each sentence has a subject.
I can understand my own meaning.
```

Self-rating:

- Easy.
- OK.
- Hard.

## Completion Feedback

After completing a day, show:

- Today's completed goal.
- Useful sentence learned today.
- Words marked for review.
- Saved personal output.
- Tomorrow preview.
- Return cue: `Come back tomorrow for Day N`.

Do not rely only on streaks. The feedback should tell the learner what they can now say.

## Week 1 Course Content

Week 1 theme: People, Identity, and Basic Sentences.

Week 1 goal:

> Introduce yourself and another person using simple Basic English.

### Day 1: My Name

Goal: say name, place, and learner identity.

Patterns:

- `My name is ___.`
- `I am from ___.`

Output:

- 4-6 sentence self-introduction.

### Day 2: I Am

Goal: describe identity and simple state.

Patterns:

- `I am ___.`
- `I am a ___.`

Output:

- describe yourself with identity and feeling.

### Day 3: I Have

Goal: say what you have.

Patterns:

- `I have ___.`
- `I have a question.`

Output:

- describe things or people in your life.

### Day 4: This Is

Goal: introduce a person or thing.

Patterns:

- `This is ___.`
- `This is my ___.`

Output:

- introduce one family member or friend.

### Day 5: He / She Is

Goal: describe another person.

Patterns:

- `He is ___.`
- `She is ___.`

Output:

- describe one person in 4-6 sentences.

### Day 6: I Study English Because

Goal: explain a simple reason.

Patterns:

- `I study English because ___.`
- `I want to ___.`

Output:

- explain why you study English.

### Day 7: Weekly Check

Goal: produce a self-introduction without fully copying the template.

Tasks:

- review Week 1 words.
- answer simple questions.
- write 6-8 sentence self-introduction.
- complete self-rubric.

## Week 1 Assessment Rubric

Each weekly check uses a simple 0-2 rubric.

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Meaning | hard to understand | partly clear | clear |
| Sentence control | many missing parts | some complete sentences | mostly complete sentences |
| Target patterns | not used | used with help | used independently |
| Word use | few lesson words | some lesson words | several lesson words |
| Independence | copied template | partly changed template | mostly own content |

Pass target:

- Total score at least 7 out of 10.
- Must score at least 1 in Meaning.
- Must include at least 5 sentences.

If the learner does not pass:

- Do not block harshly.
- Recommend review.
- Let them retry the weekly check.

## Common Error Support for Chinese Speakers

Add short notes where relevant:

- English sentences usually need a subject.
- Use `am/is/are` for identity and description.
- Use `a` before one general countable thing.
- Use `the` for a known thing.
- Use English word order: subject + verb + object.
- Make time clear with words like `today`, `yesterday`, `tomorrow`.

Example:

```text
中文式: This book I like.
Better: I like this book.
```

## Mobile Requirements

Mobile responsive layout is Must Have for v1.

Requirements:

- Single-column Today flow.
- Sticky bottom primary action.
- Large tap targets.
- Step progress visible.
- Writing fields autosave.
- Sentence ordering works by tapping, not only dragging.
- Navigation is secondary to Today.

Mobile bottom navigation:

- Today.
- Course.
- Review.
- Words.
- Me.

For v1, `Words` and `Me` may be minimal.

## Information Architecture v1

### Today

Primary surface.

### Course

Minimal Week 1 map and locked preview of future weeks.

### Review

Simple list of review words and missed items.

### Words

Week 1 words only in v1.

### Me

Minimal progress:

- completed days.
- current streak.
- Week 1 score.
- saved outputs.

## Data Model v1

Use normalized local records instead of one large mutable progress object.

### Content Metadata

```ts
ContentMeta {
  courseId: "basic-english-12-weeks"
  contentVersion: "1.0.0"
  schemaVersion: 1
}
```

### DayProgress

```ts
DayProgress {
  id: "day-001"
  dayId: "day-001"
  status: "not_started" | "in_progress" | "completed"
  currentStep: "review" | "words" | "patterns" | "drills" | "translate" | "output" | "done"
  startedAt?: string
  completedAt?: string
  updatedAt: string
  contentVersion: string
}
```

### StepProgress

```ts
StepProgress {
  id: "day-001-words"
  dayId: "day-001"
  stepId: "words"
  status: "not_started" | "in_progress" | "completed"
  updatedAt: string
}
```

### WordProgress

```ts
WordProgress {
  id: "word-important"
  wordId: "important"
  status: "new" | "seen" | "review" | "known" | "mastered"
  seenCount: number
  correctCount: number
  lastSeenAt?: string
  updatedAt: string
}
```

### ExerciseAttempt

```ts
ExerciseAttempt {
  id: "attempt-day-001-fill-001-001"
  exerciseId: "day-001-fill-001"
  dayId: "day-001"
  answer: unknown
  result: "correct" | "incorrect" | "self_mark_close" | "self_mark_review"
  createdAt: string
}
```

### UserOutput

```ts
UserOutput {
  id: "output-day-001"
  dayId: "day-001"
  text: string
  selfRating: "easy" | "ok" | "hard"
  checklist: {
    usedTargetPattern: boolean
    usedLessonWords: boolean
    hasSubjects: boolean
    meaningIsClear: boolean
  }
  updatedAt: string
}
```

### StudyActivity

```ts
StudyActivity {
  id: "activity-2026-05-25"
  localDate: "2026-05-25"
  startedAt: string
  completedDayIds: string[]
}
```

## Exercise Model v1

Use discriminated unions instead of one loose exercise type.

```ts
type Exercise =
  | ChoiceExercise
  | FillBlankExercise
  | SentenceOrderExercise
  | ReplacementExercise
  | TranslationExercise;
```

```ts
ChoiceExercise {
  type: "choice"
  id: string
  prompt: string
  options: string[]
  correctOption: string
  explanation?: string
}
```

```ts
FillBlankExercise {
  type: "fill_blank"
  id: string
  prompt: string
  acceptedAnswers: string[]
  explanation?: string
}
```

```ts
SentenceOrderExercise {
  type: "sentence_order"
  id: string
  tokens: string[]
  correctOrder: string[]
  finalSentence: string
}
```

```ts
ReplacementExercise {
  type: "replacement"
  id: string
  patternId: string
  slotValues: Record<string, string>
  referenceAnswer: string
}
```

```ts
TranslationExercise {
  type: "translation"
  id: string
  chinesePrompt: string
  coreMeaningHint: string
  suggestedPatternIds: string[]
  referenceAnswers: string[]
}
```

## Persistence Requirements

Use IndexedDB in v1.

Requirements:

- Versioned stores.
- Local schema migration path.
- Autosave for written output.
- Autosave current step and exercise answers.
- Validate imported data before applying it.
- Recover gracefully from corrupt local data.
- Store local progress behind a repository interface.

Repository boundary:

```ts
ProgressRepository {
  getDayProgress(dayId: string): Promise<DayProgress | null>
  saveDayProgress(progress: DayProgress): Promise<void>
  saveStepProgress(progress: StepProgress): Promise<void>
  saveExerciseAttempt(attempt: ExerciseAttempt): Promise<void>
  saveUserOutput(output: UserOutput): Promise<void>
  listReviewWords(): Promise<WordProgress[]>
}
```

## Content Quality Requirements

Course content must be validated before release.

Validation rules:

- All IDs are unique.
- Day references point to valid words, patterns, and exercises.
- Each Day has required fields.
- Each v1 Day has:
  - 6-10 words.
  - 1-2 patterns.
  - 5-8 drills.
  - at least 1 translation task.
  - 1 output task.
- Chinese text is valid UTF-8.
- No replacement characters.
- No obvious mojibake patterns.
- Each exercise has a renderable prompt and answer/reference answer.

## v1 Acceptance Criteria

### Functional

- New user sees Day 1 and a clear `Start Day 1` action.
- User can complete all five learning steps plus review.
- User can stop mid-day, refresh, and resume the same step.
- Day completion unlocks the next day.
- Day 7 weekly check is available after Days 1-6.
- Progress persists locally in IndexedDB.

### Learning

- Week 1 contains 7 complete days.
- Each day includes words, patterns, drills, translation, and output.
- Day 7 weekly check uses the 0-2 rubric.
- The learner can save a 6-8 sentence self-introduction.
- The product records whether the learner passed or should review.

### UX

- Today is the default page.
- The first screen has one dominant CTA.
- The site works on mobile width.
- Step actions are large enough for touch.
- Written output autosaves.
- Completion screen shows what the learner can now say.

### Technical

- Content validation runs successfully.
- Chinese content renders correctly.
- Progress records include timestamps and content version.
- Exercise attempts are saved.
- Corrupt local data does not crash the app.

## Post-v1 Roadmap

### v1.1

- Add Week 2.
- Add richer review scheduling.
- Add export/import progress.
- Add more common-error notes.

### v1.2

- Add Weeks 3-4.
- Add basic Progress dashboard.
- Add scenario-based checks.

### v2

- Complete all 12 weeks.
- Add full 850-word bank.
- Add complete Practice Center.
- Add final 20-scenario assessment.

### v3

- Add optional account and cloud sync.
- Add AI writing feedback.
- Add AI speaking practice.
- Add optional voice recording.
