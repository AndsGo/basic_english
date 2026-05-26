import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { week1Course } from '../content/week1';
import type { DayProgress } from '../domain/progress';
import { startDay } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import type {
  ExerciseAttempt,
  ProgressRepository,
  StepCompletion,
  StepProgress,
  StudyActivity,
  UserOutput,
  WordProgress,
} from '../storage/progressRepository';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { SpeechRate, SpeechService, SpeechUtterance } from '../speech/speechService';
import { ExerciseRenderer } from './ExerciseRenderer';
import { MePage } from './MePage';
import { TodayPage } from './TodayPage';

const day = week1Course.weeks[0].days[0];
const choiceExercise = day.exercises.find((exercise) => exercise.type === 'choice');
const translationExercise = day.exercises.find((exercise) => exercise.type === 'translation');

afterEach(() => cleanup());

function outputDraft(overrides: Partial<UserOutput> = {}): UserOutput {
  return {
    id: 'custom-output-id',
    dayId: day.id,
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    updatedAt: '2026-05-25T00:00:00.000Z',
    ...overrides,
  };
}

function createTestRepository({
  dayProgress = [],
  userOutputs = [],
}: {
  dayProgress?: DayProgress[];
  userOutputs?: UserOutput[];
} = {}): ProgressRepository {
  const progressByDay = new Map(dayProgress.map((progress) => [progress.dayId, progress]));
  const outputsByDay = new Map(userOutputs.map((output) => [output.dayId, output]));

  return {
    async getDayProgress(dayId) {
      return progressByDay.get(dayId) ?? null;
    },
    async listDayProgress() {
      return [...progressByDay.values()];
    },
    async saveDayProgress(progress) {
      progressByDay.set(progress.dayId, progress);
    },
    async saveStepProgress(_progress: StepProgress) {
      return undefined;
    },
    async saveStepCompletion(_completion: StepCompletion) {
      return undefined;
    },
    async listStepCompletions(_dayId: string) {
      return [];
    },
    async saveExerciseAttempt(_attempt: ExerciseAttempt) {
      return undefined;
    },
    async listExerciseAttempts(_dayId: string) {
      return [];
    },
    async saveUserOutput(output) {
      outputsByDay.set(output.dayId, output);
    },
    async getUserOutput(dayId) {
      return outputsByDay.get(dayId) ?? null;
    },
    async listUserOutputs() {
      return [...outputsByDay.values()];
    },
    async saveWordProgress(_progress: WordProgress) {
      return undefined;
    },
    async listReviewWords() {
      return [];
    },
    async saveReviewItem(_item: ReviewItem) {
      return undefined;
    },
    async listReviewItems(_status?: ReviewItem['status']) {
      return [];
    },
    async getReviewItem(_id: string) {
      return null;
    },
    async saveStudyActivity(_activity: StudyActivity) {
      return undefined;
    },
    async listStudyActivities() {
      return [];
    },
  };
}

function createTestSpeechService(): SpeechService {
  return {
    isSupported: vi.fn(() => true),
    speak: vi.fn((text: string, rate: SpeechRate): SpeechUtterance => {
      return { text, rate: rate === 'slow' ? 0.75 : 1, lang: 'en-US' };
    }),
    stop: vi.fn(),
  };
}

function renderWithSpeech(children: ReactNode) {
  render(
    <SpeechProvider enabled rate="normal" service={createTestSpeechService()}>
      {children}
    </SpeechProvider>,
  );
}

function renderToday(repository = createTestRepository()) {
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} />);
  return repository;
}

function renderTodayWithChineseHelp(repository = createTestRepository()) {
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} showChineseHelp />);
  return repository;
}

async function getEnabledContinueButton() {
  const button = screen.getByRole('button', { name: /continue/i });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
}

async function completeWords(user: ReturnType<typeof userEvent.setup>) {
  for (const button of screen.getAllByRole('button', { name: 'Know' })) {
    await user.click(button);
  }
  await user.click(await getEnabledContinueButton());
}

async function completePatterns(user: ReturnType<typeof userEvent.setup>) {
  for (const button of screen.getAllByRole('button', { name: 'Practice this' })) {
    await user.click(button);
  }
  await user.click(await getEnabledContinueButton());
}

async function completeDrills(user: ReturnType<typeof userEvent.setup>) {
  const sentenceOrderExercise = day.exercises.find((exercise) => exercise.type === 'sentence_order');
  const replacementExercise = day.exercises.find((exercise) => exercise.type === 'replacement');
  if (!choiceExercise || !sentenceOrderExercise || !replacementExercise) throw new Error('Day 1 drill test content is incomplete.');

  await user.click(screen.getByRole('button', { name: choiceExercise.correctOption }));
  await user.type(screen.getByRole('textbox', { name: 'My ___ is Li.' }), 'name');
  for (const token of sentenceOrderExercise.correctOrder) {
    await user.click(screen.getByRole('button', { name: token }));
  }
  await user.type(screen.getByRole('textbox', { name: 'Replacement answer' }), replacementExercise.referenceAnswer);
  await user.click(await getEnabledContinueButton());
}

async function completeTranslation(user: ReturnType<typeof userEvent.setup>) {
  if (!translationExercise) throw new Error('Day 1 translation test content is incomplete.');

  await user.type(screen.getByRole('textbox', { name: `Translation answer for ${translationExercise.id}` }), translationExercise.referenceAnswers[0]);
  await user.click(screen.getByRole('button', { name: 'Show reference' }));
  await user.click(screen.getByRole('radio', { name: 'Close enough' }));
  await user.click(await getEnabledContinueButton());
}

async function completeToOutput(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await getEnabledContinueButton());
  await completeWords(user);
  await completePatterns(user);
  await completeDrills(user);
  await completeTranslation(user);
}

async function satisfyOutputGate(user: ReturnType<typeof userEvent.setup>, text = 'My name is Mei. I am from China. I study English. I am happy.') {
  await user.type(screen.getByRole('textbox', { name: 'Daily output' }), text);
  for (const checkbox of screen.getAllByRole('checkbox')) {
    if (!(checkbox as HTMLInputElement).checked) await user.click(checkbox);
  }
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe('TodayPage', () => {
  it('shows Day 2 after Day 1 is completed', async () => {
    const repo = createIndexedDbProgressRepository('today-v1-1-current-day');
    await repo.saveDayProgress({
      id: 'day-001',
      dayId: 'day-001',
      status: 'completed',
      currentStep: 'done',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
      startedAt: '2026-05-26T00:00:00.000Z',
      completedAt: '2026-05-26T00:10:00.000Z',
      updatedAt: '2026-05-26T00:10:00.000Z',
      contentVersion: week1Course.contentVersion,
    });

    renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

    expect(await screen.findByText('I Am')).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 2/)).toBeInTheDocument();
  });

  it('blocks Continue on Words until every word is marked', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-words-gate');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByText(/Mark name as Know or Review/)).toBeInTheDocument();
  });

  it('creates a review item when a word is marked Review', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-word-review');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await getEnabledContinueButton());
    await user.click((await screen.findAllByRole('button', { name: 'Review' }))[0]);

    await waitFor(async () => {
      expect(await repo.listReviewItems('active')).toHaveLength(1);
    });
  });

  it('shows Day 1 review and advances through the local Today steps', async () => {
    if (!choiceExercise || !translationExercise) throw new Error('Day 1 test content is incomplete.');

    const user = userEvent.setup();

    renderToday();

    expect(screen.getByRole('heading', { level: 2, name: 'My Name' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quick Review' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Review');
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Output');

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { name: 'Words' })).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Review' })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Know' })[0]).toBeInTheDocument();

    await completeWords(user);
    expect(screen.getByRole('heading', { name: 'Patterns' })).toBeInTheDocument();
    expect(screen.getByText('My name is ___.')).toBeInTheDocument();
    expect(screen.getByText('My name is Li.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example My name is Li.' })).toBeInTheDocument();

    await completePatterns(user);
    expect(screen.getByRole('heading', { name: choiceExercise.prompt })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: choiceExercise.correctOption })).toBeInTheDocument();
    expect(screen.queryByText(translationExercise.chinesePrompt)).not.toBeInTheDocument();

    await completeDrills(user);
    expect(screen.getByRole('heading', { name: translationExercise.chinesePrompt })).toBeInTheDocument();
    expect(screen.getByText(`Core meaning: ${translationExercise.coreMeaningHint}`)).toBeInTheDocument();
    expect(screen.queryByText(translationExercise.referenceAnswers[0])).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: `Translation answer for ${translationExercise.id}` }), translationExercise.referenceAnswers[0]);
    await user.click(screen.getByRole('button', { name: 'Show reference' }));
    expect(screen.getAllByText(translationExercise.referenceAnswers[0]).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('radio', { name: 'Close enough' }));

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { level: 3, name: 'My Name' })).toBeInTheDocument();
    await satisfyOutputGate(user, 'My name is Mei.\nI am from China.\nI study English.\nI am happy.');

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { name: 'Day 1 complete' })).toBeInTheDocument();
    const savedOutput = screen.getByText((_, element) => element?.textContent === 'My name is Mei.\nI am from China.\nI study English.\nI am happy.');
    expect(savedOutput).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('propagates checklist and self-rating changes in the output draft', async () => {
    const user = userEvent.setup();

    renderToday();

    await completeToOutput(user);

    await satisfyOutputGate(user, 'My name is Mei. I am from China. I study English. I am happy.');
    await user.click(screen.getByRole('radio', { name: 'Hard' }));
    await user.click(await getEnabledContinueButton());

    expect(screen.getByText('My name is Mei. I am from China. I study English. I am happy.')).toBeInTheDocument();
    expect(screen.getByText('Self rating: hard')).toBeInTheDocument();
    expect(screen.getByText("Used today's pattern")).toBeInTheDocument();
  });

  it('shows Chinese word help when enabled', async () => {
    const user = userEvent.setup();

    renderTodayWithChineseHelp();

    await user.click(await getEnabledContinueButton());

    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.getByText(/名字/)).toBeInTheDocument();
  });

  it('loads saved Day 1 progress and output from the repository', async () => {
    const repository = createTestRepository({
      dayProgress: [
        {
          ...startDay(day.id, week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
          currentStep: 'output',
        },
      ],
      userOutputs: [
        outputDraft({
          id: 'not-derived-from-day-id',
          text: 'My name is Lin.',
          selfRating: 'hard',
          checklist: { ...outputDraft().checklist, usedTargetPattern: true },
        }),
      ],
    });

    renderToday(repository);

    expect(await screen.findByRole('textbox', { name: 'Daily output' })).toHaveValue('My name is Lin.');
    expect(screen.getByRole('radio', { name: 'Hard' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /I used today's pattern/i })).toBeChecked();
  });

  it('loads progress and saved output after a new render uses the same repository', async () => {
    const user = userEvent.setup();
    const repository = createTestRepository();

    renderToday(repository);

    await completeToOutput(user);

    await satisfyOutputGate(user, 'My name is Mei.\nI am from China.\nI study English.\nI am happy.');
    await user.click(screen.getByRole('radio', { name: 'Hard' }));
    await user.click(await getEnabledContinueButton());

    cleanup();
    renderToday(repository);

    expect(await screen.findByRole('heading', { level: 2, name: 'I Am' })).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 2/)).toBeInTheDocument();
  });

  it('disables Continue during hydration and keeps saved progress after hydration wins', async () => {
    const progressLoad = deferred<DayProgress | null>();
    const outputLoad = deferred<UserOutput | null>();
    const savedProgress = {
      ...startDay(day.id, week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
      currentStep: 'output' as const,
    };
    const savedOutput = outputDraft({
      text: 'My saved output. It has two. It has three. It has four.',
      sentenceCount: 4,
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
    });
    const savedProgresses: DayProgress[] = [];

    const repository = {
      ...createTestRepository(),
      getDayProgress: () => progressLoad.promise,
      getUserOutput: () => outputLoad.promise,
      async saveDayProgress(progress: DayProgress) {
        savedProgresses.push(progress);
      },
    };
    const user = userEvent.setup();

    renderToday(repository);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
    await user.click(continueButton);
    expect(savedProgresses).toHaveLength(0);

    await act(async () => {
      progressLoad.resolve(savedProgress);
      outputLoad.resolve(savedOutput);
      await Promise.all([progressLoad.promise, outputLoad.promise]);
    });

    expect(await screen.findByRole('textbox', { name: 'Daily output' })).toHaveValue('My saved output. It has two. It has three. It has four.');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    expect(savedProgresses).toHaveLength(0);
  });

  it('saves Day 1 progress and autosaves the output draft through completion', async () => {
    const user = userEvent.setup();
    const repository = renderToday();

    await user.click(await getEnabledContinueButton());
    await waitFor(async () => {
      await expect(repository.getDayProgress(day.id)).resolves.toMatchObject({
        dayId: day.id,
        currentStep: 'words',
        status: 'in_progress',
      });
    });

    await completeWords(user);
    await completePatterns(user);
    await completeDrills(user);
    await completeTranslation(user);

    await satisfyOutputGate(user, 'My name is Mei. I am from China. I study English. I am happy.');
    await user.click(screen.getByRole('radio', { name: 'Easy' }));

    await waitFor(async () => {
      await expect(repository.getUserOutput(day.id)).resolves.toMatchObject({
        dayId: day.id,
        text: 'My name is Mei. I am from China. I study English. I am happy.',
        selfRating: 'easy',
        checklist: expect.objectContaining({ usedLessonWords: true }),
      });
    });

    await user.click(await getEnabledContinueButton());

    await waitFor(async () => {
      await expect(repository.getDayProgress(day.id)).resolves.toMatchObject({
        dayId: day.id,
        currentStep: 'done',
        status: 'completed',
      });
    });
    await waitFor(async () => {
      await expect(repository.getUserOutput(day.id)).resolves.toMatchObject({
        text: 'My name is Mei. I am from China. I study English. I am happy.',
        selfRating: 'easy',
      });
    });
    expect(screen.getByText('Self rating: easy')).toBeInTheDocument();
  });

  it('shows completion only after final progress is saved', async () => {
    const progressSave = deferred<void>();
    const savedProgresses: DayProgress[] = [];
    const user = userEvent.setup();
    const repository = {
      ...createTestRepository({
        dayProgress: [
          {
            ...startDay(day.id, week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
            currentStep: 'output' as const,
          },
        ],
        userOutputs: [
          outputDraft({
            text: 'My name is Mei. I am from China. I study English. I am happy.',
            sentenceCount: 4,
            checklist: {
              usedTargetPattern: true,
              usedLessonWords: true,
              hasSubjects: true,
              meaningIsClear: true,
            },
          }),
        ],
      }),
      async saveDayProgress(progress: DayProgress) {
        savedProgresses.push(progress);
        await progressSave.promise;
      },
    };

    renderToday(repository);

    await user.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(screen.queryByRole('heading', { name: 'Day 1 complete' })).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Daily output' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(savedProgresses).toHaveLength(1);
    expect(savedProgresses[0]).toMatchObject({ currentStep: 'done', status: 'completed' });

    await act(async () => {
      progressSave.resolve();
      await progressSave.promise;
    });

    expect(await screen.findByRole('heading', { name: 'Day 1 complete' })).toBeInTheDocument();
  });

  it('serializes output autosaves so an earlier delayed save cannot overwrite later output', async () => {
    const user = userEvent.setup();
    let savedOutput: UserOutput | null = null;
    const saves: Array<{ output: UserOutput; gate: ReturnType<typeof deferred<void>> }> = [];
    const repository = {
      ...createTestRepository({
        dayProgress: [
          {
            ...startDay(day.id, week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
            currentStep: 'output' as const,
          },
        ],
      }),
      async saveUserOutput(output: UserOutput) {
        const gate = deferred<void>();
        saves.push({ output, gate });
        await gate.promise;
        savedOutput = output;
      },
      async getUserOutput(_dayId: string) {
        return savedOutput;
      },
    };

    renderToday(repository);

    await user.type(await screen.findByRole('textbox', { name: 'Daily output' }), 'AB');
    await waitFor(() => expect(saves).toHaveLength(1));
    expect(saves[0].output.text).toBe('A');

    await act(async () => {
      saves[0].gate.resolve();
      await saves[0].gate.promise;
    });
    await waitFor(() => expect(saves).toHaveLength(2));
    expect(saves[1].output.text).toBe('AB');

    await act(async () => {
      saves[1].gate.resolve();
      await saves[1].gate.promise;
    });

    await expect(repository.getUserOutput(day.id)).resolves.toMatchObject({ text: 'AB' });
  });

  it('checks fill blank answers case-insensitively after trimming', async () => {
    const user = userEvent.setup();

    render(<ExerciseRenderer exercises={day.exercises} />);

    await user.type(screen.getByRole('textbox', { name: 'My ___ is Li.' }), ' NAME ');

    expect(screen.getByRole('status')).toHaveTextContent('Correct');
  });

  it('exposes selected choice state and live feedback', async () => {
    if (!choiceExercise) throw new Error('Day 1 test content is incomplete.');
    const user = userEvent.setup();

    render(<ExerciseRenderer exercises={day.exercises} />);

    const correctOption = screen.getByRole('button', { name: choiceExercise.correctOption });
    await user.click(correctOption);

    expect(correctOption).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Correct');
  });

  it('hides drill reference answers until requested', async () => {
    const user = userEvent.setup();

    render(<ExerciseRenderer exercises={day.exercises} />);

    expect(screen.queryByText(`Answer: I am from China.`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Reference: My name is Anna.`)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show sentence order reference' }));
    await user.click(screen.getByRole('button', { name: 'Show replacement reference' }));

    expect(screen.getByText('Answer: I am from China.')).toBeInTheDocument();
    expect(screen.getByText('Reference: My name is Anna.')).toBeInTheDocument();
  });

  it('shows Continue while Today steps remain', async () => {
    renderWithSpeech(<TodayPage course={week1Course} repository={createTestRepository()} />);

    expect(await getEnabledContinueButton()).toBeInTheDocument();
  });
});

describe('MePage', () => {
  it('lists completed day count and saved Day 1 output from the repository', async () => {
    const repository = createTestRepository({
      dayProgress: [
        {
          ...startDay(day.id, week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
          status: 'completed',
          currentStep: 'done',
          completedAt: '2026-05-25T00:10:00.000Z',
        },
        {
          ...startDay('day-002', week1Course.contentVersion, '2026-05-25T00:00:00.000Z'),
          status: 'in_progress',
          currentStep: 'words',
        },
      ],
      userOutputs: [outputDraft({ text: 'My name is Mei.' })],
    });

    render(<MePage repository={repository} />);

    expect(await screen.findByText('Completed days: 1')).toBeInTheDocument();
    expect(screen.getByText('My name is Mei.')).toBeInTheDocument();
  });

  it('calls reading setting handlers when reading controls change', async () => {
    const repository = createTestRepository();
    const onReadingEnabledChange = vi.fn();
    const onSpeechRateChange = vi.fn();
    const user = userEvent.setup();

    render(
      <MePage
        repository={repository}
        readingEnabled
        onReadingEnabledChange={onReadingEnabledChange}
        speechRate="normal"
        onSpeechRateChange={onSpeechRateChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));

    expect(onReadingEnabledChange).toHaveBeenCalledWith(false);
    expect(onSpeechRateChange).toHaveBeenCalledWith('slow');
  });

  it('shows an error without dropping the page shell when progress loading fails', async () => {
    const repository = {
      ...createTestRepository(),
      async listDayProgress() {
        throw new Error('progress list failed');
      },
      async getUserOutput(_dayId: string) {
        throw new Error('output load failed');
      },
    };

    render(<MePage repository={repository} />);

    expect(screen.getByRole('heading', { name: 'My Progress' })).toBeInTheDocument();
    expect(await screen.findByText('Progress could not be loaded.')).toBeInTheDocument();
    expect(screen.getByText('Completed days: 0')).toBeInTheDocument();
  });
});
