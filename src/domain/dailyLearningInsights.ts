import { getScenarioCapabilityMasteryState } from './capabilities';
import type { MasteryContentType, MasteryProgress, MasteryReviewSession } from './mastery';
import type { ReviewItem } from './review';
import type { Course, ScenarioCapability } from './types';

export type LearningInsightOutcome = 'strong' | 'keep_practicing' | 'focus';
export type LearningInsightSource = 'mastery_miss' | 'mastery_learning' | 'manual_review' | 'scenario_gap';

export interface DailyLearningInsightItem {
  contentType: MasteryContentType;
  contentId: string;
  contentKey: string;
  source: LearningInsightSource;
  reason: string;
  scenarioId?: string;
  scenarioTitle?: string;
}

export interface DailyLearningInsight {
  id: string;
  localDate: string;
  outcome: LearningInsightOutcome;
  items: DailyLearningInsightItem[];
}

export interface DailyLearningInsightInput {
  course: Course;
  capabilities: ScenarioCapability[];
  completedDayIds: string[];
  masteryProgress: MasteryProgress[];
  activeReviewItems: ReviewItem[];
  masterySessions: MasteryReviewSession[];
  localDate: string;
}

interface InsightCandidate extends DailyLearningInsightItem {
  lastAnsweredAt?: string;
  dueAt?: string;
}

function contentKey(contentType: MasteryContentType, contentId: string): string {
  return `${contentType}:${contentId}`;
}

function reasonFor(source: LearningInsightSource, contentType: MasteryContentType, status?: MasteryProgress['status']): string {
  const noun = contentType === 'word' ? 'word' : 'pattern';

  if (source === 'mastery_miss') return `You missed this ${noun} in mastery review.`;
  if (source === 'manual_review') return `You marked this ${noun} for review.`;
  if (source === 'scenario_gap') return 'This scenario is still building.';
  return status === 'needs_reinforcement' ? `This ${noun} needs reinforcement.` : `Keep practicing this ${noun}.`;
}

function scenarioForSourceDay(capabilities: ScenarioCapability[], sourceDayId: string): ScenarioCapability | undefined {
  return capabilities.find((capability) => capability.unlockedByDayIds.includes(sourceDayId));
}

function createCandidate(input: {
  contentType: MasteryContentType;
  contentId: string;
  source: LearningInsightSource;
  sourceDayId?: string;
  status?: MasteryProgress['status'];
  lastAnsweredAt?: string;
  dueAt?: string;
  capabilities: ScenarioCapability[];
  scenario?: ScenarioCapability;
}): InsightCandidate {
  const scenario = input.scenario ?? (input.sourceDayId ? scenarioForSourceDay(input.capabilities, input.sourceDayId) : undefined);
  const key = contentKey(input.contentType, input.contentId);

  return {
    contentType: input.contentType,
    contentId: input.contentId,
    contentKey: key,
    source: input.source,
    reason: reasonFor(input.source, input.contentType, input.status),
    scenarioId: scenario?.id,
    scenarioTitle: scenario?.title,
    lastAnsweredAt: input.lastAnsweredAt,
    dueAt: input.dueAt,
  };
}

function compareCandidates(left: InsightCandidate, right: InsightCandidate): number {
  const byLastAnsweredAt = (right.lastAnsweredAt ?? '').localeCompare(left.lastAnsweredAt ?? '');
  if (byLastAnsweredAt !== 0) return byLastAnsweredAt;

  const byDueAt = (left.dueAt ?? '\uffff').localeCompare(right.dueAt ?? '\uffff');
  if (byDueAt !== 0) return byDueAt;

  return left.contentKey.localeCompare(right.contentKey);
}

function addCandidates(target: Map<string, InsightCandidate>, candidates: InsightCandidate[]): void {
  candidates.sort(compareCandidates).forEach((candidate) => {
    if (!target.has(candidate.contentKey)) target.set(candidate.contentKey, candidate);
  });
}

function latestApplicableSession(sessions: MasteryReviewSession[], localDate: string): MasteryReviewSession | undefined {
  return sessions
    .filter((session) => session.localDate <= localDate)
    .sort((left, right) => right.localDate.localeCompare(left.localDate) || right.updatedAt.localeCompare(left.updatedAt))[0];
}

function wasAnsweredInSession(record: MasteryProgress, session: MasteryReviewSession): boolean {
  return session.completedProgressIds.includes(record.id)
    && record.lastAnsweredAt !== undefined
    && record.lastAnsweredAt.slice(0, 10) <= session.localDate;
}

function manualReviewContent(item: ReviewItem): { contentType: MasteryContentType; contentId: string } | undefined {
  if (item.status !== 'active') return undefined;
  if (item.type === 'word' && item.wordId) return { contentType: 'word', contentId: item.wordId };
  if (item.type === 'pattern' && item.taskId) return { contentType: 'pattern', contentId: item.taskId };
  return undefined;
}

function prerequisiteContentKeys(course: Course, capability: ScenarioCapability): string[] {
  const prerequisiteDayIds = new Set(capability.unlockedByDayIds);
  return course.weeks
    .flatMap((week) => week.days)
    .filter((day) => prerequisiteDayIds.has(day.id))
    .flatMap((day) => [
      ...day.wordIds.map((id) => contentKey('word', id)),
      ...day.patternIds.map((id) => contentKey('pattern', id)),
    ]);
}

export function buildDailyLearningInsight(input: DailyLearningInsightInput): DailyLearningInsight {
  const selected = new Map<string, InsightCandidate>();
  const latestSession = latestApplicableSession(input.masterySessions, input.localDate);

  if (latestSession) {
    const incorrectProgressIds = new Set(latestSession.incorrectProgressIds ?? []);
    addCandidates(selected, input.masteryProgress
      .filter((record) => (
        (record.status === 'learning' || record.status === 'needs_reinforcement')
        && incorrectProgressIds.has(record.id)
        && wasAnsweredInSession(record, latestSession)
      ))
      .map((record) => createCandidate({ ...record, source: 'mastery_miss', capabilities: input.capabilities })));
  }

  addCandidates(selected, input.masteryProgress
    .filter((record) => record.status === 'learning' || record.status === 'needs_reinforcement')
    .map((record) => createCandidate({ ...record, source: 'mastery_learning', capabilities: input.capabilities })));

  addCandidates(selected, input.activeReviewItems.flatMap((item) => {
    const content = manualReviewContent(item);
    return content ? [createCandidate({ ...content, source: 'manual_review', sourceDayId: item.sourceDayId, dueAt: item.dueAt, capabilities: input.capabilities })] : [];
  }));

  const completedDays = new Set(input.completedDayIds);
  const progressByContentKey = new Map(input.masteryProgress.map((record) => [contentKey(record.contentType, record.contentId), record]));
  input.capabilities.forEach((capability) => {
    const prerequisitesComplete = capability.unlockedByDayIds.every((dayId) => completedDays.has(dayId));
    if (!prerequisitesComplete) return;

    const keys = [...new Set(prerequisiteContentKeys(input.course, capability))];
    const state = getScenarioCapabilityMasteryState(input.course, capability, input.completedDayIds, input.masteryProgress);
    if (state.status !== 'building') return;

    addCandidates(selected, keys.flatMap((key) => {
      const record = progressByContentKey.get(key);
      if (!record || record.status === 'stable' || record.status === 'mastered') return [];
      return [createCandidate({ ...record, source: 'scenario_gap', capabilities: input.capabilities, scenario: capability })];
    }));
  });

  const items = [...selected.values()].slice(0, 3).map(({ lastAnsweredAt: _lastAnsweredAt, dueAt: _dueAt, ...item }) => item);
  const outcome: LearningInsightOutcome = items.length === 0 ? 'strong' : items.length === 1 ? 'keep_practicing' : 'focus';

  return {
    id: `daily-learning-insight-${input.localDate}`,
    localDate: input.localDate,
    outcome,
    items,
  };
}
