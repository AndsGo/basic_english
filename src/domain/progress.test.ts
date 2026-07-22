import { describe, expect, it } from 'vitest';
import {
  completeStep,
  deriveCourseDayStates,
  getCurrentDayId,
  getNextUnlockedDayId,
  startDay,
  stepOrder,
  updateStreak,
} from './progress';

describe('progress domain', () => {
  it('starts with mastery review and proceeds to the existing previous-day review', () => {
    const progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');

    expect(progress.currentStep).toBe('mastery-review');
    expect(completeStep(progress, 'mastery-review', '2026-05-25T12:01:00.000Z').currentStep).toBe('review');
  });

  it('completeStep advances through steps and marks completed at done', () => {
    let progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');

    for (const step of stepOrder.slice(0, -1)) {
      progress = completeStep(progress, step, `2026-05-25T12:0${stepOrder.indexOf(step) + 1}:00.000Z`);
    }

    expect(progress.currentStep).toBe('done');
    expect(progress.status).toBe('completed');
    expect(progress.completedAt).toBe('2026-05-25T12:09:00.000Z');
  });

  it('places scene remix and picture practice after translate and before output', () => {
    const progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');
    const translated = completeStep(progress, 'translate', '2026-05-25T12:05:00.000Z');
    const remixed = completeStep(translated, 'scene-remix', '2026-05-25T12:06:00.000Z');

    expect(stepOrder).toEqual(['mastery-review', 'review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture', 'output', 'done']);
    expect(translated.currentStep).toBe('scene-remix');
    expect(remixed.currentStep).toBe('picture');
  });

  it('getNextUnlockedDayId returns first incomplete day', () => {
    const next = getNextUnlockedDayId(['day-001', 'day-003'], ['day-001', 'day-002', 'day-003']);

    expect(next).toBe('day-002');
  });

  it('keeps the last day unlocked when every day is complete', () => {
    const next = getNextUnlockedDayId(['day-001', 'day-002'], ['day-001', 'day-002']);

    expect(next).toBe('day-002');
  });
});

describe('progress V1.1 rules', () => {
  const orderedDayIds = ['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006', 'day-007'];

  it('keeps Day 1 current for a new learner', () => {
    expect(getCurrentDayId([], orderedDayIds)).toBe('day-001');
  });

  it('unlocks the next incomplete day after completion', () => {
    expect(getNextUnlockedDayId(['day-001', 'day-002'], orderedDayIds)).toBe('day-003');
    expect(getCurrentDayId(['day-001', 'day-002'], orderedDayIds)).toBe('day-003');
  });

  it('keeps Day 7 current after the full week is complete', () => {
    expect(getCurrentDayId(orderedDayIds, orderedDayIds)).toBe('day-007');
  });

  it('derives completed, current, locked, and review-needed day states', () => {
    const states = deriveCourseDayStates({
      orderedDayIds,
      completedDayIds: ['day-001'],
      activeReviewDayIds: ['day-001'],
    });

    expect(states).toEqual({
      'day-001': 'review_needed',
      'day-002': 'current',
      'day-003': 'locked',
      'day-004': 'locked',
      'day-005': 'locked',
      'day-006': 'locked',
      'day-007': 'locked',
    });
  });

  it('tracks a simple local-date streak', () => {
    expect(updateStreak([], '2026-05-26')).toEqual(['2026-05-26']);
    expect(updateStreak(['2026-05-26'], '2026-05-26')).toEqual(['2026-05-26']);
    expect(updateStreak(['2026-05-26'], '2026-05-27')).toEqual(['2026-05-26', '2026-05-27']);
    expect(updateStreak(['2026-05-26'], '2026-05-28')).toEqual(['2026-05-28']);
  });

  it('records completed steps while moving through the day', () => {
    const started = startDay('day-001', '1.0.0', '2026-05-26T00:00:00.000Z');
    const updated = completeStep(started, 'mastery-review', '2026-05-26T00:01:00.000Z');

    expect(updated.completedStepIds).toContain('mastery-review');
    expect(updated.currentStep).toBe('review');
    expect(updated.status).toBe('in_progress');
  });
});

describe('progress V1.2 rules', () => {
  it('selects Day 8 when Days 1-7 are complete and Day 8 is ordered next', () => {
    const completedWeek1DayIds = ['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006', 'day-007'];
    const orderedDayIds = [...completedWeek1DayIds, 'day-008'];

    expect(getCurrentDayId(completedWeek1DayIds, orderedDayIds)).toBe('day-008');
  });
});
