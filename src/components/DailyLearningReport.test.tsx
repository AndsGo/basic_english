import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import type { DailyLearningInsight } from '../domain/dailyLearningInsights';
import type { ProgressRepository } from '../storage/progressRepository';
import { DailyLearningReport } from './DailyLearningReport';

afterEach(() => cleanup());

const repository = {
  getReinforcementPracticeSession: vi.fn().mockResolvedValue(null),
  saveReinforcementPracticeSession: vi.fn().mockResolvedValue(undefined),
} as unknown as ProgressRepository;

function insight(items: DailyLearningInsight['items']): DailyLearningInsight {
  return {
    id: 'daily-learning-insight-2026-07-27',
    localDate: '2026-07-27',
    outcome: items.length === 0 ? 'strong' : items.length === 1 ? 'keep_practicing' : 'focus',
    items,
  };
}

describe('DailyLearningReport', () => {
  it('uses the strong outcome when there is no insight', () => {
    render(<DailyLearningReport insight={null} course={basicEnglishCourse} repository={repository} />);

    expect(screen.getByRole('heading', { name: "Today's Learning" })).toBeInTheDocument();
    expect(screen.getByText('Strong today')).toBeInTheDocument();
    expect(screen.getByText('No targeted practice due today.')).toBeInTheDocument();
  });

  it('shows controlled reasons and scenario context for report items', () => {
    render(
      <DailyLearningReport
        insight={insight([{ contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_miss', reason: 'You missed this word in mastery review.', scenarioTitle: 'Introduce myself' }])}
        course={basicEnglishCourse}
        repository={repository}
      />,
    );

    expect(screen.getByText('Keep practicing')).toBeInTheDocument();
    expect(screen.getByText('You missed this word in mastery review.')).toBeInTheDocument();
    expect(screen.getByText('Scenario: Introduce myself')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start 3-minute practice' })).not.toBeInTheDocument();
  });

  it('opens reinforcement practice for two report items', async () => {
    const user = userEvent.setup();
    render(
      <DailyLearningReport
        insight={insight([
          { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Keep practicing this word.' },
          { contentType: 'word', contentId: 'my', contentKey: 'word:my', source: 'mastery_learning', reason: 'Keep practicing this word.' },
        ])}
        course={basicEnglishCourse}
        repository={repository}
      />,
    );

    expect(screen.getByText('Focus on 2 items')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start 3-minute practice' }));
    expect(await screen.findByRole('heading', { name: 'Reinforcement practice' })).toBeInTheDocument();
  });
});
