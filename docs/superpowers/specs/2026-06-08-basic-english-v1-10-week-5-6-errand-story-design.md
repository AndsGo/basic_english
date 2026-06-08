# Basic English V1.10 Week 5-6 Errand Story Design

## Goal

V1.10 extends the course from 4 playable weeks to 6 playable weeks.

The product goal remains:

> A learner can use Basic English to describe common daily-life scenes and express simple personal ideas.

Weeks 5-6 focus on going out for errands. The learner should be able to describe a complete outside task, then describe common problems and polite requests while outside.

## Decisions

- Add Week 5 and Week 6 as full playable course content.
- Use an errand story line across Week 5-6.
- Keep the existing Today learning flow.
- Add light story guidance in the output experience for Week 5-6.
- Add word flashcard images for every new word.
- Add one picture-description scene image for every new day.
- Keep the English-first environment. Chinese help remains optional through the existing setting.

## Scope

### Build in V1.10

- Week 5 content: 7 days, Day 29-35.
- Week 6 content: 7 days, Day 36-42.
- About 40 new words total, with heavy reuse of Week 3-4 words.
- New patterns for errands, directions, transport, problems, and polite help.
- Daily drills and translation exercises for all new days.
- Daily output tasks for all new days.
- Daily scene remix tasks for all new days.
- Daily picture describe tasks and images for all new days.
- Word flashcard images for all new words.
- Scenario capabilities for Week 5-6.
- Course validation updates for exactly 6 weeks and 42 days.
- Tests for content references, images, Today rendering, and Words coverage.

### Do Not Build in V1.10

- Conversation engine.
- Voice recording.
- Pronunciation scoring.
- AI correction.
- Backend or cloud sync.
- Cross-day automatic story aggregation.
- New navigation pages.
- A visual map or route game.
- Full 12-week content.

## Today Flow

V1.10 keeps the current Today sequence:

```text
Review -> Words -> Patterns -> Drills -> Translate -> Scene Remix -> Picture -> Output
```

The output step receives light story guidance for Week 5-6. This should be implemented with content data or optional metadata, not a new task type.

## Story Experience

Week 5-6 use a light story line:

- Ordinary days ask for 1-2 reusable story sentences inside the normal output task.
- Recap days ask the learner to combine the week into a 6-8 sentence story.
- The story should be personal where possible: the learner writes about their own place, thing, route, or problem.

Suggested optional output metadata:

```ts
storyMode?: 'sentence' | 'recap';
storyPrompt?: string;
```

Rules:

- If `storyMode` is absent, Week 1-4 behavior must not change.
- If `storyMode` is `sentence`, the UI may show `Today story sentence`.
- If `storyMode` is `recap`, the UI may show `Story recap`.
- The feature must not require reading previous days' saved answers.
- Recap templates should be complete enough to work without automatic cross-day data.

## Content Density

Each ordinary new day should include:

- 5-7 new or focus words.
- 1-2 new patterns.
- 4-6 drill exercises.
- 1 translation exercise.
- 1 scene remix task.
- 1 picture describe task.
- 1 output task with story guidance.

Recap days should introduce few or no new words. They should reuse the week's words and focus on complete output.

## Reused Core Words

V1.10 should reuse these existing words heavily:

```text
go, road, bus, walk, with, shop, store, buy, pay, price, money,
ask, answer, help, please, find, show, tell, need, want, enough,
problem, before, after, first, then, next, last
```

## New Word Direction

Target about 40 new words total. Prefer Basic English-compatible words and simple high-frequency words. Before implementation, review the final list and replace weak candidates where a Basic English expression can work.

Suggested directions:

- Going out: `outside`, `station`, `stop`, `way`, `left`, `right`, `straight`, `near`, `far`
- Transport: `ride`, `wait`, `late`, `early`, `seat`, `ticket`
- Errands and shopping: `line`, `turn`, `counter`, `list`, `carry`
- Problems: `lost`, `repeat`, `understand`, `sorry`, `wrong`
- Politeness: `excuse`, `thank`, `thanks`, `again`

Some words may already exist in earlier weeks. The implementation should avoid duplicate word IDs.

## Basic English 850 Validation

V1.10 must add an automated content check for Ogden Basic English 850 compliance.

The validation should live with the existing content validation system:

- Add a source-controlled Basic English vocabulary allowlist, for example `src/content/basicEnglish850.ts`.
- Store normalized lowercase base words in the allowlist.
- Add `validateBasicEnglishVocabulary(course)` or an equivalent check called from `validateCourseContent`.
- Check each course word's `text`.
- Check learner-facing English strings where practical:
  - word examples
  - pattern titles, structures, and examples
  - exercise prompts, options, accepted answers, final sentences, and reference answers
  - output prompts and templates
  - scene goals, remix reference answers, and picture describe simple versions
- Ignore punctuation, casing, and simple allowed inflections:
  - plurals ending in `s`
  - regular past forms ending in `ed`
  - regular `ing` forms
  - simple adverbs ending in `ly` when the base quality is allowed
- Allow a small explicit product/course exception list only when needed for names or unavoidable UI/course words.

Validation output should be actionable:

```text
Non-Basic English word "ticket" in day-031 word ticket.
Non-Basic English word "errand" in day-029 output template.
```

Policy:

- V1.10 new course words must be in Ogden Basic English 850 or in the explicit exception list.
- If a proposed word is outside the list, prefer rewriting with allowed Basic English words.
- Exceptions must be rare and documented near the allowlist.
- The test should fail when a new word outside the allowlist is added without an exception.

Likely V1.10 word candidates that need review before implementation:

```text
errand, station, stop, ride, ticket, line, counter, lost, repeat,
understand, sorry, excuse, thanks
```

If these are outside the final allowlist, use simpler Basic English expressions where possible, such as:

```text
errand -> thing I need to do
station/stop -> place for the bus
ticket -> paper for the bus
line -> people waiting
lost -> I do not know the way
repeat -> say it again
understand -> get the idea / know what you say
thanks -> thank you
```

## Week 5 Theme

Title:

```text
Going Out for an Errand
```

Goal:

```text
Describe a complete errand from home to outside and back home.
```

Final output target:

```text
I go out because I need food.
I take my bag.
I walk to the bus stop.
I take the bus to the store.
I find bread and milk.
I wait in line and pay.
Then I carry the food home.
```

### Day 29: Getting Ready to Go Out

Goal:

```text
Say where you will go, why you go out, and what you take.
```

Focus words:

```text
outside, errand, plan, bag, list, carry, ready
```

Core patterns:

```text
I go out because ___.
I take my ___.
I am ready to ___.
```

Story sentence:

```text
I go out because I need ___.
```

Picture scene:

```text
A learner at home preparing a bag and a small shopping list before going out.
```

### Day 30: Walking to the Stop

Goal:

```text
Describe leaving home, walking on the road, and finding the stop or way.
```

Focus words:

```text
outside, road, way, stop, near, far, walk
```

Core patterns:

```text
I walk to ___.
The ___ is near/far.
I find the ___.
```

Story sentence:

```text
I walk to the bus stop.
```

Picture scene:

```text
A learner walking from home along a road toward a simple bus stop.
```

### Day 31: Taking the Bus

Goal:

```text
Say how you ride, wait, sit, and get off.
```

Focus words:

```text
bus, ride, wait, seat, ticket, get, stop
```

Core patterns:

```text
I wait for the bus.
I ride the bus to ___.
I get off at ___.
```

Story sentence:

```text
I take the bus to the store.
```

Picture scene:

```text
A learner waiting for or riding a bus, with no route numbers or readable signs.
```

### Day 32: Finding Things in the Store

Goal:

```text
Describe entering a store, finding things, and asking where things are.
```

Focus words:

```text
store, counter, find, list, left, right, straight
```

Core patterns:

```text
I look for ___.
The ___ is on the left/right.
Please show me ___.
```

Story sentence:

```text
I find ___ in the store.
```

Picture scene:

```text
A learner inside a store looking at shelves and asking a worker for help.
```

### Day 33: Waiting and Paying

Goal:

```text
Describe standing in line, taking a turn, paying, and getting change.
```

Focus words:

```text
line, turn, counter, pay, price, change, wait
```

Core patterns:

```text
I wait in line.
It is my turn.
I pay for ___.
```

Story sentence:

```text
I wait in line and pay for ___.
```

Picture scene:

```text
A learner waiting at a shop counter and paying for simple goods.
```

### Day 34: Coming Back Home

Goal:

```text
Describe carrying things back home and putting them away.
```

Focus words:

```text
carry, back, home, heavy, light, put, finish
```

Core patterns:

```text
I carry ___ home.
I come back home.
I put ___ on/in ___.
```

Story sentence:

```text
I carry the ___ back home.
```

Picture scene:

```text
A learner coming home with a bag and putting food or things on a table.
```

### Day 35: Week 5 Errand Story Recap

Goal:

```text
Tell a complete story about going out for an errand.
```

Review words:

```text
go, outside, bag, road, stop, bus, store, find, line, pay, carry, home
```

Core patterns:

```text
First, I ___.
Then I ___.
After that, I ___.
Last, I ___.
```

Story recap:

```text
Write 6-8 sentences: home -> road -> bus -> store -> pay -> home.
```

Picture scene:

```text
A full errand scene with home, road, bus stop, store, counter, and returning home.
```

## Week 6 Theme

Title:

```text
Problems Outside
```

Goal:

```text
Describe common problems outside and ask for help politely.
```

Final output target:

```text
I go out, but I have a problem.
I am lost.
I ask a person for help.
I say, Excuse me, can you help me?
The person tells me the way.
I understand and say thank you.
Then I go to the store.
```

### Day 36: Lost and Looking for the Way

Goal:

```text
Say that you are lost and ask for the way.
```

Focus words:

```text
lost, way, left, right, straight, ask, tell
```

Core patterns:

```text
I am lost.
Can you tell me the way?
Go straight/left/right.
```

Story sentence:

```text
I am lost, so I ask for the way.
```

Picture scene:

```text
A learner at a street corner asking a friendly person for directions, with no readable signs.
```

### Day 37: Late Bus and Not Enough Time

Goal:

```text
Describe waiting, being late, and not having enough time.
```

Focus words:

```text
late, early, wait, time, enough, bus, problem
```

Core patterns:

```text
The bus is late.
I do not have enough time.
I wait for ___.
```

Story sentence:

```text
The bus is late, and I do not have enough time.
```

Picture scene:

```text
A learner waiting at a bus stop and looking concerned, with no timetable text.
```

### Day 38: The Store Does Not Have It

Goal:

```text
Say that a thing is not in the store and ask for another thing.
```

Focus words:

```text
wrong, same, another, find, store, thing, need
```

Core patterns:

```text
I cannot find ___.
The store does not have ___.
Do you have another ___?
```

Story sentence:

```text
I cannot find ___ in the store.
```

Picture scene:

```text
A learner looking at an empty shelf area and asking a worker for another item.
```

### Day 39: Not Enough Money

Goal:

```text
Describe money and price problems.
```

Focus words:

```text
money, price, enough, cheap, dear, wrong, pay
```

Core patterns:

```text
I do not have enough money.
The price is too dear.
Is the price right?
```

Story sentence:

```text
I do not have enough money for ___.
```

Picture scene:

```text
A learner at a shop counter looking at money and a simple item, with no visible numbers.
```

### Day 40: I Do Not Understand

Goal:

```text
Say that you do not understand and politely ask someone to repeat.
```

Focus words:

```text
understand, repeat, again, sorry, tell, answer, please
```

Core patterns:

```text
I do not understand.
Please say it again.
Can you repeat that?
```

Story sentence:

```text
I do not understand, so I ask again.
```

Picture scene:

```text
A learner speaking politely with a worker or driver and asking them to repeat.
```

### Day 41: Asking Politely for Help

Goal:

```text
Use polite words when asking for help outside.
```

Focus words:

```text
excuse, sorry, thank, thanks, help, please, answer
```

Core patterns:

```text
Excuse me, can you help me?
Sorry, I have a problem.
Thank you for your help.
```

Story sentence:

```text
I ask for help and say thank you.
```

Picture scene:

```text
A learner politely asking a person for help outside a store or stop.
```

### Day 42: Week 6 Problem Story Recap

Goal:

```text
Tell a complete story about an outside problem and how you solved it.
```

Review words:

```text
lost, late, problem, help, ask, tell, understand, repeat, money, price, thanks
```

Core patterns:

```text
I have a problem.
I ask for help.
The person tells me ___.
I say thank you.
```

Story recap:

```text
Write 6-8 sentences: problem -> ask -> answer/help -> action -> result -> thanks.
```

Picture scene:

```text
A complete problem-solving scene outside with a learner asking for help and continuing the errand.
```

## Word Flashcard Images

All new words must have image-backed flashcards.

Rules:

- Use `512x512` PNG images.
- Follow `AGENTS.md` image rules.
- Use concrete images for visible objects.
- Use small scenes for actions, qualities, and daily-life ideas.
- Use relation-style images only when position is the meaning.
- Use grammar cards only for structure words that cannot be shown clearly without a keyword.
- Do not include Chinese text.
- Do not include English labels except for grammar cards.

The word image metadata must continue using `visualStyle` and `labelPolicy`.

## Picture Describe Images

Each new day gets one picture-description scene.

Rules:

- One complete daily-life scene, not a collage or comic strip.
- Concrete and easy to describe with the day's target words and patterns.
- No readable signs, logos, Chinese, labels, arrows, or speech bubbles.
- Same warm polished cartoon style as accepted Week 1-4 assets.
- Rich enough for 4-8 Basic English sentences.

## Scenario Capabilities

Suggested Week 5 capabilities:

```text
I can get ready to go out.
I can describe walking to a stop.
I can describe taking a bus.
I can find things in a store.
I can pay and come back home.
I can tell a complete errand story.
```

Suggested Week 6 capabilities:

```text
I can say I am lost.
I can describe a late bus or time problem.
I can ask for another thing in a store.
I can talk about not having enough money.
I can ask someone to repeat.
I can ask for help politely.
I can tell a problem-solving story.
```

## Data and Architecture

Expected content files:

- `src/content/week5.ts`
- `src/content/week6.ts`
- Updates to `src/content/course.ts`
- Updates to `src/content/scenarioCapabilities.ts`
- Updates to `src/content/sceneGoals.ts`
- Updates to `src/content/sceneRemixTasks.ts`
- Updates to `src/content/pictureDescribeTasks.ts`
- Updates to `src/content/wordFlashcardImages.ts`

Expected domain/UI updates:

- Optional `storyMode` and `storyPrompt` fields on output tasks if existing prompts/templates are not enough.
- Output UI displays story labels only when these fields are present.
- Existing Week 1-4 output behavior remains unchanged.

Expected asset folders:

- `src/assets/word-flashcards/`
- `src/assets/picture-describe/`

No backend, new route, or new storage model is required.

## Testing

Update tests so they prove:

- The course includes exactly 6 weeks and 42 days.
- V1.10 adds a Basic English 850 allowlist and validates new course content against it.
- The validator reports actionable errors for non-850 words without explicit exceptions.
- Week 5 and Week 6 days have valid word, pattern, exercise, output, scene remix, and picture references.
- Every course word has a word flashcard image.
- Every word image has a valid `visualStyle` and `labelPolicy`.
- Every Week 5-6 day has a picture describe task and image.
- Scenario capabilities reference valid day IDs.
- Today can render a Week 5 ordinary day and a Week 6 recap day.
- Story UI appears for Week 5-6 output tasks when metadata exists.
- Story UI does not appear for Week 1-4 tasks without metadata.
- Words page does not show missing-image fallback for real course flashcards.
- Course completion copy still works on Day 42.

Run:

```text
npm test -- --run --exclude ".worktrees/**"
npm run build
```

Recommended E2E:

- One Week 5 ordinary day.
- One Week 6 recap day.

## Acceptance Criteria

V1.10 is complete when:

- The course has 6 playable weeks and 42 playable days.
- Week 5 teaches a complete outside errand story.
- Week 6 teaches outside problems and polite help.
- `validateContent` checks course vocabulary against a Basic English 850 allowlist and fails on unapproved non-850 words.
- Existing Today flow works for all new days.
- Week 5-6 output tasks visibly support story sentence or story recap guidance.
- All new words have approved `512x512` word images.
- All new days have approved picture describe images.
- Me page capabilities include Week 5-6 abilities.
- Tests and build pass.

## Risks

- Some proposed words may be outside strict Ogden 850. The final word list should be reviewed before implementation and simplified where practical.
- Image generation volume is high. Generate a small sample first, create contact sheets, and continue by batch after style review.
- Story UI can grow into a larger journaling system. V1.10 must stay limited to light guidance in the existing output step.
- Recap days should work without cross-day answer aggregation, so templates must be self-contained.
