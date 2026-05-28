import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SceneRemixCard } from './SceneRemixCard';
import type { SceneRemixTask } from '../domain/types';

const task: SceneRemixTask = {
  id: 'day-008-remix-room-office',
  type: 'replace',
  prompt: 'Change room to office.',
  source: 'My room is small.',
  referenceAnswers: ['My office is small.'],
};

afterEach(() => cleanup());

describe('SceneRemixCard', () => {
  it('collects an answer and hides references before reveal', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is small.');

    expect(screen.getByDisplayValue('My office is small.')).toBeInTheDocument();
    expect(screen.queryByText('My office is small.', { selector: '.reference-answer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close enough' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Need review' })).not.toBeInTheDocument();
  });

  it('reveals references and submits close enough', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is small.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close enough' }));

    expect(screen.getByText('My office is small.', { selector: '.reference-answer' })).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith({
      userAnswer: 'My office is small.',
      selfMark: 'close',
    });
  });

  it('submits need review after reveal', async () => {
    const onSubmit = vi.fn();
    render(<SceneRemixCard task={task} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Scene remix answer'), 'My office is big.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

    expect(onSubmit).toHaveBeenCalledWith({
      userAnswer: 'My office is big.',
      selfMark: 'review',
    });
  });
});
