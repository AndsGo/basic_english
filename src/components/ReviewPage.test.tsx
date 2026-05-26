import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createWordReviewItem } from '../domain/review';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { ReviewPage } from './ReviewPage';

describe('ReviewPage', () => {
  it('resolves known review items and shows the empty state', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('review-page-resolve-known-item');

    await repo.saveReviewItem(
      createWordReviewItem({
        wordId: 'name',
        wordText: 'name',
        sourceDayId: 'day-001',
        now: '2026-05-26T00:00:00.000Z',
      }),
    );

    render(<ReviewPage repository={repo} />);

    expect(await screen.findByText('name')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'I know this' }));

    await waitFor(() => {
      expect(screen.getByText("No review items. Start today's task.")).toBeInTheDocument();
    });
  });
});
