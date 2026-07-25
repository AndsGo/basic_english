import type { DayProgress, StepId } from '../domain/progress';
import type { MasteryContentType, MasteryProgress, MasteryReviewSession } from '../domain/mastery';
import type { ReviewItem } from '../domain/review';
import type { SceneOutput, SceneRemixSelfMark } from '../domain/types';

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

export interface SceneRemixAttempt {
  id: string;
  dayId: string;
  taskId: string;
  userAnswer: string;
  selfMark: SceneRemixSelfMark;
  createdAt: string;
}

export interface UserOutput {
  id: string;
  dayId: string;
  text: string;
  sentenceCount: number;
  scene?: SceneOutput;
  selfRating: 'easy' | 'ok' | 'hard';
  checklist: {
    usedTargetPattern: boolean;
    usedLessonWords: boolean;
    hasSubjects: boolean;
    meaningIsClear: boolean;
  };
  updatedAt: string;
}

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
  saveSceneRemixAttempt(attempt: SceneRemixAttempt): Promise<void>;
  listSceneRemixAttempts(dayId?: string): Promise<SceneRemixAttempt[]>;
  saveUserOutput(output: UserOutput): Promise<void>;
  getUserOutput(dayId: string): Promise<UserOutput | null>;
  listUserOutputs(): Promise<UserOutput[]>;
  savePictureDescription(description: PictureDescription): Promise<void>;
  getPictureDescription(dayId: string): Promise<PictureDescription | null>;
  listPictureDescriptions(): Promise<PictureDescription[]>;
  saveWordProgress(progress: WordProgress): Promise<void>;
  listReviewWords(): Promise<WordProgress[]>;
  saveReviewItem(item: ReviewItem): Promise<void>;
  listReviewItems(status?: ReviewItem['status']): Promise<ReviewItem[]>;
  getReviewItem(id: string): Promise<ReviewItem | null>;
  saveStudyActivity(activity: StudyActivity): Promise<void>;
  listStudyActivities(): Promise<StudyActivity[]>;
  saveMasteryProgress(progress: MasteryProgress): Promise<void>;
  getMasteryProgress(contentType: MasteryContentType, contentId: string): Promise<MasteryProgress | null>;
  listMasteryProgress(): Promise<MasteryProgress[]>;
  saveMasteryReviewSession(session: MasteryReviewSession): Promise<void>;
  saveMasteryReviewResult?(progress: MasteryProgress, session: MasteryReviewSession): Promise<void>;
  getMasteryReviewSession(localDate: string): Promise<MasteryReviewSession | null>;
}
