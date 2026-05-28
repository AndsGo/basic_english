# Basic English V1.4 Scene Remix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build V1.4 Scene Remix so a learner can reuse a completed daily-life scene in a nearby situation, save the attempt, and send weak remixes to Review.

**Architecture:** Add remix tasks as a separate content map keyed by day id, so the existing course day schema stays stable. Reuse the existing local repository and review-item flow by adding a `scene_remix` review type plus a `SceneRemixAttempt` store. Share one `SceneRemixCard` between the Today completion page and Review page.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, IndexedDB via `idb`, Playwright.

---

## File Structure

- Create `src/content/sceneRemixTasks.ts`: prewritten V1.4 remix tasks grouped by day id.
- Modify `src/content/validateContent.ts`: validate remix task day ids, ids, type, prompts, and reference answers.
- Modify `src/content/validateContent.test.ts`: cover the new validation rules.
- Modify `src/domain/types.ts`: add `SceneRemixTaskType`, `SceneRemixTask`, and `SceneRemixSelfMark`.
- Modify `src/domain/review.ts`: add `scene_remix`, stored remix fields, review creator, and duplicate-active helper.
- Modify `src/domain/review.test.ts`: cover creation, resolving, and duplicate detection for remix review items.
- Modify `src/storage/progressRepository.ts`: add `SceneRemixAttempt` and repository methods.
- Modify `src/storage/indexedDbProgressRepository.ts`: bump DB version and add the `sceneRemixAttempts` store.
- Modify `src/storage/indexedDbProgressRepository.test.ts`: cover attempt persistence, filtering, old progress preservation, and `scene_remix` review persistence.
- Create `src/components/SceneRemixCard.tsx`: shared card used by Today and Review.
- Create `src/components/SceneRemixCard.test.tsx`: component behavior tests.
- Modify `src/styles.css`: add the card layout selectors used by `SceneRemixCard`.
- Modify `src/components/CompletionSummary.tsx`: render one remix card when supplied.
- Modify `src/components/CompletionSummary.test.tsx`: verify card rendering and callback wiring.
- Modify `src/components/TodayPage.tsx`: pass remix task content, save attempts, create review items, and prevent duplicates.
- Modify `src/components/TodayPage.test.tsx`: cover Today completion remix behavior.
- Modify `src/components/ReviewPage.tsx`: render active `scene_remix` items through `SceneRemixCard`.
- Modify `src/components/ReviewPage.test.tsx`: cover review completion and keep-active behavior.
- Modify `src/App.tsx`: pass `sceneRemixTasksByDayId` into `TodayPage`.
- Modify `src/App.test.tsx`, `src/components/MePage.test.tsx`, and any inline repository mocks: add the two repository methods.
- Modify the main E2E spec under `tests/`: cover the complete Day 1 remix and Review loop.

---

### Task 1: Add Remix Types, Starter Content, and Content Validation

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/content/sceneRemixTasks.ts`
- Modify: `src/content/validateContent.ts`
- Modify: `src/content/validateContent.test.ts`

- [ ] **Step 1: Add failing validation tests**

Add tests to `src/content/validateContent.test.ts` near the existing content validation tests:

```ts
import { sceneRemixTasksByDayId } from './sceneRemixTasks';
import { validateSceneRemixTasks } from './validateContent';
import type { SceneRemixTask } from '../domain/types';

describe('validateSceneRemixTasks', () => {
  it('accepts the shipped remix tasks', () => {
    expect(validateSceneRemixTasks(sceneRemixTasksByDayId, basicEnglishCourse)).toEqual([]);
  });

  it('requires day ids to exist in the course', () => {
    const errors = validateSceneRemixTasks(
      {
        'day-999': [
          {
            id: 'day-999-remix-test',
            type: 'replace',
            prompt: 'Change room to office.',
            source: 'My room is small.',
            referenceAnswers: ['My office is small.'],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(errors).toContain('Remix task day day-999 is not in the course.');
  });

  it('requires unique remix task ids', () => {
    const task: SceneRemixTask = {
      id: 'duplicate-remix',
      type: 'replace',
      prompt: 'Change China to Japan.',
      source: 'I am from China.',
      referenceAnswers: ['I am from Japan.'],
    };

    const errors = validateSceneRemixTasks(
      {
        'day-001': [task],
        'day-008': [{ ...task, prompt: 'Change room to office.' }],
      },
      basicEnglishCourse,
    );

    expect(errors).toContain('Remix task id duplicate-remix is duplicated.');
  });

  it('requires valid type, prompt, and reference answers', () => {
    const errors = validateSceneRemixTasks(
      {
        'day-001': [
          {
            id: 'bad-remix',
            type: 'free_write' as SceneRemixTask['type'],
            prompt: ' ',
            referenceAnswers: [''],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(errors).toContain('Remix task bad-remix has invalid type free_write.');
    expect(errors).toContain('Remix task bad-remix has an empty prompt.');
    expect(errors).toContain('Remix task bad-remix has no non-empty reference answers.');
  });

  it('requires starter remix tasks for Day 1 and Day 8', () => {
    const errors = validateSceneRemixTasks({}, basicEnglishCourse);

    expect(errors).toContain('Day day-001 must have at least one remix task.');
    expect(errors).toContain('Day day-008 must have at least one remix task.');
  });
});
```

- [ ] **Step 2: Run the focused validation tests and confirm failure**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: fail because `sceneRemixTasks.ts`, `SceneRemixTask`, and `validateSceneRemixTasks` do not exist yet.

- [ ] **Step 3: Add remix domain types**

Append these exports to `src/domain/types.ts` after `SceneGoal`:

```ts
export type SceneRemixTaskType = 'replace' | 'extend' | 'dialogue';

export interface SceneRemixTask {
  id: string;
  type: SceneRemixTaskType;
  prompt: string;
  source?: string;
  referenceAnswers: string[];
}

export type SceneRemixSelfMark = 'close' | 'review';
```

- [ ] **Step 4: Add starter remix content**

Create `src/content/sceneRemixTasks.ts`:

```ts
import type { SceneRemixTask } from '../domain/types';

export const sceneRemixTasksByDayId: Partial<Record<string, SceneRemixTask[]>> = {
  'day-001': [
    {
      id: 'day-001-remix-country-japan',
      type: 'replace',
      prompt: 'Change China to Japan.',
      source: 'I am from China.',
      referenceAnswers: ['I am from Japan.'],
    },
    {
      id: 'day-001-remix-job-teacher',
      type: 'replace',
      prompt: 'Change student to teacher.',
      source: 'I am a student.',
      referenceAnswers: ['I am a teacher.'],
    },
  ],
  'day-008': [
    {
      id: 'day-008-remix-room-office',
      type: 'replace',
      prompt: 'Change room to office.',
      source: 'My room is small.',
      referenceAnswers: ['My office is small.'],
    },
    {
      id: 'day-008-remix-bed-table',
      type: 'replace',
      prompt: 'Change bed to table.',
      source: 'I have a bed.',
      referenceAnswers: ['I have a table.'],
    },
    {
      id: 'day-008-remix-office-description',
      type: 'extend',
      prompt: 'Describe your office.',
      referenceAnswers: ['This is my office.', 'My office is small.', 'I have a table in my office.'],
    },
  ],
  'day-009': [
    {
      id: 'day-009-remix-book-phone',
      type: 'replace',
      prompt: 'Change book to phone.',
      source: 'There is a book in my room.',
      referenceAnswers: ['There is a phone in my room.'],
    },
    {
      id: 'day-009-remix-cup-bag',
      type: 'replace',
      prompt: 'Change cup to bag.',
      source: 'I have a cup.',
      referenceAnswers: ['I have a bag.'],
    },
  ],
  'day-010': [
    {
      id: 'day-010-remix-on-under',
      type: 'replace',
      prompt: 'Change on to under.',
      source: 'The book is on the table.',
      referenceAnswers: ['The book is under the table.'],
    },
    {
      id: 'day-010-remix-table-chair',
      type: 'replace',
      prompt: 'Change table to chair.',
      source: 'The bag is near the table.',
      referenceAnswers: ['The bag is near the chair.'],
    },
  ],
};
```

- [ ] **Step 5: Implement validation**

Add this export to `src/content/validateContent.ts`:

```ts
import type { Course, SceneRemixTask } from '../domain/types';

const validSceneRemixTaskTypes = new Set<SceneRemixTask['type']>(['replace', 'extend', 'dialogue']);

export function validateSceneRemixTasks(tasksByDayId: Partial<Record<string, SceneRemixTask[]>>, course: Course): string[] {
  const errors: string[] = [];
  const validDayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const seenTaskIds = new Set<string>();

  for (const [dayId, tasks] of Object.entries(tasksByDayId)) {
    if (!validDayIds.has(dayId)) {
      errors.push(`Remix task day ${dayId} is not in the course.`);
    }

    for (const task of tasks ?? []) {
      if (seenTaskIds.has(task.id)) {
        errors.push(`Remix task id ${task.id} is duplicated.`);
      }
      seenTaskIds.add(task.id);

      if (!validSceneRemixTaskTypes.has(task.type)) {
        errors.push(`Remix task ${task.id} has invalid type ${task.type}.`);
      }
      if (!task.prompt.trim()) {
        errors.push(`Remix task ${task.id} has an empty prompt.`);
      }
      if (task.referenceAnswers.filter((answer) => answer.trim().length > 0).length === 0) {
        errors.push(`Remix task ${task.id} has no non-empty reference answers.`);
      }
    }
  }

  for (const requiredDayId of ['day-001', 'day-008']) {
    if ((tasksByDayId[requiredDayId] ?? []).length === 0) {
      errors.push(`Day ${requiredDayId} must have at least one remix task.`);
    }
  }

  return errors;
}
```

If `validateContent.ts` already imports `Course`, merge this import into that line.

- [ ] **Step 6: Run validation tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: pass.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/domain/types.ts src/content/sceneRemixTasks.ts src/content/validateContent.ts src/content/validateContent.test.ts
git commit -m "feat: add scene remix content validation"
```

---

### Task 2: Add Remix Review Domain Support

**Files:**
- Modify: `src/domain/review.ts`
- Modify: `src/domain/review.test.ts`

- [ ] **Step 1: Add failing review-domain tests**

Add these tests to `src/domain/review.test.ts`:

```ts
import {
  createSceneRemixReviewItem,
  hasActiveSceneRemixReviewItem,
  resolveReviewItem,
  type ReviewItem,
} from './review';

describe('scene remix review items', () => {
  it('creates a stable active scene remix review item', () => {
    const item = createSceneRemixReviewItem({
      sourceDayId: 'day-008',
      taskId: 'day-008-remix-room-office',
      prompt: 'Change room to office.',
      source: 'My room is small.',
      userAnswer: 'My office is big.',
      referenceAnswer: 'My office is small.',
      now: '2026-05-28T00:00:00.000Z',
    });

    expect(item).toMatchObject({
      id: 'review-scene-remix-day-008-day-008-remix-room-office',
      type: 'scene_remix',
      sourceDayId: 'day-008',
      sourceStepId: 'output',
      taskId: 'day-008-remix-room-office',
      prompt: 'Change room to office.',
      source: 'My room is small.',
      userAnswer: 'My office is big.',
      referenceAnswer: 'My office is small.',
      priority: 'normal',
      status: 'active',
    });
  });

  it('detects duplicate active scene remix review items by task id', () => {
    const activeItem = createSceneRemixReviewItem({
      sourceDayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      prompt: 'Change China to Japan.',
      userAnswer: 'I am from China.',
      referenceAnswer: 'I am from Japan.',
      now: '2026-05-28T00:00:00.000Z',
    });
    const knownItem: ReviewItem = resolveReviewItem(activeItem, '2026-05-28T00:01:00.000Z');

    expect(hasActiveSceneRemixReviewItem([activeItem], 'day-001-remix-country-japan')).toBe(true);
    expect(hasActiveSceneRemixReviewItem([knownItem], 'day-001-remix-country-japan')).toBe(false);
    expect(hasActiveSceneRemixReviewItem([activeItem], 'day-001-remix-job-teacher')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the focused review tests and confirm failure**

Run:

```bash
npm test -- src/domain/review.test.ts
```

Expected: fail because the new exports and review type do not exist.

- [ ] **Step 3: Extend the review model**

In `src/domain/review.ts`, update the type and interface:

```ts
export type ReviewItemType = 'word' | 'pattern' | 'exercise' | 'translation' | 'output' | 'scene_remix';

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  sourceDayId: string;
  sourceStepId: StepId;
  prompt: string;
  source?: string;
  taskId?: string;
  userAnswer?: string;
  referenceAnswer?: string;
  priority: ReviewPriority;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}
```

Add these exports after the existing review creators:

```ts
export function createSceneRemixReviewItem({
  sourceDayId,
  taskId,
  prompt,
  source,
  userAnswer,
  referenceAnswer,
  now,
}: {
  sourceDayId: string;
  taskId: string;
  prompt: string;
  source?: string;
  userAnswer: string;
  referenceAnswer: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-scene-remix-${sourceDayId}-${taskId}`,
    type: 'scene_remix',
    sourceDayId,
    sourceStepId: 'output',
    taskId,
    prompt,
    source,
    userAnswer,
    referenceAnswer,
    priority: 'normal',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function hasActiveSceneRemixReviewItem(items: ReviewItem[], taskId: string): boolean {
  return items.some((item) => item.type === 'scene_remix' && item.taskId === taskId && item.status === 'active');
}
```

- [ ] **Step 4: Run review tests**

Run:

```bash
npm test -- src/domain/review.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/domain/review.ts src/domain/review.test.ts
git commit -m "feat: add scene remix review items"
```

---

### Task 3: Persist Scene Remix Attempts

**Files:**
- Modify: `src/storage/progressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.test.ts`
- Modify: repository mocks in `src/App.test.tsx`, `src/components/MePage.test.tsx`, `src/components/TodayPage.test.tsx`, and any test compile failures found by TypeScript.

- [ ] **Step 1: Add failing IndexedDB tests**

Add tests to `src/storage/indexedDbProgressRepository.test.ts`:

```ts
import type { SceneRemixAttempt } from './progressRepository';

it('saves and lists scene remix attempts', async () => {
  const repo = createIndexedDbProgressRepository('scene-remix-attempts-test');
  const first: SceneRemixAttempt = {
    id: 'remix-attempt-1',
    dayId: 'day-001',
    taskId: 'day-001-remix-country-japan',
    userAnswer: 'I am from Japan.',
    selfMark: 'close',
    createdAt: '2026-05-28T00:00:00.000Z',
  };
  const second: SceneRemixAttempt = {
    id: 'remix-attempt-2',
    dayId: 'day-008',
    taskId: 'day-008-remix-room-office',
    userAnswer: 'My office is small.',
    selfMark: 'review',
    createdAt: '2026-05-28T00:01:00.000Z',
  };

  await repo.saveSceneRemixAttempt(first);
  await repo.saveSceneRemixAttempt(second);

  expect(await repo.listSceneRemixAttempts()).toEqual([first, second]);
  expect(await repo.listSceneRemixAttempts('day-001')).toEqual([first]);
});

it('persists scene remix review items', async () => {
  const repo = createIndexedDbProgressRepository('scene-remix-review-test');
  const item = createSceneRemixReviewItem({
    sourceDayId: 'day-001',
    taskId: 'day-001-remix-country-japan',
    prompt: 'Change China to Japan.',
    userAnswer: 'I am from China.',
    referenceAnswer: 'I am from Japan.',
    now: '2026-05-28T00:00:00.000Z',
  });

  await repo.saveReviewItem(item);

  expect(await repo.getReviewItem(item.id)).toEqual(item);
  expect(await repo.listReviewItems('active')).toEqual([item]);
});

it('keeps existing user output data readable when the database version upgrades', async () => {
  const repo = createIndexedDbProgressRepository('scene-remix-upgrade-preserves-output');
  await repo.saveUserOutput({
    id: 'output-day-001',
    dayId: 'day-001',
    text: 'I am from China.',
    sentenceCount: 1,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: true,
      usedLessonWords: true,
      hasSubjects: true,
      meaningIsClear: true,
    },
    updatedAt: '2026-05-28T00:00:00.000Z',
  });

  const reopened = createIndexedDbProgressRepository('scene-remix-upgrade-preserves-output');

  expect(await reopened.getUserOutput('day-001')).toMatchObject({
    dayId: 'day-001',
    text: 'I am from China.',
    sentenceCount: 1,
  });
});
```

- [ ] **Step 2: Run the focused storage tests and confirm failure**

Run:

```bash
npm test -- src/storage/indexedDbProgressRepository.test.ts
```

Expected: fail because repository methods and the object store do not exist.

- [ ] **Step 3: Extend the repository interface**

In `src/storage/progressRepository.ts`, import `SceneRemixSelfMark`:

```ts
import type { SceneOutput, SceneRemixSelfMark } from '../domain/types';
```

Add the attempt interface after `ExerciseAttempt`:

```ts
export interface SceneRemixAttempt {
  id: string;
  dayId: string;
  taskId: string;
  userAnswer: string;
  selfMark: SceneRemixSelfMark;
  createdAt: string;
}
```

Add methods to `ProgressRepository` after exercise attempt methods:

```ts
saveSceneRemixAttempt(attempt: SceneRemixAttempt): Promise<void>;
listSceneRemixAttempts(dayId?: string): Promise<SceneRemixAttempt[]>;
```

- [ ] **Step 4: Add the IndexedDB store and methods**

In `src/storage/indexedDbProgressRepository.ts`, import `SceneRemixAttempt` and bump version:

```ts
import type {
  ExerciseAttempt,
  ProgressRepository,
  SceneRemixAttempt,
  StepCompletion,
  StepProgress,
  StudyActivity,
  UserOutput,
  WordProgress,
} from './progressRepository';

const DB_VERSION = 4;
```

Add the schema block:

```ts
sceneRemixAttempts: {
  key: string;
  value: SceneRemixAttempt;
  indexes: { byDayId: string };
};
```

Add this upgrade block after `exerciseAttempts`:

```ts
if (!db.objectStoreNames.contains('sceneRemixAttempts')) {
  const store = db.createObjectStore('sceneRemixAttempts', { keyPath: 'id' });
  store.createIndex('byDayId', 'dayId');
}
```

Add repository methods after `listExerciseAttempts`:

```ts
async saveSceneRemixAttempt(attempt) {
  const db = await dbPromise;
  await db.put('sceneRemixAttempts', attempt);
},

async listSceneRemixAttempts(dayId) {
  const db = await dbPromise;
  const attempts = await db.getAll('sceneRemixAttempts');
  return attempts
    .filter((attempt) => (dayId ? attempt.dayId === dayId : true))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
},
```

- [ ] **Step 5: Update repository mocks**

Add these methods to every object typed as `ProgressRepository` or spread from a mock repository:

```ts
saveSceneRemixAttempt: vi.fn().mockResolvedValue(undefined),
listSceneRemixAttempts: vi.fn().mockResolvedValue([]),
```

For `createTestRepository` in `src/components/TodayPage.test.tsx`, store attempts in a local array:

```ts
const sceneRemixAttempts: SceneRemixAttempt[] = [];

async saveSceneRemixAttempt(attempt: SceneRemixAttempt) {
  sceneRemixAttempts.push(attempt);
},
async listSceneRemixAttempts(dayId?: string) {
  return sceneRemixAttempts.filter((attempt) => (dayId ? attempt.dayId === dayId : true));
},
```

- [ ] **Step 6: Run storage and type checks**

Run:

```bash
npm test -- src/storage/indexedDbProgressRepository.test.ts
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts src/App.test.tsx src/components/MePage.test.tsx src/components/TodayPage.test.tsx
git commit -m "feat: persist scene remix attempts"
```

---

### Task 4: Build the Shared SceneRemixCard

**Files:**
- Create: `src/components/SceneRemixCard.tsx`
- Create: `src/components/SceneRemixCard.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add failing component tests**

Create `src/components/SceneRemixCard.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SceneRemixCard } from './SceneRemixCard';
import type { SceneRemixTask } from '../domain/types';

const task: SceneRemixTask = {
  id: 'day-008-remix-room-office',
  type: 'replace',
  prompt: 'Change room to office.',
  source: 'My room is small.',
  referenceAnswers: ['My office is small.'],
};

describe('SceneRemixCard', () => {
  it('collects an answer and hides references before reveal', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is small.');

    expect(screen.getByDisplayValue('My office is small.')).toBeInTheDocument();
    expect(screen.queryByText('My office is small.', { selector: '.reference-answer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close enough' })).not.toBeInTheDocument();
  });

  it('reveals references and submits close enough', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is small.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close enough' }));

    expect(screen.getByText('My office is small.', { selector: '.reference-answer' })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({
      userAnswer: 'My office is small.',
      selfMark: 'close',
    });
  });

  it('submits need review after reveal', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is big.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

    expect(onSubmit).toHaveBeenCalledWith({
      userAnswer: 'My office is big.',
      selfMark: 'review',
    });
  });
});
```

- [ ] **Step 2: Run the component tests and confirm failure**

Run:

```bash
npm test -- src/components/SceneRemixCard.test.tsx
```

Expected: fail because the component does not exist.

- [ ] **Step 3: Implement SceneRemixCard**

Create `src/components/SceneRemixCard.tsx`:

```tsx
import { useState } from 'react';
import type { SceneRemixSelfMark, SceneRemixTask } from '../domain/types';

export interface SceneRemixSubmitResult {
  userAnswer: string;
  selfMark: SceneRemixSelfMark;
}

export function SceneRemixCard({
  task,
  title = 'Try Another Scene',
  initialAnswer = '',
  onSubmit,
}: {
  task: SceneRemixTask;
  title?: string;
  initialAnswer?: string;
  onSubmit: (result: SceneRemixSubmitResult) => void | Promise<void>;
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [isReferenceVisible, setIsReferenceVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trimmedAnswer = answer.trim();

  const submit = async (selfMark: SceneRemixSelfMark) => {
    if (!trimmedAnswer || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ userAnswer: trimmedAnswer, selfMark });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="scene-remix-card">
      <p className="eyebrow">{task.type}</p>
      <h3>{title}</h3>
      <p>{task.prompt}</p>
      {task.source && (
        <p className="scene-remix-source">
          <strong>Source</strong>: {task.source}
        </p>
      )}
      <label className="field-label" htmlFor={`scene-remix-answer-${task.id}`}>
        Scene remix answer
      </label>
      <textarea
        id={`scene-remix-answer-${task.id}`}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        rows={4}
      />
      <button type="button" className="secondary-button" onClick={() => setIsReferenceVisible(true)} disabled={!trimmedAnswer}>
        Show reference
      </button>
      {isReferenceVisible && (
        <div className="scene-remix-reference">
          <p>
            <strong>Reference</strong>
          </p>
          {task.referenceAnswers.map((referenceAnswer) => (
            <p key={referenceAnswer} className="reference-answer">
              {referenceAnswer}
            </p>
          ))}
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={() => void submit('close')} disabled={isSubmitting}>
              Close enough
            </button>
            <button type="button" className="secondary-button" onClick={() => void submit('review')} disabled={isSubmitting}>
              Need review
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Add minimal styling if the card needs layout support**

In `src/styles.css`, add:

```css
.scene-remix-card {
  display: grid;
  gap: 0.75rem;
}

.scene-remix-card textarea {
  width: 100%;
  resize: vertical;
}

.scene-remix-source,
.scene-remix-reference {
  margin: 0;
}
```

Keep these selectors aligned with existing button and form styles.

- [ ] **Step 5: Run component tests**

Run:

```bash
npm test -- src/components/SceneRemixCard.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/components/SceneRemixCard.tsx src/components/SceneRemixCard.test.tsx src/styles.css
git commit -m "feat: add scene remix card"
```

---

### Task 5: Integrate Remix on Today Completion

**Files:**
- Modify: `src/components/CompletionSummary.tsx`
- Modify: `src/components/CompletionSummary.test.tsx`
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Add failing CompletionSummary tests**

Add to `src/components/CompletionSummary.test.tsx`:

```tsx
import type { SceneRemixTask } from '../domain/types';

const remixTask: SceneRemixTask = {
  id: 'day-001-remix-country-japan',
  type: 'replace',
  prompt: 'Change China to Japan.',
  source: 'I am from China.',
  referenceAnswers: ['I am from Japan.'],
};

it('renders a remix card after day completion when a task is provided', () => {
  render(
    <CompletionSummary
      day={day1}
      output={sceneOutput}
      reviewCount={0}
      remixTask={remixTask}
      onSceneRemixSubmit={vi.fn()}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Try Another Scene' })).toBeInTheDocument();
  expect(screen.getByText('Change China to Japan.')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run CompletionSummary tests and confirm failure**

Run:

```bash
npm test -- src/components/CompletionSummary.test.tsx
```

Expected: fail because `remixTask` and `onSceneRemixSubmit` props are not accepted.

- [ ] **Step 3: Wire CompletionSummary to SceneRemixCard**

Update `src/components/CompletionSummary.tsx` imports:

```ts
import type { Day, SceneRemixTask } from '../domain/types';
import type { SceneRemixSubmitResult } from './SceneRemixCard';
import { SceneRemixCard } from './SceneRemixCard';
```

Update props:

```ts
remixTask,
onSceneRemixSubmit,
```

and the prop type:

```ts
remixTask?: SceneRemixTask;
onSceneRemixSubmit?: (task: SceneRemixTask, result: SceneRemixSubmitResult) => void | Promise<void>;
```

Render before the next-day button:

```tsx
{remixTask && onSceneRemixSubmit && (
  <SceneRemixCard task={remixTask} onSubmit={(result) => onSceneRemixSubmit(remixTask, result)} />
)}
```

- [ ] **Step 4: Add failing Today tests**

Add tests to `src/components/TodayPage.test.tsx`:

```tsx
import { sceneRemixTasksByDayId } from '../content/sceneRemixTasks';

it('shows a remix task on completed days with remix content', async () => {
  const repository = createTestRepository({
    dayProgress: [
      {
        id: 'progress-day-001',
        dayId: 'day-001',
        contentVersion: week1Course.contentVersion,
        currentStep: 'done',
        status: 'completed',
        startedAt: '2026-05-28T00:00:00.000Z',
        updatedAt: '2026-05-28T00:00:00.000Z',
      },
    ],
    userOutputs: [
      {
        id: 'output-day-001',
        dayId: 'day-001',
        text: 'I am from China.',
        sentenceCount: 1,
        selfRating: 'ok',
        checklist: {
          usedTargetPattern: true,
          usedLessonWords: true,
          hasSubjects: true,
          meaningIsClear: true,
        },
        updatedAt: '2026-05-28T00:00:00.000Z',
      },
    ],
  });

  renderWithSpeech(<TodayPage course={week1Course} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

  expect(await screen.findByRole('heading', { name: 'Try Another Scene' })).toBeInTheDocument();
  expect(screen.getByText('Change China to Japan.')).toBeInTheDocument();
});

it('saves a close-enough remix attempt without creating review', async () => {
  const repository = createTestRepository({ dayProgress: completedDay1Progress, userOutputs: completedDay1Outputs });
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

  await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from Japan.');
  await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
  await userEvent.click(screen.getByRole('button', { name: 'Close enough' }));

  expect(await repository.listSceneRemixAttempts('day-001')).toHaveLength(1);
  expect(await repository.listReviewItems('active')).toHaveLength(0);
});

it('saves a review remix attempt and creates one active scene remix review item', async () => {
  const repository = createTestRepository({ dayProgress: completedDay1Progress, userOutputs: completedDay1Outputs });
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

  await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from China.');
  await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
  await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

  const attempts = await repository.listSceneRemixAttempts('day-001');
  const reviews = await repository.listReviewItems('active');
  expect(attempts).toHaveLength(1);
  expect(reviews).toHaveLength(1);
  expect(reviews[0]).toMatchObject({ type: 'scene_remix', taskId: 'day-001-remix-country-japan' });
});

it('does not create duplicate active remix review items for the same task', async () => {
  const repository = createTestRepository({ dayProgress: completedDay1Progress, userOutputs: completedDay1Outputs });
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

  await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from China.');
  await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
  await userEvent.click(screen.getByRole('button', { name: 'Need review' }));
  await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

  expect(await repository.listSceneRemixAttempts('day-001')).toHaveLength(2);
  expect(await repository.listReviewItems('active')).toHaveLength(1);
});
```

If `completedDay1Progress` and `completedDay1Outputs` do not exist, define them near the tests using the full objects from the first test.

- [ ] **Step 5: Run Today tests and confirm failure**

Run:

```bash
npm test -- src/components/CompletionSummary.test.tsx src/components/TodayPage.test.tsx
```

Expected: Today tests fail because `TodayPage` does not accept remix tasks or persist attempts.

- [ ] **Step 6: Implement Today integration**

Update imports in `src/components/TodayPage.tsx`:

```ts
import {
  createExerciseReviewItem,
  createOutputReviewItem,
  createSceneRemixReviewItem,
  createTranslationReviewItem,
  createWordReviewItem,
  hasActiveSceneRemixReviewItem,
  type ReviewItem,
} from '../domain/review';
import type { Course, Exercise, SceneGoal, SceneOutput, SceneRemixTask, TranslationExercise, Word } from '../domain/types';
import type { SceneRemixSubmitResult } from './SceneRemixCard';
```

Add prop:

```ts
sceneRemixTasksByDayId = {},
```

and prop type:

```ts
sceneRemixTasksByDayId?: Partial<Record<string, SceneRemixTask[]>>;
```

Compute the first task:

```ts
const remixTask = sceneRemixTasksByDayId[day.id]?.[0];
```

Add helper:

```ts
function makeSceneRemixAttemptId(dayId: string, taskId: string, now: string): string {
  return `scene-remix-attempt-${dayId}-${taskId}-${now}`;
}
```

Add handler inside `TodayPage`:

```ts
const handleSceneRemixSubmit = async (task: SceneRemixTask, result: SceneRemixSubmitResult) => {
  const now = new Date().toISOString();
  await repository.saveSceneRemixAttempt({
    id: makeSceneRemixAttemptId(day.id, task.id, now),
    dayId: day.id,
    taskId: task.id,
    userAnswer: result.userAnswer,
    selfMark: result.selfMark,
    createdAt: now,
  });

  if (result.selfMark === 'review') {
    const activeItems = await repository.listReviewItems('active');
    if (!hasActiveSceneRemixReviewItem(activeItems, task.id)) {
      await repository.saveReviewItem(
        createSceneRemixReviewItem({
          sourceDayId: day.id,
          taskId: task.id,
          prompt: task.prompt,
          source: task.source,
          userAnswer: result.userAnswer,
          referenceAnswer: task.referenceAnswers[0],
          now,
        }),
      );
    }
    setActiveReviewItems(await repository.listReviewItems('active'));
    onProgressChange?.();
  }
};
```

Pass props to `CompletionSummary`:

```tsx
remixTask={remixTask}
onSceneRemixSubmit={handleSceneRemixSubmit}
```

Update `src/App.tsx`:

```ts
import { sceneRemixTasksByDayId } from './content/sceneRemixTasks';
```

Pass:

```tsx
sceneRemixTasksByDayId={sceneRemixTasksByDayId}
```

- [ ] **Step 7: Run Today tests**

Run:

```bash
npm test -- src/components/CompletionSummary.test.tsx src/components/TodayPage.test.tsx
```

Expected: pass.

- [ ] **Step 8: Commit Task 5**

```bash
git add src/components/CompletionSummary.tsx src/components/CompletionSummary.test.tsx src/components/TodayPage.tsx src/components/TodayPage.test.tsx src/App.tsx
git commit -m "feat: add scene remix to today completion"
```

---

### Task 6: Integrate Remix Review Items on Review Page

**Files:**
- Modify: `src/components/ReviewPage.tsx`
- Modify: `src/components/ReviewPage.test.tsx`

- [ ] **Step 1: Add failing ReviewPage tests**

Add tests to `src/components/ReviewPage.test.tsx`:

```tsx
import { createSceneRemixReviewItem } from '../domain/review';

it('renders and completes an active scene remix review item', async () => {
  const repo = createIndexedDbProgressRepository('review-page-scene-remix-close');
  const onReviewChange = vi.fn();
  const item = createSceneRemixReviewItem({
    sourceDayId: 'day-001',
    taskId: 'day-001-remix-country-japan',
    prompt: 'Change China to Japan.',
    source: 'I am from China.',
    userAnswer: 'I am from China.',
    referenceAnswer: 'I am from Japan.',
    now: '2026-05-28T00:00:00.000Z',
  });
  await repo.saveReviewItem(item);

  render(<ReviewPage repository={repo} onReviewChange={onReviewChange} />);

  await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from Japan.');
  await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
  await userEvent.click(screen.getByRole('button', { name: 'Close enough' }));

  expect(await repo.listSceneRemixAttempts('day-001')).toHaveLength(1);
  expect(await repo.listReviewItems('active')).toHaveLength(0);
  expect(onReviewChange).toHaveBeenCalled();
});

it('keeps a scene remix review item active when marked need review', async () => {
  const repo = createIndexedDbProgressRepository('review-page-scene-remix-review');
  const item = createSceneRemixReviewItem({
    sourceDayId: 'day-001',
    taskId: 'day-001-remix-country-japan',
    prompt: 'Change China to Japan.',
    userAnswer: 'I am from China.',
    referenceAnswer: 'I am from Japan.',
    now: '2026-05-28T00:00:00.000Z',
  });
  await repo.saveReviewItem(item);

  render(<ReviewPage repository={repo} />);

  await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from China.');
  await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
  await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

  expect(await repo.listSceneRemixAttempts('day-001')).toHaveLength(1);
  expect(await repo.listReviewItems('active')).toHaveLength(1);
});
```

- [ ] **Step 2: Run ReviewPage tests and confirm failure**

Run:

```bash
npm test -- src/components/ReviewPage.test.tsx
```

Expected: fail because `scene_remix` items render as generic cards and do not save attempts.

- [ ] **Step 3: Implement ReviewPage remix behavior**

Update imports in `src/components/ReviewPage.tsx`:

```ts
import type { SceneRemixTask } from '../domain/types';
import type { SceneRemixSubmitResult } from './SceneRemixCard';
import { SceneRemixCard } from './SceneRemixCard';
```

Add helper functions above the component:

```ts
function makeSceneRemixTaskFromReviewItem(item: ReviewItem): SceneRemixTask {
  return {
    id: item.taskId ?? item.id,
    type: 'replace',
    prompt: item.prompt,
    source: item.source,
    referenceAnswers: item.referenceAnswer ? [item.referenceAnswer] : [],
  };
}

function makeSceneRemixReviewAttemptId(dayId: string, taskId: string, now: string): string {
  return `scene-remix-review-attempt-${dayId}-${taskId}-${now}`;
}
```

Add handler inside `ReviewPage`:

```ts
const markSceneRemix = async (item: ReviewItem, result: SceneRemixSubmitResult) => {
  const now = new Date().toISOString();
  const taskId = item.taskId ?? item.id;
  await repository.saveSceneRemixAttempt({
    id: makeSceneRemixReviewAttemptId(item.sourceDayId, taskId, now),
    dayId: item.sourceDayId,
    taskId,
    userAnswer: result.userAnswer,
    selfMark: result.selfMark,
    createdAt: now,
  });

  if (result.selfMark === 'close') {
    await repository.saveReviewItem(resolveReviewItem(item, now));
  } else {
    await repository.saveReviewItem({
      ...item,
      userAnswer: result.userAnswer,
      status: 'active',
      updatedAt: now,
    });
  }
  await loadItems();
  onReviewChange?.();
};
```

In the item render loop, branch before the generic article:

```tsx
{item.type === 'scene_remix' ? (
  <SceneRemixCard
    key={item.id}
    title="Review Scene Remix"
    task={makeSceneRemixTaskFromReviewItem(item)}
    initialAnswer=""
    onSubmit={(result) => markSceneRemix(item, result)}
  />
) : (
  <article key={item.id} className="review-card">
    ...
  </article>
)}
```

- [ ] **Step 4: Run ReviewPage tests**

Run:

```bash
npm test -- src/components/ReviewPage.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit Task 6**

```bash
git add src/components/ReviewPage.tsx src/components/ReviewPage.test.tsx
git commit -m "feat: review scene remix items"
```

---

### Task 7: Add E2E Coverage for the Remix Loop

**Files:**
- Modify: the Playwright spec under `tests/` that already completes Day 1 and checks Review.

- [ ] **Step 1: Locate the Day 1 E2E flow**

Run:

```bash
rg -n "Day 1|Review tomorrow|Scene Map|Continue|I am from" tests
```

Expected: output identifies the spec that completes Day 1.

- [ ] **Step 2: Add the failing E2E assertions**

In the Day 1 flow, after the day completion summary appears, add:

```ts
await expect(page.getByRole('heading', { name: 'Try Another Scene' })).toBeVisible();
await page.getByLabel('Scene remix answer').fill('I am from China.');
await page.getByRole('button', { name: 'Show reference' }).click();
await expect(page.getByText('I am from Japan.')).toBeVisible();
await page.getByRole('button', { name: 'Need review' }).click();

await page.getByRole('button', { name: 'Review' }).click();
await expect(page.getByRole('heading', { name: 'Review Scene Remix' })).toBeVisible();
await page.getByLabel('Scene remix answer').fill('I am from Japan.');
await page.getByRole('button', { name: 'Show reference' }).click();
await page.getByRole('button', { name: 'Close enough' }).click();
await expect(page.getByRole('heading', { name: 'Review Scene Remix' })).not.toBeVisible();

await page.reload();
await page.getByRole('button', { name: 'Review' }).click();
await expect(page.getByRole('heading', { name: 'Review Scene Remix' })).not.toBeVisible();
```

If the app uses nav links instead of buttons, keep the role and name aligned with the existing E2E file.

- [ ] **Step 3: Run the E2E spec and confirm failure if implementation is incomplete**

Run:

```bash
npm run test:e2e -- --grep "Day 1"
```

Expected: pass if Tasks 1-6 were implemented correctly. If grep does not match, run the specific file found in Step 1.

- [ ] **Step 4: Verify Scene Map status is not affected by remix attempts**

Add an assertion near the existing Scene Map checks:

```ts
await page.getByRole('button', { name: 'Today' }).click();
await expect(page.getByText('Can describe this scene')).toBeVisible();
```

Use the exact visible Scene Map text from the existing spec. The assertion must confirm scene completion remains driven by the completed output, not by remix self-mark.

- [ ] **Step 5: Run all E2E tests**

Run:

```bash
npm run test:e2e
```

Expected: pass.

- [ ] **Step 6: Commit Task 7**

```bash
git add tests
git commit -m "test: cover scene remix e2e flow"
```

---

### Task 8: Full Verification and Cleanup

**Files:**
- Review all modified files from Tasks 1-7.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: all Vitest tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript build and Vite build pass.

- [ ] **Step 3: Run E2E**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 4: Inspect git diff for accidental scope creep**

Run:

```bash
git diff --stat HEAD~7..HEAD
git status --short
```

Expected: changes are limited to V1.4 Scene Remix code, tests, and this plan. Working tree is clean after commits.

- [ ] **Step 5: Commit any final fixes**

If Step 1-4 require small corrections, commit them:

```bash
git add <fixed-files>
git commit -m "fix: polish scene remix flow"
```

If there are no fixes, do not create an empty commit.

---

## Acceptance Checklist

- [ ] Today completion shows one `Try Another Scene` card for days with remix tasks.
- [ ] Learner can enter a remix answer, reveal reference answers, and self-mark.
- [ ] `Close enough` saves a `SceneRemixAttempt` and does not create a review item.
- [ ] `Need review` saves a `SceneRemixAttempt` and creates one active `scene_remix` item.
- [ ] Repeated `Need review` for the same task does not create duplicate active review items.
- [ ] Review page renders active `scene_remix` items with the same card interaction.
- [ ] Review `Close enough` resolves the review item.
- [ ] Review `Need review` keeps the item active and saves a new attempt.
- [ ] Scene Map remains based on scene output completion, not remix attempts.
- [ ] Existing V1.3 scene output flow still works.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes.
