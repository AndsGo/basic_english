import { TextArea } from './ui/TextFields';
import { Button } from './ui/Button';
import { Checkbox, RadioGroup } from './ui/SelectionControls';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CapabilityCheckTask } from '../content/capabilityChecks';
import {
  createCapabilityCheckAttempt,
  getLatestCapabilityAttempts,
  type CapabilityCheckAttempt,
  type CapabilityClarity,
  type CapabilityHint,
} from '../domain/capabilityCheck';
import { useSpeech } from '../speech/SpeechProvider';
import type { ProgressRepository } from '../storage/progressRepository';

const resultLabels: Record<CapabilityCheckAttempt['result'], string> = {
  independent: 'Independent',
  'with-help': 'With help',
  'practice-again': 'Practice again',
};

function sentenceCount(text: string) {
  return text
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

function formatReviewDate(dueAt: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(dueAt));
}

export function CapabilityCheckPanel({
  task,
  repository,
  onCompletionChange,
  practiceMode = false,
}: {
  task: CapabilityCheckTask;
  repository: ProgressRepository;
  onCompletionChange?: (isComplete: boolean) => void;
  practiceMode?: boolean;
}) {
  const { activeId, enabled: speechEnabled, isSupported: speechSupported, speak, stop } = useSpeech();
  const [hasListened, setHasListened] = useState(false);
  const [listeningAnswer, setListeningAnswer] = useState('');
  const [writtenText, setWrittenText] = useState('');
  const [usedHints, setUsedHints] = useState<CapabilityHint[]>([]);
  const [visibleHints, setVisibleHints] = useState<CapabilityHint[]>([]);
  const [meaningComplete, setMeaningComplete] = useState(false);
  const [clarity, setClarity] = useState<CapabilityClarity>('unclear');
  const [savedAttempt, setSavedAttempt] = useState<CapabilityCheckAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const onCompletionChangeRef = useRef(onCompletionChange);

  useEffect(() => {
    onCompletionChangeRef.current = onCompletionChange;
  }, [onCompletionChange]);

  useEffect(() => {
    let isMounted = true;

    async function loadAttempt() {
      setIsLoading(true);
      if (practiceMode) {
        setSavedAttempt(null);
        onCompletionChangeRef.current?.(false);
        setIsLoading(false);
        return;
      }
      try {
        const attempts = await repository.listCapabilityCheckAttempts?.(task.capabilityId);
        if (!isMounted) return;
        const latest = getLatestCapabilityAttempts(attempts ?? [])[0] ?? null;
        setSavedAttempt(latest);
        onCompletionChangeRef.current?.(Boolean(latest));
      } catch {
        if (!isMounted) return;
        setSavedAttempt(null);
        onCompletionChangeRef.current?.(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadAttempt();
    return () => {
      isMounted = false;
      stop();
    };
  }, [practiceMode, repository, stop, task.capabilityId]);

  const isListeningCorrect = listeningAnswer === task.listening.answer;
  const currentSentenceCount = useMemo(() => sentenceCount(writtenText), [writtenText]);
  const canSave = hasListened && isListeningCorrect && currentSentenceCount >= task.minimumSentenceCount && !isSaving;

  const playListening = () => {
    speak(task.listening.script, `capability-listening-${task.id}`);
    setHasListened(true);
  };

  const revealHint = (hint: CapabilityHint) => {
    setVisibleHints((current) => Array.from(new Set([...current, hint])));
    setUsedHints((current) => Array.from(new Set([...current, hint])));
  };

  const resetForRetry = () => {
    stop();
    setHasListened(false);
    setListeningAnswer('');
    setWrittenText('');
    setUsedHints([]);
    setVisibleHints([]);
    setMeaningComplete(false);
    setClarity('unclear');
    setSavedAttempt(null);
    setSaveError(false);
    onCompletionChangeRef.current?.(false);
  };

  const saveAttempt = async () => {
    if (!canSave || !repository.saveCapabilityCheckAttempt) return;
    const attempt = createCapabilityCheckAttempt({
      capabilityId: task.capabilityId,
      taskId: task.id,
      dayId: task.dayId,
      listeningCorrect: isListeningCorrect,
      writtenText,
      usedHints,
      meaningComplete,
      clarity,
      now: new Date().toISOString(),
    });

    setIsSaving(true);
    setSaveError(false);
    try {
      await repository.saveCapabilityCheckAttempt(attempt);
      setSavedAttempt(attempt);
      onCompletionChangeRef.current?.(true);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="capability-check" aria-label={`${task.title} capability check`}>
        <h2>Capability check</h2>
        <p>Loading your latest check...</p>
      </section>
    );
  }

  if (savedAttempt) {
    return (
      <section className="capability-check capability-check--complete" aria-label={`${task.title} capability check`}>
        <div className="capability-check-heading">
          <div>
            <p className="eyebrow">Capability check</p>
            <h2>{task.title}</h2>
          </div>
          <strong className={`capability-result capability-result--${savedAttempt.result}`}>
            {resultLabels[savedAttempt.result]}
          </strong>
        </div>
        <p>{savedAttempt.writtenText}</p>
        <p className="muted">Next check: {formatReviewDate(savedAttempt.dueAt)}</p>
        <Button variant="secondary" type="button" onClick={resetForRetry}>
          Try again
        </Button>
      </section>
    );
  }

  return (
    <section className="capability-check" aria-label={`${task.title} capability check`}>
      <div className="capability-check-heading">
        <div>
          <p className="eyebrow">Capability check</p>
          <h2>{task.title}</h2>
        </div>
        <span className="capability-check-progress">Listen · Respond · Check</span>
      </div>
      <p>{task.mission}</p>

      <section className="capability-check-section">
        <div className="section-header">
          <h3>1. Listen</h3>
          {speechEnabled && speechSupported ? (
            <Button variant="secondary" type="button" className="capability-audio-button" onClick={playListening}>
              {activeId === `capability-listening-${task.id}` ? 'Stop audio' : 'Play mission audio'}
            </Button>
          ) : (
            <Button variant="secondary" type="button" className="capability-audio-button" onClick={() => setHasListened(true)}>
              Read listening text
            </Button>
          )}
        </div>
        {(!speechEnabled || !speechSupported) && hasListened && <p className="listening-fallback">{task.listening.script}</p>}
        <RadioGroup label={task.listening.question} name={task.id + '-listening'} value={listeningAnswer}
          options={task.listening.options.map(option => ({ value: option, label: option }))} onValueChange={setListeningAnswer} />
        <div className="capability-listening-feedback" aria-live="polite">
          {listeningAnswer && (
            <p className={isListeningCorrect ? 'answer-correct' : 'answer-review'}>
              {isListeningCorrect ? `Correct. ${task.listening.feedback}` : 'Listen again and choose another answer.'}
            </p>
          )}
        </div>
      </section>

      <section className="capability-check-section">
        <h3>2. Respond</h3>
        <p>{task.outputPrompt}</p>
        <div className="capability-hint-actions" aria-label="Optional help">
          <Button variant="quiet" type="button" onClick={() => revealHint('keywords')}>Show keywords</Button>
          <Button variant="quiet" type="button" onClick={() => revealHint('patterns')}>Show sentence starters</Button>
          <Button variant="quiet" type="button" onClick={() => revealHint('reference')}>Show example</Button>
        </div>
        {visibleHints.includes('keywords') && <p className="hint-content">Keywords: {task.keywords.join(', ')}</p>}
        {visibleHints.includes('patterns') && <p className="hint-content">Start with: {task.sentenceStarters.join(' / ')}</p>}
        {visibleHints.includes('reference') && <p className="hint-content">Example: {task.referenceAnswer}</p>}
        <TextArea label="Your answer" value={writtenText} onChange={(event) => setWrittenText(event.target.value)} rows={5} />
        <p className="capability-count" role="status">
          {currentSentenceCount} / {task.minimumSentenceCount} sentences
        </p>
      </section>

      <section className="capability-check-section">
        <h3>3. Check your meaning</h3>
        <ul className="capability-required-ideas">
          {task.requiredIdeas.map((idea) => <li key={idea}>{idea}</li>)}
        </ul>
        <Checkbox label="My answer includes all three ideas." checked={meaningComplete} onChange={event => setMeaningComplete(event.target.checked)} />
        <RadioGroup label="Could another person understand you?" name={task.id + '-clarity'} value={clarity}
          options={[{ value: 'clear', label: 'Clear' }, { value: 'partly-clear', label: 'Partly clear' }, { value: 'unclear', label: 'Not clear yet' }]}
          onValueChange={value => setClarity(value as CapabilityClarity)} />
      </section>

      {usedHints.length > 0 && <p className="capability-help-note">This check will be saved as With help when your meaning is clear.</p>}
      {saveError && <p role="alert">The capability check could not be saved. Try again.</p>}
      <Button variant="primary" type="button" disabled={!canSave} loading={isSaving} loadingLabel="Saving..." onClick={() => void saveAttempt()}>
        Save capability check
      </Button>
      {!canSave && (
        <p className="muted">Listen, choose the correct answer, and write {task.minimumSentenceCount} sentences to save this check.</p>
      )}
    </section>
  );
}
