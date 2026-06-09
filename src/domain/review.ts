import type { StepId } from './progress';

export interface ReviewWordState {
  wordId: string;
  status: 'new' | 'seen' | 'review' | 'known' | 'mastered';
  lastSeenAt?: string;
}

const statusRank: Record<ReviewWordState['status'], number> = {
  review: 0,
  seen: 1,
  known: 2,
  new: 3,
  mastered: 4,
};

export function selectReviewWordIds(words: ReviewWordState[], count: number): string[] {
  return [...words]
    .sort((a, b) => {
      const byStatus = statusRank[a.status] - statusRank[b.status];
      if (byStatus !== 0) return byStatus;

      return (a.lastSeenAt ?? '').localeCompare(b.lastSeenAt ?? '');
    })
    .slice(0, count)
    .map((word) => word.wordId);
}

export type ReviewItemType = 'word' | 'pattern' | 'exercise' | 'translation' | 'output' | 'scene_remix' | 'picture_description';
export type ReviewPriority = 'low' | 'normal' | 'high';
export type ReviewStatus = 'active' | 'known';

export interface ReviewItem {
  id: string;
  type: ReviewItemType;
  sourceDayId: string;
  sourceStepId: StepId;
  source?: string;
  taskId?: string;
  wordId?: string;
  pictureDescriptionTaskId?: string;
  image?: string;
  targetWords?: string[];
  simpleVersion?: string[];
  prompt: string;
  userAnswer?: string;
  referenceAnswer?: string;
  priority: ReviewPriority;
  status: ReviewStatus;
  /** When this item next becomes due for review. Missing (legacy items) is treated as due now. */
  dueAt?: string;
  /** SM-2-lite ladder position: number of times the learner has rescheduled with "Review again". */
  reviewStage?: number;
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
    wordId,
    prompt: wordText,
    priority: 'normal',
    status: 'active',
    dueAt: now,
    reviewStage: 0,
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
    dueAt: now,
    reviewStage: 0,
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
    dueAt: now,
    reviewStage: 0,
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
    dueAt: now,
    reviewStage: 0,
    createdAt: now,
    updatedAt: now,
  };
}

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
  referenceAnswer?: string;
  now: string;
}): ReviewItem {
  return {
    id: `review-scene-remix-${sourceDayId}-${taskId}`,
    type: 'scene_remix',
    sourceDayId,
    sourceStepId: 'scene-remix',
    taskId,
    prompt,
    source,
    userAnswer,
    referenceAnswer,
    priority: 'normal',
    status: 'active',
    dueAt: now,
    reviewStage: 0,
    createdAt: now,
    updatedAt: now,
  };
}

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
    dueAt: now,
    reviewStage: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function resolveReviewItem(item: ReviewItem, now: string): ReviewItem {
  return { ...item, status: 'known', updatedAt: now };
}

/** SM-2-lite spacing ladder (in days) applied each time a learner taps "Review again". */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7];

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function isReviewItemDue(item: ReviewItem, now: string): boolean {
  if (item.status !== 'active') return false;
  const due = item.dueAt ?? item.createdAt;
  return !due || due <= now;
}

export function selectDueReviewItems(items: ReviewItem[], now: string): ReviewItem[] {
  return items.filter((item) => isReviewItemDue(item, now));
}

export function rescheduleReviewItem(item: ReviewItem, now: string): ReviewItem {
  const stage = item.reviewStage ?? 0;
  const intervalDays = REVIEW_INTERVAL_DAYS[Math.min(stage, REVIEW_INTERVAL_DAYS.length - 1)];
  return { ...item, status: 'active', reviewStage: stage + 1, dueAt: addDays(now, intervalDays), updatedAt: now };
}

export function getActiveReviewDayIds(items: ReviewItem[]): string[] {
  return Array.from(new Set(items.filter((item) => item.status === 'active').map((item) => item.sourceDayId)));
}

export function hasActiveSceneRemixReviewItem(items: ReviewItem[], taskId: string): boolean {
  return items.some((item) => item.type === 'scene_remix' && item.status === 'active' && item.taskId === taskId);
}

export function hasActivePictureDescriptionReviewItem(items: ReviewItem[], taskId: string): boolean {
  return items.some(
    (item) =>
      item.type === 'picture_description' &&
      item.status === 'active' &&
      (item.pictureDescriptionTaskId !== undefined ? item.pictureDescriptionTaskId === taskId : item.id.endsWith(`-${taskId}`)),
  );
}

export function hasActiveWordReviewItem(items: ReviewItem[], wordId: string): boolean {
  return items.some(
    (item) =>
      item.type === 'word' &&
      item.status === 'active' &&
      (item.wordId !== undefined ? item.wordId === wordId : item.id.endsWith(`-${wordId}`)),
  );
}
