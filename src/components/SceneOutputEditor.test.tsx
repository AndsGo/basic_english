import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialSceneOutput } from '../domain/sceneOutput';
import type { SceneGoal, SceneOutput } from '../domain/types';
import { SceneOutputEditor } from './SceneOutputEditor';

const sceneGoal: SceneGoal = {
  id: 'self',
  title: 'Self',
  capability: 'I can describe myself.',
  templates: ['My name is ____.', 'I am from ____.', 'I am a ____.', 'I study English.'],
  guidedPrompts: ['Say your name.', 'Say where you are from.', 'Say what you do.', 'Say why you study English.'],
  scenePrompt: 'Use your sentences to describe yourself clearly.',
  dialoguePrompts: ['Ask and answer about your name.'],
};

afterEach(() => cleanup());

describe('SceneOutputEditor', () => {
  it('shows template guidance by default', () => {
    render(<SceneOutputEditor goal={sceneGoal} value={createInitialSceneOutput('self')} onChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Build Sentences' })).toBeInTheDocument();
    expect(screen.getByText('My name is ____.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Template' })).toBeChecked();
  });

  it('switches help modes without clearing input', async () => {
    const user = userEvent.setup();
    let value: SceneOutput = createInitialSceneOutput('self');
    const onChange = vi.fn((next: SceneOutput) => {
      value = next;
      rerender(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);
    });
    const { rerender } = render(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);

    await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
    await user.click(screen.getByRole('radio', { name: 'Guided' }));

    expect(screen.getByLabelText('Scene sentence 1')).toHaveValue('My name is Li.');
    expect(screen.getByText('Say your name.')).toBeInTheDocument();
  });

  it('updates sentences, scene text, and dialogue', async () => {
    const user = userEvent.setup();
    let value: SceneOutput = createInitialSceneOutput('self');
    const onChange = vi.fn((next: SceneOutput) => {
      value = next;
      rerender(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);
    });
    const { rerender } = render(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);

    await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
    await user.type(screen.getByLabelText('Scene description'), 'My name is Li. I study English.');
    await user.type(screen.getByLabelText('Scene dialogue'), 'A: What is your name?');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sentences: ['My name is Li.', '', '', ''] }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sceneText: 'My name is Li. I study English.' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dialogue: 'A: What is your name?' }));
  });
});
