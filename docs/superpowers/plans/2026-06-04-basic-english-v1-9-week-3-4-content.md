# Basic English V1.9 Week 3-4 Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full playable Week 3 and Week 4 content, including words, patterns, exercises, scene remix tasks, picture describe tasks, scenario capabilities, and image assets.

**Architecture:** Reuse the existing content-first architecture. Add `week3.ts` and `week4.ts`, then wire them through `course.ts` and existing content maps. Keep the Today flow unchanged and validate the expansion through content tests plus focused component tests.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, local PNG assets, existing content validators.

---

## File Structure

- Create `src/content/week3.ts`: Week 3 words, patterns, and Day 15-21 course content.
- Create `src/content/week4.ts`: Week 4 words, patterns, and Day 22-28 course content.
- Modify `src/content/course.ts`: Import and include Week 3-4 words, patterns, and weeks; bump `contentVersion`.
- Modify `src/content/scenarioCapabilities.ts`: Add Week 3-4 capability unlocks.
- Modify `src/content/sceneGoals.ts`: Add scene goals for Day 15-28 if the existing map does not already derive them from day content.
- Modify `src/content/sceneRemixTasks.ts`: Add one or more scene remix tasks for each Day 15-28.
- Modify `src/content/pictureDescribeTasks.ts`: Import 14 new picture scene images and add Day 15-28 tasks.
- Modify `src/content/wordFlashcardImages.ts`: Import all new word images and add metadata for all new words.
- Modify `src/content/validateContent.test.ts`: Add failing tests that define V1.9 coverage expectations.
- Modify `src/components/TodayPage.test.tsx`: Add focused rendering/selection tests for Week 3, Week 4, and Day 28 completion copy.
- Add `src/assets/picture-describe/day-015-morning-routine.png` through `day-028-meal-shopping-check.png`.
- Add word flashcard PNGs under `src/assets/word-flashcards/` for each new word introduced in Week 3-4.

Do not add new pages, new task types, or new domain models unless a current validator cannot express an explicit V1.9 requirement.

## Canonical V1.9 Content Outline

Use this outline when writing `week3.ts` and `week4.ts`.

### Week 3 Words

```ts
export const week3Words: Word[] = [
  { id: 'morning', text: 'morning', category: 'general_thing', definition: 'the early part of the day', chinese: '早上', example: 'I get up in the morning.', weekIntroduced: 3, tags: ['time', 'routine'] },
  { id: 'get', text: 'get', category: 'operation', definition: 'to come to have or reach something', chinese: '得到；到达', example: 'I get up in the morning.', weekIntroduced: 3, tags: ['action'] },
  { id: 'up', text: 'up', category: 'structure', definition: 'toward a higher place or out of bed', chinese: '向上；起身', example: 'I get up.', weekIntroduced: 3, tags: ['action'] },
  { id: 'wash', text: 'wash', category: 'operation', definition: 'to make clean with water', chinese: '洗', example: 'I wash my face.', weekIntroduced: 3, tags: ['routine'] },
  { id: 'face', text: 'face', category: 'picturable_thing', definition: 'the front part of the head', chinese: '脸', example: 'I wash my face.', weekIntroduced: 3, tags: ['body'] },
  { id: 'water', text: 'water', category: 'general_thing', definition: 'clear liquid people drink and use for washing', chinese: '水', example: 'I drink water.', weekIntroduced: 3, tags: ['daily'] },
  { id: 'put', text: 'put', category: 'operation', definition: 'to move something to a place', chinese: '放', example: 'I put my book in my bag.', weekIntroduced: 3, tags: ['action'] },
  { id: 'clothes', text: 'clothes', category: 'general_thing', definition: 'things people wear', chinese: '衣服', example: 'I put on my clothes.', weekIntroduced: 3, tags: ['daily'] },
  { id: 'go', text: 'go', category: 'operation', definition: 'to move from one place to another', chinese: '去', example: 'I go to school.', weekIntroduced: 3, tags: ['movement'] },
  { id: 'school', text: 'school', category: 'general_thing', definition: 'a place where people study', chinese: '学校', example: 'I go to school.', weekIntroduced: 3, tags: ['place'] },
  { id: 'work', text: 'work', category: 'operation', definition: 'to do a job or useful action', chinese: '工作', example: 'I go to work.', weekIntroduced: 3, tags: ['daily'] },
  { id: 'take', text: 'take', category: 'operation', definition: 'to carry or bring something with you', chinese: '带；拿', example: 'I take my bag.', weekIntroduced: 3, tags: ['action'] },
  { id: 'road', text: 'road', category: 'picturable_thing', definition: 'a way for walking or travel', chinese: '路', example: 'I walk on the road.', weekIntroduced: 3, tags: ['place'] },
  { id: 'bus', text: 'bus', category: 'picturable_thing', definition: 'a large vehicle for many people', chinese: '公交车', example: 'I go by bus.', weekIntroduced: 3, tags: ['travel'] },
  { id: 'walk', text: 'walk', category: 'operation', definition: 'to move on foot', chinese: '走路', example: 'I walk to school.', weekIntroduced: 3, tags: ['movement'] },
  { id: 'with', text: 'with', category: 'structure', definition: 'together with another person or thing', chinese: '和；带着', example: 'I go with my friend.', weekIntroduced: 3, tags: ['structure'] },
  { id: 'do', text: 'do', category: 'operation', definition: 'to perform an action', chinese: '做', example: 'I do my work.', weekIntroduced: 3, tags: ['action'] },
  { id: 'make', text: 'make', category: 'operation', definition: 'to create or prepare something', chinese: '做；制作', example: 'I make food.', weekIntroduced: 3, tags: ['action'] },
  { id: 'open', text: 'open', category: 'operation', definition: 'to move something so it is not closed', chinese: '打开', example: 'I open the book.', weekIntroduced: 3, tags: ['action'] },
  { id: 'close', text: 'close', category: 'operation', definition: 'to shut something', chinese: '关闭', example: 'I close the door.', weekIntroduced: 3, tags: ['action'] },
  { id: 'give', text: 'give', category: 'operation', definition: 'to let another person have something', chinese: '给', example: 'I give a book to my friend.', weekIntroduced: 3, tags: ['action'] },
  { id: 'see', text: 'see', category: 'operation', definition: 'to use your eyes', chinese: '看见', example: 'I see a bus.', weekIntroduced: 3, tags: ['action'] },
  { id: 'read', text: 'read', category: 'operation', definition: 'to get meaning from written words', chinese: '读', example: 'I read a book.', weekIntroduced: 3, tags: ['study'] },
  { id: 'write', text: 'write', category: 'operation', definition: 'to make words with a pen or keyboard', chinese: '写', example: 'I write on paper.', weekIntroduced: 3, tags: ['study'] },
  { id: 'afternoon', text: 'afternoon', category: 'general_thing', definition: 'the part of the day after noon', chinese: '下午', example: 'I study in the afternoon.', weekIntroduced: 3, tags: ['time'] },
  { id: 'evening', text: 'evening', category: 'general_thing', definition: 'the late part of the day before night', chinese: '晚上', example: 'I am at home in the evening.', weekIntroduced: 3, tags: ['time'] },
  { id: 'night', text: 'night', category: 'general_thing', definition: 'the dark part of the day', chinese: '夜晚', example: 'I sleep at night.', weekIntroduced: 3, tags: ['time'] },
  { id: 'time', text: 'time', category: 'general_thing', definition: 'when something happens', chinese: '时间', example: 'This is study time.', weekIntroduced: 3, tags: ['time'] },
  { id: 'before', text: 'before', category: 'structure', definition: 'earlier than another time or action', chinese: '在……之前', example: 'I wash before I go.', weekIntroduced: 3, tags: ['time'] },
  { id: 'after', text: 'after', category: 'structure', definition: 'later than another time or action', chinese: '在……之后', example: 'I study after food.', weekIntroduced: 3, tags: ['time'] },
  { id: 'sleep', text: 'sleep', category: 'operation', definition: 'to rest with eyes closed at night', chinese: '睡觉', example: 'I sleep at night.', weekIntroduced: 3, tags: ['routine'] },
  { id: 'meal', text: 'meal', category: 'general_thing', definition: 'food eaten at one time', chinese: '一餐', example: 'I have a meal.', weekIntroduced: 3, tags: ['food'] },
  { id: 'first', text: 'first', category: 'structure', definition: 'before all others in order', chinese: '首先', example: 'First, I open my book.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'then', text: 'then', category: 'structure', definition: 'after that', chinese: '然后', example: 'Then I write.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'next', text: 'next', category: 'structure', definition: 'coming after this one', chinese: '接着；下一个', example: 'Next, I close the book.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'last', text: 'last', category: 'structure', definition: 'after all others in order', chinese: '最后', example: 'Last, I put the book in my bag.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'start', text: 'start', category: 'operation', definition: 'to begin', chinese: '开始', example: 'I start my work.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'finish', text: 'finish', category: 'operation', definition: 'to come to the end of an action', chinese: '完成', example: 'I finish my work.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'same', text: 'same', category: 'quality', definition: 'not different', chinese: '相同的', example: 'I do the same thing every day.', weekIntroduced: 3, tags: ['quality'] },
  { id: 'order', text: 'order', category: 'general_thing', definition: 'the way things come one after another', chinese: '顺序', example: 'This is the order.', weekIntroduced: 3, tags: ['sequence'] },
  { id: 'always', text: 'always', category: 'structure', definition: 'at all times', chinese: '总是', example: 'I always study in the morning.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'often', text: 'often', category: 'structure', definition: 'many times', chinese: '经常', example: 'I often read.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'sometimes', text: 'sometimes', category: 'structure', definition: 'at some times but not always', chinese: '有时', example: 'I sometimes walk to school.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'never', text: 'never', category: 'structure', definition: 'not at any time', chinese: '从不', example: 'I never sleep at school.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'usually', text: 'usually', category: 'structure', definition: 'in the normal way or most times', chinese: '通常', example: 'I usually go by bus.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'again', text: 'again', category: 'structure', definition: 'one more time', chinese: '再次', example: 'I practice again.', weekIntroduced: 3, tags: ['frequency'] },
  { id: 'practice', text: 'practice', category: 'operation', definition: 'to do something again to get better', chinese: '练习', example: 'I practice English every day.', weekIntroduced: 3, tags: ['study'] },
  { id: 'habit', text: 'habit', category: 'general_thing', definition: 'something you do often or every day', chinese: '习惯', example: 'Study is a good habit.', weekIntroduced: 3, tags: ['routine'] },
];
```

### Week 4 Words

```ts
export const week4Words: Word[] = [
  { id: 'food', text: 'food', category: 'general_thing', definition: 'things people eat', chinese: '食物', example: 'I need food.', weekIntroduced: 4, tags: ['food'] },
  { id: 'drink', text: 'drink', category: 'operation', definition: 'to take liquid into the body', chinese: '喝；饮料', example: 'I drink water.', weekIntroduced: 4, tags: ['food'] },
  { id: 'bread', text: 'bread', category: 'picturable_thing', definition: 'food made from grain', chinese: '面包', example: 'I eat bread.', weekIntroduced: 4, tags: ['food'] },
  { id: 'milk', text: 'milk', category: 'general_thing', definition: 'white drink from cows or plants', chinese: '牛奶', example: 'I drink milk.', weekIntroduced: 4, tags: ['food'] },
  { id: 'rice', text: 'rice', category: 'general_thing', definition: 'small white or brown food grains', chinese: '米饭', example: 'I eat rice.', weekIntroduced: 4, tags: ['food'] },
  { id: 'fruit', text: 'fruit', category: 'general_thing', definition: 'sweet food from trees or plants', chinese: '水果', example: 'I have fruit.', weekIntroduced: 4, tags: ['food'] },
  { id: 'tea', text: 'tea', category: 'general_thing', definition: 'a warm drink made with leaves', chinese: '茶', example: 'I drink tea.', weekIntroduced: 4, tags: ['food'] },
  { id: 'eat', text: 'eat', category: 'operation', definition: 'to put food in the mouth and take it into the body', chinese: '吃', example: 'I eat food.', weekIntroduced: 4, tags: ['food'] },
  { id: 'need', text: 'need', category: 'operation', definition: 'to require something', chinese: '需要', example: 'I need water.', weekIntroduced: 4, tags: ['need'] },
  { id: 'some', text: 'some', category: 'structure', definition: 'an amount of something', chinese: '一些', example: 'I want some water.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'help', text: 'help', category: 'operation', definition: 'to make something easier for another person', chinese: '帮助', example: 'Please help me.', weekIntroduced: 4, tags: ['request'] },
  { id: 'problem', text: 'problem', category: 'general_thing', definition: 'something difficult that needs an answer', chinese: '问题；困难', example: 'I have a problem.', weekIntroduced: 4, tags: ['request'] },
  { id: 'please', text: 'please', category: 'structure', definition: 'a polite word used when asking', chinese: '请', example: 'Please help me.', weekIntroduced: 4, tags: ['request'] },
  { id: 'ready', text: 'ready', category: 'quality', definition: 'prepared for use or action', chinese: '准备好的', example: 'I am ready.', weekIntroduced: 4, tags: ['quality'] },
  { id: 'shop', text: 'shop', category: 'general_thing', definition: 'a place where people buy things', chinese: '商店', example: 'I go to the shop.', weekIntroduced: 4, tags: ['shopping'] },
  { id: 'buy', text: 'buy', category: 'operation', definition: 'to get something by paying money', chinese: '买', example: 'I buy bread.', weekIntroduced: 4, tags: ['shopping'] },
  { id: 'sell', text: 'sell', category: 'operation', definition: 'to give something for money', chinese: '卖', example: 'The shop sells food.', weekIntroduced: 4, tags: ['shopping'] },
  { id: 'store', text: 'store', category: 'general_thing', definition: 'a shop', chinese: '商店', example: 'I go to the store.', weekIntroduced: 4, tags: ['shopping'] },
  { id: 'price', text: 'price', category: 'general_thing', definition: 'the money needed to buy something', chinese: '价格', example: 'The price is good.', weekIntroduced: 4, tags: ['money'] },
  { id: 'cheap', text: 'cheap', category: 'quality', definition: 'costing little money', chinese: '便宜的', example: 'The bread is cheap.', weekIntroduced: 4, tags: ['money'] },
  { id: 'dear', text: 'dear', category: 'quality', definition: 'costing much money', chinese: '昂贵的', example: 'The phone is dear.', weekIntroduced: 4, tags: ['money'] },
  { id: 'pay', text: 'pay', category: 'operation', definition: 'to give money for something', chinese: '支付', example: 'I pay for food.', weekIntroduced: 4, tags: ['money'] },
  { id: 'cost', text: 'cost', category: 'operation', definition: 'to have a price', chinese: '花费', example: 'It costs little.', weekIntroduced: 4, tags: ['money'] },
  { id: 'change', text: 'change', category: 'general_thing', definition: 'money returned after paying', chinese: '零钱；改变', example: 'I get change.', weekIntroduced: 4, tags: ['money'] },
  { id: 'little', text: 'little', category: 'quality', definition: 'small in amount', chinese: '少的；小的', example: 'It costs little.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'much', text: 'much', category: 'quality', definition: 'great in amount', chinese: '多的', example: 'It costs much.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'ask', text: 'ask', category: 'operation', definition: 'to say a question or request', chinese: '问；请求', example: 'I ask for help.', weekIntroduced: 4, tags: ['request'] },
  { id: 'answer', text: 'answer', category: 'general_thing', definition: 'what is said after a question', chinese: '回答', example: 'I have an answer.', weekIntroduced: 4, tags: ['request'] },
  { id: 'find', text: 'find', category: 'operation', definition: 'to get or see something after looking', chinese: '找到', example: 'I find my bag.', weekIntroduced: 4, tags: ['request'] },
  { id: 'show', text: 'show', category: 'operation', definition: 'to let someone see something', chinese: '展示', example: 'Please show me the book.', weekIntroduced: 4, tags: ['request'] },
  { id: 'bring', text: 'bring', category: 'operation', definition: 'to take something to a person or place', chinese: '带来', example: 'Please bring water.', weekIntroduced: 4, tags: ['request'] },
  { id: 'tell', text: 'tell', category: 'operation', definition: 'to give information with words', chinese: '告诉', example: 'Please tell me.', weekIntroduced: 4, tags: ['request'] },
  { id: 'less', text: 'less', category: 'quality', definition: 'smaller in amount', chinese: '更少的', example: 'I need less food.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'full', text: 'full', category: 'quality', definition: 'having no empty space', chinese: '满的', example: 'The cup is full.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'empty', text: 'empty', category: 'quality', definition: 'with nothing inside', chinese: '空的', example: 'The cup is empty.', weekIntroduced: 4, tags: ['amount'] },
  { id: 'taste', text: 'taste', category: 'operation', definition: 'to sense food or drink in the mouth', chinese: '品尝；味道', example: 'The food tastes good.', weekIntroduced: 4, tags: ['food'] },
  { id: 'bad', text: 'bad', category: 'quality', definition: 'not good', chinese: '坏的；不好的', example: 'The food is bad.', weekIntroduced: 4, tags: ['quality'] },
];
```

Reuse existing words instead of duplicating them when the spec lists `more`, `enough`, `thing`, `bread`, `cup`, `good`, `money`, `want`, or `water` after the first introduction.

## Task 1: Add Failing V1.9 Content Coverage Tests

**Files:**
- Modify: `src/content/validateContent.test.ts`
- Modify: `src/components/TodayPage.test.tsx`

- [ ] **Step 1: Add course-level V1.9 tests**

Add these tests inside `src/content/validateContent.test.ts`, near the existing `basicEnglishCourse` content tests:

```ts
it('includes playable Week 3 and Week 4 content for V1.9', () => {
  const result = validateCourseContent(basicEnglishCourse);

  expect(result.errors).toEqual([]);
  expect(basicEnglishCourse.weeks).toHaveLength(4);
  expect(basicEnglishCourse.weeks.map((week) => week.days.length)).toEqual([7, 7, 7, 7]);
  expect(basicEnglishCourse.weeks[2]).toMatchObject({
    id: 'week-03',
    number: 3,
    title: 'Daily Routine & Time',
  });
  expect(basicEnglishCourse.weeks[3]).toMatchObject({
    id: 'week-04',
    number: 4,
    title: 'Food, Shopping & Needs',
  });
  expect(basicEnglishCourse.weeks[2].days[0]).toMatchObject({ id: 'day-015', dayNumber: 15 });
  expect(basicEnglishCourse.weeks[3].days[6]).toMatchObject({ id: 'day-028', dayNumber: 28 });
});

it('gives every Week 3 and Week 4 day a complete Today content set', () => {
  const newDays = basicEnglishCourse.weeks.slice(2).flatMap((week) => week.days);

  for (const day of newDays) {
    const translationCount = day.exercises.filter((exercise) => exercise.type === 'translation').length;

    expect(day.wordIds.length, `${day.id} word count`).toBeGreaterThanOrEqual(6);
    expect(day.patternIds.length, `${day.id} pattern count`).toBeGreaterThanOrEqual(1);
    expect(day.exercises.length, `${day.id} exercise count`).toBeGreaterThanOrEqual(5);
    expect(translationCount, `${day.id} translation count`).toBeGreaterThanOrEqual(1);
    expect(day.outputTask.requiredSentenceCount, `${day.id} output sentences`).toBeGreaterThanOrEqual(4);
    expect(sceneRemixTasksByDayId[day.id]?.length, `${day.id} remix task`).toBeGreaterThanOrEqual(1);
    expect(pictureDescribeTasksByDayId[day.id], `${day.id} picture task`).toBeDefined();
  }
});

it('adds image-backed flashcards for every Week 3 and Week 4 word', () => {
  const newWords = basicEnglishCourse.words.filter((word) => word.weekIntroduced === 3 || word.weekIntroduced === 4);

  expect(newWords.length).toBeGreaterThanOrEqual(70);

  for (const word of newWords) {
    expect(wordFlashcardImages[word.id], `${word.id} image`).toBeDefined();
    expect(wordImageVisualStyleByWordId[word.id], `${word.id} visual style`).toBeDefined();
  }
});

it('keeps Day 28 as the course completion day', () => {
  const allDays = basicEnglishCourse.weeks.flatMap((week) => week.days);

  expect(allDays.at(-1)?.id).toBe('day-028');
  expect(allDays.at(-1)?.weeklyCheckRubric).toBeDefined();
});
```

- [ ] **Step 2: Add Today rendering tests for Week 3 and Week 4**

Add these tests to `src/components/TodayPage.test.tsx` near existing day-selection or course-completion tests:

```tsx
it('renders a Week 3 Today lesson without changing the existing flow', async () => {
  const repository = createTestRepository({
    dayProgress: [
      {
        ...startDay('day-015', basicEnglishCourse.contentVersion, '2026-06-04T00:00:00.000Z'),
        currentStep: 'words',
      },
    ],
  });

  renderWithSpeech(<TodayPage course={basicEnglishCourse} repository={repository} selectedDayId="day-015" />);

  expect(await screen.findByRole('heading', { name: /Morning Routine/i })).toBeInTheDocument();
  expect(screen.getByText(/Week 3 \/ Day 15/i)).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Words');
  expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Picture');
});

it('renders a Week 4 Today lesson without changing the existing flow', async () => {
  const repository = createTestRepository({
    dayProgress: [
      {
        ...startDay('day-022', basicEnglishCourse.contentVersion, '2026-06-04T00:00:00.000Z'),
        currentStep: 'words',
      },
    ],
  });

  renderWithSpeech(<TodayPage course={basicEnglishCourse} repository={repository} selectedDayId="day-022" />);

  expect(await screen.findByRole('heading', { name: /Food and Drink/i })).toBeInTheDocument();
  expect(screen.getByText(/Week 4 \/ Day 22/i)).toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Scene Remix');
  expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Output');
});
```

If `TodayPage` does not expose `selectedDayId` as a prop in the current test helper, use the existing day-selection helper in the file instead of changing production behavior.

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/TodayPage.test.tsx
```

Expected: FAIL because Week 3-4 files, course wiring, picture tasks, remix tasks, and word images do not exist yet.

- [ ] **Step 4: Commit failing tests**

```bash
git add src/content/validateContent.test.ts src/components/TodayPage.test.tsx
git commit -m "test: define v1.9 week 3-4 coverage"
```

## Task 2: Add Week 3 Course Content

**Files:**
- Create: `src/content/week3.ts`
- Modify: `src/content/course.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Create `week3.ts` with words and patterns**

Create `src/content/week3.ts`. Copy the full `week3Words` array from the Canonical V1.9 Content Outline section into the file before the `week3Patterns` array.

```ts
import type { Pattern, Week, Word } from '../domain/types';

export const week3Words: Word[] = [
  { id: 'morning', text: 'morning', category: 'general_thing', definition: 'the early part of the day', chinese: '早上', example: 'I get up in the morning.', weekIntroduced: 3, tags: ['time', 'routine'] },
  { id: 'get', text: 'get', category: 'operation', definition: 'to come to have or reach something', chinese: '得到；到达', example: 'I get up in the morning.', weekIntroduced: 3, tags: ['action'] },
  { id: 'up', text: 'up', category: 'structure', definition: 'toward a higher place or out of bed', chinese: '向上；起身', example: 'I get up.', weekIntroduced: 3, tags: ['action'] }
];

export const week3Patterns: Pattern[] = [
  { id: 'i-get-up-in-morning', title: 'I get up in the morning.', use: 'Say a morning action.', structure: 'I get up in the morning.', examples: ['I get up in the morning.'], slots: [] },
  { id: 'i-wash-my', title: 'I wash my ___.', use: 'Say what you wash.', structure: 'I wash my {thing}.', examples: ['I wash my face.', 'I wash my hands.'], slots: ['thing'] },
  { id: 'i-put-on-my', title: 'I put on my ___.', use: 'Say what clothes you put on.', structure: 'I put on my {thing}.', examples: ['I put on my clothes.', 'I put on my bag.'], slots: ['thing'] },
  { id: 'i-go-to', title: 'I go to ___.', use: 'Say where you go.', structure: 'I go to {place}.', examples: ['I go to school.', 'I go to work.'], slots: ['place'] },
  { id: 'i-take-my', title: 'I take my ___.', use: 'Say what you carry with you.', structure: 'I take my {thing}.', examples: ['I take my bag.', 'I take my book.'], slots: ['thing'] },
  { id: 'i-go-with', title: 'I go with ___.', use: 'Say who goes with you.', structure: 'I go with {person}.', examples: ['I go with my friend.', 'I go with a student.'], slots: ['person'] },
  { id: 'i-use-to', title: 'I use ___ to ___.', use: 'Say what thing helps an action.', structure: 'I use {thing} to {action}.', examples: ['I use a pen to write.', 'I use water to wash.'], slots: ['thing', 'action'] },
  { id: 'i-open-the', title: 'I open the ___.', use: 'Say what you open.', structure: 'I open the {thing}.', examples: ['I open the book.', 'I open the door.'], slots: ['thing'] },
  { id: 'i-give-to', title: 'I give ___ to ___.', use: 'Say giving.', structure: 'I give {thing} to {person}.', examples: ['I give a book to my friend.', 'I give water to a student.'], slots: ['thing', 'person'] },
  { id: 'in-the-time-i', title: 'In the ___, I ___.', use: 'Say what you do at a time of day.', structure: 'In the {time}, I {action}.', examples: ['In the morning, I get up.', 'In the evening, I read.'], slots: ['time', 'action'] },
  { id: 'first-then-after', title: 'First, I ___. Then I ___.', use: 'Put actions in order.', structure: 'First, I {firstAction}. Then I {secondAction}.', examples: ['First, I open the book. Then I read.', 'First, I wash. Then I go.'], slots: ['firstAction', 'secondAction'] },
  { id: 'i-often', title: 'I often ___.', use: 'Say a repeated action.', structure: 'I often {action}.', examples: ['I often read.', 'I often walk to school.'], slots: ['action'] },
  { id: 'i-sometimes', title: 'I sometimes ___.', use: 'Say an action that happens at some times.', structure: 'I sometimes {action}.', examples: ['I sometimes walk.', 'I sometimes drink tea.'], slots: ['action'] },
  { id: 'i-practice-every-day', title: 'I practice ___ every day.', use: 'Say a daily practice habit.', structure: 'I practice {thing} every day.', examples: ['I practice English every day.', 'I practice writing every day.'], slots: ['thing'] },
];
```

The snippet above shows the file shape only. The implementation must include all 48 Week 3 word objects listed in the Canonical V1.9 Content Outline, not only the first three examples.

- [ ] **Step 2: Add Day 15-21 content**

In the same file, add `export const week3: Week = {` with all Day 15-21 objects below and close the object with `};`.

Use this exact day skeleton and fill each `exercises` array with 5-6 exercises matching existing Week 2 style:

```ts
export const week3: Week = {
  id: 'week-03',
  number: 3,
  title: 'Daily Routine & Time',
  goal: 'Say what you do every day, when you do it, and in what order.',
  days: [
    {
      id: 'day-015',
      weekId: 'week-03',
      dayNumber: 15,
      title: 'Morning Routine',
      goal: 'Describe simple things you do in the morning.',
      estimatedMinutes: 30,
      review: { wordCount: 6, patternCount: 3 },
      wordIds: ['morning', 'get', 'up', 'wash', 'face', 'water', 'put', 'clothes'],
      patternIds: ['i-get-up-in-morning', 'i-wash-my', 'i-put-on-my'],
      exercises: [
        { type: 'choice', id: 'day-015-choice-001', prompt: 'Which sentence is about morning?', options: ['I get up in the morning.', 'The book is under the table.', 'My key is important.'], correctOption: 'I get up in the morning.' },
        { type: 'fill_blank', id: 'day-015-fill-001', prompt: 'I wash my ___.', acceptedAnswers: ['face'] },
        { type: 'replacement', id: 'day-015-replace-001', patternId: 'i-wash-my', slotValues: { thing: 'face' }, referenceAnswer: 'I wash my face.' },
        { type: 'replacement', id: 'day-015-replace-002', patternId: 'i-put-on-my', slotValues: { thing: 'clothes' }, referenceAnswer: 'I put on my clothes.' },
        { type: 'sentence_order', id: 'day-015-order-001', tokens: ['up', 'get', 'I'], correctOrder: ['I', 'get', 'up'], finalSentence: 'I get up.' },
        { type: 'translation', id: 'day-015-translation-001', chinesePrompt: '我早上起床。我洗脸。', coreMeaningHint: 'Describe your morning.', suggestedPatternIds: ['i-get-up-in-morning', 'i-wash-my'], referenceAnswers: ['I get up in the morning. I wash my face.'] },
      ],
      outputTask: {
        id: 'day-015-output',
        topic: 'My Morning',
        prompts: ['What do you do in the morning?', 'What do you wash or put on?'],
        template: ['I get up in the morning.', 'I wash my ___.', 'I put on my ___.', 'I drink water.'],
        requiredSentenceCount: 4,
      },
    },
    {
      id: 'day-016',
      weekId: 'week-03',
      dayNumber: 16,
      title: 'Going to School or Work',
      goal: 'Say where you go and what you take with you.',
      estimatedMinutes: 30,
      review: { wordCount: 6, patternCount: 3 },
      wordIds: ['go', 'school', 'work', 'take', 'road', 'bus', 'walk', 'with', 'bag', 'book'],
      patternIds: ['i-go-to', 'i-take-my', 'i-go-with'],
      exercises: [
        { type: 'choice', id: 'day-016-choice-001', prompt: 'Which sentence says where you go?', options: ['I go to school.', 'I wash my face.', 'The cup is empty.'], correctOption: 'I go to school.' },
        { type: 'fill_blank', id: 'day-016-fill-001', prompt: 'I go to ___.', acceptedAnswers: ['school', 'work'] },
        { type: 'replacement', id: 'day-016-replace-001', patternId: 'i-go-to', slotValues: { place: 'school' }, referenceAnswer: 'I go to school.' },
        { type: 'replacement', id: 'day-016-replace-002', patternId: 'i-take-my', slotValues: { thing: 'bag' }, referenceAnswer: 'I take my bag.' },
        { type: 'sentence_order', id: 'day-016-order-001', tokens: ['my', 'take', 'I', 'book'], correctOrder: ['I', 'take', 'my', 'book'], finalSentence: 'I take my book.' },
        { type: 'translation', id: 'day-016-translation-001', chinesePrompt: '我去学校。我带着我的包。', coreMeaningHint: 'Say where you go and what you take.', suggestedPatternIds: ['i-go-to', 'i-take-my'], referenceAnswers: ['I go to school. I take my bag.'] },
      ],
      outputTask: {
        id: 'day-016-output',
        topic: 'Going Out',
        prompts: ['Where do you go?', 'What do you take?'],
        template: ['I go to ___.', 'I take my ___.', 'I walk on the road.', 'I go with ___.'],
        requiredSentenceCount: 4,
      },
    },
    {
      id: 'day-017',
      weekId: 'week-03',
      dayNumber: 17,
      title: 'Doing Useful Things',
      goal: 'Describe common actions with things.',
      estimatedMinutes: 30,
      review: { wordCount: 6, patternCount: 3 },
      wordIds: ['do', 'make', 'open', 'close', 'give', 'see', 'read', 'write', 'book', 'pen', 'paper'],
      patternIds: ['i-use-to', 'i-open-the', 'i-give-to'],
      exercises: [
        { type: 'choice', id: 'day-017-choice-001', prompt: 'Which sentence uses a thing to do an action?', options: ['I use a pen to write.', 'I am from China.', 'The bag is under the chair.'], correctOption: 'I use a pen to write.' },
        { type: 'fill_blank', id: 'day-017-fill-001', prompt: 'I ___ the book.', acceptedAnswers: ['open', 'close', 'read'] },
        { type: 'replacement', id: 'day-017-replace-001', patternId: 'i-use-to', slotValues: { thing: 'a pen', action: 'write' }, referenceAnswer: 'I use a pen to write.' },
        { type: 'replacement', id: 'day-017-replace-002', patternId: 'i-open-the', slotValues: { thing: 'book' }, referenceAnswer: 'I open the book.' },
        { type: 'sentence_order', id: 'day-017-order-001', tokens: ['read', 'I', 'book', 'a'], correctOrder: ['I', 'read', 'a', 'book'], finalSentence: 'I read a book.' },
        { type: 'translation', id: 'day-017-translation-001', chinesePrompt: '我用笔写字。我打开书。', coreMeaningHint: 'Describe actions with things.', suggestedPatternIds: ['i-use-to', 'i-open-the'], referenceAnswers: ['I use a pen to write. I open the book.'] },
      ],
      outputTask: {
        id: 'day-017-output',
        topic: 'Things I Do',
        prompts: ['What do you open, read, or write?', 'What do you use?'],
        template: ['I open the ___.', 'I read ___.', 'I use ___ to ___.', 'I give ___ to ___.'],
        requiredSentenceCount: 4,
      },
    },
    {
      id: 'day-018',
      weekId: 'week-03',
      dayNumber: 18,
      title: 'Time of Day',
      goal: 'Say what happens in the morning, afternoon, and evening.',
      estimatedMinutes: 30,
      review: { wordCount: 6, patternCount: 3 },
      wordIds: ['morning', 'afternoon', 'evening', 'night', 'time', 'before', 'after', 'sleep', 'meal', 'study'],
      patternIds: ['in-the-time-i'],
      exercises: [
        { type: 'choice', id: 'day-018-choice-001', prompt: 'Which sentence uses a time of day?', options: ['In the afternoon, I study.', 'The key is in the bag.', 'This is my cup.'], correctOption: 'In the afternoon, I study.' },
        { type: 'fill_blank', id: 'day-018-fill-001', prompt: 'In the ___, I sleep.', acceptedAnswers: ['night'] },
        { type: 'replacement', id: 'day-018-replace-001', patternId: 'in-the-time-i', slotValues: { time: 'morning', action: 'wash my face' }, referenceAnswer: 'In the morning, I wash my face.' },
        { type: 'replacement', id: 'day-018-replace-002', patternId: 'in-the-time-i', slotValues: { time: 'evening', action: 'read' }, referenceAnswer: 'In the evening, I read.' },
        { type: 'sentence_order', id: 'day-018-order-001', tokens: ['evening', 'the', 'read', 'I', 'In'], correctOrder: ['In', 'the', 'evening', 'I', 'read'], finalSentence: 'In the evening I read.' },
        { type: 'translation', id: 'day-018-translation-001', chinesePrompt: '早上我洗脸。晚上我读书。', coreMeaningHint: 'Use time-of-day words.', suggestedPatternIds: ['in-the-time-i'], referenceAnswers: ['In the morning, I wash my face. In the evening, I read.'] },
      ],
      outputTask: {
        id: 'day-018-output',
        topic: 'My Day Time',
        prompts: ['What do you do in the morning?', 'What do you do in the afternoon and evening?'],
        template: ['In the morning, I ___.', 'In the afternoon, I ___.', 'In the evening, I ___.', 'At night, I sleep.'],
        requiredSentenceCount: 5,
      },
    },
    {
      id: 'day-019',
      weekId: 'week-03',
      dayNumber: 19,
      title: 'First, Then, After',
      goal: 'Put daily actions in a simple order.',
      estimatedMinutes: 30,
      review: { wordCount: 7, patternCount: 3 },
      wordIds: ['first', 'then', 'next', 'last', 'start', 'finish', 'same', 'order', 'open', 'read', 'write', 'close'],
      patternIds: ['first-then-after'],
      exercises: [
        { type: 'choice', id: 'day-019-choice-001', prompt: 'Which word starts an ordered action?', options: ['First', 'Under', 'Dear'], correctOption: 'First' },
        { type: 'fill_blank', id: 'day-019-fill-001', prompt: 'First, I open the book. ___ I read.', acceptedAnswers: ['Then', 'then'] },
        { type: 'replacement', id: 'day-019-replace-001', patternId: 'first-then-after', slotValues: { firstAction: 'open the book', secondAction: 'read' }, referenceAnswer: 'First, I open the book. Then I read.' },
        { type: 'sentence_order', id: 'day-019-order-001', tokens: ['I', 'write', 'Then'], correctOrder: ['Then', 'I', 'write'], finalSentence: 'Then I write.' },
        { type: 'fill_blank', id: 'day-019-fill-002', prompt: 'Last, I ___ the book.', acceptedAnswers: ['close'] },
        { type: 'translation', id: 'day-019-translation-001', chinesePrompt: '首先，我打开书。然后我读。', coreMeaningHint: 'Put actions in order.', suggestedPatternIds: ['first-then-after'], referenceAnswers: ['First, I open the book. Then I read.'] },
      ],
      outputTask: {
        id: 'day-019-output',
        topic: 'Action Order',
        prompts: ['What do you do first?', 'What do you do next or last?'],
        template: ['First, I ___.', 'Then I ___.', 'Next, I ___.', 'Last, I ___.'],
        requiredSentenceCount: 5,
      },
    },
    {
      id: 'day-020',
      weekId: 'week-03',
      dayNumber: 20,
      title: 'Everyday Habits',
      goal: 'Describe things you do every day.',
      estimatedMinutes: 30,
      review: { wordCount: 7, patternCount: 3 },
      wordIds: ['always', 'often', 'sometimes', 'never', 'usually', 'again', 'practice', 'habit', 'every', 'day', 'english'],
      patternIds: ['i-often', 'i-sometimes', 'i-practice-every-day'],
      exercises: [
        { type: 'choice', id: 'day-020-choice-001', prompt: 'Which sentence describes a habit?', options: ['I practice English every day.', 'The book is on the table.', 'This is my key.'], correctOption: 'I practice English every day.' },
        { type: 'fill_blank', id: 'day-020-fill-001', prompt: 'I ___ read in the evening.', acceptedAnswers: ['often', 'sometimes', 'usually'] },
        { type: 'replacement', id: 'day-020-replace-001', patternId: 'i-often', slotValues: { action: 'read' }, referenceAnswer: 'I often read.' },
        { type: 'replacement', id: 'day-020-replace-002', patternId: 'i-practice-every-day', slotValues: { thing: 'English' }, referenceAnswer: 'I practice English every day.' },
        { type: 'sentence_order', id: 'day-020-order-001', tokens: ['often', 'I', 'read'], correctOrder: ['I', 'often', 'read'], finalSentence: 'I often read.' },
        { type: 'translation', id: 'day-020-translation-001', chinesePrompt: '我每天练习英语。我有时走路去学校。', coreMeaningHint: 'Describe habits.', suggestedPatternIds: ['i-sometimes', 'i-practice-every-day'], referenceAnswers: ['I practice English every day. I sometimes walk to school.'] },
      ],
      outputTask: {
        id: 'day-020-output',
        topic: 'My Habits',
        prompts: ['What do you do every day?', 'What do you often or sometimes do?'],
        template: ['I ___ every day.', 'I often ___.', 'I sometimes ___.', 'This is a good habit.'],
        requiredSentenceCount: 5,
      },
    },
    {
      id: 'day-021',
      weekId: 'week-03',
      dayNumber: 21,
      title: 'Week 3 Check',
      goal: 'Describe one normal day from morning to evening.',
      estimatedMinutes: 35,
      review: { wordCount: 8, patternCount: 4 },
      wordIds: ['morning', 'afternoon', 'evening', 'get', 'go', 'do', 'read', 'write', 'first', 'then', 'after', 'every'],
      patternIds: ['i-get-up-in-morning', 'in-the-time-i', 'first-then-after', 'i-practice-every-day'],
      exercises: [
        { type: 'choice', id: 'day-021-choice-001', prompt: 'Which sentence describes a normal day?', options: ['First, I get up. Then I go to school.', 'The key is under the chair.', 'My cup is red.'], correctOption: 'First, I get up. Then I go to school.' },
        { type: 'fill_blank', id: 'day-021-fill-001', prompt: 'In the ___, I get up.', acceptedAnswers: ['morning'] },
        { type: 'replacement', id: 'day-021-replace-001', patternId: 'in-the-time-i', slotValues: { time: 'afternoon', action: 'study' }, referenceAnswer: 'In the afternoon, I study.' },
        { type: 'replacement', id: 'day-021-replace-002', patternId: 'first-then-after', slotValues: { firstAction: 'get up', secondAction: 'go to school' }, referenceAnswer: 'First, I get up. Then I go to school.' },
        { type: 'sentence_order', id: 'day-021-order-001', tokens: ['practice', 'English', 'every', 'I', 'day'], correctOrder: ['I', 'practice', 'English', 'every', 'day'], finalSentence: 'I practice English every day.' },
        { type: 'translation', id: 'day-021-translation-001', chinesePrompt: '早上我起床。下午我学习。晚上我在家。', coreMeaningHint: 'Describe one normal day.', suggestedPatternIds: ['i-get-up-in-morning', 'in-the-time-i'], referenceAnswers: ['I get up in the morning. In the afternoon, I study. In the evening, I am at home.'] },
      ],
      outputTask: {
        id: 'day-021-output',
        topic: 'One Normal Day',
        prompts: ['What do you do from morning to evening?', 'What is the order?'],
        template: ['I get up in the morning.', 'First, I ___.', 'Then I ___.', 'In the afternoon, I ___.', 'In the evening, I ___.', 'This is my normal day.'],
        requiredSentenceCount: 6,
      },
      weeklyCheckRubric: {
        scale: { min: 0, max: 2 },
        pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 6 },
        criteria: [
          { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] },
          { id: 'time-order', label: 'Time order', scores: ['no clear order', 'some order words', 'clear morning-to-evening order'] },
          { id: 'target-patterns', label: 'Target patterns', scores: ['not used', 'used with help', 'used independently'] },
          { id: 'word-use', label: 'Word use', scores: ['few routine words', 'some routine words', 'several routine words'] },
          { id: 'independence', label: 'Independence', scores: ['copied template', 'partly changed template', 'mostly own content'] },
        ],
      },
    },
  ],
};
```

- [ ] **Step 3: Wire Week 3 into `course.ts` temporarily**

Modify `src/content/course.ts`:

```ts
import { week3, week3Patterns, week3Words } from './week3';

contentVersion: '1.9.0',
words: [...week1Words, ...week2Words, ...week3Words],
patterns: [...week1Patterns, ...week2Patterns, ...week3Patterns],
weeks: [week1, week2, week3],
```

- [ ] **Step 4: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: still FAIL because Week 4, Week 3 picture tasks, remix tasks, and images are not done yet. Confirm there are no TypeScript syntax errors from `week3.ts`.

- [ ] **Step 5: Commit Week 3 content**

```bash
git add src/content/week3.ts src/content/course.ts
git commit -m "feat: add week 3 routine content"
```

## Task 3: Add Week 4 Course Content

**Files:**
- Create: `src/content/week4.ts`
- Modify: `src/content/course.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Create `week4.ts` with words and patterns**

Create `src/content/week4.ts`. Copy the full `week4Words` array from the Canonical V1.9 Content Outline section into the file before the `week4Patterns` array.

```ts
import type { Pattern, Week, Word } from '../domain/types';

export const week4Words: Word[] = [
  { id: 'food', text: 'food', category: 'general_thing', definition: 'things people eat', chinese: '食物', example: 'I need food.', weekIntroduced: 4, tags: ['food'] },
  { id: 'drink', text: 'drink', category: 'operation', definition: 'to take liquid into the body', chinese: '喝；饮料', example: 'I drink water.', weekIntroduced: 4, tags: ['food'] },
  { id: 'bread', text: 'bread', category: 'picturable_thing', definition: 'food made from grain', chinese: '面包', example: 'I eat bread.', weekIntroduced: 4, tags: ['food'] }
];

export const week4Patterns: Pattern[] = [
  { id: 'i-eat', title: 'I eat ___.', use: 'Say food you eat.', structure: 'I eat {food}.', examples: ['I eat bread.', 'I eat rice.'], slots: ['food'] },
  { id: 'i-drink', title: 'I drink ___.', use: 'Say what you drink.', structure: 'I drink {drink}.', examples: ['I drink water.', 'I drink tea.'], slots: ['drink'] },
  { id: 'i-want-some', title: 'I want some ___.', use: 'Ask for or express wanting an amount.', structure: 'I want some {thing}.', examples: ['I want some water.', 'I want some bread.'], slots: ['thing'] },
  { id: 'i-need', title: 'I need ___.', use: 'Say what is necessary.', structure: 'I need {thing}.', examples: ['I need food.', 'I need help.'], slots: ['thing'] },
  { id: 'i-have-enough', title: 'I have enough ___.', use: 'Say you have the right amount.', structure: 'I have enough {thing}.', examples: ['I have enough money.', 'I have enough food.'], slots: ['thing'] },
  { id: 'i-go-to-shop', title: 'I go to the shop.', use: 'Say going to buy things.', structure: 'I go to the shop.', examples: ['I go to the shop.'], slots: [] },
  { id: 'i-buy', title: 'I buy ___.', use: 'Say what you buy.', structure: 'I buy {thing}.', examples: ['I buy bread.', 'I buy milk.'], slots: ['thing'] },
  { id: 'i-get-from-shop', title: 'I get ___ from the shop.', use: 'Say what you get from a shop.', structure: 'I get {thing} from the shop.', examples: ['I get bread from the shop.', 'I get milk from the shop.'], slots: ['thing'] },
  { id: 'i-pay-for', title: 'I pay for ___.', use: 'Say what you pay for.', structure: 'I pay for {thing}.', examples: ['I pay for food.', 'I pay for bread.'], slots: ['thing'] },
  { id: 'the-price-is', title: 'The price is ___.', use: 'Describe price simply.', structure: 'The price is {description}.', examples: ['The price is good.', 'The price is dear.'], slots: ['description'] },
  { id: 'it-costs', title: 'It costs ___.', use: 'Say cost amount simply.', structure: 'It costs {amount}.', examples: ['It costs little.', 'It costs much.'], slots: ['amount'] },
  { id: 'please-help-me', title: 'Please help me.', use: 'Ask for help politely.', structure: 'Please help me.', examples: ['Please help me.'], slots: [] },
  { id: 'can-you', title: 'Can you ___?', use: 'Ask another person to do something.', structure: 'Can you {action}?', examples: ['Can you help me?', 'Can you show me the book?'], slots: ['action'] },
  { id: 'i-ask-for', title: 'I ask for ___.', use: 'Say what help or thing you request.', structure: 'I ask for {thing}.', examples: ['I ask for help.', 'I ask for water.'], slots: ['thing'] },
  { id: 'i-need-more', title: 'I need more ___.', use: 'Say more is needed.', structure: 'I need more {thing}.', examples: ['I need more water.', 'I need more food.'], slots: ['thing'] },
  { id: 'the-thing-is-good', title: 'The ___ is good.', use: 'Say something is good.', structure: 'The {thing} is good.', examples: ['The food is good.', 'The tea is good.'], slots: ['thing'] },
];
```

The snippet above shows the file shape only. The implementation must include all 37 Week 4 word objects listed in the Canonical V1.9 Content Outline, not only the first three examples.

- [ ] **Step 2: Add Day 22-28 content**

Add `export const week4: Week = {` with Day 22-28 and close the object with `};`. Use the same exercise style and validation constraints as Week 3.

Required day details:

```ts
// Day 22
id: 'day-022'
title: 'Food and Drink'
wordIds: ['food', 'drink', 'bread', 'milk', 'rice', 'fruit', 'tea', 'eat', 'water']
patternIds: ['i-eat', 'i-drink', 'i-have']
outputTask.requiredSentenceCount: 4

// Day 23
id: 'day-023'
title: 'Want and Need'
wordIds: ['need', 'some', 'more', 'enough', 'help', 'problem', 'please', 'ready', 'want', 'water', 'food']
patternIds: ['i-want-some', 'i-need', 'i-have-enough']
outputTask.requiredSentenceCount: 5

// Day 24
id: 'day-024'
title: 'Buying Simple Things'
wordIds: ['shop', 'buy', 'sell', 'get', 'thing', 'store', 'bread', 'cup', 'money']
patternIds: ['i-go-to-shop', 'i-buy', 'i-get-from-shop']
outputTask.requiredSentenceCount: 5

// Day 25
id: 'day-025'
title: 'Money and Price'
wordIds: ['price', 'cheap', 'dear', 'pay', 'cost', 'change', 'little', 'much', 'money', 'buy']
patternIds: ['i-pay-for', 'the-price-is', 'it-costs']
outputTask.requiredSentenceCount: 5

// Day 26
id: 'day-026'
title: 'Asking for Help'
wordIds: ['ask', 'answer', 'help', 'please', 'find', 'show', 'bring', 'tell', 'problem']
patternIds: ['please-help-me', 'can-you', 'i-ask-for']
outputTask.requiredSentenceCount: 4

// Day 27
id: 'day-027'
title: 'More, Enough, and Good'
wordIds: ['more', 'enough', 'less', 'full', 'empty', 'taste', 'good', 'bad', 'food', 'drink']
patternIds: ['i-need-more', 'i-have-enough', 'the-thing-is-good']
outputTask.requiredSentenceCount: 5

// Day 28
id: 'day-028'
title: 'Week 4 Check'
wordIds: ['food', 'drink', 'bread', 'milk', 'buy', 'shop', 'money', 'price', 'want', 'need', 'help', 'more', 'enough', 'good']
patternIds: ['i-want-some', 'i-need', 'i-buy', 'please-help-me']
outputTask.requiredSentenceCount: 6
weeklyCheckRubric: same five-criterion shape as Day 21, with a shopping/meal criterion.
```

For each day, add at least:

- one `choice`
- one `fill_blank`
- two `replacement`
- one `sentence_order`
- one `translation`

Use IDs in the form `day-022-choice-001`, `day-022-fill-001`, `day-022-replace-001`, `day-022-order-001`, `day-022-translation-001`.

- [ ] **Step 3: Wire Week 4 into `course.ts`**

Modify `src/content/course.ts`:

```ts
import { week4, week4Patterns, week4Words } from './week4';

words: [...week1Words, ...week2Words, ...week3Words, ...week4Words],
patterns: [...week1Patterns, ...week2Patterns, ...week3Patterns, ...week4Patterns],
weeks: [week1, week2, week3, week4],
```

- [ ] **Step 4: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: content tests still FAIL only on missing picture tasks, remix tasks, and word images. Fix any Week 4 content validation errors before committing.

- [ ] **Step 5: Commit Week 4 content**

```bash
git add src/content/week4.ts src/content/course.ts
git commit -m "feat: add week 4 food and shopping content"
```

## Task 4: Add Scenario Capabilities, Scene Goals, and Scene Remix Tasks

**Files:**
- Modify: `src/content/scenarioCapabilities.ts`
- Modify: `src/content/sceneGoals.ts`
- Modify: `src/content/sceneRemixTasks.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Add Week 3-4 capabilities**

Append these entries to `scenarioCapabilities`:

```ts
{
  id: 'describe-my-morning',
  title: 'I can describe my morning.',
  description: 'Say simple actions from getting up to leaving home.',
  unlockedByDayIds: ['day-015'],
  exampleOutputs: ['I get up in the morning.', 'I wash my face.'],
},
{
  id: 'say-where-i-go-every-day',
  title: 'I can say where I go every day.',
  description: 'Say where you go and what you take.',
  unlockedByDayIds: ['day-016'],
  exampleOutputs: ['I go to school.', 'I take my bag.'],
},
{
  id: 'describe-common-actions',
  title: 'I can say what I do with common things.',
  description: 'Use objects to describe simple daily actions.',
  unlockedByDayIds: ['day-017'],
  exampleOutputs: ['I use a pen to write.', 'I open the book.'],
},
{
  id: 'describe-normal-day-in-order',
  title: 'I can describe one normal day in order.',
  description: 'Use time and order words to describe a day.',
  unlockedByDayIds: ['day-021'],
  exampleOutputs: ['First, I get up.', 'In the evening, I read.'],
},
{
  id: 'talk-about-food-and-drink',
  title: 'I can talk about food and drink.',
  description: 'Say what you eat and drink.',
  unlockedByDayIds: ['day-022'],
  exampleOutputs: ['I eat bread.', 'I drink water.'],
},
{
  id: 'say-wants-and-needs',
  title: 'I can say what I want and need.',
  description: 'Use want and need for daily things.',
  unlockedByDayIds: ['day-023'],
  exampleOutputs: ['I want some water.', 'I need help.'],
},
{
  id: 'buy-simple-things',
  title: 'I can buy simple things.',
  description: 'Describe getting things from a shop.',
  unlockedByDayIds: ['day-024'],
  exampleOutputs: ['I go to the shop.', 'I buy bread.'],
},
{
  id: 'ask-for-help',
  title: 'I can ask for help.',
  description: 'Ask another person for simple help.',
  unlockedByDayIds: ['day-026'],
  exampleOutputs: ['Please help me.', 'Can you show me the book?'],
},
{
  id: 'describe-meal-or-shopping-scene',
  title: 'I can describe a meal or shopping scene.',
  description: 'Combine food, shopping, wants, needs, and help.',
  unlockedByDayIds: ['day-028'],
  exampleOutputs: ['I buy food.', 'I need more water.'],
},
```

- [ ] **Step 2: Add scene remix tasks for every new day**

Append entries to `sceneRemixTasksByDayId`:

```ts
'day-015': [
  { id: 'day-015-remix-face-hands', type: 'replace', prompt: 'Change face to hands.', source: 'I wash my face.', referenceAnswers: ['I wash my hands.'] },
],
'day-016': [
  { id: 'day-016-remix-school-work', type: 'replace', prompt: 'Change school to work.', source: 'I go to school.', referenceAnswers: ['I go to work.'] },
],
'day-017': [
  { id: 'day-017-remix-pen-book', type: 'replace', prompt: 'Change pen to book.', source: 'I use a pen to write.', referenceAnswers: ['I use a book to study.'] },
],
'day-018': [
  { id: 'day-018-remix-morning-evening', type: 'replace', prompt: 'Change morning to evening.', source: 'In the morning, I read.', referenceAnswers: ['In the evening, I read.'] },
],
'day-019': [
  { id: 'day-019-remix-read-write', type: 'replace', prompt: 'Change read to write.', source: 'Then I read.', referenceAnswers: ['Then I write.'] },
],
'day-020': [
  { id: 'day-020-remix-often-sometimes', type: 'replace', prompt: 'Change often to sometimes.', source: 'I often read.', referenceAnswers: ['I sometimes read.'] },
],
'day-021': [
  { id: 'day-021-remix-normal-day', type: 'extend', prompt: 'Add two more sentences about your normal day.', referenceAnswers: ['In the afternoon, I study.', 'In the evening, I am at home.'] },
],
'day-022': [
  { id: 'day-022-remix-bread-rice', type: 'replace', prompt: 'Change bread to rice.', source: 'I eat bread.', referenceAnswers: ['I eat rice.'] },
],
'day-023': [
  { id: 'day-023-remix-want-need', type: 'replace', prompt: 'Change want to need.', source: 'I want some water.', referenceAnswers: ['I need some water.'] },
],
'day-024': [
  { id: 'day-024-remix-bread-milk', type: 'replace', prompt: 'Change bread to milk.', source: 'I buy bread.', referenceAnswers: ['I buy milk.'] },
],
'day-025': [
  { id: 'day-025-remix-little-much', type: 'replace', prompt: 'Change little to much.', source: 'It costs little.', referenceAnswers: ['It costs much.'] },
],
'day-026': [
  { id: 'day-026-remix-show-bring', type: 'replace', prompt: 'Change show to bring.', source: 'Can you show me the book?', referenceAnswers: ['Can you bring me the book?'] },
],
'day-027': [
  { id: 'day-027-remix-full-empty', type: 'replace', prompt: 'Change full to empty.', source: 'The cup is full.', referenceAnswers: ['The cup is empty.'] },
],
'day-028': [
  { id: 'day-028-remix-shopping-scene', type: 'extend', prompt: 'Add two more sentences to the shopping scene.', referenceAnswers: ['I need more water.', 'The food is good.'] },
],
```

- [ ] **Step 3: Add scene goals if needed**

If `sceneGoalsByDayId` currently has explicit entries for existing days, add Day 15-28 entries with this shape:

```ts
'day-015': {
  id: 'scene-goal-day-015',
  title: 'Describe your morning.',
  capability: 'I can describe my morning.',
  templates: ['I get up in the morning.', 'I wash my face.', 'I put on my clothes.'],
  guidedPrompts: ['What do you do first?', 'What do you wash?', 'What do you put on?'],
  scenePrompt: 'Write a short morning routine.',
  dialoguePrompts: ['Ask another learner what they do in the morning.'],
},
```

Add equivalent explicit entries for Day 16-28, using each day's output task title, capability, templates, guided prompts, and scene prompt from `week3.ts`, `week4.ts`, and the V1.9 spec. Do not add a new scene goal model.

- [ ] **Step 4: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL only on missing picture tasks and word images.

- [ ] **Step 5: Commit support content**

```bash
git add src/content/scenarioCapabilities.ts src/content/sceneGoals.ts src/content/sceneRemixTasks.ts
git commit -m "feat: add v1.9 capabilities and remix tasks"
```

## Task 5: Add Picture Describe Tasks and Scene Images

**Files:**
- Modify: `src/content/pictureDescribeTasks.ts`
- Add: `src/assets/picture-describe/day-015-morning-routine.png`
- Add: `src/assets/picture-describe/day-016-going-to-school-work.png`
- Add: `src/assets/picture-describe/day-017-useful-actions.png`
- Add: `src/assets/picture-describe/day-018-time-of-day.png`
- Add: `src/assets/picture-describe/day-019-action-order.png`
- Add: `src/assets/picture-describe/day-020-everyday-habits.png`
- Add: `src/assets/picture-describe/day-021-normal-day-check.png`
- Add: `src/assets/picture-describe/day-022-food-and-drink.png`
- Add: `src/assets/picture-describe/day-023-want-and-need.png`
- Add: `src/assets/picture-describe/day-024-buying-simple-things.png`
- Add: `src/assets/picture-describe/day-025-money-and-price.png`
- Add: `src/assets/picture-describe/day-026-asking-for-help.png`
- Add: `src/assets/picture-describe/day-027-more-enough-good.png`
- Add: `src/assets/picture-describe/day-028-meal-shopping-check.png`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Generate scene images**

Use the image generation skill in built-in mode. Generate each image as a concrete daily-life scene, with no readable text, no logo, and no Chinese.

Use these day-specific prompts:

```text
Day 15: Create a simple polished cartoon learning-app scene of a learner in a bedroom getting ready in the morning: getting up, washing face, water nearby, and clothes ready. Square composition. No readable text, no Chinese, no watermark, no logo.
Day 16: Create a simple polished cartoon scene of a learner leaving home with a bag and going along a road toward school or work, with a bus in the background. Square composition. No readable text, no Chinese, no signage.
Day 17: Create a simple polished cartoon desk scene with a learner opening a book, reading, writing with a pen, and using paper. Square composition. No readable text, no Chinese.
Day 18: Create a simple polished cartoon three-part daily scene showing morning, afternoon, and evening actions. Square composition. No readable text, no Chinese.
Day 19: Create a simple polished cartoon sequence scene: open book, read, write, close book, put book in bag. Square composition. No readable text, no Chinese.
Day 20: Create a simple polished cartoon weekly habit scene showing repeated English practice, reading, walking, and home routine. Square composition. No readable text, no Chinese.
Day 21: Create a simple polished cartoon full normal-day scene with home morning, school or work, study, food, and evening rest. Square composition. No readable text, no Chinese.
Day 22: Create a simple polished cartoon food and drink table with bread, milk, rice, fruit, tea, and water. Square composition. No readable text, no Chinese.
Day 23: Create a simple polished cartoon scene of a learner at a table needing water, food, and help with a simple problem. Square composition. No readable text, no Chinese.
Day 24: Create a simple polished cartoon shop counter scene with a learner buying bread, milk, and a small object. Square composition. No readable text, no Chinese, no price labels.
Day 25: Create a simple polished cartoon scene of a learner paying with money at a shop counter and receiving change. Square composition. No readable text, no Chinese, no currency symbols.
Day 26: Create a simple polished cartoon scene of a learner politely asking another person for help finding something in a shop or room. Square composition. No readable text, no Chinese.
Day 27: Create a simple polished cartoon meal table with full and empty cups, food, and a learner showing what is enough and what needs more. Square composition. No readable text, no Chinese.
Day 28: Create a simple polished cartoon scene of a learner buying food and drink at a small shop, then sitting at a simple meal table. Square composition. No readable text, no Chinese.
```

After generation, copy selected files into `src/assets/picture-describe/` with the filenames listed above. Resize to `512x512` or keep the existing picture-describe asset size if current assets use a different standard; use the standard already present in `src/assets/picture-describe/`.

- [ ] **Step 2: Import the new images**

At the top of `src/content/pictureDescribeTasks.ts`, add:

```ts
import day015Image from '../assets/picture-describe/day-015-morning-routine.png';
import day016Image from '../assets/picture-describe/day-016-going-to-school-work.png';
import day017Image from '../assets/picture-describe/day-017-useful-actions.png';
import day018Image from '../assets/picture-describe/day-018-time-of-day.png';
import day019Image from '../assets/picture-describe/day-019-action-order.png';
import day020Image from '../assets/picture-describe/day-020-everyday-habits.png';
import day021Image from '../assets/picture-describe/day-021-normal-day-check.png';
import day022Image from '../assets/picture-describe/day-022-food-and-drink.png';
import day023Image from '../assets/picture-describe/day-023-want-and-need.png';
import day024Image from '../assets/picture-describe/day-024-buying-simple-things.png';
import day025Image from '../assets/picture-describe/day-025-money-and-price.png';
import day026Image from '../assets/picture-describe/day-026-asking-for-help.png';
import day027Image from '../assets/picture-describe/day-027-more-enough-good.png';
import day028Image from '../assets/picture-describe/day-028-meal-shopping-check.png';
```

- [ ] **Step 3: Add Day 15-28 picture tasks**

Append entries for Day 15-28. Use this exact shape for Day 15 and repeat with day-specific values:

```ts
'day-015': {
  id: 'picture-day-015-morning-routine',
  dayId: 'day-015',
  title: 'Morning Routine',
  goal: 'Describe what the learner does in the morning.',
  image: day015Image,
  targetWords: ['morning', 'get', 'wash', 'face', 'water', 'clothes'],
  suggestedPatterns: ['I get up in the morning.', 'I wash my face.', 'I put on my clothes.'],
  requiredSentenceCount: 4,
  simpleVersion: ['I get up in the morning.', 'I wash my face.', 'I put on my clothes.', 'I drink water.'],
},
```

Use these titles and target word sets:

```ts
day-016: title 'Going to School or Work', targetWords ['go', 'school', 'work', 'take', 'bag', 'road']
day-017: title 'Doing Useful Things', targetWords ['open', 'read', 'write', 'book', 'pen', 'paper']
day-018: title 'Time of Day', targetWords ['morning', 'afternoon', 'evening', 'night', 'study', 'sleep']
day-019: title 'Action Order', targetWords ['first', 'then', 'next', 'last', 'open', 'close']
day-020: title 'Everyday Habits', targetWords ['often', 'sometimes', 'practice', 'habit', 'English', 'day']
day-021: title 'One Normal Day', targetWords ['morning', 'afternoon', 'evening', 'go', 'study', 'home']
day-022: title 'Food and Drink', targetWords ['food', 'drink', 'bread', 'milk', 'rice', 'fruit']
day-023: title 'Want and Need', targetWords ['want', 'need', 'water', 'food', 'help', 'problem']
day-024: title 'Buying Simple Things', targetWords ['shop', 'buy', 'bread', 'milk', 'money', 'thing']
day-025: title 'Money and Price', targetWords ['money', 'price', 'pay', 'cheap', 'dear', 'change']
day-026: title 'Asking for Help', targetWords ['ask', 'help', 'please', 'find', 'show', 'bring']
day-027: title 'More, Enough, and Good', targetWords ['more', 'enough', 'full', 'empty', 'food', 'good']
day-028: title 'Meal and Shopping Check', targetWords ['food', 'drink', 'shop', 'buy', 'need', 'help']
```

- [ ] **Step 4: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL only on missing word flashcard images.

- [ ] **Step 5: Commit picture tasks**

```bash
git add src/content/pictureDescribeTasks.ts src/assets/picture-describe
git commit -m "feat: add v1.9 picture describe scenes"
```

## Task 6: Add Word Flashcard Images and Metadata

**Files:**
- Modify: `src/content/wordFlashcardImages.ts`
- Add: new PNG files under `src/assets/word-flashcards/`
- Test: `src/content/validateContent.test.ts`, `src/components/WordsPage.test.tsx`

- [ ] **Step 1: Generate all new word images**

Generate one `512x512` PNG for each new word in `week3Words` and `week4Words`.

Use V1.8 visual style rules:

```text
Concrete Visual: visible objects such as face, road, bus, bread, shop, store.
Scene Visual: actions, places, qualities, and concepts such as wash, go, work, need, help, habit.
Relation/Grammar: only when needed for structure words such as with, before, after, first, then, some, please.
```

Use these concrete prompt examples for non-grammar words, adapting only the word and subject for the remaining words:

```text
Example for "bread": Create a 512x512 Basic English word flashcard image for the word "bread". Show one simple loaf of bread as a complete object. Use a simple polished cartoon educational flashcard style, clean outlines, soft minimal shading, centered subject, generous padding, warm off-white background. No text, no Chinese, no watermark, no logo.
Example for "wash": Create a 512x512 Basic English word flashcard image for the word "wash". Show a simple cartoon learner washing hands with water at a sink. Use a simple polished cartoon educational flashcard style, clean outlines, soft minimal shading, centered action scene, generous padding. No text, no Chinese, no watermark, no logo.
```

Use these concrete prompt examples for grammar-style words, adapting only the exact word and concept cue for the remaining grammar cards:

```text
Example for "before": Create a 512x512 grammar/function word image for "before". Show a small two-step cartoon cue with a closed book before an open book. Include only the exact word "before" at the bottom. No Chinese, no other words, no watermark, no logo.
Example for "then": Create a 512x512 grammar/function word image for "then". Show two simple cartoon action cards connected by an arrow. Include only the exact word "then" at the bottom. No Chinese, no other words, no watermark, no logo.
```

- [ ] **Step 2: Import new images**

In `src/content/wordFlashcardImages.ts`, add imports for each new PNG. Keep imports alphabetical by word image variable when practical:

```ts
import afternoonImage from '../assets/word-flashcards/afternoon.png';
import againImage from '../assets/word-flashcards/again.png';
import alwaysImage from '../assets/word-flashcards/always.png';
import answerImage from '../assets/word-flashcards/answer.png';
import askImage from '../assets/word-flashcards/ask.png';
```

- [ ] **Step 3: Add metadata entries**

Append one `wordImageAsset(wordId, image, kind, visualStyle, labelPolicy, prompt)` entry for every new word.

Examples:

```ts
wordImageAsset('morning', morningImage, 'time', 'scene', 'none', 'A simple morning routine scene for Basic English learners.'),
wordImageAsset('face', faceImage, 'object', 'concrete', 'none', 'A simple face flashcard image for Basic English learners.'),
wordImageAsset('before', beforeImage, 'structure', 'grammar', 'english-keyword', 'A simple before cue for action order.'),
wordImageAsset('bread', breadImage, 'object', 'concrete', 'none', 'A simple bread flashcard image for Basic English learners.'),
wordImageAsset('need', needImage, 'action', 'scene', 'none', 'A simple needing-help scene for Basic English learners.'),
```

Use only these `kind` values:

```ts
'object' | 'place' | 'person' | 'position' | 'quality' | 'action' | 'structure' | 'time' | 'abstract'
```

Use only these `visualStyle` values:

```ts
'concrete' | 'scene' | 'relation' | 'grammar'
```

For `visualStyle !== 'grammar'`, set `labelPolicy` to `'none'`. For `visualStyle === 'grammar'`, set `labelPolicy` to `'english-keyword'`.

- [ ] **Step 4: Run image and content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/WordsPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Verify image dimensions**

Run:

```bash
@'
from pathlib import Path
from PIL import Image
base = Path('src/assets/word-flashcards')
bad = []
for path in sorted(base.glob('*.png')):
    im = Image.open(path)
    if im.size != (512, 512):
        bad.append(f'{path.name}: {im.size}')
print(f'checked {len(list(base.glob("*.png")))} word images')
if bad:
    print('\n'.join(bad))
    raise SystemExit(1)
print('all word images are 512x512')
'@ | python -
```

Expected: `all word images are 512x512`.

- [ ] **Step 6: Commit word images**

```bash
git add src/content/wordFlashcardImages.ts src/assets/word-flashcards
git commit -m "feat: add v1.9 word flashcard images"
```

## Task 7: Final Integration Tests and Build

**Files:**
- Modify only if tests expose a real integration issue.

- [ ] **Step 1: Run targeted content and page tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/TodayPage.test.tsx src/components/WordsPage.test.tsx src/components/CoursePage.test.tsx src/components/MePage.test.tsx
```

Expected: PASS. If tests from `.worktrees` are picked up because worktrees are inside the repo, run from the active implementation worktree rather than the root checkout.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: Vite build succeeds with no TypeScript errors.

- [ ] **Step 4: Run E2E if available**

Check whether a script exists:

```bash
npm run
```

If `test:e2e` is listed, run:

```bash
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 5: Commit any integration fixes**

If Step 1-4 required changes:

```bash
git add src/content src/components src/assets
git commit -m "fix: complete v1.9 content integration"
```

If no changes were needed, do not create an empty commit.

## Task 8: Manual Product Review Checklist

**Files:**
- No code changes expected.

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

Open the local URL printed by Vite.

- [ ] **Step 2: Review Day 15**

Use the app to open Day 15 and verify:

```text
Header shows Week 3 / Day 15.
Words step has new routine words.
Patterns step teaches morning routine patterns.
Scene Remix appears in the Today step list.
Picture step shows the Day 15 morning image.
Output asks for morning sentences.
```

- [ ] **Step 3: Review Day 22**

Open Day 22 and verify:

```text
Header shows Week 4 / Day 22.
Words step has food and drink words.
Picture step shows a food and drink scene.
Output asks for food and drink sentences.
```

- [ ] **Step 4: Review Day 28**

Open Day 28 and verify:

```text
Header shows Week 4 / Day 28.
The output target is a meal or shopping scene.
Completion summary uses course-complete copy after Day 28.
```

- [ ] **Step 5: Stop dev server**

Stop the Vite process with `Ctrl+C`.

## Final Verification

Before claiming V1.9 is complete, run:

```bash
npm test
npm run build
```

If E2E is configured:

```bash
npm run test:e2e
```

Also run the word-image dimension check from Task 6.
