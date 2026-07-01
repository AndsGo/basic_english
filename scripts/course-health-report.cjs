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

console.log(formatCourseHealthReport(metrics, result));

if (result.errors.length > 0) {
  process.exitCode = 1;
}
