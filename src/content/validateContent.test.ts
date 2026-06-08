import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Course, SceneRemixTask, ScenarioCapability, ScenarioWeek } from '../domain/types';
import { isAllowedBasicEnglishToken, tokenizeBasicEnglishText, validateBasicEnglishVocabulary } from './basicEnglish850';
import { basicEnglishCourse } from './course';
import { pictureDescribeTasksByDayId } from './pictureDescribeTasks';
import { scenarioCapabilities, scenarioWeekMap } from './scenarioCapabilities';
import { sceneRemixTasksByDayId } from './sceneRemixTasks';
import { sceneGoalsByDayId } from './sceneGoals';
import { week1Course } from './week1';
import {
  validateCourseContent,
  validateScenarioCapabilities,
  validateScenarioWeekMap,
  validateSceneGoals,
  validateSceneRemixTasks,
} from './validateContent';
import {
  validWordImageKinds,
  validWordImageVisualStyles,
  wordFlashcardImages,
  wordImageAssets,
  wordImageVisualStyleByWordId,
} from './wordFlashcardImages';

function cloneCourse(): Course {
  return structuredClone(week1Course);
}

function validateBasicEnglishTexts(texts: Array<{ text: string; label: string }>): string[] {
  const errors: string[] = [];

  for (const { text, label } of texts) {
    for (const token of tokenizeBasicEnglishText(text)) {
      if (!isAllowedBasicEnglishToken(token)) {
        errors.push(`Non-Basic English word "${token}" in ${label}`);
      }
    }
  }

  return [...new Set(errors)];
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

describe('basicEnglishCourse V1.10', () => {
  it('contains Week 1 and a complete Week 2', () => {
    expect(basicEnglishCourse.weeks.length).toBeGreaterThanOrEqual(2);
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

  it('includes playable Week 3 and Week 4 content for V1.9', () => {
    const result = validateCourseContent(basicEnglishCourse);

    expect(result.errors).toEqual([]);
    expect(basicEnglishCourse.weeks.slice(0, 4).map((week) => week.days.length)).toEqual([7, 7, 7, 7]);
    expect(basicEnglishCourse.weeks[2]).toMatchObject({
      id: 'week-03',
      number: 3,
      title: 'Daily Routine & Time',
    });
    expect(basicEnglishCourse.weeks[3]).toMatchObject({
      id: 'week-04',
      number: 4,
      title: 'Food, Shopping & Needs',
    });
    expect(basicEnglishCourse.weeks[2].days[0]).toMatchObject({ id: 'day-015', dayNumber: 15 });
    expect(basicEnglishCourse.weeks[3].days[6]).toMatchObject({ id: 'day-028', dayNumber: 28 });
  });

  it('includes complete Week 5 and Week 6 course content for V1.10', () => {
    const result = validateCourseContent(basicEnglishCourse);
    const week5 = basicEnglishCourse.weeks[4];
    const week6 = basicEnglishCourse.weeks[5];
    const newDays = basicEnglishCourse.weeks.slice(4, 6).flatMap((week) => week.days);

    expect(result.errors).toEqual([]);
    expect(basicEnglishCourse.contentVersion).toBe('1.10.0');
    expect(basicEnglishCourse.weeks).toHaveLength(6);
    expect(basicEnglishCourse.weeks.map((week) => week.days.length)).toEqual([7, 7, 7, 7, 7, 7]);
    expect(week5).toMatchObject({
      id: 'week-05',
      number: 5,
      title: 'Going Out for an Errand',
    });
    expect(week6).toMatchObject({
      id: 'week-06',
      number: 6,
      title: 'Problems Outside',
    });
    expect(week5.days[0]).toMatchObject({ id: 'day-029', dayNumber: 29 });
    expect(week6.days[6]).toMatchObject({ id: 'day-042', dayNumber: 42 });
    expect(newDays.map((day) => day.id)).toEqual([
      'day-029',
      'day-030',
      'day-031',
      'day-032',
      'day-033',
      'day-034',
      'day-035',
      'day-036',
      'day-037',
      'day-038',
      'day-039',
      'day-040',
      'day-041',
      'day-042',
    ]);

    for (const day of newDays) {
      const translationCount = day.exercises.filter((exercise) => exercise.type === 'translation').length;
      const expectedStoryMode = day.id === 'day-035' || day.id === 'day-042' ? 'recap' : 'sentence';

      expect(day.wordIds.length, `${day.id} word count`).toBeGreaterThanOrEqual(6);
      expect(day.patternIds.length, `${day.id} pattern count`).toBeGreaterThanOrEqual(1);
      expect(day.exercises.length, `${day.id} exercise count`).toBeGreaterThanOrEqual(5);
      expect(translationCount, `${day.id} translation count`).toBeGreaterThanOrEqual(1);
      expect(day.outputTask.requiredSentenceCount, `${day.id} output sentences`).toBeGreaterThanOrEqual(4);
      expect(day.outputTask.storyMode, `${day.id} story mode`).toBe(expectedStoryMode);
      expect(day.outputTask.storyPrompt?.trim(), `${day.id} story prompt`).toBeTruthy();
    }
  });

  it('uses Chinese learner prompts for Week 5 and Week 6 translation exercises', () => {
    const newDays = basicEnglishCourse.weeks.slice(4, 6).flatMap((week) => week.days);

    for (const day of newDays) {
      const translationExercises = day.exercises.filter((exercise) => exercise.type === 'translation');

      for (const exercise of translationExercises) {
        expect(exercise.chinesePrompt, `${exercise.id} Chinese prompt`).toMatch(/\p{Script=Han}/u);
        expect(exercise.chinesePrompt, `${exercise.id} Chinese prompt`).not.toMatch(/^[\x00-\x7F]+$/);
      }
    }
  });

  it('gives every Week 3 and Week 4 day a complete Today content set', () => {
    const newDays = basicEnglishCourse.weeks.slice(2, 4).flatMap((week) => week.days);

    expect(newDays.map((day) => day.id)).toEqual([
      'day-015',
      'day-016',
      'day-017',
      'day-018',
      'day-019',
      'day-020',
      'day-021',
      'day-022',
      'day-023',
      'day-024',
      'day-025',
      'day-026',
      'day-027',
      'day-028',
    ]);

    for (const day of newDays) {
      const translationCount = day.exercises.filter((exercise) => exercise.type === 'translation').length;

      expect(day.wordIds.length, `${day.id} word count`).toBeGreaterThanOrEqual(6);
      expect(day.patternIds.length, `${day.id} pattern count`).toBeGreaterThanOrEqual(1);
      expect(day.exercises.length, `${day.id} exercise count`).toBeGreaterThanOrEqual(5);
      expect(translationCount, `${day.id} translation count`).toBeGreaterThanOrEqual(1);
      expect(day.outputTask.requiredSentenceCount, `${day.id} output sentences`).toBeGreaterThanOrEqual(4);
      expect(sceneRemixTasksByDayId[day.id]?.length, `${day.id} remix task`).toBeGreaterThanOrEqual(1);
      expect(pictureDescribeTasksByDayId[day.id], `${day.id} picture task`).toBeDefined();
    }
  });

  it('adds image-backed flashcards for every Week 3 and Week 4 word', () => {
    const newWords = basicEnglishCourse.words.filter((word) => word.weekIntroduced === 3 || word.weekIntroduced === 4);

    expect(newWords.length).toBeGreaterThanOrEqual(70);

    for (const word of newWords) {
      expect(wordFlashcardImages[word.id], `${word.id} image`).toBeDefined();
      expect(wordImageVisualStyleByWordId[word.id], `${word.id} visual style`).toBeDefined();
    }
  });

  it('keeps Day 42 as the course completion day', () => {
    const allDays = basicEnglishCourse.weeks.flatMap((week) => week.days);

    expect(allDays.at(-1)?.id).toBe('day-042');
    expect(allDays.at(-1)?.weeklyCheckRubric).toBeDefined();
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

  it('has a flashcard image for every course word', () => {
    const missingWordIds = basicEnglishCourse.words
      .map((word) => word.id)
      .filter((wordId) => !wordFlashcardImages[wordId]);

    expect(missingWordIds).toEqual([]);
  });

  it('keeps word image metadata aligned with course words', () => {
    const courseWordIds = new Set(basicEnglishCourse.words.map((word) => word.id));
    const assetWordIds = wordImageAssets.map((asset) => asset.wordId);

    expect(new Set(assetWordIds).size).toBe(assetWordIds.length);
    expect(assetWordIds.filter((wordId) => !courseWordIds.has(wordId))).toEqual([]);
    expect(assetWordIds.sort()).toEqual([...courseWordIds].sort());
  });

  it('assigns a visual style to every course word image', () => {
    const courseWordIds = basicEnglishCourse.words.map((word) => word.id);
    const missingVisualStyleWordIds = courseWordIds.filter((wordId) => !wordImageVisualStyleByWordId[wordId]);

    expect(missingVisualStyleWordIds).toEqual([]);
    expect(Object.keys(wordImageVisualStyleByWordId).sort()).toEqual([...courseWordIds].sort());
  });

  it('uses valid word image taxonomy metadata', () => {
    wordImageAssets.forEach((asset) => {
      expect(validWordImageKinds).toContain(asset.kind);
      expect(['none', 'english-keyword']).toContain(asset.labelPolicy);
      expect(asset.prompt.trim()).toBeTruthy();
      expect(asset.image).toMatch(/\S/);
    });
  });

  it('uses valid word image visual styles', () => {
    wordImageAssets.forEach((asset) => {
      expect(validWordImageVisualStyles).toContain(asset.visualStyle);
    });
  });

  it('limits English keyword labels to grammar cards', () => {
    const nonGrammarWithEnglishLabels = wordImageAssets
      .filter((asset) => asset.visualStyle !== 'grammar' && asset.labelPolicy !== 'none')
      .map((asset) => asset.wordId);
    const grammarWithoutEnglishLabels = wordImageAssets
      .filter((asset) => asset.visualStyle === 'grammar' && asset.labelPolicy !== 'english-keyword')
      .map((asset) => asset.wordId);

    expect(nonGrammarWithEnglishLabels).toEqual([]);
    expect(grammarWithoutEnglishLabels).toEqual([]);
  });

  it('uses distinct image files for Week 3 and Week 4 flashcards', () => {
    const newWordIds = new Set(
      basicEnglishCourse.words.filter((word) => word.weekIntroduced === 3 || word.weekIntroduced === 4).map((word) => word.id),
    );
    const hashesByWordId = wordImageAssets
      .filter((asset) => newWordIds.has(asset.wordId))
      .map((asset) => {
        const bytes = readFileSync(join(process.cwd(), 'src', 'assets', 'word-flashcards', `${asset.wordId}.png`));
        return [asset.wordId, createHash('sha256').update(bytes).digest('hex')] as const;
      });
    const duplicateWordIds = hashesByWordId
      .filter(([_wordId, hash], index) => hashesByWordId.findIndex(([_otherWordId, otherHash]) => otherHash === hash) !== index)
      .map(([wordId]) => wordId);

    expect(duplicateWordIds).toEqual([]);
  });
});

describe('Basic English 850 validation', () => {
  function cloneBasicEnglishCourse(): Course {
    return structuredClone(basicEnglishCourse);
  }

  it('validates the existing shipped basicEnglishCourse', () => {
    expect(validateBasicEnglishVocabulary(basicEnglishCourse)).toEqual([]);
  });

  it('validates learner-facing scene goals and remix tasks', () => {
    const taskFourDayIds = new Set(
      basicEnglishCourse.weeks.slice(4, 6).flatMap((week) => week.days.map((day) => day.id)),
    );
    const scenarioWeekTexts = scenarioWeekMap
      .filter((week) => week.weekNumber === 5 || week.weekNumber === 6)
      .flatMap((week) => [
        { text: week.theme, label: `scenario week ${week.weekNumber} theme` },
        { text: week.expressionOutcome, label: `scenario week ${week.weekNumber} expression outcome` },
      ]);
    const scenarioCapabilityTexts = scenarioCapabilities
      .filter((capability) => capability.id === 'errand-story' || capability.id === 'outside-problems')
      .flatMap((capability) => [
        { text: capability.title, label: `scenario capability ${capability.id} title` },
        { text: capability.description, label: `scenario capability ${capability.id} description` },
        ...capability.exampleOutputs.map((text, index) => ({
          text,
          label: `scenario capability ${capability.id} example ${index + 1}`,
        })),
      ]);
    const sceneGoalTexts = Object.entries(sceneGoalsByDayId)
      .filter(([dayId]) => taskFourDayIds.has(dayId))
      .flatMap(([dayId, sceneGoal]) => [
        { text: sceneGoal.title, label: `${dayId} scene goal title` },
        { text: sceneGoal.capability, label: `${dayId} scene goal capability` },
        ...sceneGoal.templates.map((text, index) => ({ text, label: `${dayId} scene goal template ${index + 1}` })),
        ...sceneGoal.guidedPrompts.map((text, index) => ({ text, label: `${dayId} scene goal guided prompt ${index + 1}` })),
        { text: sceneGoal.scenePrompt, label: `${dayId} scene goal scene prompt` },
        ...sceneGoal.dialoguePrompts.map((text, index) => ({ text, label: `${dayId} scene goal dialogue prompt ${index + 1}` })),
      ]);
    const remixTaskTexts = Object.entries(sceneRemixTasksByDayId).flatMap(([dayId, tasks]) =>
      taskFourDayIds.has(dayId) ? (tasks ?? []).flatMap((task) => [
        { text: task.prompt, label: `${dayId} remix ${task.id} prompt` },
        ...(task.source ? [{ text: task.source, label: `${dayId} remix ${task.id} source` }] : []),
        ...task.referenceAnswers.map((text, index) => ({ text, label: `${dayId} remix ${task.id} reference ${index + 1}` })),
      ]) : [],
    );

    expect(validateBasicEnglishTexts([...scenarioWeekTexts, ...scenarioCapabilityTexts, ...sceneGoalTexts, ...remixTaskTexts])).toEqual([]);
  });

  it('validates Week 5 and Week 6 picture task visible text', () => {
    const weekFiveAndSixDayIds = new Set(
      basicEnglishCourse.weeks.slice(4, 6).flatMap((week) => week.days.map((day) => day.id)),
    );
    const pictureTaskTexts = Object.entries(pictureDescribeTasksByDayId)
      .filter(([dayId]) => weekFiveAndSixDayIds.has(dayId))
      .flatMap(([dayId, task]) => [
        { text: task.title, label: `${dayId} picture title` },
        { text: task.goal, label: `${dayId} picture goal` },
        ...task.targetWords.map((text, index) => ({ text, label: `${dayId} picture target word ${index + 1}` })),
        ...task.suggestedPatterns.map((text, index) => ({ text, label: `${dayId} picture suggested pattern ${index + 1}` })),
        ...task.simpleVersion.map((text, index) => ({ text, label: `${dayId} picture simple version ${index + 1}` })),
      ]);

    expect(validateBasicEnglishTexts(pictureTaskTexts)).toEqual([]);
  });

  it('reports a non-Basic English word added as course word text', () => {
    const course = cloneBasicEnglishCourse();
    course.words.push({
      ...course.words[0],
      id: 'airport',
      text: 'airport',
    });

    expect(validateBasicEnglishVocabulary(course)).toContain('Non-Basic English word "airport" in word airport text');
  });

  it('reports non-Basic English words in word examples and output templates', () => {
    const course = cloneBasicEnglishCourse();
    course.words[0].example = 'I visit a museum.';
    course.weeks[0].days[0].outputTask.template[0] = 'I visit a museum.';

    expect(validateBasicEnglishVocabulary(course)).toEqual(
      expect.arrayContaining([
        'Non-Basic English word "visit" in word name example',
        'Non-Basic English word "museum" in word name example',
        'Non-Basic English word "visit" in day-001 output template',
        'Non-Basic English word "museum" in day-001 output template',
      ]),
    );
  });

  it('reports non-Basic English words in pattern use text', () => {
    const course = cloneBasicEnglishCourse();
    course.patterns[0].use = 'Use museum language.';

    expect(validateBasicEnglishVocabulary(course)).toEqual(
      expect.arrayContaining([
        'Non-Basic English word "museum" in pattern my-name-is use',
      ]),
    );
  });

  it('allows simple inflections from Basic English base words', () => {
    const course = cloneBasicEnglishCourse();
    course.words[0].example = 'I walked home.';
    course.words[1].example = 'I am walking home.';
    course.words[2].example = 'I have books.';

    expect(validateBasicEnglishVocabulary(course)).toEqual([]);
  });

  it('allows doubled-consonant inflections from Basic English base words', () => {
    const course = cloneBasicEnglishCourse();
    course.words[0].example = 'I am running.';
    course.words[1].example = 'I stopped here.';
    course.words[2].example = 'I am swimming.';
    course.patterns[0].examples = ['I am getting a book.'];
    course.weeks[0].days[0].outputTask.template[0] = 'I am putting a book here.';

    expect(validateBasicEnglishVocabulary(course)).toEqual([]);
  });

  it('splits common contractions without reporting contraction fragments', () => {
    const course = cloneBasicEnglishCourse();
    course.words[0].example = "I'm here. I don't have books.";

    const errors = validateBasicEnglishVocabulary(course);

    expect(errors).toEqual([]);
    expect(errors).not.toEqual(expect.arrayContaining([
      expect.stringContaining('"m"'),
      expect.stringContaining('"don"'),
      expect.stringContaining('"t"'),
    ]));
  });

  it("splits common n't contractions into allowed helper words", () => {
    const course = cloneBasicEnglishCourse();
    course.words[0].example = "It isn't here.";
    course.words[1].example = "They aren't here.";
    course.words[2].example = "I haven't books.";
    course.patterns[0].examples = ["It doesn't have a name."];

    const errors = validateBasicEnglishVocabulary(course);

    expect(errors).toEqual([]);
    expect(errors).not.toEqual(expect.arrayContaining([
      expect.stringContaining('"isn"'),
      expect.stringContaining('"aren"'),
      expect.stringContaining('"haven"'),
      expect.stringContaining('"doesn"'),
      expect.stringContaining('"t"'),
    ]));
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

  it('includes Week 5 and Week 6 scenario capabilities', () => {
    expect(scenarioWeekMap[4]).toEqual({
      weekNumber: 5,
      theme: 'Going Out Story',
      expressionOutcome: 'Tell a complete going out story.',
    });
    expect(scenarioWeekMap[5]).toEqual({
      weekNumber: 6,
      theme: 'Problems Outside',
      expressionOutcome: 'Describe outside problems and ask for help in a kind way.',
    });
    // Some examples use Basic English 850-compatible wording instead of written-plan wording.
    expect(scenarioCapabilities.find((capability) => capability.id === 'errand-story')).toEqual({
      id: 'errand-story',
      title: 'I can tell a going out story.',
      description: 'Tell how you go out, take a bus, buy things at a store, and come home.',
      unlockedByDayIds: ['day-035'],
      exampleOutputs: ['I go out with my list.', 'I take the bus.', 'I buy bread at the store.', 'I come home.'],
    });
    expect(scenarioCapabilities.find((capability) => capability.id === 'outside-problems')).toEqual({
      id: 'outside-problems',
      title: 'I can ask for help outside.',
      description: 'Ask for help in a kind way when there is a problem outside.',
      unlockedByDayIds: ['day-042'],
      exampleOutputs: ['I have a problem outside.', 'Please help me.', 'I ask for help.', 'I am kind.'],
    });
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
    const weekThreeThroughSixDayIds = basicEnglishCourse.weeks
      .slice(2, 6)
      .flatMap((week) => week.days.map((day) => day.id));

    expect(Object.keys(sceneGoalsByDayId)).toEqual(
      expect.arrayContaining(['day-001', 'day-008', 'day-009', 'day-010', ...weekThreeThroughSixDayIds]),
    );
    expect(sceneGoalsByDayId['day-035'].title).toBe('Going Out Story');
    expect(sceneGoalsByDayId['day-041'].title).toBe('Kind Help');
    expect(sceneGoalsByDayId['day-042'].title).toBe('Problem Story');
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

  it('reports duplicate scene goal ids', () => {
    const result = validateSceneGoals(
      {
        'day-001': {
          id: 'self',
          title: 'Self',
          capability: 'I can describe myself.',
          templates: ['My name is ____.'],
          guidedPrompts: ['Say your name.'],
          scenePrompt: 'Use your sentences to describe yourself clearly.',
          dialoguePrompts: ['Ask and answer about your name.'],
        },
        'day-008': {
          id: 'self',
          title: 'Room',
          capability: 'I can describe my room.',
          templates: ['This is my room.'],
          guidedPrompts: ['Say what your room is.'],
          scenePrompt: 'Use your sentences to describe your room.',
          dialoguePrompts: ['Ask and answer about your room.'],
        },
      },
      basicEnglishCourse,
    );

    expect(result.errors).toContain('Duplicate scene goal id: self');
  });
});

describe('scene remix tasks', () => {
  it('validates shipped remix tasks', () => {
    const result = validateSceneRemixTasks(sceneRemixTasksByDayId, basicEnglishCourse);
    const weekFiveAndSixDayIds = basicEnglishCourse.weeks
      .slice(4, 6)
      .flatMap((week) => week.days.map((day) => day.id));
    // A few written-plan references use Basic English 850-compatible wording to avoid ride, wait, and thank.
    const expectedWeekFiveAndSixTasks: Record<string, SceneRemixTask[]> = {
      'day-029': [
        {
          id: 'day-029-remix-food-water',
          type: 'replace',
          prompt: 'Change food to water.',
          source: 'I go out because I need food.',
          referenceAnswers: ['I go out because I need water.'],
        },
      ],
      'day-030': [
        {
          id: 'day-030-remix-stop-store',
          type: 'replace',
          prompt: 'Change bus stop to store.',
          source: 'I walk to the bus stop.',
          referenceAnswers: ['I walk to the store.'],
        },
      ],
      'day-031': [
        {
          id: 'day-031-remix-store-home',
          type: 'replace',
          prompt: 'Change store to home.',
          source: 'I take the bus to the store.',
          referenceAnswers: ['I take the bus home.'],
        },
      ],
      'day-032': [
        {
          id: 'day-032-remix-bread-milk',
          type: 'replace',
          prompt: 'Change bread to milk.',
          source: 'I find bread in the store.',
          referenceAnswers: ['I find milk in the store.'],
        },
      ],
      'day-033': [
        {
          id: 'day-033-remix-food-bread',
          type: 'replace',
          prompt: 'Change food to bread.',
          source: 'I am in line and pay for food.',
          referenceAnswers: ['I am in line and pay for bread.'],
        },
      ],
      'day-034': [
        {
          id: 'day-034-remix-food-bag',
          type: 'replace',
          prompt: 'Change food to bag.',
          source: 'I carry food home.',
          referenceAnswers: ['I carry the bag home.'],
        },
      ],
      'day-035': [
        {
          id: 'day-035-remix-errand-story',
          type: 'extend',
          prompt: 'Put more sentences in the outside story.',
          referenceAnswers: ['I am in line.', 'I come back home.'],
        },
      ],
      'day-036': [
        {
          id: 'day-036-remix-left-right',
          type: 'replace',
          prompt: 'Change left to right.',
          source: 'Go left.',
          referenceAnswers: ['Go right.'],
        },
      ],
      'day-037': [
        {
          id: 'day-037-remix-bus-time',
          type: 'replace',
          prompt: 'Change bus to time.',
          source: 'I need the bus.',
          referenceAnswers: ['I need more time.'],
        },
      ],
      'day-038': [
        {
          id: 'day-038-remix-bread-cup',
          type: 'replace',
          prompt: 'Change bread to cup.',
          source: 'I can not find bread.',
          referenceAnswers: ['I can not find a cup.'],
        },
      ],
      'day-039': [
        {
          id: 'day-039-remix-money-time',
          type: 'replace',
          prompt: 'Change money to time.',
          source: 'I do not have enough money.',
          referenceAnswers: ['I do not have enough time.'],
        },
      ],
      'day-040': [
        {
          id: 'day-040-remix-understand-hear',
          type: 'replace',
          prompt: 'Change understand to get the answer.',
          source: 'I do not understand.',
          referenceAnswers: ['I do not get the answer.'],
        },
      ],
      'day-041': [
        {
          id: 'day-041-remix-help-answer',
          type: 'replace',
          prompt: 'Change help to answer.',
          source: 'I am kind and ask for help.',
          referenceAnswers: ['I am kind and ask for an answer.'],
        },
      ],
      'day-042': [
        {
          id: 'day-042-remix-problem-story',
          type: 'extend',
          prompt: 'Put more sentences in the problem story.',
          referenceAnswers: ['I ask for help.', 'I say please.'],
        },
      ],
    };

    for (const dayId of weekFiveAndSixDayIds) {
      expect(sceneRemixTasksByDayId[dayId]?.length, `${dayId} remix task`).toBeGreaterThanOrEqual(1);
      expect(sceneRemixTasksByDayId[dayId], `${dayId} planned remix task`).toEqual(expectedWeekFiveAndSixTasks[dayId]);
    }
    expect(result).toEqual([]);
  });

  it('reports remix tasks for unknown days', () => {
    const result = validateSceneRemixTasks(
      {
        'day-999': [
          {
            id: 'missing-day-remix',
            type: 'replace',
            prompt: 'Change one word.',
            referenceAnswers: ['I am from Japan.'],
          },
        ],
        'day-001': [
          {
            id: 'day-001-remix-valid',
            type: 'replace',
            prompt: 'Change China to Japan.',
            referenceAnswers: ['I am from Japan.'],
          },
        ],
        'day-008': [
          {
            id: 'day-008-remix-valid',
            type: 'extend',
            prompt: 'Describe your room.',
            referenceAnswers: ['This is my room.'],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(result).toContain('Remix task day day-999 is not in the course.');
  });

  it('reports duplicate remix task ids', () => {
    const result = validateSceneRemixTasks(
      {
        'day-001': [
          {
            id: 'duplicate-remix',
            type: 'replace',
            prompt: 'Change China to Japan.',
            referenceAnswers: ['I am from Japan.'],
          },
        ],
        'day-008': [
          {
            id: 'duplicate-remix',
            type: 'extend',
            prompt: 'Describe your room.',
            referenceAnswers: ['This is my room.'],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(result).toContain('Remix task id duplicate-remix is duplicated.');
  });

  it('reports empty remix task ids', () => {
    const result = validateSceneRemixTasks(
      {
        'day-001': [
          {
            id: ' ',
            type: 'replace',
            prompt: 'Change China to Japan.',
            referenceAnswers: ['I am from Japan.'],
          },
        ],
        'day-008': [
          {
            id: 'day-008-remix-valid',
            type: 'extend',
            prompt: 'Describe your room.',
            referenceAnswers: ['This is my room.'],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(result).toContain('Remix task has an empty id.');
  });

  it('reports invalid type, empty prompt, and no non-empty references', () => {
    const result = validateSceneRemixTasks(
      {
        'day-001': [
          {
            id: 'bad-remix',
            type: 'free_write' as SceneRemixTask['type'],
            prompt: ' ',
            referenceAnswers: [' '],
          },
        ],
        'day-008': [
          {
            id: 'day-008-remix-valid',
            type: 'extend',
            prompt: 'Describe your room.',
            referenceAnswers: ['This is my room.'],
          },
        ],
      },
      basicEnglishCourse,
    );

    expect(result).toEqual(
      expect.arrayContaining([
        'Remix task bad-remix has invalid type free_write.',
        'Remix task bad-remix has an empty prompt.',
        'Remix task bad-remix has no non-empty reference answers.',
      ]),
    );
  });

  it('requires Day 1 and Day 8 remix tasks', () => {
    const result = validateSceneRemixTasks({}, basicEnglishCourse);

    expect(result).toEqual([
      'Day day-001 must have at least one remix task.',
      'Day day-008 must have at least one remix task.',
    ]);
  });
});

describe('picture describe tasks', () => {
  it('has one task for every playable course day', () => {
    const playableDayIds = basicEnglishCourse.weeks.flatMap((week) => week.days.map((day) => day.id));

    expect(Object.keys(pictureDescribeTasksByDayId).sort()).toEqual([...playableDayIds].sort());
  });

  it('uses complete English-first task data', () => {
    for (const [dayId, task] of Object.entries(pictureDescribeTasksByDayId)) {
      expect(task.dayId).toBe(dayId);
      expect(task.title).toMatch(/\S/);
      expect(task.goal).toMatch(/\S/);
      expect(task.image).toMatch(/\S/);
      expect(task.targetWords.length).toBeGreaterThanOrEqual(3);
      expect(task.suggestedPatterns.length).toBeGreaterThanOrEqual(2);
      const dayNumber = Number(dayId.replace('day-', ''));
      if (dayNumber >= 15) {
        expect(task.requiredSentenceCount).toBeGreaterThanOrEqual(4);
        expect(task.simpleVersion.length).toBeGreaterThanOrEqual(4);
      } else {
        expect(task.requiredSentenceCount).toBe(3);
        expect(task.simpleVersion).toHaveLength(3);
      }
      expect(task.simpleVersion).toHaveLength(task.requiredSentenceCount);
    }
  });
});
