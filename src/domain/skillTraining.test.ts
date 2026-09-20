import { describe, expect, it } from 'vitest';
import { createSkillAttempt, isSpeakingAttemptComplete } from './skillTraining';

const base = {
  id: 'attempt-1',
  dayId: 'day-001',
  taskId: 'd001-s1',
  skill: 'speaking' as const,
  revision: 1,
  createdAt: '2026-09-20T00:00:00.000Z',
};

describe('skill training evidence', () => {
  it('starts attempts without hints or feedback contamination', () => {
    expect(createSkillAttempt(base)).toMatchObject({ hintEvents: [], replayCount: 0, usedSlowRate: false, afterFeedback: false });
  });

  it('requires a saved recording, playback, and self-check for a completed speaking attempt', () => {
    const recorded = createSkillAttempt({ ...base, recordingId: 'recording-1' });
    expect(isSpeakingAttemptComplete(recorded)).toBe(false);
    expect(isSpeakingAttemptComplete({ ...recorded, playbackStartedAt: base.createdAt, selfMark: 'clear' })).toBe(true);
  });
});
