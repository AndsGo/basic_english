import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import { week1Course } from '../content/week1';
import type { ReviewItem } from '../domain/review';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { ProgressRepository, WordProgress } from '../storage/progressRepository';
import { WordsPage } from './WordsPage';

const speechService = {
  isSupported: () => true,
  speak: vi.fn(() => null),
  stop: vi.fn(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderWithSpeech(ui: ReactNode) {
  return render(
    <SpeechProvider enabled rate="normal" service={speechService}>
      {ui}
    </SpeechProvider>,
  );
}

function createRepository(): ProgressRepository {
  const wordProgress: WordProgress[] = [];
  const reviewItems: ReviewItem[] = [];

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
    async saveWordProgress(progress) {
      const existingIndex = wordProgress.findIndex((item) => item.id === progress.id);

      if (existingIndex >= 0) {
        wordProgress[existingIndex] = progress;
      } else {
        wordProgress.push(progress);
      }
    },
    async listReviewWords() {
      return wordProgress.filter((progress) => progress.status === 'review' || progress.status === 'seen');
    },
    async saveReviewItem(item) {
      const existingIndex = reviewItems.findIndex((reviewItem) => reviewItem.id === item.id);

      if (existingIndex >= 0) {
        reviewItems[existingIndex] = item;
      } else {
        reviewItems.push(item);
      }
    },
    async listReviewItems(status) {
      return reviewItems.filter((item) => (status ? item.status === status : true));
    },
    async getReviewItem(id) {
      return reviewItems.find((item) => item.id === id) ?? null;
    },
    saveStudyActivity: vi.fn().mockResolvedValue(undefined),
    listStudyActivities: vi.fn().mockResolvedValue([]),
  };
}

describe('WordsPage', () => {
  it('defaults to the existing list mode', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByRole('heading', { name: 'Course Words' })).toBeInTheDocument();
    expect(screen.getByText('the word for a person or thing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByLabelText('Word flashcards')).not.toBeInTheDocument();
  });

  it('shows phonetics in list mode', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByText('/neɪm/')).toBeInTheDocument();
  });

  it('keeps phonetics visible when Chinese help is off', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByText('/neɪm/')).toBeInTheDocument();
    expect(screen.queryByText(/Chinese:/)).not.toBeInTheDocument();
  });

  it('switches to flashcards and renders image-backed content', async () => {
    renderWithSpeech(
      <WordsPage course={week1Course} repository={createRepository()} imageByWordId={{ student: '/student.png' }} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));

    expect(screen.getByLabelText('Word flashcards')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'student flashcard illustration' })).toBeInTheDocument();
  });

  it('does not show missing-image fallback for real course flashcards', async () => {
    renderWithSpeech(<WordsPage course={basicEnglishCourse} repository={createRepository()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));

    expect(screen.queryByText('No image yet')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', expect.stringContaining('flashcard illustration'));
  });

  it('shows Chinese help on the flashcard back when enabled', async () => {
    renderWithSpeech(
      <WordsPage course={week1Course} repository={createRepository()} imageByWordId={{ name: '/name.png' }} showChineseHelp />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText(/Chinese:/)).toBeInTheDocument();
  });

  it('saves known word progress from flashcards', async () => {
    const repository = createRepository();
    const onProgressChange = vi.fn();
    renderWithSpeech(
      <WordsPage
        course={week1Course}
        repository={repository}
        imageByWordId={{ name: '/name.png' }}
        onProgressChange={onProgressChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Know' }));

    await waitFor(async () => {
      await expect(repository.listReviewWords()).resolves.toHaveLength(0);
    });
    expect(onProgressChange).toHaveBeenCalled();
    expect(screen.getByText('Marked Known')).toBeInTheDocument();
  });

  it('saves review word progress and creates one active review item', async () => {
    const repository = createRepository();
    renderWithSpeech(
      <WordsPage course={week1Course} repository={repository} imageByWordId={{ name: '/name.png' }} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));

    expect(await repository.listReviewWords()).toHaveLength(1);
    const activeReviews = await repository.listReviewItems('active');
    expect(activeReviews).toHaveLength(1);
    expect(activeReviews[0]).toMatchObject({ type: 'word', wordId: 'name', prompt: 'name', sourceDayId: 'words-page' });
    expect(screen.getByText('Added to Review')).toBeInTheDocument();
  });

  it('resolves an active word review item when the learner marks the word known', async () => {
    const repository = createRepository();
    renderWithSpeech(
      <WordsPage course={week1Course} repository={repository} imageByWordId={{ name: '/name.png' }} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(await repository.listReviewItems('active')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Know' }));

    expect(await repository.listReviewItems('active')).toHaveLength(0);
    expect(await repository.listReviewItems('known')).toHaveLength(1);
    expect(screen.getByText('Marked Known')).toBeInTheDocument();
  });
});
