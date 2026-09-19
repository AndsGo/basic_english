import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['any', 'structure', 'one or more of a group', 'any'],
  ['bit', 'general_thing', 'a small part of a thing', 'bit'],
  ['loose', 'quality', 'not tight or fixed', 'loose'],
  ['moon', 'picturable_thing', 'the round light at night', 'moon'],
  ['mouth', 'picturable_thing', 'the opening used for eating and speaking', 'mouth'],
  ['nut', 'picturable_thing', 'a small hard food from a tree', 'nut'],
  ['quite', 'quality', 'to a high or complete degree', 'quite'],
  ['sad', 'quality', 'feeling not happy', 'sad'],
  ['skin', 'picturable_thing', 'the outside covering of a body', 'skin'],
  ['slow', 'quality', 'not quick', 'slow'],
  ['tall', 'quality', 'high over another thing', 'tall'],
  ['thick', 'quality', 'having much material from one side to the other', 'thick'],
  ['tight', 'quality', 'fixed close or hard to move', 'tight'],
  ['wet', 'quality', 'covered with water', 'wet'],
  ['wise', 'quality', 'showing good sense', 'wise'],
  ['strange', 'quality', 'not common or clear', 'strange'],
  ['slope', 'general_thing', 'a place that goes up or down', 'slope'],
  ['as', 'structure', 'in the same way or time as a thing', 'as'],
  ['at', 'structure', 'in a place or time', 'at'],
  ['be', 'structure', 'to have a form or condition', 'be'],
  ['by', 'structure', 'near a thing or through an action', 'by'],
  ['for', 'structure', 'with the purpose of helping or using', 'for'],
  ['if', 'structure', 'on the condition that something happens', 'if'],
  ['let', 'operation', 'to let a person do a thing', 'let'],
  ['no', 'structure', 'not any or not one', 'no'],
  ['not', 'structure', 'used to say no', 'not'],
  ['of', 'structure', 'showing the part of a thing', 'of'],
  ['off', 'structure', 'not on a place', 'off'],
  ['or', 'structure', 'used between other things', 'or'],
  ['other', 'quality', 'different from the first thing', 'other'],
  ['out', 'structure', 'not in a place', 'out'],
  ['over', 'structure', 'on the other side of a thing', 'over'],
  ['pin', 'picturable_thing', 'a small sharp thing used to join paper', 'pin'],
  ['plough', 'picturable_thing', 'a thing used to turn earth', 'plough'],
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
      prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is the reason?'],
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

export const week47Words = makeWords(entries.slice(0, 17), 47, ['comparison', 'quality']);
export const week48Words = makeWords(entries.slice(17), 48, ['argument', 'reason']);
export const week47: Week = { id: 'week-47', number: 47, title: 'Comparison and Quality', goal: 'Say how things are different and clear.', days: weekDays('week-47', 47, 'Comparison and Quality', entries.slice(0, 17).map(([id]) => id)) };
export const week48: Week = { id: 'week-48', number: 48, title: 'Argument and Reason', goal: 'Give a simple argument with reasons.', days: weekDays('week-48', 48, 'Argument and Reason', entries.slice(17).map(([id]) => id)) };
export const week47to48 = [week47, week48];
