import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['bent', 'quality', 'not straight', 'bent'],
  ['blow', 'operation', 'to send air', 'blow'],
  ['boiling', 'quality', 'water changing in a pot', 'boiling'],
  ['burn', 'operation', 'to use fire on a thing', 'burn'],
  ['burst', 'operation', 'to open suddenly', 'burst'],
  ['fertile', 'quality', 'good for plant growth', 'fertile'],
  ['ice', 'picturable_thing', 'hard water in cold', 'ice'],
  ['island', 'picturable_thing', 'land with water near it', 'island'],
  ['land', 'picturable_thing', 'earth that is not water', 'land'],
  ['liquid', 'general_thing', 'a substance like water', 'liquid'],
  ['mist', 'picturable_thing', 'small water in the air', 'mist'],
  ['mountain', 'picturable_thing', 'very high land', 'mountain'],
  ['river', 'picturable_thing', 'moving water across land', 'river'],
  ['root', 'picturable_thing', 'the part of a plant under earth', 'root'],
  ['sky', 'picturable_thing', 'the air over the earth', 'sky'],
  ['snow', 'picturable_thing', 'white ice from the sky', 'snow'],
  ['thunder', 'picturable_thing', 'a loud sound in the sky', 'thunder'],
  ['horn', 'picturable_thing', 'a hard point on an animal head', 'horn'],
  ['insect', 'picturable_thing', 'a small animal with a hard body', 'insect'],
  ['jelly', 'picturable_thing', 'a soft sweet food', 'jelly'],
  ['monkey', 'picturable_thing', 'an animal with arms and a tail', 'monkey'],
  ['pig', 'picturable_thing', 'a common farm animal', 'pig'],
  ['rat', 'picturable_thing', 'a small animal with a long tail', 'rat'],
  ['seed', 'picturable_thing', 'a small thing from a plant', 'seed'],
  ['snake', 'picturable_thing', 'a long animal with no legs', 'snake'],
  ['sneeze', 'operation', 'to send air from the nose', 'sneeze'],
  ['swim', 'operation', 'to move in water', 'swim'],
  ['tail', 'picturable_thing', 'the part at the back of an animal', 'tail'],
  ['wing', 'picturable_thing', 'the part used by a bird to fly', 'wing'],
  ['worm', 'picturable_thing', 'a small long animal in earth', 'worm'],
  ['wool', 'picturable_thing', 'soft hair from a sheep', 'wool'],
  ['young', 'quality', 'not old', 'young'],
  ['spring', 'general_thing', 'the time when plants start', 'spring'],
  ['wave', 'picturable_thing', 'a moving line of water', 'wave'],
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

export const week37Words = makeWords(entries.slice(0, 17), 37, ['nature', 'weather']);
export const week38Words = makeWords(entries.slice(17), 38, ['animals', 'living']);

export const week37: Week = { id: 'week-37', number: 37, title: 'Land and Weather', goal: 'Describe land and weather.', days: weekDays('week-37', 37, 'Land and Weather', entries.slice(0, 17).map(([id]) => id)) };
export const week38: Week = { id: 'week-38', number: 38, title: 'Animals and Living Things', goal: 'Describe animals and living things.', days: weekDays('week-38', 38, 'Animals and Living Things', entries.slice(17).map(([id]) => id)) };

export const week37to38 = [week37, week38];
