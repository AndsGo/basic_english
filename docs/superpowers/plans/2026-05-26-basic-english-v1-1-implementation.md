# Basic English V1.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V1.1 Week 1 playable learning loop: current-day progression, completion gates, active review items, Course states, progress profile, and E2E coverage.

**Architecture:** Keep the app frontend-only with typed static content and IndexedDB persistence. Put business rules in pure domain modules, keep repository code as persistence adapters, and keep React components focused on rendering state and dispatching user actions.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, fake-indexeddb, IndexedDB via `idb`, Playwright.

---

## Spec Source

Implement against:

- `docs/superpowers/specs/2026-05-26-basic-english-v1-1-design.md`

Current important files:

- `src/domain/progress.ts`: existing step order and basic day progress helpers.
- `src/domain/review.ts`: existing word review selector only.
- `src/storage/progressRepository.ts`: repository interfaces.
- `src/storage/indexedDbProgressRepository.ts`: IndexedDB adapter.
- `src/components/TodayPage.tsx`: currently fixed to Day 1.
- `src/components/ExerciseRenderer.tsx`: drills have partial active input.
- `src/components/TranslationTask.tsx`: currently shows references without user answer.
- `src/components/CoursePage.tsx`: static Week 1 list.
- `src/components/ReviewPage.tsx`: current empty Review page.
- `src/components/MePage.tsx`: minimal Day 1 output summary.
- `tests/e2e/basic-english.spec.ts`: existing E2E coverage.

## File Structure and Responsibilities

Create:

- `src/domain/exercises.ts`: answer checking, sentence counting, drill completion summaries.
- `src/domain/exercises.test.ts`: pure tests for exercise rules.
- `src/domain/stepCompletion.ts`: step completion rules for Words, Patterns, Drills, Translate, Output.
- `src/domain/stepCompletion.test.ts`: pure tests for completion gates.
- `src/components/ReviewPage.test.tsx`: Review page behavior tests.
- `src/components/CoursePage.test.tsx`: Course state rendering tests.

Modify:

- `src/domain/progress.ts`: add locked status support, current day selection, day status derivation, streak helper.
- `src/domain/progress.test.ts`: test unlock and current-day rules.
- `src/domain/review.ts`: add `ReviewItem`, creation helpers, summary helpers.
- `src/domain/review.test.ts`: test review item creation and resolution.
- `src/storage/progressRepository.ts`: add review, output list, attempt list, step completion interfaces.
- `src/storage/indexedDbProgressRepository.ts`: add stores and methods.
- `src/storage/indexedDbProgressRepository.test.ts`: test review persistence and migration.
- `src/components/TodayPage.tsx`: use current day, completion gates, review item creation, next-day CTA.
- `src/components/ExerciseRenderer.tsx`: make all drill types active and report attempts.
- `src/components/TranslationTask.tsx`: require user input and self-mark.
- `src/components/OutputTaskEditor.tsx`: support sentence count and completion state.
- `src/components/CompletionSummary.tsx`: show day summary and next-day action.
- `src/components/CoursePage.tsx`: show Week 1 map with statuses.
- `src/components/ReviewPage.tsx`: show and resolve active review items.
- `src/components/MePage.tsx`: show Week 1 progress, streak, review count, saved outputs.
- `src/components/Layout.tsx`: optional Review count badge in bottom navigation.
- `src/App.tsx`: pass repository and navigation callbacks to pages.
- `tests/e2e/basic-english.spec.ts`: cover V1.1 loop.

---

### Task 1: Add Pure Progress and Exercise Rules

**Files:**
- Modify: `src/domain/progress.ts`
- Modify: `src/domain/progress.test.ts`
- Create: `src/domain/exercises.ts`
- Create: `src/domain/exercises.test.ts`

- [ ] **Step 1: Write failing progress tests**

Add these tests to `src/domain/progress.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  completeStep,
  deriveCourseDayStates,
  getCurrentDayId,
  getNextUnlockedDayId,
  startDay,
  updateStreak,
} from './progress';

describe('progress V1.1 rules', () => {
  const orderedDayIds = ['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006', 'day-007'];

  it('keeps Day 1 current for a new learner', () => {
    expect(getCurrentDayId([], orderedDayIds)).toBe('day-001');
  });

  it('unlocks the next incomplete day after completion', () => {
    expect(getNextUnlockedDayId(['day-001', 'day-002'], orderedDayIds)).toBe('day-003');
    expect(getCurrentDayId(['day-001', 'day-002'], orderedDayIds)).toBe('day-003');
  });

  it('keeps Day 7 current after the full week is complete', () => {
    expect(getCurrentDayId(orderedDayIds, orderedDayIds)).toBe('day-007');
  });

  it('derives completed, current, locked, and review-needed day states', () => {
    const states = deriveCourseDayStates({
      orderedDayIds,
      completedDayIds: ['day-001'],
      activeReviewDayIds: ['day-001'],
    });

    expect(states).toEqual({
      'day-001': 'review_needed',
      'day-002': 'current',
      'day-003': 'locked',
      'day-004': 'locked',
      'day-005': 'locked',
      'day-006': 'locked',
      'day-007': 'locked',
    });
  });

  it('tracks a simple local-date streak', () => {
    expect(updateStreak([], '2026-05-26')).toEqual(['2026-05-26']);
    expect(updateStreak(['2026-05-26'], '2026-05-26')).toEqual(['2026-05-26']);
    expect(updateStreak(['2026-05-26'], '2026-05-27')).toEqual(['2026-05-26', '2026-05-27']);
    expect(updateStreak(['2026-05-26'], '2026-05-28')).toEqual(['2026-05-28']);
  });

  it('records completed steps while moving through the day', () => {
    const started = startDay('day-001', '1.0.0', '2026-05-26T00:00:00.000Z');
    const updated = completeStep(started, 'review', '2026-05-26T00:01:00.000Z');

    expect(updated.completedStepIds).toContain('review');
    expect(updated.currentStep).toBe('words');
    expect(updated.status).toBe('in_progress');
  });
});
```

- [ ] **Step 2: Run progress tests to verify failure**

Run:

```powershell
npm test -- src/domain/progress.test.ts
```

Expected: FAIL because `deriveCourseDayStates`, `getCurrentDayId`, `updateStreak`, `completedStepIds`, and `review_needed` status support are not implemented.

- [ ] **Step 3: Implement progress rules**

Update `src/domain/progress.ts` with these additions while preserving the existing `StepId` and `stepOrder` exports:

```ts
export type StepId = 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'output' | 'done';

export type DayProgressStatus = 'locked' | 'not_started' | 'in_progress' | 'completed';
export type CourseDayState = 'completed' | 'current' | 'locked' | 'review_needed';

export interface DayProgress {
  id: string;
  dayId: string;
  status: DayProgressStatus;
  currentStep: StepId;
  completedStepIds: StepId[];
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  contentVersion: string;
}

export const stepOrder: StepId[] = ['review', 'words', 'patterns', 'drills', 'translate', 'output', 'done'];

export function startDay(dayId: string, contentVersion: string, now: string): DayProgress {
  return {
    id: dayId,
    dayId,
    status: 'in_progress',
    currentStep: 'review',
    completedStepIds: [],
    startedAt: now,
    updatedAt: now,
    contentVersion,
  };
}

export function normalizeDayProgress(progress: DayProgress): DayProgress {
  return {
    ...progress,
    completedStepIds: progress.completedStepIds ?? [],
  };
}

export function completeStep(progress: DayProgress, step: StepId, now: string): DayProgress {
  const normalized = normalizeDayProgress(progress);
  const currentIndex = stepOrder.indexOf(step);
  const nextStep = stepOrder[currentIndex + 1] ?? 'done';
  const completedStepIds = Array.from(new Set([...normalized.completedStepIds, step]));

  return {
    ...normalized,
    completedStepIds,
    currentStep: nextStep,
    status: nextStep === 'done' ? 'completed' : 'in_progress',
    completedAt: nextStep === 'done' ? now : normalized.completedAt,
    updatedAt: now,
  };
}

export function getNextUnlockedDayId(completedDayIds: string[], orderedDayIds: string[]): string {
  const completed = new Set(completedDayIds);
  return orderedDayIds.find((dayId) => !completed.has(dayId)) ?? orderedDayIds[orderedDayIds.length - 1];
}

export function getCurrentDayId(completedDayIds: string[], orderedDayIds: string[]): string {
  return getNextUnlockedDayId(completedDayIds, orderedDayIds);
}

export function deriveCourseDayStates({
  orderedDayIds,
  completedDayIds,
  activeReviewDayIds,
}: {
  orderedDayIds: string[];
  completedDayIds: string[];
  activeReviewDayIds: string[];
}): Record<string, CourseDayState> {
  const completed = new Set(completedDayIds);
  const reviewNeeded = new Set(activeReviewDayIds);
  const currentDayId = getCurrentDayId(completedDayIds, orderedDayIds);

  return Object.fromEntries(
    orderedDayIds.map((dayId) => {
      if (reviewNeeded.has(dayId)) return [dayId, 'review_needed'];
      if (completed.has(dayId)) return [dayId, 'completed'];
      if (dayId === currentDayId) return [dayId, 'current'];
      return [dayId, 'locked'];
    }),
  );
}

function toDate(localDate: string): Date {
  return new Date(`${localDate}T00:00:00`);
}

export function updateStreak(existingLocalDates: string[], localDate: string): string[] {
  if (existingLocalDates.includes(localDate)) return existingLocalDates;
  const lastDate = existingLocalDates[existingLocalDates.length - 1];
  if (!lastDate) return [localDate];

  const elapsed = toDate(localDate).getTime() - toDate(lastDate).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  return elapsed === oneDay ? [...existingLocalDates, localDate] : [localDate];
}
```

- [ ] **Step 4: Write failing exercise tests**

Create `src/domain/exercises.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Exercise } from './types';
import {
  checkExerciseAnswer,
  countSentences,
  summarizeDrillCompletion,
} from './exercises';

describe('exercise rules', () => {
  const exercises: Exercise[] = [
    { type: 'choice', id: 'choice-1', prompt: 'Pick one', options: ['A', 'B'], correctOption: 'A' },
    { type: 'fill_blank', id: 'fill-1', prompt: 'I ___ happy.', acceptedAnswers: ['am'] },
    { type: 'sentence_order', id: 'order-1', tokens: ['am', 'I'], correctOrder: ['I', 'am'], finalSentence: 'I am.' },
    { type: 'replacement', id: 'replace-1', patternId: 'i-am', slotValues: { description: 'happy' }, referenceAnswer: 'I am happy.' },
    {
      type: 'translation',
      id: 'translation-1',
      chinesePrompt: '我很开心。',
      coreMeaningHint: 'Say you are happy.',
      suggestedPatternIds: ['i-am'],
      referenceAnswers: ['I am happy.'],
    },
  ];

  it('checks choice and fill blank answers', () => {
    expect(checkExerciseAnswer(exercises[0], 'A')).toBe('correct');
    expect(checkExerciseAnswer(exercises[0], 'B')).toBe('incorrect');
    expect(checkExerciseAnswer(exercises[1], ' AM ')).toBe('correct');
    expect(checkExerciseAnswer(exercises[1], 'is')).toBe('incorrect');
  });

  it('checks sentence order answers from selected tokens', () => {
    expect(checkExerciseAnswer(exercises[2], ['I', 'am'])).toBe('correct');
    expect(checkExerciseAnswer(exercises[2], ['am', 'I'])).toBe('incorrect');
  });

  it('treats replacement and translation as self-marked after user input', () => {
    expect(checkExerciseAnswer(exercises[3], 'I am happy.')).toBe('self_mark_close');
    expect(checkExerciseAnswer(exercises[4], 'I am happy.')).toBe('self_mark_close');
    expect(checkExerciseAnswer(exercises[4], '')).toBe('incorrect');
  });

  it('counts simple English sentences', () => {
    expect(countSentences('My name is Li. I am from China.\nI study English')).toBe(3);
    expect(countSentences('')).toBe(0);
  });

  it('summarizes drill completion', () => {
    const summary = summarizeDrillCompletion(exercises, {
      'choice-1': 'B',
      'fill-1': 'am',
      'order-1': ['I', 'am'],
      'replace-1': 'I am happy.',
    });

    expect(summary.isComplete).toBe(true);
    expect(summary.missingExerciseIds).toEqual([]);
    expect(summary.incorrectExerciseIds).toEqual(['choice-1']);
  });
});
```

- [ ] **Step 5: Run exercise tests to verify failure**

Run:

```powershell
npm test -- src/domain/exercises.test.ts
```

Expected: FAIL because `src/domain/exercises.ts` does not exist.

- [ ] **Step 6: Implement exercise rules**

Create `src/domain/exercises.ts`:

```ts
import type { Exercise } from './types';

export type ExerciseResult = 'correct' | 'incorrect' | 'self_mark_close' | 'self_mark_review';
export type ExerciseAnswer = string | string[];

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function checkExerciseAnswer(exercise: Exercise, answer: ExerciseAnswer): ExerciseResult {
  if (exercise.type === 'choice') {
    return answer === exercise.correctOption ? 'correct' : 'incorrect';
  }

  if (exercise.type === 'fill_blank') {
    if (typeof answer !== 'string') return 'incorrect';
    return exercise.acceptedAnswers.some((accepted) => normalizeText(accepted) === normalizeText(answer)) ? 'correct' : 'incorrect';
  }

  if (exercise.type === 'sentence_order') {
    return Array.isArray(answer) && answer.join(' ') === exercise.correctOrder.join(' ') ? 'correct' : 'incorrect';
  }

  if (typeof answer !== 'string' || answer.trim().length === 0) return 'incorrect';
  return 'self_mark_close';
}

export function countSentences(text: string): number {
  return text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

export function summarizeDrillCompletion(exercises: Exercise[], answers: Record<string, ExerciseAnswer>) {
  const drills = exercises.filter((exercise) => exercise.type !== 'translation');
  const missingExerciseIds = drills.filter((exercise) => answers[exercise.id] === undefined || answers[exercise.id] === '').map((exercise) => exercise.id);
  const incorrectExerciseIds = drills
    .filter((exercise) => answers[exercise.id] !== undefined && checkExerciseAnswer(exercise, answers[exercise.id]) === 'incorrect')
    .map((exercise) => exercise.id);

  return {
    isComplete: missingExerciseIds.length === 0,
    requiredCount: drills.length,
    answeredCount: drills.length - missingExerciseIds.length,
    missingExerciseIds,
    incorrectExerciseIds,
  };
}
```

- [ ] **Step 7: Verify Task 1**

Run:

```powershell
npm test -- src/domain/progress.test.ts src/domain/exercises.test.ts
npm run build
```

Expected: both test files pass and build exits with code 0.

- [ ] **Step 8: Commit Task 1**

Run:

```powershell
git add src/domain/progress.ts src/domain/progress.test.ts src/domain/exercises.ts src/domain/exercises.test.ts
git commit -m "feat: add v1.1 progress and exercise rules"
```

---

### Task 2: Add Review Items and Repository Persistence

**Files:**
- Modify: `src/domain/review.ts`
- Modify: `src/domain/review.test.ts`
- Modify: `src/storage/progressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.test.ts`

- [ ] **Step 1: Write failing review domain tests**

Add these tests to `src/domain/review.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  createExerciseReviewItem,
  createOutputReviewItem,
  createTranslationReviewItem,
  createWordReviewItem,
  getActiveReviewDayIds,
  resolveReviewItem,
} from './review';

describe('review items', () => {
  it('creates word, exercise, translation, and output review items', () => {
    const now = '2026-05-26T00:00:00.000Z';

    expect(createWordReviewItem({ wordId: 'name', wordText: 'name', sourceDayId: 'day-001', now })).toMatchObject({
      id: 'review-word-day-001-name',
      type: 'word',
      sourceDayId: 'day-001',
      sourceStepId: 'words',
      prompt: 'name',
      priority: 'normal',
      status: 'active',
    });

    expect(createExerciseReviewItem({
      exerciseId: 'day-001-choice-001',
      sourceDayId: 'day-001',
      prompt: 'Pick one',
      userAnswer: 'wrong',
      referenceAnswer: 'right',
      now,
    })).toMatchObject({ type: 'exercise', priority: 'high', status: 'active' });

    expect(createTranslationReviewItem({
      exerciseId: 'day-001-translation-001',
      sourceDayId: 'day-001',
      prompt: 'Say your name.',
      userAnswer: 'My is Li.',
      referenceAnswer: 'My name is Li.',
      now,
    })).toMatchObject({ type: 'translation', sourceStepId: 'translate' });

    expect(createOutputReviewItem({
      sourceDayId: 'day-001',
      text: 'My name is Li.',
      now,
    })).toMatchObject({ type: 'output', sourceStepId: 'output', priority: 'normal' });
  });

  it('marks review items known without deleting data', () => {
    const item = createWordReviewItem({ wordId: 'name', wordText: 'name', sourceDayId: 'day-001', now: '2026-05-26T00:00:00.000Z' });
    expect(resolveReviewItem(item, '2026-05-26T00:01:00.000Z')).toMatchObject({
      status: 'known',
      updatedAt: '2026-05-26T00:01:00.000Z',
    });
  });

  it('derives day IDs that still need review', () => {
    expect(getActiveReviewDayIds([
      createWordReviewItem({ wordId: 'name', wordText: 'name', sourceDayId: 'day-001', now: '2026-05-26T00:00:00.000Z' }),
      { ...createWordReviewItem({ wordId: 'am', wordText: 'am', sourceDayId: 'day-002', now: '2026-05-26T00:00:00.000Z' }), status: 'known' },
    ])).toEqual(['day-001']);
  });
});
```

- [ ] **Step 2: Run review tests to verify failure**

Run:

```powershell
npm test -- src/domain/review.test.ts
```

Expected: FAIL because review item helpers are not implemented.

- [ ] **Step 3: Implement review item domain helpers**

Append these exports to `src/domain/review.ts` without removing `selectReviewWordIds`:

```ts
import type { StepId } from './progress';

export type ReviewItemType = 'word' | 'pattern' | 'exercise' | 'translation' | 'output';
export type ReviewPriority = 'low' | 'normal' | 'high';
export type ReviewStatus = 'active' | 'known';

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  sourceDayId: string;
  sourceStepId: StepId;
  prompt: string;
  userAnswer?: string;
  referenceAnswer?: string;
  priority: ReviewPriority;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export function createWordReviewItem({
  wordId,
  wordText,
  sourceDayId,
  now,
}: {
  wordId: string;
  wordText: string;
  sourceDayId: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-word-${sourceDayId}-${wordId}`,
    type: 'word',
    sourceDayId,
    sourceStepId: 'words',
    prompt: wordText,
    priority: 'normal',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function createExerciseReviewItem({
  exerciseId,
  sourceDayId,
  prompt,
  userAnswer,
  referenceAnswer,
  now,
}: {
  exerciseId: string;
  sourceDayId: string;
  prompt: string;
  userAnswer: string;
  referenceAnswer?: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-exercise-${sourceDayId}-${exerciseId}`,
    type: 'exercise',
    sourceDayId,
    sourceStepId: 'drills',
    prompt,
    userAnswer,
    referenceAnswer,
    priority: 'high',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function createTranslationReviewItem({
  exerciseId,
  sourceDayId,
  prompt,
  userAnswer,
  referenceAnswer,
  now,
}: {
  exerciseId: string;
  sourceDayId: string;
  prompt: string;
  userAnswer: string;
  referenceAnswer?: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-translation-${sourceDayId}-${exerciseId}`,
    type: 'translation',
    sourceDayId,
    sourceStepId: 'translate',
    prompt,
    userAnswer,
    referenceAnswer,
    priority: 'normal',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function createOutputReviewItem({
  sourceDayId,
  text,
  now,
}: {
  sourceDayId: string;
  text: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-output-${sourceDayId}`,
    type: 'output',
    sourceDayId,
    sourceStepId: 'output',
    prompt: 'Practice your personal output again.',
    userAnswer: text,
    priority: 'normal',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

export function resolveReviewItem(item: ReviewItem, now: string): ReviewItem {
  return { ...item, status: 'known', updatedAt: now };
}

export function getActiveReviewDayIds(items: ReviewItem[]): string[] {
  return Array.from(new Set(items.filter((item) => item.status === 'active').map((item) => item.sourceDayId)));
}
```

- [ ] **Step 4: Extend repository interfaces**

Update `src/storage/progressRepository.ts`:

```ts
import type { DayProgress, StepId } from '../domain/progress';
import type { ReviewItem } from '../domain/review';

export interface StepProgress {
  id: string;
  dayId: string;
  stepId: StepId;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: string;
}

export interface StepCompletion {
  id: string;
  dayId: string;
  stepId: StepId;
  isComplete: boolean;
  completedAt?: string;
  summary: {
    practicedCount?: number;
    reviewCreatedCount?: number;
    missingRequirements?: string[];
  };
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  dayId: string;
  answer: unknown;
  result: 'correct' | 'incorrect' | 'self_mark_close' | 'self_mark_review';
  createdAt: string;
}

export interface UserOutput {
  id: string;
  dayId: string;
  text: string;
  sentenceCount: number;
  selfRating: 'easy' | 'ok' | 'hard';
  checklist: {
    usedTargetPattern: boolean;
    usedLessonWords: boolean;
    hasSubjects: boolean;
    meaningIsClear: boolean;
  };
  updatedAt: string;
}

export interface WordProgress {
  id: string;
  wordId: string;
  status: 'new' | 'seen' | 'review' | 'known' | 'mastered';
  seenCount: number;
  correctCount: number;
  lastSeenAt?: string;
  updatedAt: string;
}

export interface StudyActivity {
  id: string;
  localDate: string;
  completedDayIds: string[];
}

export interface ProgressRepository {
  getDayProgress(dayId: string): Promise<DayProgress | null>;
  listDayProgress(): Promise<DayProgress[]>;
  saveDayProgress(progress: DayProgress): Promise<void>;
  saveStepProgress(progress: StepProgress): Promise<void>;
  saveStepCompletion(completion: StepCompletion): Promise<void>;
  listStepCompletions(dayId: string): Promise<StepCompletion[]>;
  saveExerciseAttempt(attempt: ExerciseAttempt): Promise<void>;
  listExerciseAttempts(dayId: string): Promise<ExerciseAttempt[]>;
  saveUserOutput(output: UserOutput): Promise<void>;
  getUserOutput(dayId: string): Promise<UserOutput | null>;
  listUserOutputs(): Promise<UserOutput[]>;
  saveWordProgress(progress: WordProgress): Promise<void>;
  listReviewWords(): Promise<WordProgress[]>;
  saveReviewItem(item: ReviewItem): Promise<void>;
  listReviewItems(status?: ReviewItem['status']): Promise<ReviewItem[]>;
  getReviewItem(id: string): Promise<ReviewItem | null>;
  saveStudyActivity(activity: StudyActivity): Promise<void>;
  listStudyActivities(): Promise<StudyActivity[]>;
}
```

- [ ] **Step 5: Write failing IndexedDB repository tests**

Add to `src/storage/indexedDbProgressRepository.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createWordReviewItem, resolveReviewItem } from '../domain/review';
import { createIndexedDbProgressRepository } from './indexedDbProgressRepository';

describe('indexedDbProgressRepository V1.1', () => {
  it('persists and resolves review items', async () => {
    const repo = createIndexedDbProgressRepository('v1-1-review-test');
    const item = createWordReviewItem({
      wordId: 'name',
      wordText: 'name',
      sourceDayId: 'day-001',
      now: '2026-05-26T00:00:00.000Z',
    });

    await repo.saveReviewItem(item);
    expect(await repo.listReviewItems('active')).toHaveLength(1);

    await repo.saveReviewItem(resolveReviewItem(item, '2026-05-26T00:01:00.000Z'));
    expect(await repo.listReviewItems('active')).toHaveLength(0);
    expect(await repo.listReviewItems('known')).toHaveLength(1);
  });

  it('lists user outputs and exercise attempts by day', async () => {
    const repo = createIndexedDbProgressRepository('v1-1-output-attempt-test');

    await repo.saveExerciseAttempt({
      id: 'attempt-1',
      exerciseId: 'exercise-1',
      dayId: 'day-001',
      answer: 'wrong',
      result: 'incorrect',
      createdAt: '2026-05-26T00:00:00.000Z',
    });

    await repo.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li.',
      sentenceCount: 1,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      updatedAt: '2026-05-26T00:00:00.000Z',
    });

    expect(await repo.listExerciseAttempts('day-001')).toHaveLength(1);
    expect(await repo.listUserOutputs()).toHaveLength(1);
  });
});
```

- [ ] **Step 6: Run repository tests to verify failure**

Run:

```powershell
npm test -- src/storage/indexedDbProgressRepository.test.ts
```

Expected: FAIL because repository methods and stores do not exist.

- [ ] **Step 7: Implement IndexedDB V1.1 stores and methods**

Update `src/storage/indexedDbProgressRepository.ts`:

- import `ReviewItem`.
- raise `DB_VERSION` to `3`.
- add stores `stepCompletions`, `reviewItems`, and `studyActivities`.
- add methods declared in `ProgressRepository`.

Use this store shape:

```ts
interface ProgressDb extends DBSchema {
  dayProgress: { key: string; value: DayProgress };
  stepProgress: { key: string; value: StepProgress };
  stepCompletions: { key: string; value: StepCompletion; indexes: { byDayId: string } };
  exerciseAttempts: { key: string; value: ExerciseAttempt; indexes: { byDayId: string } };
  userOutputs: { key: string; value: UserOutput };
  wordProgress: { key: string; value: WordProgress };
  reviewItems: { key: string; value: ReviewItem; indexes: { byStatus: ReviewItem['status']; bySourceDayId: string } };
  studyActivities: { key: string; value: StudyActivity };
}
```

In `upgrade`, create missing stores:

```ts
if (!db.objectStoreNames.contains('stepCompletions')) {
  const store = db.createObjectStore('stepCompletions', { keyPath: 'id' });
  store.createIndex('byDayId', 'dayId');
}
if (!db.objectStoreNames.contains('reviewItems')) {
  const store = db.createObjectStore('reviewItems', { keyPath: 'id' });
  store.createIndex('byStatus', 'status');
  store.createIndex('bySourceDayId', 'sourceDayId');
}
if (!db.objectStoreNames.contains('studyActivities')) {
  db.createObjectStore('studyActivities', { keyPath: 'id' });
}
```

If `exerciseAttempts` already exists without indexes, keep `listExerciseAttempts` implemented with `getAll('exerciseAttempts')` and filter in memory to avoid destructive migration.

Add these repository methods:

```ts
async saveStepCompletion(completion) {
  const db = await dbPromise;
  await db.put('stepCompletions', completion);
},

async listStepCompletions(dayId) {
  const db = await dbPromise;
  return (await db.getAll('stepCompletions')).filter((completion) => completion.dayId === dayId);
},

async listExerciseAttempts(dayId) {
  const db = await dbPromise;
  return (await db.getAll('exerciseAttempts')).filter((attempt) => attempt.dayId === dayId);
},

async listUserOutputs() {
  const db = await dbPromise;
  return db.getAll('userOutputs');
},

async saveReviewItem(item) {
  const db = await dbPromise;
  await db.put('reviewItems', item);
},

async listReviewItems(status) {
  const db = await dbPromise;
  const items = await db.getAll('reviewItems');
  return items
    .filter((item) => (status ? item.status === status : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
},

async getReviewItem(id) {
  const db = await dbPromise;
  return (await db.get('reviewItems', id)) ?? null;
},

async saveStudyActivity(activity) {
  const db = await dbPromise;
  await db.put('studyActivities', activity);
},

async listStudyActivities() {
  const db = await dbPromise;
  return db.getAll('studyActivities');
},
```

When saving user output, preserve pre-V1.1 callers by defaulting sentence count:

```ts
await db.put('userOutputs', {
  ...output,
  id: output.id || `output-${output.dayId}`,
  sentenceCount: output.sentenceCount ?? 0,
});
```

- [ ] **Step 8: Verify Task 2**

Run:

```powershell
npm test -- src/domain/review.test.ts src/storage/indexedDbProgressRepository.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 9: Commit Task 2**

Run:

```powershell
git add src/domain/review.ts src/domain/review.test.ts src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts
git commit -m "feat: persist v1.1 review items"
```

---

### Task 3: Add Step Completion Gates

**Files:**
- Create: `src/domain/stepCompletion.ts`
- Create: `src/domain/stepCompletion.test.ts`
- Modify: `src/components/OutputTaskEditor.tsx`

- [ ] **Step 1: Write failing completion gate tests**

Create `src/domain/stepCompletion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { UserOutput } from '../storage/progressRepository';
import {
  getDrillsCompletion,
  getOutputCompletion,
  getPatternsCompletion,
  getTranslationCompletion,
  getWordsCompletion,
} from './stepCompletion';

describe('step completion gates', () => {
  it('requires every word to be marked know or review', () => {
    expect(getWordsCompletion(['name', 'am'], { name: 'known' }).isComplete).toBe(false);
    expect(getWordsCompletion(['name', 'am'], { name: 'known', am: 'review' })).toMatchObject({
      isComplete: true,
      missingRequirements: [],
    });
  });

  it('requires each pattern to be practiced', () => {
    expect(getPatternsCompletion(['i-am'], new Set()).isComplete).toBe(false);
    expect(getPatternsCompletion(['i-am'], new Set(['i-am'])).isComplete).toBe(true);
  });

  it('requires all drills to be answered', () => {
    expect(getDrillsCompletion(['a', 'b'], { a: 'answer' }).isComplete).toBe(false);
    expect(getDrillsCompletion(['a', 'b'], { a: 'answer', b: ['I', 'am'] }).isComplete).toBe(true);
  });

  it('requires translation answer and self-mark', () => {
    expect(getTranslationCompletion(['t1'], { t1: { answer: 'I am Li.' } }).isComplete).toBe(false);
    expect(getTranslationCompletion(['t1'], { t1: { answer: 'I am Li.', selfMark: 'close' } }).isComplete).toBe(true);
  });

  it('requires sentence count, checklist, and self-rating for output', () => {
    const output: UserOutput = {
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li. I am from China. I study English. I am happy.',
      sentenceCount: 4,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      updatedAt: '2026-05-26T00:00:00.000Z',
    };

    expect(getOutputCompletion(output, 4).isComplete).toBe(true);
    expect(getOutputCompletion({ ...output, sentenceCount: 3 }, 4).isComplete).toBe(false);
    expect(getOutputCompletion({ ...output, checklist: { ...output.checklist, hasSubjects: false } }, 4).isComplete).toBe(false);
  });
});
```

- [ ] **Step 2: Run completion tests to verify failure**

Run:

```powershell
npm test -- src/domain/stepCompletion.test.ts
```

Expected: FAIL because `src/domain/stepCompletion.ts` does not exist.

- [ ] **Step 3: Implement completion gates**

Create `src/domain/stepCompletion.ts`:

```ts
import type { UserOutput } from '../storage/progressRepository';
import type { ExerciseAnswer } from './exercises';

export type WordMark = 'known' | 'review';
export type TranslationSelfMark = 'close' | 'review';

export interface TranslationDraft {
  answer?: string;
  selfMark?: TranslationSelfMark;
}

export interface CompletionGate {
  isComplete: boolean;
  missingRequirements: string[];
}

function done(missingRequirements: string[]): CompletionGate {
  return { isComplete: missingRequirements.length === 0, missingRequirements };
}

export function getWordsCompletion(wordIds: string[], marks: Record<string, WordMark | undefined>): CompletionGate {
  const missing = wordIds.filter((wordId) => !marks[wordId]);
  return done(missing.map((wordId) => `Mark ${wordId} as Know or Review.`));
}

export function getPatternsCompletion(patternIds: string[], practicedPatternIds: Set<string>): CompletionGate {
  const missing = patternIds.filter((patternId) => !practicedPatternIds.has(patternId));
  return done(missing.map((patternId) => `Practice ${patternId}.`));
}

export function getDrillsCompletion(exerciseIds: string[], answers: Record<string, ExerciseAnswer | undefined>): CompletionGate {
  const missing = exerciseIds.filter((exerciseId) => answers[exerciseId] === undefined || answers[exerciseId] === '');
  return done(missing.map((exerciseId) => `Answer ${exerciseId}.`));
}

export function getTranslationCompletion(exerciseIds: string[], drafts: Record<string, TranslationDraft | undefined>): CompletionGate {
  const missing: string[] = [];
  for (const exerciseId of exerciseIds) {
    const draft = drafts[exerciseId];
    if (!draft?.answer?.trim()) missing.push(`Write an English sentence for ${exerciseId}.`);
    if (!draft?.selfMark) missing.push(`Self-mark ${exerciseId}.`);
  }
  return done(missing);
}

export function getOutputCompletion(output: UserOutput, requiredSentenceCount: number): CompletionGate {
  const missing: string[] = [];
  if (output.sentenceCount < requiredSentenceCount) missing.push(`Write at least ${requiredSentenceCount} sentences.`);
  if (!output.checklist.usedTargetPattern) missing.push("Check: I used today's pattern.");
  if (!output.checklist.usedLessonWords) missing.push('Check: I used lesson words.');
  if (!output.checklist.hasSubjects) missing.push('Check: Each sentence has a subject.');
  if (!output.checklist.meaningIsClear) missing.push('Check: My meaning is clear.');
  if (!output.selfRating) missing.push('Choose a self rating.');
  return done(missing);
}
```

- [ ] **Step 4: Update output editor to maintain sentence count**

In `src/components/OutputTaskEditor.tsx`, import `countSentences`:

```ts
import { countSentences } from '../domain/exercises';
```

Change textarea `onChange` to update both text and sentence count:

```tsx
onChange={(event) =>
  updateValue({
    text: event.target.value,
    sentenceCount: countSentences(event.target.value),
  })
}
```

Show the count below the textarea:

```tsx
<p className="helper-text">
  {value.sentenceCount} / {task.requiredSentenceCount} sentences
</p>
```

- [ ] **Step 5: Verify Task 3**

Run:

```powershell
npm test -- src/domain/stepCompletion.test.ts src/domain/exercises.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit Task 3**

Run:

```powershell
git add src/domain/stepCompletion.ts src/domain/stepCompletion.test.ts src/components/OutputTaskEditor.tsx
git commit -m "feat: add v1.1 step completion gates"
```

---

### Task 4: Make Today Use Current Day and Completion Gates

**Files:**
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/ExerciseRenderer.tsx`
- Modify: `src/components/TranslationTask.tsx`
- Modify: `src/components/PatternCards.tsx`
- Modify: `src/components/WordCards.tsx`
- Modify: `src/components/CompletionSummary.tsx`
- Modify: `src/components/TodayPage.test.tsx`

- [ ] **Step 1: Write failing Today tests**

Add these tests to `src/components/TodayPage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { week1Course } from '../content/week1';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { TodayPage } from './TodayPage';

describe('TodayPage V1.1', () => {
  it('shows Day 2 after Day 1 is completed', async () => {
    const repo = createIndexedDbProgressRepository('today-v1-1-current-day');
    await repo.saveDayProgress({
      id: 'day-001',
      dayId: 'day-001',
      status: 'completed',
      currentStep: 'done',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
      startedAt: '2026-05-26T00:00:00.000Z',
      completedAt: '2026-05-26T00:10:00.000Z',
      updatedAt: '2026-05-26T00:10:00.000Z',
      contentVersion: week1Course.contentVersion,
    });

    render(<TodayPage course={week1Course} repository={repo} />);

    expect(await screen.findByText('I Am')).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 2/)).toBeInTheDocument();
  });

  it('blocks Continue on Words until every word is marked', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-words-gate');
    render(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByText(/Mark name as Know or Review/)).toBeInTheDocument();
  });

  it('creates a review item when a word is marked Review', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-word-review');
    render(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await screen.findByRole('button', { name: 'Continue' }));
    await user.click(screen.getAllByRole('button', { name: 'Review' })[0]);

    await waitFor(async () => {
      expect(await repo.listReviewItems('active')).toHaveLength(1);
    });
  });
});
```

- [ ] **Step 2: Run Today tests to verify failure**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx
```

Expected: FAIL because Today is fixed to Day 1, Continue is not gated, and word Review does not persist review items.

- [ ] **Step 3: Update child component contracts**

Modify these components so Today can own state:

`src/components/WordCards.tsx` props:

```ts
{
  words: Word[];
  showChineseHelp?: boolean;
  marks?: Record<string, 'known' | 'review' | undefined>;
  onReview: (wordId: string) => void;
  onKnow: (wordId: string) => void;
}
```

Each word's buttons call `onKnow(word.id)` and `onReview(word.id)`. Add `aria-pressed={marks?.[word.id] === 'known'}` and `aria-pressed={marks?.[word.id] === 'review'}`.

`src/components/PatternCards.tsx` props:

```ts
{
  patterns: Pattern[];
  practicedPatternIds?: Set<string>;
  onPractice?: (patternId: string) => void;
}
```

Render a `Practice this` button for each pattern and call `onPractice(pattern.id)`.

`src/components/ExerciseRenderer.tsx` props:

```ts
{
  exercises: Exercise[];
  answers: Record<string, ExerciseAnswer | undefined>;
  onAnswer: (exerciseId: string, answer: ExerciseAnswer, result: ExerciseResult) => void;
}
```

For `sentence_order`, render token buttons and a selected sentence area. Clicking a token appends it to that exercise's token answer and calls `onAnswer` with the full selected token list and `checkExerciseAnswer`.

For `replacement`, render an input with `aria-label="Replacement answer"` and call `onAnswer` with the text and `checkExerciseAnswer`.

`src/components/TranslationTask.tsx` props:

```ts
{
  exercises: TranslationExercise[];
  drafts: Record<string, TranslationDraft | undefined>;
  onDraftChange: (exerciseId: string, draft: TranslationDraft) => void;
}
```

Render a textarea for each translation before `Show reference`. Disable `Show reference` until `draft.answer` has text. Render radio buttons for `Close enough` and `Need review`.

- [ ] **Step 4: Update Today state and current-day selection**

In `src/components/TodayPage.tsx`:

- load `repository.listDayProgress()` and `repository.listReviewItems('active')`.
- derive completed day IDs.
- use `getCurrentDayId` to select the day.
- load selected day progress and output.
- keep local maps for word marks, practiced patterns, drill answers, translation drafts, and missing requirements.
- compute current step gate from `stepCompletion.ts`.

Use this helper inside Today:

```ts
function createInitialOutput(dayId: string): UserOutput {
  return {
    id: `output-${dayId}`,
    dayId,
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    updatedAt: new Date().toISOString(),
  };
}
```

Compute gate:

```ts
const currentGate = useMemo(() => {
  if (currentStep === 'words') return getWordsCompletion(day.wordIds, wordMarks);
  if (currentStep === 'patterns') return getPatternsCompletion(day.patternIds, practicedPatternIds);
  if (currentStep === 'drills') return getDrillsCompletion(drillExercises.map((exercise) => exercise.id), drillAnswers);
  if (currentStep === 'translate') return getTranslationCompletion(translationExercises.map((exercise) => exercise.id), translationDrafts);
  if (currentStep === 'output') return getOutputCompletion(outputDraft, day.outputTask.requiredSentenceCount);
  return { isComplete: true, missingRequirements: [] };
}, [currentStep, day.wordIds, day.patternIds, day.outputTask.requiredSentenceCount, wordMarks, practicedPatternIds, drillExercises, drillAnswers, translationExercises, translationDrafts, outputDraft]);
```

Disable Continue when `!currentGate.isComplete`.

Render missing requirements:

```tsx
{!currentGate.isComplete && (
  <div className="requirement-list" role="status">
    {currentGate.missingRequirements.map((requirement) => (
      <p key={requirement}>{requirement}</p>
    ))}
  </div>
)}
```

- [ ] **Step 5: Persist review items and attempts from Today**

When a word is marked Review:

```ts
await repository.saveReviewItem(createWordReviewItem({
  wordId,
  wordText: word.text,
  sourceDayId: day.id,
  now: new Date().toISOString(),
}));
```

When a drill answer result is `incorrect`:

```ts
await repository.saveExerciseAttempt({
  id: `attempt-${exercise.id}-${Date.now()}`,
  exerciseId: exercise.id,
  dayId: day.id,
  answer,
  result,
  createdAt: now,
});
await repository.saveReviewItem(createExerciseReviewItem({
  exerciseId: exercise.id,
  sourceDayId: day.id,
  prompt: 'prompt' in exercise ? exercise.prompt : 'Put the words in order',
  userAnswer: Array.isArray(answer) ? answer.join(' ') : String(answer),
  referenceAnswer: 'finalSentence' in exercise ? exercise.finalSentence : 'referenceAnswer' in exercise ? exercise.referenceAnswer : 'correctOption' in exercise ? exercise.correctOption : undefined,
  now,
}));
```

When translation self-mark is `review`, save `createTranslationReviewItem`.

When output self-rating is `hard` on final day completion, save `createOutputReviewItem`.

- [ ] **Step 6: Update completion summary**

Modify `src/components/CompletionSummary.tsx` to accept:

```ts
{
  day: Day;
  output: UserOutput;
  reviewCount: number;
  nextDay?: Day;
  onStartNextDay?: () => void;
}
```

Render:

- `Day N complete`
- `You can now say: ${day.goal}`
- practiced counts using `day.wordIds.length`, `day.patternIds.length`, `day.exercises.length`, `output.sentenceCount`
- `Review tomorrow: ${reviewCount} items`
- button `Start Day N+1` when `nextDay` exists
- text `View Week 1 result` when no next day exists

- [ ] **Step 7: Verify Task 4**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx src/domain/stepCompletion.test.ts src/domain/review.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 8: Commit Task 4**

Run:

```powershell
git add src/components/TodayPage.tsx src/components/ExerciseRenderer.tsx src/components/TranslationTask.tsx src/components/PatternCards.tsx src/components/WordCards.tsx src/components/CompletionSummary.tsx src/components/TodayPage.test.tsx
git commit -m "feat: gate today flow for v1.1"
```

---

### Task 5: Build Course, Review, Me, and Navigation Status UI

**Files:**
- Modify: `src/components/CoursePage.tsx`
- Create: `src/components/CoursePage.test.tsx`
- Modify: `src/components/ReviewPage.tsx`
- Create: `src/components/ReviewPage.test.tsx`
- Modify: `src/components/MePage.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing Course page tests**

Create `src/components/CoursePage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { week1Course } from '../content/week1';
import { CoursePage } from './CoursePage';

describe('CoursePage V1.1', () => {
  it('shows Week 1 progress and day states', () => {
    render(
      <CoursePage
        course={week1Course}
        completedDayIds={['day-001']}
        activeReviewDayIds={['day-001']}
        onStartDay={() => undefined}
      />,
    );

    expect(screen.getByText('1 / 7 days completed')).toBeInTheDocument();
    expect(screen.getByText('Review: 1 item')).toBeInTheDocument();
    expect(screen.getByText('Review needed')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getAllByText('Locked').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Write failing Review page tests**

Create `src/components/ReviewPage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createWordReviewItem } from '../domain/review';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { ReviewPage } from './ReviewPage';

describe('ReviewPage V1.1', () => {
  it('lists active review items and marks one known', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('review-page-v1-1');
    await repo.saveReviewItem(createWordReviewItem({
      wordId: 'name',
      wordText: 'name',
      sourceDayId: 'day-001',
      now: '2026-05-26T00:00:00.000Z',
    }));

    render(<ReviewPage repository={repo} />);

    expect(await screen.findByText('name')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'I know this' }));

    await waitFor(() => {
      expect(screen.getByText('No review items. Start today\\'s task.')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: Run page tests to verify failure**

Run:

```powershell
npm test -- src/components/CoursePage.test.tsx src/components/ReviewPage.test.tsx
```

Expected: FAIL because page props and Review behavior are not implemented.

- [ ] **Step 4: Implement Course page states**

Update `src/components/CoursePage.tsx` to accept:

```ts
{
  course: Course;
  completedDayIds: string[];
  activeReviewDayIds: string[];
  onStartDay: (dayId: string) => void;
}
```

Use `deriveCourseDayStates` and render the header:

```tsx
<p>{completedDayIds.length} / {week.days.length} days completed</p>
<p>Review: {activeReviewDayIds.length} {activeReviewDayIds.length === 1 ? 'item' : 'items'}</p>
```

For each day, show:

- `Completed`
- `Current`
- `Locked`
- `Review needed`

Render a start button only for `current`, `completed`, and `review_needed`; disable it for locked days.

- [ ] **Step 5: Implement Review page**

Update `src/components/ReviewPage.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { resolveReviewItem, type ReviewItem } from '../domain/review';
import type { ProgressRepository } from '../storage/progressRepository';

export function ReviewPage({ repository, onStartToday }: { repository: ProgressRepository; onStartToday?: () => void }) {
  const [items, setItems] = useState<ReviewItem[]>([]);

  const loadItems = async () => {
    setItems(await repository.listReviewItems('active'));
  };

  useEffect(() => {
    void loadItems();
  }, [repository]);

  const markKnown = async (item: ReviewItem) => {
    await repository.saveReviewItem(resolveReviewItem(item, new Date().toISOString()));
    await loadItems();
  };

  if (items.length === 0) {
    return (
      <section className="panel">
        <h2>Review today</h2>
        <p>No review items. Start today&apos;s task.</p>
        {onStartToday && <button type="button" className="primary-button" onClick={onStartToday}>Start today</button>}
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Review today</h2>
      <p>{items.length} items need attention</p>
      <div className="review-list">
        {items.map((item) => (
          <article className="review-card" key={item.id}>
            <p className="eyebrow">{item.type} · {item.sourceDayId}</p>
            <h3>{item.prompt}</h3>
            {item.userAnswer && <p>Your answer: {item.userAnswer}</p>}
            {item.referenceAnswer && <p>Reference: {item.referenceAnswer}</p>}
            <div className="button-row">
              <button type="button" className="primary-button" onClick={() => markKnown(item)}>I know this</button>
              <button type="button" className="secondary-button">Review again</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Update Me page**

Modify `src/components/MePage.tsx`:

- load `repository.listDayProgress()`
- load `repository.listUserOutputs()`
- load `repository.listReviewItems('active')`
- load `repository.listStudyActivities()`
- show `Completed days: X / 7`
- show `Current streak: N days`
- show `Review items: N`
- render saved outputs list by day ID instead of only Day 1.

- [ ] **Step 7: Update Layout and App wiring**

Modify `src/components/Layout.tsx` to accept:

```ts
reviewCount?: number;
```

For the Review tab label, render:

```tsx
{tab.label}
{tab.id === 'review' && reviewCount ? <span className="nav-badge">{reviewCount}</span> : null}
```

Modify `src/App.tsx`:

- keep `reviewCount`, `completedDayIds`, and `activeReviewDayIds` in state.
- add a `refreshProgressSummary` function that reads repository state.
- pass repository to `ReviewPage`.
- pass Course state props to `CoursePage`.
- pass `reviewCount` to `Layout`.
- let `CompletionSummary` and Review actions trigger summary refresh.

- [ ] **Step 8: Add UI styles**

Append to `src/styles.css`:

```css
.status-pill,
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  min-width: 22px;
  border-radius: 999px;
  padding: 0 8px;
  background: #e8f1ec;
  color: #214c3a;
  font-size: 0.8rem;
  font-weight: 700;
}

.nav-badge {
  margin-left: 4px;
  background: #265c46;
  color: #fff;
}

.review-list,
.output-list {
  display: grid;
  gap: 12px;
}

.review-card,
.output-card {
  padding: 14px;
  border: 1px solid #e5dfd1;
  border-radius: 8px;
  background: #fff;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.requirement-list {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  color: #7a3d1d;
}

.helper-text {
  color: #5b675f;
  font-size: 0.9rem;
}
```

- [ ] **Step 9: Verify Task 5**

Run:

```powershell
npm test -- src/components/CoursePage.test.tsx src/components/ReviewPage.test.tsx src/components/TodayPage.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 10: Commit Task 5**

Run:

```powershell
git add src/components/CoursePage.tsx src/components/CoursePage.test.tsx src/components/ReviewPage.tsx src/components/ReviewPage.test.tsx src/components/MePage.tsx src/components/Layout.tsx src/App.tsx src/styles.css
git commit -m "feat: add v1.1 course review progress UI"
```

---

### Task 6: Add V1.1 E2E Coverage

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Add E2E test for Day 1 completion and Day 2 unlock**

Update `tests/e2e/basic-english.spec.ts` with a test that uses a fresh browser context:

```ts
import { expect, test } from '@playwright/test';

test('completes Day 1 and unlocks Day 2 with review persistence', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('My Name')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  const reviewButtons = page.getByRole('button', { name: 'Review' });
  const knowButtons = page.getByRole('button', { name: 'Know' });
  await reviewButtons.first().click();
  const wordCount = await knowButtons.count();
  for (let index = 0; index < wordCount; index += 1) {
    await knowButtons.nth(index).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  const practiceButtons = page.getByRole('button', { name: 'Practice this' });
  const patternCount = await practiceButtons.count();
  for (let index = 0; index < patternCount; index += 1) {
    await practiceButtons.nth(index).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.locator('.exercise-card').first().getByRole('button').nth(1).click();
  await page.getByLabel(/My ___ is Li/).fill('name');
  await page.getByRole('button', { name: 'I' }).click();
  await page.getByRole('button', { name: 'am' }).click();
  await page.getByRole('button', { name: 'from' }).click();
  await page.getByRole('button', { name: 'China' }).click();
  await page.getByLabel('Replacement answer').fill('My name is Anna.');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Translation answer').fill('My name is Li.');
  await page.getByRole('button', { name: 'Show reference' }).click();
  await page.getByLabel('Need review').check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Daily output').fill('My name is Li. I am from China. I study English. I am happy.');
  await page.getByLabel("I used today's pattern.").check();
  await page.getByLabel('I used lesson words.').check();
  await page.getByLabel('Each sentence has a subject.').check();
  await page.getByLabel('My meaning is clear.').check();
  await page.getByLabel('OK').check();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Day 1 complete')).toBeVisible();
  await page.getByRole('button', { name: 'Start Day 2' }).click();
  await expect(page.getByText('I Am')).toBeVisible();

  await page.getByRole('button', { name: 'Course' }).click();
  await expect(page.getByText('1 / 7 days completed')).toBeVisible();

  await page.getByRole('button', { name: /Review/ }).click();
  await expect(page.getByText(/items need attention|item needs attention/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/Review today|I Am/)).toBeVisible();
});
```

- [ ] **Step 2: Run E2E to verify failure or pass**

Run:

```powershell
npm run build
npm run test:e2e
```

Expected before adjustments: E2E may fail on exact selectors. Fix selectors to match the implemented accessible labels, then rerun until all E2E tests pass.

- [ ] **Step 3: Add mobile E2E smoke coverage**

Add this test:

```ts
test('mobile navigation exposes V1.1 pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByText('My Name')).toBeVisible();
  await page.getByRole('button', { name: 'Course' }).click();
  await expect(page.getByText(/days completed/)).toBeVisible();
  await page.getByRole('button', { name: /Review/ }).click();
  await expect(page.getByText('Review today')).toBeVisible();
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page.getByText('My Progress')).toBeVisible();
});
```

- [ ] **Step 4: Verify Task 6**

Run:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected: unit tests, build, and E2E all pass.

- [ ] **Step 5: Commit Task 6**

Run:

```powershell
git add tests/e2e/basic-english.spec.ts
git commit -m "test: cover v1.1 learning loop e2e"
```

---

### Task 7: Final Verification and GitHub Pages Readiness

**Files:**
- Modify only files required by verification failures.

- [ ] **Step 1: Run full local verification**

Run:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected:

- `npm test` exits with code 0.
- `npm run build` exits with code 0.
- `npm run test:e2e` exits with code 0.

- [ ] **Step 2: Check worktree**

Run:

```powershell
git status --short
```

Expected: either clean, or only intentional files modified by verification fixes.

- [ ] **Step 3: Commit verification fixes if needed**

If Step 1 required fixes, commit them:

```powershell
git status --short
git add src tests docs
git commit -m "fix: stabilize v1.1 verification"
```

If no fixes were needed, do not create an empty commit.

- [ ] **Step 4: Optional deploy after user approval**

Only after the user asks to deploy:

```powershell
git push origin main
```

Expected: GitHub Actions deploys to GitHub Pages using the existing workflow.

---

## Self-Review Checklist

Spec coverage:

- Current-day selection: Task 1 and Task 4.
- Day unlock rules: Task 1, Task 4, Task 5.
- Step completion requirements: Task 3 and Task 4.
- Active drill inputs: Task 1 and Task 4.
- Translation input before reference: Task 4.
- Output completion checks: Task 3 and Task 4.
- Review item creation and resolution: Task 2, Task 4, Task 5.
- Course states: Task 5.
- Me progress and outputs: Task 5.
- Review badge: Task 5.
- E2E coverage: Task 6.

Commands for final acceptance:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected final state:

- V1.1 tests pass.
- Build passes.
- E2E verifies Day 1 completion, Day 2 unlock, Review item creation/resolution path, refresh persistence, and mobile navigation.
- Git worktree is clean after final commits.
