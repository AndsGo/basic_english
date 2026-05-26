import { useEffect, useState } from 'react';
import type { DayProgress } from '../domain/progress';
import type { SpeechRate } from '../speech/speechService';
import type { ProgressRepository, UserOutput } from '../storage/progressRepository';

export function MePage({
  repository,
  showChineseHelp = false,
  onShowChineseHelpChange,
  readingEnabled = true,
  onReadingEnabledChange,
  speechRate = 'normal',
  onSpeechRateChange,
}: {
  repository: ProgressRepository;
  showChineseHelp?: boolean;
  onShowChineseHelpChange?: (showChineseHelp: boolean) => void;
  readingEnabled?: boolean;
  onReadingEnabledChange?: (readingEnabled: boolean) => void;
  speechRate?: SpeechRate;
  onSpeechRateChange?: (speechRate: SpeechRate) => void;
}) {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [output, setOutput] = useState<UserOutput | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      try {
        const [savedDays, savedOutput] = await Promise.all([
          repository.listDayProgress(),
          repository.getUserOutput('day-001'),
        ]);

        if (!isMounted) return;
        setDays(savedDays);
        setOutput(savedOutput);
        setLoadError(false);
      } catch {
        if (!isMounted) return;
        setDays([]);
        setOutput(null);
        setLoadError(true);
      }
    }

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const completedDayCount = days.filter((day) => day.status === 'completed').length;
  const hasSettings = Boolean(onShowChineseHelpChange || onReadingEnabledChange || onSpeechRateChange);

  return (
    <section className="panel">
      <h2>My Progress</h2>
      {loadError && <p role="alert">Progress could not be loaded.</p>}
      <p>Completed days: {completedDayCount}</p>
      {hasSettings && (
        <section>
          <h3>Settings</h3>
          {onShowChineseHelpChange && (
            <label>
              <input
                type="checkbox"
                checked={showChineseHelp}
                onChange={(event) => onShowChineseHelpChange(event.target.checked)}
              />{' '}
              Show Chinese help
            </label>
          )}
          {onReadingEnabledChange && (
            <label>
              <input
                type="checkbox"
                checked={readingEnabled}
                onChange={(event) => onReadingEnabledChange(event.target.checked)}
              />{' '}
              Enable reading aloud
            </label>
          )}
          {onSpeechRateChange && (
            <fieldset className="self-rating">
              <legend>Voice speed</legend>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  value="normal"
                  checked={speechRate === 'normal'}
                  onChange={() => onSpeechRateChange('normal')}
                />{' '}
                Normal
              </label>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  value="slow"
                  checked={speechRate === 'slow'}
                  onChange={() => onSpeechRateChange('slow')}
                />{' '}
                Slow
              </label>
            </fieldset>
          )}
        </section>
      )}
      <section>
        <h3>Day 1 Output</h3>
        {output?.text ? <p className="saved-output">{output.text}</p> : <p>No Day 1 output saved yet.</p>}
      </section>
    </section>
  );
}
