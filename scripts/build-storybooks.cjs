const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'docs/storybooks');
const design = JSON.parse(fs.readFileSync(path.join(folder, 'curriculum.json'), 'utf8'));
const manifestPath = path.join(folder, 'assets-manifest.json');
const sources = [...design.books, ...design.companionBooks];

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const catalog = sources.map((source) => {
  const assets = manifest.find(item => item.sourceId === source.id);
  if (!assets || assets.pages.length !== source.pages.length) throw new Error(`Missing asset plan: ${source.id}`);
  return {
    id: assets.id,
    sourceId: source.id,
    title: source.title,
    wordId: source.targetWordId,
    courseWeek: source.courseWeek,
    week: source.readAfterWeek,
    definition: source.teachingDefinition,
    definitionChinese: source.senseChinese,
    reviewWordIds: source.reviewWordIds,
    narrator: assets.narrator,
    narratorChinese: source.narratorChinese,
    contextSupport: source.contextSupport ?? [],
    pages: source.pages.map((page, index) => ({
      text: page.text, chinese: page.chinese, file: assets.pages[index].file,
      alt: assets.pages[index].alt, semanticText: page.semanticText ?? null,
    })),
    check: {
      prompt: source.check.prompt, options: source.check.options, correctIndex: source.check.correctIndex,
      success: `Correct. ${source.check.explanation}`, retry: 'Look again at the question.', chinese: source.check.chinese,
    },
    practice: source.output.frame,
    practiceExamples: [source.output.sample],
    ready: Boolean(assets.narrator) && assets.pages.every(page => page.reviewed && page.alt && fs.existsSync(path.join(root, 'src/assets/word-stories', page.file))),
  };
});
const runtimePath = path.join(root, 'src/content/storybookCatalog.json');
fs.writeFileSync(runtimePath, JSON.stringify(catalog, null, 2) + '\n');
const report = {
  requiredStories: sources.length,
  requiredMainStories: design.books.length,
  readyStories: catalog.filter(story => story.ready).length,
  publishedSourceIds: catalog.filter(story => story.ready).map(story => story.sourceId),
  remainingSourceIds: catalog.filter(story => !story.ready).map(story => story.sourceId),
  reviewedImages: new Set(manifest.flatMap(story => story.pages.filter(page => page.reviewed).map(page => page.file))).size,
  scope: '52 main stories and the existing open companion, with original IDs preserved. The 850-word extension index remains a separately tracked expansion pool.',
};
fs.writeFileSync(path.join(folder, 'delivery-status.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`${report.readyStories}/${report.requiredStories} stories ready; ${report.reviewedImages} reviewed images.`);
