import { describe, expect, it } from 'vitest';
import type { UserOutput } from '../storage/progressRepository';
import {
  getDrillsCompletion,
  getOutputCompletion,
  getPatternsCompletion,
  getSceneOutputStepCompletion,
  getTranslationCompletion,
  getWordsCompletion,
} from './stepCompletion';

describe('step completion gates', () => {
  it('requires every word to be marked know or review', () => {
    expect(getWordsCompletion(['name', 'am'], { name: 'known' }).isComplete).toBe(false);
    expect(getWordsCompletion(['name', 'am'], { name: 'known', am: 'review' })).toMatchObject({
      isComplete: true,
      missingRequirements: [],
    });
  });

  it('requires each pattern to be practiced', () => {
    expect(getPatternsCompletion(['i-am'], new Set()).isComplete).toBe(false);
    expect(getPatternsCompletion(['i-am'], new Set(['i-am'])).isComplete).toBe(true);
  });

  it('requires all drills to be answered', () => {
    expect(getDrillsCompletion(['a', 'b'], { a: 'answer' }).isComplete).toBe(false);
    expect(getDrillsCompletion(['a', 'b'], { a: 'answer', b: ['I', 'am'] }).isComplete).toBe(true);
    expect(getDrillsCompletion(['a'], { a: '   ' }).isComplete).toBe(false);
    expect(getDrillsCompletion(['a'], { a: [] }).isComplete).toBe(false);
  });

  it('requires translation answer and self-mark', () => {
    expect(getTranslationCompletion(['t1'], { t1: { answer: 'I am Li.' } }).isComplete).toBe(false);
    expect(getTranslationCompletion(['t1'], { t1: { answer: 'I am Li.', selfMark: 'close' } }).isComplete).toBe(true);
    expect(getTranslationCompletion(['t1'], {}).isComplete).toBe(false);
    expect(getTranslationCompletion(['t1'], { t1: { answer: '   ', selfMark: 'close' } }).isComplete).toBe(false);
  });

  it('requires sentence count, checklist, and self-rating for output', () => {
    const output: UserOutput = {
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li. I am from China. I study English. I am happy.',
      sentenceCount: 4,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      updatedAt: '2026-05-26T00:00:00.000Z',
    };

    expect(getOutputCompletion(output, 4).isComplete).toBe(true);
    expect(getOutputCompletion({ ...output, sentenceCount: 3 }, 4).isComplete).toBe(false);
    expect(getOutputCompletion({ ...output, checklist: { ...output.checklist, hasSubjects: false } }, 4).isComplete).toBe(
      false,
    );
    expect(getOutputCompletion({ ...output, selfRating: undefined } as unknown as UserOutput, 4).isComplete).toBe(false);
  });

  it('treats missing output checklist as incomplete without throwing', () => {
    const output = {
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li. I am from China. I study English. I am happy.',
      sentenceCount: 4,
      selfRating: 'ok',
      updatedAt: '2026-05-26T00:00:00.000Z',
    } as unknown as UserOutput;

    expect(() => getOutputCompletion(output, 4)).not.toThrow();
    expect(getOutputCompletion(output, 4)).toMatchObject({
      isComplete: false,
      missingRequirements: [
        "Check: I used today's pattern.",
        'Check: I used lesson words.',
        'Check: Each sentence has a subject.',
        'Check: My meaning is clear.',
      ],
    });
  });

  it('uses scene output completion requirements when a scene output exists', () => {
    const result = getSceneOutputStepCompletion({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', ''],
      sceneText: '',
      dialogue: '',
    });

    expect(result).toEqual({
      isComplete: false,
      missingRequirements: [
        'Write at least 4 scene sentences.',
        'Write the scene description.',
        'Write the dialogue.',
      ],
    });
  });
});
