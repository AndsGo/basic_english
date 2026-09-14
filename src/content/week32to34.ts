import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category']];
const entries: Entry[] = [
  ['advertisement', 'general_thing'], ['apparatus', 'picturable_thing'], ['art', 'general_thing'], ['band', 'general_thing'], ['base', 'general_thing'], ['basin', 'picturable_thing'], ['bee', 'picturable_thing'], ['bell', 'picturable_thing'], ['berry', 'picturable_thing'], ['bird', 'picturable_thing'], ['blood', 'general_thing'], ['blade', 'picturable_thing'], ['brake', 'picturable_thing'], ['brass', 'picturable_thing'], ['bulb', 'picturable_thing'], ['canvas', 'picturable_thing'], ['carriage', 'picturable_thing'],
  ['cart', 'picturable_thing'], ['competition', 'general_thing'], ['cow', 'picturable_thing'], ['crush', 'operation'], ['cry', 'operation'], ['death', 'general_thing'], ['degree', 'general_thing'], ['design', 'general_thing'], ['discovery', 'general_thing'], ['distance', 'general_thing'], ['distribution', 'general_thing'], ['drain', 'picturable_thing'], ['driving', 'operation'], ['elastic', 'quality'], ['electric', 'quality'], ['engine', 'picturable_thing'], ['expansion', 'general_thing'], ['experience', 'general_thing'], ['expert', 'general_thing'],
  ['feather', 'picturable_thing'], ['field', 'picturable_thing'], ['fight', 'operation'], ['flag', 'picturable_thing'], ['flame', 'picturable_thing'], ['fold', 'operation'], ['fowl', 'picturable_thing'], ['goat', 'picturable_thing'], ['grain', 'picturable_thing'], ['grip', 'operation'], ['growth', 'general_thing'], ['gun', 'picturable_thing'], ['hammer', 'picturable_thing'], ['harbor', 'picturable_thing'], ['hard', 'quality'], ['harmony', 'general_thing'], ['hate', 'general_thing'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category]) => ({ id, text: id, category, definition: 'a thing', chinese: id, example: `The ${id} is good.`, phonetic: `/${id}/`, weekIntroduced, tags }));
const pair = (start: number) => entries.slice(start, start + 2).map(([id]) => id);
const makeDay = (n: number, weekId: string, title: string, ids: string[]): Day => {
  const [first, second] = ids;
  const sentence = `The ${first} is good.`;
  return {
    id: `day-${String(n).padStart(3, '0')}`, weekId, dayNumber: n, title, goal: 'Describe this thing.', estimatedMinutes: 30,
    review: { wordCount: ids.length, patternCount: 2 }, wordIds: ids.concat(['good', 'thing', 'home', 'work']), patternIds: ['home-story', 'simple-fact'],
    exercises: [
      { type: 'choice', id: `day-${n}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${n}-fill`, prompt: 'The ___ is good.', acceptedAnswers: [first] },
      { type: 'sentence_order', id: `day-${n}-order`, tokens: ['good', 'is', first, 'The'], correctOrder: ['The', first, 'is', 'good'], finalSentence: sentence },
      { type: 'translation', id: `day-${n}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: 'Describe this thing.', suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${n}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    ],
    outputTask: { id: `day-${n}-output`, topic: title, prompts: ['What can you say?', 'What is clear?'], template: [sentence, `The ${second} is good.`, 'This is a thing.', 'I can say more.'], requiredSentenceCount: 4, storyMode: n % 7 === 0 ? 'recap' : 'sentence', storyPrompt: 'Make a short story.' },
    ...(n % 7 === 0 ? { weeklyCheckRubric: { scale: { min: 0, max: 2 }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 4 }, criteria: [{ id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] }, { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] }, { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] }, { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] }, { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] }] } } : {}),
  };
};

const weekDays = (weekNumber: number, weekId: string, title: string) => Array.from({ length: 7 }, (_, index) => {
  const start = (weekNumber - 32) * 17 + index * 2;
  const ids = index === 6 ? pair(start).concat(pair(start + 2).slice(0, 3)) : pair(start);
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, ids);
});

export const week32Words = makeWords(entries.slice(0, 17), 32, ['work', 'people']);
export const week33Words = makeWords(entries.slice(17, 34), 33, ['places', 'community']);
export const week34Words = makeWords(entries.slice(34), 34, ['respect', 'agreement']);
export const week32: Week = { id: 'week-32', number: 32, title: 'Work Story', goal: 'Describe work.', days: weekDays(32, 'week-32', 'Work Story') };
export const week33: Week = { id: 'week-33', number: 33, title: 'Town Places', goal: 'Describe a place.', days: weekDays(33, 'week-33', 'Town Places') };
export const week34: Week = { id: 'week-34', number: 34, title: 'Agreement and Respect', goal: 'Say what is clear.', days: weekDays(34, 'week-34', 'Agreement and Respect') };
export const week32to34 = [week32, week33, week34];
