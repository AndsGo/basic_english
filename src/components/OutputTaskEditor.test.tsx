import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { OutputTask } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';
import { OutputTaskEditor } from './OutputTaskEditor';

afterEach(() => cleanup());

const baseTask: OutputTask = {
  id: 'output-day-001',
  topic: 'My day',
  prompts: ['Write about today.'],
  template: ['I am ____.'],
  requiredSentenceCount: 1,
};

function output(overrides: Partial<UserOutput> = {}): UserOutput {
  return {
    id: 'user-output-day-001',
    dayId: 'day-001',
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    updatedAt: '2026-06-09T00:00:00.000Z',
    ...overrides,
  };
}

describe('OutputTaskEditor', () => {
  it("shows today's story sentence guidance for sentence story mode", () => {
    render(
      <OutputTaskEditor
        task={{
          ...baseTask,
          storyMode: 'sentence',
          storyPrompt: 'Write one sentence about going to the store.',
        }}
        value={output()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Today story sentence')).toBeInTheDocument();
    expect(screen.getByText('Write one sentence about going to the store.')).toBeInTheDocument();
  });

  it('shows story recap guidance for recap story mode', () => {
    render(
      <OutputTaskEditor
        task={{
          ...baseTask,
          storyMode: 'recap',
          storyPrompt: 'Use your sentences to recap the errand story.',
        }}
        value={output()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Story recap')).toBeInTheDocument();
    expect(screen.getByText('Use your sentences to recap the errand story.')).toBeInTheDocument();
  });

  it('does not show story guidance labels for ordinary tasks', () => {
    render(<OutputTaskEditor task={baseTask} value={output()} onChange={vi.fn()} />);

    expect(screen.queryByText('Today story sentence')).not.toBeInTheDocument();
    expect(screen.queryByText('Story recap')).not.toBeInTheDocument();
  });

  it('updates text when story metadata exists', () => {
    const onChange = vi.fn();

    render(
      <OutputTaskEditor
        task={{
          ...baseTask,
          storyMode: 'sentence',
          storyPrompt: 'Write one sentence about going to the store.',
        }}
        value={output()}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Daily output'), { target: { value: 'I go to the store.' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ text: 'I go to the store.', sentenceCount: 1 }));
  });
});
