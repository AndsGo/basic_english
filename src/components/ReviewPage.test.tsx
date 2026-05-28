import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSceneRemixReviewItem, createWordReviewItem } from '../domain/review';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { ReviewPage } from './ReviewPage';

afterEach(() => {
  cleanup();
});

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

  it('calls onReviewChange after resolving an item', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('review-page-resolve-callback');
    const onReviewChange = vi.fn();

    await repo.saveReviewItem(
      createWordReviewItem({
        wordId: 'name',
        wordText: 'name',
        sourceDayId: 'day-001',
        now: '2026-05-26T00:00:00.000Z',
      }),
    );

    render(<ReviewPage repository={repo} onReviewChange={onReviewChange} />);

    await user.click(await screen.findByRole('button', { name: 'I know this' }));

    await waitFor(() => {
      expect(onReviewChange).toHaveBeenCalledTimes(1);
    });
  });

  it('renders and completes an active scene remix review item', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('review-page-scene-remix-close');
    const onReviewChange = vi.fn();
    const item = createSceneRemixReviewItem({
      sourceDayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      prompt: 'Change China to Japan.',
      source: 'I am from China.',
      userAnswer: 'I am from China.',
      referenceAnswer: 'I am from Japan.',
      now: '2026-05-28T00:00:00.000Z',
    });
    await repo.saveReviewItem(item);

    render(<ReviewPage repository={repo} onReviewChange={onReviewChange} />);

    expect(await screen.findByRole('heading', { name: 'Review Scene Remix' })).toBeInTheDocument();
    expect(screen.getByText('Source: I am from China.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Scene remix answer'), 'I am from Japan.');
    await user.click(screen.getByRole('button', { name: 'Show reference' }));

    expect(screen.getByRole('heading', { name: 'Reference' })).toBeInTheDocument();
    expect(screen.getByText('I am from Japan.', { selector: '.reference-answer' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close enough' }));

    const attempts = await repo.listSceneRemixAttempts('day-001');
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      dayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      userAnswer: 'I am from Japan.',
      selfMark: 'close',
    });
    expect(await repo.listReviewItems('active')).toHaveLength(0);
    expect(onReviewChange).toHaveBeenCalled();
  });

  it('keeps a scene remix review item active when marked need review', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('review-page-scene-remix-review');
    const item = createSceneRemixReviewItem({
      sourceDayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      prompt: 'Change China to Japan.',
      userAnswer: 'I am from China.',
      referenceAnswer: 'I am from Japan.',
      now: '2026-05-28T00:00:00.000Z',
    });
    await repo.saveReviewItem(item);

    render(<ReviewPage repository={repo} />);

    expect(await screen.findByRole('heading', { name: 'Review Scene Remix' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Scene remix answer'), 'I am from China.');
    await user.click(screen.getByRole('button', { name: 'Show reference' }));

    expect(screen.getByRole('heading', { name: 'Reference' })).toBeInTheDocument();
    expect(screen.getByText('I am from Japan.', { selector: '.reference-answer' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Need review' }));

    const attempts = await repo.listSceneRemixAttempts('day-001');
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      dayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      userAnswer: 'I am from China.',
      selfMark: 'review',
    });
    const activeItems = await repo.listReviewItems('active');
    expect(activeItems).toHaveLength(1);
    expect(activeItems[0]).toMatchObject({
      id: item.id,
      userAnswer: 'I am from China.',
      status: 'active',
    });
  });
});
