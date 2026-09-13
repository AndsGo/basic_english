import type { Day, Pattern, Week, Word } from '../domain/types';

type Entry = [string, string, string, string, string];

const phonetics: Record<string, string> = {
  bottle: '/ˈbɒtəl/', brush: '/brʌʃ/', bucket: '/ˈbʌkɪt/', button: '/ˈbʌtən/', cloth: '/klɒθ/', coat: '/kəʊt/', comb: '/kəʊm/',
  fork: '/fɔːk/', glass: '/ɡlɑːs/', glove: '/ɡlʌv/', hat: '/hæt/', knife: '/naɪf/', plate: '/pleɪt/', soap: '/səʊp/',
  spoon: '/spuːn/', shoe: '/ʃuː/', shirt: '/ʃɜːt/', angle: '/ˈæŋɡəl/', arch: '/ɑːtʃ/', circle: '/ˈsɜːkəl/', edge: '/edʒ/',
  curve: '/kɜːv/', flat: '/flæt/', hole: '/həʊl/', point: '/pɔɪnt/', round: '/raʊnd/', square: '/skweə/', middle: '/ˈmɪdəl/',
  front: '/frʌnt/', position: '/pəˈzɪʃən/', opposite: '/ˈɒpəzɪt/', parallel: '/ˈpærəlel/', narrow: '/ˈnærəʊ/', amount: '/əˈmaʊnt/',
  balance: '/ˈbæləns/', equal: '/ˈiːkwəl/', increase: '/ɪnˈkriːs/', limit: '/ˈlɪmɪt/', measure: '/ˈmeʒə/', size: '/saɪz/',
  value: '/ˈvæljuː/', comparison: '/kəmˈpærɪsən/', complete: '/kəmˈpliːt/', different: '/ˈdɪfrənt/', high: '/haɪ/', low: '/ləʊ/',
  short: '/ʃɔːt/', long: '/lɒŋ/', wide: '/waɪd/', deep: '/diːp/', among: '/əˈmʌŋ/',
};

const entries: Entry[] = [
  ['bottle', 'picturable_thing', 'a thing for water', '瓶子', 'The bottle has water.'],
  ['brush', 'picturable_thing', 'a thing for cleaning', '刷子', 'I use a brush.'],
  ['bucket', 'picturable_thing', 'a thing for water', '桶', 'The bucket is full.'],
  ['button', 'picturable_thing', 'a small thing on clothes', '纽扣', 'The button is small.'],
  ['cloth', 'picturable_thing', 'a soft thing for cleaning', '布', 'The cloth is clean.'],
  ['coat', 'picturable_thing', 'clothes for cold weather', '外套', 'My coat is warm.'],
  ['comb', 'picturable_thing', 'a thing for hair', '梳子', 'I use a comb.'],
  ['fork', 'picturable_thing', 'a thing for eating', '叉子', 'The fork is on the plate.'],
  ['glass', 'picturable_thing', 'a thing for drinking', '玻璃杯', 'The glass has water.'],
  ['glove', 'picturable_thing', 'clothes for a hand', '手套', 'My glove is warm.'],
  ['hat', 'picturable_thing', 'clothes for the head', '帽子', 'The hat is on my head.'],
  ['knife', 'picturable_thing', 'a sharp thing for food', '刀', 'The knife is on the table.'],
  ['plate', 'picturable_thing', 'a thing for food', '盘子', 'The food is on the plate.'],
  ['soap', 'picturable_thing', 'a thing for washing', '肥皂', 'The soap is near the bath.'],
  ['spoon', 'picturable_thing', 'a thing for eating', '勺子', 'The spoon is in the cup.'],
  ['shoe', 'picturable_thing', 'clothes for a foot', '鞋', 'My shoe is black.'],
  ['shirt', 'picturable_thing', 'clothes for the body', '衬衫', 'My shirt is clean.'],
  ['angle', 'picturable_thing', 'a place where lines join', '角', 'The angle is small.'],
  ['arch', 'picturable_thing', 'a curved top', '拱形', 'The arch is high.'],
  ['circle', 'picturable_thing', 'a round form', '圆', 'The circle is round.'],
  ['edge', 'picturable_thing', 'the side of a thing', '边缘', 'The cup is at the edge.'],
  ['curve', 'picturable_thing', 'a line that is not straight', '曲线', 'The road has a curve.'],
  ['flat', 'quality', 'low and even', '平的', 'The box is flat.'],
  ['hole', 'picturable_thing', 'an open place in a thing', '洞', 'There is a hole in the box.'],
  ['point', 'picturable_thing', 'the end of a line', '点；尖端', 'The point is sharp.'],
  ['round', 'quality', 'like a circle', '圆的', 'The ball is round.'],
  ['square', 'picturable_thing', 'a form with equal sides', '正方形', 'The window is square.'],
  ['middle', 'position', 'the part between sides', '中间', 'The cup is in the middle.'],
  ['front', 'position', 'the part that is first', '前面', 'The chair is at the front.'],
  ['position', 'position', 'the place of a thing', '位置', 'The position is right.'],
  ['opposite', 'position', 'on the other side', '对面', 'The shop is opposite.'],
  ['parallel', 'quality', 'side by side', '平行的', 'The lines are parallel.'],
  ['narrow', 'quality', 'not wide', '窄的', 'The road is narrow.'],
  ['among', 'position', 'in a group of things', '在其中', 'The cup is among the boxes.'],
  ['amount', 'quality', 'how much there is', '数量', 'The amount is small.'],
  ['balance', 'picturable_thing', 'a good form with equal sides', '平衡', 'The box has balance.'],
  ['equal', 'quality', 'the same in number or size', '相等的', 'The cups are equal.'],
  ['increase', 'action', 'to be more', '增加', 'The number can increase.'],
  ['limit', 'picturable_thing', 'the last point', '限制；界限', 'This is the limit.'],
  ['measure', 'action', 'to find the size', '测量', 'I measure the table.'],
  ['size', 'quality', 'how big a thing is', '尺寸', 'The size is small.'],
  ['value', 'quality', 'how much a thing can cost', '价值', 'The value is high.'],
  ['comparison', 'quality', 'a look at things', '比较', 'The comparison is clear.'],
  ['complete', 'quality', 'with all parts', '完整的', 'The list is complete.'],
  ['different', 'quality', 'not the same', '不同的', 'The cups are different.'],
  ['high', 'quality', 'far up', '高的', 'The shelf is high.'],
  ['low', 'quality', 'near the floor', '低的', 'The chair is low.'],
  ['short', 'quality', 'not long', '短的', 'The line is short.'],
  ['long', 'quality', 'with much size from end to end', '长的', 'The road is long.'],
  ['wide', 'quality', 'with much space from side to side', '宽的', 'The room is wide.'],
  ['deep', 'quality', 'far down', '深的', 'The box is deep.'],
];

const makeWords = (items: Entry[], weekIntroduced: number, tags: string[]) => items.map(([id, category, definition, chinese, example]) => ({
  id, text: id, category: category as Word['category'], definition, chinese, example, phonetic: phonetics[id], weekIntroduced, tags,
}));

export const week14Words = makeWords(entries.slice(0, 17), 14, ['things', 'daily-life']);
export const week15Words = makeWords(entries.slice(17, 34), 15, ['shape', 'place']);
export const week16Words = makeWords(entries.slice(34), 16, ['amount', 'comparison']);

export const week14to16Patterns: Pattern[] = [
  { id: 'there-is-a-thing', title: 'There is a ___.', use: 'Name one thing.', structure: 'There is a {thing}.', examples: ['There is a bottle.', 'There is a circle.'], slots: ['thing'] },
  { id: 'thing-is-position', title: 'The ___ is ___.', use: 'Say where a thing is.', structure: 'The {thing} is {place}.', examples: ['The cup is in the middle.', 'The shop is opposite.'], slots: ['thing', 'place'] },
  { id: 'thing-is-quality', title: 'The ___ is ___.', use: 'Describe a thing.', structure: 'The {thing} is {quality}.', examples: ['The road is narrow.', 'The box is deep.'], slots: ['thing', 'quality'] },
  { id: 'i-can-do', title: 'I can ___.', use: 'Say what you can do.', structure: 'I can {action}.', examples: ['I can measure the table.', 'I can use a brush.'], slots: ['action'] },
];

function makeDay(dayNumber: number, weekId: string, title: string, words: string[], sentence: string, answer: string, prompt: string, patternIds: string[]): Day {
  const first = words[0];
  const second = words[1] ?? first;
  return {
    id: `day-${String(dayNumber).padStart(3, '0')}`, weekId, dayNumber, title, goal: prompt, estimatedMinutes: 30,
    review: { wordCount: words.length, patternCount: 2 }, wordIds: words, patternIds,
    exercises: [
      { type: 'choice', id: `day-${dayNumber}-choice`, prompt: `Which sentence uses ${first}?`, options: [sentence, 'The weather is cold.', 'I will go tomorrow.'], correctOption: sentence },
      { type: 'fill_blank', id: `day-${dayNumber}-fill`, prompt: sentence.replace(first, '___'), acceptedAnswers: [answer] },
      { type: 'sentence_order', id: `day-${dayNumber}-order`, tokens: sentence.replace('.', '').split(' ').reverse(), correctOrder: sentence.replace('.', '').split(' '), finalSentence: sentence },
      { type: 'translation', id: `day-${dayNumber}-translation`, chinesePrompt: `请用 ${first} 描述一个简单场景。`, coreMeaningHint: prompt, suggestedPatternIds: [patternIds[0]], referenceAnswers: [sentence] },
      { type: 'choice', id: `day-${dayNumber}-choice-2`, prompt: 'Which sentence is clear?', options: [`The ${first} is good.`, 'The weather is cold.', 'I will go tomorrow.'], correctOption: `The ${first} is good.` },
    ],
    outputTask: { id: `day-${dayNumber}-output`, topic: title, prompts: [`What can you say about ${title.toLowerCase()}?`, 'What is one thing like?'], template: [sentence, `The ${first} is good.`, `There is a ${second}.`, `I see the ${first}.`, `The ${second} is good.`, `I use the ${first}.`], requiredSentenceCount: 4, storyMode: dayNumber % 7 === 0 ? 'recap' : 'sentence', storyPrompt: `Make a short story about ${title.toLowerCase()}.` },
    ...(dayNumber % 7 === 0 ? { weeklyCheckRubric: { scale: { min: 0, max: 2 }, pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 6 }, criteria: [{ id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] }, { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] }, { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] }, { id: 'word-use', label: 'Word use', scores: ['not enough words', 'some words', 'enough words'] }, { id: 'independence', label: 'My words', scores: ['same as example', 'some change', 'all my words'] }] } } : {}),
  };
}

export const week14: Week = { id: 'week-14', number: 14, title: 'Things and Materials', goal: 'Describe common things used at home.', days: [
  makeDay(92, 'week-14', 'Water Things', ['bottle', 'bucket', 'glass', 'water', 'full', 'home'], 'The bottle has water.', 'bottle', 'Say what has water.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(93, 'week-14', 'Cleaning Things', ['brush', 'cloth', 'soap', 'clean', 'use', 'water'], 'I use a brush.', 'brush', 'Say what you use to clean.', ['i-can-do', 'thing-is-quality']),
  makeDay(94, 'week-14', 'Clothes', ['coat', 'glove', 'hat', 'shirt', 'shoe', 'clean'], 'My coat is warm.', 'coat', 'Describe clothes.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(95, 'week-14', 'Food Things', ['fork', 'knife', 'plate', 'spoon', 'food', 'table'], 'The fork is on the plate.', 'fork', 'Say what is used for food.', ['there-is-a-thing', 'thing-is-position']),
  makeDay(96, 'week-14', 'Small Parts', ['button', 'comb', 'cloth', 'shirt', 'small', 'clean'], 'The button is small.', 'button', 'Describe a small part of a thing.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(97, 'week-14', 'Things at Home', ['bottle', 'brush', 'fork', 'hat', 'soap', 'plate'], 'There is a bottle.', 'bottle', 'Name things at home.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(98, 'week-14', 'Week 14 Things Story', ['bottle', 'coat', 'fork', 'glass', 'shoe', 'soap'], 'There is a glass.', 'glass', 'Tell a story about things at home.', ['there-is-a-thing', 'thing-is-quality']),
] };

export const week15: Week = { id: 'week-15', number: 15, title: 'Forms and Position', goal: 'Describe simple forms and places.', days: [
  makeDay(99, 'week-15', 'Round Forms', ['angle', 'circle', 'round', 'point', 'small', 'ball'], 'The circle is round.', 'circle', 'Describe a round form.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(100, 'week-15', 'Lines and Sides', ['edge', 'curve', 'flat', 'line', 'straight', 'road'], 'The road has a curve.', 'curve', 'Describe a line or side.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(101, 'week-15', 'Open Places', ['arch', 'hole', 'square', 'window', 'open', 'box'], 'There is a hole in the box.', 'hole', 'Describe an open place.', ['there-is-a-thing', 'thing-is-position']),
  makeDay(102, 'week-15', 'Middle and Front', ['middle', 'front', 'position', 'chair', 'room', 'table'], 'The cup is in the middle.', 'middle', 'Say where a thing is.', ['thing-is-position', 'there-is-a-thing']),
  makeDay(103, 'week-15', 'Other Side', ['opposite', 'parallel', 'narrow', 'road', 'among', 'shop'], 'The shop is opposite.', 'opposite', 'Describe places on a side.', ['thing-is-position', 'thing-is-quality']),
  makeDay(104, 'week-15', 'Forms at Home', ['circle', 'square', 'edge', 'front', 'middle', 'room'], 'The window is square.', 'square', 'Describe forms at home.', ['there-is-a-thing', 'thing-is-quality']),
  makeDay(105, 'week-15', 'Week 15 Form Story', ['circle', 'hole', 'middle', 'opposite', 'square', 'narrow'], 'There is a circle.', 'circle', 'Tell a story about form and place.', ['there-is-a-thing', 'thing-is-position']),
] };

export const week16: Week = { id: 'week-16', number: 16, title: 'Amount and Comparison', goal: 'Look at simple things and amounts.', days: [
  makeDay(106, 'week-16', 'How Much', ['amount', 'balance', 'equal', 'number', 'same', 'cup'], 'The amount is small.', 'amount', 'Say how much there is.', ['thing-is-quality', 'there-is-a-thing']),
  makeDay(107, 'week-16', 'More and Less', ['increase', 'limit', 'more', 'less', 'number', 'amount'], 'The number can increase.', 'increase', 'Say how a number can change.', ['i-can-do', 'thing-is-quality']),
  makeDay(108, 'week-16', 'Measure Things', ['measure', 'size', 'long', 'short', 'table', 'box'], 'I measure the table.', 'measure', 'Look at the size of things.', ['i-can-do', 'thing-is-quality']),
  makeDay(109, 'week-16', 'Value', ['value', 'price', 'cheap', 'dear', 'money', 'thing'], 'The value is high.', 'value', 'Talk about the value of a thing.', ['thing-is-quality', 'there-is-a-thing']),
  makeDay(110, 'week-16', 'Same and Different', ['comparison', 'complete', 'different', 'same', 'list', 'cup'], 'The cups are different.', 'different', 'Say how things are different.', ['thing-is-quality', 'there-is-a-thing']),
  makeDay(111, 'week-16', 'High and Wide', ['high', 'low', 'wide', 'deep', 'room', 'table'], 'The room is wide.', 'wide', 'Describe size and place.', ['thing-is-quality', 'thing-is-position']),
  makeDay(112, 'week-16', 'Week 16 Comparison Story', ['amount', 'equal', 'measure', 'size', 'different', 'wide'], 'The cups are equal.', 'equal', 'Tell a story about amount and comparison.', ['thing-is-quality', 'there-is-a-thing']),
] };

export const week14to16 = [week14, week15, week16];
