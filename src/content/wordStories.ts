import catalog from './storybookCatalog.json';

export interface StorySemanticText {
  kind: string;
  label: string;
  lines: string[];
  accessibleSummary: string;
}

export interface WordStoryContent {
  id: string;
  sourceId: string;
  title: string;
  wordId: string;
  courseWeek: number;
  week: number;
  definition: string;
  definitionChinese: string;
  reviewWordIds: string[];
  narrator: string;
  narratorChinese: string;
  contextSupport: { text: string; definition: string; chinese: string }[];
  pages: { text: string; chinese: string; image: string; alt: string; semanticText?: StorySemanticText }[];
  check: {
    prompt: string;
    options: string[];
    correctIndex: number;
    success: string;
    retry: string;
    chinese: string;
  };
  practice: string;
  practiceExamples: string[];
}

const images = import.meta.glob<string>('../assets/word-stories/*.webp', { eager: true, import: 'default', query: '?url' });

export const wordStories: WordStoryContent[] = catalog.filter(story => story.ready).map(story => ({
  ...story,
  pages: story.pages.map(page => {
    const image = images[`../assets/word-stories/${page.file}`];
    if (!image) throw new Error(`Missing story artwork: ${page.file}`);
    return { ...page, image, semanticText: page.semanticText ?? undefined };
  }),
}));

export const giveStory = wordStories.find(story => story.wordId === 'give')!;
export const underStory = wordStories.find(story => story.wordId === 'under')!;
export const openStory = wordStories.find(story => story.wordId === 'open')!;
export const becauseStory = wordStories.find(story => story.wordId === 'because')!;
