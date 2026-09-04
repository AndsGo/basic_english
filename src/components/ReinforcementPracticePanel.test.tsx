import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import type { DailyLearningInsight } from '../domain/dailyLearningInsights';
import type { ProgressRepository, ReinforcementPracticeSession } from '../storage/progressRepository';
import { ReinforcementPracticePanel } from './ReinforcementPracticePanel';

const now = () => new Date('2026-07-22T08:00:00.000Z');

afterEach(() => {
  cleanup();
});

function insight(items: DailyLearningInsight['items']): DailyLearningInsight {
  return {
    id: 'daily-learning-insight-2026-07-22',
    localDate: '2026-07-22',
    outcome: 'focus',
    items,
  };
}

function practiceRepository(session: ReinforcementPracticeSession | null = null): ProgressRepository {
  let storedSession = session;

  return {
    getReinforcementPracticeSession: vi.fn(async () => storedSession),
    saveReinforcementPracticeSession: vi.fn(async (next: ReinforcementPracticeSession) => {
      storedSession = next;
    }),
    saveMasteryProgress: vi.fn(),
    saveReviewItem: vi.fn(),
  } as unknown as ProgressRepository;
}

describe('ReinforcementPracticePanel', () => {
  it('completes two questions without changing mastery or review records', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();
    const onComplete = vi.fn();

    render(<ReinforcementPracticePanel
      insight={insight([
        { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' },
        { contentType: 'word', contentId: 'book', contentKey: 'word:book', source: 'mastery_learning', reason: 'Practice this word.' },
      ])}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
      onComplete={onComplete}
    />);

    await user.click(await screen.findByRole('button', { name: /the word for a person or thing/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Correct');
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    await user.click(screen.getByRole('button', { name: /pages with words or pictures/i }));

    await waitFor(() => {
      expect(screen.getByText('Practice complete')).toBeInTheDocument();
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
    expect(repository.saveMasteryProgress).not.toHaveBeenCalled();
    expect(repository.saveReviewItem).not.toHaveBeenCalled();
    expect(repository.saveReinforcementPracticeSession).toHaveBeenLastCalledWith(expect.objectContaining({
      localDate: '2026-07-22',
      insightId: 'daily-learning-insight-2026-07-22',
      status: 'completed',
      answers: [
        expect.objectContaining({ progressId: 'reinforcement-word-name', correct: true }),
        expect.objectContaining({ progressId: 'reinforcement-word-book', correct: true }),
      ],
    }));
  });

  it('persists a skipped session and notifies the caller', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();
    const onSkip = vi.fn();

    render(<ReinforcementPracticePanel
      insight={insight([{ contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' }])}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
      onSkip={onSkip}
    />);

    await user.click(await screen.findByRole('button', { name: 'Skip practice' }));

    await waitFor(() => {
      expect(repository.saveReinforcementPracticeSession).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'skipped' }));
      expect(onSkip).toHaveBeenCalledTimes(1);
    });
  });

  it('skips an invalid first item and presents a later valid question', async () => {
    render(<ReinforcementPracticePanel
      insight={insight([
        { contentType: 'word', contentId: 'not-in-course', contentKey: 'word:not-in-course', source: 'mastery_learning', reason: 'Practice this word.' },
        { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' },
      ])}
      course={basicEnglishCourse}
      repository={practiceRepository()}
      now={now}
    />);

    expect(await screen.findByText('What does "name" mean?')).toBeInTheDocument();
    expect(screen.getByText('1 of 1')).toBeInTheDocument();
  });

  it('alerts when the practice session cannot be loaded', async () => {
    const repository = practiceRepository();
    vi.mocked(repository.getReinforcementPracticeSession).mockRejectedValue(new Error('storage unavailable'));

    render(<ReinforcementPracticePanel
      insight={insight([{ contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' }])}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be loaded.');
  });
});
