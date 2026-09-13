import type { MasteryProgress } from './mastery';
import type { Course, Pattern, Word } from './types';

export type MasteryQuestion = {
  id: string;
  progressId: string;
  kind: 'word_definition_choice' | 'pattern_sentence_choice' | 'pattern_fill_blank' | 'pattern_sentence_order';
  prompt: string;
  options?: string[];
  tokens?: string[];
  correctAnswer: string | string[];
  correctAnswerText: string;
  explanation: string;
};

export class MasteryQuestionContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MasteryQuestionContentError';
  }
}

function stableHash(value: string): number {
  let hash = 0;
  for (const character of value) {
    hash = ((hash * 31) + character.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function rotate<T>(values: T[], seed: number): T[] {
  const offset = values.length === 0 ? 0 : seed % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

function distinctDistractors(values: string[], correctAnswer: string, count: number, seed: number): string[] {
  const candidates = [...new Set(values.filter((value) => value && value !== correctAnswer))];
  if (candidates.length < count) {
    throw new MasteryQuestionContentError('Not enough distinct English distractors to build a mastery question.');
  }
  return rotate(candidates, seed).slice(0, count);
}

function wordQuestion(progress: MasteryProgress, word: Word, course: Course): MasteryQuestion {
  if (!word.definition) {
    throw new MasteryQuestionContentError(`Word ${word.id} has no definition.`);
  }

  const options = rotate(
    [word.definition, ...distinctDistractors(course.words.map((candidate) => candidate.definition), word.definition, 2, stableHash(progress.id))],
    stableHash(`${progress.id}:options`),
  );

  return {
    id: `mastery-question-${progress.id}`,
    progressId: progress.id,
    kind: 'word_definition_choice',
    prompt: `What does "${word.text}" mean?`,
    options,
    correctAnswer: word.definition,
    correctAnswerText: word.definition,
    explanation: `"${word.text}" means ${word.definition}.`,
  };
}

function requireExample(pattern: Pattern): string {
  const example = pattern.examples[0];
  if (!example) {
    throw new MasteryQuestionContentError(`Pattern ${pattern.id} has no example sentence.`);
  }
  return example;
}

function patternDistractors(progress: MasteryProgress, pattern: Pattern, course: Course, example: string): string[] {
  return distinctDistractors(
    course.patterns.filter((candidate) => candidate.id !== pattern.id).map(requireExample),
    example,
    2,
    stableHash(progress.id),
  );
}

function patternQuestion(progress: MasteryProgress, pattern: Pattern, course: Course): MasteryQuestion {
  const example = requireExample(pattern);
  const kind = stableHash(progress.id) % 3;
  const base = {
    id: `mastery-question-${progress.id}`,
    progressId: progress.id,
    explanation: `This example uses the pattern "${pattern.title}".`,
  };

  if (kind === 0) {
    return {
      ...base,
      kind: 'pattern_sentence_choice',
      prompt: `Choose a sentence that uses "${pattern.title}".`,
      options: rotate([example, ...patternDistractors(progress, pattern, course, example)], stableHash(`${progress.id}:options`)),
      correctAnswer: example,
      correctAnswerText: example,
    };
  }

  const orderedTokens = example.split(/\s+/).filter(Boolean);
  if (orderedTokens.length < 2) {
    throw new MasteryQuestionContentError(`Pattern ${pattern.id} needs a multi-token example sentence.`);
  }

  if (kind === 1) {
    const blankIndex = stableHash(`${progress.id}:blank`) % orderedTokens.length;
    const blankedTokens = orderedTokens.map((token, index) => (index === blankIndex ? '___' : token));
    return {
      ...base,
      kind: 'pattern_fill_blank',
      prompt: `Complete the sentence: ${blankedTokens.join(' ')}`,
      correctAnswer: orderedTokens[blankIndex],
      correctAnswerText: orderedTokens[blankIndex],
    };
  }

  if (orderedTokens.length < 3 || orderedTokens.length > 5) {
    return {
      ...base,
      kind: 'pattern_sentence_choice',
      prompt: `Choose a sentence that uses "${pattern.title}".`,
      options: rotate([example, ...patternDistractors(progress, pattern, course, example)], stableHash(`${progress.id}:options`)),
      correctAnswer: example,
      correctAnswerText: example,
    };
  }

  const shuffledTokens = rotate(orderedTokens, 1 + (stableHash(`${progress.id}:order`) % (orderedTokens.length - 1)));
  return {
    ...base,
    kind: 'pattern_sentence_order',
    prompt: 'Put the sentence in the correct order.',
    tokens: shuffledTokens,
    correctAnswer: orderedTokens,
    correctAnswerText: example,
  };
}

export function buildMasteryQuestion(progress: MasteryProgress, course: Course): MasteryQuestion {
  if (progress.contentType === 'word') {
    const word = course.words.find((candidate) => candidate.id === progress.contentId);
    if (!word) {
      throw new MasteryQuestionContentError(`Word ${progress.contentId} was not found in the course.`);
    }
    return wordQuestion(progress, word, course);
  }

  const pattern = course.patterns.find((candidate) => candidate.id === progress.contentId);
  if (!pattern) {
    throw new MasteryQuestionContentError(`Pattern ${progress.contentId} was not found in the course.`);
  }
  return patternQuestion(progress, pattern, course);
}
