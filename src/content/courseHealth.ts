import type { Course, PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';

export interface CourseHealthInputs {
  course: Course;
  basicEnglishAllowedWords: ReadonlySet<string>;
  pictureDescribeTasksByDayId: Partial<Record<string, PictureDescribeTask>>;
  sceneGoalsByDayId: Partial<Record<string, SceneGoal>>;
  sceneRemixTasksByDayId: Partial<Record<string, SceneRemixTask[]>>;
  wordFlashcardImages: Partial<Record<string, string>>;
}

export interface CourseHealthMetrics {
  courseWeeks: number;
  courseDays: number;
  courseWords: number;
  basicEnglishCourseWords: number;
  basicEnglishWordCount: number;
  basicEnglishCoveragePercent: number;
  weeklyChecks: number;
  exercisesTotal: number;
  averageExercisesPerDay: number;
  averageOutputSentencesPerDay: number;
  pictureDescribe: { covered: number; total: number; percent: number };
  sceneGoals: { covered: number; total: number; percent: number };
  sceneRemix: { covered: number; total: number; percent: number };
  byWeek: WeekHealthMetrics[];
  missingFlashcardWordIds: string[];
  missingCourseWordRefs: string[];
  futureWordRefs: string[];
  missingPictureDescribeDayIds: string[];
  missingSceneGoalDayIds: string[];
  missingSceneRemixDayIds: string[];
}

export interface WeekHealthMetrics {
  weekNumber: number;
  title: string;
  days: number;
  introducedWords: number;
  uniqueDayWordRefs: number;
  averageDayWordRefs: number;
  averageActiveDayWordRefs: number;
  averageSupportDayWordRefs: number;
  exercisesTotal: number;
  averageExercisesPerDay: number;
  weeklyChecks: number;
}

export interface CourseHealthResult {
  errors: string[];
  warnings: string[];
}

export const defaultCourseHealthPolicy = {
  recommendedMaxNewWordsPerWeek: 30,
  recommendedMaxAverageDayWordRefs: 10,
  minimumPictureDescribeCoveragePercent: 100,
  minimumSceneGoalCoveragePercent: 100,
  minimumSceneRemixCoveragePercent: 100,
};

function round1(value: number): number {
  return Number(value.toFixed(1));
}

function percent(covered: number, total: number): number {
  return total === 0 ? 0 : round1((covered / total) * 100);
}

function average(total: number, count: number): number {
  return count === 0 ? 0 : round1(total / count);
}

function formatList(items: string[], limit = 8): string {
  if (items.length <= limit) {
    return items.join(', ');
  }

  return `${items.slice(0, limit).join(', ')}, and ${items.length - limit} more`;
}

export function collectCourseHealthMetrics(inputs: CourseHealthInputs): CourseHealthMetrics {
  const { course } = inputs;
  const allDays = course.weeks.flatMap((week) => week.days);
  const courseWordIds = new Set(course.words.map((word) => word.id));
  const missingCourseWordRefs = [...new Set(allDays.flatMap((day) => day.wordIds).filter((wordId) => !courseWordIds.has(wordId)))];
  const missingFlashcardWordIds = course.words
    .map((word) => word.id)
    .filter((wordId) => !inputs.wordFlashcardImages[wordId]);
  const missingPictureDescribeDayIds = allDays
    .map((day) => day.id)
    .filter((dayId) => !inputs.pictureDescribeTasksByDayId[dayId]);
  const missingSceneGoalDayIds = allDays.map((day) => day.id).filter((dayId) => !inputs.sceneGoalsByDayId[dayId]);
  const missingSceneRemixDayIds = allDays
    .map((day) => day.id)
    .filter((dayId) => (inputs.sceneRemixTasksByDayId[dayId]?.length ?? 0) === 0);
  const weeklyChecks = allDays.filter((day) => Boolean(day.weeklyCheckRubric)).length;
  const exercisesTotal = allDays.reduce((total, day) => total + day.exercises.length, 0);
  const outputSentencesTotal = allDays.reduce((total, day) => total + day.outputTask.template.length, 0);
  const basicEnglishCourseWords = course.words.filter((word) =>
    inputs.basicEnglishAllowedWords.has(word.text.toLowerCase()),
  ).length;

  const byWeek = course.weeks.map<WeekHealthMetrics>((week) => {
    const introducedWords = course.words.filter((word) => word.weekIntroduced === week.number).length;
    const uniqueDayWordRefs = new Set(week.days.flatMap((day) => day.wordIds)).size;
    const weekExercisesTotal = week.days.reduce((total, day) => total + day.exercises.length, 0);
    const activeDayWordRefs = week.days.reduce(
      (total, day) =>
        total +
        day.wordIds.filter((wordId) => {
          const word = course.words.find((courseWord) => courseWord.id === wordId);
          return word?.weekIntroduced === week.number;
        }).length,
      0,
    );
    const totalDayWordRefs = week.days.reduce((total, day) => total + day.wordIds.length, 0);

    return {
      weekNumber: week.number,
      title: week.title,
      days: week.days.length,
      introducedWords,
      uniqueDayWordRefs,
      averageDayWordRefs: average(totalDayWordRefs, week.days.length),
      averageActiveDayWordRefs: average(activeDayWordRefs, week.days.length),
      averageSupportDayWordRefs: average(totalDayWordRefs - activeDayWordRefs, week.days.length),
      exercisesTotal: weekExercisesTotal,
      averageExercisesPerDay: average(weekExercisesTotal, week.days.length),
      weeklyChecks: week.days.filter((day) => Boolean(day.weeklyCheckRubric)).length,
    };
  });

  const futureWordRefs = allDays.flatMap((day) => {
    const weekNumber = course.weeks.find((week) => week.id === day.weekId)?.number ?? 0;

    return day.wordIds.filter((wordId) => {
      const word = course.words.find((courseWord) => courseWord.id === wordId);
      return Boolean(word && word.weekIntroduced > weekNumber);
    });
  });

  return {
    courseWeeks: course.weeks.length,
    courseDays: allDays.length,
    courseWords: course.words.length,
    basicEnglishCourseWords,
    basicEnglishWordCount: inputs.basicEnglishAllowedWords.size,
    basicEnglishCoveragePercent: percent(basicEnglishCourseWords, inputs.basicEnglishAllowedWords.size),
    weeklyChecks,
    exercisesTotal,
    averageExercisesPerDay: average(exercisesTotal, allDays.length),
    averageOutputSentencesPerDay: average(outputSentencesTotal, allDays.length),
    pictureDescribe: {
      covered: allDays.length - missingPictureDescribeDayIds.length,
      total: allDays.length,
      percent: percent(allDays.length - missingPictureDescribeDayIds.length, allDays.length),
    },
    sceneGoals: {
      covered: allDays.length - missingSceneGoalDayIds.length,
      total: allDays.length,
      percent: percent(allDays.length - missingSceneGoalDayIds.length, allDays.length),
    },
    sceneRemix: {
      covered: allDays.length - missingSceneRemixDayIds.length,
      total: allDays.length,
      percent: percent(allDays.length - missingSceneRemixDayIds.length, allDays.length),
    },
    byWeek,
    missingFlashcardWordIds,
    missingCourseWordRefs,
    futureWordRefs: [...new Set(futureWordRefs)],
    missingPictureDescribeDayIds,
    missingSceneGoalDayIds,
    missingSceneRemixDayIds,
  };
}

export function validateCourseHealth(
  metrics: CourseHealthMetrics,
  policy = defaultCourseHealthPolicy,
): CourseHealthResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (metrics.courseDays === 0) {
    errors.push('Course has no days.');
  }

  for (const week of metrics.byWeek) {
    if (week.days !== 7) {
      errors.push(`Week ${week.weekNumber} has ${week.days} days; expected 7.`);
    }

    if (week.introducedWords > policy.recommendedMaxNewWordsPerWeek) {
      warnings.push(
        `Week ${week.weekNumber} introduces ${week.introducedWords} words; recommended max is ${policy.recommendedMaxNewWordsPerWeek}.`,
      );
    }

    if (week.averageActiveDayWordRefs > policy.recommendedMaxAverageDayWordRefs) {
      warnings.push(
        `Week ${week.weekNumber} averages ${week.averageActiveDayWordRefs} active day word references; recommended max is ${policy.recommendedMaxAverageDayWordRefs}.`,
      );
    }
  }

  if (metrics.missingFlashcardWordIds.length > 0) {
    errors.push(
      `Missing flashcard images for ${metrics.missingFlashcardWordIds.length} words: ${formatList(metrics.missingFlashcardWordIds)}`,
    );
  }

  if (metrics.missingCourseWordRefs.length > 0) {
    errors.push(
      `Missing course word definitions for ${metrics.missingCourseWordRefs.length} day references: ${formatList(metrics.missingCourseWordRefs)}`,
    );
  }

  if (metrics.futureWordRefs.length > 0) {
    errors.push(
      `Days reference ${metrics.futureWordRefs.length} words before introduction: ${formatList(metrics.futureWordRefs)}`,
    );
  }

  if (metrics.pictureDescribe.percent < policy.minimumPictureDescribeCoveragePercent) {
    errors.push(
      `Picture describe coverage is ${metrics.pictureDescribe.covered}/${metrics.pictureDescribe.total} days (${metrics.pictureDescribe.percent}%).`,
    );
  }

  if (metrics.sceneGoals.percent < policy.minimumSceneGoalCoveragePercent) {
    warnings.push(
      `Scene goal coverage is ${metrics.sceneGoals.covered}/${metrics.sceneGoals.total} days (${metrics.sceneGoals.percent}%).`,
    );
  }

  if (metrics.sceneRemix.percent < policy.minimumSceneRemixCoveragePercent) {
    warnings.push(
      `Scene remix coverage is ${metrics.sceneRemix.covered}/${metrics.sceneRemix.total} days (${metrics.sceneRemix.percent}%).`,
    );
  }

  return { errors, warnings };
}

export function formatCourseHealthReport(metrics: CourseHealthMetrics, result: CourseHealthResult): string {
  const lines = [
    'Basic English Course Health',
    '',
    `Weeks: ${metrics.courseWeeks}`,
    `Days: ${metrics.courseDays}`,
    `Active course words: ${metrics.courseWords}`,
    `Basic English core coverage: ${metrics.basicEnglishCourseWords}/${metrics.basicEnglishWordCount} (${metrics.basicEnglishCoveragePercent}%)`,
    `Exercises: ${metrics.exercisesTotal} total, ${metrics.averageExercisesPerDay} per day`,
    `Output sentences: ${metrics.averageOutputSentencesPerDay} per day`,
    `Weekly checks: ${metrics.weeklyChecks}`,
    `Picture describe coverage: ${metrics.pictureDescribe.covered}/${metrics.pictureDescribe.total} (${metrics.pictureDescribe.percent}%)`,
    `Scene goal coverage: ${metrics.sceneGoals.covered}/${metrics.sceneGoals.total} (${metrics.sceneGoals.percent}%)`,
    `Scene remix coverage: ${metrics.sceneRemix.covered}/${metrics.sceneRemix.total} (${metrics.sceneRemix.percent}%)`,
    '',
    'Weekly load:',
    ...metrics.byWeek.map(
      (week) =>
        `- Week ${week.weekNumber}: ${week.introducedWords} new words, ${week.uniqueDayWordRefs} unique day refs, ${week.averageActiveDayWordRefs} active refs/day, ${week.averageSupportDayWordRefs} support refs/day, ${week.averageExercisesPerDay} exercises/day`,
    ),
    '',
    `Errors (${result.errors.length}):`,
    ...(result.errors.length === 0 ? ['- None'] : result.errors.map((error) => `- ${error}`)),
    '',
    `Warnings (${result.warnings.length}):`,
    ...(result.warnings.length === 0 ? ['- None'] : result.warnings.map((warning) => `- ${warning}`)),
  ];

  return lines.join('\n');
}
