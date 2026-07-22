export type StepId = 'mastery-review' | 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'scene-remix' | 'picture' | 'output' | 'done';

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

export const stepOrder: StepId[] = ['mastery-review', 'review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture', 'output', 'done'];

export function startDay(dayId: string, contentVersion: string, now: string): DayProgress {
  return {
    id: dayId,
    dayId,
    status: 'in_progress',
    currentStep: 'mastery-review',
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
