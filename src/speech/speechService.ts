export type SpeechRate = 'slow' | 'normal';
export type SpeechLanguage = 'en-US' | 'en-GB' | 'en-AU' | 'en-CA';

export type SpeechUtterance = Pick<SpeechSynthesisUtterance, 'lang' | 'rate' | 'text'>;

export interface SpeechService {
  isSupported(): boolean;
  speak(text: string, rate: SpeechRate, language: SpeechLanguage): SpeechUtterance | null;
  stop(): void;
}

type SpeechSynthesisLike = {
  cancel(): void;
  speak(utterance: SpeechUtterance): void;
};

type SpeechWindow = {
  speechSynthesis?: SpeechSynthesisLike;
  SpeechSynthesisUtterance?: new (text: string) => SpeechUtterance;
};

const speechRates: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 1,
};

export function createSpeechService(windowRef: SpeechWindow): SpeechService {
  const isSupported = () =>
    Boolean(windowRef.speechSynthesis && windowRef.SpeechSynthesisUtterance);

  return {
    isSupported,
    speak(text, rate, language) {
      if (!isSupported()) {
        return null;
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        return null;
      }

      windowRef.speechSynthesis?.cancel();

      const utterance = new windowRef.SpeechSynthesisUtterance!(trimmedText);
      utterance.lang = language;
      utterance.rate = speechRates[rate];

      windowRef.speechSynthesis?.speak(utterance);

      return utterance;
    },
    stop() {
      if (isSupported()) {
        windowRef.speechSynthesis?.cancel();
      }
    },
  };
}

export const browserSpeechService = createSpeechService(window);
