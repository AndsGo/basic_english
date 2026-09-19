import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string, string];

const entries: Entry[] = [
  ['a', 'structure', 'one person or thing, not a named one', 'a', 'This is a room.'],
  ['so', 'structure', 'used to show what comes after a reason', 'so', 'It is late, so I rest.'],
  ['strong', 'quality', 'having much force', 'strong', 'The box is strong.'],
  ['such', 'structure', 'of this kind or sort', 'such', 'I have such a good day.'],
  ['sweet', 'quality', 'having a taste like sugar', 'sweet', 'The apple is sweet.'],
  ['system', 'general_thing', 'a group of parts that work together', 'system', 'The water system works.'],
  ['talk', 'operation', 'to use words with another person', 'talk', 'I talk with my friend.'],
  ['than', 'structure', 'used when one thing is more or less than another thing', 'than', 'This box is more than that box.'],
  ['that', 'structure', 'used for a thing far from me', 'that', 'That is a good book.'],
  ['the', 'structure', 'used for a person or thing in the story', 'the', 'The door is open.'],
  ['there', 'structure', 'in or at that place', 'there', 'The bag is there.'],
  ['thin', 'quality', 'not wide from one side to the other', 'thin', 'The paper is thin.'],
  ['though', 'structure', 'used to show a different fact', 'though', 'Though it is late, I work.'],
  ['through', 'structure', 'from one side to the other', 'through', 'I walk through the door.'],
  ['to', 'structure', 'in the direction of a person or place', 'to', 'I go to the town.'],
  ['top', 'picturable_thing', 'the part at the top of a thing', 'top', 'The cup is on top.'],
  ['town', 'picturable_thing', 'a place with houses, shops, and streets', 'town', 'The town is quiet.'],
  ['trick', 'operation', 'an action that makes a false thing seem true', 'trick', 'A person shows a trick.'],
  ['verse', 'general_thing', 'a short group of lines in a song', 'verse', 'I read a verse.'],
  ['very', 'structure', 'used to make a quality strong', 'very', 'The tea is warm.'],
  ['violent', 'quality', 'using strong force that can cause damage', 'violent', 'The wind is violent.'],
  ['war', 'general_thing', 'fighting between groups or countries', 'war', 'The story is about war.'],
  ['well', 'quality', 'in a good condition and not ill', 'well', 'I feel well.'],
  ['where', 'structure', 'used to ask about a place', 'where', 'Where is the key?'],
  ['who', 'structure', 'used to ask about a person', 'who', 'Who is at the door?'],
  ['why', 'structure', 'used to ask for a reason', 'why', 'Why are you late?'],
  ['wine', 'picturable_thing', 'a drink from fruit', 'wine', 'The wine is in the glass.'],
  ['yes', 'structure', 'a word used to say that a thing is true or wanted', 'yes', 'Yes, I can help.'],
  ['you', 'structure', 'the person I talk to', 'you', 'You are ready.'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display, example]) => ({
  id,
  text: id,
  category,
  definition,
  chinese: display,
  example,
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
  const sentence = first === 'a' ? 'This is a room.' : first === 'the' ? 'The door is open.' : `The ${first} is clear.`;
  const orderTokens = first === 'a' ? ['room', 'a', 'is', 'This'] : ['clear', 'is', first, 'The'];
  const correctOrder = first === 'a' ? ['This', 'is', 'a', 'room'] : ['The', first, 'is', 'clear'];
  return {
    id: `day-${String(number).padStart(3, '0')}`,
    weekId,
    dayNumber: number,
    title,
    goal: `Use ${title.toLowerCase()} in a short story.`,
    estimatedMinutes: 30,
    review: { wordCount: ids.length, patternCount: 2 },
    wordIds: ids.concat(['good', 'thing', 'home', 'work']),
    patternIds: ['home-story', 'simple-fact'],
    exercises: [
      { type: 'choice', id: `day-${number}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${number}-fill`, prompt: `Complete the sentence with ${first}.`, acceptedAnswers: [first] },
      { type: 'sentence_order', id: `day-${number}-order`, tokens: orderTokens, correctOrder, finalSentence: sentence },
      { type: 'translation', id: `day-${number}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: `Use ${first} in a short story.`, suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${number}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    ],
    outputTask: { id: `day-${number}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What happens first?'], template: [sentence, second ? `The ${second} is clear.` : 'This is a thing.', 'This is a good story.', 'I can say more.'], requiredSentenceCount: 4, storyMode: isCheck ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` },
    ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}),
  };
};

const weekDays = (weekId: string, weekNumber: number, title: string, ids: string[]) => Array.from({ length: 7 }, (_, index) => {
  const start = index * 2;
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? ids.slice(start, start + 5) : ids.slice(start, start + 2), index === 6);
});

export const week51Words = makeWords(entries.slice(0, 17), 51, ['final-coverage', 'story']);
export const week52Words = makeWords(entries.slice(17), 52, ['final-coverage', 'story']);
export const week51: Week = { id: 'week-51', number: 51, title: 'Order and Place', goal: 'Use order and place in a short story.', days: weekDays('week-51', 51, 'Order and Place', entries.slice(0, 17).map(([id]) => id)) };
const week52DayIds = [...entries.slice(17).map(([id]) => id), 'trick', 'verse', 'very', 'violent', 'war'];
export const week52: Week = { id: 'week-52', number: 52, title: 'Story Practice', goal: 'Tell a story with all the words.', days: weekDays('week-52', 52, 'Story Practice', week52DayIds) };
export const week51to52 = [week51, week52];
