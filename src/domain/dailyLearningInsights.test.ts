import { describe, expect, it } from 'vitest';
import type { MasteryProgress, MasteryReviewSession } from './mastery';
import type { ReviewItem } from './review';
import type { Course, ScenarioCapability } from './types';
import { buildDailyLearningInsight } from './dailyLearningInsights';

const localDate = '2026-07-27';
const now = '2026-07-27T08:00:00.000Z';

const course: Course = {
  id: 'insight-course',
  title: 'Insight Course',
  contentVersion: '1',
  schemaVersion: 1,
  words: [
    { id: 'name', text: 'name', category: 'general_thing', phonetic: '', definition: 'a name', chinese: '', example: 'My name is Li.', weekIntroduced: 1, tags: [] },
    { id: 'my', text: 'my', category: 'structure', phonetic: '', definition: 'belonging to me', chinese: '', example: 'My name is Li.', weekIntroduced: 1, tags: [] },
  ],
  patterns: [{ id: 'i-am', title: 'I am', use: 'Say who you are.', structure: 'I am + name.', examples: ['I am Li.'], slots: [] }],
  weeks: [
    {
      id: 'week-001',
      number: 1,
      title: 'Self',
      goal: 'Introduce yourself.',
      days: [
        {
          id: 'day-001', weekId: 'week-001', dayNumber: 1, title: 'Name', goal: 'Say your name.', estimatedMinutes: 10,
          review: { wordCount: 0, patternCount: 0 }, wordIds: ['name', 'my'], patternIds: ['i-am'], exercises: [],
          outputTask: { id: 'output-001', topic: 'Name', prompts: [], template: [], requiredSentenceCount: 1 },
        },
        {
          id: 'day-002', weekId: 'week-001', dayNumber: 2, title: 'More self', goal: 'Say more.', estimatedMinutes: 10,
          review: { wordCount: 0, patternCount: 0 }, wordIds: [], patternIds: [], exercises: [],
          outputTask: { id: 'output-002', topic: 'More self', prompts: [], template: [], requiredSentenceCount: 1 },
        },
      ],
    },
  ],
};

const capabilities: ScenarioCapability[] = [
  {
    id: 'self-introduction',
    title: 'Self Introduction',
    description: 'Introduce yourself.',
    unlockedByDayIds: ['day-001'],
    exampleOutputs: ['My name is Li.'],
  },
  {
    id: 'complete-introduction',
    title: 'Complete Introduction',
    description: 'Say more about yourself.',
    unlockedByDayIds: ['day-001', 'day-002'],
    exampleOutputs: ['I am Li.'],
  },
];

function masteryProgress(overrides: Partial<MasteryProgress> & Pick<MasteryProgress, 'contentType' | 'contentId'>): MasteryProgress {
  return {
    id: `mastery-${overrides.contentType}-${overrides.contentId}`,
    sourceDayId: 'day-001',
    status: 'pending_validation',
    consecutiveCorrect: 0,
    dueAt: '2026-07-28T08:00:00.000Z',
    updatedAt: now,
    ...overrides,
  };
}

function activeWordReview(wordId: string): ReviewItem {
  return {
    id: `review-word-day-001-${wordId}`,
    type: 'word',
    sourceDayId: 'day-001',
    sourceStepId: 'words',
    wordId,
    prompt: wordId,
    priority: 'normal',
    status: 'active',
    dueAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

describe('daily learning insights', () => {
  it('selects a recent mastery miss before learning, manual review, and scenario-gap content', () => {
    const missedName = masteryProgress({
      contentType: 'word', contentId: 'name', status: 'learning', lastAnsweredAt: now,
    });
    const learningMy = masteryProgress({
      contentType: 'word', contentId: 'my', status: 'learning', lastAnsweredAt: '2026-07-26T08:00:00.000Z',
    });
    const scenarioGapPattern = masteryProgress({ contentType: 'pattern', contentId: 'i-am' });
    const session: MasteryReviewSession = {
      id: `mastery-session-${localDate}`,
      localDate,
      completedProgressIds: [missedName.id],
      incorrectProgressIds: [missedName.id],
      updatedAt: now,
    };

    const result = buildDailyLearningInsight({
      course,
      capabilities,
      completedDayIds: ['day-001'],
      masteryProgress: [scenarioGapPattern, learningMy, missedName],
      activeReviewItems: [activeWordReview('name')],
      masterySessions: [session],
      localDate,
    });

    expect(result.outcome).toBe('focus');
    expect(result.items.map((item) => item.contentKey)).toEqual(['word:name', 'word:my', 'pattern:i-am']);
    expect(result.items[0]).toMatchObject({
      source: 'mastery_miss',
      reason: 'You missed this word in mastery review.',
      scenarioId: 'self-introduction',
      scenarioTitle: 'Self Introduction',
    });
    expect(result.items[2]).toMatchObject({
      source: 'scenario_gap',
      reason: 'This scenario is still building.',
    });
  });

  it('keeps a completed learning record as mastery learning when it was not recorded as incorrect', () => {
    const learningName = masteryProgress({
      contentType: 'word', contentId: 'name', status: 'learning', lastAnsweredAt: now,
    });
    const session: MasteryReviewSession = {
      id: `mastery-session-${localDate}`,
      localDate,
      completedProgressIds: [learningName.id],
      incorrectProgressIds: [],
      updatedAt: now,
    };

    const result = buildDailyLearningInsight({
      course,
      capabilities: [],
      completedDayIds: [],
      masteryProgress: [learningName],
      activeReviewItems: [],
      masterySessions: [session],
      localDate,
    });

    expect(result.items).toEqual([expect.objectContaining({
      contentKey: 'word:name',
      source: 'mastery_learning',
      reason: 'Keep practicing this word.',
    })]);
  });

  it('does not infer misses from a legacy completed session without incorrect progress IDs', () => {
    const learningName = masteryProgress({
      contentType: 'word', contentId: 'name', status: 'learning', lastAnsweredAt: now,
    });
    const session: MasteryReviewSession = {
      id: `mastery-session-${localDate}`,
      localDate,
      completedProgressIds: [learningName.id],
      updatedAt: now,
    };

    const result = buildDailyLearningInsight({
      course,
      capabilities: [],
      completedDayIds: [],
      masteryProgress: [learningName],
      activeReviewItems: [],
      masterySessions: [session],
      localDate,
    });

    expect(result.items[0]).toMatchObject({
      source: 'mastery_learning',
      reason: 'Keep practicing this word.',
    });
  });

  it('keeps one content item when multiple sources identify it and orders source ties deterministically', () => {
    const later = masteryProgress({
      contentType: 'word', contentId: 'name', status: 'learning', lastAnsweredAt: '2026-07-26T10:00:00.000Z', dueAt: '2026-07-30T08:00:00.000Z',
    });
    const earlierDue = masteryProgress({
      contentType: 'word', contentId: 'my', status: 'learning', lastAnsweredAt: '2026-07-26T10:00:00.000Z', dueAt: '2026-07-29T08:00:00.000Z',
    });

    const result = buildDailyLearningInsight({
      course,
      capabilities,
      completedDayIds: ['day-001'],
      masteryProgress: [later, earlierDue],
      activeReviewItems: [activeWordReview('name')],
      masterySessions: [],
      localDate,
    });

    expect(result.items.map((item) => item.contentKey)).toEqual(['word:my', 'word:name']);
    expect(result.items.find((item) => item.contentKey === 'word:name')?.source).toBe('mastery_learning');
  });

  it('returns a strong outcome and no items when no source identifies targeted practice', () => {
    expect(buildDailyLearningInsight({
      course,
      capabilities,
      completedDayIds: [],
      masteryProgress: [],
      activeReviewItems: [],
      masterySessions: [],
      localDate,
    })).toEqual({
      id: `daily-learning-insight-${localDate}`,
      localDate,
      outcome: 'strong',
      items: [],
    });
  });

  it('does not create scenario-gap candidates until every prerequisite is complete or from absent records', () => {
    const result = buildDailyLearningInsight({
      course,
      capabilities: [capabilities[1]],
      completedDayIds: ['day-001'],
      masteryProgress: [masteryProgress({ contentType: 'pattern', contentId: 'i-am' })],
      activeReviewItems: [],
      masterySessions: [],
      localDate,
    });

    expect(result.items).toEqual([]);
  });
});
