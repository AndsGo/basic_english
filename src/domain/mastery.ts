export type MasteryContentType = 'word' | 'pattern';
export type MasteryStatus = 'pending_validation' | 'learning' | 'stable' | 'mastered' | 'needs_reinforcement';

export interface MasteryProgress {
  id: string;
  contentType: MasteryContentType;
  contentId: string;
  sourceDayId: string;
  status: MasteryStatus;
  consecutiveCorrect: number;
  dueAt: string;
  lastAnsweredAt?: string;
  updatedAt: string;
}

export interface MasteryReviewSession {
  id: string;
  localDate: string;
  completedProgressIds: string[];
  updatedAt: string;
}

export type ScenarioMasteryStatus = 'not_started' | 'building' | 'ready' | 'strong';

export interface ScenarioMasteryState {
  status: ScenarioMasteryStatus;
  verifiedCount: number;
  totalCount: number;
  stablePercent: number;
}

function addDays(iso: string, days: number): string {
  return new Date(new Date(iso).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function progressId(contentType: MasteryContentType, contentId: string): string {
  return `mastery-${contentType}-${contentId}`;
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createPendingMasteryProgress(input: {
  contentType: MasteryContentType;
  contentId: string;
  sourceDayId: string;
  now: string;
}): MasteryProgress {
  return {
    id: progressId(input.contentType, input.contentId),
    contentType: input.contentType,
    contentId: input.contentId,
    sourceDayId: input.sourceDayId,
    status: 'pending_validation',
    consecutiveCorrect: 0,
    dueAt: addDays(input.now, 1),
    updatedAt: input.now,
  };
}

const selectionRank: Record<MasteryStatus, number> = {
  needs_reinforcement: 0,
  learning: 1,
  stable: 1,
  pending_validation: 2,
  mastered: 3,
};

export function selectDueMasteryProgress(
  records: MasteryProgress[],
  input: { now: string; completedProgressIds: string[]; limit?: number },
): MasteryProgress[] {
  const completed = new Set(input.completedProgressIds);
  const limit = input.limit ?? 8;

  return records
    .filter((record) => record.dueAt <= input.now && !completed.has(record.id))
    .sort((left, right) => {
      const byStatus = selectionRank[left.status] - selectionRank[right.status];
      if (byStatus !== 0) return byStatus;

      const byDueAt = left.dueAt.localeCompare(right.dueAt);
      if (byDueAt !== 0) return byDueAt;

      return (left.lastAnsweredAt ?? '').localeCompare(right.lastAnsweredAt ?? '');
    })
    .slice(0, Math.max(0, limit));
}

export function applyMasteryAnswer(record: MasteryProgress, input: { correct: boolean; now: string }): MasteryProgress {
  if (!input.correct) {
    const status = record.status === 'stable' || record.status === 'mastered' ? 'needs_reinforcement' : 'learning';
    return {
      ...record,
      status,
      consecutiveCorrect: 0,
      dueAt: addDays(input.now, 1),
      lastAnsweredAt: input.now,
      updatedAt: input.now,
    };
  }

  const consecutiveCorrect = record.consecutiveCorrect + 1;
  const status: MasteryStatus =
    consecutiveCorrect >= 3 ? 'mastered' : consecutiveCorrect === 2 ? 'stable' : 'learning';
  const intervalDays = consecutiveCorrect >= 3 ? 7 : consecutiveCorrect === 2 ? 3 : 1;

  return {
    ...record,
    status,
    consecutiveCorrect,
    dueAt: addDays(input.now, intervalDays),
    lastAnsweredAt: input.now,
    updatedAt: input.now,
  };
}

export function getScenarioMasteryState(input: {
  prerequisiteDayIds: string[];
  completedDayIds: string[];
  contentIds: string[];
  records: MasteryProgress[];
}): ScenarioMasteryState {
  const prerequisitesComplete = input.prerequisiteDayIds.every((dayId) => input.completedDayIds.includes(dayId));
  const contentIds = [...new Set(input.contentIds)];
  const recordByContentId = new Map<string, MasteryProgress>(
    input.records.map((record) => [`${record.contentType}:${record.contentId}`, record]),
  );
  const relevantRecords = contentIds.map((contentId) => recordByContentId.get(contentId));
  const verifiedCount = relevantRecords.filter((record) => record?.status === 'stable' || record?.status === 'mastered').length;
  const stablePercent = contentIds.length === 0 ? 0 : Math.round((verifiedCount / contentIds.length) * 100);
  const hasReinforcement = relevantRecords.some((record) => record?.status === 'needs_reinforcement');

  if (!prerequisitesComplete) {
    return { status: 'not_started', verifiedCount, totalCount: contentIds.length, stablePercent };
  }

  const status = stablePercent >= 90 && !hasReinforcement ? 'strong' : stablePercent >= 70 ? 'ready' : 'building';
  return { status, verifiedCount, totalCount: contentIds.length, stablePercent };
}
