import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { SceneGoalBanner } from './SceneGoalBanner';

const goal: SceneGoal = {
  id: 'self',
  title: 'Self',
  capability: 'I can describe myself.',
  templates: [],
  guidedPrompts: [],
  scenePrompt: '',
  dialoguePrompts: [],
};

describe('SceneGoalBanner', () => {
  it('shows the current scene capability', () => {
    render(<SceneGoalBanner goal={goal} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('I can describe myself.')).toBeInTheDocument();
    expect(screen.getByText('Self')).toBeInTheDocument();
  });
});
