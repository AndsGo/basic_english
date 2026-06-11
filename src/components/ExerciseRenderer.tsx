import { useState } from 'react';
import type { Exercise } from '../domain/types';
import { checkExerciseAnswer, type ExerciseAnswer, type ExerciseResult } from '../domain/exercises';

function stringAnswer(answer: ExerciseAnswer | undefined): string {
  return typeof answer === 'string' ? answer : '';
}

function tokenAnswer(answer: ExerciseAnswer | undefined): string[] {
  return Array.isArray(answer) ? answer : [];
}

function tokenOccurrence(tokens: string[], token: string, index: number): number {
  return tokens.slice(0, index + 1).filter((item) => item === token).length;
}

function isTokenSelected(selectedTokens: string[], tokens: string[], token: string, index: number): boolean {
  return selectedTokens.filter((item) => item === token).length >= tokenOccurrence(tokens, token, index);
}

export function ExerciseRenderer({
  exercises,
  answers: controlledAnswers,
  onAnswer,
}: {
  exercises: Exercise[];
  answers?: Record<string, ExerciseAnswer | undefined>;
  onAnswer?: (exerciseId: string, answer: ExerciseAnswer, result: ExerciseResult) => void;
}) {
  const [localAnswers, setLocalAnswers] = useState<Record<string, ExerciseAnswer | undefined>>({});
  const [visibleReferences, setVisibleReferences] = useState<Record<string, boolean>>({});
  const drills = exercises.filter((exercise) => exercise.type !== 'translation');
  const answers = controlledAnswers ?? localAnswers;

  const setAnswer = (exercise: Exercise, answer: ExerciseAnswer) => {
    const result = checkExerciseAnswer(exercise, answer);
    if (!controlledAnswers) setLocalAnswers((current) => ({ ...current, [exercise.id]: answer }));
    onAnswer?.(exercise.id, answer, result);
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
                    onClick={() => setAnswer(exercise, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {answers[exercise.id] && (
                <p role="status">
                  {checkExerciseAnswer(exercise, answers[exercise.id] ?? '') === 'correct' ? 'Correct' : 'Try again'}
                </p>
              )}
            </>
          )}

          {exercise.type === 'fill_blank' && (
            <>
              <h3>{exercise.prompt}</h3>
              <input
                aria-label={exercise.prompt}
                value={stringAnswer(answers[exercise.id])}
                onChange={(event) => setAnswer(exercise, event.target.value)}
              />
              {answers[exercise.id] && (
                <p role="status">
                  {checkExerciseAnswer(exercise, stringAnswer(answers[exercise.id])) === 'correct'
                    ? 'Correct'
                    : 'Check the pattern and try again'}
                </p>
              )}
            </>
          )}

          {exercise.type === 'sentence_order' && (
            <>
              <h3>Put the words in order</h3>
              <div className="option-list">
                {exercise.tokens.map((token, index) => {
                  const selectedTokens = tokenAnswer(answers[exercise.id]);
                  const isSelected = isTokenSelected(selectedTokens, exercise.tokens, token, index);

                  return (
                    <button
                      type="button"
                      key={`${exercise.id}-${token}-${index}`}
                      className={isSelected ? 'selected-order-token' : ''}
                      disabled={isSelected}
                      onClick={() => setAnswer(exercise, [...selectedTokens, token])}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>
              <p className="example" aria-label="Selected sentence">
                {tokenAnswer(answers[exercise.id]).join(' ')}
              </p>
              {answers[exercise.id] && (
                <p role="status">
                  {checkExerciseAnswer(exercise, tokenAnswer(answers[exercise.id])) === 'correct' ? 'Correct' : 'Try again'}
                </p>
              )}
              <button type="button" className="secondary-button" onClick={() => setAnswer(exercise, [])}>
                Clear sentence
              </button>
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
              <input
                aria-label="Replacement answer"
                value={stringAnswer(answers[exercise.id])}
                onChange={(event) => setAnswer(exercise, event.target.value)}
              />
              <button type="button" className="secondary-button" onClick={() => showReference(exercise.id)}>
                Show replacement reference
              </button>
              {answers[exercise.id] && <p role="status">Answer saved</p>}
              {visibleReferences[exercise.id] && <p className="example">Reference: {exercise.referenceAnswer}</p>}
            </>
          )}
        </article>
      ))}
    </div>
  );
}
