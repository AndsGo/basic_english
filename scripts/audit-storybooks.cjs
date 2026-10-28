const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'docs/storybooks');
const design = require(path.join(folder, 'curriculum.json'));
const catalog = require(path.join(root, 'src/content/storybookCatalog.json'));
const { basicEnglishCourse: course } = require(path.join(root, 'src/content/course.ts'));
const vocabulary = require(path.join(root, 'src/content/basicEnglish850.ts'));
const core = new Set(vocabulary.basicEnglishWordList);
const stories = [...design.books, ...design.companionBooks];
const errors = [];

function coreForms(token) {
  if (core.has(token)) return [token];
  const candidates = [];
  if (token.endsWith('ies')) candidates.push(token.slice(0, -3) + 'y');
  if (token.endsWith('es')) candidates.push(token.slice(0, -2));
  if (token.endsWith('s')) candidates.push(token.slice(0, -1));
  if (token.endsWith('ed')) candidates.push(token.slice(0, -2), token.slice(0, -1));
  if (token.endsWith('ing')) candidates.push(token.slice(0, -3), token.slice(0, -3) + 'e');
  if (token.endsWith('ly')) candidates.push(token.slice(0, -2));
  return [...new Set(candidates.filter(word => core.has(word)))];
}
const wordsIn = text => new Set(vocabulary.tokenizeBasicEnglishText(text).flatMap(coreForms));
const bodyText = story => story.pages.flatMap(page => [page.text,
  ...(page.semanticText ? [page.semanticText.label, ...page.semanticText.lines, page.semanticText.accessibleSummary] : []),
]).join(' ');
const exerciseText = story => [story.check.prompt, ...story.check.options, story.check.explanation, story.output.frame, story.output.sample].join(' ');

for (const story of stories) {
  const entry = catalog.find(item => item.sourceId === story.id);
  if (!entry) errors.push(`Missing catalog entry: ${story.id}`);
  if (story.pages.length !== 4) errors.push(`Not four pages: ${story.id}`);
  if (story.reviewWordIds.length < 3 || story.reviewWordIds.length > 5) errors.push(`Review list must have 3 to 5 words: ${story.id}`);
  const readingWords = new Set([...vocabulary.tokenizeBasicEnglishText(bodyText(story)), ...wordsIn(bodyText(story))]);
  const reviewsInReading = story.reviewWordIds.filter(id => {
    const word = course.words.find(word => word.id === id);
    return word && readingWords.has(word.text.toLowerCase());
  });
  if (new Set(reviewsInReading).size < 3) errors.push(`Fewer than 3 review words in reading text: ${story.id}`);
  for (const id of story.reviewWordIds) {
    const word = course.words.find(word => word.id === id);
    if (!word || word.weekIntroduced > story.readAfterWeek) errors.push(`Review word not available: ${story.id}/${id}`);
  }
  const texts = [story.title, story.teachingDefinition, bodyText(story), exerciseText(story),
    ...story.contextSupport.flatMap(item => [item.text, item.definition]),
    ...(entry ? [entry.narrator, entry.check.success, entry.check.retry, ...entry.pages.map(page => page.alt)] : []),
  ];
  errors.push(...vocabulary.validateBasicEnglishTextEntries(texts.map(text => ({ text, label: story.id }))));
}

const coverage = vocabulary.basicEnglishWordList.map(word => {
  const sourceWords = course.words.filter(item => item.text.toLowerCase() === word);
  const firstCourseWeek = sourceWords.length ? Math.min(...sourceWords.map(item => item.weekIntroduced)) : null;
  const primaryBooks = stories.filter(story => story.targetWordId === word).map(story => story.id);
  const reviewBooks = stories.filter(story => story.reviewWordIds.includes(word)).map(story => story.id);
  const textBooks = stories.filter(story => wordsIn(bodyText(story)).has(word)).map(story => story.id);
  const exerciseBooks = stories.filter(story => wordsIn(exerciseText(story)).has(word)).map(story => story.id);
  return { word, firstCourseWeek, status: primaryBooks.length ? 'primary' : reviewBooks.length ? 'review' : textBooks.length ? 'textOnly' : exerciseBooks.length ? 'exerciseOnly' : 'extensionNeeded',
    primaryBooks, reviewBooks, textBooks, exerciseBooks,
    relatedWeeklyBookId: design.books.find(story => story.courseWeek === firstCourseWeek)?.id ?? null };
});
const indexPath = path.join(folder, 'vocabulary-coverage.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
index.words = coverage;
index.counts = Object.fromEntries(['primary', 'review', 'textOnly', 'exerciseOnly', 'extensionNeeded'].map(status => [status, coverage.filter(item => item.status === status).length]));
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
const reportPath = path.join(folder, 'validation-report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const earliest = new Map();
const addKnown = (text, week) => {
  for (const word of wordsIn(text)) earliest.set(word, Math.min(earliest.get(word) ?? 100, week));
};
for (const word of course.words) addKnown([word.text, word.definition, word.example].join(' '), word.weekIntroduced);
for (const pattern of course.patterns) {
  const weeks = course.weeks.filter(week => week.days.some(day => day.patternIds.includes(pattern.id)));
  if (weeks.length) addKnown([pattern.title, pattern.use, ...pattern.examples].join(' '), Math.min(...weeks.map(week => week.number)));
}
report.readingSupport = stories.map(story => ({
  bookId: story.id,
  words: [...wordsIn(bodyText(story))].filter(word => (earliest.get(word) ?? 100) > story.readAfterWeek).map(word => ({
    word, earliestInCurrentCourseText: earliest.get(word) ?? null,
    plannedContextSupport: story.contextSupport.find(item => item.text === word) ?? null,
  })),
})).filter(item => item.words.length);
report.unresolvedReadingSupport = report.readingSupport.flatMap(story => story.words.filter(word => !word.plannedContextSupport).map(word => ({ bookId: story.bookId, word: word.word })));
errors.push(...report.unresolvedReadingSupport.map(item => `Reading support missing: ${item.bookId}/${item.word}`));
report.contentErrors = [...new Set(errors)];
report.lexicalErrors = report.contentErrors.filter(error => error.startsWith('Non-Basic English'));
report.coverageByHighestRole = index.counts;
report.sourceEntriesNeedingEditorialCorrection = Object.keys(require(path.join(root, 'src/content/storyWordCorrections.json'))).filter(id => {
  const word = course.words.find(item => item.id === id);
  return !word || word.definition === 'a thing' || /^The .+ is (good|clear)\.$/.test(word.example);
});
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
const overviewPath = path.join(folder, 'README.md');
const overview = fs.readFileSync(overviewPath, 'utf8').replace(/主学 \d+、读前复习 \d+、仅正文出现 \d+、仅题目或输出出现 \d+、待补绘本 \d+/,
  `主学 ${index.counts.primary}、读前复习 ${index.counts.review}、仅正文出现 ${index.counts.textOnly}、仅题目或输出出现 ${index.counts.exerciseOnly}、待补绘本 ${index.counts.extensionNeeded}`);
fs.writeFileSync(overviewPath, overview);
console.log(JSON.stringify({ scripts: stories.length, canonicalWords: coverage.length, counts: index.counts, errors: report.contentErrors }, null, 2));
if (errors.length) process.exitCode = 1;
