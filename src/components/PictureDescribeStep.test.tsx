import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PictureDescribeTask } from '../domain/types';
import type { PictureDescription } from '../storage/progressRepository';
import { PictureDescribeStep } from './PictureDescribeStep';

afterEach(() => cleanup());

const task: PictureDescribeTask = {
  id: 'picture-day-008-my-room',
  dayId: 'day-008',
  title: 'My Room',
  goal: 'Say what you can see in this room.',
  image: '/room.png',
  targetWords: ['room', 'bed', 'table', 'window'],
  suggestedPatterns: ['This is ...', 'There is ...', 'I can see ...'],
  requiredSentenceCount: 3,
  simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
};

function description(overrides: Partial<PictureDescription> = {}): PictureDescription {
  return {
    id: 'picture-description-day-008',
    dayId: 'day-008',
    taskId: task.id,
    text: '',
    updatedAt: '2026-06-02T00:00:00.000Z',
    ...overrides,
  };
}

describe('PictureDescribeStep', () => {
  it('renders image, goal, target words, patterns, and sentence progress', () => {
    render(<PictureDescribeStep task={task} value={description()} onChange={vi.fn()} onChecked={vi.fn()} onAddToReview={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Describe the picture' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'My Room' })).toHaveAttribute('src', '/room.png');
    expect(screen.getByText('Say what you can see in this room.')).toBeInTheDocument();
    expect(screen.getByText('room')).toBeInTheDocument();
    expect(screen.getByText('There is ...')).toBeInTheDocument();
    expect(screen.getByText('0 / 3 sentences')).toBeInTheDocument();
  });

  it('checks an answer and returns checked feedback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChecked = vi.fn();

    render(<PictureDescribeStep task={task} value={description()} onChange={onChange} onChecked={onChecked} onAddToReview={vi.fn()} />);

    await user.type(screen.getByLabelText('Picture description'), 'This is my room. There is a bed. I can see a table.');
    await user.click(screen.getByRole('button', { name: 'Check' }));

    expect(screen.getByText('Clear enough. You can continue.')).toBeInTheDocument();
    expect(screen.getByText('Simple version')).toBeInTheDocument();
    expect(onChecked).toHaveBeenCalledWith(expect.objectContaining({ checkedAt: expect.any(String), feedback: expect.objectContaining({ status: 'ready' }) }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ text: 'This is my room. There is a bed. I can see a table.' }));
  });

  it('adds non-empty descriptions to review and shows review-added state', async () => {
    const user = userEvent.setup();
    const onAddToReview = vi.fn();

    const { rerender } = render(
      <PictureDescribeStep task={task} value={description()} onChange={vi.fn()} onChecked={vi.fn()} onAddToReview={onAddToReview} />,
    );

    expect(screen.getByRole('button', { name: 'Add to Review' })).toBeDisabled();
    await user.type(screen.getByLabelText('Picture description'), 'This is my room.');
    await user.click(screen.getByRole('button', { name: 'Add to Review' }));

    expect(onAddToReview).toHaveBeenCalledWith(expect.objectContaining({ text: 'This is my room.' }));

    rerender(
      <PictureDescribeStep
        task={task}
        value={description({ text: 'This is my room.', addedToReviewAt: '2026-06-02T00:01:00.000Z' })}
        onChange={vi.fn()}
        onChecked={vi.fn()}
        onAddToReview={onAddToReview}
        isReviewAdded
      />,
    );

    expect(screen.getByRole('button', { name: 'Added to Review' })).toBeDisabled();
  });
});
