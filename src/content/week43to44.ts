import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];
const entries: Entry[] = [
  ['impulse', 'general_thing', 'a sudden want to do a thing', 'impulse'],
  ['observation', 'general_thing', 'a thing you see by looking', 'observation'],
  ['theory', 'general_thing', 'an idea about how a thing works', 'theory'],
  ['nerve', 'picturable_thing', 'a body part used for feeling', 'nerve'],
  ['sense', 'general_thing', 'a way to feel things', 'sense'],
  ['separate', 'operation', 'to put things in different places', 'separate'],
  ['simple', 'quality', 'not hard to understand or do', 'simple'],
  ['level', 'general_thing', 'a flat line or position', 'level'],
  ['space', 'picturable_thing', 'empty room between things', 'space'],
  ['probable', 'quality', 'likely to be true', 'probable'],
  ['sudden', 'quality', 'quick and not wanted', 'sudden'],
  ['tendency', 'general_thing', 'a way a thing often acts', 'tendency'],
  ['sign', 'picturable_thing', 'a thing that shows an idea', 'sign'],
  ['sound', 'picturable_thing', 'what you get when a thing makes a noise', 'sound'],
  ['part', 'picturable_thing', 'one small thing in a big thing', 'part'],
  ['fiction', 'general_thing', 'a story that is not true', 'fiction'],
  ['view', 'general_thing', 'what you look at from a place', 'view'],
  ['place', 'picturable_thing', 'a part of space', 'place'],
  ['picture', 'picturable_thing', 'a thing that shows a person or place', 'picture'],
  ['plane', 'picturable_thing', 'a machine that flies in the air', 'plane'],
  ['play', 'operation', 'to use a thing for pleasure', 'play'],
  ['pleasure', 'general_thing', 'a good feeling from a thing', 'pleasure'],
  ['porter', 'picturable_thing', 'a person who carries things', 'porter'],
  ['present', 'general_thing', 'a thing you give to a person', 'present'],
  ['parcel', 'picturable_thing', 'a thing in paper for carrying', 'parcel'],
  ['pencil', 'picturable_thing', 'a thing for writing', 'pencil'],
  ['ray', 'picturable_thing', 'a line of light from the sun', 'ray'],
  ['sea', 'picturable_thing', 'a big part of salt water', 'sea'],
  ['sail', 'operation', 'to go on water in a ship', 'sail'],
  ['say', 'operation', 'to use words to give an idea', 'say'],
  ['sand', 'picturable_thing', 'very small stone', 'sand'],
  ['rough', 'quality', 'not smooth', 'rough'],
  ['political', 'quality', 'about government or a nation', 'political'],
  ['poor', 'quality', 'having little money or value', 'poor'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display]) => ({ id, text: id, category, definition, chinese: display, example: `The ${id} is clear.`, phonetic: `/${id}/`, weekIntroduced, tags }));
const weeklyRubric = { scale: { min: 0 as const, max: 2 as const }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 4 }, criteria: [
  { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] as [string, string, string] },
  { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] as [string, string, string] },
  { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] as [string, string, string] },
  { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] as [string, string, string] },
  { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] as [string, string, string] },
] };

const makeDay = (n: number, weekId: string, title: string, ids: string[], isCheck: boolean): Day => {
  const [first, second] = ids; const sentence = `The ${first} is clear.`;
  return { id: `day-${String(n).padStart(3, '0')}`, weekId, dayNumber: n, title, goal: `Describe ${title.toLowerCase()}.`, estimatedMinutes: 30, review: { wordCount: ids.length, patternCount: 2 }, wordIds: ids.concat(['good', 'thing', 'home', 'work']), patternIds: ['home-story', 'simple-fact'], exercises: [
    { type: 'choice', id: `day-${n}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    { type: 'fill_blank', id: `day-${n}-fill`, prompt: 'The ___ is clear.', acceptedAnswers: [first] },
    { type: 'sentence_order', id: `day-${n}-order`, tokens: ['clear', 'is', first, 'The'], correctOrder: ['The', first, 'is', 'clear'], finalSentence: sentence },
    { type: 'translation', id: `day-${n}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: `Describe ${title.toLowerCase()}.`, suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
    { type: 'choice', id: `day-${n}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
  ], outputTask: { id: `day-${n}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is clear?'], template: [sentence, `The ${second} is clear.`, 'This is a thing.', 'I can say more.'], requiredSentenceCount: 4, storyMode: isCheck ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` }, ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}) };
};
const weekDays = (weekId: string, weekNumber: number, title: string, ids: string[]) => Array.from({ length: 7 }, (_, index) => { const start = index * 2; return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? ids.slice(start, start + 5) : ids.slice(start, start + 2), index === 6); });

export const week43Words = makeWords(entries.slice(0, 17), 43, ['science', 'systems']);
export const week44Words = makeWords(entries.slice(17), 44, ['world', 'story']);
export const week43: Week = { id: 'week-43', number: 43, title: 'Science and Systems', goal: 'Describe science and systems.', days: weekDays('week-43', 43, 'Science and Systems', entries.slice(0, 17).map(([id]) => id)) };
export const week44: Week = { id: 'week-44', number: 44, title: 'Story Time', goal: 'Tell a story.', days: weekDays('week-44', 44, 'Story Time', entries.slice(17).map(([id]) => id)) };
export const week43to44 = [week43, week44];
