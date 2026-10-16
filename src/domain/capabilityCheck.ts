export type CapabilityCheckResult = 'independent' | 'with-help' | 'practice-again';
export type CapabilityClarity = 'clear' | 'partly-clear' | 'unclear';
export type CapabilityHint = 'keywords' | 'patterns' | 'reference' | 'chinese';

export interface CapabilityCheckAttempt {
  id: string;
  capabilityId: string;
  taskId: string;
  dayId: string;
  createdAt: string;
  dueAt: string;
  listeningCorrect: boolean;
  outputType: 'writing';
  writtenText: string;
  usedHints: CapabilityHint[];
  meaningComplete: boolean;
  clarity: CapabilityClarity;
  result: CapabilityCheckResult;
}

export interface CapabilityCheckAssessment {
  meaningComplete: boolean;
  clarity: CapabilityClarity;
  usedHints: CapabilityHint[];
}

export const capabilityReviewIntervalDays: Record<CapabilityCheckResult, number> = {
  independent: 7,
  'with-help': 3,
  'practice-again': 1,
};

export function assessCapabilityCheck(input: CapabilityCheckAssessment): CapabilityCheckResult {
  if (!input.meaningComplete || input.clarity !== 'clear') return 'practice-again';
  return input.usedHints.length === 0 ? 'independent' : 'with-help';
}

export function createCapabilityCheckAttempt(input: {
  capabilityId: string;
  taskId: string;
  dayId: string;
  listeningCorrect: boolean;
  writtenText: string;
  usedHints: CapabilityHint[];
  meaningComplete: boolean;
  clarity: CapabilityClarity;
  now: string;
}): CapabilityCheckAttempt {
  const result = assessCapabilityCheck(input);
  const dueAt = new Date(input.now);
  dueAt.setUTCDate(dueAt.getUTCDate() + capabilityReviewIntervalDays[result]);

  return {
    id: `capability-check-${input.capabilityId}-${input.now}`,
    capabilityId: input.capabilityId,
    taskId: input.taskId,
    dayId: input.dayId,
    createdAt: input.now,
    dueAt: dueAt.toISOString(),
    listeningCorrect: input.listeningCorrect,
    outputType: 'writing',
    writtenText: input.writtenText.trim(),
    usedHints: Array.from(new Set(input.usedHints)),
    meaningComplete: input.meaningComplete,
    clarity: input.clarity,
    result,
  };
}

export function getLatestCapabilityAttempts(attempts: CapabilityCheckAttempt[]): CapabilityCheckAttempt[] {
  const latest = new Map<string, CapabilityCheckAttempt>();

  attempts.forEach((attempt) => {
    const current = latest.get(attempt.capabilityId);
    if (!current || attempt.createdAt > current.createdAt) latest.set(attempt.capabilityId, attempt);
  });

  return [...latest.values()].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export function selectDueCapabilityAttempts(attempts: CapabilityCheckAttempt[], now: string): CapabilityCheckAttempt[] {
  return getLatestCapabilityAttempts(attempts).filter((attempt) => attempt.dueAt <= now);
}
