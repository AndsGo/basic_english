import { describe, expect, it } from 'vitest';
import {
  createExerciseReviewItem,
  createOutputReviewItem,
  createTranslationReviewItem,
  createWordReviewItem,
  getActiveReviewDayIds,
  resolveReviewItem,
  selectReviewWordIds,
} from './review';

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

describe('review items', () => {
  it('creates word, exercise, translation, and output review items', () => {
    const now = '2026-05-26T00:00:00.000Z';

    expect(createWordReviewItem({ wordId: 'name', wordText: 'name', sourceDayId: 'day-001', now })).toMatchObject({
      id: 'review-word-day-001-name',
      type: 'word',
      sourceDayId: 'day-001',
      sourceStepId: 'words',
      prompt: 'name',
      priority: 'normal',
      status: 'active',
    });

    expect(
      createExerciseReviewItem({
        exerciseId: 'day-001-choice-001',
        sourceDayId: 'day-001',
        prompt: 'Pick one',
        userAnswer: 'wrong',
        referenceAnswer: 'right',
        now,
      }),
    ).toMatchObject({ type: 'exercise', priority: 'high', status: 'active' });

    expect(
      createTranslationReviewItem({
        exerciseId: 'day-001-translation-001',
        sourceDayId: 'day-001',
        prompt: 'Say your name.',
        userAnswer: 'My is Li.',
        referenceAnswer: 'My name is Li.',
        now,
      }),
    ).toMatchObject({ type: 'translation', sourceStepId: 'translate' });

    expect(
      createOutputReviewItem({
        sourceDayId: 'day-001',
        text: 'My name is Li.',
        now,
      }),
    ).toMatchObject({ type: 'output', sourceStepId: 'output', priority: 'normal' });
  });

  it('marks review items known without deleting data', () => {
    const item = createWordReviewItem({
      wordId: 'name',
      wordText: 'name',
      sourceDayId: 'day-001',
      now: '2026-05-26T00:00:00.000Z',
    });
    expect(resolveReviewItem(item, '2026-05-26T00:01:00.000Z')).toMatchObject({
      status: 'known',
      updatedAt: '2026-05-26T00:01:00.000Z',
    });
  });

  it('derives day IDs that still need review', () => {
    expect(
      getActiveReviewDayIds([
        createWordReviewItem({
          wordId: 'name',
          wordText: 'name',
          sourceDayId: 'day-001',
          now: '2026-05-26T00:00:00.000Z',
        }),
        {
          ...createWordReviewItem({
            wordId: 'am',
            wordText: 'am',
            sourceDayId: 'day-002',
            now: '2026-05-26T00:00:00.000Z',
          }),
          status: 'known',
        },
      ]),
    ).toEqual(['day-001']);
  });
});
