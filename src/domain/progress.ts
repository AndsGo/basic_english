export type StepId = 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'output' | 'done';

export interface DayProgress {
  id: string;
  dayId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: StepId;
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
    startedAt: now,
    updatedAt: now,
    contentVersion,
  };
}

export function completeStep(progress: DayProgress, step: StepId, now: string): DayProgress {
  const currentIndex = stepOrder.indexOf(step);
  const nextStep = stepOrder[currentIndex + 1] ?? 'done';

  return {
    ...progress,
    currentStep: nextStep,
    status: nextStep === 'done' ? 'completed' : 'in_progress',
    completedAt: nextStep === 'done' ? now : progress.completedAt,
    updatedAt: now,
  };
}

export function getNextUnlockedDayId(completedDayIds: string[], orderedDayIds: string[]): string {
  const completed = new Set(completedDayIds);

  return orderedDayIds.find((dayId) => !completed.has(dayId)) ?? orderedDayIds[orderedDayIds.length - 1];
}
