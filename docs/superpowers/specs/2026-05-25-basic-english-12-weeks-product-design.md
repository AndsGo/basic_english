# Basic English 12 Weeks Product Design

## Product Goal

Build a 12-week interactive Basic English learning website for Chinese-speaking beginners.

The learning goal is clear and practical:

> After finishing the course, the learner should be able to describe all common daily-life situations with Basic English. They should be able to talk about what they see, what they do, what they need, what they feel, what happened, what they plan to do, and what they think.

This product is not mainly about memorizing 850 words. It is about using C. K. Ogden's Basic English idea to express real life with a limited but flexible vocabulary.

## Product Positioning

Product name: Basic English 12 Weeks

Product type: Today-task-based interactive training website.

Target user:

- Native Chinese speaker.
- English beginner or false beginner.
- Wants practical daily-life expression, not test preparation.
- Can study 20-45 minutes per day.
- Needs a clear daily path instead of an open-ended resource library.

Core promise:

> Complete one small task every day. After 12 weeks, use Basic English to describe daily life, needs, feelings, plans, problems, and simple opinions.

## Product Decisions

Confirmed decisions:

- Use the "Today Task" product structure.
- First version is an interactive training website, not a static course site.
- First version has no account system.
- Progress is saved locally in the browser.
- Data structures should allow future cloud sync.
- First version uses medium interaction depth:
  - flashcards
  - multiple choice
  - fill blanks
  - sentence ordering
  - replacement drills
  - Chinese-to-Basic-English translation
  - self-written daily output
- First version does not include AI correction, voice recognition, pronunciation scoring, social features, or payments.

## Core Learning Loop

Every day has one guided task. The learner completes five steps:

1. Words
   - Learn 8-12 core words.
   - Flip cards to see Chinese meanings and Basic English examples.
   - Mark words as `Know` or `Review`.

2. Patterns
   - Learn 2-3 sentence patterns.
   - See usage notes, examples, and replaceable slots.

3. Drills
   - Complete controlled practice:
     - choice
     - fill blank
     - sentence ordering
     - replacement sentence

4. Translate Simply
   - Turn Chinese thoughts into Basic English.
   - See reference answers.
   - Self-mark as `Close enough` or `Need review`.

5. Express Yourself
   - Write 5-8 English sentences about personal life.
   - Use prompts and optional templates.
   - Self-rate the task as `easy`, `ok`, or `hard`.

After completion:

- Save day completion.
- Update streak.
- Update learned word count.
- Add review words to the review pool.
- Unlock the next day.

## Information Architecture

### Today

The home page and main learning workspace.

Content:

- Current position: `Week N / Day N`.
- Total progress.
- Streak.
- Today's goal.
- Five-step learning flow:
  - Words
  - Patterns
  - Drills
  - Translate Simply
  - Express Yourself
- Completion summary after the task is done.

States:

- Not started.
- In progress.
- Completed.

### Course

The 12-week course map.

Content:

- 12 week cards.
- Week theme.
- Week goal.
- Week completion rate.
- 7 day entries per week.
- Lock/unlock state.

Primary use:

- Understand the full path.
- Jump to unlocked days.
- Review completed days.

### Practice

Light review center in the first version.

First version scope:

- Reuse existing exercise components.
- Show review words and review exercises.
- Offer random speaking/writing prompts.

Future version:

- Stronger spaced review.
- Weekly tests.
- Mistake-focused sessions.

### Words

The 850-word bank.

Categories:

- `operation`
- `general_thing`
- `picturable_thing`
- `quality`
- `opposite_quality`
- `structure`

Each word has:

- English word.
- Chinese meaning.
- Category.
- Basic English example.
- Week introduced.
- Tags.
- User status:
  - `new`
  - `seen`
  - `review`
  - `known`
  - `mastered`

### Progress

Learning status dashboard.

Content:

- Completed days.
- Current week progress.
- Total progress.
- Learned words.
- Mastered words.
- Review words.
- Streak.
- Recent study activity.
- Final ability checklist.

## Daily-Life Scenario Coverage

The curriculum must support the final goal: describing all common daily-life situations.

The course should cover at least these scenarios:

- Self-introduction.
- Family and friends.
- Home and room.
- Objects and location.
- Daily routine.
- Food and drink.
- Body and health.
- Work and study.
- Transport and directions.
- Shopping and money.
- Asking for help.
- Social politeness.
- Past events.
- Future plans.
- Needs and requests.
- Likes and dislikes.
- Feelings and emotions.
- Problems and solutions.
- Personal opinions.
- Reasons and choices.
- Hopes and future life.

Each scenario must include:

- Useful words.
- Reusable sentence patterns.
- Controlled drills.
- A translation task.
- A personal output task.

## 12-Week Course Structure

Week 1: People, Identity, and Basic Sentences

- Goal: introduce self and other people.
- Output: 5-8 sentence self-introduction.

Week 2: Home, Objects, and Location

- Goal: describe rooms, objects, and where things are.
- Output: describe your room.

Week 3: Daily Routine and Simple Present

- Goal: describe what happens every day.
- Output: write or say `My Day`.

Week 4: Food, Body, and Basic Needs

- Goal: express food needs, likes, and simple body states.
- Output: order food and describe how you feel.

Week 5: Movement, Transport, and Places

- Goal: say where you go and how to get somewhere.
- Output: describe your route to work or school.

Week 6: Past Events and Personal Experience

- Goal: describe yesterday and past events.
- Output: tell what happened yesterday.

Week 7: Requests, Ability, Rules, and Help

- Goal: ask for help and explain ability or rules.
- Output: help-request dialogue.

Week 8: Shopping, Money, and Choices

- Goal: buy things, ask prices, compare choices.
- Output: shopping dialogue and choice explanation.

Week 9: Feelings, Conditions, and Personal States

- Goal: describe emotions and physical states with reasons.
- Output: feeling diary.

Week 10: Opinions, Reasons, and Preferences

- Goal: express what you think and why.
- Output: short opinion paragraph.

Week 11: Plans, Hopes, and Future Life

- Goal: describe future plans and hopes.
- Output: plan for next month.

Week 12: Integrated Daily-Life Expression

- Goal: combine daily life, past events, feelings, opinions, and future plans.
- Output: final 2-3 minute speech and 120-180 word writing task.

## Data Model

Course content and user progress must be separate.

### Course

```ts
Course {
  id: "basic-english-12-weeks"
  title: "Basic English 12 Weeks"
  weeks: Week[]
}
```

### Week

```ts
Week {
  id: "week-01"
  number: 1
  title: "People, Identity, and Basic Sentences"
  goal: "Introduce yourself and other people."
  days: Day[]
}
```

### Day

```ts
Day {
  id: "day-001"
  weekId: "week-01"
  dayNumber: 1
  title: "Introduce Yourself"
  goal: "Use simple sentences to introduce yourself."
  words: string[]
  patterns: Pattern[]
  exercises: Exercise[]
  outputTask: OutputTask
}
```

### Word

```ts
Word {
  id: "important"
  text: "important"
  category: "quality"
  chinese: "重要的"
  example: "This is important for me."
  weekIntroduced: 10
  tags: ["opinion", "reason"]
}
```

### Pattern

```ts
Pattern {
  id: "i-want-to"
  title: "I want to ___"
  use: "表达我想做某事"
  structure: "I want to {action}."
  examples: [
    "I want to learn English.",
    "I want to go home.",
    "I want to ask a question."
  ]
  slots: ["action"]
}
```

### Exercise

```ts
Exercise {
  id: "day-001-fill-001"
  type: "choice" | "fill_blank" | "sentence_order" | "replacement" | "translation"
  prompt: "I ___ to learn English."
  options?: ["want", "food", "room", "water"]
  answer?: "want"
  referenceAnswer?: "I want to learn English."
  explanation?: "want to + verb 表示想做某事。"
}
```

### OutputTask

```ts
OutputTask {
  id: "day-001-output"
  topic: "Introduce Yourself"
  prompts: [
    "What is your name?",
    "Where are you from?",
    "Why do you study English?"
  ]
  template: [
    "My name is ___.",
    "I am from ___.",
    "I study English because ___."
  ]
}
```

### UserProgress

```ts
UserProgress {
  courseId: "basic-english-12-weeks"
  currentDayId: "day-001"
  completedDayIds: string[]
  streak: number
  lastStudyDate: "2026-05-25"
  wordProgress: Record<string, WordProgress>
  exerciseProgress: Record<string, ExerciseProgress>
  outputs: Record<string, UserOutput>
}
```

### WordProgress

```ts
WordProgress {
  wordId: "important"
  status: "new" | "seen" | "review" | "known" | "mastered"
  seenCount: 3
  correctCount: 2
  lastSeenAt: "2026-05-25"
}
```

### ExerciseProgress

```ts
ExerciseProgress {
  exerciseId: "day-001-fill-001"
  status: "not_started" | "correct" | "incorrect" | "review"
  attempts: number
  lastAnswer?: string
}
```

### UserOutput

```ts
UserOutput {
  dayId: "day-001"
  text: "My name is..."
  selfRating: "easy" | "ok" | "hard"
  createdAt: "2026-05-25"
}
```

## MVP Scope

### Must Have

- Today five-step learning flow.
- 12-week course map.
- Static course data.
- Word cards.
- Pattern cards.
- Choice exercise.
- Fill-blank exercise.
- Sentence-order exercise.
- Replacement exercise.
- Translation exercise with reference answer.
- Daily output editor.
- Self-rating.
- Local progress saving.
- Word bank.
- Progress page.

### Should Have

- Review words list.
- Basic Practice page.
- Export and import progress.
- Responsive mobile layout.

### Not in First Version

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
- Multi-course platform.

## Success Metrics

Product usability:

- A new user understands what to do within 30 seconds.
- A daily task can be completed in 20-45 minutes.
- The learner can leave and return without losing progress.
- Completion clearly changes visible progress.

Learning outcome:

- The learner can describe common daily-life scenes.
- The learner can talk about daily routine, food, home, shopping, transport, health, work, study, feelings, problems, and plans.
- The learner can use `because`, `but`, `so`, and `if` to connect thoughts.
- The learner can write 120-180 words about daily life and future hopes.
- The learner can speak for 2-3 minutes about personal life using Basic English-style vocabulary and grammar.

## Acceptance Criteria

- The home page is the Today task, not a marketing page.
- The user can complete Day 1 end to end.
- Completion is saved locally.
- Refreshing the browser keeps progress.
- Course map reflects completed days.
- Word bank reflects word statuses.
- Progress page reflects completed days and learned words.
- Translation exercises show reference answers without requiring AI scoring.
- Daily output is saved.
- The final course goal is visible in the product: learning Basic English to describe common daily-life situations.
