import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { SceneMap } from './SceneMap';

const goals: SceneGoal[] = [
  {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
  {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
];

describe('SceneMap', () => {
  it('marks completed and current scenes', () => {
    render(<SceneMap goals={goals} completedSceneIds={['self']} currentSceneId="room" />);

    expect(screen.getByRole('listitem', { name: /Self Completed/ })).toHaveClass('scene-map-item--completed');
    expect(screen.getByRole('listitem', { name: /Room Today/ })).toHaveClass('scene-map-item--current');
  });

  it('folds a long Today scene list around the current scene', async () => {
    const user = userEvent.setup();
    const longGoals = Array.from({ length: 8 }, (_, index): SceneGoal => ({
      id: `scene-${index + 1}`,
      title: `Scene ${index + 1}`,
      capability: `I can describe scene ${index + 1}.`,
      templates: [],
      guidedPrompts: [],
      scenePrompt: '',
      dialoguePrompts: [],
    }));

    render(<SceneMap goals={longGoals} completedSceneIds={['scene-3']} currentSceneId="scene-5" />);

    expect(screen.queryByRole('listitem', { name: /Scene 1 Next/ })).not.toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Scene 3 Completed/ })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Scene 5 Today/ })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Scene 7 Next/ })).toBeInTheDocument();
    expect(screen.queryByRole('listitem', { name: /Scene 8 Next/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show all scenes' }));

    expect(screen.getByRole('listitem', { name: /Scene 1 Next/ })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Scene 8 Next/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show fewer scenes' })).toBeInTheDocument();
  });
});
