import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReviewItem } from '../domain/review';
import { PictureDescriptionReviewCard } from './PictureDescriptionReviewCard';

afterEach(() => cleanup());

const item: ReviewItem = {
  id: 'review-picture-description-day-008-picture-day-008-my-room',
  type: 'picture_description',
  sourceDayId: 'day-008',
  sourceStepId: 'picture',
  pictureDescriptionTaskId: 'picture-day-008-my-room',
  prompt: 'My Room',
  image: '/room.png',
  targetWords: ['room', 'bed', 'table'],
  userAnswer: 'This is my room. There is a bed. I can see a table.',
  referenceAnswer: 'This is my room. There is a bed. I can see a table.',
  simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
  priority: 'normal',
  status: 'active',
  createdAt: '2026-06-02T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
};

describe('PictureDescriptionReviewCard', () => {
  it('renders picture review details and resolves known', async () => {
    const onKnown = vi.fn();
    const user = userEvent.setup();

    render(<PictureDescriptionReviewCard item={item} onKnown={onKnown} />);

    expect(screen.getByRole('heading', { name: 'Review Picture Description' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'My Room' })).toHaveAttribute('src', '/room.png');
    expect(screen.getByText('room')).toBeInTheDocument();
    expect(screen.getByText('Original answer')).toBeInTheDocument();
    expect(screen.getByText('This is my room. There is a bed. I can see a table.')).toBeInTheDocument();
    expect(screen.getByText('Simple version')).toBeInTheDocument();
    expect(screen.getByLabelText('Picture description review answer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'I know this' }));

    expect(onKnown).toHaveBeenCalledTimes(1);
  });

  it('reschedules with Review again', async () => {
    const onReviewAgain = vi.fn();
    const user = userEvent.setup();

    render(<PictureDescriptionReviewCard item={item} onKnown={vi.fn()} onReviewAgain={onReviewAgain} />);

    await user.click(screen.getByRole('button', { name: 'Review again' }));

    expect(onReviewAgain).toHaveBeenCalledTimes(1);
  });
});
