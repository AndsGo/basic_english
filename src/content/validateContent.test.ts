import { describe, expect, it } from 'vitest';
import type { Course } from '../domain/types';
import { week1Course } from './week1';
import { validateCourseContent } from './validateContent';

function cloneCourse(): Course {
  return structuredClone(week1Course);
}

describe('week1Course', () => {
  it('has seven complete days with required learning assets', () => {
    const result = validateCourseContent(week1Course);

    expect(result.errors).toEqual([]);
    expect(week1Course.weeks[0].days).toHaveLength(7);
  });

  it('keeps Chinese text readable', () => {
    const serialized = JSON.stringify(week1Course);

    expect(serialized).not.toContain('\uFFFD');
    expect(serialized).not.toContain('\u95bf?');
    expect(serialized).not.toMatch(
      /\u8e47\u6aa4\u947e\u7d74\u941a\u73c5\u59d8\u6422\u6fde\u6ac3\u93bc\ue562\u95c1\u7c85\u95b8\u6b80\u95b9\u78e1\u95ba\u5255\u5a11\u6422\u940e\u6cd1\u95c2\u5008\u95ba\u577e\u9420\u565f\u95b9\u7c85\u741e\u6cd1\u5a34\u7218\u95bc\u7c85\u95b8\ue682\u59a4\u5008\u5a75\u5008\u93c9\ufe5f\u95b5?/,
    );
  });

  it('allows valid Chinese text containing busy and cat characters', () => {
    const course = cloneCourse();
    course.words[0].chinese = '忙猫';

    const result = validateCourseContent(course);

    expect(result.errors).not.toContain('Content contains invalid Chinese text or mojibake');
  });

  it('requires every word to include an English definition', () => {
    const course = cloneCourse();
    course.words[0].definition = '';

    expect(validateCourseContent(course).errors).toContain(
      `Word ${course.words[0].id} is missing text, definition, chinese, or example`,
    );
  });

  it('detects replacement characters and known mojibake sequences', () => {
    const course = cloneCourse();
    course.words[0].chinese = '鎴戠殑';
    course.words[1].chinese = 'bad � text';

    const result = validateCourseContent(course);

    expect(result.errors).toContain('Content contains invalid Chinese text or mojibake');
  });

  it('detects duplicate exercise ids during global id validation', () => {
    const course = cloneCourse();
    course.weeks[0].days[1].exercises[0].id = course.weeks[0].days[0].exercises[0].id;

    const result = validateCourseContent(course);

    expect(result.errors).toContain('Duplicate id: day-001-choice-001');
  });

  it('detects duplicate output task ids during global id validation', () => {
    const course = cloneCourse();
    course.weeks[0].days[1].outputTask.id = course.weeks[0].days[0].outputTask.id;

    const result = validateCourseContent(course);

    expect(result.errors).toContain('Duplicate id: day-001-output');
  });

  it('gives Day 7 a weekly check rubric matching the 0-2 spec intent', () => {
    const day7 = week1Course.weeks[0].days[6];

    expect(day7.weeklyCheckRubric).toEqual({
      scale: { min: 0, max: 2 },
      pass: {
        minimumTotalScore: 7,
        minimumMeaningScore: 1,
        minimumSentenceCount: 5,
      },
      criteria: [
        { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] },
        {
          id: 'sentence-control',
          label: 'Sentence control',
          scores: ['many missing parts', 'some complete sentences', 'mostly complete sentences'],
        },
        { id: 'target-patterns', label: 'Target patterns', scores: ['not used', 'used with help', 'used independently'] },
        { id: 'word-use', label: 'Word use', scores: ['few lesson words', 'some lesson words', 'several lesson words'] },
        { id: 'independence', label: 'Independence', scores: ['copied template', 'partly changed template', 'mostly own content'] },
      ],
    });
  });

  it('validates weekly check rubric integrity', () => {
    const course = cloneCourse();
    const rubric = course.weeks[0].days[6].weeklyCheckRubric!;
    const invalidScale = rubric.scale as unknown as { min: number; max: number };
    invalidScale.min = 1;
    invalidScale.max = 3;
    rubric.criteria = [
      { id: 'meaning', label: ' ', scores: ['hard', 'clear'] as unknown as [string, string, string] },
      { id: 'meaning', label: 'Duplicate meaning', scores: ['0', '1', '2'] },
    ];
    rubric.pass.minimumTotalScore = 0;
    rubric.pass.minimumMeaningScore = 3;
    rubric.pass.minimumSentenceCount = 0;

    expect(validateCourseContent(course).errors).toEqual(
      expect.arrayContaining([
        'day-007 weekly check rubric scale min must be 0',
        'day-007 weekly check rubric scale max must be 2',
        'day-007 weekly check rubric criterion meaning must have a non-blank label',
        'day-007 weekly check rubric has duplicate criterion id meaning',
        'day-007 weekly check rubric criterion meaning must have score levels for 0, 1, and 2',
        'day-007 weekly check rubric minimumTotalScore must be between 1 and 4',
        'day-007 weekly check rubric minimumMeaningScore must be between 0 and 2',
        'day-007 weekly check rubric minimumSentenceCount must be at least 1',
      ]),
    );
  });

  it('validates sentence order final sentence against correct order with punctuation normalization', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[2];
    if (exercise.type !== 'sentence_order') {
      throw new Error('Expected sentence order exercise');
    }
    exercise.finalSentence = 'I   am from China!';

    expect(validateCourseContent(course).errors).not.toContain(
      'day-001-order-001 sentence order exercise finalSentence must match correctOrder',
    );

    exercise.finalSentence = 'I am from Shanghai.';
    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-order-001 sentence order exercise finalSentence must match correctOrder');
  });

  it('validates replacement reference answer against the referenced pattern structure', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[3];
    if (exercise.type !== 'replacement') {
      throw new Error('Expected replacement exercise');
    }
    exercise.referenceAnswer = 'My name is Anna!';

    expect(validateCourseContent(course).errors).not.toContain(
      'day-001-replace-001 replacement exercise referenceAnswer must match pattern structure',
    );

    exercise.referenceAnswer = 'My name is Li.';
    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-replace-001 replacement exercise referenceAnswer must match pattern structure');
  });

  it('requires translation suggested patterns to be in the current day pattern ids', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[4];
    if (exercise.type !== 'translation') {
      throw new Error('Expected translation exercise');
    }
    exercise.suggestedPatternIds = ['i-am'];

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-translation-001 suggested pattern i-am must be included in day-001 patternIds');
  });

  it('requires weekly check rubric criteria', () => {
    const course = cloneCourse();
    const rubric = course.weeks[0].days[6].weeklyCheckRubric!;
    rubric.criteria = [];

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-007 weekly check rubric must have criteria');
  });

  it('validates choice exercise options and correct option', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[0];
    if (exercise.type !== 'choice') {
      throw new Error('Expected choice exercise');
    }
    exercise.options = ['Yes', 'Yes', ''];
    exercise.correctOption = 'No';

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-choice-001 choice exercise must have at least 2 non-empty unique options');
    expect(result.errors).toContain('day-001-choice-001 choice exercise correctOption must be included in options');
  });

  it('validates fill blank accepted answers', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[1];
    if (exercise.type !== 'fill_blank') {
      throw new Error('Expected fill blank exercise');
    }
    exercise.acceptedAnswers = ['  '];

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-fill-001 fill blank exercise must have non-blank accepted answers');
  });

  it('validates sentence order token consistency and final sentence', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[2];
    if (exercise.type !== 'sentence_order') {
      throw new Error('Expected sentence order exercise');
    }
    exercise.correctOrder = ['I', 'am', 'from', 'Shanghai'];
    exercise.finalSentence = ' ';

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-order-001 sentence order exercise tokens and correctOrder must contain the same tokens');
    expect(result.errors).toContain('day-001-order-001 sentence order exercise finalSentence must be non-blank');
  });

  it('validates replacement slots required by the referenced pattern', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[3];
    if (exercise.type !== 'replacement') {
      throw new Error('Expected replacement exercise');
    }
    exercise.slotValues = { wrong: 'Anna' };

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-replace-001 replacement exercise is missing slot value for name');
  });

  it('validates translation answers and suggested patterns', () => {
    const course = cloneCourse();
    const exercise = course.weeks[0].days[0].exercises[4];
    if (exercise.type !== 'translation') {
      throw new Error('Expected translation exercise');
    }
    exercise.referenceAnswers = [' '];
    exercise.suggestedPatternIds = [];

    const result = validateCourseContent(course);

    expect(result.errors).toContain('day-001-translation-001 translation exercise must have non-blank reference answers');
    expect(result.errors).toContain('day-001-translation-001 translation exercise must have suggested pattern ids');
  });
});
