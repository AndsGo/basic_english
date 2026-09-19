import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['support', 'operation', 'to help a person or thing', 'support'],
  ['reward', 'general_thing', 'a good thing for good work', 'reward'],
  ['servant', 'general_thing', 'a person who works to help another person', 'servant'],
  ['cord', 'picturable_thing', 'a long thin thing used to join things', 'cord'],
  ['fire', 'picturable_thing', 'heat and light from burning', 'fire'],
  ['horse', 'picturable_thing', 'a big animal used for work', 'horse'],
  ['instrument', 'picturable_thing', 'a thing used to make music or do work', 'instrument'],
  ['iron', 'picturable_thing', 'a metal thing used to make clothes smooth', 'iron'],
  ['kettle', 'picturable_thing', 'a thing for making water warm', 'kettle'],
  ['leaf', 'picturable_thing', 'the flat green part of a plant', 'leaf'],
  ['machine', 'picturable_thing', 'a thing with parts that does work', 'machine'],
  ['nail', 'picturable_thing', 'a small metal part used to join things', 'nail'],
  ['needle', 'picturable_thing', 'a thin sharp thing used with thread', 'needle'],
  ['pipe', 'picturable_thing', 'a hollow thing that carries water or air', 'pipe'],
  ['plant', 'picturable_thing', 'a green thing from the earth', 'plant'],
  ['sheep', 'picturable_thing', 'an animal with wool', 'sheep'],
  ['ship', 'picturable_thing', 'a big boat for a journey or carrying things', 'ship'],
  ['peace', 'general_thing', 'a quiet time with no fight', 'peace'],
  ['relation', 'general_thing', 'a person with a family connection', 'relation'],
  ['male', 'quality', 'being a man or boy', 'male'],
  ['married', 'quality', 'with another person in a family', 'married'],
  ['opinion', 'general_thing', 'what a person has in mind', 'opinion'],
  ['person', 'general_thing', 'a man or woman', 'person'],
  ['representative', 'general_thing', 'a person who speaks or acts for others', 'representative'],
  ['secretary', 'general_thing', 'a person who helps with office work', 'secretary'],
  ['owner', 'general_thing', 'a person who has a thing', 'owner'],
  ['society', 'general_thing', 'a group living and working together', 'society'],
  ['nation', 'general_thing', 'a country and its group', 'nation'],
  ['religion', 'general_thing', 'a belief for a group', 'religion'],
  ['respect', 'general_thing', 'care and good feeling for another person', 'respect'],
  ['son', 'general_thing', 'a male family person', 'son'],
  ['story', 'general_thing', 'an account of events', 'story'],
  ['hearing', 'general_thing', 'power for sound', 'hearing'],
  ['natural', 'quality', 'from the earth and not from a machine', 'natural'],
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
    outputTask: { id: `day-${n}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is clear?'], template: [sentence, `The ${second} is clear.`, 'This person can help.', 'I can say more.'], requiredSentenceCount: 4, storyMode: isCheck ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` },
    ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}),
  };
};

const weekDays = (weekNumber: number, weekId: string, title: string, wordIds: string[]) => Array.from({ length: 7 }, (_, index) => {
  const start = index * 2;
  const ids = index === 6 ? wordIds.slice(start, start + 5) : wordIds.slice(start, start + 2);
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, ids, index === 6);
});

export const week35Words = makeWords(entries.slice(0, 17), 35, ['help', 'support', 'people']);
export const week36Words = makeWords(entries.slice(17), 36, ['people', 'relations', 'story']);

export const week35: Week = { id: 'week-35', number: 35, title: 'Help and Support', goal: 'Offer help and care.', days: weekDays(35, 'week-35', 'Help and Support', entries.slice(0, 17).map(([id]) => id)) };
export const week36: Week = { id: 'week-36', number: 36, title: 'Person Story', goal: 'Tell a story about a group.', days: weekDays(36, 'week-36', 'Person Story', entries.slice(17).map(([id]) => id)) };

export const week35to36 = [week35, week36];
