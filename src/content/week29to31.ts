import type { Day, Week, Word } from '../domain/types';

type Entry = [string, Word['category'], string, string];

const entries: Entry[] = [
  ['daughter', 'general_thing', 'a family person', 'daughter'],
  ['female', 'quality', 'a woman or girl', 'female'],
  ['birth', 'general_thing', 'the start of life', 'birth'],
  ['country', 'general_thing', 'a nation or land', 'country'],
  ['group', 'general_thing', 'people together', 'group'],
  ['chief', 'general_thing', 'the main person', 'chief'],
  ['behavior', 'general_thing', 'the way a person acts', 'behavior'],
  ['beautiful', 'quality', 'very pleasing to see', 'beautiful'],
  ['amusement', 'general_thing', 'something that gives pleasure', 'amusement'],
  ['attraction', 'general_thing', 'a thing that draws interest', 'attraction'],
  ['cruel', 'quality', 'causing pain without care', 'cruel'],
  ['foolish', 'quality', 'not showing good sense', 'foolish'],
  ['general', 'quality', 'about most or all things', 'general'],
  ['great', 'quality', 'very good or large', 'great'],
  ['acid', 'general_thing', 'a strong chemical substance', 'acid'],
  ['bite', 'operation', 'to cut with the teeth', 'bite'],
  ['breath', 'general_thing', 'air taken in or sent out', 'breath'],
  ['chest', 'picturable_thing', 'the front part of the body', 'chest'],
  ['chin', 'picturable_thing', 'the lower part of the face', 'chin'],
  ['digestion', 'general_thing', 'the body process for food', 'digestion'],
  ['ear', 'picturable_thing', 'the body part used for hearing', 'ear'],
  ['earth', 'picturable_thing', 'the ground or our world', 'earth'],
  ['fat', 'quality', 'having much body matter', 'fat'],
  ['feeble', 'quality', 'not strong', 'feeble'],
  ['brain', 'picturable_thing', 'the body part used for thought', 'brain'],
  ['clock', 'picturable_thing', 'a thing that shows time', 'clock'],
  ['common', 'quality', 'seen or shared by many', 'common'],
  ['complex', 'quality', 'having many connected parts', 'complex'],
  ['conscious', 'quality', 'awake and aware', 'conscious'],
  ['cut', 'operation', 'to make an opening with a sharp thing', 'cut'],
  ['dead', 'quality', 'not alive', 'dead'],
  ['delicate', 'quality', 'easily damaged', 'delicate'],
  ['dirty', 'quality', 'not clean', 'dirty'],
  ['dog', 'picturable_thing', 'a common animal', 'dog'],
  ['dry', 'quality', 'without water', 'dry'],
  ['dust', 'picturable_thing', 'very small dry dirt', 'dust'],
  ['fall', 'operation', 'to move down', 'fall'],
  ['farm', 'picturable_thing', 'land used for growing or animals', 'farm'],
  ['fish', 'picturable_thing', 'an animal that lives in water', 'fish'],
  ['flight', 'general_thing', 'a journey through the air', 'flight'],
  ['fly', 'operation', 'to move through the air', 'fly'],
  ['form', 'general_thing', 'the shape or kind of a thing', 'form'],
  ['forward', 'quality', 'toward the front', 'forward'],
  ['gold', 'picturable_thing', 'a valuable yellow metal', 'gold'],
  ['grass', 'picturable_thing', 'small green plants on the ground', 'grass'],
  ['heart', 'picturable_thing', 'the body part that moves blood', 'heart'],
  ['existence', 'general_thing', 'the state of being real or alive', 'existence'],
  ['hospital', 'picturable_thing', 'a place for medical care', 'hospital'],
  ['stomach', 'picturable_thing', 'the body part that holds food', 'stomach'],
  ['throat', 'picturable_thing', 'the passage from mouth to body', 'throat'],
  ['tongue', 'picturable_thing', 'the body part used for taste', 'tongue'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, display]) => ({
  id,
  text: id,
  category,
  definition: 'a thing',
  chinese: display,
  example: `The ${id} is good.`,
  phonetic: `/${id}/`,
  weekIntroduced,
  tags,
}));

const wordIds = (start: number) => entries.slice(start, start + 2).map(([id]) => id);
const makeDay = (n: number, weekId: string, title: string, ids: string[]): Day => {
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
    outputTask: { id: `day-${n}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is clear?'], template: [sentence, `The ${second} is clear.`, 'This is a thing.', 'I can say more.'], requiredSentenceCount: 4, storyMode: n % 7 === 0 ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}` },
    ...(n % 7 === 0 ? { weeklyCheckRubric: { scale: { min: 0, max: 2 }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 4 }, criteria: [{ id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] }, { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] }, { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] }, { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] }, { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] }] } } : {}),
  };
};

export const week29Words = makeWords(entries.slice(0, 17), 29, ['family', 'relations']);
export const week30Words = makeWords(entries.slice(17, 34), 30, ['feelings', 'opinions']);
export const week31Words = makeWords(entries.slice(34), 31, ['health', 'body']);

const weekDays = (weekNumber: number, weekId: string, title: string) => Array.from({ length: 7 }, (_, index) => {
  const start = (weekNumber - 29) * 17 + index * 2;
  return makeDay((weekNumber - 1) * 7 + index + 1, weekId, `${title} ${index + 1}`, index === 6 ? wordIds(start).concat(wordIds(start + 2).slice(0, 3)) : wordIds(start));
});

export const week29: Week = { id: 'week-29', number: 29, title: 'Family Story', goal: 'Tell a story about home.', days: weekDays(29, 'week-29', 'Family Story') };
export const week30: Week = { id: 'week-30', number: 30, title: 'Feeling Story', goal: 'Say what you feel.', days: weekDays(30, 'week-30', 'Feeling Story') };
export const week31: Week = { id: 'week-31', number: 31, title: 'Body Story', goal: 'Describe the body.', days: weekDays(31, 'week-31', 'Body Story') };
export const week29to31 = [week29, week30, week31];
