import { describe, expect, it, vi } from 'vitest';
import { createSpeechService } from './speechService';

type TestUtterance = {
  text: string;
  lang: string;
  rate: number;
};

function createSupportedWindow() {
  const cancel = vi.fn();
  const speak = vi.fn();
  const utterances: TestUtterance[] = [];

  class TestSpeechSynthesisUtterance implements TestUtterance {
    lang = '';
    rate = 1;

    constructor(public text: string) {
      utterances.push(this);
    }
  }

  return {
    cancel,
    speak,
    utterances,
    windowRef: {
      speechSynthesis: { cancel, speak },
      SpeechSynthesisUtterance: TestSpeechSynthesisUtterance,
    },
  };
}

describe('speech service', () => {
  it('detects supported and unsupported speech APIs', () => {
    expect(createSpeechService(createSupportedWindow().windowRef).isSupported()).toBe(true);
    expect(createSpeechService({}).isSupported()).toBe(false);
    expect(
      createSpeechService({
        speechSynthesis: { cancel: vi.fn(), speak: vi.fn() },
      }).isSupported(),
    ).toBe(false);
    expect(
      createSpeechService({
        SpeechSynthesisUtterance: class {
          lang = '';
          rate = 1;
          text = '';
        },
      }).isSupported(),
    ).toBe(false);
  });

  it('speaks slow text by cancelling previous speech and setting utterance options', () => {
    const { cancel, speak, utterances, windowRef } = createSupportedWindow();
    const service = createSpeechService(windowRef);

    const utterance = service.speak('  hello world  ', 'slow', 'en-GB');

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledWith(utterance);
    expect(utterance).toBe(utterances[0]);
    expect(utterance).toMatchObject({
      text: 'hello world',
      lang: 'en-GB',
      rate: 0.75,
    });
  });

  it('maps normal and slow rates to browser speech rates', () => {
    const { utterances, windowRef } = createSupportedWindow();
    const service = createSpeechService(windowRef);

    service.speak('normal speed', 'normal', 'en-US');
    service.speak('slow speed', 'slow', 'en-US');

    expect(utterances.map((utterance) => utterance.rate)).toEqual([1, 0.75]);
  });

  it('does nothing for blank text', () => {
    const { cancel, speak, windowRef } = createSupportedWindow();
    const service = createSpeechService(windowRef);

    expect(service.speak('   ', 'normal', 'en-US')).toBeNull();

    expect(cancel).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });

  it('does not throw or call speech APIs when unsupported', () => {
    const cancel = vi.fn();
    const speak = vi.fn();
    const service = createSpeechService({});

    expect(() => service.stop()).not.toThrow();
    expect(() => service.speak('hello', 'normal', 'en-US')).not.toThrow();
    expect(service.speak('hello', 'normal', 'en-US')).toBeNull();
    expect(cancel).not.toHaveBeenCalled();
    expect(speak).not.toHaveBeenCalled();
  });
});
