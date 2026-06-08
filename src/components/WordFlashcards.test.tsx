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

  it('flips to definition and example with optional Chinese hidden by default', async () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('a part of a house')).toBeInTheDocument();
    expect(screen.getByText('My room is small.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word room' })).toBeInTheDocument();
    expect(screen.queryByText('Chinese: 房间')).not.toBeInTheDocument();
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

    expect(screen.getByText('Chinese: 房间')).toBeInTheDocument();
  });

  it('saves review feedback and keeps the learner in the deck', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Know' }));

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
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));

    expect(screen.getByRole('button', { name: 'Flip' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    resolveReview();

    expect(await screen.findByText('Added to Review')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
  });
});
