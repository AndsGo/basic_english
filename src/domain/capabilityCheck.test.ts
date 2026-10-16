import { describe, expect, it } from 'vitest';
import {
  assessCapabilityCheck,
  createCapabilityCheckAttempt,
  getLatestCapabilityAttempts,
  selectDueCapabilityAttempts,
} from './capabilityCheck';

describe('capability check', () => {
  it('only marks clear, complete output without help as independent', () => {
    expect(assessCapabilityCheck({ meaningComplete: true, clarity: 'clear', usedHints: [] })).toBe('independent');
    expect(assessCapabilityCheck({ meaningComplete: true, clarity: 'clear', usedHints: ['keywords'] })).toBe('with-help');
    expect(assessCapabilityCheck({ meaningComplete: false, clarity: 'clear', usedHints: [] })).toBe('practice-again');
    expect(assessCapabilityCheck({ meaningComplete: true, clarity: 'partly-clear', usedHints: [] })).toBe('practice-again');
  });

  it('schedules practice by result', () => {
    const independent = createCapabilityCheckAttempt({
      capabilityId: 'introduce-myself', taskId: 'check-self', dayId: 'day-001', listeningCorrect: true,
      writtenText: 'My name is Li. I am from China.', usedHints: [], meaningComplete: true, clarity: 'clear',
      now: '2026-09-25T00:00:00.000Z',
    });
    const withHelp = createCapabilityCheckAttempt({
      capabilityId: 'buy-simple-things', taskId: 'check-shop', dayId: 'day-024', listeningCorrect: true,
      writtenText: 'I want bread. I buy it.', usedHints: ['patterns'], meaningComplete: true, clarity: 'clear',
      now: '2026-09-25T00:00:00.000Z',
    });

    expect(independent.dueAt).toBe('2026-10-02T00:00:00.000Z');
    expect(withHelp.dueAt).toBe('2026-09-28T00:00:00.000Z');
  });

  it('uses only the latest attempt for due review', () => {
    const older = createCapabilityCheckAttempt({
      capabilityId: 'introduce-myself', taskId: 'check-self', dayId: 'day-001', listeningCorrect: true,
      writtenText: 'My name is Li.', usedHints: [], meaningComplete: false, clarity: 'unclear',
      now: '2026-09-20T00:00:00.000Z',
    });
    const latest = createCapabilityCheckAttempt({
      capabilityId: 'introduce-myself', taskId: 'check-self', dayId: 'day-001', listeningCorrect: true,
      writtenText: 'My name is Li. I am from China.', usedHints: [], meaningComplete: true, clarity: 'clear',
      now: '2026-09-24T00:00:00.000Z',
    });

    expect(getLatestCapabilityAttempts([older, latest])).toEqual([latest]);
    expect(selectDueCapabilityAttempts([older, latest], '2026-09-25T12:00:00.000Z')).toEqual([]);
  });
});
