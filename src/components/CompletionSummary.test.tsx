import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import type { SceneRemixTask } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';
import { CompletionSummary } from './CompletionSummary';

afterEach(() => cleanup());

const day1 = basicEnglishCourse.weeks[0].days[0];

const output: UserOutput = {
  id: 'day-014',
  dayId: 'day-014',
  text: 'This is my room.',
  sentenceCount: 1,
  selfRating: 'ok',
  checklist: {
    usedTargetPattern: true,
    usedLessonWords: true,
    hasSubjects: true,
    meaningIsClear: true,
  },
  updatedAt: '2026-05-26T00:00:00.000Z',
};

const sceneOutput: UserOutput = {
  ...output,
  dayId: day1.id,
  text: '',
  scene: {
    sceneId: 'self',
    helpMode: 'template',
    sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
    sceneText: 'My name is Li. I am from China. I am a student. I study English.',
    dialogue: 'A: What is your name?\nB: My name is Li.',
  },
};

const remixTask: SceneRemixTask = {
  id: 'day-001-remix-country-japan',
  type: 'replace',
  prompt: 'Change China to Japan.',
  source: 'I am from China.',
  referenceAnswers: ['I am from Japan.'],
};

describe('CompletionSummary', () => {
  it('shows saved scene output instead of empty legacy output text', () => {
    render(<CompletionSummary day={day1} output={sceneOutput} reviewCount={0} onStartNextDay={vi.fn()} />);

    expect(screen.getByText('Scene')).toBeInTheDocument();
    expect(screen.getByText('My name is Li. I am from China. I am a student. I study English.')).toBeInTheDocument();
    expect(screen.getByText('Dialogue')).toBeInTheDocument();
    expect(screen.getByText('A: What is your name? B: My name is Li.')).toBeInTheDocument();
    expect(screen.queryByText('No saved output text.')).not.toBeInTheDocument();
  });

  it('uses legacy fallback when scene output has no summary content', () => {
    const day1 = basicEnglishCourse.weeks[0].days[0];
    const emptySceneOutput: UserOutput = {
      ...output,
      dayId: day1.id,
      text: '',
      scene: {
        sceneId: 'self',
        helpMode: 'template',
        sentences: ['', '', '', ''],
        sceneText: '   ',
        dialogue: '',
      },
    };

    render(<CompletionSummary day={day1} output={emptySceneOutput} reviewCount={0} onStartNextDay={vi.fn()} />);

    expect(screen.getByText('No saved output text.')).toBeInTheDocument();
    expect(screen.queryByText('Scene')).not.toBeInTheDocument();
    expect(screen.queryByText('Dialogue')).not.toBeInTheDocument();
  });

  it('uses course-complete copy when there is no next day', () => {
    const day14 = basicEnglishCourse.weeks[1].days[6];

    render(<CompletionSummary day={day14} output={output} reviewCount={0} onStartNextDay={vi.fn()} />);

    expect(screen.getByText('View course result')).toBeInTheDocument();
    expect(screen.queryByText('View Week 1 result')).not.toBeInTheDocument();
  });

  it('renders a remix card after day completion when a task is provided', () => {
    render(
      <CompletionSummary
        day={day1}
        output={sceneOutput}
        reviewCount={0}
        remixTask={remixTask}
        onSceneRemixSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Try Another Scene' })).toBeInTheDocument();
    expect(screen.getByText('Change China to Japan.')).toBeInTheDocument();
  });
});
