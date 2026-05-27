import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { MePage } from './MePage';

const sceneGoalsByDayId: Record<string, SceneGoal> = {
  'day-001': {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
  'day-008': {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
};

describe('MePage scene map', () => {
  it('highlights completed scenes from completed day outputs', async () => {
    const repository = createIndexedDbProgressRepository('me-scene-map');
    await repository.saveDayProgress({
      id: 'progress-day-001',
      dayId: 'day-001',
      currentStep: 'done',
      status: 'completed',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
      startedAt: '2026-05-27T00:00:00.000Z',
      completedAt: '2026-05-27T00:00:00.000Z',
      updatedAt: '2026-05-27T00:00:00.000Z',
      contentVersion: '1.2.0',
    });
    await repository.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: '',
      sentenceCount: 0,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      scene: {
        sceneId: 'self',
        helpMode: 'template',
        sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
        sceneText: 'My name is Li. I am from China.',
        dialogue: 'A: What is your name?\nB: My name is Li.',
      },
      updatedAt: '2026-05-27T00:00:00.000Z',
    });

    render(<MePage repository={repository} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(await screen.findByRole('listitem', { name: /Self Completed/ })).toHaveClass('scene-map-item--completed');
    expect(screen.getByRole('listitem', { name: /Room Next/ })).toBeInTheDocument();
  });
});
