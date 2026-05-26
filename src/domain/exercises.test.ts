import { describe, expect, it } from 'vitest';
import type { Exercise } from './types';
import { checkExerciseAnswer, countSentences, summarizeDrillCompletion } from './exercises';

describe('exercise rules', () => {
  const exercises: Exercise[] = [
    { type: 'choice', id: 'choice-1', prompt: 'Pick one', options: ['A', 'B'], correctOption: 'A' },
    { type: 'fill_blank', id: 'fill-1', prompt: 'I ___ happy.', acceptedAnswers: ['am'] },
    { type: 'sentence_order', id: 'order-1', tokens: ['am', 'I'], correctOrder: ['I', 'am'], finalSentence: 'I am.' },
    { type: 'replacement', id: 'replace-1', patternId: 'i-am', slotValues: { description: 'happy' }, referenceAnswer: 'I am happy.' },
    {
      type: 'translation',
      id: 'translation-1',
      chinesePrompt: '我很开心。',
      coreMeaningHint: 'Say you are happy.',
      suggestedPatternIds: ['i-am'],
      referenceAnswers: ['I am happy.'],
    },
  ];

  it('checks choice and fill blank answers', () => {
    expect(checkExerciseAnswer(exercises[0], 'A')).toBe('correct');
    expect(checkExerciseAnswer(exercises[0], 'B')).toBe('incorrect');
    expect(checkExerciseAnswer(exercises[1], ' AM ')).toBe('correct');
    expect(checkExerciseAnswer(exercises[1], 'is')).toBe('incorrect');
  });

  it('checks sentence order answers from selected tokens', () => {
    expect(checkExerciseAnswer(exercises[2], ['I', 'am'])).toBe('correct');
    expect(checkExerciseAnswer(exercises[2], ['am', 'I'])).toBe('incorrect');
  });

  it('treats replacement and translation as self-marked after user input', () => {
    expect(checkExerciseAnswer(exercises[3], 'I am happy.')).toBe('self_mark_close');
    expect(checkExerciseAnswer(exercises[4], 'I am happy.')).toBe('self_mark_close');
    expect(checkExerciseAnswer(exercises[4], '')).toBe('incorrect');
  });

  it('counts simple English sentences', () => {
    expect(countSentences('My name is Li. I am from China.\nI study English')).toBe(3);
    expect(countSentences('')).toBe(0);
  });

  it('summarizes drill completion', () => {
    const summary = summarizeDrillCompletion(exercises, {
      'choice-1': 'B',
      'fill-1': 'am',
      'order-1': ['I', 'am'],
      'replace-1': 'I am happy.',
    });

    expect(summary.isComplete).toBe(true);
    expect(summary.missingExerciseIds).toEqual([]);
    expect(summary.incorrectExerciseIds).toEqual(['choice-1']);
  });
});
