import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { MePage } from './components/MePage';
import { basicEnglishCourse } from './content/course';
import { scenarioCapabilities } from './content/scenarioCapabilities';
import type { DayProgress } from './domain/progress';
import type { ProgressRepository } from './storage/progressRepository';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

function createDayProgress(overrides: Partial<DayProgress>): DayProgress {
  return {
    id: 'day-001',
    dayId: 'day-001',
    status: 'not_started',
    currentStep: 'review',
    completedStepIds: [],
    updatedAt: '2026-05-26T00:00:00.000Z',
    contentVersion: 'test',
    ...overrides,
  };
}

function createProgressRepository(overrides: Partial<ProgressRepository> = {}): ProgressRepository {
  return {
    getDayProgress: vi.fn().mockResolvedValue(null),
    listDayProgress: vi.fn().mockResolvedValue([]),
    saveDayProgress: vi.fn().mockResolvedValue(undefined),
    saveStepProgress: vi.fn().mockResolvedValue(undefined),
    saveStepCompletion: vi.fn().mockResolvedValue(undefined),
    listStepCompletions: vi.fn().mockResolvedValue([]),
    saveExerciseAttempt: vi.fn().mockResolvedValue(undefined),
    listExerciseAttempts: vi.fn().mockResolvedValue([]),
    saveSceneRemixAttempt: vi.fn().mockResolvedValue(undefined),
    listSceneRemixAttempts: vi.fn().mockResolvedValue([]),
    saveUserOutput: vi.fn().mockResolvedValue(undefined),
    getUserOutput: vi.fn().mockResolvedValue(null),
    listUserOutputs: vi.fn().mockResolvedValue([]),
    savePictureDescription: vi.fn().mockResolvedValue(undefined),
    getPictureDescription: vi.fn().mockResolvedValue(null),
    listPictureDescriptions: vi.fn().mockResolvedValue([]),
    saveWordProgress: vi.fn().mockResolvedValue(undefined),
    listReviewWords: vi.fn().mockResolvedValue([]),
    saveReviewItem: vi.fn().mockResolvedValue(undefined),
    listReviewItems: vi.fn().mockResolvedValue([]),
    getReviewItem: vi.fn().mockResolvedValue(null),
    saveStudyActivity: vi.fn().mockResolvedValue(undefined),
    listStudyActivities: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('App shell', () => {
  it('opens on Today and switches between mobile navigation tabs', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByRole('heading', { name: 'My Name' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Quick Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Course' }));
    expect(screen.getByRole('heading', { name: `Week 1: ${basicEnglishCourse.weeks[0].title}` })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `Week 2: ${basicEnglishCourse.weeks[1].title}` })).toBeInTheDocument();
    expect(screen.getAllByText(/Day \d+:/)).toHaveLength(14);
    expect(screen.getAllByText('Complete Week 1 to unlock Home & Things.').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByRole('heading', { name: 'Course Words' })).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();
    expect(screen.getByText('My name is Li.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Flashcards' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('heading', { name: 'Review today' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Me' }));
    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'I Can Say' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next' })).toBeInTheDocument();
    expect(screen.getByText('No capabilities unlocked yet.')).toBeInTheDocument();
    expect(screen.getByText('I can introduce myself.')).toBeInTheDocument();
    expect(screen.getByText('Complete Day 1.')).toBeInTheDocument();
  });

  it('shows Chinese word help only after the learner enables it', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Words' }));
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Me' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show Chinese help' }));
    await user.click(screen.getByRole('button', { name: 'Words' }));

    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.getByText(/名字/)).toBeInTheDocument();
  });

  it('persists reading aloud settings from the Me page', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));

    const readingCheckbox = screen.getByRole('checkbox', { name: 'Enable reading aloud' });
    expect(readingCheckbox).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();

    await user.click(readingCheckbox);
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(window.localStorage.getItem('basic-english-reading-enabled')).toBe('false');
    expect(window.localStorage.getItem('basic-english-reading-rate')).toBe('slow');
  });

  it('uses default reading settings when localStorage reads fail during initial render', async () => {
    const user = userEvent.setup();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage read failed');
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));

    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Enable reading aloud' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();
  });

  it('keeps reading settings in memory when localStorage writes fail after a change', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Me' }));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage write failed');
    });

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(screen.getByRole('checkbox', { name: 'Enable reading aloud' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Slow' })).toBeChecked();
  });
});

describe('Me capability progress', () => {
  it('does not render empty capability results before progress has loaded', async () => {
    const dayProgress = createDeferred<DayProgress[]>();
    const repository = createProgressRepository({
      listDayProgress: vi.fn().mockReturnValue(dayProgress.promise),
    });

    render(<MePage repository={repository} scenarioCapabilities={scenarioCapabilities} />);

    expect(screen.queryByText('No capabilities unlocked yet.')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete Day 1.')).not.toBeInTheDocument();

    dayProgress.resolve([]);

    expect(await screen.findByText('No capabilities unlocked yet.')).toBeInTheDocument();
    expect(screen.getByText('Complete Day 1.')).toBeInTheDocument();
  });

  it('unlocks capabilities for day progress whose current step is done', async () => {
    const repository = createProgressRepository({
      listDayProgress: vi.fn().mockResolvedValue([
        createDayProgress({
          status: 'in_progress',
          currentStep: 'done',
          completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
        }),
      ]),
    });

    render(<MePage repository={repository} scenarioCapabilities={scenarioCapabilities} />);

    const unlockedHeading = await screen.findByRole('heading', { name: 'Unlocked' });
    const unlockedSection = unlockedHeading.closest('section');
    expect(unlockedSection).not.toBeNull();
    expect(within(unlockedSection!).getByText('I can introduce myself.')).toBeInTheDocument();
    expect(within(unlockedSection!).queryByText('No capabilities unlocked yet.')).not.toBeInTheDocument();
  });
});
