import { describe, expect, it } from 'vitest';
import { createPendingMasteryProgress, type MasteryProgress } from './mastery';
import { MasteryQuestionContentError, buildMasteryQuestion } from './masteryQuestions';
import type { Course } from './types';

const now = '2026-07-22T08:00:00.000Z';

const course: Course = {
  id: 'test-course',
  title: 'Test course',
  contentVersion: '1.0.0',
  schemaVersion: 1,
  weeks: [],
  words: [
    { id: 'name', text: 'name', category: 'general_thing', phonetic: '', definition: 'the title of a person or thing', chinese: '名字', example: 'My name is Li.', weekIntroduced: 1, tags: [] },
    { id: 'book', text: 'book', category: 'picturable_thing', phonetic: '', definition: 'a set of printed pages', chinese: '书', example: 'This is my book.', weekIntroduced: 1, tags: [] },
    { id: 'friend', text: 'friend', category: 'general_thing', phonetic: '', definition: 'a person you like and know', chinese: '朋友', example: 'This is my friend.', weekIntroduced: 1, tags: [] },
  ],
  patterns: [
    { id: 'i-am-from', title: 'I am from ___.', use: 'Say where you are from.', structure: 'I am from {place}.', examples: ['I am from China.'], slots: ['place'] },
    { id: 'this-is', title: 'This is ___.', use: 'Introduce something.', structure: 'This is {thing}.', examples: ['This is my book.'], slots: ['thing'] },
    { id: 'i-have', title: 'I have ___.', use: 'Say what you have.', structure: 'I have {thing}.', examples: ['I have a friend.'], slots: ['thing'] },
  ],
};

function progress(contentType: MasteryProgress['contentType'], contentId: string): MasteryProgress {
  return { ...createPendingMasteryProgress({ contentType, contentId, sourceDayId: 'day-001', now }), dueAt: now };
}

describe('buildMasteryQuestion', () => {
  it('builds an English word definition choice with exactly one correct definition', () => {
    const question = buildMasteryQuestion(progress('word', 'name'), course);

    expect(question.kind).toBe('word_definition_choice');
    expect(question.options).toContain('the title of a person or thing');
    expect(question.options).toHaveLength(3);
    expect(question.options?.filter((option) => option === question.correctAnswer)).toHaveLength(1);
    expect(question.correctAnswerText).toBe('the title of a person or thing');
    expect(question.prompt).not.toContain('名字');
    expect(question.explanation).not.toContain('名字');
  });

  it('uses a stable pattern question kind and builds only English question content', () => {
    const first = buildMasteryQuestion(progress('pattern', 'i-am-from'), course);
    const second = buildMasteryQuestion(progress('pattern', 'i-am-from'), course);

    expect(second).toEqual(first);
    expect(['pattern_sentence_choice', 'pattern_fill_blank', 'pattern_sentence_order']).toContain(first.kind);
    expect(JSON.stringify(first)).not.toContain('中国');
  });

  it('uses the target pattern example as the correct answer', () => {
    const question = buildMasteryQuestion(progress('pattern', 'this-is'), course);

    if (question.kind === 'pattern_sentence_choice') {
      expect(question.correctAnswer).toBe('This is my book.');
      expect(question.correctAnswerText).toBe('This is my book.');
      expect(question.options).toContain('This is my book.');
    }
    if (question.kind === 'pattern_fill_blank') {
      expect(question.correctAnswer).toBeTypeOf('string');
      expect(question.correctAnswerText).toBe(question.correctAnswer);
      expect(question.prompt).toContain('___');
    }
    if (question.kind === 'pattern_sentence_order') {
      expect(question.correctAnswer).toEqual(['This', 'is', 'my', 'book.']);
      expect(question.correctAnswerText).toBe('This is my book.');
      expect(question.tokens).toHaveLength(4);
    }
  });

  it('falls back to a non-order objective when an order sentence has more than five tokens', () => {
    const longOrderCourse: Course = {
      ...course,
      patterns: [
        ...course.patterns,
        {
          id: 'long-order',
          title: 'Long example',
          use: 'Test the order fallback.',
          structure: 'Long example',
          examples: ['I am very happy to be here today.'],
          slots: [],
        },
      ],
    };

    const question = buildMasteryQuestion(progress('pattern', 'long-order'), longOrderCourse);

    expect(question.kind).not.toBe('pattern_sentence_order');
    expect(question.correctAnswerText).toBe('I am very happy to be here today.');
  });

  it('uses sentence ordering only for an example with three to five tokens', () => {
    const shortOrderCourse: Course = {
      ...course,
      patterns: [
        ...course.patterns,
        {
          id: 'order-c',
          title: 'Short order',
          use: 'Test the order limit.',
          structure: 'Short order',
          examples: ['We are good friends.'],
          slots: [],
        },
      ],
    };

    const question = buildMasteryQuestion(progress('pattern', 'order-c'), shortOrderCourse);

    expect(question.kind).toBe('pattern_sentence_order');
    expect(question.tokens).toHaveLength(4);
    expect(question.correctAnswerText).toBe('We are good friends.');
  });

  it('throws a typed error when required course content is missing', () => {
    expect(() => buildMasteryQuestion(progress('word', 'missing'), course)).toThrow(MasteryQuestionContentError);
    expect(() => buildMasteryQuestion(progress('pattern', 'missing'), course)).toThrow(MasteryQuestionContentError);
  });
});
