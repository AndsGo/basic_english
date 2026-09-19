import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];
const entries: Entry[] = [
  ['here', 'structure', 'in this place', 'here'],
  ['look', 'operation', 'to use the eyes to see', 'look'],
  ['net', 'picturable_thing', 'a thing of lines for fish', 'net'],
  ['shut', 'operation', 'to close a thing', 'shut'],
  ['smash', 'operation', 'to damage a thing with force', 'smash'],
  ['sock', 'picturable_thing', 'a cloth covering for the foot', 'sock'],
  ['stamp', 'picturable_thing', 'a small mark or paper used for sending a letter', 'stamp'],
  ['station', 'picturable_thing', 'a place where trains or buses stop', 'station'],
  ['sticky', 'quality', 'fixed to a thing when touched', 'sticky'],
  ['stitch', 'operation', 'to join cloth with thread', 'stitch'],
  ['stretch', 'operation', 'to make a thing long or wide', 'stretch'],
  ['thread', 'picturable_thing', 'a thin line used for joining cloth', 'thread'],
  ['ticket', 'picturable_thing', 'a paper for a train or station', 'ticket'],
  ['touch', 'operation', 'to put a hand or thing on another thing', 'touch'],
  ['umbrella', 'picturable_thing', 'a thing over the body in rain', 'umbrella'],
  ['whip', 'picturable_thing', 'a long thin thing used to make an animal go', 'whip'],
  ['wound', 'general_thing', 'a bad place on the body', 'wound'],
  ['and', 'structure', 'used to join more than one idea or thing', 'and'],
  ['but', 'structure', 'used to show a different idea', 'but'],
  ['how', 'structure', 'used to ask about the way a thing happens', 'how'],
  ['may', 'structure', 'used to say that a thing is possible', 'may'],
  ['mine', 'structure', 'a thing that is my thing', 'mine'],
  ['seem', 'operation', 'to look as if a thing is true', 'seem'],
  ['self', 'general_thing', 'the person or thing', 'self'],
  ['sex', 'general_thing', 'male or female form', 'sex'],
  ['shame', 'general_thing', 'a bad feeling about a wrong thing', 'shame'],
  ['side', 'picturable_thing', 'one part at the left or right of a thing', 'side'],
  ['sort', 'operation', 'to put things in groups', 'sort'],
  ['special', 'quality', 'different from other things in a good way', 'special'],
  ['star', 'picturable_thing', 'a bright point in the night sky', 'star'],
  ['stem', 'picturable_thing', 'the thin part that has a leaf or flower', 'stem'],
  ['stiff', 'quality', 'hard to move or change form', 'stiff'],
  ['word', 'general_thing', 'a sound or mark that gives an idea', 'word'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display]) => ({ id, text: id, category, definition, chinese: display, example: `The ${id} is clear.`, phonetic: `/${id}/`, weekIntroduced, tags }));
const weeklyRubric = { scale: { min: 0 as const, max: 2 as const }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 4 }, criteria: [
  { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] as [string, string, string] },
  { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] as [string, string, string] },
  { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] as [string, string, string] },
  { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] as [string, string, string] },
  { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] as [string, string, string] },
] };
const makeDay = (number: number, weekId: string, title: string, ids: string[], isCheck: boolean): Day => {
  const [first, second] = ids; const sentence = `The ${first} is clear.`;
  return { id: `day-${String(number).padStart(3, '0')}`, weekId, dayNumber: number, title, goal: `Describe ${title.toLowerCase()}.`, estimatedMinutes: 30, review: { wordCount: ids.length, patternCount: 2 }, wordIds: ids.concat(['good', 'thing', 'home', 'work']), patternIds: ['home-story', 'simple-fact'], exercises: [
    { type: 'choice', id: `day-${number}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
    { type: 'fill_blank', id: `day-${number}-fill`, prompt: 'The ___ is clear.', acceptedAnswers: [first] },
    { type: 'sentence_order', id: `day-${number}-order`, tokens: ['clear', 'is', first, 'The'], correctOrder: ['The', first, 'is', 'clear'], finalSentence: sentence },
    { type: 'translation', id: `day-${number}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: `Describe ${title.toLowerCase()}.`, suggestedPatternIds: ['home-story'], referenceAnswers: [sentence] },
    { type: 'choice', id: `day-${number}-choice-2`, prompt: 'Which sentence is clear?', options: [sentence, 'The room is clean.', 'I will go tomorrow.'], correctOption: sentence },
  ], outputTask: { id: `day-${number}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What happens first?'], template: [sentence, `The ${second} is clear.`, 'This is a thing.', 'I can say more.'], requiredSentenceCount: 4, storyMode: isCheck ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` }, ...(isCheck ? { weeklyCheckRubric: weeklyRubric } : {}) };
};
const weekDays = (weekId: string, weekNumber: number, title: string, ids: string[]) => Array.from({ length: 7 }, (_, index) => { const start = index * 2; return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? ids.slice(start, start + 5) : ids.slice(start, start + 2), index === 6); });

export const week49Words = makeWords(entries.slice(0, 17), 49, ['instructions', 'process']);
export const week50Words = makeWords(entries.slice(17), 50, ['description', 'practice']);
export const week49: Week = { id: 'week-49', number: 49, title: 'Steps and Processes', goal: 'Give clear steps for a process.', days: weekDays('week-49', 49, 'Steps and Processes', entries.slice(0, 17).map(([id]) => id)) };
export const week50: Week = { id: 'week-50', number: 50, title: 'Description Practice', goal: 'Describe a new picture.', days: weekDays('week-50', 50, 'Description Practice', [...entries.slice(17).map(([id]) => id), 'i']) };
export const week49to50 = [week49, week50];
