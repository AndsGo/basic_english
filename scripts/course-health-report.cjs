const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = require('fs').readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });

  module._compile(outputText, filename);
};

require.extensions['.png'] = (module, filename) => {
  module.exports = filename;
};

const { basicEnglishAllowedWords } = require('../src/content/basicEnglish850.ts');
const { basicEnglishCourse } = require('../src/content/course.ts');
const {
  collectCourseHealthMetrics,
  formatCourseHealthReport,
  validateCourseHealth,
} = require('../src/content/courseHealth.ts');
const { pictureDescribeTasksByDayId } = require('../src/content/pictureDescribeTasks.ts');
const { sceneGoalsByDayId } = require('../src/content/sceneGoals.ts');
const { sceneRemixTasksByDayId } = require('../src/content/sceneRemixTasks.ts');
const { wordFlashcardImages } = require('../src/content/wordFlashcardImages.ts');

const metrics = collectCourseHealthMetrics({
  course: basicEnglishCourse,
  basicEnglishAllowedWords,
  pictureDescribeTasksByDayId,
  sceneGoalsByDayId,
  sceneRemixTasksByDayId,
  wordFlashcardImages,
});
const result = validateCourseHealth(metrics);

if (process.argv.includes('--json')) {
  const wordsById = new Map(basicEnglishCourse.words.map((word) => [word.id, word]));
  const firstSeen = new Map();
  const days = basicEnglishCourse.weeks.flatMap((week) => week.days).map((day) => {
    const newWordIds = [...new Set(day.wordIds)].filter((id) => !firstSeen.has(id));
    newWordIds.forEach((id) => firstSeen.set(id, day.id));
    return { dayId: day.id, newWordIds, wordReferences: day.wordIds.length };
  });
  const scheduledWords = new Set([...firstSeen.keys()].map((id) => wordsById.get(id)?.text.toLowerCase()));
  console.log(JSON.stringify({
    metrics,
    validation: result,
    scheduledCoreWords: [...basicEnglishAllowedWords].filter((word) => scheduledWords.has(word)).sort(),
    missingCoreWords: [...basicEnglishAllowedWords].filter((word) => !scheduledWords.has(word)).sort(),
    supplementaryCourseWords: basicEnglishCourse.words.filter((word) => !basicEnglishAllowedWords.has(word.text.toLowerCase())).map((word) => word.text).sort(),
    unscheduledWordIds: basicEnglishCourse.words.filter((word) => !firstSeen.has(word.id)).map((word) => word.id),
    days,
  }, null, 2));
} else {
  console.log(formatCourseHealthReport(metrics, result));
}

if (result.errors.length > 0) {
  process.exitCode = 1;
}
