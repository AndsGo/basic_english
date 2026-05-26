import { useState } from 'react';
import type { TranslationExercise } from '../domain/types';

export function TranslationTask({ exercises }: { exercises: TranslationExercise[] }) {
  const [shown, setShown] = useState<Record<string, boolean>>({});

  return (
    <div className="exercise-list">
      {exercises.map((exercise) => (
        <article className="exercise-card" key={exercise.id}>
          <h3>{exercise.chinesePrompt}</h3>
          <p>Core meaning: {exercise.coreMeaningHint}</p>
          <button type="button" className="secondary-button" onClick={() => setShown((current) => ({ ...current, [exercise.id]: true }))}>
            Show reference
          </button>
          {shown[exercise.id] && (
            <ul>
              {exercise.referenceAnswers.map((answer) => (
                <li key={answer}>{answer}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
