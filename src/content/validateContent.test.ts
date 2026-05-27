import { describe, expect, it } from 'vitest';
import type { Course, ScenarioCapability, ScenarioWeek } from '../domain/types';
import { basicEnglishCourse } from './course';
import { scenarioCapabilities, scenarioWeekMap } from './scenarioCapabilities';
import { sceneGoalsByDayId } from './sceneGoals';
import { week1Course } from './week1';
import {
  validateCourseContent,
  validateScenarioCapabilities,
  validateScenarioWeekMap,
  validateSceneGoals,
} from './validateContent';

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

  it('rejects a weekly check minimum sentence count above the template length', () => {
    const course = cloneCourse();
    const day = course.weeks[0].days[6];
    day.outputTask.template = ['My name is ___.'];
    day.weeklyCheckRubric!.pass.minimumSentenceCount = 2;

    expect(validateCourseContent(course).errors).toContain(
      'day-007 weekly check template has fewer sentences than the minimum sentence count',
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

describe('basicEnglishCourse V1.2', () => {
  it('contains Week 1 and a complete Week 2', () => {
    expect(basicEnglishCourse.weeks).toHaveLength(2);
    expect(basicEnglishCourse.weeks[1]).toMatchObject({
      id: 'week-02',
      number: 2,
      title: 'Home & Things',
    });
    expect(basicEnglishCourse.weeks[1].days.map((day) => day.id)).toEqual([
      'day-008',
      'day-009',
      'day-010',
      'day-011',
      'day-012',
      'day-013',
      'day-014',
    ]);
  });

  it('validates the combined course content', () => {
    expect(validateCourseContent(basicEnglishCourse).errors).toEqual([]);
  });

  it('keeps Week 2 learner-facing sentences within taught beginner language', () => {
    const day9 = basicEnglishCourse.weeks[1].days.find((day) => day.id === 'day-009');
    const day13 = basicEnglishCourse.weeks[1].days.find((day) => day.id === 'day-013');

    expect(day9).toBeDefined();
    expect(day13).toBeDefined();

    const day9Replacement = day9!.exercises.find((exercise) => exercise.id === 'day-009-replace-002');
    expect(day9Replacement).toMatchObject({
      type: 'replacement',
      referenceAnswer: 'There are books on my table.',
    });

    const day9Translation = day9!.exercises.find((exercise) => exercise.id === 'day-009-translation-001');
    expect(day9Translation).toMatchObject({
      type: 'translation',
      suggestedPatternIds: ['there-are'],
      referenceAnswers: ['There are books in my room. There are pens in my room.'],
    });

    expect(day13!.outputTask.template).toContain('This thing is good.');
    expect(day13!.outputTask.template).not.toContain('This thing is good for me.');
  });

  it('keeps weekly check templates long enough for their minimum sentence count', () => {
    const day14 = basicEnglishCourse.weeks[1].days.find((day) => day.id === 'day-014');

    expect(day14).toBeDefined();
    expect(day14!.weeklyCheckRubric).toBeDefined();
    expect(day14!.outputTask.template.length).toBeGreaterThanOrEqual(day14!.weeklyCheckRubric!.pass.minimumSentenceCount);
  });
});

describe('scenario capabilities', () => {
  function scenarioWeek(overrides: Partial<ScenarioWeek> = {}): ScenarioWeek {
    return {
      ...structuredClone(scenarioWeekMap[0]),
      ...overrides,
    };
  }

  function scenarioCapability(overrides: Partial<ScenarioCapability> = {}): ScenarioCapability {
    return {
      ...structuredClone(scenarioCapabilities[0]),
      ...overrides,
    };
  }

  it('defines the 12-week scenario roadmap', () => {
    expect(scenarioWeekMap).toHaveLength(12);
    expect(scenarioWeekMap[1]).toMatchObject({
      weekNumber: 2,
      theme: 'Home & Things',
    });
  });

  it('validates the 12-week scenario roadmap', () => {
    expect(validateScenarioWeekMap(scenarioWeekMap).errors).toEqual([]);
  });

  it('rejects duplicate, missing, or invalid roadmap week numbers', () => {
    const missingWeek = scenarioWeekMap.slice(0, 11);
    const duplicateWeek = scenarioWeekMap.map((week) => ({ ...week }));
    duplicateWeek[1].weekNumber = 1;
    const invalidWeek = [...scenarioWeekMap, scenarioWeek({ weekNumber: 13 })];

    expect(validateScenarioWeekMap(missingWeek).errors).toContain('Scenario roadmap must define weeks 1 through 12');
    expect(validateScenarioWeekMap(duplicateWeek).errors).toEqual(
      expect.arrayContaining([
        'Duplicate scenario week number: 1',
        'Scenario roadmap must define weeks 1 through 12',
      ]),
    );
    expect(validateScenarioWeekMap(invalidWeek).errors).toContain('Scenario week number must be between 1 and 12: 13');
  });

  it('rejects blank roadmap theme or expression outcome', () => {
    const weeks = scenarioWeekMap.map((week) => ({ ...week }));
    weeks[1].theme = ' ';
    weeks[2].expressionOutcome = '';

    expect(validateScenarioWeekMap(weeks).errors).toEqual(
      expect.arrayContaining([
        'Scenario week 2 is missing theme or expression outcome',
        'Scenario week 3 is missing theme or expression outcome',
      ]),
    );
  });

  it('references valid day IDs and has usable examples', () => {
    expect(validateScenarioCapabilities(scenarioCapabilities, basicEnglishCourse).errors).toEqual([]);
  });

  it('rejects duplicate or empty capability ids and missing metadata', () => {
    const capabilities = [
      scenarioCapability({ id: '', title: ' ', description: 'Description' }),
      scenarioCapability({ id: 'duplicate-capability' }),
      scenarioCapability({ id: 'duplicate-capability', description: ' ' }),
    ];

    expect(validateScenarioCapabilities(capabilities, basicEnglishCourse).errors).toEqual(
      expect.arrayContaining([
        'Scenario capability has empty id',
        ' is missing title or description',
        'Duplicate scenario capability id: duplicate-capability',
        'duplicate-capability is missing title or description',
      ]),
    );
  });

  it('rejects missing or invalid unlock day references', () => {
    const capabilities = [
      scenarioCapability({ id: 'missing-unlock-day', unlockedByDayIds: [] }),
      scenarioCapability({ id: 'invalid-unlock-day', unlockedByDayIds: ['day-999'] }),
    ];

    expect(validateScenarioCapabilities(capabilities, basicEnglishCourse).errors).toEqual(
      expect.arrayContaining([
        'missing-unlock-day must reference at least one unlock day',
        'invalid-unlock-day references missing day day-999',
      ]),
    );
  });

  it('rejects empty or blank example outputs', () => {
    const capabilities = [
      scenarioCapability({ id: 'missing-examples', exampleOutputs: [] }),
      scenarioCapability({ id: 'blank-example', exampleOutputs: [' '] }),
    ];

    expect(validateScenarioCapabilities(capabilities, basicEnglishCourse).errors).toEqual(
      expect.arrayContaining([
        'missing-examples must have non-empty example outputs',
        'blank-example must have non-empty example outputs',
      ]),
    );
  });
});

describe('scene goals', () => {
  it('validates scene goals for existing playable days', () => {
    const result = validateSceneGoals(sceneGoalsByDayId, basicEnglishCourse);

    expect(result.errors).toEqual([]);
  });

  it('reports scene goals that reference missing days', () => {
    const result = validateSceneGoals(
      {
        'day-999': {
          id: 'missing-day-scene',
          title: 'Missing Day',
          capability: 'I can describe a missing day.',
          templates: ['This is ____.'],
          guidedPrompts: ['Say one thing.'],
          scenePrompt: 'Describe one thing.',
          dialoguePrompts: ['Ask and answer one question.'],
        },
      },
      basicEnglishCourse,
    );

    expect(result.errors).toContain('Scene goal day-999 references missing day');
  });

  it('reports incomplete scene goals', () => {
    const result = validateSceneGoals(
      {
        'day-001': {
          id: '',
          title: '',
          capability: '',
          templates: [''],
          guidedPrompts: [],
          scenePrompt: '',
          dialoguePrompts: [],
        },
      },
      basicEnglishCourse,
    );

    expect(result.errors).toEqual([
      'Scene goal for day-001 is missing id, title, or capability',
      'Scene goal for day-001 must include non-empty templates',
      'Scene goal for day-001 must include non-empty guided prompts',
      'Scene goal for day-001 must include a scene prompt',
      'Scene goal for day-001 must include non-empty dialogue prompts',
    ]);
  });
});
