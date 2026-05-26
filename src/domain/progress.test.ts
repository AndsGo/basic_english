import { describe, expect, it } from 'vitest';
import { completeStep, getNextUnlockedDayId, startDay, stepOrder } from './progress';

describe('progress domain', () => {
  it('starts a day at review step', () => {
    const progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');

    expect(progress).toEqual({
      id: 'day-001',
      dayId: 'day-001',
      status: 'in_progress',
      currentStep: 'review',
      startedAt: '2026-05-25T12:00:00.000Z',
      updatedAt: '2026-05-25T12:00:00.000Z',
      contentVersion: '1.0.0',
    });
  });

  it('completeStep advances through steps and marks completed at done', () => {
    let progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');

    for (const step of stepOrder.slice(0, -1)) {
      progress = completeStep(progress, step, `2026-05-25T12:0${stepOrder.indexOf(step) + 1}:00.000Z`);
    }

    expect(progress.currentStep).toBe('done');
    expect(progress.status).toBe('completed');
    expect(progress.completedAt).toBe('2026-05-25T12:06:00.000Z');
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
