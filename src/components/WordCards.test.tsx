import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../domain/types';
import { SpeechProvider } from '../speech/SpeechProvider';
import { WordCards } from './WordCards';

const speechService = {
  isSupported: () => true,
  speak: vi.fn(() => null),
  stop: vi.fn(),
};

const words: Word[] = [
  {
    id: 'name',
    text: 'name',
    category: 'general_thing',
    phonetic: '/neɪm/',
    definition: 'the word for a person or thing',
    chinese: '名字',
    example: 'My name is Li.',
    weekIntroduced: 1,
    tags: ['identity'],
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderWordCards(showChineseHelp = false) {
  return render(
    <SpeechProvider enabled rate="normal" service={speechService}>
      <WordCards words={words} showChineseHelp={showChineseHelp} onReview={vi.fn()} onKnow={vi.fn()} />
    </SpeechProvider>,
  );
}

describe('WordCards', () => {
  it('shows phonetics on Today word cards', () => {
    renderWordCards();

    expect(screen.getByText('/neɪm/')).toBeInTheDocument();
  });

  it('keeps phonetics visible while Chinese help is off', () => {
    renderWordCards();

    expect(screen.getByText('/neɪm/')).toBeInTheDocument();
    expect(screen.queryByText(/Chinese:/)).not.toBeInTheDocument();
  });

  it('still shows Chinese only when Chinese help is enabled', () => {
    renderWordCards(true);

    expect(screen.getByText('/neɪm/')).toBeInTheDocument();
    expect(screen.getByText('Chinese: 名字')).toBeInTheDocument();
  });
});
