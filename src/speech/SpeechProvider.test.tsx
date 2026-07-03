import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SpeechLanguage, SpeechRate, SpeechService, SpeechUtterance } from './speechService';
import { SpeechProvider, useSpeech } from './SpeechProvider';

type TestUtterance = SpeechUtterance & {
  onend?: () => void;
  onerror?: () => void;
};

function createTestService({
  supported = true,
  nullTexts = [],
}: {
  supported?: boolean;
  nullTexts?: string[];
} = {}) {
  const utterances: TestUtterance[] = [];
  const service: SpeechService = {
    isSupported: vi.fn(() => supported),
    speak: vi.fn((text: string, rate: SpeechRate, language: SpeechLanguage) => {
      if (nullTexts.includes(text)) {
        return null;
      }

      const utterance: TestUtterance = { text, rate: rate === 'slow' ? 0.75 : 1, lang: language };
      utterances.push(utterance);
      return utterance;
    }),
    stop: vi.fn(),
  };

  return { service, utterances };
}

function SpeechProbe() {
  const speech = useSpeech();

  return (
    <div>
      <p>active: {speech.activeText ?? 'none'}</p>
      <p>enabled: {String(speech.enabled)}</p>
      <p>supported: {String(speech.isSupported)}</p>
      <p>rate: {speech.rate}</p>
      <button onClick={() => speech.speak('  hello  ')}>Speak hello</button>
      <button onClick={() => speech.speak('goodbye')}>Speak goodbye</button>
      <button
        onClick={() => {
          speech.speak('hello');
          speech.speak('goodbye');
        }}
      >
        Speak hello then goodbye
      </button>
      <button onClick={() => speech.speak('   ')}>Speak blank</button>
      <button onClick={speech.stop}>Stop</button>
    </div>
  );
}

function renderSpeechProvider({
  enabled = true,
  rate = 'normal',
  language = 'en-US',
  service = createTestService().service,
}: {
  enabled?: boolean;
  rate?: SpeechRate;
  language?: SpeechLanguage;
  service?: SpeechService;
} = {}) {
  return render(
    <SpeechProvider enabled={enabled} rate={rate} language={language} service={service}>
      <SpeechProbe />
    </SpeechProvider>,
  );
}

afterEach(() => cleanup());

describe('SpeechProvider', () => {
  it('speaks using configured rate and tracks active text', async () => {
    const user = userEvent.setup();
    const { service, utterances } = createTestService();

    renderSpeechProvider({ rate: 'slow', language: 'en-GB', service });

    expect(screen.getByText('active: none')).toBeInTheDocument();
    expect(screen.getByText('enabled: true')).toBeInTheDocument();
    expect(screen.getByText('supported: true')).toBeInTheDocument();
    expect(screen.getByText('rate: slow')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    expect(service.speak).toHaveBeenCalledWith('hello', 'slow', 'en-GB');
    expect(screen.getByText('active: hello')).toBeInTheDocument();

    act(() => {
      utterances[0].onend?.();
    });
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('stops current speech before speaking different text', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();

    renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));
    await user.click(screen.getByRole('button', { name: 'Speak goodbye' }));

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(service.speak).toHaveBeenNthCalledWith(2, 'goodbye', 'normal', 'en-US');
    expect(screen.getByText('active: goodbye')).toBeInTheDocument();
  });

  it('clears active text when replacement speech cannot start', async () => {
    const user = userEvent.setup();
    const { service } = createTestService({ nullTexts: ['goodbye'] });

    renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));
    await user.click(screen.getByRole('button', { name: 'Speak goodbye' }));

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(service.speak).toHaveBeenLastCalledWith('goodbye', 'normal', 'en-US');
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('stops current speech before same-event replacement text', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();

    renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello then goodbye' }));

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(service.speak).toHaveBeenLastCalledWith('goodbye', 'normal', 'en-US');
    expect(vi.mocked(service.stop).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(service.speak).mock.invocationCallOrder[1],
    );
    expect(screen.getByText('active: goodbye')).toBeInTheDocument();
  });

  it('ignores stale utterance completion after starting different text', async () => {
    const user = userEvent.setup();
    const { service, utterances } = createTestService();

    renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));
    await user.click(screen.getByRole('button', { name: 'Speak goodbye' }));

    act(() => {
      utterances[0].onend?.();
    });

    expect(screen.getByText('active: goodbye')).toBeInTheDocument();
  });

  it('speaking same active text stops instead of speaking again', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();

    renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));
    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(service.speak).toHaveBeenCalledTimes(1);
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('does not speak when disabled', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();

    renderSpeechProvider({ enabled: false, service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));
    await user.click(screen.getByRole('button', { name: 'Speak blank' }));

    expect(service.speak).not.toHaveBeenCalled();
    expect(service.stop).not.toHaveBeenCalled();
    expect(screen.getByText('active: none')).toBeInTheDocument();
    expect(screen.getByText('enabled: false')).toBeInTheDocument();
  });

  it('stops active speech when disabled changes to false', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();
    const view = renderSpeechProvider({ enabled: true, service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    view.rerender(
      <SpeechProvider enabled={false} rate="normal" service={service}>
        <SpeechProbe />
      </SpeechProvider>,
    );

    expect(service.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByText('active: none')).toBeInTheDocument();
    expect(screen.getByText('enabled: false')).toBeInTheDocument();
  });

  it('stops old service and clears active text when service identity changes', async () => {
    const user = userEvent.setup();
    const oldService = createTestService();
    const newService = createTestService();
    const view = renderSpeechProvider({ service: oldService.service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    view.rerender(
      <SpeechProvider enabled rate="normal" service={newService.service}>
        <SpeechProbe />
      </SpeechProvider>,
    );

    expect(oldService.service.stop).toHaveBeenCalledTimes(1);
    expect(newService.service.stop).not.toHaveBeenCalled();
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('stops active speech on unmount', async () => {
    const user = userEvent.setup();
    const { service } = createTestService();
    const view = renderSpeechProvider({ service });

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    view.unmount();

    expect(service.stop).toHaveBeenCalledTimes(1);
  });

  it('exposes unsupported state and does not speak when unsupported', async () => {
    const user = userEvent.setup();
    const { service } = createTestService({ supported: false });

    renderSpeechProvider({ service });

    expect(screen.getByText('supported: false')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Speak hello' }));

    expect(service.speak).not.toHaveBeenCalled();
    expect(screen.getByText('active: none')).toBeInTheDocument();
  });

  it('throws a clear error outside provider', () => {
    function OutsideProviderProbe() {
      useSpeech();
      return null;
    }

    expect(() => render(<OutsideProviderProbe />)).toThrow('useSpeech must be used within SpeechProvider');
  });
});
