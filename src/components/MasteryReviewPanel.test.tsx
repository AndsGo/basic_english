import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import { createPendingMasteryProgress, type MasteryProgress, type MasteryReviewSession } from '../domain/mastery';
import type { Course } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { MasteryReviewPanel } from './MasteryReviewPanel';

const now = () => new Date('2026-07-22T08:00:00.000Z');

type AtomicMasteryRepository = ProgressRepository & {
  saveMasteryReviewResult: (progress: MasteryProgress, session: MasteryReviewSession) => Promise<void>;
};

afterEach(() => {
  cleanup();
});

function masteryRecord(contentId: string, index = 0): MasteryProgress {
  return {
    ...createPendingMasteryProgress({ contentType: 'word', contentId, sourceDayId: `day-${index + 1}`, now: now().toISOString() }),
    dueAt: now().toISOString(),
  };
}

function repository(records: MasteryProgress[], session: MasteryReviewSession | null = null): AtomicMasteryRepository {
  const storedRecords = new Map(records.map((record) => [record.id, record]));
  let storedSession = session;

  return {
    listMasteryProgress: vi.fn(async () => [...storedRecords.values()]),
    getMasteryReviewSession: vi.fn(async () => storedSession),
    saveMasteryProgress: vi.fn(async (record: MasteryProgress) => {
      storedRecords.set(record.id, record);
    }),
    saveMasteryReviewSession: vi.fn(async (nextSession: MasteryReviewSession) => {
      storedSession = nextSession;
    }),
    saveMasteryReviewResult: vi.fn(async (record: MasteryProgress, nextSession: MasteryReviewSession) => {
      storedRecords.set(record.id, record);
      storedSession = nextSession;
    }),
  } as unknown as AtomicMasteryRepository;
}

describe('MasteryReviewPanel', () => {
  it('records a correct answer, announces feedback, and never presents more than eight questions', async () => {
    const user = userEvent.setup();
    const records = basicEnglishCourse.words.slice(0, 9).map((word, index) => masteryRecord(word.id, index));
    const repo = repository(records);

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} now={now} />);

    expect(await screen.findByRole('heading', { name: 'Mastery review' })).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 8')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /the word for a person or thing/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Correct');
    expect(repo.saveMasteryReviewResult).toHaveBeenCalledWith(expect.objectContaining({ contentId: 'name', status: 'learning' }), expect.objectContaining({
      localDate: '2026-07-22',
      completedProgressIds: ['mastery-word-name'],
    }));
  });

  it('shows the correct answer after persisting an incorrect answer atomically', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const repo = {
      listMasteryProgress: vi.fn(async () => [masteryRecord('name')]),
      getMasteryReviewSession: vi.fn(async () => null),
      saveMasteryReviewResult: vi.fn(async () => {
        calls.push('result');
      }),
    } as unknown as AtomicMasteryRepository;
    const onChange = () => {
      calls.push('change');
    };

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} now={now} onChange={onChange} />);

    await user.click(await screen.findByRole('button', { name: /to get or keep something/i }));

    await waitFor(() => {
      expect(repo.saveMasteryReviewResult).toHaveBeenCalledWith(expect.objectContaining({ contentId: 'name', consecutiveCorrect: 0, status: 'learning' }), expect.objectContaining({
        completedProgressIds: ['mastery-word-name'],
      }));
      expect(calls).toEqual(['result', 'change']);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Correct answer: the word for a person or thing');
    expect(screen.getByText('Completed 1 of 8')).toBeInTheDocument();
  });

  it('displays the persisted completion count for the local day', async () => {
    const session: MasteryReviewSession = {
      id: 'mastery-session-2026-07-22',
      localDate: '2026-07-22',
      completedProgressIds: ['mastery-word-book', 'mastery-word-friend'],
      updatedAt: now().toISOString(),
    };

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repository([masteryRecord('name')], session)} now={now} />);

    expect(await screen.findByText('Completed 2 of 8')).toBeInTheDocument();
  });

  it('renders the empty due state', async () => {
    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repository([])} now={now} />);

    expect(await screen.findByText('No mastery review due today.')).toBeInTheDocument();
  });

  it('does not repeat the load effect when now is omitted', async () => {
    const repo = repository([{ ...masteryRecord('name'), dueAt: '2000-01-01T00:00:00.000Z' }]);

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} />);

    await screen.findByRole('heading', { name: 'Mastery review' });
    await waitFor(() => {
      expect(repo.listMasteryProgress).toHaveBeenCalledTimes(1);
      expect(repo.getMasteryReviewSession).toHaveBeenCalledTimes(1);
    });
  });

  it('alerts when mastery records cannot be loaded', async () => {
    const repo = {
      listMasteryProgress: vi.fn(async () => {
        throw new Error('storage unavailable');
      }),
      getMasteryReviewSession: vi.fn(async () => null),
    } as unknown as ProgressRepository;

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} now={now} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Mastery review could not be loaded.');
  });

  it('does not present a completed session item after rerender', async () => {
    const user = userEvent.setup();
    const record = masteryRecord('name');
    const repo = repository([record]);
    const firstRender = render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} now={now} />);

    await user.click(await screen.findByRole('button', { name: /the word for a person or thing/i }));
    await screen.findByRole('status');
    firstRender.unmount();

    render(<MasteryReviewPanel course={basicEnglishCourse} repository={repo} now={now} />);

    expect(await screen.findByText('No mastery review due today.')).toBeInTheDocument();
  });

  it('allows each repeated token to be selected in a sentence-order answer', async () => {
    const user = userEvent.setup();
    const course: Course = {
      ...basicEnglishCourse,
      patterns: [
        { ...basicEnglishCourse.patterns[0], id: 'order-c', examples: ['I am I'] },
        ...basicEnglishCourse.patterns.slice(1, 3),
      ],
    };
    const record = {
      ...createPendingMasteryProgress({ contentType: 'pattern', contentId: 'order-c', sourceDayId: 'day-001', now: now().toISOString() }),
      dueAt: now().toISOString(),
    };

    render(<MasteryReviewPanel course={course} repository={repository([record])} now={now} />);

    const beforeSelection = await screen.findAllByRole('button', { name: 'I' });
    expect(beforeSelection).toHaveLength(2);
    await user.click(beforeSelection[0]);

    expect(screen.getAllByRole('button', { name: 'I' }).filter((button) => !button.hasAttribute('disabled'))).toHaveLength(1);
  });
});
