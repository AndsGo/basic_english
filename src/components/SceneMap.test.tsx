import { render, screen } from '@testing-library/react';
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
});
