import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MasteryContentType, MasteryProgress, MasteryReviewSession } from '../domain/mastery';
import type { DayProgress } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import { normalizeSceneOutput } from '../domain/sceneOutput';
import type {
  ExerciseAttempt,
  PictureDescription,
  ProgressRepository,
  SceneRemixAttempt,
  StepCompletion,
  StepProgress,
  StudyActivity,
  UserOutput,
  WordProgress,
} from './progressRepository';

const DB_VERSION = 6;

interface ProgressDb extends DBSchema {
  dayProgress: {
    key: string;
    value: DayProgress;
  };
  stepProgress: {
    key: string;
    value: StepProgress;
  };
  stepCompletions: {
    key: string;
    value: StepCompletion;
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
  pictureDescriptions: {
    key: string;
    value: PictureDescription;
  };
  wordProgress: {
    key: string;
    value: WordProgress;
  };
  reviewItems: {
    key: string;
    value: ReviewItem;
    indexes: { byStatus: ReviewItem['status']; bySourceDayId: string };
  };
  studyActivities: {
    key: string;
    value: StudyActivity;
  };
  masteryProgress: {
    key: string;
    value: MasteryProgress;
    indexes: { byContentId: string; byDueAt: string };
  };
  masteryReviewSessions: {
    key: string;
    value: MasteryReviewSession;
  };
}

async function openProgressDb(name: string): Promise<IDBPDatabase<ProgressDb>> {
  return openDB<ProgressDb>(name, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      if (!db.objectStoreNames.contains('dayProgress')) {
        db.createObjectStore('dayProgress', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stepProgress')) {
        db.createObjectStore('stepProgress', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stepCompletions')) {
        const store = db.createObjectStore('stepCompletions', { keyPath: 'id' });
        store.createIndex('byDayId', 'dayId');
      }
      if (!db.objectStoreNames.contains('exerciseAttempts')) {
        const store = db.createObjectStore('exerciseAttempts', { keyPath: 'id' });
        store.createIndex('byDayId', 'dayId');
      }
      if (!db.objectStoreNames.contains('sceneRemixAttempts')) {
        const store = db.createObjectStore('sceneRemixAttempts', { keyPath: 'id' });
        store.createIndex('byDayId', 'dayId');
      }
      if (db.objectStoreNames.contains('userOutputs')) {
        const userOutputsStore = transaction.objectStore('userOutputs');
        if (userOutputsStore.keyPath !== 'dayId') {
          // Pre-release migration: discard the v1 id-keyed store so dayId can be the single durable key.
          db.deleteObjectStore('userOutputs');
          db.createObjectStore('userOutputs', { keyPath: 'dayId' });
        }
      } else {
        db.createObjectStore('userOutputs', { keyPath: 'dayId' });
      }
      if (!db.objectStoreNames.contains('wordProgress')) {
        db.createObjectStore('wordProgress', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pictureDescriptions')) {
        db.createObjectStore('pictureDescriptions', { keyPath: 'dayId' });
      }
      if (!db.objectStoreNames.contains('reviewItems')) {
        const store = db.createObjectStore('reviewItems', { keyPath: 'id' });
        store.createIndex('byStatus', 'status');
        store.createIndex('bySourceDayId', 'sourceDayId');
      }
      if (!db.objectStoreNames.contains('studyActivities')) {
        db.createObjectStore('studyActivities', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('masteryProgress')) {
        const store = db.createObjectStore('masteryProgress', { keyPath: 'id' });
        store.createIndex('byContentId', 'contentId');
        store.createIndex('byDueAt', 'dueAt');
      }
      if (!db.objectStoreNames.contains('masteryReviewSessions')) {
        db.createObjectStore('masteryReviewSessions', { keyPath: 'localDate' });
      }
    },
  });
}

function normalizeUserOutput(output: UserOutput): UserOutput {
  return {
    ...output,
    sentenceCount: output.sentenceCount ?? 0,
    scene: output.scene ? normalizeSceneOutput(output.scene) : undefined,
  };
}

export function createIndexedDbProgressRepository(dbName = 'basic-english-progress'): ProgressRepository {
  const dbPromise = openProgressDb(dbName);

  return {
    async getDayProgress(dayId) {
      const db = await dbPromise;
      return (await db.get('dayProgress', dayId)) ?? null;
    },

    async listDayProgress() {
      const db = await dbPromise;
      return db.getAll('dayProgress');
    },

    async saveDayProgress(progress) {
      const db = await dbPromise;
      await db.put('dayProgress', progress);
    },

    async saveStepProgress(progress) {
      const db = await dbPromise;
      await db.put('stepProgress', progress);
    },

    async saveStepCompletion(completion) {
      const db = await dbPromise;
      await db.put('stepCompletions', completion);
    },

    async listStepCompletions(dayId) {
      const db = await dbPromise;
      return (await db.getAll('stepCompletions')).filter((completion) => completion.dayId === dayId);
    },

    async saveExerciseAttempt(attempt) {
      const db = await dbPromise;
      await db.put('exerciseAttempts', attempt);
    },

    async listExerciseAttempts(dayId) {
      const db = await dbPromise;
      return (await db.getAll('exerciseAttempts')).filter((attempt) => attempt.dayId === dayId);
    },

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

    async saveUserOutput(output) {
      const db = await dbPromise;
      await db.put(
        'userOutputs',
        normalizeUserOutput({
          ...output,
          id: output.id || `output-${output.dayId}`,
          sentenceCount: output.sentenceCount ?? 0,
        }),
      );
    },

    async getUserOutput(dayId) {
      const db = await dbPromise;
      const output = await db.get('userOutputs', dayId);
      return output ? normalizeUserOutput(output) : null;
    },

    async listUserOutputs() {
      const db = await dbPromise;
      return (await db.getAll('userOutputs')).map(normalizeUserOutput);
    },

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

    async saveWordProgress(progress) {
      const db = await dbPromise;
      await db.put('wordProgress', progress);
    },

    async listReviewWords() {
      const db = await dbPromise;
      const words = await db.getAll('wordProgress');
      return words
        .filter((word) => word.status === 'review' || word.status === 'seen')
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === 'review' ? -1 : 1;
          return a.id.localeCompare(b.id);
        });
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

    async saveMasteryProgress(progress) {
      const db = await dbPromise;
      await db.put('masteryProgress', progress);
    },

    async getMasteryProgress(contentType, contentId) {
      const db = await dbPromise;
      const records = await db.getAllFromIndex('masteryProgress', 'byContentId', contentId);
      return records.find((record) => record.contentType === contentType) ?? null;
    },

    async listMasteryProgress() {
      const db = await dbPromise;
      return (await db.getAll('masteryProgress')).sort(
        (left, right) => left.dueAt.localeCompare(right.dueAt) || left.id.localeCompare(right.id),
      );
    },

    async saveMasteryReviewSession(session) {
      const db = await dbPromise;
      await db.put('masteryReviewSessions', session);
    },

    async getMasteryReviewSession(localDate) {
      const db = await dbPromise;
      return (await db.get('masteryReviewSessions', localDate)) ?? null;
    },
  };
}
