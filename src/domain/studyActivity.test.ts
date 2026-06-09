import { describe, expect, it } from 'vitest';
import { buildStudyActivity, toLocalDateString } from './studyActivity';

describe('study activity', () => {
  it('formats a date as a local YYYY-MM-DD string', () => {
    const date = new Date(2026, 5, 9, 12, 0, 0); // local June 9 2026, noon (TZ-safe)

    expect(toLocalDateString(date)).toBe('2026-06-09');
  });

  it('creates a study activity record for a new day', () => {
    expect(buildStudyActivity(undefined, 'day-001', '2026-06-09')).toEqual({
      id: 'activity-2026-06-09',
      localDate: '2026-06-09',
      completedDayIds: ['day-001'],
    });
  });

  it('merges and dedupes the day id into the existing record for that date', () => {
    const existing = { id: 'activity-2026-06-09', localDate: '2026-06-09', completedDayIds: ['day-001'] };

    expect(buildStudyActivity(existing, 'day-002', '2026-06-09')).toEqual({
      id: 'activity-2026-06-09',
      localDate: '2026-06-09',
      completedDayIds: ['day-001', 'day-002'],
    });
    expect(buildStudyActivity(existing, 'day-001', '2026-06-09').completedDayIds).toEqual(['day-001']);
  });
});
