import type { DayProgress, StepId } from '../domain/progress';

export interface StepProgress {
  id: string;
  dayId: string;
  stepId: StepId;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: string;
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

export interface ProgressRepository {
  getDayProgress(dayId: string): Promise<DayProgress | null>;
  listDayProgress(): Promise<DayProgress[]>;
  saveDayProgress(progress: DayProgress): Promise<void>;
  saveStepProgress(progress: StepProgress): Promise<void>;
  saveExerciseAttempt(attempt: ExerciseAttempt): Promise<void>;
  saveUserOutput(output: UserOutput): Promise<void>;
  getUserOutput(dayId: string): Promise<UserOutput | null>;
  saveWordProgress(progress: WordProgress): Promise<void>;
  listReviewWords(): Promise<WordProgress[]>;
}
