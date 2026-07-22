import { openDB, type DBSchema } from 'idb';
import { describe, expect, it } from 'vitest';
import type { DayProgress } from '../domain/progress';
import { createSceneRemixReviewItem, createWordReviewItem, resolveReviewItem } from '../domain/review';
import { createPendingMasteryProgress } from '../domain/mastery';
import { createIndexedDbProgressRepository } from './indexedDbProgressRepository';
import type { ExerciseAttempt, PictureDescription, SceneRemixAttempt, UserOutput, WordProgress } from './progressRepository';

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
    sentenceCount: 1,
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

function pictureDescription(overrides: Partial<PictureDescription> = {}): PictureDescription {
  return {
    id: 'picture-description-day-008',
    dayId: 'day-008',
    taskId: 'picture-day-008-my-room',
    text: 'This is my room. There is a bed. I can see a table.',
    checkedAt: '2026-06-02T00:00:00.000Z',
    feedback: {
      status: 'ready',
      messages: ['Clear enough. You can continue.'],
      simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
    },
    updatedAt: '2026-06-02T00:00:00.000Z',
    ...overrides,
  };
}

interface OldV3ProgressDb extends DBSchema {
  dayProgress: {
    key: string;
    value: DayProgress;
  };
  stepProgress: {
    key: string;
    value: unknown;
  };
  stepCompletions: {
    key: string;
    value: unknown;
    indexes: { byDayId: string };
  };
  exerciseAttempts: {
    key: string;
    value: ExerciseAttempt;
    indexes: { byDayId: string };
  };
  sceneRemixAttempts: {
    key: string;
    value: SceneRemixAttempt;
    indexes: { byDayId: string };
  };
  userOutputs: {
    key: string;
    value: UserOutput;
  };
  wordProgress: {
    key: string;
    value: WordProgress;
  };
  reviewItems: {
    key: string;
    value: unknown;
    indexes: { byStatus: string; bySourceDayId: string };
  };
  studyActivities: {
    key: string;
    value: unknown;
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

    const db = await openDB(dbName, 6);
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

    const db = await openDB(dbName, 6);
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

    const db = await openDB(dbName, 6);
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

describe('indexedDbProgressRepository V1.4 scene remix', () => {
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
    const dbName = nextDbName();
    const oldOutput: UserOutput = {
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
    };
    const oldDb = await openDB<OldV3ProgressDb>(dbName, 3, {
      upgrade(db) {
        db.createObjectStore('dayProgress', { keyPath: 'id' });
        db.createObjectStore('stepProgress', { keyPath: 'id' });
        db.createObjectStore('stepCompletions', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('exerciseAttempts', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('userOutputs', { keyPath: 'dayId' });
        db.createObjectStore('wordProgress', { keyPath: 'id' });
        const reviewItemsStore = db.createObjectStore('reviewItems', { keyPath: 'id' });
        reviewItemsStore.createIndex('byStatus', 'status');
        reviewItemsStore.createIndex('bySourceDayId', 'sourceDayId');
        db.createObjectStore('studyActivities', { keyPath: 'id' });
      },
    });
    await oldDb.put('userOutputs', oldOutput);
    oldDb.close();

    const repo = createIndexedDbProgressRepository(dbName);
    const attempt: SceneRemixAttempt = {
      id: 'remix-attempt-after-upgrade',
      dayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      userAnswer: 'I am from Japan.',
      selfMark: 'close',
      createdAt: '2026-05-28T00:01:00.000Z',
    };

    expect(await repo.getUserOutput('day-001')).toMatchObject({
      dayId: 'day-001',
      text: 'I am from China.',
      sentenceCount: 1,
    });
    await repo.saveSceneRemixAttempt(attempt);
    expect(await repo.listSceneRemixAttempts('day-001')).toEqual([attempt]);
  });
});

describe('indexedDbProgressRepository V1.6 picture descriptions', () => {
  it('saves, gets, and lists picture descriptions', async () => {
    const repository = createIndexedDbProgressRepository(nextDbName());
    const description = pictureDescription();

    await repository.savePictureDescription(description);

    await expect(repository.getPictureDescription('day-008')).resolves.toEqual(description);
    await expect(repository.listPictureDescriptions()).resolves.toEqual([description]);
  });

  it('keeps existing data readable when adding the picture description store', async () => {
    const dbName = nextDbName();
    const oldOutput = userOutput({ text: 'My name is Li.' });
    const oldDb = await openDB<OldV3ProgressDb>(dbName, 4, {
      upgrade(db) {
        db.createObjectStore('dayProgress', { keyPath: 'id' });
        db.createObjectStore('stepProgress', { keyPath: 'id' });
        db.createObjectStore('stepCompletions', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('exerciseAttempts', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('sceneRemixAttempts', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('userOutputs', { keyPath: 'dayId' });
        db.createObjectStore('wordProgress', { keyPath: 'id' });
        const reviewItemsStore = db.createObjectStore('reviewItems', { keyPath: 'id' });
        reviewItemsStore.createIndex('byStatus', 'status');
        reviewItemsStore.createIndex('bySourceDayId', 'sourceDayId');
        db.createObjectStore('studyActivities', { keyPath: 'id' });
      },
    });
    await oldDb.put('userOutputs', oldOutput);
    oldDb.close();

    const repository = createIndexedDbProgressRepository(dbName);
    await repository.savePictureDescription(pictureDescription());

    await expect(repository.getUserOutput('day-001')).resolves.toEqual(oldOutput);
    await expect(repository.listPictureDescriptions()).resolves.toEqual([pictureDescription()]);
  });
});

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

  it('normalizes legacy user outputs without sentence counts when reading', async () => {
    const dbName = nextDbName();
    const repo = createIndexedDbProgressRepository(dbName);
    await repo.listUserOutputs();

    const db = await openDB(dbName, 6);
    await db.put('userOutputs', {
      id: 'legacy-output-day-001',
      dayId: 'day-001',
      text: 'My name is Li.',
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      updatedAt: '2026-05-26T00:00:00.000Z',
    } as UserOutput);
    db.close();

    await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({ sentenceCount: 0 });
    await expect(repo.listUserOutputs()).resolves.toEqual([
      expect.objectContaining({ dayId: 'day-001', sentenceCount: 0 }),
    ]);
  });

  it('saves and reloads scene output with user output', async () => {
    const repository = createIndexedDbProgressRepository('scene-output-persistence');

    await repository.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li.',
      sentenceCount: 4,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      scene: {
        sceneId: 'self',
        helpMode: 'guided',
        sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
        sceneText: 'My name is Li. I am from China. I am a student. I study English.',
        dialogue: 'A: What is your name?\nB: My name is Li.',
        completedAt: '2026-05-27T00:00:00.000Z',
      },
      updatedAt: '2026-05-27T00:00:00.000Z',
    });

    await expect(repository.getUserOutput('day-001')).resolves.toMatchObject({
      dayId: 'day-001',
      scene: {
        sceneId: 'self',
        helpMode: 'guided',
        sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
        sceneText: 'My name is Li. I am from China. I am a student. I study English.',
        dialogue: 'A: What is your name?\nB: My name is Li.',
      },
    });
  });

  it('normalizes incomplete stored scene output', async () => {
    const repository = createIndexedDbProgressRepository('scene-output-normalization');

    await repository.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: '',
      sentenceCount: 0,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: false,
        usedLessonWords: false,
        hasSubjects: false,
        meaningIsClear: false,
      },
      scene: {
        sceneId: 'self',
        helpMode: 'template',
        sentences: ['My name is Li.'],
        sceneText: '',
        dialogue: '',
      },
      updatedAt: '2026-05-27T00:00:00.000Z',
    });

    await expect(repository.getUserOutput('day-001')).resolves.toMatchObject({
      scene: {
        sceneId: 'self',
        helpMode: 'template',
        sentences: ['My name is Li.', '', '', ''],
        sceneText: '',
        dialogue: '',
      },
    });
  });

  it('persists step completions, study activities, and retrieves review items by id', async () => {
    const repo = createIndexedDbProgressRepository('v1-1-completion-activity-test');
    const reviewItem = createWordReviewItem({
      wordId: 'name',
      wordText: 'name',
      sourceDayId: 'day-001',
      now: '2026-05-26T00:00:00.000Z',
    });

    await repo.saveStepCompletion({
      id: 'completion-day-001-words',
      dayId: 'day-001',
      stepId: 'words',
      isComplete: true,
      completedAt: '2026-05-26T00:02:00.000Z',
      summary: { practicedCount: 3, reviewCreatedCount: 1 },
    });
    await repo.saveReviewItem(reviewItem);
    await repo.saveStudyActivity({
      id: 'activity-2026-05-26',
      localDate: '2026-05-26',
      completedDayIds: ['day-001'],
    });

    expect(await repo.listStepCompletions('day-001')).toHaveLength(1);
    expect(await repo.getReviewItem(reviewItem.id)).toEqual(reviewItem);
    expect(await repo.listStudyActivities()).toHaveLength(1);
  });
});

describe('indexedDbProgressRepository mastery persistence', () => {
  it('persists mastery records and a local-date session', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());
    const record = createPendingMasteryProgress({
      contentType: 'word',
      contentId: 'name',
      sourceDayId: 'day-001',
      now: '2026-07-22T08:00:00.000Z',
    });

    await repo.saveMasteryProgress(record);
    await repo.saveMasteryReviewSession({
      id: 'mastery-session-2026-07-22',
      localDate: '2026-07-22',
      completedProgressIds: ['mastery-word-name'],
      updatedAt: '2026-07-22T08:05:00.000Z',
    });

    await expect(repo.getMasteryProgress('word', 'name')).resolves.toEqual(record);
    await expect(repo.getMasteryReviewSession('2026-07-22')).resolves.toMatchObject({
      completedProgressIds: ['mastery-word-name'],
    });
  });

  it('lists mastery records by due date and then id', async () => {
    const repo = createIndexedDbProgressRepository(nextDbName());
    const later = createPendingMasteryProgress({
      contentType: 'word',
      contentId: 'later',
      sourceDayId: 'day-001',
      now: '2026-07-22T08:00:00.000Z',
    });
    const first = { ...later, id: 'mastery-word-first', contentId: 'first', dueAt: '2026-07-22T09:00:00.000Z' };
    const second = { ...later, id: 'mastery-word-second', contentId: 'second', dueAt: '2026-07-22T09:00:00.000Z' };

    await repo.saveMasteryProgress(later);
    await repo.saveMasteryProgress(second);
    await repo.saveMasteryProgress(first);

    await expect(repo.listMasteryProgress()).resolves.toEqual([first, second, later]);
  });

  it('upgrades a v5 database without losing existing user outputs', async () => {
    const dbName = nextDbName();
    const oldOutput = userOutput({ text: 'I am from China.' });
    const legacyDb = await openDB(dbName, 5, {
      upgrade(db) {
        db.createObjectStore('dayProgress', { keyPath: 'id' });
        db.createObjectStore('stepProgress', { keyPath: 'id' });
        db.createObjectStore('stepCompletions', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('exerciseAttempts', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('sceneRemixAttempts', { keyPath: 'id' }).createIndex('byDayId', 'dayId');
        db.createObjectStore('userOutputs', { keyPath: 'dayId' });
        db.createObjectStore('wordProgress', { keyPath: 'id' });
        const reviewItemsStore = db.createObjectStore('reviewItems', { keyPath: 'id' });
        reviewItemsStore.createIndex('byStatus', 'status');
        reviewItemsStore.createIndex('bySourceDayId', 'sourceDayId');
        db.createObjectStore('studyActivities', { keyPath: 'id' });
        db.createObjectStore('pictureDescriptions', { keyPath: 'dayId' });
      },
    });
    await legacyDb.put('userOutputs', oldOutput);
    legacyDb.close();

    const repo = createIndexedDbProgressRepository(dbName);
    const record = createPendingMasteryProgress({
      contentType: 'word',
      contentId: 'name',
      sourceDayId: 'day-001',
      now: '2026-07-22T08:00:00.000Z',
    });
    await repo.saveMasteryProgress(record);

    await expect(repo.getUserOutput('day-001')).resolves.toEqual(oldOutput);
    await expect(repo.getMasteryProgress('word', 'name')).resolves.toEqual(record);
  });
});
