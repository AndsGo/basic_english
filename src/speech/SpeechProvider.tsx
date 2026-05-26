import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  browserSpeechService,
  type SpeechRate,
  type SpeechService,
  type SpeechUtterance,
} from './speechService';

type SpeechProviderProps = {
  children: React.ReactNode;
  enabled: boolean;
  rate: SpeechRate;
  service?: SpeechService;
};

type SpeechContextValue = {
  activeText: string | null;
  enabled: boolean;
  isSupported: boolean;
  rate: SpeechRate;
  speak(text: string): void;
  stop(): void;
};

type SpeechUtteranceWithEvents = SpeechUtterance & {
  onend?: () => void;
  onerror?: () => void;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({
  children,
  enabled,
  rate,
  service = browserSpeechService,
}: SpeechProviderProps) {
  const [activeText, setActiveText] = useState<string | null>(null);
  const activeTextRef = useRef<string | null>(null);
  const utteranceTokenRef = useRef(0);
  const isSupported = service.isSupported();

  const setTrackedActiveText = useCallback((text: string | null) => {
    activeTextRef.current = text;
    setActiveText(text);
  }, []);

  const invalidateUtterance = useCallback(() => {
    utteranceTokenRef.current += 1;
  }, []);

  const stop = useCallback(() => {
    invalidateUtterance();
    service.stop();
    setTrackedActiveText(null);
  }, [invalidateUtterance, service, setTrackedActiveText]);

  const speak = useCallback(
    (text: string) => {
      const trimmedText = text.trim();

      if (!enabled || !isSupported || !trimmedText) {
        return;
      }

      const currentActiveText = activeTextRef.current;

      if (trimmedText === currentActiveText) {
        stop();
        return;
      }

      if (currentActiveText) {
        service.stop();
      }

      const utteranceToken = utteranceTokenRef.current + 1;
      utteranceTokenRef.current = utteranceToken;
      const utterance = service.speak(trimmedText, rate) as SpeechUtteranceWithEvents | null;

      if (utterance) {
        const clearIfCurrent = () => {
          if (utteranceTokenRef.current === utteranceToken) {
            setTrackedActiveText(null);
          }
        };

        utterance.onend = clearIfCurrent;
        utterance.onerror = clearIfCurrent;
        setTrackedActiveText(trimmedText);
      } else if (currentActiveText) {
        setTrackedActiveText(null);
      }
    },
    [enabled, isSupported, rate, service, setTrackedActiveText, stop],
  );

  useEffect(() => {
    if (!enabled && activeTextRef.current) {
      stop();
    }
  }, [enabled, stop]);

  useEffect(
    () => () => {
      if (activeTextRef.current) {
        invalidateUtterance();
        service.stop();
        setTrackedActiveText(null);
      }
    },
    [invalidateUtterance, service, setTrackedActiveText],
  );

  const value = useMemo<SpeechContextValue>(() => {
    return { activeText, enabled, isSupported, rate, speak, stop };
  }, [activeText, enabled, isSupported, rate, speak, stop]);

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const context = useContext(SpeechContext);

  if (!context) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }

  return context;
}
