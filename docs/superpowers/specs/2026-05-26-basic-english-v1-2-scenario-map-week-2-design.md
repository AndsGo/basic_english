# Basic English V1.2 Scenario Map and Week 2 Design

## Purpose

V1.2 moves the product from a Week 1 learning loop to visible daily-life expression growth.

The long-term product goal remains:

> A learner can use Basic English to describe common daily-life scenes and express simple personal ideas.

V1.2 adds one complete new scenario week:

> The learner can describe their room, common things, and where things are using Basic English.

V1.2 also adds a Scenario Map so progress is measured by what the learner can say, not only by completed days.

## Scope

### Build in V1.2

- Scenario capability data structure.
- Initial 12-week scenario map data.
- Week 2 full content: Day 8-14.
- Course display for Week 1 and Week 2.
- Day unlock support across Week 1 and Week 2.
- Me page `I Can Say` capability list.
- Content validation for multi-week content and scenario capabilities.
- E2E coverage for Day 8 unlock, Day 8 completion, and Week 2 capability unlock.

### Do Not Build in V1.2

- Week 3+ playable content.
- AI correction.
- AI conversation.
- Voice recording.
- Pronunciation scoring.
- Account system.
- Backend or cloud sync.
- Full 850-word explorer.
- Complex badges or reward economy.

## Product Outcome

After V1.2, a learner should see these abilities grow:

```text
I can introduce myself.
I can introduce another person.
I can describe my room.
I can say what things are in my room.
I can say where things are.
I can describe important things in my life.
```

The product should communicate:

> I am learning to express life scenes, not only finishing lessons.

## Scenario Capability Model

Add a typed capability model:

```ts
interface ScenarioCapability {
  id: string;
  title: string;
  description: string;
  unlockedByDayIds: string[];
  exampleOutputs: string[];
}
```

Recommended fields:

- `id`: stable identifier.
- `title`: user-facing `I can...` statement.
- `description`: short explanation of the scene.
- `unlockedByDayIds`: all required days for this capability.
- `exampleOutputs`: 1-3 sample Basic English outputs.

Example:

```ts
{
  id: 'describe-my-room',
  title: 'I can describe my room.',
  description: 'Say simple facts about your room.',
  unlockedByDayIds: ['day-008'],
  exampleOutputs: [
    'This is my room.',
    'My room is small.',
    'I have a table in my room.'
  ]
}
```

## Initial 12-Week Scenario Map

The full product map should be visible as a roadmap, even though only Week 1 and Week 2 are playable in V1.2.

| Week | Theme | Expression Outcome |
|---:|---|---|
| 1 | People & Identity | Introduce yourself and another person. |
| 2 | Home & Things | Describe your room, things, and where things are. |
| 3 | Daily Life | Say what you do every day. |
| 4 | Food & Shopping | Order food and buy simple things. |
| 5 | Places & Directions | Ask where things are and say where to go. |
| 6 | People & Feelings | Describe feelings, likes, and simple relationships. |
| 7 | Problems & Help | Explain a problem and ask for help. |
| 8 | Health & Body | Describe simple health and body problems. |
| 9 | Past Simple Ideas | Say what happened yesterday. |
| 10 | Future Plans | Say what you will do tomorrow or later. |
| 11 | Opinions & Reasons | Say what you like, dislike, and why. |
| 12 | Final Scenario Practice | Answer 20 daily-life scenario prompts. |

Only Weeks 1-2 need full day content in V1.2.

## Initial Capabilities

### Week 1 Capabilities

```text
I can introduce myself.
I can say where I am from.
I can introduce another person.
I can say why I study English.
```

Suggested unlocks:

- `introduce-myself`: Day 1.
- `say-where-i-am-from`: Day 1.
- `introduce-another-person`: Day 4 or Day 7.
- `say-why-i-study-english`: Day 6.

### Week 2 Capabilities

```text
I can describe my room.
I can say what things are in my room.
I can say where things are.
I can describe study things on my table.
I can describe personal things in my bag.
I can describe important things in my life.
```

Suggested unlocks:

- `describe-my-room`: Day 8.
- `say-things-in-my-room`: Day 9.
- `say-where-things-are`: Day 10.
- `describe-study-things`: Day 11.
- `describe-personal-things`: Day 12.
- `describe-important-things`: Day 13 or Day 14.

## Week 2 Theme

Week 2 title:

```text
Home & Things
```

Week 2 goal:

```text
Describe your room, common things, and where things are using Basic English.
```

Week 2 final output target:

```text
This is my room.
My room is small.
I have a table.
There is a book on the table.
My phone is in my bag.
My bag is under the chair.
These things are important to me.
```

## Week 2 Daily Plan

### Day 8: My Room

Goal:

```text
Describe your room with simple sentences.
```

Core patterns:

```text
This is my ___.
My ___ is ___.
I have a ___.
```

Suggested words:

```text
room, home, table, chair, bed, door, window, small, big
```

Output:

```text
Write 4-5 sentences about your room.
```

### Day 9: Things in My Room

Goal:

```text
Say what things are in your room.
```

Core patterns:

```text
There is a ___.
There are ___.
I have a ___ in my room.
```

Suggested words:

```text
book, phone, bag, box, cup, pen, paper, thing
```

Output:

```text
Write 4-5 sentences about things in your room.
```

### Day 10: On / In / Under

Goal:

```text
Say where things are.
```

Core patterns:

```text
The ___ is on the ___.
The ___ is in the ___.
The ___ is under the ___.
The ___ is near the ___.
```

Suggested words:

```text
on, in, under, near, table, chair, bed, bag, box
```

Output:

```text
Write 4-5 sentences saying where things are.
```

### Day 11: My Table

Goal:

```text
Describe your table and study things.
```

Core patterns:

```text
This is my table.
There is a ___ on my table.
I use it to ___.
```

Suggested words:

```text
table, book, pen, paper, English, study, use, learn, question
```

Output:

```text
Write 4-5 sentences about your table or study place.
```

### Day 12: My Phone and Bag

Goal:

```text
Describe personal things you use every day.
```

Core patterns:

```text
This is my ___.
My ___ is in my ___.
I use it every day.
```

Suggested words:

```text
phone, bag, book, money, card, key, every, day, use
```

Output:

```text
Write 4-5 sentences about your phone, bag, or other personal things.
```

### Day 13: Useful and Important Things

Goal:

```text
Say why a thing is useful or important.
```

Core patterns:

```text
It is useful.
It is important to me.
I use it because ___.
```

Suggested words:

```text
useful, important, new, old, clean, good, because, every, day
```

Output:

```text
Write 5 sentences about things that are useful or important to you.
```

### Day 14: Weekly Check

Goal:

```text
Describe your room and things without fully copying a template.
```

Tasks:

- review Week 2 words.
- answer simple questions about room and things.
- write a 6-8 sentence room description.
- complete self-rubric.

Output:

```text
Write 6-8 sentences describing your room, your things, and where things are.
```

## Week 2 Pattern Set

Week 2 should add these reusable patterns:

```text
This is my ___.
My ___ is ___.
I have a ___.
There is a ___.
There are ___.
The ___ is on the ___.
The ___ is in the ___.
The ___ is under the ___.
The ___ is near the ___.
It is useful.
It is important to me.
I use it every day.
I use it because ___.
```

Avoid advanced grammar explanations. Keep pattern explanations in simple English.

## Week 2 Word Groups

Room and home:

```text
room, home, table, chair, bed, door, window
```

Things:

```text
book, phone, bag, box, cup, pen, paper, thing
```

Position:

```text
in, on, under, near
```

Quality and use:

```text
small, big, clean, new, old, useful, important, good
```

Daily use:

```text
use, every, day, because
```

Content should use Basic English where possible and avoid unnecessary new words.

## Unlock Rules

V1.2 extends the existing day unlock model:

- Day 1 is current for a new learner.
- Day N unlocks after Day N-1 is completed.
- Day 8 unlocks after Day 7 is completed.
- Day 14 unlocks after Day 13 is completed.
- Week 2 stays locked until Day 7 is completed.
- If a learner already completed Day 1-7 before V1.2, Day 8 becomes current.

Current-day selection should work across all available weeks, not only `course.weeks[0]`.

## Course Page Updates

Course should show Week 1 and Week 2.

Example unlocked state:

```text
Week 1: People, Identity, and Basic Sentences
7 / 7 days completed

Week 2: Home & Things
0 / 7 days completed
Current: Day 8 - My Room
```

Example locked state:

```text
Week 2: Home & Things
Complete Week 1 to unlock Home & Things.
```

Each week section shows:

- week title.
- week goal.
- completed days in that week.
- current day if unlocked.
- active review count if any.
- unlocked capabilities.
- day cards with completed/current/locked/review-needed states.

Do not present locked Week 2 days as actionable.

## Me Page Updates

Add an `I Can Say` section.

Rules:

- A capability is unlocked when every day in `unlockedByDayIds` is completed.
- Show unlocked capabilities first.
- Show next locked capabilities with the required day.

Example:

```text
I Can Say

Unlocked
- I can introduce myself.
- I can describe my room.

Next
- I can say where things are. Complete Day 10.
```

Me should keep existing settings:

- Show Chinese help.
- Enable reading aloud.
- Voice speed.

## Content Validation

Expand content validation to support multiple weeks and scenario capabilities.

Validation rules:

- all week IDs are unique.
- all day IDs are unique across all weeks.
- all word IDs are unique.
- all pattern IDs are unique.
- Week 2 exists and has 7 days.
- Day 8-14 each has:
  - at least one word.
  - at least one pattern.
  - drills.
  - translation task.
  - output task.
- scenario capabilities reference valid day IDs.
- each capability has a title, description, and at least one example output.
- Course references no missing word, pattern, or day IDs.

## Data and File Organization

Recommended structure:

```text
src/content/week1.ts
src/content/week2.ts
src/content/course.ts
src/content/scenarioCapabilities.ts
src/domain/capabilities.ts
```

Responsibilities:

- `week1.ts`: Week 1 data.
- `week2.ts`: Week 2 data.
- `course.ts`: combines weeks into the exported course.
- `scenarioCapabilities.ts`: capability data.
- `capabilities.ts`: pure helpers for unlocked/locked capability state.

The implementation may keep a different file split if it follows existing patterns and keeps responsibilities clear.

## E2E Requirements

V1.2 E2E should prove:

1. A learner with Day 1-7 completed sees Day 8 as current.
2. Course shows Week 2.
3. Week 2 is locked before Day 7 is completed.
4. The learner can complete Day 8.
5. After completing Day 8, Me shows `I can describe my room.`
6. Review still works with Week 2 words or exercises.
7. Mobile Course remains usable with two week sections.

## Acceptance Criteria

V1.2 is complete when:

- Week 2 has full Day 8-14 content.
- Day unlocks work across Week 1 and Week 2.
- Course shows Week 1 and Week 2 correctly.
- Day 8 becomes current after Day 7 completion.
- Me shows unlocked `I Can Say` capabilities.
- Content validation covers multi-week data and scenario capabilities.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.

## Non-Goals

V1.2 does not include:

- Week 3+ playable content.
- automated grammar scoring.
- AI feedback.
- speech recognition.
- pronunciation scoring.
- cloud sync.
- account login.
- full 850-word browsing UI.
- complex achievements.
