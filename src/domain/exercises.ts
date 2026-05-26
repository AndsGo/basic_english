import type { Exercise } from './types';

export type ExerciseResult = 'correct' | 'incorrect' | 'self_mark_close' | 'self_mark_review';
export type ExerciseAnswer = string | string[];

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function checkExerciseAnswer(exercise: Exercise, answer: ExerciseAnswer): ExerciseResult {
  if (exercise.type === 'choice') {
    return answer === exercise.correctOption ? 'correct' : 'incorrect';
  }

  if (exercise.type === 'fill_blank') {
    if (typeof answer !== 'string') return 'incorrect';

    return exercise.acceptedAnswers.some((accepted) => normalizeText(accepted) === normalizeText(answer))
      ? 'correct'
      : 'incorrect';
  }

  if (exercise.type === 'sentence_order') {
    return Array.isArray(answer) && answer.join(' ') === exercise.correctOrder.join(' ') ? 'correct' : 'incorrect';
  }

  if (typeof answer !== 'string' || answer.trim().length === 0) return 'incorrect';

  return 'self_mark_close';
}

export function countSentences(text: string): number {
  return text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

export function summarizeDrillCompletion(exercises: Exercise[], answers: Record<string, ExerciseAnswer>) {
  const drills = exercises.filter((exercise) => exercise.type !== 'translation');
  const missingExerciseIds = drills
    .filter((exercise) => answers[exercise.id] === undefined || answers[exercise.id] === '')
    .map((exercise) => exercise.id);
  const incorrectExerciseIds = drills
    .filter((exercise) => answers[exercise.id] !== undefined && checkExerciseAnswer(exercise, answers[exercise.id]) === 'incorrect')
    .map((exercise) => exercise.id);

  return {
    isComplete: missingExerciseIds.length === 0,
    requiredCount: drills.length,
    answeredCount: drills.length - missingExerciseIds.length,
    missingExerciseIds,
    incorrectExerciseIds,
  };
}
