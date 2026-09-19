import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['across', 'picturable_thing', 'from one side to the other', 'across'],
  ['down', 'picturable_thing', 'from a high place to a low place', 'down'],
  ['east', 'picturable_thing', 'the direction where the sun comes up', 'east'],
  ['drop', 'operation', 'to let a thing fall', 'drop'],
  ['join', 'operation', 'to come together with a person or group', 'join'],
  ['keep', 'operation', 'to have a thing and not give it', 'keep'],
  ['lead', 'operation', 'to show the way for a person', 'lead'],
  ['lift', 'operation', 'to move a thing up', 'lift'],
  ['move', 'operation', 'to go from one place to another', 'move'],
  ['rail', 'picturable_thing', 'a long line of metal for a train', 'rail'],
  ['range', 'general_thing', 'the space between ends', 'range'],
  ['roll', 'operation', 'to turn over and over', 'roll'],
  ['run', 'operation', 'to move quickly on foot', 'run'],
  ['street', 'picturable_thing', 'a road in a town', 'street'],
  ['train', 'picturable_thing', 'a line of things that moves on rails', 'train'],
  ['wheel', 'picturable_thing', 'a round part that helps a thing move', 'wheel'],
  ['west', 'picturable_thing', 'the direction where the sun goes down', 'west'],
  ['operation', 'operation', 'an action by a person', 'operation'],
  ['material', 'general_thing', 'the substance of a thing', 'material'],
  ['match', 'operation', 'to be the same as another thing', 'match'],
  ['mass', 'general_thing', 'the amount of a thing', 'mass'],
  ['metal', 'picturable_thing', 'a hard substance used to make things', 'metal'],
  ['payment', 'general_thing', 'money for a thing', 'payment'],
  ['receipt', 'picturable_thing', 'a paper that shows a payment', 'receipt'],
  ['rate', 'general_thing', 'a number that shows a price or amount', 'rate'],
  ['process', 'operation', 'actions that change a thing', 'process'],
  ['produce', 'operation', 'to make things or food', 'produce'],
  ['quality', 'general_thing', 'how good or bad a thing is', 'quality'],
  ['quick', 'quality', 'in a short time', 'quick'],
  ['quiet', 'quality', 'with little or no sound', 'quiet'],
  ['scale', 'picturable_thing', 'a thing used to measure weight', 'scale'],
  ['substance', 'general_thing', 'the material of a thing', 'substance'],
  ['trade', 'operation', 'to give one thing and get another', 'trade'],
  ['unit', 'general_thing', 'one part of a thing', 'unit'],
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

const makeDay = (n: number, weekId: string, title: string, ids: string[], isCheck: boolean): Day => {
  const [first, second] = ids;
  const sentence = `The ${first} is clear.`;
  return {
    id: `day-${String(n).padStart(3, '0')}`,
    weekId,
    dayNumber: n,
    title,
    goal: `Describe ${title.toLowerCase()}.`,
    estimatedMinutes: 30,
    review: { wordCount: ids.length, patternCount: 2 },
    wordIds: ids.concat(['good', 'thing', 'home', 'work']),
    patternIds: ['home-story', 'simple-fact'],
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

const weekDays = (weekId: string, weekNumber: number, title: string, wordIds: string[]) => Array.from({ length: 7 }, (_, index) => {
  const start = index * 2;
  const ids = index === 6 ? wordIds.slice(start, start + 5) : wordIds.slice(start, start + 2);
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, ids, index === 6);
});

export const week39Words = makeWords(entries.slice(0, 17), 39, ['travel', 'movement']);
export const week40Words = makeWords(entries.slice(17), 40, ['trade', 'money']);

export const week39: Week = { id: 'week-39', number: 39, title: 'Roads and Moving', goal: 'Talk about roads and moving.', days: weekDays('week-39', 39, 'Roads and Moving', entries.slice(0, 17).map(([id]) => id)) };
export const week40: Week = { id: 'week-40', number: 40, title: 'Trade and Money', goal: 'Describe trade and money.', days: weekDays('week-40', 40, 'Trade and Money', entries.slice(17).map(([id]) => id)) };

export const week39to40 = [week39, week40];
