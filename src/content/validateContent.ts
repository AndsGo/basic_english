import type {
  Course,
  Exercise,
  Pattern,
  PictureDescribeTask,
  SceneGoal,
  SceneRemixTask,
  ScenarioCapability,
  ScenarioWeek,
  WeeklyCheckRubric,
} from '../domain/types';
import { validateBasicEnglishTextEntries, validateBasicEnglishVocabulary } from './basicEnglish850';

export interface ValidationResult {
  errors: string[];
}

const mojibakePattern = /\uFFFD|锟斤拷|鎴戠|鎴戜|鍚嶅瓧|鏄|闂|涓|鑻辫|瀛︾|濂瑰|浠栨|杩欐|鍥犱/;

export function validateCourseContent(course: Course): ValidationResult {
  const errors: string[] = [];
  const wordIds = new Set(course.words.map((word) => word.id));
  const patternIds = new Set(course.patterns.map((pattern) => pattern.id));
  const patternsById = new Map(course.patterns.map((pattern) => [pattern.id, pattern]));
  const allIds = new Set<string>();

  const registerId = (id: string, label: string) => {
    if (!id.trim()) {
      errors.push(`Empty id for ${label}`);
      return;
    }

    if (allIds.has(id)) {
      errors.push(`Duplicate id: ${id}`);
    }
    allIds.add(id);
  };

  registerId(course.id, 'course');
  if (!course.title || !course.contentVersion || course.schemaVersion < 1) {
    errors.push('Course is missing title, contentVersion, or schemaVersion');
  }

  course.words.forEach((word) => {
    registerId(word.id, 'word');
    if (!word.text || !word.definition || !word.chinese || !word.example) {
      errors.push(`Word ${word.id} is missing text, definition, chinese, or example`);
    }
    if (!word.phonetic || !word.phonetic.trim()) {
      errors.push(`Word ${word.id} is missing phonetic`);
    } else if (!word.phonetic.startsWith('/') || !word.phonetic.endsWith('/')) {
      errors.push(`Word ${word.id} phonetic must be wrapped in /.../`);
    }
  });

  course.patterns.forEach((pattern) => {
    registerId(pattern.id, 'pattern');
    if (!pattern.title || !pattern.use || !pattern.structure || pattern.examples.length === 0) {
      errors.push(`Pattern ${pattern.id} is incomplete`);
    }
  });

  course.weeks.forEach((week) => {
    registerId(week.id, 'week');
    if (!week.title || !week.goal || week.days.length === 0) {
      errors.push(`Week ${week.id} is incomplete`);
    }

    week.days.forEach((day) => {
      registerId(day.id, 'day');
      if (day.weekId !== week.id) {
        errors.push(`${day.id} has wrong weekId`);
      }
      if (!day.title || !day.goal || day.estimatedMinutes <= 0) {
        errors.push(`${day.id} is missing required fields`);
      }
      if (day.wordIds.length < 6 || day.wordIds.length > 13) {
        errors.push(`${day.id} must have 6-13 words`);
      }
      if (day.patternIds.length < 1 || day.patternIds.length > 5) {
        errors.push(`${day.id} must have 1-5 patterns`);
      }
      if (day.exercises.length < 5 || day.exercises.length > 8) {
        errors.push(`${day.id} must have 5-8 exercises`);
      }
      if (!day.exercises.some((exercise) => exercise.type === 'translation')) {
        errors.push(`${day.id} must have a translation exercise`);
      }

      day.wordIds.forEach((wordId) => {
        if (!wordIds.has(wordId)) {
          errors.push(`${day.id} references missing word ${wordId}`);
        }
      });
      day.patternIds.forEach((patternId) => {
        if (!patternIds.has(patternId)) {
          errors.push(`${day.id} references missing pattern ${patternId}`);
        }
      });
      day.exercises.forEach((exercise) => {
        registerId(exercise.id, 'exercise');
        validateExercise(exercise, patternsById, new Set(day.patternIds), day.id, errors);
      });

      if (day.weeklyCheckRubric) {
        validateWeeklyCheckRubric(day.id, day.weeklyCheckRubric, errors);
        if (day.outputTask.template.length < day.weeklyCheckRubric.pass.minimumSentenceCount) {
          errors.push(`${day.id} weekly check template has fewer sentences than the minimum sentence count`);
        }
      }

      registerId(day.outputTask.id, 'output task');

      if (!day.outputTask.id || !day.outputTask.topic || day.outputTask.prompts.length === 0 || day.outputTask.template.length === 0) {
        errors.push(`${day.id} output task is incomplete`);
      }
      if (day.outputTask.requiredSentenceCount < 4) {
        errors.push(`${day.id} output requires too few sentences`);
      }
    });
  });

  if (mojibakePattern.test(JSON.stringify(course))) {
    errors.push('Content contains invalid Chinese text or mojibake');
  }

  errors.push(...validateBasicEnglishVocabulary(course));

  return { errors };
}

export function validateScenarioCapabilities(capabilities: ScenarioCapability[], course: Course): ValidationResult {
  const errors: string[] = [];
  const dayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const capabilityIds = new Set<string>();
  const basicTexts: Array<{ text: string; label: string }> = [];

  capabilities.forEach((capability) => {
    if (!capability.id.trim()) errors.push('Scenario capability has empty id');
    if (capabilityIds.has(capability.id)) errors.push(`Duplicate scenario capability id: ${capability.id}`);
    capabilityIds.add(capability.id);

    if (!capability.title.trim() || !capability.description.trim()) {
      errors.push(`${capability.id} is missing title or description`);
    }
    if (capability.unlockedByDayIds.length === 0) {
      errors.push(`${capability.id} must reference at least one unlock day`);
    }
    capability.unlockedByDayIds.forEach((dayId) => {
      if (!dayIds.has(dayId)) errors.push(`${capability.id} references missing day ${dayId}`);
    });
    if (capability.exampleOutputs.length === 0 || capability.exampleOutputs.some((output) => !output.trim())) {
      errors.push(`${capability.id} must have non-empty example outputs`);
    }
    basicTexts.push(
      { text: capability.title, label: `scenario capability ${capability.id} title` },
      { text: capability.description, label: `scenario capability ${capability.id} description` },
      ...capability.exampleOutputs.map((text, index) => ({
        text,
        label: `scenario capability ${capability.id} example ${index + 1}`,
      })),
    );
  });

  errors.push(...validateBasicEnglishTextEntries(basicTexts));

  return { errors };
}

export function validateScenarioWeekMap(weeks: ScenarioWeek[]): ValidationResult {
  const errors: string[] = [];
  const weekNumbers = new Set<number>();
  const basicTexts: Array<{ text: string; label: string }> = [];

  weeks.forEach((week) => {
    if (weekNumbers.has(week.weekNumber)) {
      errors.push(`Duplicate scenario week number: ${week.weekNumber}`);
    }
    weekNumbers.add(week.weekNumber);

    if (week.weekNumber < 1 || week.weekNumber > 12) {
      errors.push(`Scenario week number must be between 1 and 12: ${week.weekNumber}`);
    }
    if (!week.theme.trim() || !week.expressionOutcome.trim()) {
      errors.push(`Scenario week ${week.weekNumber} is missing theme or expression outcome`);
    }
    basicTexts.push(
      { text: week.theme, label: `scenario week ${week.weekNumber} theme` },
      { text: week.expressionOutcome, label: `scenario week ${week.weekNumber} expression outcome` },
    );
  });

  const hasExpectedSequence = weeks.length === 12 && Array.from({ length: 12 }, (_, index) => index + 1).every((weekNumber) => weekNumbers.has(weekNumber));
  if (!hasExpectedSequence) {
    errors.push('Scenario roadmap must define weeks 1 through 12');
  }

  errors.push(...validateBasicEnglishTextEntries(basicTexts));

  return { errors };
}

export function validateSceneGoals(sceneGoalsByDayId: Record<string, SceneGoal>, course: Course): ValidationResult {
  const errors: string[] = [];
  const dayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const sceneGoalIds = new Set<string>();
  const basicTexts: Array<{ text: string; label: string }> = [];

  Object.entries(sceneGoalsByDayId).forEach(([dayId, sceneGoal]) => {
    if (!dayIds.has(dayId)) errors.push(`Scene goal ${dayId} references missing day`);
    if (sceneGoalIds.has(sceneGoal.id)) {
      errors.push(`Duplicate scene goal id: ${sceneGoal.id}`);
    }
    sceneGoalIds.add(sceneGoal.id);
    if (!sceneGoal.id.trim() || !sceneGoal.title.trim() || !sceneGoal.capability.trim()) {
      errors.push(`Scene goal for ${dayId} is missing id, title, or capability`);
    }
    if (sceneGoal.templates.length === 0 || sceneGoal.templates.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty templates`);
    }
    if (sceneGoal.guidedPrompts.length === 0 || sceneGoal.guidedPrompts.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty guided prompts`);
    }
    if (!sceneGoal.scenePrompt.trim()) {
      errors.push(`Scene goal for ${dayId} must include a scene prompt`);
    }
    if (sceneGoal.dialoguePrompts.length === 0 || sceneGoal.dialoguePrompts.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty dialogue prompts`);
    }
    basicTexts.push(
      { text: sceneGoal.title, label: `${dayId} scene goal title` },
      { text: sceneGoal.capability, label: `${dayId} scene goal capability` },
      ...sceneGoal.templates.map((text, index) => ({ text, label: `${dayId} scene goal template ${index + 1}` })),
      ...sceneGoal.guidedPrompts.map((text, index) => ({
        text,
        label: `${dayId} scene goal guided prompt ${index + 1}`,
      })),
      { text: sceneGoal.scenePrompt, label: `${dayId} scene goal scene prompt` },
      ...sceneGoal.dialoguePrompts.map((text, index) => ({
        text,
        label: `${dayId} scene goal dialogue prompt ${index + 1}`,
      })),
    );
  });

  errors.push(...validateBasicEnglishTextEntries(basicTexts));

  return { errors };
}

const validSceneRemixTaskTypes = new Set<SceneRemixTask['type']>(['replace', 'extend', 'dialogue']);

export function validateSceneRemixTasks(tasksByDayId: Partial<Record<string, SceneRemixTask[]>>, course: Course): string[] {
  const errors: string[] = [];
  const validDayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const seenTaskIds = new Set<string>();
  const basicTexts: Array<{ text: string; label: string }> = [];

  for (const [dayId, tasks] of Object.entries(tasksByDayId)) {
    if (!validDayIds.has(dayId)) {
      errors.push(`Remix task day ${dayId} is not in the course.`);
    }

    for (const task of tasks ?? []) {
      if (!task.id.trim()) {
        errors.push('Remix task has an empty id.');
      } else {
        if (seenTaskIds.has(task.id)) {
          errors.push(`Remix task id ${task.id} is duplicated.`);
        }
        seenTaskIds.add(task.id);
      }

      if (!validSceneRemixTaskTypes.has(task.type)) {
        errors.push(`Remix task ${task.id} has invalid type ${task.type}.`);
      }
      if (!task.prompt.trim()) {
        errors.push(`Remix task ${task.id} has an empty prompt.`);
      }
      if (task.referenceAnswers.filter((answer) => answer.trim().length > 0).length === 0) {
        errors.push(`Remix task ${task.id} has no non-empty reference answers.`);
      }
      basicTexts.push(
        { text: task.prompt, label: `${dayId} remix ${task.id} prompt` },
        ...(task.source ? [{ text: task.source, label: `${dayId} remix ${task.id} source` }] : []),
        ...task.referenceAnswers.map((text, index) => ({
          text,
          label: `${dayId} remix ${task.id} reference ${index + 1}`,
        })),
      );
    }
  }

  for (const requiredDayId of ['day-001', 'day-008']) {
    if ((tasksByDayId[requiredDayId] ?? []).length === 0) {
      errors.push(`Day ${requiredDayId} must have at least one remix task.`);
    }
  }

  return [...errors, ...validateBasicEnglishTextEntries(basicTexts)];
}

export function validatePictureDescribeTasks(tasksByDayId: Record<string, PictureDescribeTask>, course: Course): ValidationResult {
  const errors: string[] = [];
  const validDayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const seenTaskIds = new Set<string>();
  const basicTexts: Array<{ text: string; label: string }> = [];

  Object.entries(tasksByDayId).forEach(([dayId, task]) => {
    if (!validDayIds.has(dayId)) {
      errors.push(`Picture task ${dayId} references missing day`);
    }
    if (task.dayId !== dayId) {
      errors.push(`Picture task ${task.id} has wrong dayId`);
    }
    if (!task.id.trim()) {
      errors.push(`Picture task for ${dayId} has empty id`);
    } else if (seenTaskIds.has(task.id)) {
      errors.push(`Duplicate picture task id: ${task.id}`);
    }
    seenTaskIds.add(task.id);

    if (!task.title.trim() || !task.goal.trim() || !task.image.trim()) {
      errors.push(`Picture task for ${dayId} is missing title, goal, or image`);
    }
    if (task.targetWords.length < 3 || task.targetWords.some((word) => !word.trim())) {
      errors.push(`Picture task for ${dayId} must include at least three target words`);
    }
    if (task.suggestedPatterns.length < 2 || task.suggestedPatterns.some((pattern) => !pattern.trim())) {
      errors.push(`Picture task for ${dayId} must include at least two suggested patterns`);
    }
    if (task.requiredSentenceCount < 1) {
      errors.push(`Picture task for ${dayId} must require at least one sentence`);
    }
    if (task.simpleVersion.length !== task.requiredSentenceCount || task.simpleVersion.some((sentence) => !sentence.trim())) {
      errors.push(`Picture task for ${dayId} must include one non-empty simple sentence per required sentence`);
    }

    basicTexts.push(
      { text: task.title, label: `${dayId} picture title` },
      { text: task.goal, label: `${dayId} picture goal` },
      ...task.targetWords.map((text, index) => ({ text, label: `${dayId} picture target word ${index + 1}` })),
      ...task.suggestedPatterns.map((text, index) => ({
        text,
        label: `${dayId} picture suggested pattern ${index + 1}`,
      })),
      ...task.simpleVersion.map((text, index) => ({
        text,
        label: `${dayId} picture simple version ${index + 1}`,
      })),
    );
  });

  return { errors: [...errors, ...validateBasicEnglishTextEntries(basicTexts)] };
}

function validateWeeklyCheckRubric(dayId: string, rubric: WeeklyCheckRubric, errors: string[]) {
  if (rubric.scale.min !== 0) {
    errors.push(`${dayId} weekly check rubric scale min must be 0`);
  }
  if (rubric.scale.max !== 2) {
    errors.push(`${dayId} weekly check rubric scale max must be 2`);
  }

  if (rubric.criteria.length === 0) {
    errors.push(`${dayId} weekly check rubric must have criteria`);
  }

  const criterionIds = new Set<string>();
  rubric.criteria.forEach((criterion) => {
    if (!criterion.id.trim()) {
      errors.push(`${dayId} weekly check rubric criterion has an empty id`);
    } else if (criterionIds.has(criterion.id)) {
      errors.push(`${dayId} weekly check rubric has duplicate criterion id ${criterion.id}`);
    }
    criterionIds.add(criterion.id);

    if (!criterion.label.trim()) {
      errors.push(`${dayId} weekly check rubric criterion ${criterion.id} must have a non-blank label`);
    }

    if (criterion.scores.length !== 3 || criterion.scores.some((score) => !score.trim())) {
      errors.push(`${dayId} weekly check rubric criterion ${criterion.id} must have score levels for 0, 1, and 2`);
    }
  });

  const maxPossibleScore = rubric.criteria.length * 2;
  if (rubric.pass.minimumTotalScore < 1 || rubric.pass.minimumTotalScore > maxPossibleScore) {
    errors.push(`${dayId} weekly check rubric minimumTotalScore must be between 1 and ${maxPossibleScore}`);
  }

  if (rubric.pass.minimumMeaningScore < 0 || rubric.pass.minimumMeaningScore > 2) {
    errors.push(`${dayId} weekly check rubric minimumMeaningScore must be between 0 and 2`);
  }

  if (rubric.pass.minimumSentenceCount < 1) {
    errors.push(`${dayId} weekly check rubric minimumSentenceCount must be at least 1`);
  }
}

function validateExercise(
  exercise: Exercise,
  patternsById: Map<string, Pattern>,
  dayPatternIds: Set<string>,
  dayId: string,
  errors: string[],
) {
  if (!exercise.id.trim()) {
    errors.push('Exercise has an empty id');
  }

  if (exercise.type === 'choice') {
    const options = exercise.options.map((option) => option.trim()).filter(Boolean);
    const uniqueOptions = new Set(options);
    if (!exercise.prompt || exercise.options.length === 0 || !exercise.options.includes(exercise.correctOption)) {
      errors.push(`${exercise.id} choice exercise is incomplete`);
    }
    if (uniqueOptions.size < 2) {
      errors.push(`${exercise.id} choice exercise must have at least 2 non-empty unique options`);
    }
    if (!exercise.correctOption.trim() || !uniqueOptions.has(exercise.correctOption.trim())) {
      errors.push(`${exercise.id} choice exercise correctOption must be included in options`);
    }
  }

  if (exercise.type === 'fill_blank') {
    if (!exercise.prompt || exercise.acceptedAnswers.length === 0) {
      errors.push(`${exercise.id} fill blank exercise is incomplete`);
    }
    if (!exercise.acceptedAnswers.some((answer) => answer.trim())) {
      errors.push(`${exercise.id} fill blank exercise must have non-blank accepted answers`);
    }
  }

  if (exercise.type === 'sentence_order') {
    if (exercise.tokens.length === 0 || exercise.correctOrder.length === 0 || !exercise.finalSentence) {
      errors.push(`${exercise.id} sentence order exercise is incomplete`);
    }
    if (!sameTokenMultiset(exercise.tokens, exercise.correctOrder)) {
      errors.push(`${exercise.id} sentence order exercise tokens and correctOrder must contain the same tokens`);
    }
    if (!exercise.finalSentence.trim()) {
      errors.push(`${exercise.id} sentence order exercise finalSentence must be non-blank`);
    }
    if (
      exercise.correctOrder.length > 0 &&
      exercise.finalSentence.trim() &&
      !sameNormalizedSentence(exercise.correctOrder.join(' '), exercise.finalSentence)
    ) {
      errors.push(`${exercise.id} sentence order exercise finalSentence must match correctOrder`);
    }
  }

  if (exercise.type === 'replacement') {
    const pattern = patternsById.get(exercise.patternId);
    if (!pattern) {
      errors.push(`${exercise.id} references missing pattern ${exercise.patternId}`);
    }
    if (Object.keys(exercise.slotValues).length === 0 || !exercise.referenceAnswer) {
      errors.push(`${exercise.id} replacement exercise is incomplete`);
    }
    pattern?.slots.forEach((slot) => {
      if (!(slot in exercise.slotValues)) {
        errors.push(`${exercise.id} replacement exercise is missing slot value for ${slot}`);
      }
    });
    if (pattern && pattern.slots.every((slot) => slot in exercise.slotValues) && exercise.referenceAnswer.trim()) {
      const expectedAnswer = pattern.slots.reduce(
        (structure, slot) => structure.split(`{${slot}}`).join(exercise.slotValues[slot]),
        pattern.structure,
      );
      if (!sameNormalizedSentence(expectedAnswer, exercise.referenceAnswer)) {
        errors.push(`${exercise.id} replacement exercise referenceAnswer must match pattern structure`);
      }
    }
  }

  if (exercise.type === 'translation') {
    if (!exercise.chinesePrompt || !exercise.coreMeaningHint || exercise.referenceAnswers.length === 0) {
      errors.push(`${exercise.id} translation exercise is incomplete`);
    }
    if (!exercise.referenceAnswers.some((answer) => answer.trim())) {
      errors.push(`${exercise.id} translation exercise must have non-blank reference answers`);
    }
    if (exercise.suggestedPatternIds.length === 0) {
      errors.push(`${exercise.id} translation exercise must have suggested pattern ids`);
    }
    exercise.suggestedPatternIds.forEach((patternId) => {
      if (!patternsById.has(patternId)) {
        errors.push(`${exercise.id} references missing pattern ${patternId}`);
      }
      if (!dayPatternIds.has(patternId)) {
        errors.push(`${exercise.id} suggested pattern ${patternId} must be included in ${dayId} patternIds`);
      }
    });
  }
}

function sameNormalizedSentence(expected: string, actual: string) {
  return normalizeSentence(expected) === normalizeSentence(actual);
}

function normalizeSentence(sentence: string) {
  return sentence.trim().replace(/[.!?]$/, '').trim().replace(/\s+/g, ' ');
}

function sameTokenMultiset(tokens: string[], correctOrder: string[]) {
  if (tokens.length !== correctOrder.length) {
    return false;
  }

  const counts = new Map<string, number>();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  });

  correctOrder.forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) - 1);
  });

  return Array.from(counts.values()).every((count) => count === 0);
}
