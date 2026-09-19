import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['about', 'structure', 'near a thing or about a thing', 'about'],
  ['come', 'operation', 'to move to a person or place', 'come'],
  ['hanging', 'quality', 'hanging from a wall', 'hanging'],
  ['jump', 'operation', 'to move up from the floor', 'jump'],
  ['motion', 'general_thing', 'the act of moving', 'motion'],
  ['news', 'general_thing', 'new words about a thing', 'news'],
  ['send', 'operation', 'to cause a thing to go to a person or place', 'send'],
  ['shake', 'operation', 'to move quickly from side to side', 'shake'],
  ['shock', 'general_thing', 'a sudden strong feeling or surprise', 'shock'],
  ['slip', 'operation', 'to move on a wet floor', 'slip'],
  ['smell', 'general_thing', 'what the nose feels from a thing', 'smell'],
  ['smoke', 'picturable_thing', 'a cloud from fire in the air', 'smoke'],
  ['song', 'general_thing', 'words and music for a song', 'song'],
  ['stage', 'picturable_thing', 'a high place for a show', 'stage'],
  ['step', 'operation', 'to move one foot after the other', 'step'],
  ['trouble', 'general_thing', 'a problem that needs help', 'trouble'],
  ['twist', 'operation', 'to turn one part on another', 'twist'],
  ['against', 'structure', 'not with a person or thing', 'against'],
  ['bitter', 'quality', 'having a sharp taste that is not sweet', 'bitter'],
  ['between', 'structure', 'in the middle of things', 'between'],
  ['insurance', 'general_thing', 'a way to get help after damage', 'insurance'],
  ['jewel', 'picturable_thing', 'a beautiful stone used for a thing', 'jewel'],
  ['kiss', 'operation', 'to touch with the lips as a sign of love', 'kiss'],
  ['living', 'quality', 'a thing that is not dead', 'living'],
  ['muscle', 'picturable_thing', 'a body part used to move', 'muscle'],
  ['music', 'general_thing', 'sound for a person to feel', 'music'],
  ['ornament', 'picturable_thing', 'a thing used to make a place beautiful', 'ornament'],
  ['poison', 'picturable_thing', 'a substance that can cause death or pain', 'poison'],
  ['prose', 'general_thing', 'language in a book, not a song', 'prose'],
  ['rhythm', 'general_thing', 'a regular way sound or action goes', 'rhythm'],
  ['sharp', 'quality', 'having an edge that can cut', 'sharp'],
  ['smooth', 'quality', 'not rough to touch', 'smooth'],
  ['sponge', 'picturable_thing', 'a soft thing that takes in water', 'sponge'],
  ['structure', 'general_thing', 'the way parts are put together', 'structure'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display]) => ({
  id,
  text: id,
  category,
  definition,
  chinese: display,
  example: `The ${id} is clear.`,
  phonetic: `/${id}/`,
  weekIntroduced,
  tags,
}));

const weeklyRubric = {
  scale: { min: 0 as const, max: 2 as const },
  pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 4 },
  criteria: [
    { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] as [string, string, string] },
    { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] as [string, string, string] },
    { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] as [string, string, string] },
    { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] as [string, string, string] },
    { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] as [string, string, string] },
  ],
};

const makeDay = (number: number, weekId: string, title: string, ids: string[], isCheck: boolean): Day => {
  const [first, second] = ids;
  const sentence = `The ${first} is clear.`;
  return {
    id: `day-${String(number).padStart(3, '0')}`,
    weekId,
    dayNumber: number,
    title,
    goal: `Describe ${title.toLowerCase()}.`,
    estimatedMinutes: 30,
    review: { wordCount: ids.length, patternCount: 2 },
    wordIds: ids.concat(['good', 'thing', 'home', 'work']),
    patternIds: ['home-story', 'simple-fact'],
    exercises: [
      { type: 'choice', id: `day-${number}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${number}-fill`, prompt: 'The ___ is clear.', acceptedAnswers: [first] },
      { type: 'sentence_order', id: `day-${number}-order`, tokens: ['clear', 'is', first, 'The'], correctOrder: ['The', first, 'is', 'clear'], finalSentence: sentence },
      { type: 'translation', id: `day-${number}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: `Describe ${title.toLowerCase()}.`, suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${number}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    ],
    outputTask: {
      id: `day-${number}-output`,
      topic: title,
      prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is the story?'],
      template: [sentence, `The ${second} is clear.`, 'This is a thing.', 'I can say more.'],
      requiredSentenceCount: 4,
      storyMode: isCheck ? 'recap' : 'sentence',
      storyPrompt: `Make a short story about ${title.toLowerCase()}`,
    },
    ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}),
  };
};

const weekDays = (weekId: string, weekNumber: number, title: string, ids: string[]) => Array.from({ length: 7 }, (_, index) => {
  const start = index * 2;
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? ids.slice(start, start + 5) : ids.slice(start, start + 2), index === 6);
});

export const week45Words = makeWords(entries.slice(0, 17), 45, ['past', 'story']);
export const week46Words = makeWords(entries.slice(17), 46, ['future', 'purpose']);
export const week45: Week = { id: 'week-45', number: 45, title: 'Past Story', goal: 'Tell a past story.', days: weekDays('week-45', 45, 'Past Story', entries.slice(0, 17).map(([id]) => id)) };
export const week46: Week = { id: 'week-46', number: 46, title: 'Future Purpose', goal: 'Say what will be true and why.', days: weekDays('week-46', 46, 'Future Purpose', entries.slice(17).map(([id]) => id)) };
export const week45to46 = [week45, week46];
