import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import { pictureDescribeTasksByDayId } from '../content/pictureDescribeTasks';
import { sceneRemixTasksByDayId } from '../content/sceneRemixTasks';
import { sceneGoalsByDayId } from '../content/sceneGoals';
import { week1Course } from '../content/week1';
import type { DayProgress, StepId } from '../domain/progress';
import { startDay } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import { toLocalDateString } from '../domain/studyActivity';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import type {
  ExerciseAttempt,
  PictureDescription,
  ProgressRepository,
  SceneRemixAttempt,
  StepCompletion,
  StepProgress,
  StudyActivity,
  UserOutput,
  WordProgress,
} from '../storage/progressRepository';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { SpeechLanguage, SpeechRate, SpeechService, SpeechUtterance } from '../speech/speechService';
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
  const sceneRemixAttempts: SceneRemixAttempt[] = [];
  const pictureDescriptions = new Map<string, PictureDescription>();
  const reviewItems = new Map<string, ReviewItem>();

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
    async saveSceneRemixAttempt(attempt: SceneRemixAttempt) {
      sceneRemixAttempts.push(attempt);
    },
    async listSceneRemixAttempts(dayId?: string) {
      return sceneRemixAttempts.filter((attempt) => (dayId ? attempt.dayId === dayId : true));
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
    async savePictureDescription(description: PictureDescription) {
      pictureDescriptions.set(description.dayId, description);
    },
    async getPictureDescription(dayId: string) {
      return pictureDescriptions.get(dayId) ?? null;
    },
    async listPictureDescriptions() {
      return [...pictureDescriptions.values()];
    },
    async saveWordProgress(_progress: WordProgress) {
      return undefined;
    },
    async listReviewWords() {
      return [];
    },
    async saveReviewItem(item: ReviewItem) {
      reviewItems.set(item.id, item);
    },
    async listReviewItems(status?: ReviewItem['status']) {
      return [...reviewItems.values()].filter((item) => (status ? item.status === status : true));
    },
    async getReviewItem(id: string) {
      return reviewItems.get(id) ?? null;
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
    speak: vi.fn((text: string, rate: SpeechRate, language: SpeechLanguage): SpeechUtterance => {
      return { text, rate: rate === 'slow' ? 0.75 : 1, lang: language };
    }),
    stop: vi.fn(),
  };
}

function completedDayProgress(dayId: string, contentVersion: string): DayProgress {
  return {
    id: dayId,
    dayId,
    status: 'completed',
    currentStep: 'done',
    completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'picture', 'output'],
    startedAt: '2026-05-26T00:00:00.000Z',
    completedAt: '2026-05-26T00:10:00.000Z',
    updatedAt: '2026-05-26T00:10:00.000Z',
    contentVersion,
  };
}

function inProgressDayProgress(dayId: string, contentVersion: string, currentStep: StepId): DayProgress {
  const completedStepsByCurrentStep: Record<StepId, StepId[]> = {
    review: [],
    words: ['review'],
    patterns: ['review', 'words'],
    drills: ['review', 'words', 'patterns'],
    translate: ['review', 'words', 'patterns', 'drills'],
    'scene-remix': ['review', 'words', 'patterns', 'drills', 'translate'],
    picture: ['review', 'words', 'patterns', 'drills', 'translate', 'scene-remix'],
    output: ['review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture'],
    done: ['review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture', 'output'],
  };

  return {
    id: dayId,
    dayId,
    status: currentStep === 'done' ? 'completed' : 'in_progress',
    currentStep,
    completedStepIds: completedStepsByCurrentStep[currentStep],
    startedAt: '2026-05-26T00:00:00.000Z',
    completedAt: currentStep === 'done' ? '2026-05-26T00:10:00.000Z' : undefined,
    updatedAt: '2026-05-26T00:10:00.000Z',
    contentVersion,
  };
}

function completedProgressBeforeDay(dayNumber: number) {
  return basicEnglishCourse.weeks
    .flatMap((week) => week.days)
    .filter((courseDay) => courseDay.dayNumber < dayNumber)
    .map((courseDay) => completedDayProgress(courseDay.id, basicEnglishCourse.contentVersion));
}

function renderWithSpeech(children: ReactNode) {
  return render(
    <SpeechProvider enabled rate="normal" language="en-US" service={createTestSpeechService()}>
      {children}
    </SpeechProvider>,
  );
}

function renderToday(repository = createTestRepository()) {
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} pictureDescribeTasksByDayId={pictureDescribeTasksByDayId} />);
  return repository;
}

function renderTodayWithChineseHelp(repository = createTestRepository()) {
  renderWithSpeech(<TodayPage course={week1Course} repository={repository} pictureDescribeTasksByDayId={pictureDescribeTasksByDayId} showChineseHelp />);
  return repository;
}

async function getEnabledContinueButton() {
  const button = screen.getByRole('button', { name: /continue/i });
  await waitFor(() => expect(button).toBeEnabled());
  return button;
}

async function completeWords(user: ReturnType<typeof userEvent.setup>) {
  for (const button of screen.getAllByRole('button', { name: /^I know this/ })) {
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

async function completeSceneRemix(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: 'Scene Remix' });
  const textbox = screen.queryByLabelText('Scene remix answer');
  if (textbox) {
    await user.type(textbox, 'This is my scene. I can say it another way.');
    await user.click(screen.getByRole('button', { name: 'Show reference' }));
    await user.click(screen.getByRole('button', { name: 'Close enough' }));
  }
  await user.click(await getEnabledContinueButton());
}

async function completePicture(user: ReturnType<typeof userEvent.setup>, text = 'My name is Li. I am a student. I study English.') {
  await screen.findByRole('heading', { name: 'Describe the picture' });
  const textbox = screen.queryByLabelText('Picture description');
  if (!textbox) {
    await user.click(await getEnabledContinueButton());
    return;
  }
  await user.clear(textbox);
  await user.type(textbox, text);
  await user.click(screen.getByRole('button', { name: 'Check' }));
  await user.click(await getEnabledContinueButton());
}

async function completeToOutput(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await getEnabledContinueButton());
  await completeWords(user);
  await completePatterns(user);
  await completeDrills(user);
  await completeTranslation(user);
  await completeSceneRemix(user);
  await completePicture(user);
}

async function completeDayOneThroughOutput(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => {
    expect(screen.queryByText('Loading today...')).not.toBeInTheDocument();
  });
  if (screen.queryByLabelText('Scene sentence 1') || screen.queryByRole('textbox', { name: 'Daily output' })) return;

  if (!choiceExercise || !translationExercise) throw new Error('Day 1 test content is incomplete.');

  await user.click(await getEnabledContinueButton());
  expect(await screen.findByRole('heading', { name: 'Words' })).toBeInTheDocument();

  await completeWords(user);
  expect(await screen.findByRole('heading', { name: 'Patterns' })).toBeInTheDocument();

  await completePatterns(user);
  expect(await screen.findByRole('heading', { name: choiceExercise.prompt })).toBeInTheDocument();

  await completeDrills(user);
  expect(await screen.findByRole('heading', { name: translationExercise.chinesePrompt })).toBeInTheDocument();

  await completeTranslation(user);
  expect(await screen.findByRole('heading', { name: 'Scene Remix' })).toBeInTheDocument();
  await completeSceneRemix(user);
  expect(await screen.findByRole('heading', { name: 'Describe the picture' })).toBeInTheDocument();
  await completePicture(user);
  await waitFor(() => {
    expect(screen.queryByLabelText('Scene sentence 1') || screen.queryByRole('textbox', { name: 'Daily output' })).toBeTruthy();
  });
}

async function satisfyOutputGate(user: ReturnType<typeof userEvent.setup>, text = 'My name is Mei. I am from China. I study English. I am happy.') {
  await user.type(screen.getByRole('textbox', { name: 'Daily output' }), text);
  for (const checkbox of screen.getAllByRole('checkbox')) {
    if (!(checkbox as HTMLInputElement).checked) await user.click(checkbox);
  }
}

const singleDayCourse = {
  ...week1Course,
  weeks: [
    {
      ...week1Course.weeks[0],
      days: [day],
    },
  ],
};

const completedDay1Progress = [completedDayProgress(day.id, week1Course.contentVersion)];

const completedDay1Outputs = [
  outputDraft({
    id: 'output-day-001',
    text: 'I am from China.',
    sentenceCount: 1,
    checklist: {
      usedTargetPattern: true,
      usedLessonWords: true,
      hasSubjects: true,
      meaningIsClear: true,
    },
  }),
];

function changeTextbox(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
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
  it('does not repeat a remix task after day completion because remix is a formal step', async () => {
    const repository = createTestRepository({
      dayProgress: completedDay1Progress,
      userOutputs: completedDay1Outputs,
    });

    renderWithSpeech(<TodayPage course={singleDayCourse} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

    expect(await screen.findByRole('heading', { name: 'Day 1 complete' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Try Another Scene' })).not.toBeInTheDocument();
    expect(screen.queryByText('Change China to Japan.')).not.toBeInTheDocument();
  });

  it('saves a close-enough remix attempt without creating review', async () => {
    const repository = createTestRepository({
      dayProgress: [inProgressDayProgress(day.id, week1Course.contentVersion, 'scene-remix')],
      userOutputs: completedDay1Outputs,
    });

    renderWithSpeech(<TodayPage course={singleDayCourse} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

    await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from Japan.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close enough' }));

    await waitFor(async () => {
      await expect(repository.listSceneRemixAttempts('day-001')).resolves.toHaveLength(1);
    });
    expect(await repository.listReviewItems('active')).toHaveLength(0);
  });

  it('saves a review remix attempt and creates one active scene remix review item', async () => {
    const repository = createTestRepository({
      dayProgress: [inProgressDayProgress(day.id, week1Course.contentVersion, 'scene-remix')],
      userOutputs: completedDay1Outputs,
    });
    const onProgressChange = vi.fn();

    renderWithSpeech(
      <TodayPage
        course={singleDayCourse}
        repository={repository}
        sceneRemixTasksByDayId={sceneRemixTasksByDayId}
        pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
        onProgressChange={onProgressChange}
      />,
    );

    await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from China.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

    await waitFor(async () => {
      await expect(repository.listSceneRemixAttempts('day-001')).resolves.toHaveLength(1);
    });
    const reviews = await repository.listReviewItems('active');
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({
      type: 'scene_remix',
      sourceDayId: 'day-001',
      taskId: 'day-001-remix-country-japan',
      prompt: 'Change China to Japan.',
      source: 'I am from China.',
      userAnswer: 'I am from China.',
      referenceAnswer: 'I am from Japan.',
    });
    expect(onProgressChange).toHaveBeenCalled();
  });

  it('does not create duplicate active remix review items for the same task', async () => {
    const repository = createTestRepository({
      dayProgress: [inProgressDayProgress(day.id, week1Course.contentVersion, 'scene-remix')],
      userOutputs: completedDay1Outputs,
    });

    renderWithSpeech(<TodayPage course={singleDayCourse} repository={repository} sceneRemixTasksByDayId={sceneRemixTasksByDayId} />);

    await userEvent.type(await screen.findByLabelText('Scene remix answer'), 'I am from China.');
    await userEvent.click(screen.getByRole('button', { name: 'Show reference' }));
    await userEvent.click(screen.getByRole('button', { name: 'Need review' }));
    await userEvent.click(screen.getByRole('button', { name: 'Need review' }));

    await waitFor(async () => {
      await expect(repository.listSceneRemixAttempts('day-001')).resolves.toHaveLength(2);
    });
    expect(await repository.listReviewItems('active')).toHaveLength(1);
  });

  it('does not show a remix task on completed days by default', async () => {
    const repository = createTestRepository({
      dayProgress: completedDay1Progress,
      userOutputs: completedDay1Outputs,
    });

    renderWithSpeech(<TodayPage course={singleDayCourse} repository={repository} />);

    await screen.findByRole('heading', { name: 'Day 1 complete' });
    expect(screen.queryByRole('heading', { name: 'Try Another Scene' })).not.toBeInTheDocument();
  });

  it('does not show a remix task when only another day has remix content', async () => {
    const repository = createTestRepository({
      dayProgress: completedDay1Progress,
      userOutputs: completedDay1Outputs,
    });

    renderWithSpeech(
      <TodayPage
        course={singleDayCourse}
        repository={repository}
        sceneRemixTasksByDayId={{ 'day-008': sceneRemixTasksByDayId['day-008'] }}
      />,
    );

    await screen.findByRole('heading', { name: 'Day 1 complete' });
    expect(screen.queryByRole('heading', { name: 'Try Another Scene' })).not.toBeInTheDocument();
  });

  it('shows the scene goal banner for the current day', async () => {
    const repo = createIndexedDbProgressRepository('today-scene-goal-banner');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(await screen.findByLabelText('Today scene goal')).toHaveTextContent('I can say who I am.');
  });

  it('requires complete scene output before finishing the output step', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-scene-output-gate');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

    await completeDayOneThroughOutput(user);

    expect(screen.getByRole('heading', { name: 'Build Sentences' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByText('Write at least 4 scene sentences.')).toBeInTheDocument();

    changeTextbox('Scene sentence 1', 'My name is Li.');
    changeTextbox('Scene sentence 2', 'I am from China.');
    changeTextbox('Scene sentence 3', 'I am a student.');
    changeTextbox('Scene sentence 4', 'I study English.');
    changeTextbox('Scene description', 'My name is Li. I am from China. I am a student. I study English.');
    changeTextbox('Scene dialogue', 'A: What is your name?\nB: My name is Li.');

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('persists scene output drafts', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-scene-output-persistence');
    const { unmount } = renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

    await completeDayOneThroughOutput(user);
    await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
    await user.click(screen.getByRole('radio', { name: 'Guided' }));

    await waitFor(async () => {
      await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({
        scene: { helpMode: 'guided', sentences: ['My name is Li.', '', '', ''] },
      });
    });

    unmount();
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);
    await completeDayOneThroughOutput(user);

    expect(await screen.findByLabelText('Scene sentence 1')).toHaveValue('My name is Li.');
    expect(screen.getByRole('radio', { name: 'Guided' })).toBeChecked();
  });

  it('shows Week 2 Day 8 after Days 1-7 are completed', async () => {
    const completedWeek1Progress = basicEnglishCourse.weeks[0].days.map((courseDay) =>
      completedDayProgress(courseDay.id, basicEnglishCourse.contentVersion),
    );
    const repository = createTestRepository({ dayProgress: completedWeek1Progress });

    renderWithSpeech(<TodayPage course={basicEnglishCourse} repository={repository} />);

    expect(await screen.findByRole('heading', { level: 2, name: 'My Room' })).toBeInTheDocument();
    expect(screen.getByText(/Week 2 \/ Day 8/)).toBeInTheDocument();
    expect(screen.getByText('Describe your room with simple sentences.')).toBeInTheDocument();
  });

  it('marks completed scene goals from completed day progress', async () => {
    const completedWeek1Progress = basicEnglishCourse.weeks[0].days.map((courseDay) =>
      completedDayProgress(courseDay.id, basicEnglishCourse.contentVersion),
    );
    const repository = createTestRepository({ dayProgress: completedWeek1Progress });

    renderWithSpeech(<TodayPage course={basicEnglishCourse} repository={repository} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(await screen.findByRole('heading', { level: 2, name: 'My Room' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: /Week 1 Self Story Completed/ })).toHaveClass('scene-map-item--completed');
    expect(screen.getByRole('listitem', { name: /Room Today/ })).toHaveClass('scene-map-item--current');
  });

  it('renders a Week 3 Today lesson without changing the existing flow', async () => {
    const completedFirstTwoWeeksProgress = basicEnglishCourse.weeks
      .slice(0, 2)
      .flatMap((week) => week.days)
      .map((courseDay) => completedDayProgress(courseDay.id, basicEnglishCourse.contentVersion));
    const repository = createTestRepository({ dayProgress: completedFirstTwoWeeksProgress });

    renderWithSpeech(
      <TodayPage
        course={basicEnglishCourse}
        repository={repository}
        pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
      />,
    );

    expect(await screen.findByRole('heading', { name: /Morning Acts/i })).toBeInTheDocument();
    expect(screen.getByText(/Week 3 \/ Day 15/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Words');
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Picture');
  });

  it('renders a Week 4 Today lesson without changing the existing flow', async () => {
    const week3DayIds = basicEnglishCourse.weeks[2]?.days.map((courseDay) => courseDay.id) ?? [];
    const completedThroughWeek3Progress = [
      ...basicEnglishCourse.weeks
        .slice(0, 2)
        .flatMap((week) => week.days)
        .map((courseDay) => completedDayProgress(courseDay.id, basicEnglishCourse.contentVersion)),
      ...week3DayIds.map((dayId) => completedDayProgress(dayId, basicEnglishCourse.contentVersion)),
    ];
    const repository = createTestRepository({ dayProgress: completedThroughWeek3Progress });

    renderWithSpeech(
      <TodayPage
        course={basicEnglishCourse}
        repository={repository}
        sceneRemixTasksByDayId={sceneRemixTasksByDayId}
        pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
      />,
    );

    expect(await screen.findByRole('heading', { name: /Food and Drink/i })).toBeInTheDocument();
    expect(screen.getByText(/Week 4 \/ Day 22/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Scene Remix');
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Output');
  });

  it('renders the Week 5 Day 29 Today story sentence flow', async () => {
    const day29 = basicEnglishCourse.weeks.flatMap((week) => week.days).find((courseDay) => courseDay.id === 'day-029');
    if (!day29) throw new Error('Day 29 test content is missing.');
    const repository = createTestRepository({
      dayProgress: [
        ...completedProgressBeforeDay(29),
        inProgressDayProgress(day29.id, basicEnglishCourse.contentVersion, 'output'),
      ],
    });

    renderWithSpeech(
      <TodayPage
        course={basicEnglishCourse}
        repository={repository}
        sceneRemixTasksByDayId={sceneRemixTasksByDayId}
        pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
      />,
    );

    expect(await screen.findByRole('heading', { level: 2, name: day29.title })).toBeInTheDocument();
    expect(screen.getByText(/Week 5 \/ Day 29/i)).toBeInTheDocument();
    expect(await screen.findByText('Today story sentence')).toBeInTheDocument();
    expect(screen.getByText('Make a short story about going outside and stopping at a place.')).toBeInTheDocument();
    const todaySteps = screen.getByRole('list', { name: 'Today steps' });
    expect(todaySteps).toHaveTextContent('Picture');
    expect(todaySteps).toHaveTextContent('Scene Remix');
    expect(todaySteps).toHaveTextContent('Output');
  });

  it('renders the Week 6 Day 42 Today story recap flow', async () => {
    const day42 = basicEnglishCourse.weeks.flatMap((week) => week.days).find((courseDay) => courseDay.id === 'day-042');
    if (!day42) throw new Error('Day 42 test content is missing.');
    const repository = createTestRepository({
      dayProgress: [
        ...completedProgressBeforeDay(42),
        inProgressDayProgress(day42.id, basicEnglishCourse.contentVersion, 'output'),
      ],
    });

    renderWithSpeech(
      <TodayPage
        course={basicEnglishCourse}
        repository={repository}
        sceneRemixTasksByDayId={sceneRemixTasksByDayId}
        pictureDescribeTasksByDayId={pictureDescribeTasksByDayId}
      />,
    );

    expect(await screen.findByRole('heading', { level: 2, name: day42.title })).toBeInTheDocument();
    expect(screen.getByText(/Week 6 \/ Day 42/i)).toBeInTheDocument();
    expect(await screen.findByText('Story recap')).toBeInTheDocument();
    expect(
      screen.getByText('Make a full story about a problem outside, asking for another way, understanding, and being kind.'),
    ).toBeInTheDocument();
    const outputTemplate = screen.getByLabelText('Output template');
    const templateLines = within(outputTemplate)
      .getAllByText((_, element) => element?.tagName.toLowerCase() === 'code')
      .map((element) => element.textContent);
    expect(templateLines).toEqual([
      'The way is not clear.',
      'This way is wrong.',
      'I need another way.',
      'Please repeat.',
      'I understand.',
      'I am kind.',
    ]);
    const todaySteps = screen.getByRole('list', { name: 'Today steps' });
    expect(todaySteps).toHaveTextContent('Picture');
    expect(todaySteps).toHaveTextContent('Scene Remix');
    expect(todaySteps).toHaveTextContent('Output');
  });

  it('shows Day 2 after Day 1 is completed', async () => {
    const repo = createIndexedDbProgressRepository('today-v1-1-current-day');
    await repo.saveDayProgress({
      id: 'day-001',
      dayId: 'day-001',
      status: 'completed',
      currentStep: 'done',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'picture', 'output'],
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
    expect(screen.getByText(/Mark name as "I know this" or "Add to review"/)).toBeInTheDocument();
  });

  it('returns to the Today top when Continue advances to the next step', async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;

    try {
      const repo = createTestRepository({ dayProgress: [inProgressDayProgress(day.id, week1Course.contentVersion, 'review')] });
      renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

      await user.click(await getEnabledContinueButton());

      await waitFor(() => expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Words'));
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' });
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    }
  });

  it('creates a review item when a word is marked Review', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-word-review');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await getEnabledContinueButton());
    await user.click(await screen.findByRole('button', { name: 'Add to review: name' }));

    await waitFor(async () => {
      expect(await repo.listReviewItems('active')).toHaveLength(1);
    });
  });

  it('shows visible selected feedback when words and patterns are marked', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-visible-selection-feedback');
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} />);

    await user.click(await getEnabledContinueButton());

    const knowName = await screen.findByRole('button', { name: 'I know this: name' });
    await user.click(knowName);

    expect(knowName).toHaveAttribute('aria-pressed', 'true');
    expect(knowName).toHaveClass('selected-button');
    expect(screen.getByText('Known')).toBeInTheDocument();

    for (const button of screen.getAllByRole('button', { name: /^I know this/ })) {
      if (button !== knowName) await user.click(button);
    }
    await user.click(await getEnabledContinueButton());

    const practiceButtons = await screen.findAllByRole('button', { name: 'Practice this' });
    const practiceButton = practiceButtons[0];
    await user.click(practiceButton);

    expect(practiceButton).toHaveAttribute('aria-pressed', 'true');
    expect(practiceButton).toHaveClass('selected-button');
    expect(screen.getByText('Practiced')).toBeInTheDocument();
  });

  it('notifies when a word review item is created', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-v1-1-word-review-callback');
    const onProgressChange = vi.fn();
    renderWithSpeech(<TodayPage course={week1Course} repository={repo} onProgressChange={onProgressChange} />);

    await user.click(await getEnabledContinueButton());
    await user.click(await screen.findByRole('button', { name: 'Add to review: name' }));

    await waitFor(() => {
      expect(onProgressChange).toHaveBeenCalled();
    });
  });

  it('keeps Continue disabled until current-day selection resolves', async () => {
    const progressList = deferred<DayProgress[]>();
    const repository = {
      ...createTestRepository(),
      listDayProgress: () => progressList.promise,
    };

    renderToday(repository);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await act(async () => {
      await Promise.resolve();
    });
    expect(continueButton).toBeDisabled();

    await act(async () => {
      progressList.resolve([
        {
          id: 'day-001',
          dayId: 'day-001',
          status: 'completed',
          currentStep: 'done',
          completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
          startedAt: '2026-05-26T00:00:00.000Z',
          completedAt: '2026-05-26T00:10:00.000Z',
          updatedAt: '2026-05-26T00:10:00.000Z',
          contentVersion: week1Course.contentVersion,
        },
      ]);
      await progressList.promise;
    });

    expect(await screen.findByRole('heading', { level: 2, name: 'I Am' })).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 2/)).toBeInTheDocument();
  });

  it('hides completion actions until current-day selection resolves', async () => {
    const progressList = deferred<DayProgress[]>();
    const completedDayProgress: DayProgress = {
      id: 'day-001',
      dayId: 'day-001',
      status: 'completed',
      currentStep: 'done',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
      startedAt: '2026-05-26T00:00:00.000Z',
      completedAt: '2026-05-26T00:10:00.000Z',
      updatedAt: '2026-05-26T00:10:00.000Z',
      contentVersion: week1Course.contentVersion,
    };
    const repository = {
      ...createTestRepository({
        dayProgress: [completedDayProgress],
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
      listDayProgress: () => progressList.promise,
    };

    renderToday(repository);

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('Loading today...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start Day 2' })).not.toBeInTheDocument();

    await act(async () => {
      progressList.resolve([completedDayProgress]);
      await progressList.promise;
    });

    expect(await screen.findByRole('heading', { level: 2, name: 'I Am' })).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 2/)).toBeInTheDocument();
  });

  it('does not create drill attempts or review items for empty drill commits', async () => {
    const attempts: ExerciseAttempt[] = [];
    const reviewItems: ReviewItem[] = [];
    const user = userEvent.setup();
    const repository = {
      ...createTestRepository(),
      async saveExerciseAttempt(attempt: ExerciseAttempt) {
        attempts.push(attempt);
      },
      async saveReviewItem(item: ReviewItem) {
        reviewItems.push(item);
      },
      async listReviewItems(status?: ReviewItem['status']) {
        return reviewItems.filter((item) => (status ? item.status === status : true));
      },
    };

    renderToday(repository);
    await user.click(await getEnabledContinueButton());
    await completeWords(user);
    await completePatterns(user);

    await user.click(screen.getByRole('button', { name: 'Clear sentence' }));

    expect(attempts).toHaveLength(0);
    expect(reviewItems).toHaveLength(0);
  });

  it('creates one incorrect drill attempt when leaving drills instead of while typing', async () => {
    const attempts: ExerciseAttempt[] = [];
    const reviewItems: ReviewItem[] = [];
    const sentenceOrderExercise = day.exercises.find((exercise) => exercise.type === 'sentence_order');
    const replacementExercise = day.exercises.find((exercise) => exercise.type === 'replacement');
    if (!choiceExercise || !sentenceOrderExercise || !replacementExercise) throw new Error('Day 1 drill test content is incomplete.');
    const user = userEvent.setup();
    const repository = {
      ...createTestRepository(),
      async saveExerciseAttempt(attempt: ExerciseAttempt) {
        attempts.push(attempt);
      },
      async saveReviewItem(item: ReviewItem) {
        reviewItems.push(item);
      },
      async listReviewItems(status?: ReviewItem['status']) {
        return reviewItems.filter((item) => (status ? item.status === status : true));
      },
    };

    renderToday(repository);
    await user.click(await getEnabledContinueButton());
    await completeWords(user);
    await completePatterns(user);

    await user.click(screen.getByRole('button', { name: choiceExercise.correctOption }));
    await user.type(screen.getByRole('textbox', { name: 'My ___ is Li.' }), 'wrong');
    for (const token of sentenceOrderExercise.correctOrder) {
      await user.click(screen.getByRole('button', { name: token }));
    }
    await user.type(screen.getByRole('textbox', { name: 'Replacement answer' }), replacementExercise.referenceAnswer);

    expect(attempts).toHaveLength(0);
    expect(reviewItems).toHaveLength(0);

    await user.click(await getEnabledContinueButton());

    expect(attempts).toHaveLength(1);
    expect(reviewItems).toHaveLength(1);
  });

  it('shows Day 1 review and advances through the local Today steps', async () => {
    if (!choiceExercise || !translationExercise) throw new Error('Day 1 test content is incomplete.');

    const user = userEvent.setup();

    renderToday();

    expect(screen.getByRole('heading', { level: 2, name: 'My Name' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Quick Review' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Review');
    expect(screen.getByRole('list', { name: 'Today steps' })).toHaveTextContent('Output');

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { name: 'Words' })).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('the word for a person or thing')).toBeInTheDocument();
    expect(screen.queryByText(/名字/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read definition for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to review: name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I know this: name' })).toBeInTheDocument();

    await completeWords(user);
    expect(screen.getByRole('heading', { name: 'Patterns' })).toBeInTheDocument();
    expect(screen.getByText('My name is ___.')).toBeInTheDocument();
    expect(screen.getByText('My name is Li.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read example for My name is ___.: My name is Li.' })).toBeInTheDocument();

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
    expect(screen.getByRole('heading', { name: 'Scene Remix' })).toBeInTheDocument();
    await completeSceneRemix(user);
    expect(screen.getByRole('heading', { name: 'Describe the picture' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.type(screen.getByLabelText('Picture description'), 'My name is Li. I am a student. I study English.');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByText('Clear enough. You can continue.')).toBeInTheDocument();
    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { level: 3, name: 'My Name' })).toBeInTheDocument();
    await satisfyOutputGate(user, 'My name is Mei.\nI am from China.\nI study English.\nI am happy.');

    await user.click(await getEnabledContinueButton());
    expect(screen.getByRole('heading', { name: 'Day 1 complete' })).toBeInTheDocument();
    const savedOutput = screen.getByText((_, element) => element?.textContent === 'My name is Mei.\nI am from China.\nI study English.\nI am happy.');
    expect(savedOutput).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('records a study activity for today when the day is completed (drives the streak)', async () => {
    const user = userEvent.setup();
    const repo = createTestRepository();
    const saveStudyActivity = vi.spyOn(repo, 'saveStudyActivity');

    renderToday(repo);

    await completeDayOneThroughOutput(user);
    await satisfyOutputGate(user);
    await user.click(await getEnabledContinueButton());

    expect(await screen.findByRole('heading', { name: 'Day 1 complete' })).toBeInTheDocument();

    await waitFor(() => expect(saveStudyActivity).toHaveBeenCalled());
    expect(saveStudyActivity.mock.calls[0][0]).toMatchObject({
      localDate: toLocalDateString(new Date()),
      completedDayIds: ['day-001'],
    });
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

  it('shows the previous day words in Today review for the current day', async () => {
    const repository = createTestRepository({
      dayProgress: [
        completedDayProgress('day-001', week1Course.contentVersion),
        completedDayProgress('day-002', week1Course.contentVersion),
      ],
    });

    renderToday(repository);

    expect(await screen.findByRole('heading', { level: 2, name: 'I Have' })).toBeInTheDocument();
    expect(screen.getByText(/Week 1 \/ Day 3/i)).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Quick Review' })).toBeInTheDocument();
    expect(screen.getByText('Review Day 2: I Am')).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.queryByText('China')).not.toBeInTheDocument();
  });

  it('shows Chinese word help when enabled', async () => {
    const user = userEvent.setup();

    renderTodayWithChineseHelp();

    await user.click(await getEnabledContinueButton());

    expect(screen.getByText('the word for a person or thing')).toBeInTheDocument();
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

  it('adds a checked picture description to review without duplicates', async () => {
    const user = userEvent.setup();
    const repository = createTestRepository({
      dayProgress: [
        {
          ...startDay(day.id, week1Course.contentVersion, '2026-06-02T00:00:00.000Z'),
          currentStep: 'picture',
        },
      ],
    });

    renderToday(repository);

    await user.type(await screen.findByLabelText('Picture description'), 'My name is Li. I am a student. I study English.');
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await user.click(screen.getByRole('button', { name: 'Add to Review' }));
    await user.click(screen.getByRole('button', { name: 'Added to Review' }));

    const reviews = await repository.listReviewItems('active');
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({
      type: 'picture_description',
      sourceDayId: 'day-001',
      pictureDescriptionTaskId: 'picture-day-001-self-introduction',
      userAnswer: 'My name is Li. I am a student. I study English.',
    });
  });

  it('restores a saved picture description draft and checked state', async () => {
    const repository = createTestRepository({
      dayProgress: [
        {
          ...startDay(day.id, week1Course.contentVersion, '2026-06-02T00:00:00.000Z'),
          currentStep: 'picture',
        },
      ],
    });
    await repository.savePictureDescription({
      id: 'picture-description-day-001',
      dayId: day.id,
      taskId: 'picture-day-001-self-introduction',
      text: 'My name is Li. I am a student. I study English.',
      checkedAt: '2026-06-02T00:01:00.000Z',
      feedback: {
        status: 'ready',
        messages: ['Clear enough. You can continue.'],
        simpleVersion: ['My name is Li.', 'I am a student.', 'I study English.'],
      },
      updatedAt: '2026-06-02T00:01:00.000Z',
    });

    renderToday(repository);

    expect(await screen.findByLabelText('Picture description')).toHaveValue('My name is Li. I am a student. I study English.');
    expect(screen.getByText('Clear enough. You can continue.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
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
    await completeSceneRemix(user);
    await completePicture(user);

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
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving...' })).toHaveAttribute('aria-busy', 'true');
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

  it('disables sentence order tokens after they are selected', async () => {
    const sentenceOrderExercise = day.exercises.find((exercise) => exercise.type === 'sentence_order');
    if (!sentenceOrderExercise) throw new Error('Day 1 sentence order test content is incomplete.');
    const user = userEvent.setup();

    render(<ExerciseRenderer exercises={day.exercises} />);

    const selectedToken = screen.getByRole('button', { name: sentenceOrderExercise.correctOrder[0] });
    const availableToken = screen.getByRole('button', { name: sentenceOrderExercise.correctOrder[1] });
    await user.click(selectedToken);

    expect(selectedToken).toBeDisabled();
    expect(selectedToken).toHaveClass('selected-order-token');
    expect(availableToken).toBeEnabled();
    expect(screen.getByLabelText('Selected sentence')).toHaveTextContent(sentenceOrderExercise.correctOrder[0]);

    await user.click(selectedToken);

    expect(screen.getByLabelText('Selected sentence')).toHaveTextContent(sentenceOrderExercise.correctOrder[0]);
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

    render(<MePage repository={repository} totalDayCount={14} />);

    expect(await screen.findByText('Completed days: 1')).toBeInTheDocument();
    expect(screen.getByText('/ 14')).toBeInTheDocument();
    expect(screen.getByText('My name is Mei.')).toBeInTheDocument();
  });

  it('calls reading setting handlers when reading controls change', async () => {
    const repository = createTestRepository();
    const onReadingEnabledChange = vi.fn();
    const onSpeechRateChange = vi.fn();
    const onSpeechLanguageChange = vi.fn();
    const user = userEvent.setup();

    render(
      <MePage
        repository={repository}
        readingEnabled
        onReadingEnabledChange={onReadingEnabledChange}
        speechRate="normal"
        onSpeechRateChange={onSpeechRateChange}
        speechLanguage="en-US"
        onSpeechLanguageChange={onSpeechLanguageChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Enable reading aloud' }));
    await user.click(screen.getByRole('radio', { name: 'Slow' }));
    await user.click(screen.getByRole('radio', { name: 'British English' }));

    expect(onReadingEnabledChange).toHaveBeenCalledWith(false);
    expect(onSpeechRateChange).toHaveBeenCalledWith('slow');
    expect(onSpeechLanguageChange).toHaveBeenCalledWith('en-GB');
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
