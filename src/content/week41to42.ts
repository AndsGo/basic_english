import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['ink', 'picturable_thing', 'a dark liquid used for writing', 'ink'],
  ['invention', 'general_thing', 'a new thing from a person', 'invention'],
  ['knot', 'picturable_thing', 'a place where a cord joins', 'knot'],
  ['pump', 'picturable_thing', 'a machine that moves water or air', 'pump'],
  ['scissors', 'picturable_thing', 'a thing for cutting', 'scissors'],
  ['screw', 'picturable_thing', 'a small metal part used to join things', 'screw'],
  ['spade', 'picturable_thing', 'a thing for moving earth', 'spade'],
  ['stick', 'picturable_thing', 'a thin wood thing', 'stick'],
  ['steam', 'picturable_thing', 'water in the air', 'steam'],
  ['steel', 'picturable_thing', 'a strong metal', 'steel'],
  ['wire', 'picturable_thing', 'a thin line of metal', 'wire'],
  ['whistle', 'picturable_thing', 'a small thing that makes a sharp sound', 'whistle'],
  ['rod', 'picturable_thing', 'a thin straight material', 'rod'],
  ['rub', 'operation', 'to move one thing hard over another', 'rub'],
  ['pull', 'operation', 'to move a thing to you', 'pull'],
  ['push', 'operation', 'to move a thing from you', 'push'],
  ['kick', 'operation', 'to use the foot on a ball', 'kick'],
  ['industry', 'general_thing', 'work that makes things', 'industry'],
  ['leather', 'picturable_thing', 'strong material from animal skin', 'leather'],
  ['linen', 'picturable_thing', 'cloth from a plant', 'linen'],
  ['mixed', 'quality', 'with things together', 'mixed'],
  ['paint', 'picturable_thing', 'colored liquid on a thing', 'paint'],
  ['powder', 'picturable_thing', 'a dry substance of small parts', 'powder'],
  ['polish', 'operation', 'to make a thing smooth and bright', 'polish'],
  ['silk', 'picturable_thing', 'a smooth cloth', 'silk'],
  ['silver', 'picturable_thing', 'a bright gray metal', 'silver'],
  ['solid', 'quality', 'not liquid or air', 'solid'],
  ['stone', 'picturable_thing', 'a hard thing from earth', 'stone'],
  ['wax', 'picturable_thing', 'a soft substance for a light', 'wax'],
  ['waste', 'general_thing', 'a thing that is not wanted', 'waste'],
  ['vessel', 'picturable_thing', 'a thing for liquid', 'vessel'],
  ['physical', 'quality', 'of the body or a material thing', 'physical'],
  ['science', 'general_thing', 'knowledge from looking and testing', 'science'],
  ['hollow', 'quality', 'with an empty part', 'hollow'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display]) => ({
  id, text: id, category, definition, chinese: display, example: `The ${id} is clear.`, phonetic: `/${id}/`, weekIntroduced, tags,
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

const makeDay = (n: number, weekId: string, title: string, ids: string[], isCheck: boolean): Day => {
  const [first, second] = ids;
  const sentence = `The ${first} is clear.`;
  return {
    id: `day-${String(n).padStart(3, '0')}`, weekId, dayNumber: n, title, goal: `Describe ${title.toLowerCase()}.`, estimatedMinutes: 30,
    review: { wordCount: ids.length, patternCount: 2 }, wordIds: ids.concat(['good', 'thing', 'home', 'work']), patternIds: ['home-story', 'simple-fact'],
    exercises: [
      { type: 'choice', id: `day-${n}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${n}-fill`, prompt: 'The ___ is clear.', acceptedAnswers: [first] },
      { type: 'sentence_order', id: `day-${n}-order`, tokens: ['clear', 'is', first, 'The'], correctOrder: ['The', first, 'is', 'clear'], finalSentence: sentence },
      { type: 'translation', id: `day-${n}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: `Describe ${title.toLowerCase()}.`, suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${n}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    ],
    outputTask: { id: `day-${n}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is clear?'], template: [sentence, `The ${second} is clear.`, 'This is a thing.', 'I can say more.'], requiredSentenceCount: 4, storyMode: isCheck ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` },
    ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}),
  };
};

const weekDays = (weekId: string, weekNumber: number, title: string, ids: string[]) => Array.from({ length: 7 }, (_, index) => {
  const start = index * 2;
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? ids.slice(start, start + 5) : ids.slice(start, start + 2), index === 6);
});

export const week41Words = makeWords(entries.slice(0, 17), 41, ['tools', 'machines']);
export const week42Words = makeWords(entries.slice(17), 42, ['materials', 'production']);
export const week41: Week = { id: 'week-41', number: 41, title: 'Machines and Work', goal: 'Describe machines and work.', days: weekDays('week-41', 41, 'Machines and Work', entries.slice(0, 17).map(([id]) => id)) };
export const week42: Week = { id: 'week-42', number: 42, title: 'Materials and Making', goal: 'Describe materials and making.', days: weekDays('week-42', 42, 'Materials and Making', entries.slice(17).map(([id]) => id)) };
export const week41to42 = [week41, week42];
