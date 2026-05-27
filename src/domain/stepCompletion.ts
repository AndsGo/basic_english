import type { UserOutput } from '../storage/progressRepository';
import type { ExerciseAnswer } from './exercises';
import { getSceneOutputCompletion } from './sceneOutput';
import type { SceneOutput } from './types';

export type WordMark = 'known' | 'review';
export type TranslationSelfMark = 'close' | 'review';

export interface TranslationDraft {
  answer?: string;
  selfMark?: TranslationSelfMark;
}

export interface CompletionGate {
  isComplete: boolean;
  missingRequirements: string[];
}

function done(missingRequirements: string[]): CompletionGate {
  return { isComplete: missingRequirements.length === 0, missingRequirements };
}

function hasAnswerInput(answer: ExerciseAnswer | undefined): answer is ExerciseAnswer {
  if (answer === undefined) return false;
  if (typeof answer === 'string') return answer.trim().length > 0;

  return answer.length > 0;
}

export function getWordsCompletion(wordIds: string[], marks: Record<string, WordMark | undefined>): CompletionGate {
  const missing = wordIds.filter((wordId) => !marks[wordId]);
  return done(missing.map((wordId) => `Mark ${wordId} as Know or Review.`));
}

export function getPatternsCompletion(patternIds: string[], practicedPatternIds: Set<string>): CompletionGate {
  const missing = patternIds.filter((patternId) => !practicedPatternIds.has(patternId));
  return done(missing.map((patternId) => `Practice ${patternId}.`));
}

export function getDrillsCompletion(
  exerciseIds: string[],
  answers: Record<string, ExerciseAnswer | undefined>,
): CompletionGate {
  const missing = exerciseIds.filter((exerciseId) => !hasAnswerInput(answers[exerciseId]));
  return done(missing.map((exerciseId) => `Answer ${exerciseId}.`));
}

export function getTranslationCompletion(
  exerciseIds: string[],
  drafts: Record<string, TranslationDraft | undefined>,
): CompletionGate {
  const missing: string[] = [];
  for (const exerciseId of exerciseIds) {
    const draft = drafts[exerciseId];
    if (!draft?.answer?.trim()) missing.push(`Write an English sentence for ${exerciseId}.`);
    if (!draft?.selfMark) missing.push(`Self-mark ${exerciseId}.`);
  }
  return done(missing);
}

export function getOutputCompletion(output: UserOutput, requiredSentenceCount: number): CompletionGate {
  const missing: string[] = [];
  const checklist = output.checklist;

  if (output.sentenceCount < requiredSentenceCount) missing.push(`Write at least ${requiredSentenceCount} sentences.`);
  if (!checklist?.usedTargetPattern) missing.push("Check: I used today's pattern.");
  if (!checklist?.usedLessonWords) missing.push('Check: I used lesson words.');
  if (!checklist?.hasSubjects) missing.push('Check: Each sentence has a subject.');
  if (!checklist?.meaningIsClear) missing.push('Check: My meaning is clear.');
  if (!output.selfRating) missing.push('Choose a self rating.');
  return done(missing);
}

export function getSceneOutputStepCompletion(scene: SceneOutput): CompletionGate {
  return getSceneOutputCompletion(scene);
}
