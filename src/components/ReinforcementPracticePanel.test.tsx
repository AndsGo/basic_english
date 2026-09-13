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

const validPracticeItems: DailyLearningInsight['items'] = [
  { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' },
  { contentType: 'word', contentId: 'book', contentKey: 'word:book', source: 'mastery_learning', reason: 'Practice this word.' },
];

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
  it('waits for final feedback acknowledgement before completing two questions without changing mastery or review records', async () => {
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
    expect(screen.getByText('What does "name" mean?')).toBeInTheDocument();
    expect(screen.queryByText('What does "book" mean?')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    expect(screen.getByText('What does "book" mean?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pages with words or pictures/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Correct');
      expect(screen.getByRole('button', { name: 'Finish practice' })).toBeEnabled();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.queryByText('Practice complete')).not.toBeInTheDocument();
    });
    expect(repository.saveReinforcementPracticeSession).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'in_progress' }));

    await user.click(screen.getByRole('button', { name: 'Finish practice' }));

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
      insight={insight(validPracticeItems)}
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

  it('allows a rejected answer save to be retried', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    const answer = await screen.findByRole('button', { name: /the word for a person or thing/i });
    vi.mocked(repository.saveReinforcementPracticeSession).mockRejectedValueOnce(new Error('storage unavailable'));

    await user.click(answer);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be saved.');
    expect(answer).toBeEnabled();

    await user.click(answer);
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    await user.click(screen.getByRole('button', { name: /pages with words or pictures/i }));

    expect(await screen.findByRole('button', { name: 'Finish practice' })).toBeEnabled();
  });

  it('allows a rejected final completion save to be retried', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();
    const onComplete = vi.fn();

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
      onComplete={onComplete}
    />);

    await user.click(await screen.findByRole('button', { name: /the word for a person or thing/i }));
    await user.click(screen.getByRole('button', { name: 'Next question' }));
    await user.click(screen.getByRole('button', { name: /pages with words or pictures/i }));
    const finish = await screen.findByRole('button', { name: 'Finish practice' });
    vi.mocked(repository.saveReinforcementPracticeSession).mockRejectedValueOnce(new Error('storage unavailable'));

    await user.click(finish);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be saved.');
    expect(finish).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Skip practice' })).toBeEnabled();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(finish);

    expect(await screen.findByText('Practice complete')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows a rejected skip save to be retried', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    const skip = await screen.findByRole('button', { name: 'Skip practice' });
    vi.mocked(repository.saveReinforcementPracticeSession).mockRejectedValueOnce(new Error('storage unavailable'));

    await user.click(skip);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be saved.');
    expect(skip).toBeEnabled();

    await user.click(skip);

    expect(await screen.findByText('Practice skipped.')).toBeInTheDocument();
  });

  it('skips invalid content and presents two later valid questions', async () => {
    render(<ReinforcementPracticePanel
      insight={insight([
        { contentType: 'word', contentId: 'not-in-course', contentKey: 'word:not-in-course', source: 'mastery_learning', reason: 'Practice this word.' },
        { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' },
        { contentType: 'word', contentId: 'book', contentKey: 'word:book', source: 'mastery_learning', reason: 'Practice this word.' },
      ])}
      course={basicEnglishCourse}
      repository={practiceRepository()}
      now={now}
    />);

    expect(await screen.findByText('What does "name" mean?')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  it('shows a non-error empty state without saving when fewer than two valid questions exist', async () => {
    const repository = practiceRepository();
    const onComplete = vi.fn();
    const onSkip = vi.fn();

    render(<ReinforcementPracticePanel
      insight={insight([{ contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' }])}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
      onComplete={onComplete}
      onSkip={onSkip}
    />);

    expect(await screen.findByText('No reinforcement practice available today.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(repository.getReinforcementPracticeSession).not.toHaveBeenCalled();
    expect(repository.saveReinforcementPracticeSession).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('does not duplicate insight content to create a practice session', async () => {
    const repository = practiceRepository();

    render(<ReinforcementPracticePanel
      insight={insight([
        { contentType: 'word', contentId: 'name', contentKey: 'word:name', source: 'mastery_learning', reason: 'Practice this word.' },
        { contentType: 'word', contentId: 'name', contentKey: 'duplicate:name', source: 'manual_review', reason: 'Practice this word.' },
      ])}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    expect(await screen.findByText('No reinforcement practice available today.')).toBeInTheDocument();
    expect(repository.saveReinforcementPracticeSession).not.toHaveBeenCalled();
  });

  it('retries initialization after a load failure', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();
    vi.mocked(repository.getReinforcementPracticeSession).mockRejectedValueOnce(new Error('storage unavailable'));

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be loaded.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('What does "name" mean?')).toBeInTheDocument();
    expect(repository.getReinforcementPracticeSession).toHaveBeenCalledTimes(2);
  });

  it('retries initialization after an initial session save failure', async () => {
    const user = userEvent.setup();
    const repository = practiceRepository();
    vi.mocked(repository.saveReinforcementPracticeSession).mockRejectedValueOnce(new Error('storage unavailable'));

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be loaded.');
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('What does "name" mean?')).toBeInTheDocument();
    expect(repository.saveReinforcementPracticeSession).toHaveBeenCalledTimes(2);
  });

  it('uses the canonical session ID when creating a session', async () => {
    const repository = practiceRepository();

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    await screen.findByText('What does "name" mean?');
    expect(repository.saveReinforcementPracticeSession).toHaveBeenCalledWith(expect.objectContaining({
      id: 'reinforcement-2026-07-22-daily-learning-insight-2026-07-22',
    }));
  });

  it('alerts when unexpected question construction fails', async () => {
    const course = new Proxy(basicEnglishCourse, {
      get(target, property, receiver) {
        if (property === 'words') throw new Error('unexpected content failure');
        return Reflect.get(target, property, receiver);
      },
    });

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={course}
      repository={practiceRepository()}
      now={now}
    />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be loaded.');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('alerts when the practice session cannot be loaded', async () => {
    const repository = practiceRepository();
    vi.mocked(repository.getReinforcementPracticeSession).mockRejectedValue(new Error('storage unavailable'));

    render(<ReinforcementPracticePanel
      insight={insight(validPracticeItems)}
      course={basicEnglishCourse}
      repository={repository}
      now={now}
    />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Reinforcement practice could not be loaded.');
  });
});
