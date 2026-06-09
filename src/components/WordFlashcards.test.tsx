import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../domain/types';
import { SpeechProvider } from '../speech/SpeechProvider';
import { WordFlashcards } from './WordFlashcards';

const words: Word[] = [
  {
    id: 'name',
    text: 'name',
    category: 'general_thing',
    definition: 'the word for a person or thing',
    phonetic: '/ne\u026am/',
    chinese: '名字',
    example: 'My name is Li.',
    weekIntroduced: 1,
    tags: ['identity'],
  },
  {
    id: 'room',
    text: 'room',
    category: 'picturable_thing',
    definition: 'a part of a house',
    phonetic: '/ru\u02d0m/',
    chinese: '房间',
    example: 'My room is small.',
    weekIntroduced: 2,
    tags: ['home'],
  },
];

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

describe('WordFlashcards', () => {
  it('shows image-backed words first on the front side', () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    expect(screen.getByRole('img', { name: 'room flashcard illustration' })).toHaveAttribute('src', '/room.png');
    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.queryByText('a part of a house')).not.toBeInTheDocument();
  });

  it('shows phonetics on the front side', () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    expect(screen.getByText('/ru\u02d0m/')).toBeInTheDocument();
  });

  it('shows phonetics on the back side', async () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('/ru\u02d0m/')).toBeInTheDocument();
  });

  it('flips to definition and example with optional Chinese hidden by default', async () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('a part of a house')).toBeInTheDocument();
    expect(screen.getByText('My room is small.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word room' })).toBeInTheDocument();
    expect(screen.queryByText('房间')).not.toBeInTheDocument();
  });

  it('shows Chinese on the back when enabled', async () => {
    renderWithSpeech(
      <WordFlashcards
        words={words}
        imageByWordId={{ room: '/room.png' }}
        showChineseHelp
        onKnow={vi.fn()}
        onReview={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    const chinese = screen.getByText('房间');
    expect(chinese).toHaveAttribute('lang', 'zh');
    expect(screen.getByText(/Chinese:/)).toBeInTheDocument();
  });

  it('saves review feedback and keeps the learner in the deck', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to review' }));

    expect(onReview).toHaveBeenCalledWith(words[1]);
    expect(await screen.findByText('Added to Review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
  });

  it('saves known feedback', async () => {
    const onKnow = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={onKnow} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'I know this' }));

    expect(onKnow).toHaveBeenCalledWith(words[1]);
    expect(await screen.findByText('Marked Known')).toBeInTheDocument();
  });

  it('navigates next and previous, resetting to the front side', async () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('heading', { name: 'name' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.queryByText('the word for a person or thing')).not.toBeInTheDocument();
    expect(screen.getByText('No image yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('clamps the current card when the deck shrinks', async () => {
    const { rerender } = renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'name' })).toBeInTheDocument();

    rerender(
      <SpeechProvider enabled rate="normal" service={speechService}>
        <WordFlashcards words={[words[1]]} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />
      </SpeechProvider>,
    );

    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('keeps navigation disabled while save feedback is pending', async () => {
    let resolveReview: () => void = () => undefined;
    const onReview = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveReview = resolve;
        }),
    );
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to review' }));

    expect(screen.getByRole('button', { name: 'Flip' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    resolveReview();

    expect(await screen.findByText('Added to Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });

  it('announces save feedback to assistive technology via a status role', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to review' }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent('Added to Review');
  });

  it('announces save errors assertively via an alert role', async () => {
    const onReview = vi.fn().mockRejectedValue(new Error('offline'));
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Add to review' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not save. Try again.');
  });
});
