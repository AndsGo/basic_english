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
            <textarea
              aria-label={`Translation answer for ${exercise.id}`}
              value={draft.answer ?? ''}
              onChange={(event) => updateDraft(exercise.id, { ...draft, answer: event.target.value })}
              rows={4}
            />
            <button
              type="button"
              className="secondary-button"
              disabled={!draft.answer?.trim()}
              onClick={() => setShown((current) => ({ ...current, [exercise.id]: true }))}
            >
              Show reference
            </button>
            {shown[exercise.id] && (
              <>
                <ul>
                  {exercise.referenceAnswers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
                <fieldset className="self-rating">
                  <legend>Self mark</legend>
                  <label>
                    <input
                      type="radio"
                      name={`${exercise.id}-self-mark`}
                      checked={draft.selfMark === 'close'}
                      onChange={() => updateDraft(exercise.id, { ...draft, selfMark: 'close' })}
                    />{' '}
                    Close enough
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`${exercise.id}-self-mark`}
                      checked={draft.selfMark === 'review'}
                      onChange={() => updateDraft(exercise.id, { ...draft, selfMark: 'review' })}
                    />{' '}
                    Need review
                  </label>
                </fieldset>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
