import type { Day, Pattern, Week, Word } from '../domain/types';

const phonetics: Record<string, string> = {
  apple: '/ˈæpəl/', arm: '/ɑːm/', animal: '/ˈænɪməl/', ant: '/ænt/', ball: '/bɔːl/',
  basket: '/ˈbɑːskɪt/', bath: '/bɑːθ/', branch: '/brɑːntʃ/', brick: '/brɪk/', boat: '/bəʊt/',
  bone: '/bəʊn/', boot: '/buːt/', cake: '/keɪk/', camera: '/ˈkæmərə/', cat: '/kæt/',
  chain: '/tʃeɪn/', chalk: '/tʃɔːk/',
};

const entries: Array<[string, string, string, string, string]> = [
  ['apple', 'picturable_thing', 'a round fruit', '苹果', 'I eat an apple.'],
  ['arm', 'picturable_thing', 'the part between the body and hand', '手臂', 'My arm is strong.'],
  ['animal', 'general_thing', 'a living thing that is not a plant', '动物', 'A cat is an animal.'],
  ['ant', 'picturable_thing', 'a small insect', '蚂蚁', 'The ant is small.'],
  ['ball', 'picturable_thing', 'a round thing for play', '球', 'The ball is on the floor.'],
  ['basket', 'picturable_thing', 'a thing for carrying other things', '篮子', 'The apple is in the basket.'],
  ['bath', 'picturable_thing', 'a place or act of washing the body', '浴缸；洗澡', 'I have a bath.'],
  ['branch', 'picturable_thing', 'a part of a tree', '树枝', 'The bird is on a branch.'],
  ['brick', 'picturable_thing', 'a hard thing for building', '砖', 'The wall has a brick.'],
  ['boat', 'picturable_thing', 'a small vessel for going on water', '船', 'The boat is on the water.'],
  ['bone', 'picturable_thing', 'a hard part in a body', '骨头', 'The dog has a bone.'],
  ['boot', 'picturable_thing', 'a strong shoe that covers the foot', '靴子', 'My boot is wet.'],
  ['cake', 'picturable_thing', 'sweet food for eating', '蛋糕', 'The cake is good.'],
  ['camera', 'picturable_thing', 'a thing for taking pictures', '相机', 'I use a camera.'],
  ['cat', 'picturable_thing', 'a small animal in a home', '猫', 'The cat is near the chair.'],
  ['chain', 'picturable_thing', 'joined metal rings', '链条', 'The chain is long.'],
  ['chalk', 'picturable_thing', 'a soft stick for writing on a board', '粉笔', 'I write with chalk.'],
];

export const week13Words: Word[] = entries.map(([id, category, definition, chinese, example]) => ({
  id, text: id, category: category as Word['category'], definition, chinese, example,
  phonetic: phonetics[id], weekIntroduced: 13, tags: ['home', 'things'],
}));

export const week13Patterns: Pattern[] = [
  { id: 'there-is-object', title: 'There is a ___.', use: 'Name one thing in a place.', structure: 'There is a {thing}.', examples: ['There is a ball.', 'There is a basket.'], slots: ['thing'] },
  { id: 'object-is-place', title: 'The ___ is ___.', use: 'Describe where a thing is.', structure: 'The {thing} is {place}.', examples: ['The ball is on the floor.', 'The cat is near the chair.'], slots: ['thing', 'place'] },
  { id: 'i-use-object', title: 'I use a ___.', use: 'Say what thing you use.', structure: 'I use a {thing}.', examples: ['I use a camera.', 'I use chalk.'], slots: ['thing'] },
  { id: 'object-is-quality', title: 'The ___ is ___.', use: 'Describe a thing.', structure: 'The {thing} is {quality}.', examples: ['The chain is long.', 'The boot is wet.'], slots: ['thing', 'quality'] },
];

function day(dayNumber: number, title: string, words: string[], fill: string, answer: string, sentence: string, prompt: string): Day {
  return {
    id: `day-${String(dayNumber).padStart(3, '0')}`, weekId: 'week-13', dayNumber, title,
    goal: prompt, estimatedMinutes: 30, review: { wordCount: words.length, patternCount: 2 }, wordIds: words,
    patternIds: ['there-is-object', 'object-is-quality'],
    exercises: [
      { type: 'choice', id: `day-${dayNumber}-choice`, prompt: `Which sentence uses ${words[0]}?`, options: [sentence, 'The weather is cold.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${dayNumber}-fill`, prompt: fill, acceptedAnswers: [answer] },
      { type: 'sentence_order', id: `day-${dayNumber}-order`, tokens: sentence.replace('.', '').split(' ').reverse(), correctOrder: sentence.replace('.', '').split(' '), finalSentence: sentence },
      { type: 'translation', id: `day-${dayNumber}-translation`, chinesePrompt: `请用 ${words[0]} 描述一个简单场景。`, coreMeaningHint: prompt, suggestedPatternIds: ['there-is-object'], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${dayNumber}-choice-2`, prompt: 'Which sentence is clear?', options: [`The ${words[0]} is good.`, 'The weather is cold.', 'I will go tomorrow.'], correctOption: `The ${words[0]} is good.` },
    ],
    outputTask: { id: `day-${dayNumber}-output`, topic: title, prompts: [`What can you see about ${title.toLowerCase()}?`, 'What is one thing like?'], template: [sentence, `The ${words[0]} is good.`, `There is a ${words[1]}.`, `I see the ${words[0]}.`, `The ${words[1]} is good.`, `I use the ${words[0]}.`], requiredSentenceCount: 4, storyMode: dayNumber === 91 ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}.` },
    ...(dayNumber === 91 ? { weeklyCheckRubric: { scale: { min: 0, max: 2 }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 6 }, criteria: [{ id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] }, { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] }, { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] }, { id: 'word-use', label: 'Word use', scores: ['not enough things words', 'some things words', 'enough things words'] }, { id: 'independence', label: 'My words', scores: ['same as example', 'some change from example', 'all my words'] }] } } : {}),
  };
}

export const week13: Week = {
  id: 'week-13', number: 13, title: 'Things at Home', goal: 'Describe simple things and things in a home scene.',
  days: [
    day(85, 'Fruit and Body', ['apple', 'arm', 'animal', 'ant', 'good', 'small'], 'I eat an ___.', 'apple', 'I eat an apple.', 'Say what you see and eat.'),
    day(86, 'Animals', ['animal', 'ant', 'cat', 'bone', 'small', 'near'], 'A cat is an ___.', 'animal', 'A cat is an animal.', 'Name a small animal.'),
    day(87, 'Play Things', ['ball', 'basket', 'cake', 'boat', 'good', 'big'], 'There is a ___.', 'ball', 'There is a ball.', 'Name things for play and food.'),
    day(88, 'Bath and Boots', ['bath', 'boot', 'water', 'clean', 'foot', 'clothes'], 'My ___ is clean.', 'boot', 'My boot is clean.', 'Describe washing and clothes.'),
    day(89, 'Tree and Wall', ['branch', 'brick', 'bone', 'tree', 'good', 'home'], 'The ___ is good.', 'branch', 'The branch is good.', 'Describe parts of a tree and wall.'),
    day(90, 'Camera and Chalk', ['camera', 'chalk', 'chain', 'write', 'use', 'paper'], 'I use a ___.', 'camera', 'I use a camera.', 'Say what things you use.'),
    day(91, 'Week 13 Home Story', ['apple', 'basket', 'cat', 'ball', 'camera', 'chalk', 'boat', 'brick', 'branch', 'boot'], 'There is a ___.', 'basket', 'There is a basket.', 'Tell a full story about things and things.'),
  ],
};
