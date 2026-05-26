import { describe, expect, it } from 'vitest';
import { selectReviewWordIds } from './review';

describe('review domain', () => {
  it('prioritizes all statuses for review selection', () => {
    const result = selectReviewWordIds(
      [
        { wordId: 'mastered-word', status: 'mastered', lastSeenAt: '2026-05-20T00:00:00.000Z' },
        { wordId: 'new-word', status: 'new', lastSeenAt: '2026-05-20T00:00:00.000Z' },
        { wordId: 'known-word', status: 'known', lastSeenAt: '2026-05-20T00:00:00.000Z' },
        { wordId: 'seen-word', status: 'seen', lastSeenAt: '2026-05-20T00:00:00.000Z' },
        { wordId: 'review-word', status: 'review', lastSeenAt: '2026-05-20T00:00:00.000Z' },
      ],
      5,
    );

    expect(result).toEqual(['review-word', 'seen-word', 'known-word', 'new-word', 'mastered-word']);
  });

  it('uses oldest last seen date when statuses match', () => {
    const result = selectReviewWordIds(
      [
        { wordId: 'recent', status: 'seen', lastSeenAt: '2026-05-24T00:00:00.000Z' },
        { wordId: 'older', status: 'seen', lastSeenAt: '2026-05-22T00:00:00.000Z' },
        { wordId: 'oldest', status: 'seen', lastSeenAt: '2026-05-20T00:00:00.000Z' },
      ],
      2,
    );

    expect(result).toEqual(['oldest', 'older']);
  });
});
