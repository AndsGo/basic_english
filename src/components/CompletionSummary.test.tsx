import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import type { UserOutput } from '../storage/progressRepository';
import { CompletionSummary } from './CompletionSummary';

afterEach(() => cleanup());

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

describe('CompletionSummary', () => {
  it('uses course-complete copy when there is no next day', () => {
    const day14 = basicEnglishCourse.weeks[1].days[6];

    render(<CompletionSummary day={day14} output={output} reviewCount={0} onStartNextDay={vi.fn()} />);

    expect(screen.getByText('View course result')).toBeInTheDocument();
    expect(screen.queryByText('View Week 1 result')).not.toBeInTheDocument();
  });
});
