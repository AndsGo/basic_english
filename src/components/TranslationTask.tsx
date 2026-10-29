import { TextArea } from './ui/TextFields';
import { Button } from './ui/Button';
import { RadioGroup } from './ui/SelectionControls';
import { useState } from 'react';
import type { TranslationExercise } from '../domain/types';
import type { TranslationDraft } from '../domain/stepCompletion';

export function TranslationTask({
  exercises,
  drafts: controlledDrafts,
  onDraftChange,
}: {
  exercises: TranslationExercise[];
  drafts?: Record<string, TranslationDraft | undefined>;
  onDraftChange?: (exerciseId: string, draft: TranslationDraft) => void;
}) {
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [localDrafts, setLocalDrafts] = useState<Record<string, TranslationDraft | undefined>>({});
  const drafts = controlledDrafts ?? localDrafts;

  const updateDraft = (exerciseId: string, draft: TranslationDraft) => {
    if (!controlledDrafts) setLocalDrafts((current) => ({ ...current, [exerciseId]: draft }));
    onDraftChange?.(exerciseId, draft);
  };

  return (
    <div className="exercise-list">
      {exercises.map((exercise) => {
        const draft = drafts[exercise.id] ?? {};

        return (
          <article className="exercise-card" key={exercise.id}>
            <h3>{exercise.chinesePrompt}</h3>
            <p>Core meaning: {exercise.coreMeaningHint}</p>
            <TextArea label="Your translation"
              aria-label={`Translation answer for ${exercise.id}`}
              value={draft.answer ?? ''}
              onChange={(event) => updateDraft(exercise.id, { ...draft, answer: event.target.value })}
              rows={4} />
            <Button variant="secondary"
              type="button"
              disabled={!draft.answer?.trim()}
              onClick={() => setShown((current) => ({ ...current, [exercise.id]: true }))}>
              Show reference
            </Button>
            {shown[exercise.id] && (
              <>
                <ul>
                  {exercise.referenceAnswers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
                <RadioGroup label="Self mark" name={exercise.id + '-self-mark'} value={draft.selfMark ?? ''}
                  options={[{ value: 'close', label: 'Close enough' }, { value: 'review', label: 'Need review' }]}
                  onValueChange={mark => updateDraft(exercise.id, { ...draft, selfMark: mark as 'close' | 'review' })} />
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
