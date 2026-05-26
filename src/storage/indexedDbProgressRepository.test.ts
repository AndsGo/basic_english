import { openDB } from 'idb';
import { describe, expect, it } from 'vitest';
import type { DayProgress } from '../domain/progress';
import { createIndexedDbProgressRepository } from './indexedDbProgressRepository';
import type { ExerciseAttempt, UserOutput, WordProgress } from './progressRepository';

let dbCounter = 0;

function nextDbName() {
  dbCounter += 1;
  return `basic-english-test-${dbCounter}`;
}

function dayProgress(overrides: Partial<DayProgress> = {}): DayProgress {
  return {
    id: 'day-001',
    dayId: 'day-001',
    status: 'in_progress',
    currentStep: 'words',
    completedStepIds: [],
    startedAt: '2026-05-25T12:00:00.000Z',
    updatedAt: '2026-05-25T12:05:00.000Z',
    contentVersion: '1.0.0',
    ...overrides,
  };
}

function userOutput(overrides: Partial<UserOutput> = {}): UserOutput {
  return {
    id: 'output-day-001',
    dayId: 'day-001',
    text: 'My name is Li.',
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: true,
      usedLessonWords: true,
      hasSubjects: true,
      meaningIsClear: true,
    },
    updatedAt: '2026-05-25T12:00:00.000Z',
    ...overrides,
  };
}

function wordProgress(overrides: Partial<WordProgress> = {}): WordProgress {
  return {
    id: 'word-name',
    wordId: 'name',
    status: 'seen',
    seenCount: 1,
    correctCount: 0,
    lastSeenAt: '2026-05-25T12:00:00.000Z',
    updatedAt: '2026-05-25T12:00:00.000Z',
    ...overrides,
  };
}

describe('indexedDbProgressRepository', () => {
  it('saves and loads day progress', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());

    await repo.saveDayProgress(dayProgress());

    await expect(repo.getDayProgress('day-001')).resolves.toMatchObject({
      dayId: 'day-001',
      currentStep: 'words',
    });
  });

  it('saves and loads user output by day id', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());

    await repo.saveUserOutput(userOutput({ id: 'custom-user-output-id' }));

    await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({
      id: 'custom-user-output-id',
      dayId: 'day-001',
      text: 'My name is Li.',
      selfRating: 'ok',
    });
  });

  it('replaces user output for the same day regardless of output id', async () => {
    const dbName = nextDbName();
    const repo = createIndexedDbProgressRepository(dbName);

    await repo.saveUserOutput(userOutput({ id: 'first-output-id', text: 'First draft.' }));
    await repo.saveUserOutput(userOutput({ id: 'second-output-id', text: 'Second draft.' }));

    await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({
      id: 'second-output-id',
      dayId: 'day-001',
      text: 'Second draft.',
    });

    const db = await openDB(dbName, 2);
    await expect(db.getAll('userOutputs')).resolves.toEqual([
      userOutput({ id: 'second-output-id', text: 'Second draft.' }),
    ]);
    db.close();
  });

  it('upgrades v1 user output store to day id primary key', async () => {
    const dbName = nextDbName();
    const legacyDb = await openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore('dayProgress', { keyPath: 'id' });
        db.createObjectStore('stepProgress', { keyPath: 'id' });
        db.createObjectStore('exerciseAttempts', { keyPath: 'id' });
        db.createObjectStore('userOutputs', { keyPath: 'id' }).createIndex('dayId', 'dayId');
        db.createObjectStore('wordProgress', { keyPath: 'id' });
      },
    });
    legacyDb.close();

    const repo = createIndexedDbProgressRepository(dbName);
    await repo.saveUserOutput(userOutput({ id: 'upgraded-output-id' }));

    await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({
      id: 'upgraded-output-id',
      dayId: 'day-001',
    });

    const db = await openDB(dbName, 2);
    await expect(db.getAll('userOutputs')).resolves.toEqual([userOutput({ id: 'upgraded-output-id' })]);
    db.close();
  });

  it('lists saved day progress records', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());

    await repo.saveDayProgress(dayProgress({ id: 'day-002', dayId: 'day-002', currentStep: 'patterns' }));
    await repo.saveDayProgress(dayProgress({ id: 'day-001', dayId: 'day-001', currentStep: 'words' }));

    await expect(repo.listDayProgress()).resolves.toEqual([
      dayProgress({ id: 'day-001', dayId: 'day-001', currentStep: 'words' }),
      dayProgress({ id: 'day-002', dayId: 'day-002', currentStep: 'patterns' }),
    ]);
  });

  it('saves exercise attempts', async () => {
    const dbName = nextDbName();
    const repo = createIndexedDbProgressRepository(dbName);
    const attempt: ExerciseAttempt = {
      id: 'attempt-day-001-fill-001-001',
      exerciseId: 'day-001-fill-001',
      dayId: 'day-001',
      answer: 'name',
      result: 'correct',
      createdAt: '2026-05-25T12:10:00.000Z',
    };

    await repo.saveExerciseAttempt(attempt);

    const db = await openDB(dbName, 2);
    await expect(db.get('exerciseAttempts', attempt.id)).resolves.toEqual(attempt);
    db.close();
  });

  it('saves word progress and lists review or seen words', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());

    await repo.saveWordProgress(wordProgress({ id: 'word-known', wordId: 'known', status: 'known' }));
    await repo.saveWordProgress(wordProgress({ id: 'word-seen', wordId: 'seen', status: 'seen' }));
    await repo.saveWordProgress(wordProgress({ id: 'word-review', wordId: 'review', status: 'review' }));
    await repo.saveWordProgress(wordProgress({ id: 'word-mastered', wordId: 'mastered', status: 'mastered' }));

    await expect(repo.listReviewWords()).resolves.toEqual([
      wordProgress({ id: 'word-review', wordId: 'review', status: 'review' }),
      wordProgress({ id: 'word-seen', wordId: 'seen', status: 'seen' }),
    ]);
  });
});
