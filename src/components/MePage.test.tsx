import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
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
    savePictureDescription: vi.fn(),
    getPictureDescription: vi.fn(),
    listPictureDescriptions: vi.fn().mockResolvedValue([]),
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

  it('shows checked picture descriptions in My Descriptions', async () => {
    const repository = createMockRepository({
      listPictureDescriptions: vi.fn().mockResolvedValue([
        {
          id: 'picture-description-day-008',
          dayId: 'day-008',
          taskId: 'picture-day-008-my-room',
          text: 'This is my room. There is a bed. I can see a table.',
          checkedAt: '2026-06-02T00:00:00.000Z',
          feedback: {
            status: 'ready',
            messages: ['Clear enough. You can continue.'],
            simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
          },
          updatedAt: '2026-06-02T00:00:00.000Z',
        },
      ]),
    });

    render(
      <MePage
        repository={repository}
        pictureDescribeTasksByDayId={{
          'day-008': {
            id: 'picture-day-008-my-room',
            dayId: 'day-008',
            title: 'My Room',
            goal: 'Say what you can see in this room.',
            image: '/room.png',
            targetWords: ['room', 'bed', 'table'],
            suggestedPatterns: ['This is ...'],
            requiredSentenceCount: 3,
            simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
          },
        }}
      />,
    );

    expect(await screen.findByRole('heading', { name: 'My Descriptions' })).toBeInTheDocument();
    expect(screen.getByText('My Room')).toBeInTheDocument();
    expect(screen.getByText('Day 8')).toBeInTheDocument();
    expect(screen.getByText('This is my room. There is a bed. I can see a table.')).toBeInTheDocument();
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});

describe('MePage theme control', () => {
  it('lets the learner choose a theme preference', async () => {
    const user = userEvent.setup();
    const onThemePreferenceChange = vi.fn();

    render(
      <MePage
        repository={createMockRepository()}
        themePreference="system"
        onThemePreferenceChange={onThemePreferenceChange}
      />,
    );

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(onThemePreferenceChange).toHaveBeenCalledWith('dark');
  });
});

describe('MePage saved outputs', () => {
  it('shows the V1.11 total progress out of 49 days', async () => {
    const repository = createMockRepository({
      listDayProgress: vi.fn().mockResolvedValue([
        {
          id: 'progress-day-042',
          dayId: 'day-042',
          currentStep: 'done',
          status: 'completed',
          completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture', 'output'],
          startedAt: '2026-06-08T00:00:00.000Z',
          completedAt: '2026-06-08T00:10:00.000Z',
          updatedAt: '2026-06-08T00:10:00.000Z',
          contentVersion: basicEnglishCourse.contentVersion,
        },
      ]),
    });
    const totalDayCount = basicEnglishCourse.weeks.flatMap((week) => week.days).length;

    render(<MePage repository={repository} totalDayCount={totalDayCount} />);

    expect(await screen.findByText('Completed days: 1')).toBeInTheDocument();
    expect(screen.getByText(`/ ${totalDayCount}`)).toBeInTheDocument();
  });

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
