import { useState } from 'react';
import type { Exercise } from '../domain/types';

export function ExerciseRenderer({ exercises }: { exercises: Exercise[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visibleReferences, setVisibleReferences] = useState<Record<string, boolean>>({});
  const drills = exercises.filter((exercise) => exercise.type !== 'translation');

  const setAnswer = (exerciseId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [exerciseId]: answer }));
  };

  const showReference = (exerciseId: string) => {
    setVisibleReferences((current) => ({ ...current, [exerciseId]: true }));
  };

  return (
    <div className="exercise-list">
      {drills.map((exercise) => (
        <article className="exercise-card" key={exercise.id}>
          {exercise.type === 'choice' && (
            <>
              <h3>{exercise.prompt}</h3>
              <div className="option-list">
                {exercise.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={answers[exercise.id] === option}
                    className={answers[exercise.id] === option ? 'selected-option' : ''}
                    onClick={() => setAnswer(exercise.id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {answers[exercise.id] && <p role="status">{answers[exercise.id] === exercise.correctOption ? 'Correct' : 'Try again'}</p>}
            </>
          )}

          {exercise.type === 'fill_blank' && (
            <>
              <h3>{exercise.prompt}</h3>
              <input
                aria-label={exercise.prompt}
                value={answers[exercise.id] ?? ''}
                onChange={(event) => setAnswer(exercise.id, event.target.value)}
              />
              {answers[exercise.id] && (
                <p role="status">
                  {exercise.acceptedAnswers.some(
                    (acceptedAnswer) => acceptedAnswer.trim().toLocaleLowerCase() === answers[exercise.id].trim().toLocaleLowerCase(),
                  )
                    ? 'Correct'
                    : 'Check the pattern and try again'}
                </p>
              )}
            </>
          )}

          {exercise.type === 'sentence_order' && (
            <>
              <h3>Put the words in order</h3>
              <p>{exercise.tokens.join(' / ')}</p>
              <button type="button" className="secondary-button" onClick={() => showReference(exercise.id)}>
                Show sentence order reference
              </button>
              {visibleReferences[exercise.id] && <p className="example">Answer: {exercise.finalSentence}</p>}
            </>
          )}

          {exercise.type === 'replacement' && (
            <>
              <h3>Make a sentence</h3>
              <p>{Object.values(exercise.slotValues).join(', ')}</p>
              <button type="button" className="secondary-button" onClick={() => showReference(exercise.id)}>
                Show replacement reference
              </button>
              {visibleReferences[exercise.id] && <p className="example">Reference: {exercise.referenceAnswer}</p>}
            </>
          )}
        </article>
      ))}
    </div>
  );
}
