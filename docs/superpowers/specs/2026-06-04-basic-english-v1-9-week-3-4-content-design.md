# Basic English V1.9 Week 3-4 Content Expansion Design

## Goal

V1.9 extends the course from 2 playable weeks to 4 playable weeks.

The product goal remains:

> A learner can use Basic English to describe common daily-life scenes and express simple personal ideas.

Weeks 1-2 currently let the learner describe identity, people, rooms, objects, and object positions. V1.9 should move the learner into everyday actions, time order, food, shopping, needs, and simple requests.

## Decisions

- Add Week 3 and Week 4 as full playable course content.
- Keep the existing Today learning flow unchanged.
- Do not add new pages, new task types, or new navigation concepts.
- Add image-backed word flashcards for all new Week 3-4 words.
- Add one picture-description scene image for every new day.
- Keep the English-first environment. Chinese help remains optional and configurable through existing behavior.

## Scope

### Build in V1.9

- Week 3 content: 7 days, Day 15-21.
- Week 4 content: 7 days, Day 22-28.
- New words for Week 3-4.
- New patterns for Week 3-4.
- Daily drills and translation exercises for all new days.
- Daily output tasks for all new days.
- Daily scene remix tasks for all new days.
- Daily picture describe tasks and images for all new days.
- Word flashcard images for all new words.
- Content validation updates so the full course verifies Weeks 1-4.
- Tests for course composition, content references, images, and Today behavior with Week 3-4.

### Do Not Build in V1.9

- New UI pages.
- New task types.
- Conversation practice.
- Voice recording.
- Pronunciation scoring.
- AI correction.
- Backend or cloud sync.
- Full 12-week content.
- Full 850-word image coverage.

## Today Flow

V1.9 keeps the current Today sequence:

```text
Review -> Words -> Patterns -> Drills -> Translate -> Scene Remix -> Picture -> Output
```

The implementation should reuse existing components and domain logic. V1.9 is primarily a content and asset release.

## Content Density

Each new day should include:

- 6-8 new words.
- 1-2 new patterns.
- 4-6 drill exercises.
- 1 translation exercise set.
- 1 scene remix task.
- 1 picture describe task.
- 1 output task.

Week check days may reuse more previous words and introduce fewer new words, but they still need a complete Today flow.

## Week 3 Theme

Title:

```text
Daily Routine & Time
```

Goal:

```text
Say what you do every day, when you do it, and in what order.
```

Final output target:

```text
I get up in the morning.
I wash my face.
I have food.
Then I go to school.
I study English in the afternoon.
In the evening, I am at home.
This is my normal day.
```

### Day 15: Morning Routine

Goal:

```text
Describe simple things you do in the morning.
```

Suggested new words:

```text
morning, get, up, wash, face, water, put, clothes
```

Core patterns:

```text
I get up in the morning.
I wash my ___.
I put on my ___.
```

Output:

```text
Write 4-5 sentences about your morning.
```

Picture scene:

```text
A learner in a bedroom getting ready in the morning.
```

### Day 16: Going to School or Work

Goal:

```text
Say where you go and what you take with you.
```

Suggested new words:

```text
go, school, work, take, road, bus, walk, with
```

Core patterns:

```text
I go to ___.
I take my ___.
I go with ___.
```

Output:

```text
Write 4-5 sentences about going to school, work, or another place.
```

Picture scene:

```text
A learner leaving home with a bag and going along a road.
```

### Day 17: Doing Useful Things

Goal:

```text
Describe common actions with things.
```

Suggested new words:

```text
do, make, open, close, give, see, read, write
```

Core patterns:

```text
I use ___ to ___.
I open the ___.
I give ___ to ___.
```

Output:

```text
Write 4-6 sentences about things you do with common objects.
```

Picture scene:

```text
A desk scene with a learner opening a book, writing, and using simple objects.
```

### Day 18: Time of Day

Goal:

```text
Say what happens in the morning, afternoon, and evening.
```

Suggested new words:

```text
afternoon, evening, night, time, before, after, sleep, meal
```

Core patterns:

```text
In the morning, I ___.
In the afternoon, I ___.
In the evening, I ___.
```

Output:

```text
Write 5-6 sentences about one day using time-of-day words.
```

Picture scene:

```text
A three-part daily scene: morning, afternoon, and evening.
```

### Day 19: First, Then, After

Goal:

```text
Put daily actions in a simple order.
```

Suggested new words:

```text
first, then, next, last, start, finish, same, order
```

Core patterns:

```text
First, I ___.
Then I ___.
After that, I ___.
```

Output:

```text
Write 5-6 ordered sentences about a simple daily task.
```

Picture scene:

```text
A learner doing a sequence: open book, write, close book, put book in bag.
```

### Day 20: Everyday Habits

Goal:

```text
Describe things you do every day.
```

Suggested new words:

```text
always, often, sometimes, never, usually, again, practice, habit
```

Core patterns:

```text
I ___ every day.
I often ___.
I sometimes ___.
```

Output:

```text
Write 5-6 sentences about your everyday habits.
```

Picture scene:

```text
A simple weekly routine scene showing repeated study, food, and home actions.
```

### Day 21: Week 3 Check

Goal:

```text
Describe one normal day from morning to evening.
```

Suggested review words:

```text
morning, afternoon, evening, get, go, do, read, write, first, then, after, every
```

Core patterns:

```text
First, I ___.
Then I ___.
In the afternoon, I ___.
In the evening, I ___.
```

Output:

```text
Write 6-8 sentences describing one normal day.
```

Picture scene:

```text
A full normal-day scene with home, school or work, study, food, and evening rest.
```

## Week 4 Theme

Title:

```text
Food, Shopping & Needs
```

Goal:

```text
Say what you want, what you need, what you buy, and how to ask for simple help.
```

Final output target:

```text
I want some water.
I need food.
I go to a shop.
I get bread and milk.
The food is good.
I ask for help.
I have enough money.
```

### Day 22: Food and Drink

Goal:

```text
Name simple food and drink and say what you have.
```

Suggested new words:

```text
food, drink, bread, milk, rice, fruit, tea, eat
```

Core patterns:

```text
I have ___.
I eat ___.
I drink ___.
```

Output:

```text
Write 4-5 sentences about food and drink you have today.
```

Picture scene:

```text
A simple table with bread, milk, fruit, and tea.
```

### Day 23: Want and Need

Goal:

```text
Say what you want and what you need.
```

Suggested new words:

```text
need, some, more, enough, help, problem, please, ready
```

Core patterns:

```text
I want some ___.
I need ___.
I have enough ___.
```

Output:

```text
Write 5-6 sentences about things you want and need.
```

Picture scene:

```text
A learner at a table needing water, food, and help with a simple problem.
```

### Day 24: Buying Simple Things

Goal:

```text
Describe getting simple things in a shop.
```

Suggested new words:

```text
shop, buy, sell, get, thing, store, bread, cup
```

Core patterns:

```text
I go to the shop.
I buy ___.
I get ___ from the shop.
```

Output:

```text
Write 5-6 sentences about buying simple things.
```

Picture scene:

```text
A simple shop counter with a learner buying food and a small object.
```

### Day 25: Money and Price

Goal:

```text
Talk about money and simple prices without complex numbers.
```

Suggested new words:

```text
price, cheap, dear, pay, cost, change, little, much
```

Core patterns:

```text
I pay for ___.
The price is ___.
It costs much/little.
```

Output:

```text
Write 5-6 sentences about paying for something.
```

Picture scene:

```text
A learner paying with simple money at a shop counter.
```

### Day 26: Asking for Help

Goal:

```text
Ask for simple help in daily life.
```

Suggested new words:

```text
ask, answer, help, please, find, show, bring, tell
```

Core patterns:

```text
Please help me.
Can you ___?
I ask for ___.
```

Output:

```text
Write 4-6 sentences asking for help in a simple situation.
```

Picture scene:

```text
A learner asking another person for help finding something in a shop or room.
```

### Day 27: More, Enough, and Good

Goal:

```text
Say if something is enough, more is needed, or something is good.
```

Suggested new words:

```text
more, enough, less, full, empty, taste, good, bad
```

Core patterns:

```text
I need more ___.
I have enough ___.
The ___ is good.
```

Output:

```text
Write 5-6 sentences about food, drink, and what is enough.
```

Picture scene:

```text
A meal table with full and empty cups, food, and a learner showing what is enough.
```

### Day 28: Week 4 Check

Goal:

```text
Describe a meal or shopping scene with wants, needs, and simple requests.
```

Suggested review words:

```text
food, drink, bread, milk, buy, shop, money, price, want, need, help, more, enough, good
```

Core patterns:

```text
I want ___.
I need ___.
I buy ___.
Please help me ___.
```

Output:

```text
Write 6-8 sentences about a meal or shopping scene.
```

Picture scene:

```text
A learner buying food and drink at a small shop, then sitting at a simple meal table.
```

## Word Flashcard Images

All new Week 3-4 words should have image-backed flashcards.

Rules:

- Use `512x512` PNG images.
- Use the same approved V1.8 simple cartoon style.
- Use concrete images for visible objects.
- Use small scenes for actions, qualities, and abstract daily-life ideas.
- Use relation-style images only when the meaning depends on position.
- Use grammar cards only for structure words that cannot be shown clearly without a keyword.
- Do not include Chinese text.
- Do not include English labels except for grammar cards.

The word image metadata should continue using `visualStyle` and `labelPolicy`.

## Picture Describe Images

Each new day gets one picture-description scene.

Rules:

- The scene should be concrete and describable with that day's target words and patterns.
- It should avoid readable text, signs, logos, and Chinese.
- It should be simpler than a story illustration but richer than a word flashcard.
- It should give learners enough visual information to produce 4-8 Basic English sentences.
- It should match the existing picture describe task format.

## Scenario Capabilities

V1.9 should add capabilities for Week 3-4 so the Me page continues to express progress as "I can..." abilities.

Suggested Week 3 capabilities:

```text
I can describe my morning.
I can say where I go every day.
I can say what I do with common things.
I can describe one normal day in order.
```

Suggested Week 4 capabilities:

```text
I can talk about food and drink.
I can say what I want and need.
I can buy simple things.
I can ask for help.
I can describe a meal or shopping scene.
```

## Data and Architecture

Expected content files:

- `src/content/week3.ts`
- `src/content/week4.ts`
- Updates to `src/content/course.ts`
- Updates to `src/content/scenarioCapabilities.ts`
- Updates to `src/content/sceneGoals.ts`
- Updates to `src/content/sceneRemixTasks.ts`
- Updates to `src/content/pictureDescribeTasks.ts`
- Updates to `src/content/wordFlashcardImages.ts`

Expected asset folders:

- `src/assets/word-flashcards/`
- `src/assets/picture-describe/`

No new domain model is required unless current validation cannot express Week 3-4 requirements.

## Testing

Update tests so they prove:

- The course includes exactly 4 weeks and 28 days after V1.9.
- Week 3 and Week 4 days have valid word, pattern, exercise, output, scene remix, and picture references.
- Every course word has a word flashcard image.
- Every word image has a valid visual style and label policy.
- Every Week 3-4 day has a picture describe task.
- Scenario capabilities reference valid day IDs.
- Today can select and render a Week 3 day and a Week 4 day.
- Course completion copy still works on Day 28.

Run:

- `npm test`
- `npm run build`

E2E coverage is recommended for one Week 3 day and one Week 4 day if the existing E2E setup is active.

## Acceptance Criteria

V1.9 is complete when:

- The course has 4 playable weeks and 28 playable days.
- Week 3 teaches daily routine, time, and action order.
- Week 4 teaches food, shopping, needs, and simple requests.
- Existing Today flow works unchanged for all new days.
- All new words have approved `512x512` word images.
- All new days have approved picture describe images.
- Me page capabilities include Week 3-4 abilities.
- Tests and build pass.

## Risks

- Image generation volume is high. Use sample-first review for new visual patterns if style drift appears.
- Week 3-4 may introduce words outside strict Basic English if unchecked. Prefer Basic English-compatible words and simple operators where possible.
- Content density can become too high. Keep daily output focused on one life task.

