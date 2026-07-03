import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  browserSpeechService,
  type SpeechLanguage,
  type SpeechRate,
  type SpeechService,
  type SpeechUtterance,
} from './speechService';

type SpeechProviderProps = {
  children: React.ReactNode;
  enabled: boolean;
  rate: SpeechRate;
  language?: SpeechLanguage;
  service?: SpeechService;
};

type SpeechContextValue = {
  activeId: string | null;
  activeText: string | null;
  enabled: boolean;
  isSupported: boolean;
  rate: SpeechRate;
  language: SpeechLanguage;
  speak(text: string, activeId?: string): void;
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
  language = 'en-US',
  service = browserSpeechService,
}: SpeechProviderProps) {
  const [activeText, setActiveText] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTextRef = useRef<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const utteranceTokenRef = useRef(0);
  const isSupported = service.isSupported();

  const setTrackedActiveSpeech = useCallback((id: string | null, text: string | null) => {
    activeIdRef.current = id;
    activeTextRef.current = text;
    setActiveId(id);
    setActiveText(text);
  }, []);

  const invalidateUtterance = useCallback(() => {
    utteranceTokenRef.current += 1;
  }, []);

  const stop = useCallback(() => {
    invalidateUtterance();
    service.stop();
    setTrackedActiveSpeech(null, null);
  }, [invalidateUtterance, service, setTrackedActiveSpeech]);

  const speak = useCallback(
    (text: string, activeIdForRequest?: string) => {
      const trimmedText = text.trim();
      const requestedActiveId = activeIdForRequest ?? trimmedText;

      if (!enabled || !isSupported || !trimmedText) {
        return;
      }

      const currentActiveId = activeIdRef.current;

      if (requestedActiveId === currentActiveId) {
        stop();
        return;
      }

      if (currentActiveId) {
        service.stop();
      }

      const utteranceToken = utteranceTokenRef.current + 1;
      utteranceTokenRef.current = utteranceToken;
      const utterance = service.speak(trimmedText, rate, language) as SpeechUtteranceWithEvents | null;

      if (utterance) {
        const clearIfCurrent = () => {
          if (utteranceTokenRef.current === utteranceToken) {
            setTrackedActiveSpeech(null, null);
          }
        };

        utterance.onend = clearIfCurrent;
        utterance.onerror = clearIfCurrent;
        setTrackedActiveSpeech(requestedActiveId, trimmedText);
      } else if (currentActiveId) {
        setTrackedActiveSpeech(null, null);
      }
    },
    [enabled, isSupported, language, rate, service, setTrackedActiveSpeech, stop],
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
        setTrackedActiveSpeech(null, null);
      }
    },
    [invalidateUtterance, service, setTrackedActiveSpeech],
  );

  const value = useMemo<SpeechContextValue>(() => {
    return { activeId, activeText, enabled, isSupported, language, rate, speak, stop };
  }, [activeId, activeText, enabled, isSupported, language, rate, speak, stop]);

  return <SpeechContext.Provider value={value}>{children}</SpeechContext.Provider>;
}

export function useSpeech() {
  const context = useContext(SpeechContext);

  if (!context) {
    throw new Error('useSpeech must be used within SpeechProvider');
  }

  return context;
}
