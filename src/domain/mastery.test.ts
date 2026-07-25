import { describe, expect, it } from 'vitest';
import {
  applyMasteryAnswer,
  addLocalCalendarDays,
  createPendingMasteryProgress,
  getScenarioMasteryState,
  selectDueMasteryProgress,
  toLocalDateString,
} from './mastery';

const now = '2026-07-22T08:00:00.000Z';

describe('mastery scheduling', () => {
  it('creates pending validation records due the next day', () => {
    expect(createPendingMasteryProgress({ contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now })).toEqual({
      id: 'mastery-word-name',
      contentType: 'word',
      contentId: 'name',
      sourceDayId: 'day-001',
      status: 'pending_validation',
      consecutiveCorrect: 0,
      dueAt: '2026-07-23T08:00:00.000Z',
      updatedAt: now,
    });
  });

  it('prioritizes overdue reinforcement and returns at most eight unseen records', () => {
    const records = Array.from({ length: 10 }, (_, index) => ({
      ...createPendingMasteryProgress({ contentType: 'word', contentId: `word-${index}`, sourceDayId: 'day-001', now }),
      dueAt: now,
    }));
    records[9] = { ...records[9], status: 'needs_reinforcement', dueAt: '2026-07-20T08:00:00.000Z' };

    const result = selectDueMasteryProgress(records, { now, completedProgressIds: ['mastery-word-word-0'] });

    expect(result).toHaveLength(8);
    expect(result[0].contentId).toBe('word-9');
    expect(result.map((record) => record.id)).not.toContain('mastery-word-word-0');
  });

  it('never exceeds the daily cap when a larger limit is requested', () => {
    const records = Array.from({ length: 10 }, (_, index) => ({
      ...createPendingMasteryProgress({ contentType: 'word', contentId: `cap-${index}`, sourceDayId: 'day-001', now }),
      dueAt: now,
    }));

    expect(selectDueMasteryProgress(records, { now, completedProgressIds: [], limit: 9 })).toHaveLength(8);
  });

  it('promotes correct answers through learning, stable, and mastered', () => {
    const pending = createPendingMasteryProgress({ contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now });
    const learning = applyMasteryAnswer(pending, { correct: true, now });
    const stable = applyMasteryAnswer(learning, { correct: true, now: '2026-07-23T08:00:00.000Z' });
    const mastered = applyMasteryAnswer(stable, { correct: true, now: '2026-07-26T08:00:00.000Z' });

    expect([learning.status, stable.status, mastered.status]).toEqual(['learning', 'stable', 'mastered']);
    expect(mastered.dueAt).toBe('2026-08-02T08:00:00.000Z');
  });

  it('moves stable and mastered records to reinforcement on an incorrect answer', () => {
    const pending = createPendingMasteryProgress({ contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now });
    const stable = { ...pending, status: 'stable' as const, consecutiveCorrect: 2 };
    const mastered = { ...pending, status: 'mastered' as const, consecutiveCorrect: 3 };

    expect(applyMasteryAnswer(stable, { correct: false, now })).toMatchObject({
      status: 'needs_reinforcement',
      consecutiveCorrect: 0,
      dueAt: '2026-07-23T08:00:00.000Z',
      lastAnsweredAt: now,
      updatedAt: now,
    });
    expect(applyMasteryAnswer(mastered, { correct: false, now }).status).toBe('needs_reinforcement');
  });

  it('retains learning after an incorrect early answer', () => {
    const record = createPendingMasteryProgress({ contentType: 'pattern', contentId: 'i-am', sourceDayId: 'day-001', now });

    expect(applyMasteryAnswer(record, { correct: false, now }).status).toBe('learning');
  });

  it('excludes completed session records and sorts ties by age', () => {
    const older = createPendingMasteryProgress({ contentType: 'word', contentId: 'older', sourceDayId: 'day-001', now });
    const newer = { ...older, id: 'mastery-word-newer', contentId: 'newer', dueAt: now, lastAnsweredAt: '2026-07-22T07:00:00.000Z' };

    expect(selectDueMasteryProgress([newer, older], { now, completedProgressIds: [older.id] })).toEqual([newer]);
  });

  it('orders same-status same-due records by oldest last answer', () => {
    const olderAnswer = {
      ...createPendingMasteryProgress({ contentType: 'word', contentId: 'older-answer', sourceDayId: 'day-001', now }),
      status: 'learning' as const,
      dueAt: now,
      lastAnsweredAt: '2026-07-20T08:00:00.000Z',
    };
    const newerAnswer = {
      ...olderAnswer,
      id: 'mastery-word-newer-answer',
      contentId: 'newer-answer',
      lastAnsweredAt: '2026-07-21T08:00:00.000Z',
    };

    expect(selectDueMasteryProgress([newerAnswer, olderAnswer], { now, completedProgressIds: [] }).map((record) => record.id)).toEqual([
      olderAnswer.id,
      newerAnswer.id,
    ]);
  });
});

describe('scenario mastery state', () => {
  const stableWord = createPendingMasteryProgress({ contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now });
  const masteredPattern = createPendingMasteryProgress({ contentType: 'pattern', contentId: 'i-am', sourceDayId: 'day-001', now });

  it('marks a partially complete prerequisite set as building', () => {
    expect(getScenarioMasteryState({
      prerequisiteDayIds: ['day-001', 'day-002'],
      completedDayIds: ['day-001'],
      contentIds: ['word:name'],
      records: [stableWord],
    }).status).toBe('building');
  });

  it('returns ready at the 70 percent threshold', () => {
    const contentIds = Array.from({ length: 10 }, (_, index) => `word:word-${index}`);
    const result = getScenarioMasteryState({
      prerequisiteDayIds: ['day-001'],
      completedDayIds: ['day-001'],
      contentIds,
      records: contentIds.slice(0, 7).map((id) => ({
        ...stableWord,
        id: `mastery-${id}`,
        contentId: id.slice(5),
        status: 'stable' as const,
      })),
    });

    expect(result).toMatchObject({ status: 'ready', stablePercent: 70, verifiedCount: 7, totalCount: 10 });
  });

  it('does not return strong when reinforcement exists at 90 percent', () => {
    const contentIds = Array.from({ length: 10 }, (_, index) => `word:word-${index}`);
    const records = contentIds.map((id, index) => ({
      ...stableWord,
      id: `mastery-${id}`,
      contentId: id.slice(5),
      status: index === 9 ? ('needs_reinforcement' as const) : ('stable' as const),
    }));

    expect(getScenarioMasteryState({
      prerequisiteDayIds: ['day-001'], completedDayIds: ['day-001'], contentIds, records,
    })).toMatchObject({ status: 'ready', stablePercent: 90 });
  });

  it('does not round a fraction below 70 percent up to ready', () => {
    const contentIds = Array.from({ length: 23 }, (_, index) => `word:word-${index}`);
    const records = contentIds.slice(0, 16).map((id) => ({
      ...stableWord,
      id: `mastery-${id}`,
      contentId: id.slice(5),
      status: 'stable' as const,
    }));

    expect(getScenarioMasteryState({
      prerequisiteDayIds: ['day-001'], completedDayIds: ['day-001'], contentIds, records,
    }).status).toBe('building');
  });

  it('does not round a fraction below 90 percent up to strong', () => {
    const contentIds = Array.from({ length: 29 }, (_, index) => `word:word-${index}`);
    const records = contentIds.slice(0, 26).map((id) => ({
      ...stableWord,
      id: `mastery-${id}`,
      contentId: id.slice(5),
      status: 'stable' as const,
    }));

    expect(getScenarioMasteryState({
      prerequisiteDayIds: ['day-001'], completedDayIds: ['day-001'], contentIds, records,
    }).status).toBe('ready');
  });

  it('keeps a scenario with no content in building', () => {
    expect(getScenarioMasteryState({
      prerequisiteDayIds: ['day-001'], completedDayIds: ['day-001'], contentIds: [], records: [],
    }).status).toBe('building');
  });
});

describe('mastery date helpers', () => {
  it('formats local calendar dates with zero padding', () => {
    expect(toLocalDateString(new Date(2026, 6, 9, 12, 0, 0))).toBe('2026-07-09');
  });

  it('adds review intervals using local calendar dates', () => {
    const start = new Date(2026, 6, 22, 23, 30, 0);
    const next = addLocalCalendarDays(start, 1);

    expect(toLocalDateString(next)).toBe('2026-07-23');
    expect(next.getHours()).toBe(23);
    expect(next.getMinutes()).toBe(30);
  });
});
