# Basic English V1.6 Picture Describe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Picture Describe practice to Today for Week 1 and Week 2, with generated scene images, local feedback, saved descriptions, manual Review integration, Me page history, and E2E coverage.

**Architecture:** Add a focused picture description domain layer for feedback and review item helpers, a content module for 14 daily tasks and image mappings, and repository methods for persisted descriptions. Integrate a new Today step between Translate and Output, then extend Review and Me through small dedicated components instead of expanding existing branches with large inline blocks.

**Tech Stack:** React 19, TypeScript, Vite PNG imports, IndexedDB via `idb`, Vitest + Testing Library, Playwright, generated optimized PNG assets.

---

## File Structure

- Create `src/assets/picture-describe/*.png`: 14 generated scene images.
- Create `src/content/pictureDescribeTasks.ts`: imports assets and maps day ids to task data.
- Modify `src/domain/types.ts`: add `PictureDescribeTask`.
- Create `src/domain/pictureDescription.ts`: feedback rules and description helpers.
- Create `src/domain/pictureDescription.test.ts`: rule tests.
- Modify `src/domain/progress.ts`: add `picture` step between `translate` and `output`.
- Modify `src/domain/progress.test.ts`: step order and completion tests.
- Modify `src/domain/review.ts`: add `picture_description` review type, `pictureDescriptionTaskId`, creator and duplicate helper.
- Modify `src/domain/review.test.ts`: creator and duplicate tests.
- Modify `src/storage/progressRepository.ts`: add `PictureDescription` and repository methods.
- Modify `src/storage/indexedDbProgressRepository.ts`: add store and methods, bump DB version.
- Modify `src/storage/indexedDbProgressRepository.test.ts`: persistence tests.
- Create `src/components/PictureDescribeStep.tsx`: Today practice UI.
- Create `src/components/PictureDescribeStep.test.tsx`: UI behavior tests.
- Create `src/components/PictureDescriptionReviewCard.tsx`: Review UI for picture descriptions.
- Create `src/components/PictureDescriptionReviewCard.test.tsx`: Review card tests.
- Modify `src/components/TodayPage.tsx`: load/save picture description, add step rendering and gate.
- Modify `src/components/TodayPage.test.tsx`: Today step integration tests.
- Modify `src/components/ReviewPage.tsx`: render picture description review items.
- Modify `src/components/ReviewPage.test.tsx`: Review integration tests.
- Modify `src/components/MePage.tsx`: load and display checked descriptions.
- Modify `src/components/MePage.test.tsx`: My Descriptions tests.
- Modify `src/App.tsx`: pass picture tasks into Today/Review/Me if needed.
- Modify `src/App.test.tsx`: navigation still passes with new step.
- Modify `src/styles.css`: picture describe layout styles.
- Modify `tests/e2e/basic-english.spec.ts`: Day 1 flow includes Picture Describe, Add to Review, Review completion, and Me history.

---

### Task 1: Picture Describe Content and Images

**Files:**
- Create: `src/assets/picture-describe/day-001-self-introduction.png`
- Create: `src/assets/picture-describe/day-002-student-at-desk.png`
- Create: `src/assets/picture-describe/day-003-question.png`
- Create: `src/assets/picture-describe/day-004-my-friend.png`
- Create: `src/assets/picture-describe/day-005-kind-person.png`
- Create: `src/assets/picture-describe/day-006-study-english.png`
- Create: `src/assets/picture-describe/day-007-week-1-scene.png`
- Create: `src/assets/picture-describe/day-008-my-room.png`
- Create: `src/assets/picture-describe/day-009-things-on-table.png`
- Create: `src/assets/picture-describe/day-010-morning-at-home.png`
- Create: `src/assets/picture-describe/day-011-kitchen-breakfast.png`
- Create: `src/assets/picture-describe/day-012-cleaning-room.png`
- Create: `src/assets/picture-describe/day-013-evening-at-home.png`
- Create: `src/assets/picture-describe/day-014-home-check.png`
- Create: `src/content/pictureDescribeTasks.ts`
- Modify: `src/domain/types.ts`
- Modify: `src/content/validateContent.test.ts`

- [ ] **Step 1: Generate scene images**

Use the image generation skill. Generate one illustration per task with this shared style:

```text
Simple English learning scene illustration, square composition, light neutral background, clear daily-life scene with 3-6 visible describable elements, clean soft color palette, no text, no letters, no logos, no brand names, no watermark, child-friendly but not childish.
```

Generate these prompts:

```text
day-001-self-introduction: a student standing with books, friendly self introduction scene
day-002-student-at-desk: a happy student studying English at a desk with a book and pencil
day-003-question: a student at a desk raising a hand with a question, books nearby
day-004-my-friend: two friendly students at home or school, one introducing the other
day-005-kind-person: one person helping another person with books, kind friendly scene
day-006-study-english: a student studying English with books, notebook, and simple desk objects
day-007-week-1-scene: a student with a friend and English books, simple review scene
day-008-my-room: a tidy small bedroom with bed, table, chair, and window
day-009-things-on-table: a table with a book, cup, pen, paper, and bag
day-010-morning-at-home: morning light in a home room with door and window
day-011-kitchen-breakfast: a simple kitchen breakfast scene with cup, table, and food, no text
day-012-cleaning-room: a person cleaning a room with chair, table, and box
day-013-evening-at-home: evening at home with a chair, book, lamp, and friend
day-014-home-check: a friendly home scene with room, bed, table, and friend
```

Copy final PNGs into `src/assets/picture-describe/`. Resize/optimize to about `640x640`; target individual files below about `450 KB`.

- [ ] **Step 2: Add task type**

In `src/domain/types.ts`, add:

```ts
export interface PictureDescribeTask {
  id: string;
  dayId: string;
  title: string;
  goal: string;
  image: string;
  targetWords: string[];
  suggestedPatterns: string[];
  requiredSentenceCount: number;
  simpleVersion: string[];
}
```

- [ ] **Step 3: Create task content**

Create `src/content/pictureDescribeTasks.ts` with imports and exported mapping:

```ts
import day001Image from '../assets/picture-describe/day-001-self-introduction.png';
import day002Image from '../assets/picture-describe/day-002-student-at-desk.png';
import day003Image from '../assets/picture-describe/day-003-question.png';
import day004Image from '../assets/picture-describe/day-004-my-friend.png';
import day005Image from '../assets/picture-describe/day-005-kind-person.png';
import day006Image from '../assets/picture-describe/day-006-study-english.png';
import day007Image from '../assets/picture-describe/day-007-week-1-scene.png';
import day008Image from '../assets/picture-describe/day-008-my-room.png';
import day009Image from '../assets/picture-describe/day-009-things-on-table.png';
import day010Image from '../assets/picture-describe/day-010-morning-at-home.png';
import day011Image from '../assets/picture-describe/day-011-kitchen-breakfast.png';
import day012Image from '../assets/picture-describe/day-012-cleaning-room.png';
import day013Image from '../assets/picture-describe/day-013-evening-at-home.png';
import day014Image from '../assets/picture-describe/day-014-home-check.png';
import type { PictureDescribeTask } from '../domain/types';

export const pictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = {
  'day-001': {
    id: 'picture-day-001-self-introduction',
    dayId: 'day-001',
    title: 'Self Introduction',
    goal: 'Say who you are and what you study.',
    image: day001Image,
    targetWords: ['name', 'I', 'student', 'English'],
    suggestedPatterns: ['My name is ...', 'I am ...', 'I study ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['My name is Li.', 'I am a student.', 'I study English.'],
  },
  'day-002': {
    id: 'picture-day-002-student-at-desk',
    dayId: 'day-002',
    title: 'Student at a Desk',
    goal: 'Say what the student is doing.',
    image: day002Image,
    targetWords: ['student', 'desk', 'book', 'pencil'],
    suggestedPatterns: ['This is ...', 'He is ...', 'I can see ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is a student.', 'He is at a desk.', 'I can see a book.'],
  },
  'day-003': {
    id: 'picture-day-003-question',
    dayId: 'day-003',
    title: 'A Question',
    goal: 'Say what question you can ask.',
    image: day003Image,
    targetWords: ['question', 'book', 'desk', 'student'],
    suggestedPatterns: ['I have ...', 'This is ...', 'There is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['I have a question.', 'This is a student.', 'There is a book.'],
  },
  'day-004': {
    id: 'picture-day-004-my-friend',
    dayId: 'day-004',
    title: 'My Friend',
    goal: 'Introduce a friend in the picture.',
    image: day004Image,
    targetWords: ['friend', 'student', 'school', 'book'],
    suggestedPatterns: ['This is my ...', 'He is ...', 'She is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is my friend.', 'She is a student.', 'She has a book.'],
  },
  'day-005': {
    id: 'picture-day-005-kind-person',
    dayId: 'day-005',
    title: 'A Kind Person',
    goal: 'Say what the person is like.',
    image: day005Image,
    targetWords: ['kind', 'person', 'help', 'book'],
    suggestedPatterns: ['He is ...', 'She is ...', 'This is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is a kind person.', 'He helps a friend.', 'There is a book.'],
  },
  'day-006': {
    id: 'picture-day-006-study-english',
    dayId: 'day-006',
    title: 'Study English',
    goal: 'Say why you study English.',
    image: day006Image,
    targetWords: ['study', 'English', 'book', 'want'],
    suggestedPatterns: ['I study ...', 'I want ...', 'because ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['I study English.', 'I have a book.', 'I want to learn.'],
  },
  'day-007': {
    id: 'picture-day-007-week-1-scene',
    dayId: 'day-007',
    title: 'Week 1 Scene',
    goal: 'Use Week 1 words to describe the scene.',
    image: day007Image,
    targetWords: ['name', 'student', 'friend', 'English'],
    suggestedPatterns: ['My name is ...', 'I am ...', 'I have ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['My name is Li.', 'I am a student.', 'I have a friend.'],
  },
  'day-008': {
    id: 'picture-day-008-my-room',
    dayId: 'day-008',
    title: 'My Room',
    goal: 'Say what you can see in this room.',
    image: day008Image,
    targetWords: ['room', 'bed', 'table', 'window'],
    suggestedPatterns: ['This is ...', 'There is ...', 'I can see ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
  },
  'day-009': {
    id: 'picture-day-009-things-on-table',
    dayId: 'day-009',
    title: 'Things on a Table',
    goal: 'Name things on the table.',
    image: day009Image,
    targetWords: ['table', 'book', 'cup', 'pen'],
    suggestedPatterns: ['There is ...', 'There are ...', 'I have ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['There is a table.', 'There is a book.', 'I have a pen.'],
  },
  'day-010': {
    id: 'picture-day-010-morning-at-home',
    dayId: 'day-010',
    title: 'Morning at Home',
    goal: 'Say what the home looks like in the morning.',
    image: day010Image,
    targetWords: ['home', 'morning', 'door', 'window'],
    suggestedPatterns: ['This is ...', 'It is ...', 'I can see ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is my home.', 'It is morning.', 'I can see a window.'],
  },
  'day-011': {
    id: 'picture-day-011-kitchen-breakfast',
    dayId: 'day-011',
    title: 'Kitchen Breakfast',
    goal: 'Say what is in the kitchen.',
    image: day011Image,
    targetWords: ['kitchen', 'breakfast', 'cup', 'table'],
    suggestedPatterns: ['There is ...', 'I have ...', 'This is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is a kitchen.', 'There is a cup.', 'I have breakfast.'],
  },
  'day-012': {
    id: 'picture-day-012-cleaning-room',
    dayId: 'day-012',
    title: 'Cleaning a Room',
    goal: 'Say what someone can do in the room.',
    image: day012Image,
    targetWords: ['clean', 'room', 'chair', 'box'],
    suggestedPatterns: ['I can ...', 'There is ...', 'It is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['I can clean the room.', 'There is a chair.', 'There is a box.'],
  },
  'day-013': {
    id: 'picture-day-013-evening-at-home',
    dayId: 'day-013',
    title: 'Evening at Home',
    goal: 'Say what is happening at home.',
    image: day013Image,
    targetWords: ['evening', 'home', 'book', 'friend'],
    suggestedPatterns: ['This is ...', 'I can see ...', 'It is ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['It is evening.', 'This is my home.', 'I can see a book.'],
  },
  'day-014': {
    id: 'picture-day-014-home-check',
    dayId: 'day-014',
    title: 'Home Check',
    goal: 'Use Week 2 words to describe the home scene.',
    image: day014Image,
    targetWords: ['home', 'room', 'bed', 'table'],
    suggestedPatterns: ['This is ...', 'There is ...', 'I have ...'],
    requiredSentenceCount: 3,
    simpleVersion: ['This is my home.', 'There is a room.', 'I have a table.'],
  },
};
```

Use the spec's exact titles, words, and patterns. Each task must have 3 `simpleVersion` sentences.

- [ ] **Step 4: Add content validation tests**

In `src/content/validateContent.test.ts`, import `pictureDescribeTasksByDayId` and add:

```ts
describe('picture describe tasks', () => {
  it('has one task for every Week 1 and Week 2 day', () => {
    const firstTwoWeekDayIds = basicEnglishCourse.weeks.slice(0, 2).flatMap((week) => week.days.map((day) => day.id));

    expect(Object.keys(pictureDescribeTasksByDayId).sort()).toEqual([...firstTwoWeekDayIds].sort());
  });

  it('uses complete English-first task data', () => {
    for (const [dayId, task] of Object.entries(pictureDescribeTasksByDayId)) {
      expect(task.dayId).toBe(dayId);
      expect(task.title).toMatch(/\S/);
      expect(task.goal).toMatch(/\S/);
      expect(task.image).toMatch(/\S/);
      expect(task.targetWords.length).toBeGreaterThanOrEqual(3);
      expect(task.suggestedPatterns.length).toBeGreaterThanOrEqual(2);
      expect(task.requiredSentenceCount).toBe(3);
      expect(task.simpleVersion).toHaveLength(3);
    }
  });
});
```

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- src/content/validateContent.test.ts
npm run build
```

Expected: both pass.

Commit:

```bash
git add src/assets/picture-describe src/content/pictureDescribeTasks.ts src/domain/types.ts src/content/validateContent.test.ts
git commit -m "feat: add picture describe task content"
```

---

### Task 2: Feedback Rules, Progress Step, and Review Domain

**Files:**
- Create: `src/domain/pictureDescription.ts`
- Create: `src/domain/pictureDescription.test.ts`
- Modify: `src/domain/progress.ts`
- Modify: `src/domain/progress.test.ts`
- Modify: `src/domain/review.ts`
- Modify: `src/domain/review.test.ts`

- [ ] **Step 1: Add failing feedback tests**

Create `src/domain/pictureDescription.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { PictureDescribeTask } from './types';
import { checkPictureDescription, countMeaningfulSentences } from './pictureDescription';

const task: PictureDescribeTask = {
  id: 'picture-day-008-my-room',
  dayId: 'day-008',
  title: 'My Room',
  goal: 'Say what you can see in this room.',
  image: '/room.png',
  targetWords: ['room', 'bed', 'table', 'window'],
  suggestedPatterns: ['This is ...', 'There is ...', 'I can see ...'],
  requiredSentenceCount: 3,
  simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
};

describe('picture description feedback', () => {
  it('counts meaningful sentences from punctuation and line breaks', () => {
    expect(countMeaningfulSentences('This is my room. There is a bed.\nI can see a table.')).toBe(3);
    expect(countMeaningfulSentences('room. bed. table.')).toBe(0);
  });

  it('marks clear-enough answers ready', () => {
    expect(
      checkPictureDescription(task, 'This is my room. There is a bed. I can see a table.'),
    ).toEqual({
      status: 'ready',
      sentenceCount: 3,
      matchedTargetWords: ['room', 'bed', 'table'],
      matchedPatterns: ['This is', 'There is', 'I can see'],
      messages: ['Clear enough. You can continue.'],
      simpleVersion: task.simpleVersion,
    });
  });

  it('returns at most two actionable messages for weak answers', () => {
    const feedback = checkPictureDescription(task, 'room. bed.');

    expect(feedback.status).toBe('needs_work');
    expect(feedback.messages.length).toBeLessThanOrEqual(2);
    expect(feedback.messages).toContain('Add one more sentence about the picture.');
    expect(feedback.simpleVersion).toEqual(task.simpleVersion);
  });
});
```

- [ ] **Step 2: Implement feedback helpers**

Create `src/domain/pictureDescription.ts`:

```ts
import type { PictureDescribeTask } from './types';

export type PictureDescriptionStatus = 'ready' | 'needs_work';

export interface PictureDescriptionFeedback {
  status: PictureDescriptionStatus;
  sentenceCount: number;
  matchedTargetWords: string[];
  matchedPatterns: string[];
  messages: string[];
  simpleVersion: string[];
}

const basicPatternChecks = ['This is', 'There is', 'There are', 'I can see', 'I have', 'I am', 'He is', 'She is'];

function normalizeText(text: string): string {
  return text.toLowerCase();
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((word) => /[a-z]/i.test(word)).length;
}

export function countMeaningfulSentences(text: string): number {
  return splitSentences(text).filter((sentence) => wordCount(sentence) >= 3).length;
}

export function checkPictureDescription(task: PictureDescribeTask, text: string): PictureDescriptionFeedback {
  const normalized = normalizeText(text);
  const sentenceCount = countMeaningfulSentences(text);
  const matchedTargetWords = task.targetWords.filter((word) => normalized.includes(word.toLowerCase()));
  const matchedPatterns = basicPatternChecks.filter((pattern) => normalized.includes(pattern.toLowerCase()));
  const messages: string[] = [];

  if (sentenceCount < task.requiredSentenceCount) {
    messages.push('Add one more sentence about the picture.');
  }
  if (matchedTargetWords.length < 2) {
    messages.push(`Use picture words like ${task.targetWords.slice(0, 3).join(', ')}.`);
  }
  if (matchedPatterns.length === 0) {
    messages.push('Try one simple pattern: There is ...');
  }

  const isReady = sentenceCount >= task.requiredSentenceCount && (matchedTargetWords.length >= 2 || matchedPatterns.length > 0);

  return {
    status: isReady ? 'ready' : 'needs_work',
    sentenceCount,
    matchedTargetWords,
    matchedPatterns,
    messages: isReady ? ['Clear enough. You can continue.'] : messages.slice(0, 2),
    simpleVersion: task.simpleVersion,
  };
}
```

- [ ] **Step 3: Add picture step tests**

In `src/domain/progress.test.ts`, add expectations that `stepOrder` includes `picture` after `translate` and before `output`, and that `completeStep(progress, 'translate', now).currentStep` returns `picture`.

- [ ] **Step 4: Update progress domain**

In `src/domain/progress.ts`, change:

```ts
export type StepId = 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'picture' | 'output' | 'done';
export const stepOrder: StepId[] = ['review', 'words', 'patterns', 'drills', 'translate', 'picture', 'output', 'done'];
```

- [ ] **Step 5: Add review helper tests**

In `src/domain/review.test.ts`, add tests for `createPictureDescriptionReviewItem` and `hasActivePictureDescriptionReviewItem`.

Use expected id:

```ts
review-picture-description-day-008-picture-day-008-my-room
```

- [ ] **Step 6: Implement review helper**

In `src/domain/review.ts`:

```ts
export type ReviewItemType = 'word' | 'pattern' | 'exercise' | 'translation' | 'output' | 'scene_remix' | 'picture_description';
```

Add `pictureDescriptionTaskId?: string; image?: string; targetWords?: string[]; simpleVersion?: string[];` to `ReviewItem`.

Add:

```ts
export function createPictureDescriptionReviewItem({
  sourceDayId,
  taskId,
  title,
  image,
  targetWords,
  userAnswer,
  simpleVersion,
  now,
}: {
  sourceDayId: string;
  taskId: string;
  title: string;
  image: string;
  targetWords: string[];
  userAnswer: string;
  simpleVersion: string[];
  now: string;
}): ReviewItem {
  return {
    id: `review-picture-description-${sourceDayId}-${taskId}`,
    type: 'picture_description',
    sourceDayId,
    sourceStepId: 'picture',
    pictureDescriptionTaskId: taskId,
    prompt: title,
    image,
    targetWords,
    userAnswer,
    referenceAnswer: simpleVersion.join(' '),
    simpleVersion,
    priority: 'normal',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function hasActivePictureDescriptionReviewItem(items: ReviewItem[], taskId: string): boolean {
  return items.some(
    (item) =>
      item.type === 'picture_description' &&
      item.status === 'active' &&
      (item.pictureDescriptionTaskId !== undefined
        ? item.pictureDescriptionTaskId === taskId
        : item.id.endsWith(`-${taskId}`)),
  );
}
```

- [ ] **Step 7: Verify and commit**

Run:

```bash
npm test -- src/domain/pictureDescription.test.ts src/domain/progress.test.ts src/domain/review.test.ts
```

Expected: all pass.

Commit:

```bash
git add src/domain/pictureDescription.ts src/domain/pictureDescription.test.ts src/domain/progress.ts src/domain/progress.test.ts src/domain/review.ts src/domain/review.test.ts
git commit -m "feat: add picture description domain"
```

---

### Task 3: Picture Description Persistence

**Files:**
- Modify: `src/storage/progressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.test.ts`

- [ ] **Step 1: Add repository tests**

In `src/storage/indexedDbProgressRepository.test.ts`, add:

```ts
it('saves, gets, and lists picture descriptions', async () => {
  const repository = createIndexedDbProgressRepository(`test-picture-${Date.now()}`);
  const description = {
    id: 'picture-description-day-008',
    dayId: 'day-008',
    taskId: 'picture-day-008-my-room',
    text: 'This is my room. There is a bed. I can see a table.',
    checkedAt: '2026-06-02T00:00:00.000Z',
    feedback: {
      status: 'ready' as const,
      messages: ['Clear enough. You can continue.'],
      simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
    },
    updatedAt: '2026-06-02T00:00:00.000Z',
  };

  await repository.savePictureDescription(description);

  await expect(repository.getPictureDescription('day-008')).resolves.toEqual(description);
  await expect(repository.listPictureDescriptions()).resolves.toEqual([description]);
});
```

- [ ] **Step 2: Add repository types**

In `src/storage/progressRepository.ts`, add:

```ts
export interface PictureDescription {
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
}
```

Add methods to `ProgressRepository`:

```ts
savePictureDescription(description: PictureDescription): Promise<void>;
getPictureDescription(dayId: string): Promise<PictureDescription | null>;
listPictureDescriptions(): Promise<PictureDescription[]>;
```

- [ ] **Step 3: Implement IndexedDB store**

In `src/storage/indexedDbProgressRepository.ts`:

- Bump `DB_VERSION` to `5`.
- Add `pictureDescriptions` store keyed by `dayId`.
- Add schema entry:

```ts
pictureDescriptions: {
  key: string;
  value: PictureDescription;
};
```

- Add upgrade creation:

```ts
if (!db.objectStoreNames.contains('pictureDescriptions')) {
  db.createObjectStore('pictureDescriptions', { keyPath: 'dayId' });
}
```

- Add methods:

```ts
async savePictureDescription(description) {
  const db = await dbPromise;
  await db.put('pictureDescriptions', description);
},

async getPictureDescription(dayId) {
  const db = await dbPromise;
  return (await db.get('pictureDescriptions', dayId)) ?? null;
},

async listPictureDescriptions() {
  const db = await dbPromise;
  return db.getAll('pictureDescriptions');
},
```

- [ ] **Step 4: Update E2E storage seeding**

In `tests/e2e/basic-english.spec.ts`, update helper upgrade code to create `pictureDescriptions` when missing, because tests open the same DB directly.

- [ ] **Step 5: Verify and commit**

Run:

```bash
npm test -- src/storage/indexedDbProgressRepository.test.ts
```

Expected: pass.

Commit:

```bash
git add src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts tests/e2e/basic-english.spec.ts
git commit -m "feat: persist picture descriptions"
```

---

### Task 4: Picture Describe Step UI and Today Integration

**Files:**
- Create: `src/components/PictureDescribeStep.tsx`
- Create: `src/components/PictureDescribeStep.test.tsx`
- Modify: `src/components/Stepper.tsx`
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add component tests**

Create `src/components/PictureDescribeStep.test.tsx` covering:

- renders image, goal, target words, patterns.
- sentence progress starts `0 / 3 sentences`.
- typing and Check shows feedback/simple version and calls `onChange`.
- Continue gate is represented by `onChecked` callback.
- Add to Review calls `onAddToReview` and does not fire for empty text.

Use a minimal task object and `checkPictureDescription`.

- [ ] **Step 2: Implement component**

Create `PictureDescribeStep` with props:

```ts
{
  task: PictureDescribeTask;
  value: PictureDescription;
  onChange: (description: PictureDescription) => void;
  onChecked: (description: PictureDescription) => void;
  onAddToReview: (description: PictureDescription) => void | Promise<void>;
  isReviewAdded?: boolean;
}
```

Behavior:

- Textarea label: `Picture description`.
- Placeholder: `Write 3 simple sentences about the picture.`
- Check runs `checkPictureDescription(task, value.text)`.
- Save feedback, `checkedAt`, `updatedAt`.
- Add to Review disabled when text is empty.

- [ ] **Step 3: Update Stepper**

Add label for `picture` step: `Picture`.

- [ ] **Step 4: Add Today integration tests**

In `src/components/TodayPage.test.tsx`, add tests that:

- completing Translate advances to `Describe the picture`.
- Continue is disabled before Check.
- writing 3 sentences and Check enables Continue.
- Add to Review creates one active picture description review item.
- saved picture description is restored after rerender with same repository.

- [ ] **Step 5: Implement Today integration**

In `TodayPage`:

- Accept prop:

```ts
pictureDescribeTasksByDayId?: Partial<Record<string, PictureDescribeTask>>;
```

- Load saved picture description with `repository.getPictureDescription(day.id)`.
- Keep state `pictureDescriptionDraft`.
- Add `pictureTask = pictureDescribeTasksByDayId[day.id]`.
- Current gate:

```ts
if (currentStep === 'picture') {
  return pictureDescriptionDraft.checkedAt
    ? { isComplete: true, missingRequirements: [] }
    : { isComplete: false, missingRequirements: ['Check your picture description.'] };
}
```

- Render `PictureDescribeStep` for `currentStep === 'picture'`.
- Save changes via `repository.savePictureDescription`.
- Add to Review using `createPictureDescriptionReviewItem` and `hasActivePictureDescriptionReviewItem`.
- If no task exists for a day, allow picture step complete with a short fallback message. This should not happen for Week 1-2 after Task 1.

- [ ] **Step 6: Update styles**

Add `.picture-describe`, `.picture-describe-image`, `.picture-word-list`, `.picture-feedback`, and responsive layout styles. Keep cards at 8px radius or less.

- [ ] **Step 7: Verify and commit**

Run:

```bash
npm test -- src/components/PictureDescribeStep.test.tsx src/components/TodayPage.test.tsx src/domain/progress.test.ts
npm run build
```

Expected: all pass.

Commit:

```bash
git add src/components/PictureDescribeStep.tsx src/components/PictureDescribeStep.test.tsx src/components/Stepper.tsx src/components/TodayPage.tsx src/components/TodayPage.test.tsx src/styles.css
git commit -m "feat: add picture describe to today"
```

---

### Task 5: App, Review, and Me Integration

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/PictureDescriptionReviewCard.tsx`
- Create: `src/components/PictureDescriptionReviewCard.test.tsx`
- Modify: `src/components/ReviewPage.tsx`
- Modify: `src/components/ReviewPage.test.tsx`
- Modify: `src/components/MePage.tsx`
- Modify: `src/components/MePage.test.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Wire App content**

In `src/App.tsx`, import `pictureDescribeTasksByDayId` and pass it to:

- `TodayPage`
- `ReviewPage` if the Review card needs task lookup fallback.
- `MePage`

- [ ] **Step 2: Add Review card tests**

Create `src/components/PictureDescriptionReviewCard.test.tsx` to verify it renders:

- image
- target words
- original answer
- simple version
- revision textarea
- `I know this` callback

- [ ] **Step 3: Implement Review card**

Create `PictureDescriptionReviewCard` with props:

```ts
{
  item: ReviewItem;
  onKnown: () => void | Promise<void>;
}
```

Render title `Review Picture Description`, target words, user answer, simple version, and a textarea labelled `Picture description review answer`.

- [ ] **Step 4: Integrate ReviewPage**

In `ReviewPage`, branch:

```tsx
item.type === 'picture_description' ? (
  <PictureDescriptionReviewCard key={item.id} item={item} onKnown={() => markKnown(item)} />
) : ...
```

- [ ] **Step 5: Add Me tests**

In `src/components/MePage.test.tsx`, add a repository stub where `listPictureDescriptions` returns one checked description. Assert:

- heading `My Descriptions`
- scene title/day label
- text preview
- feedback status

- [ ] **Step 6: Implement Me descriptions**

In `MePage`:

- Load `repository.listPictureDescriptions()`.
- Accept optional `pictureDescribeTasksByDayId`.
- Render checked descriptions only.
- Heading: `My Descriptions`.
- If none: `No picture descriptions saved yet.`

- [ ] **Step 7: Verify and commit**

Run:

```bash
npm test -- src/components/PictureDescriptionReviewCard.test.tsx src/components/ReviewPage.test.tsx src/components/MePage.test.tsx src/App.test.tsx
npm run build
```

Expected: all pass.

Commit:

```bash
git add src/App.tsx src/App.test.tsx src/components/PictureDescriptionReviewCard.tsx src/components/PictureDescriptionReviewCard.test.tsx src/components/ReviewPage.tsx src/components/ReviewPage.test.tsx src/components/MePage.tsx src/components/MePage.test.tsx src/styles.css
git commit -m "feat: review and show picture descriptions"
```

---

### Task 6: E2E and Final Verification

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Update Day 1 E2E flow**

In `completeCurrentDay` and the Day 1 full loop test, add Picture Describe after Translation and before Output:

```ts
await continueTo(page, 'Describe the picture');
await page.getByLabel('Picture description').fill('My name is Li. I am a student. I study English.');
await page.getByRole('button', { name: 'Check' }).click();
await expect(page.getByText('Clear enough. You can continue.')).toBeVisible();
await page.getByRole('button', { name: 'Add to Review' }).click();
await expect(page.getByText('Added to Review')).toBeVisible();
```

Then continue to Output.

- [ ] **Step 2: Update expected review counts**

The Day 1 full loop now adds one extra picture description review item. Update fixed review count expectations by +1 where the test intentionally adds picture review.

- [ ] **Step 3: Add Review and Me E2E assertions**

In the Review section of the Day 1 E2E, assert:

```ts
await expect(page.getByRole('heading', { name: 'Review Picture Description' })).toBeVisible();
await expect(page.getByText('My name is Li. I am a student. I study English.')).toBeVisible();
await page.getByRole('button', { name: 'I know this' }).first().click();
```

In the Me section, assert:

```ts
await expect(page.getByRole('heading', { name: 'My Descriptions' })).toBeVisible();
await expect(page.getByText(/Self Introduction/)).toBeVisible();
```

- [ ] **Step 4: Run targeted E2E**

Run:

```bash
npm run test:e2e -- --grep "Day 1 learning loop"
```

Expected: Chromium and mobile Chrome pass.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/basic-english.spec.ts
git commit -m "test: cover picture describe e2e"
```

- [ ] **Step 7: Inspect final state**

Run:

```bash
git status --short
git diff --stat origin/main..HEAD
```

Expected: working tree clean. Diff is limited to V1.6 spec, plan, picture describe assets, content, domain, storage, Today, Review, Me, styles, and tests.

---

## Acceptance Checklist

- [ ] One Picture Describe task exists for each Week 1 and Week 2 day.
- [ ] Fourteen generated local images exist and are optimized.
- [ ] Today includes Picture Describe after Translate and before Output.
- [ ] Check feedback is local and English-first.
- [ ] Continue unlocks only after Check.
- [ ] Picture description drafts and checked feedback persist.
- [ ] Add to Review creates no duplicate active picture description item.
- [ ] Review page supports picture description review.
- [ ] Me page shows checked descriptions.
- [ ] IndexedDB migration supports the new store.
- [ ] Day 1 E2E covers Picture Describe, Review, and Me.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes.
