import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SpeechLanguage, SpeechRate, SpeechService, SpeechUtterance } from '../speech/speechService';
import { SpeechProvider } from '../speech/SpeechProvider';
import { SpeechButton } from './SpeechButton';

function createTestService({ supported = true }: { supported?: boolean } = {}) {
  const service: SpeechService = {
    isSupported: vi.fn(() => supported),
    speak: vi.fn((text: string, rate: SpeechRate, language: SpeechLanguage): SpeechUtterance => {
      return { text, rate: rate === 'slow' ? 0.75 : 1, lang: language };
    }),
    stop: vi.fn(),
  };

  return service;
}

function renderSpeechButton({
  text = 'hello',
  label = 'Read hello',
  enabled = true,
  supported = true,
}: {
  text?: string;
  label?: string;
  enabled?: boolean;
  supported?: boolean;
} = {}) {
  const service = createTestService({ supported });

  render(
    <SpeechProvider enabled={enabled} rate="normal" language="en-US" service={service}>
      <SpeechButton text={text} label={label} />
    </SpeechProvider>,
  );

  return service;
}

afterEach(() => cleanup());

describe('SpeechButton', () => {
  it('speaks provided text when clicked', async () => {
    const user = userEvent.setup();
    const service = renderSpeechButton({ text: '  hello  ' });

    await user.click(screen.getByRole('button', { name: 'Read hello' }));

    expect(service.speak).toHaveBeenCalledWith('hello', 'normal', 'en-US');
  });

  it('is an icon-only button and sets aria-pressed true while active', async () => {
    const user = userEvent.setup();
    renderSpeechButton({ text: 'hello' });

    const button = screen.getByRole('button', { name: 'Read hello' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).not.toHaveTextContent(/Read|Stop/);
    expect(button.querySelector('svg')).toBeInTheDocument();

    await user.click(button);

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).not.toHaveTextContent(/Read|Stop/);
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when reading disabled', () => {
    renderSpeechButton({ enabled: false });

    expect(screen.getByRole('button', { name: 'Read hello' })).toBeDisabled();
  });

  it('is disabled when speech unsupported', () => {
    renderSpeechButton({ supported: false });

    expect(screen.getByRole('button', { name: 'Read hello' })).toBeDisabled();
  });

  it('is disabled for blank text', () => {
    renderSpeechButton({ text: '   ' });

    expect(screen.getByRole('button', { name: 'Read hello' })).toBeDisabled();
  });

  it('keeps active state on the clicked button when another button has the same text', async () => {
    const user = userEvent.setup();
    const service = createTestService();

    render(
      <SpeechProvider enabled rate="normal" language="en-US" service={service}>
        <SpeechButton text="I am from China." label="Read example for from" />
        <SpeechButton text="I am from China." label="Read example for China" />
      </SpeechProvider>,
    );

    const fromButton = screen.getByRole('button', { name: 'Read example for from' });
    const chinaButton = screen.getByRole('button', { name: 'Read example for China' });

    await user.click(fromButton);

    expect(fromButton).toHaveAttribute('aria-pressed', 'true');
    expect(chinaButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(chinaButton);

    expect(fromButton).toHaveAttribute('aria-pressed', 'false');
    expect(chinaButton).toHaveAttribute('aria-pressed', 'true');
    expect(service.speak).toHaveBeenCalledTimes(2);
  });
});
