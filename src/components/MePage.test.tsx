import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import type { ProgressRepository } from '../storage/progressRepository';
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

afterEach(() => {
  cleanup();
});

function createMockRepository(overrides: Partial<ProgressRepository> = {}): ProgressRepository {
  return {
    getDayProgress: vi.fn(),
    listDayProgress: vi.fn().mockResolvedValue([]),
    saveDayProgress: vi.fn(),
    saveStepProgress: vi.fn(),
    saveStepCompletion: vi.fn(),
    listStepCompletions: vi.fn(),
    saveExerciseAttempt: vi.fn(),
    listExerciseAttempts: vi.fn(),
    saveSceneRemixAttempt: vi.fn(),
    listSceneRemixAttempts: vi.fn().mockResolvedValue([]),
    saveUserOutput: vi.fn(),
    getUserOutput: vi.fn(),
    listUserOutputs: vi.fn().mockResolvedValue([]),
    saveWordProgress: vi.fn(),
    listReviewWords: vi.fn(),
    saveReviewItem: vi.fn(),
    listReviewItems: vi.fn().mockResolvedValue([]),
    getReviewItem: vi.fn(),
    saveStudyActivity: vi.fn(),
    listStudyActivities: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('MePage scene map', () => {
  it('does not render the scene map while progress is loading', () => {
    const repository = createMockRepository({
      listDayProgress: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    render(<MePage repository={repository} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(screen.queryByText('Scenes I Can Describe')).not.toBeInTheDocument();
  });

  it('does not render the scene map when progress fails to load', async () => {
    const repository = createMockRepository({
      listDayProgress: vi.fn().mockRejectedValue(new Error('load failed')),
    });

    render(<MePage repository={repository} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Progress could not be loaded.');
    expect(screen.queryByText('Scenes I Can Describe')).not.toBeInTheDocument();
  });

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

describe('MePage saved outputs', () => {
  it('shows saved scene text and dialogue in Saved Outputs', async () => {
    const repository = createMockRepository({
      listUserOutputs: vi.fn().mockResolvedValue([
        {
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
            sceneText: 'My name is Li. I am from China. I am a student. I study English.',
            dialogue: 'A: What is your name?\nB: My name is Li.',
          },
          updatedAt: '2026-05-27T00:00:00.000Z',
        },
      ]),
    });

    render(<MePage repository={repository} />);

    expect(await screen.findByText('My name is Li. I am from China. I am a student. I study English.')).toBeInTheDocument();
    expect(screen.getByText('A: What is your name? B: My name is Li.')).toBeInTheDocument();
  });
});
