import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { DayProgress } from '../domain/progress';
import type { ExerciseAttempt, ProgressRepository, StepProgress, UserOutput, WordProgress } from './progressRepository';

const DB_VERSION = 2;

interface ProgressDb extends DBSchema {
  dayProgress: {
    key: string;
    value: DayProgress;
  };
  stepProgress: {
    key: string;
    value: StepProgress;
  };
  exerciseAttempts: {
    key: string;
    value: ExerciseAttempt;
  };
  userOutputs: {
    key: string;
    value: UserOutput;
  };
  wordProgress: {
    key: string;
    value: WordProgress;
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
      if (!db.objectStoreNames.contains('exerciseAttempts')) {
        db.createObjectStore('exerciseAttempts', { keyPath: 'id' });
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
    },
  });
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

    async saveExerciseAttempt(attempt) {
      const db = await dbPromise;
      await db.put('exerciseAttempts', attempt);
    },

    async saveUserOutput(output) {
      const db = await dbPromise;
      await db.put('userOutputs', { ...output, id: output.id || `output-${output.dayId}` });
    },

    async getUserOutput(dayId) {
      const db = await dbPromise;
      return (await db.get('userOutputs', dayId)) ?? null;
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
  };
}
