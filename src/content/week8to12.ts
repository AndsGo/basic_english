import type { Day, Pattern, Week, WeeklyCheckRubric, Word, WordCategory } from '../domain/types';

function word(
  id: string,
  category: WordCategory,
  definition: string,
  chinese: string,
  example: string,
  weekIntroduced: number,
  tags: string[],
): Word {
  return {
    id,
    text: id,
    category,
    definition,
    phonetic: `/${id}/`,
    chinese,
    example,
    weekIntroduced,
    tags,
  };
}

function weeklyRubric(topic: string): WeeklyCheckRubric {
  return {
    scale: { min: 0, max: 2 },
    pass: { minimumTotalScore: 7, minimumMeaningScore: 1, minimumSentenceCount: 6 },
    criteria: [
      { id: 'meaning', label: 'Meaning', scores: ['hard to understand', 'partly clear', 'clear'] },
      { id: 'story-order', label: 'Story order', scores: ['not in order', 'some order', 'clear order'] },
      { id: 'target-patterns', label: 'Form use', scores: ['not used', 'used with help', 'used with no help'] },
      { id: 'word-use', label: 'Word use', scores: [`little ${topic} words`, `some ${topic} words`, `much ${topic} words`] },
      { id: 'independence', label: 'My words', scores: ['same as example', 'some change from example', 'all my words'] },
    ],
  };
}

interface DaySpec {
  dayNumber: number;
  weekId: string;
  title: string;
  goal: string;
  wordIds: string[];
  patternIds: string[];
  choicePrompt: string;
  choiceOptions: [string, string, string];
  correctOption: string;
  fillPrompt: string;
  fillAnswers: string[];
  orderTokens: string[];
  order: string[];
  finalSentence: string;
  secondFillPrompt: string;
  secondFillAnswers: string[];
  secondChoicePrompt: string;
  secondChoiceOptions: [string, string, string];
  secondCorrectOption: string;
  chinesePrompt: string;
  meaningHint: string;
  suggestedPatternIds: string[];
  referenceAnswers: string[];
  outputTopic: string;
  outputPrompts: string[];
  outputTemplate: string[];
  storyPrompt: string;
  recapTopic?: string;
}

function makeDay(spec: DaySpec): Day {
  const dayId = `day-${String(spec.dayNumber).padStart(3, '0')}`;

  return {
    id: dayId,
    weekId: spec.weekId,
    dayNumber: spec.dayNumber,
    title: spec.title,
    goal: spec.goal,
    estimatedMinutes: spec.recapTopic ? 35 : 30,
    review: { wordCount: spec.recapTopic ? 10 : 6, patternCount: spec.recapTopic ? 5 : 3 },
    wordIds: spec.wordIds,
    patternIds: spec.patternIds,
    exercises: [
      {
        type: 'choice',
        id: `${dayId}-choice-001`,
        prompt: spec.choicePrompt,
        options: spec.choiceOptions,
        correctOption: spec.correctOption,
      },
      {
        type: 'fill_blank',
        id: `${dayId}-fill-001`,
        prompt: spec.fillPrompt,
        acceptedAnswers: spec.fillAnswers,
      },
      {
        type: 'sentence_order',
        id: `${dayId}-order-001`,
        tokens: spec.orderTokens,
        correctOrder: spec.order,
        finalSentence: spec.finalSentence,
      },
      {
        type: 'fill_blank',
        id: `${dayId}-fill-002`,
        prompt: spec.secondFillPrompt,
        acceptedAnswers: spec.secondFillAnswers,
      },
      {
        type: 'choice',
        id: `${dayId}-choice-002`,
        prompt: spec.secondChoicePrompt,
        options: spec.secondChoiceOptions,
        correctOption: spec.secondCorrectOption,
      },
      {
        type: 'translation',
        id: `${dayId}-translation-001`,
        chinesePrompt: spec.chinesePrompt,
        coreMeaningHint: spec.meaningHint,
        suggestedPatternIds: spec.suggestedPatternIds,
        referenceAnswers: spec.referenceAnswers,
      },
    ],
    outputTask: {
      id: `${dayId}-output`,
      topic: spec.outputTopic,
      prompts: spec.outputPrompts,
      template: spec.outputTemplate,
      requiredSentenceCount: spec.outputTemplate.length,
      storyMode: spec.recapTopic ? 'recap' : 'sentence',
      storyPrompt: spec.storyPrompt,
    },
    ...(spec.recapTopic ? { weeklyCheckRubric: weeklyRubric(spec.recapTopic) } : {}),
  };
}

export const week8Words: Word[] = [
  word('family', 'general_thing', 'persons living together', '家庭', 'This is my family.', 8, ['family']),
  word('mother', 'picturable_thing', 'a female family person', '母亲', 'My mother is kind.', 8, ['family']),
  word('father', 'picturable_thing', 'a male family person', '父亲', 'My father is kind.', 8, ['family']),
  word('brother', 'picturable_thing', 'a male young person in the same family', '兄弟', 'This is my brother.', 8, ['family']),
  word('sister', 'picturable_thing', 'a female young person in the same family', '姐妹', 'This is my sister.', 8, ['family']),
  word('baby', 'picturable_thing', 'a very young person', '婴儿', 'The baby is happy.', 8, ['family']),
  word('boy', 'picturable_thing', 'a young male person', '男孩', 'The boy is happy.', 8, ['family']),
  word('girl', 'picturable_thing', 'a young female person', '女孩', 'The girl is happy.', 8, ['family']),
  word('man', 'picturable_thing', 'a male person', '男人', 'The man is my father.', 8, ['family']),
  word('woman', 'picturable_thing', 'a female person', '女人', 'The woman is my mother.', 8, ['family']),
];

export const week9Words: Word[] = [
  word('sun', 'picturable_thing', 'the bright star in the sky', '太阳', 'The sun is bright.', 9, ['weather']),
  word('rain', 'general_thing', 'water falling from the sky', '雨', 'There is rain.', 9, ['weather']),
  word('cloud', 'picturable_thing', 'white or gray water in the sky', '云', 'There is a cloud.', 9, ['weather']),
  word('wind', 'general_thing', 'moving air', '风', 'The wind is strong.', 9, ['weather']),
  word('weather', 'general_thing', 'rain sun wind or cold', '天气', 'The weather is cold.', 9, ['weather']),
  word('cold', 'quality', 'with little heat', '冷的', 'The day is cold.', 9, ['weather']),
  word('heat', 'general_thing', 'being warm', '热', 'The sun gives heat.', 9, ['weather']),
  word('garden', 'picturable_thing', 'a place with plants', '花园', 'This is a garden.', 9, ['garden']),
  word('tree', 'picturable_thing', 'a tall plant', '树', 'The tree is tall.', 9, ['garden']),
  word('flower', 'picturable_thing', 'a bright part of a plant', '花', 'The flower is beautiful.', 9, ['garden']),
];

export const week10Words: Word[] = [
  word('office', 'picturable_thing', 'a room or place for work', '办公室', 'I am in the office.', 10, ['work']),
  word('meeting', 'general_thing', 'persons coming together to talk', '会议', 'I have a meeting.', 10, ['work']),
  word('letter', 'picturable_thing', 'words on paper for a person', '信', 'I write a letter.', 10, ['work']),
  word('page', 'picturable_thing', 'one side of paper in a book', '页', 'This page has words.', 10, ['work']),
  word('copy', 'operation', 'make another one the same', '复制', 'I copy the page.', 10, ['work']),
  word('print', 'operation', 'make words on paper', '打印', 'I print a page.', 10, ['work']),
  word('record', 'general_thing', 'an account on paper', '记录', 'I make a record.', 10, ['work']),
  word('number', 'general_thing', 'a word or sign for amount', '数字', 'This number is small.', 10, ['work']),
  word('mark', 'operation', 'put a sign on something', '标记', 'I mark the page.', 10, ['work']),
  word('account', 'general_thing', 'a record of money or events', '账目', 'This is my account.', 10, ['work']),
];

export const week11Words: Word[] = [
  word('like', 'operation', 'have a good feeling for something', '喜欢', 'I like this book.', 11, ['opinion']),
  word('love', 'operation', 'like very much', '爱', 'I love my family.', 11, ['opinion']),
  word('fear', 'general_thing', 'a bad feeling about danger', '害怕', 'I have fear.', 11, ['feeling']),
  word('hope', 'general_thing', 'a good feeling about the future', '希望', 'I have hope.', 11, ['feeling']),
  word('idea', 'general_thing', 'a thought in the mind', '想法', 'I have an idea.', 11, ['opinion']),
  word('thought', 'general_thing', 'an idea in the mind', '想法', 'This thought is clear.', 11, ['opinion']),
  word('reason', 'general_thing', 'why something is so', '原因', 'This is my reason.', 11, ['opinion']),
  word('true', 'quality', 'right with fact', '真实的', 'This is true.', 11, ['opinion']),
  word('false', 'quality', 'not true', '错误的', 'This is false.', 11, ['opinion']),
  word('possible', 'quality', 'able to be', '可能的', 'This is possible.', 11, ['opinion']),
];

export const week12Words: Word[] = [
  word('will', 'structure', 'a word for future action', '将会', 'I will go tomorrow.', 12, ['time']),
  word('tomorrow', 'general_thing', 'the day after today', '明天', 'I will go tomorrow.', 12, ['time']),
  word('yesterday', 'general_thing', 'the day before today', '昨天', 'I was here yesterday.', 12, ['time']),
  word('week', 'general_thing', '7 days', '周', 'This week is good.', 12, ['time']),
  word('month', 'general_thing', 'about 4 weeks', '月', 'This month is good.', 12, ['time']),
  word('year', 'general_thing', '12 months', '年', 'This year is good.', 12, ['time']),
  word('summer', 'general_thing', 'the warm part of the year', '夏天', 'Summer is warm.', 12, ['time']),
  word('winter', 'general_thing', 'the cold part of the year', '冬天', 'Winter is cold.', 12, ['time']),
  word('north', 'general_thing', 'one direction', '北方', 'The north is cold.', 12, ['place']),
  word('south', 'general_thing', 'one direction', '南方', 'The south is warm.', 12, ['place']),
];

export const week8Patterns: Pattern[] = [
  { id: 'this-is-my-family', title: 'This is my family.', use: 'Show your family.', structure: 'This is my family.', examples: ['This is my family.'], slots: [] },
  { id: 'this-is-my-person', title: 'This is my ___.', use: 'Name one family person.', structure: 'This is my {person}.', examples: ['This is my mother.', 'This is my brother.'], slots: ['person'] },
  { id: 'my-person-is-kind', title: 'My ___ is kind.', use: 'Say one good thing about a family person.', structure: 'My {person} is kind.', examples: ['My mother is kind.', 'My father is kind.'], slots: ['person'] },
  { id: 'the-child-is-happy', title: 'The ___ is happy.', use: 'Describe a boy or girl.', structure: 'The {person} is happy.', examples: ['The baby is happy.', 'The girl is happy.'], slots: ['person'] },
];

export const week9Patterns: Pattern[] = [
  { id: 'the-weather-is', title: 'The weather is ___.', use: 'Say the weather.', structure: 'The weather is {quality}.', examples: ['The weather is cold.', 'The weather is good.'], slots: ['quality'] },
  { id: 'there-is-weather', title: 'There is ___.', use: 'Say rain, sun, or cloud.', structure: 'There is {thing}.', examples: ['There is rain.', 'There is a cloud.'], slots: ['thing'] },
  { id: 'the-wind-is', title: 'The wind is ___.', use: 'Describe wind.', structure: 'The wind is {quality}.', examples: ['The wind is strong.', 'The wind is cold.'], slots: ['quality'] },
  { id: 'in-the-garden', title: 'I am in the garden.', use: 'Say you are in a garden.', structure: 'I am in the garden.', examples: ['I am in the garden.'], slots: [] },
];

export const week10Patterns: Pattern[] = [
  { id: 'i-am-in-office', title: 'I am in the office.', use: 'Say where you work.', structure: 'I am in the office.', examples: ['I am in the office.'], slots: [] },
  { id: 'i-have-meeting', title: 'I have a meeting.', use: 'Say there is a meeting.', structure: 'I have a meeting.', examples: ['I have a meeting.'], slots: [] },
  { id: 'i-write-letter', title: 'I write a letter.', use: 'Say you write work words.', structure: 'I write a letter.', examples: ['I write a letter.'], slots: [] },
  { id: 'i-copy-print-page', title: 'I copy and print a page.', use: 'Say office actions.', structure: 'I copy and print a page.', examples: ['I copy and print a page.'], slots: [] },
  { id: 'i-make-record', title: 'I make a record.', use: 'Say you make a work record.', structure: 'I make a record.', examples: ['I make a record.'], slots: [] },
];

export const week11Patterns: Pattern[] = [
  { id: 'i-like', title: 'I like ___.', use: 'Say what you like.', structure: 'I like {thing}.', examples: ['I like this book.', 'I like my family.'], slots: ['thing'] },
  { id: 'i-love', title: 'I love ___.', use: 'Say what you love.', structure: 'I love {thing}.', examples: ['I love my family.'], slots: ['thing'] },
  { id: 'i-have-an-idea', title: 'I have an idea.', use: 'Say you have an idea.', structure: 'I have an idea.', examples: ['I have an idea.'], slots: [] },
  { id: 'this-is-my-reason', title: 'This is my reason.', use: 'Give a reason.', structure: 'This is my reason.', examples: ['This is my reason.'], slots: [] },
  { id: 'this-is-true', title: 'This is true.', use: 'Say if something is true.', structure: 'This is true.', examples: ['This is true.', 'This is false.'], slots: [] },
];

export const week12Patterns: Pattern[] = [
  { id: 'i-will-tomorrow', title: 'I will ___ tomorrow.', use: 'Say a future action.', structure: 'I will {action} tomorrow.', examples: ['I will go tomorrow.', 'I will study tomorrow.'], slots: ['action'] },
  { id: 'yesterday-i', title: 'Yesterday I ___.', use: 'Say a past action.', structure: 'Yesterday I {action}.', examples: ['Yesterday I was here.', 'Yesterday I was home.'], slots: ['action'] },
  { id: 'this-week', title: 'This week is ___.', use: 'Say how this week is.', structure: 'This week is {quality}.', examples: ['This week is good.', 'This week is clear.'], slots: ['quality'] },
  { id: 'in-season', title: 'In ___, it is ___.', use: 'Say summer or winter weather.', structure: 'In {season}, it is {quality}.', examples: ['In summer, it is warm.', 'In winter, it is cold.'], slots: ['season', 'quality'] },
  { id: 'north-south', title: 'The ___ is ___.', use: 'Describe north or south.', structure: 'The {place} is {quality}.', examples: ['The north is cold.', 'The south is warm.'], slots: ['place', 'quality'] },
];

export const week8: Week = {
  id: 'week-08',
  number: 8,
  title: 'Family and Persons',
  goal: 'Describe family persons with simple clear sentences.',
  days: [
    makeDay({
      dayNumber: 50,
      weekId: 'week-08',
      title: 'My Family',
      goal: 'Say this is your family.',
      wordIds: ['family', 'mother', 'father', 'friend', 'home', 'kind'],
      patternIds: ['this-is-my-family', 'this-is-my-person', 'my-person-is-kind'],
      choicePrompt: 'Which sentence shows a family?',
      choiceOptions: ['This is my family.', 'I buy bread.', 'The road is far.'],
      correctOption: 'This is my family.',
      fillPrompt: 'This is my ___.',
      fillAnswers: ['family'],
      orderTokens: ['my', 'family', 'is', 'This'],
      order: ['This', 'is', 'my', 'family'],
      finalSentence: 'This is my family.',
      secondFillPrompt: 'My ___ is kind.',
      secondFillAnswers: ['mother', 'father'],
      secondChoicePrompt: 'Which sentence describes a family person?',
      secondChoiceOptions: ['My mother is kind.', 'The cup is empty.', 'I turn left.'],
      secondCorrectOption: 'My mother is kind.',
      chinesePrompt: '这是我的家人。我的母亲很友善。',
      meaningHint: 'Introduce your family.',
      suggestedPatternIds: ['this-is-my-family', 'my-person-is-kind'],
      referenceAnswers: ['This is my family. My mother is kind.'],
      outputTopic: 'My Family',
      outputPrompts: ['Who is in your family?', 'What is one person like?'],
      outputTemplate: ['This is my family.', 'This is my mother.', 'This is my father.', 'My family is kind.'],
      storyPrompt: 'Make a short story about your family.',
    }),
    makeDay({
      dayNumber: 51,
      weekId: 'week-08',
      title: 'Mother and Father',
      goal: 'Say mother and father.',
      wordIds: ['mother', 'father', 'woman', 'man', 'family', 'kind'],
      patternIds: ['this-is-my-person', 'my-person-is-kind'],
      choicePrompt: 'Which sentence names mother or father?',
      choiceOptions: ['This is my mother.', 'I drink tea.', 'The way is clear.'],
      correctOption: 'This is my mother.',
      fillPrompt: 'This is my ___.',
      fillAnswers: ['mother', 'father'],
      orderTokens: ['is', 'mother', 'my', 'This'],
      order: ['This', 'is', 'my', 'mother'],
      finalSentence: 'This is my mother.',
      secondFillPrompt: 'My ___ is kind.',
      secondFillAnswers: ['mother', 'father'],
      secondChoicePrompt: 'Which sentence says a good thing?',
      secondChoiceOptions: ['My father is kind.', 'The bus is late.', 'The cup is full.'],
      secondCorrectOption: 'My father is kind.',
      chinesePrompt: '这是我的母亲。这是我的父亲。',
      meaningHint: 'Name mother and father.',
      suggestedPatternIds: ['this-is-my-person', 'my-person-is-kind'],
      referenceAnswers: ['This is my mother. This is my father. My father is kind.'],
      outputTopic: 'Mother and Father',
      outputPrompts: ['Who is your mother?', 'Who is your father?'],
      outputTemplate: ['This is my mother.', 'She is kind.', 'This is my father.', 'He is kind.'],
      storyPrompt: 'Make a short story about mother and father.',
    }),
    makeDay({
      dayNumber: 52,
      weekId: 'week-08',
      title: 'Brother and Sister',
      goal: 'Say brother and sister.',
      wordIds: ['brother', 'sister', 'boy', 'girl', 'family', 'happy'],
      patternIds: ['this-is-my-person', 'the-child-is-happy'],
      choicePrompt: 'Which sentence names a brother?',
      choiceOptions: ['This is my brother.', 'I need water.', 'The garden is cold.'],
      correctOption: 'This is my brother.',
      fillPrompt: 'This is my ___.',
      fillAnswers: ['brother', 'sister'],
      orderTokens: ['sister', 'my', 'is', 'This'],
      order: ['This', 'is', 'my', 'sister'],
      finalSentence: 'This is my sister.',
      secondFillPrompt: 'The ___ is happy.',
      secondFillAnswers: ['boy', 'girl'],
      secondChoicePrompt: 'Which sentence describes a young person?',
      secondChoiceOptions: ['The girl is happy.', 'The price is dear.', 'I copy a page.'],
      secondCorrectOption: 'The girl is happy.',
      chinesePrompt: '这是我的兄弟。这是我的姐妹。女孩很开心。',
      meaningHint: 'Name brother and sister.',
      suggestedPatternIds: ['this-is-my-person', 'the-child-is-happy'],
      referenceAnswers: ['This is my brother. This is my sister. The girl is happy.'],
      outputTopic: 'Brother and Sister',
      outputPrompts: ['Who is your brother or sister?', 'How does the young person feel?'],
      outputTemplate: ['This is my brother.', 'This is my sister.', 'The boy is happy.', 'The girl is happy.'],
      storyPrompt: 'Make a short story about brother and sister.',
    }),
    makeDay({
      dayNumber: 53,
      weekId: 'week-08',
      title: 'Baby, Boy, Girl',
      goal: 'Describe a baby, boy, and girl.',
      wordIds: ['baby', 'boy', 'girl', 'small', 'happy', 'family'],
      patternIds: ['the-child-is-happy', 'this-is-my-person'],
      choicePrompt: 'Which sentence describes a baby?',
      choiceOptions: ['The baby is happy.', 'I pay for rice.', 'The way is wrong.'],
      correctOption: 'The baby is happy.',
      fillPrompt: 'The ___ is happy.',
      fillAnswers: ['baby', 'boy', 'girl'],
      orderTokens: ['baby', 'happy', 'is', 'The'],
      order: ['The', 'baby', 'is', 'happy'],
      finalSentence: 'The baby is happy.',
      secondFillPrompt: 'The ___ is small.',
      secondFillAnswers: ['baby', 'boy', 'girl'],
      secondChoicePrompt: 'Which sentence is about a young person?',
      secondChoiceOptions: ['The boy is small.', 'The office is open.', 'I have a record.'],
      secondCorrectOption: 'The boy is small.',
      chinesePrompt: '婴儿很开心。男孩很小。',
      meaningHint: 'Describe young family persons.',
      suggestedPatternIds: ['the-child-is-happy'],
      referenceAnswers: ['The baby is happy. The boy is small.'],
      outputTopic: 'Young Persons',
      outputPrompts: ['Who is young?', 'How does the person feel?'],
      outputTemplate: ['The baby is small.', 'The baby is happy.', 'The boy is here.', 'The girl is here.'],
      storyPrompt: 'Make a short story about young persons in a family.',
    }),
    makeDay({
      dayNumber: 54,
      weekId: 'week-08',
      title: 'Man and Woman',
      goal: 'Describe a man and a woman.',
      wordIds: ['man', 'woman', 'father', 'mother', 'family', 'good'],
      patternIds: ['this-is-my-person', 'my-person-is-kind'],
      choicePrompt: 'Which sentence names a woman?',
      choiceOptions: ['This woman is my mother.', 'I need another way.', 'The cup is under the table.'],
      correctOption: 'This woman is my mother.',
      fillPrompt: 'This ___ is my father.',
      fillAnswers: ['man'],
      orderTokens: ['woman', 'is', 'This', 'kind'],
      order: ['This', 'woman', 'is', 'kind'],
      finalSentence: 'This woman is kind.',
      secondFillPrompt: 'This ___ is my mother.',
      secondFillAnswers: ['woman'],
      secondChoicePrompt: 'Which sentence describes a person?',
      secondChoiceOptions: ['This man is kind.', 'The rain is cold.', 'I print a page.'],
      secondCorrectOption: 'This man is kind.',
      chinesePrompt: '这个男人是我的父亲。这个女人是我的母亲。',
      meaningHint: 'Describe a man and a woman.',
      suggestedPatternIds: ['this-is-my-person', 'my-person-is-kind'],
      referenceAnswers: ['This man is my father. This woman is my mother.'],
      outputTopic: 'Man and Woman',
      outputPrompts: ['Who is the man?', 'Who is the woman?'],
      outputTemplate: ['This man is my father.', 'This woman is my mother.', 'He is kind.', 'She is kind.'],
      storyPrompt: 'Make a short story about a man and a woman in a family.',
    }),
    makeDay({
      dayNumber: 55,
      weekId: 'week-08',
      title: 'Family at Home',
      goal: 'Describe family persons at home.',
      wordIds: ['family', 'mother', 'father', 'brother', 'sister', 'home', 'room'],
      patternIds: ['this-is-my-family', 'this-is-my-person', 'my-person-is-kind'],
      choicePrompt: 'Which sentence says family at home?',
      choiceOptions: ['My family is at home.', 'I am waiting for the bus.', 'The page has a number.'],
      correctOption: 'My family is at home.',
      fillPrompt: 'My family is at ___.',
      fillAnswers: ['home'],
      orderTokens: ['at', 'home', 'is', 'family', 'My'],
      order: ['My', 'family', 'is', 'at', 'home'],
      finalSentence: 'My family is at home.',
      secondFillPrompt: 'This is my ___.',
      secondFillAnswers: ['mother', 'father', 'brother', 'sister'],
      secondChoicePrompt: 'Which sentence introduces family?',
      secondChoiceOptions: ['This is my sister.', 'There is wind.', 'I have fear.'],
      secondCorrectOption: 'This is my sister.',
      chinesePrompt: '我的家人在家。这是我的姐妹。',
      meaningHint: 'Describe family at home.',
      suggestedPatternIds: ['this-is-my-family', 'this-is-my-person'],
      referenceAnswers: ['My family is at home. This is my sister.'],
      outputTopic: 'Family at Home',
      outputPrompts: ['Where is your family?', 'Who is in the room?'],
      outputTemplate: ['My family is at home.', 'This is my mother.', 'This is my father.', 'This is my sister.'],
      storyPrompt: 'Make a short story about family at home.',
    }),
    makeDay({
      dayNumber: 56,
      weekId: 'week-08',
      title: 'Week 8 Family Story',
      goal: 'Tell a family story with persons.',
      wordIds: ['family', 'mother', 'father', 'brother', 'sister', 'baby', 'boy', 'girl', 'man', 'woman'],
      patternIds: ['this-is-my-family', 'this-is-my-person', 'my-person-is-kind', 'the-child-is-happy'],
      choicePrompt: 'Which sentence starts a family story?',
      choiceOptions: ['This is my family.', 'The weather is cold.', 'I mark the page.'],
      correctOption: 'This is my family.',
      fillPrompt: 'This is my ___.',
      fillAnswers: ['family', 'mother', 'father', 'brother', 'sister'],
      orderTokens: ['family', 'my', 'is', 'This'],
      order: ['This', 'is', 'my', 'family'],
      finalSentence: 'This is my family.',
      secondFillPrompt: 'My ___ is kind.',
      secondFillAnswers: ['mother', 'father', 'sister', 'brother'],
      secondChoicePrompt: 'Which sentence can end a family story?',
      secondChoiceOptions: ['My family is kind.', 'The north is cold.', 'I have a number.'],
      secondCorrectOption: 'My family is kind.',
      chinesePrompt: '这是我的家人。我的母亲和父亲很友善。婴儿很开心。',
      meaningHint: 'Tell a full family story.',
      suggestedPatternIds: ['this-is-my-family', 'this-is-my-person', 'my-person-is-kind'],
      referenceAnswers: ['This is my family. This is my mother. This is my father. My family is kind.'],
      outputTopic: 'Family Story',
      outputPrompts: ['Who is in your family?', 'What are they like?'],
      outputTemplate: ['This is my family.', 'This is my mother.', 'This is my father.', 'This is my sister.', 'The baby is happy.', 'My family is kind.'],
      storyPrompt: 'Make a full family story with persons.',
      recapTopic: 'family',
    }),
  ],
};

function simpleWeek(id: string, number: number, title: string, goal: string, days: Day[]): Week {
  return { id, number, title, goal, days };
}

export const week9 = simpleWeek('week-09', 9, 'Weather and Garden', 'Describe weather and a garden scene.', [
  makeDay({ dayNumber: 57, weekId: 'week-09', title: 'Sun and Heat', goal: 'Say sun and heat.', wordIds: ['sun', 'heat', 'day', 'warm', 'weather', 'outside'], patternIds: ['there-is-weather', 'the-weather-is'], choicePrompt: 'Which sentence describes weather?', choiceOptions: ['There is sun.', 'This is my sister.', 'I copy a page.'], correctOption: 'There is sun.', fillPrompt: 'There is ___.', fillAnswers: ['sun'], orderTokens: ['sun', 'is', 'There'], order: ['There', 'is', 'sun'], finalSentence: 'There is sun.', secondFillPrompt: 'The sun gives ___.', secondFillAnswers: ['heat'], secondChoicePrompt: 'Which sentence says warm weather?', secondChoiceOptions: ['The weather is warm.', 'My father is kind.', 'I write a letter.'], secondCorrectOption: 'The weather is warm.', chinesePrompt: '有太阳。太阳带来热。', meaningHint: 'Describe sun and heat.', suggestedPatternIds: ['there-is-weather', 'the-weather-is'], referenceAnswers: ['There is sun. The sun gives heat. The weather is warm.'], outputTopic: 'Sun and Heat', outputPrompts: ['What is in the sky?', 'How is the weather?'], outputTemplate: ['There is sun.', 'The sun gives heat.', 'The weather is warm.', 'I am outside.'], storyPrompt: 'Make a short story about sun and warm weather.' }),
  makeDay({ dayNumber: 58, weekId: 'week-09', title: 'Rain and Cloud', goal: 'Say rain and cloud.', wordIds: ['rain', 'cloud', 'weather', 'water', 'cold', 'outside'], patternIds: ['there-is-weather', 'the-weather-is'], choicePrompt: 'Which sentence describes rain?', choiceOptions: ['There is rain.', 'This is my family.', 'I have an idea.'], correctOption: 'There is rain.', fillPrompt: 'There is ___.', fillAnswers: ['rain', 'a cloud'], orderTokens: ['is', 'rain', 'There'], order: ['There', 'is', 'rain'], finalSentence: 'There is rain.', secondFillPrompt: 'There is a ___.', secondFillAnswers: ['cloud'], secondChoicePrompt: 'Which sentence says cold weather?', secondChoiceOptions: ['The weather is cold.', 'The baby is happy.', 'I print a page.'], secondCorrectOption: 'The weather is cold.', chinesePrompt: '有雨。有一朵云。天气很冷。', meaningHint: 'Describe rain and cloud.', suggestedPatternIds: ['there-is-weather', 'the-weather-is'], referenceAnswers: ['There is rain. There is a cloud. The weather is cold.'], outputTopic: 'Rain and Cloud', outputPrompts: ['What is in the sky?', 'How is the weather?'], outputTemplate: ['There is rain.', 'There is a cloud.', 'The weather is cold.', 'I need warm clothes.'], storyPrompt: 'Make a short story about rain and cloud.' }),
  makeDay({ dayNumber: 59, weekId: 'week-09', title: 'Wind', goal: 'Describe the wind.', wordIds: ['wind', 'weather', 'cold', 'outside', 'safe', 'warm'], patternIds: ['the-wind-is', 'the-weather-is'], choicePrompt: 'Which sentence describes wind?', choiceOptions: ['The wind is cold.', 'This is my brother.', 'I mark a page.'], correctOption: 'The wind is cold.', fillPrompt: 'The wind is ___.', fillAnswers: ['cold'], orderTokens: ['is', 'cold', 'wind', 'The'], order: ['The', 'wind', 'is', 'cold'], finalSentence: 'The wind is cold.', secondFillPrompt: 'The weather is ___.', secondFillAnswers: ['cold'], secondChoicePrompt: 'Which sentence says weather outside?', secondChoiceOptions: ['There is wind.', 'I love my family.', 'The office is open.'], secondCorrectOption: 'There is wind.', chinesePrompt: '风很冷。天气很冷。', meaningHint: 'Describe wind and cold weather.', suggestedPatternIds: ['the-wind-is', 'the-weather-is'], referenceAnswers: ['The wind is cold. The weather is cold.'], outputTopic: 'Wind Outside', outputPrompts: ['How is the wind?', 'How is the weather?'], outputTemplate: ['There is wind.', 'The wind is cold.', 'The weather is cold.', 'I keep warm.'], storyPrompt: 'Make a short story about wind outside.' }),
  makeDay({ dayNumber: 60, weekId: 'week-09', title: 'Weather Today', goal: 'Say the weather today.', wordIds: ['weather', 'sun', 'rain', 'cloud', 'wind', 'day'], patternIds: ['the-weather-is', 'there-is-weather'], choicePrompt: 'Which sentence says weather?', choiceOptions: ['The weather is good.', 'This page has a number.', 'My sister is kind.'], correctOption: 'The weather is good.', fillPrompt: 'The ___ is good.', fillAnswers: ['weather'], orderTokens: ['weather', 'good', 'is', 'The'], order: ['The', 'weather', 'is', 'good'], finalSentence: 'The weather is good.', secondFillPrompt: 'There is ___.', secondFillAnswers: ['sun', 'rain', 'wind'], secondChoicePrompt: 'Which sentence has weather detail?', secondChoiceOptions: ['There is a cloud.', 'I have a meeting.', 'This is my father.'], secondCorrectOption: 'There is a cloud.', chinesePrompt: '今天天气很好。有云和风。', meaningHint: 'Say the weather today.', suggestedPatternIds: ['the-weather-is', 'there-is-weather'], referenceAnswers: ['The weather is good. There is a cloud. There is wind.'], outputTopic: 'Weather Today', outputPrompts: ['How is the weather?', 'What is in the sky?'], outputTemplate: ['The weather is good.', 'There is sun.', 'There is a cloud.', 'There is wind.'], storyPrompt: 'Make a short story about today weather.' }),
  makeDay({ dayNumber: 61, weekId: 'week-09', title: 'Garden', goal: 'Describe a garden.', wordIds: ['garden', 'tree', 'flower', 'sun', 'water', 'good'], patternIds: ['in-the-garden', 'there-is-weather'], choicePrompt: 'Which sentence says a garden place?', choiceOptions: ['I am in the garden.', 'I am in the office.', 'This is my mother.'], correctOption: 'I am in the garden.', fillPrompt: 'I am in the ___.', fillAnswers: ['garden'], orderTokens: ['garden', 'the', 'in', 'am', 'I'], order: ['I', 'am', 'in', 'the', 'garden'], finalSentence: 'I am in the garden.', secondFillPrompt: 'There is a ___.', secondFillAnswers: ['tree', 'flower'], secondChoicePrompt: 'Which sentence describes a garden thing?', secondChoiceOptions: ['There is a flower.', 'I need another way.', 'This is false.'], secondCorrectOption: 'There is a flower.', chinesePrompt: '我在花园里。有一棵树和一朵花。', meaningHint: 'Describe a garden.', suggestedPatternIds: ['in-the-garden', 'there-is-weather'], referenceAnswers: ['I am in the garden. There is a tree. There is a flower.'], outputTopic: 'Garden',
      outputPrompts: ['Where are you?', 'What can you see?'], outputTemplate: ['I am in the garden.', 'There is a tree.', 'There is a flower.', 'The garden is good.'], storyPrompt: 'Make a short story about a garden.' }),
  makeDay({ dayNumber: 62, weekId: 'week-09', title: 'Tree and Flower', goal: 'Describe a tree and a flower.', wordIds: ['tree', 'flower', 'garden', 'good', 'sun', 'water'], patternIds: ['in-the-garden', 'there-is-weather'], choicePrompt: 'Which sentence names a plant?', choiceOptions: ['There is a tree.', 'I have a letter.', 'The baby is small.'], correctOption: 'There is a tree.', fillPrompt: 'There is a ___.', fillAnswers: ['tree', 'flower'], orderTokens: ['a', 'tree', 'is', 'There'], order: ['There', 'is', 'a', 'tree'], finalSentence: 'There is a tree.', secondFillPrompt: 'The flower is ___.', secondFillAnswers: ['good'], secondChoicePrompt: 'Which sentence describes a flower?', secondChoiceOptions: ['The flower is good.', 'This number is small.', 'The wind is cold.'], secondCorrectOption: 'The flower is good.', chinesePrompt: '有一棵树。有一朵好看的花。', meaningHint: 'Describe a tree and flower.', suggestedPatternIds: ['in-the-garden', 'there-is-weather'], referenceAnswers: ['There is a tree. The flower is good.'], outputTopic: 'Tree and Flower', outputPrompts: ['What is in the garden?', 'What is good?'], outputTemplate: ['There is a tree.', 'There is a flower.', 'The flower is good.', 'The sun is warm.'], storyPrompt: 'Make a short story about a tree and flower.' }),
  makeDay({ dayNumber: 63, weekId: 'week-09', title: 'Week 9 Weather Story', goal: 'Tell a weather and garden story.', wordIds: ['weather', 'sun', 'rain', 'cloud', 'wind', 'cold', 'heat', 'garden', 'tree', 'flower'], patternIds: ['the-weather-is', 'there-is-weather', 'the-wind-is', 'in-the-garden'], choicePrompt: 'Which sentence starts a weather story?', choiceOptions: ['The weather is good.', 'This is my family.', 'I copy a page.'], correctOption: 'The weather is good.', fillPrompt: 'The weather is ___.', fillAnswers: ['good', 'cold', 'warm'], orderTokens: ['weather', 'is', 'good', 'The'], order: ['The', 'weather', 'is', 'good'], finalSentence: 'The weather is good.', secondFillPrompt: 'I am in the ___.', secondFillAnswers: ['garden'], secondChoicePrompt: 'Which sentence can be in a garden story?', secondChoiceOptions: ['There is a tree.', 'This is my account.', 'I have fear.'], secondCorrectOption: 'There is a tree.', chinesePrompt: '天气很好。有太阳和云。我在花园里。', meaningHint: 'Tell a full weather and garden story.', suggestedPatternIds: ['the-weather-is', 'there-is-weather', 'in-the-garden'], referenceAnswers: ['The weather is good. There is sun. I am in the garden. There is a tree.'], outputTopic: 'Weather Story', outputPrompts: ['How is the weather?', 'What is in the garden?'], outputTemplate: ['The weather is good.', 'There is sun.', 'There is a cloud.', 'I am in the garden.', 'There is a tree.', 'There is a flower.'], storyPrompt: 'Make a full weather and garden story.', recapTopic: 'weather' }),
]);

export const week10 = simpleWeek('week-10', 10, 'Office and Records', 'Describe simple office work and records.', [
  makeDay({ dayNumber: 64, weekId: 'week-10', title: 'Office', goal: 'Say you are in the office.', wordIds: ['office', 'work', 'room', 'table', 'chair', 'paper'], patternIds: ['i-am-in-office'], choicePrompt: 'Which sentence says the work place?', choiceOptions: ['I am in the office.', 'There is rain.', 'This is my family.'], correctOption: 'I am in the office.', fillPrompt: 'I am in the ___.', fillAnswers: ['office'], orderTokens: ['office', 'the', 'in', 'am', 'I'], order: ['I', 'am', 'in', 'the', 'office'], finalSentence: 'I am in the office.', secondFillPrompt: 'I do ___ in the office.', secondFillAnswers: ['work'], secondChoicePrompt: 'Which sentence describes office work?', secondChoiceOptions: ['I work in the office.', 'The baby is happy.', 'The wind is cold.'], secondCorrectOption: 'I work in the office.', chinesePrompt: '我在办公室。我在办公室工作。', meaningHint: 'Describe being in an office.', suggestedPatternIds: ['i-am-in-office'], referenceAnswers: ['I am in the office. I work in the office.'], outputTopic: 'Office', outputPrompts: ['Where are you?', 'What do you do there?'], outputTemplate: ['I am in the office.', 'I work in the office.', 'There is a table.', 'There is paper.'], storyPrompt: 'Make a short story about being in the office.' }),
  makeDay({ dayNumber: 65, weekId: 'week-10', title: 'Meeting', goal: 'Say you have a meeting.', wordIds: ['meeting', 'office', 'friend', 'question', 'answer', 'work'], patternIds: ['i-have-meeting'], choicePrompt: 'Which sentence says a meeting?', choiceOptions: ['I have a meeting.', 'There is a flower.', 'The boy is small.'], correctOption: 'I have a meeting.', fillPrompt: 'I have a ___.', fillAnswers: ['meeting'], orderTokens: ['a', 'meeting', 'have', 'I'], order: ['I', 'have', 'a', 'meeting'], finalSentence: 'I have a meeting.', secondFillPrompt: 'I ask a ___.', secondFillAnswers: ['question'], secondChoicePrompt: 'Which sentence can be in a meeting?', secondChoiceOptions: ['I answer a question.', 'I keep warm.', 'The road is far.'], secondCorrectOption: 'I answer a question.', chinesePrompt: '我有一个会议。我回答一个问题。', meaningHint: 'Describe a simple meeting.', suggestedPatternIds: ['i-have-meeting'], referenceAnswers: ['I have a meeting. I answer a question.'], outputTopic: 'Meeting', outputPrompts: ['What do you have?', 'What do you ask or answer?'], outputTemplate: ['I have a meeting.', 'I ask a question.', 'I answer a question.', 'The meeting is good.'], storyPrompt: 'Make a short story about a meeting.' }),
  makeDay({ dayNumber: 66, weekId: 'week-10', title: 'Letter and Page', goal: 'Write a letter and page.', wordIds: ['letter', 'page', 'write', 'paper', 'pen', 'book'], patternIds: ['i-write-letter'], choicePrompt: 'Which sentence says writing?', choiceOptions: ['I write a letter.', 'There is wind.', 'This is my sister.'], correctOption: 'I write a letter.', fillPrompt: 'I write a ___.', fillAnswers: ['letter'], orderTokens: ['a', 'letter', 'write', 'I'], order: ['I', 'write', 'a', 'letter'], finalSentence: 'I write a letter.', secondFillPrompt: 'This page is in a ___.', secondFillAnswers: ['book'], secondChoicePrompt: 'Which sentence names a page?', secondChoiceOptions: ['This is a page.', 'The baby is happy.', 'I need care.'], secondCorrectOption: 'This is a page.', chinesePrompt: '我写一封信。这是一页。', meaningHint: 'Describe a letter and page.', suggestedPatternIds: ['i-write-letter'], referenceAnswers: ['I write a letter. This is a page.'], outputTopic: 'Letter and Page', outputPrompts: ['What do you write?', 'What is on the page?'], outputTemplate: ['I write a letter.', 'I use a pen.', 'This is a page.', 'This page is in a book.'], storyPrompt: 'Make a short story about writing a letter.' }),
  makeDay({ dayNumber: 67, weekId: 'week-10', title: 'Copy and Print', goal: 'Copy and print a page.', wordIds: ['copy', 'print', 'page', 'paper', 'office', 'same'], patternIds: ['i-copy-print-page'], choicePrompt: 'Which sentence says office action?', choiceOptions: ['I copy and print a page.', 'The weather is cold.', 'This is my mother.'], correctOption: 'I copy and print a page.', fillPrompt: 'I ___ the page.', fillAnswers: ['copy', 'print'], orderTokens: ['a', 'page', 'copy', 'I'], order: ['I', 'copy', 'a', 'page'], finalSentence: 'I copy a page.', secondFillPrompt: 'I print on ___.', secondFillAnswers: ['paper'], secondChoicePrompt: 'Which sentence uses copy and print?', secondChoiceOptions: ['I copy and print a page.', 'The flower is beautiful.', 'The boy is happy.'], secondCorrectOption: 'I copy and print a page.', chinesePrompt: '我复制并打印一页。', meaningHint: 'Describe copy and print actions.', suggestedPatternIds: ['i-copy-print-page'], referenceAnswers: ['I copy and print a page.'], outputTopic: 'Copy and Print', outputPrompts: ['What do you copy?', 'What do you print?'], outputTemplate: ['I copy a page.', 'I print a page.', 'The page is the same.', 'I work in the office.'], storyPrompt: 'Make a short story about copying and printing a page.' }),
  makeDay({ dayNumber: 68, weekId: 'week-10', title: 'Record and Number', goal: 'Make a record with a number.', wordIds: ['record', 'number', 'mark', 'page', 'account', 'work'], patternIds: ['i-make-record'], choicePrompt: 'Which sentence says a record?', choiceOptions: ['I make a record.', 'There is a cloud.', 'The baby is small.'], correctOption: 'I make a record.', fillPrompt: 'I make a ___.', fillAnswers: ['record'], orderTokens: ['a', 'record', 'make', 'I'], order: ['I', 'make', 'a', 'record'], finalSentence: 'I make a record.', secondFillPrompt: 'This ___ is small.', secondFillAnswers: ['number'], secondChoicePrompt: 'Which sentence uses a number?', secondChoiceOptions: ['This number is small.', 'My family is kind.', 'The wind is strong.'], secondCorrectOption: 'This number is small.', chinesePrompt: '我做一个记录。这个数字很小。', meaningHint: 'Describe a record and number.', suggestedPatternIds: ['i-make-record'], referenceAnswers: ['I make a record. This number is small.'], outputTopic: 'Record and Number', outputPrompts: ['What do you make?', 'What number do you see?'], outputTemplate: ['I make a record.', 'I mark the page.', 'This number is small.', 'This is my account.'], storyPrompt: 'Make a short story about a record and number.' }),
  makeDay({ dayNumber: 69, weekId: 'week-10', title: 'Office Work Order', goal: 'Put office work in order.', wordIds: ['office', 'meeting', 'letter', 'page', 'copy', 'print', 'record'], patternIds: ['i-am-in-office', 'i-have-meeting', 'i-write-letter', 'i-copy-print-page'], choicePrompt: 'Which sentence starts office work?', choiceOptions: ['I am in the office.', 'The garden is beautiful.', 'This is my brother.'], correctOption: 'I am in the office.', fillPrompt: 'I have a ___.', fillAnswers: ['meeting'], orderTokens: ['letter', 'a', 'write', 'I'], order: ['I', 'write', 'a', 'letter'], finalSentence: 'I write a letter.', secondFillPrompt: 'I print a ___.', secondFillAnswers: ['page'], secondChoicePrompt: 'Which sentence can end office work?', secondChoiceOptions: ['I make a record.', 'The weather is cold.', 'The baby is happy.'], secondCorrectOption: 'I make a record.', chinesePrompt: '我在办公室。我写信并打印一页。', meaningHint: 'Describe office work in order.', suggestedPatternIds: ['i-am-in-office', 'i-write-letter', 'i-copy-print-page'], referenceAnswers: ['I am in the office. I write a letter. I print a page. I make a record.'], outputTopic: 'Office Work Order', outputPrompts: ['What do you do first?', 'What do you do last?'], outputTemplate: ['I am in the office.', 'I have a meeting.', 'I write a letter.', 'I copy a page.'], storyPrompt: 'Make a short story about office work in order.' }),
  makeDay({ dayNumber: 70, weekId: 'week-10', title: 'Week 10 Office Story', goal: 'Tell an office work story.', wordIds: ['office', 'meeting', 'letter', 'page', 'copy', 'print', 'record', 'number', 'mark', 'account'], patternIds: ['i-am-in-office', 'i-have-meeting', 'i-write-letter', 'i-copy-print-page', 'i-make-record'], choicePrompt: 'Which sentence starts an office story?', choiceOptions: ['I am in the office.', 'There is rain.', 'This is my family.'], correctOption: 'I am in the office.', fillPrompt: 'I have a ___.', fillAnswers: ['meeting'], orderTokens: ['record', 'a', 'make', 'I'], order: ['I', 'make', 'a', 'record'], finalSentence: 'I make a record.', secondFillPrompt: 'I mark the ___.', secondFillAnswers: ['page'], secondChoicePrompt: 'Which sentence can be in an office story?', secondChoiceOptions: ['I copy and print a page.', 'The flower is beautiful.', 'The baby is happy.'], secondCorrectOption: 'I copy and print a page.', chinesePrompt: '我在办公室。我开会，写信，打印一页并做记录。', meaningHint: 'Tell a full office story.', suggestedPatternIds: ['i-am-in-office', 'i-have-meeting', 'i-write-letter', 'i-make-record'], referenceAnswers: ['I am in the office. I have a meeting. I write a letter. I make a record.'], outputTopic: 'Office Story', outputPrompts: ['Where are you?', 'What work do you do?'], outputTemplate: ['I am in the office.', 'I have a meeting.', 'I write a letter.', 'I copy a page.', 'I print a page.', 'I make a record.'], storyPrompt: 'Make a full office work story.', recapTopic: 'office' }),
]);

export const week11 = simpleWeek('week-11', 11, 'Like and Reason', 'Say likes, ideas, and reasons.', [
  makeDay({ dayNumber: 71, weekId: 'week-11', title: 'Like', goal: 'Say what you like.', wordIds: ['like', 'book', 'food', 'family', 'good', 'happy'], patternIds: ['i-like'], choicePrompt: 'Which sentence says a like?', choiceOptions: ['I like this book.', 'I print a page.', 'There is rain.'], correctOption: 'I like this book.', fillPrompt: 'I ___ this book.', fillAnswers: ['like'], orderTokens: ['this', 'book', 'like', 'I'], order: ['I', 'like', 'this', 'book'], finalSentence: 'I like this book.', secondFillPrompt: 'I like my ___.', secondFillAnswers: ['family'], secondChoicePrompt: 'Which sentence says a good feeling?', secondChoiceOptions: ['I like my family.', 'The office is open.', 'The wind is cold.'], secondCorrectOption: 'I like my family.', chinesePrompt: '我喜欢这本书。我喜欢我的家人。', meaningHint: 'Say what you like.', suggestedPatternIds: ['i-like'], referenceAnswers: ['I like this book. I like my family.'], outputTopic: 'Like', outputPrompts: ['What do you like?', 'Why is it good?'], outputTemplate: ['I like this book.', 'I like food.', 'I like my family.', 'This is good.'], storyPrompt: 'Make a short story about what you like.' }),
  makeDay({ dayNumber: 72, weekId: 'week-11', title: 'Love Family', goal: 'Say what you love.', wordIds: ['love', 'family', 'mother', 'father', 'sister', 'brother'], patternIds: ['i-love', 'this-is-my-family'], choicePrompt: 'Which sentence says love?', choiceOptions: ['I love my family.', 'I copy a page.', 'There is a cloud.'], correctOption: 'I love my family.', fillPrompt: 'I ___ my family.', fillAnswers: ['love'], orderTokens: ['my', 'family', 'love', 'I'], order: ['I', 'love', 'my', 'family'], finalSentence: 'I love my family.', secondFillPrompt: 'I love my ___.', secondFillAnswers: ['mother', 'father', 'sister', 'brother'], secondChoicePrompt: 'Which sentence is about family feeling?', secondChoiceOptions: ['I love my mother.', 'The weather is cold.', 'This number is small.'], secondCorrectOption: 'I love my mother.', chinesePrompt: '我爱我的家人。我爱我的母亲。', meaningHint: 'Say what you love.', suggestedPatternIds: ['i-love'], referenceAnswers: ['I love my family. I love my mother.'], outputTopic: 'Love Family', outputPrompts: ['Who do you love?', 'What is your family like?'], outputTemplate: ['I love my family.', 'I love my mother.', 'I love my father.', 'My family is kind.'], storyPrompt: 'Make a short story about loving family.' }),
  makeDay({ dayNumber: 73, weekId: 'week-11', title: 'Fear and Hope', goal: 'Say fear and hope.', wordIds: ['fear', 'hope', 'problem', 'safe', 'good', 'answer'], patternIds: ['this-is-my-reason'], choicePrompt: 'Which sentence says a feeling?', choiceOptions: ['I have hope.', 'I print a page.', 'There is a flower.'], correctOption: 'I have hope.', fillPrompt: 'I have ___.', fillAnswers: ['fear', 'hope'], orderTokens: ['hope', 'have', 'I'], order: ['I', 'have', 'hope'], finalSentence: 'I have hope.', secondFillPrompt: 'I have ___ about a problem.', secondFillAnswers: ['fear'], secondChoicePrompt: 'Which sentence changes to a good feeling?', secondChoiceOptions: ['I have hope.', 'I am in the office.', 'The tree is tall.'], secondCorrectOption: 'I have hope.', chinesePrompt: '我有害怕。我也有希望。', meaningHint: 'Say fear and hope.',
      suggestedPatternIds: ['this-is-my-reason'], referenceAnswers: ['I have fear. I have hope.'], outputTopic: 'Fear and Hope', outputPrompts: ['What is the bad feeling?', 'What is the good feeling?'], outputTemplate: ['I have fear.', 'There is danger.', 'I am safe.', 'I have hope.'], storyPrompt: 'Make a short story about fear and hope.' }),
  makeDay({ dayNumber: 74, weekId: 'week-11', title: 'Idea and Thought', goal: 'Say an idea and thought.', wordIds: ['idea', 'thought', 'question', 'answer', 'clear', 'understand'], patternIds: ['i-have-an-idea'], choicePrompt: 'Which sentence says an idea?', choiceOptions: ['I have an idea.', 'The baby is happy.', 'There is rain.'], correctOption: 'I have an idea.', fillPrompt: 'I have an ___.', fillAnswers: ['idea'], orderTokens: ['an', 'idea', 'have', 'I'], order: ['I', 'have', 'an', 'idea'], finalSentence: 'I have an idea.', secondFillPrompt: 'This thought is ___.', secondFillAnswers: ['clear'], secondChoicePrompt: 'Which sentence says a clear thought?', secondChoiceOptions: ['This thought is clear.', 'The wind is cold.', 'I write a letter.'], secondCorrectOption: 'This thought is clear.', chinesePrompt: '我有一个想法。这个想法很清楚。', meaningHint: 'Say an idea and thought.', suggestedPatternIds: ['i-have-an-idea'], referenceAnswers: ['I have an idea. This thought is clear.'], outputTopic: 'Idea and Thought', outputPrompts: ['What idea do you have?', 'Is the thought clear?'], outputTemplate: ['I have an idea.', 'This thought is clear.', 'I ask a question.', 'I have an answer.'], storyPrompt: 'Make a short story about an idea and thought.' }),
  makeDay({ dayNumber: 75, weekId: 'week-11', title: 'Reason', goal: 'Give a reason.', wordIds: ['reason', 'because', 'like', 'good', 'idea', 'true'], patternIds: ['this-is-my-reason', 'i-like'], choicePrompt: 'Which sentence gives a reason?', choiceOptions: ['This is my reason.', 'I copy a page.', 'There is wind.'], correctOption: 'This is my reason.', fillPrompt: 'This is my ___.', fillAnswers: ['reason'], orderTokens: ['my', 'reason', 'is', 'This'], order: ['This', 'is', 'my', 'reason'], finalSentence: 'This is my reason.', secondFillPrompt: 'I like it ___ it is good.', secondFillAnswers: ['because'], secondChoicePrompt: 'Which sentence uses a reason?', secondChoiceOptions: ['I like it because it is good.', 'The baby is small.', 'I print a page.'], secondCorrectOption: 'I like it because it is good.', chinesePrompt: '这是我的原因。我喜欢它，因为它很好。', meaningHint: 'Give a reason for a like.', suggestedPatternIds: ['this-is-my-reason', 'i-like'], referenceAnswers: ['This is my reason. I like it because it is good.'], outputTopic: 'Reason', outputPrompts: ['What do you like?', 'What is your reason?'], outputTemplate: ['I like this book.', 'This is my reason.', 'It is good.', 'I like it because it is good.'], storyPrompt: 'Make a short story with a reason.' }),
  makeDay({ dayNumber: 76, weekId: 'week-11', title: 'True and False', goal: 'Say true, false, and possible.', wordIds: ['true', 'false', 'possible', 'idea', 'reason', 'answer'], patternIds: ['this-is-true', 'this-is-my-reason'], choicePrompt: 'Which sentence says true?', choiceOptions: ['This is true.', 'I am in the garden.', 'The baby is happy.'], correctOption: 'This is true.', fillPrompt: 'This is ___.', fillAnswers: ['true', 'false', 'possible'], orderTokens: ['true', 'is', 'This'], order: ['This', 'is', 'true'], finalSentence: 'This is true.', secondFillPrompt: 'This is not true. It is ___.', secondFillAnswers: ['false'], secondChoicePrompt: 'Which sentence says a possible thing?', secondChoiceOptions: ['This is possible.', 'The cloud is white.', 'I love my family.'], secondCorrectOption: 'This is possible.', chinesePrompt: '这是真的。这是假的。这是可能的。', meaningHint: 'Say true, false, and possible.', suggestedPatternIds: ['this-is-true'], referenceAnswers: ['This is true. This is false. This is possible.'], outputTopic: 'True and False', outputPrompts: ['What is true?', 'What is possible?'], outputTemplate: ['This is true.', 'This is false.', 'This is possible.', 'This is my reason.'], storyPrompt: 'Make a short story about true, false, and possible.' }),
  makeDay({ dayNumber: 77, weekId: 'week-11', title: 'Week 11 Opinion Story', goal: 'Tell what you like and why.', wordIds: ['like', 'love', 'fear', 'hope', 'idea', 'thought', 'reason', 'true', 'false', 'possible'], patternIds: ['i-like', 'i-love', 'i-have-an-idea', 'this-is-my-reason', 'this-is-true'], choicePrompt: 'Which sentence starts an opinion story?', choiceOptions: ['I like this book.', 'There is rain.', 'I copy a page.'], correctOption: 'I like this book.', fillPrompt: 'I have an ___.', fillAnswers: ['idea'], orderTokens: ['my', 'reason', 'is', 'This'], order: ['This', 'is', 'my', 'reason'], finalSentence: 'This is my reason.', secondFillPrompt: 'This is ___.', secondFillAnswers: ['true', 'possible'], secondChoicePrompt: 'Which sentence gives a reason?', secondChoiceOptions: ['I like it because it is good.', 'The baby is happy.', 'The office is open.'], secondCorrectOption: 'I like it because it is good.', chinesePrompt: '我喜欢这本书。我有一个想法。这是我的原因。', meaningHint: 'Tell a full opinion story.', suggestedPatternIds: ['i-like', 'i-have-an-idea', 'this-is-my-reason'], referenceAnswers: ['I like this book. I have an idea. This is my reason. This is true.'], outputTopic: 'Opinion Story', outputPrompts: ['What do you like?', 'What is your reason?'], outputTemplate: ['I like this book.', 'I love my family.', 'I have an idea.', 'This is my thought.', 'This is my reason.', 'This is true.'], storyPrompt: 'Make a full story with a like, idea, and reason.', recapTopic: 'opinion' }),
]);

export const week12 = simpleWeek('week-12', 12, 'Time and Place', 'Tell yesterday, tomorrow, summer, winter, and place stories.', [
  makeDay({ dayNumber: 78, weekId: 'week-12', title: 'Tomorrow', goal: 'Say what you will do tomorrow.', wordIds: ['will', 'tomorrow', 'go', 'study', 'work', 'home'], patternIds: ['i-will-tomorrow'], choicePrompt: 'Which sentence says tomorrow?', choiceOptions: ['I will go tomorrow.', 'This is my family.', 'There is rain.'], correctOption: 'I will go tomorrow.', fillPrompt: 'I will go ___.', fillAnswers: ['tomorrow'], orderTokens: ['go', 'tomorrow', 'will', 'I'], order: ['I', 'will', 'go', 'tomorrow'], finalSentence: 'I will go tomorrow.', secondFillPrompt: 'I will ___ tomorrow.', secondFillAnswers: ['go', 'study', 'work'], secondChoicePrompt: 'Which sentence says a future action?', secondChoiceOptions: ['I will study tomorrow.', 'The baby is happy.', 'I copy a page.'], secondCorrectOption: 'I will study tomorrow.', chinesePrompt: '我明天会去。我明天会学习。', meaningHint: 'Say a future action.', suggestedPatternIds: ['i-will-tomorrow'], referenceAnswers: ['I will go tomorrow. I will study tomorrow.'], outputTopic: 'Tomorrow', outputPrompts: ['What will you do tomorrow?', 'Where will you go?'], outputTemplate: ['I will go tomorrow.', 'I will study tomorrow.', 'I will work tomorrow.', 'I will go home.'], storyPrompt: 'Make a short story about tomorrow.' }),
  makeDay({ dayNumber: 79, weekId: 'week-12', title: 'Yesterday', goal: 'Say what was true yesterday.', wordIds: ['yesterday', 'day', 'home', 'school', 'work', 'good'], patternIds: ['yesterday-i'], choicePrompt: 'Which sentence says yesterday?', choiceOptions: ['Yesterday I was home.', 'The weather is cold.', 'This is my mother.'], correctOption: 'Yesterday I was home.', fillPrompt: '___ I was home.', fillAnswers: ['Yesterday'], orderTokens: ['I', 'home', 'was', 'Yesterday'], order: ['Yesterday', 'I', 'was', 'home'], finalSentence: 'Yesterday I was home.', secondFillPrompt: 'Yesterday I was at ___.', secondFillAnswers: ['school', 'work', 'home'], secondChoicePrompt: 'Which sentence says a past day?', secondChoiceOptions: ['Yesterday I was at school.', 'I will go tomorrow.', 'The flower is good.'], secondCorrectOption: 'Yesterday I was at school.', chinesePrompt: '昨天我在家。昨天我在学校。', meaningHint: 'Say a past day.', suggestedPatternIds: ['yesterday-i'], referenceAnswers: ['Yesterday I was home. Yesterday I was at school.'], outputTopic: 'Yesterday', outputPrompts: ['Where was your place yesterday?', 'Was yesterday good?'], outputTemplate: ['Yesterday I was home.', 'Yesterday I was at school.', 'Yesterday was good.', 'I was happy.'], storyPrompt: 'Make a short story about yesterday.' }),
  makeDay({ dayNumber: 80, weekId: 'week-12', title: 'Week, Month, Year', goal: 'Say week, month, and year.', wordIds: ['week', 'month', 'year', 'day', 'time', 'good'], patternIds: ['this-week'], choicePrompt: 'Which sentence says this week?', choiceOptions: ['This week is good.', 'The wind is cold.', 'I love my family.'], correctOption: 'This week is good.', fillPrompt: 'This ___ is good.', fillAnswers: ['week', 'month', 'year'], orderTokens: ['week', 'good', 'is', 'This'], order: ['This', 'week', 'is', 'good'], finalSentence: 'This week is good.', secondFillPrompt: 'This month has ___ days.', secondFillAnswers: ['much'], secondChoicePrompt: 'Which sentence uses year?', secondChoiceOptions: ['This year is good.', 'I copy a page.', 'There is a cloud.'], secondCorrectOption: 'This year is good.', chinesePrompt: '这一周很好。这个月有很多天。今年很好。', meaningHint: 'Say week, month, and year.', suggestedPatternIds: ['this-week'], referenceAnswers: ['This week is good. This month has much days. This year is good.'], outputTopic: 'Week Month Year', outputPrompts: ['How is this week?', 'How is this year?'], outputTemplate: ['This week is good.', 'This month has much days.', 'This year is good.', 'Time is important.'], storyPrompt: 'Make a short story about week, month, and year.' }),
  makeDay({ dayNumber: 81, weekId: 'week-12', title: 'Summer and Winter', goal: 'Describe summer and winter.', wordIds: ['summer', 'winter', 'warm', 'cold', 'weather', 'year'], patternIds: ['in-season', 'the-weather-is'], choicePrompt: 'Which sentence describes summer?', choiceOptions: ['In summer, it is warm.', 'I have a meeting.', 'This is my sister.'], correctOption: 'In summer, it is warm.', fillPrompt: 'In summer, it is ___.', fillAnswers: ['warm'], orderTokens: ['summer', 'it', 'warm', 'is', 'In'], order: ['In', 'summer', 'it', 'is', 'warm'], finalSentence: 'In summer it is warm.', secondFillPrompt: 'In winter, it is ___.', secondFillAnswers: ['cold'], secondChoicePrompt: 'Which sentence describes winter?', secondChoiceOptions: ['In winter, it is cold.', 'I write a letter.', 'The baby is happy.'], secondCorrectOption: 'In winter, it is cold.', chinesePrompt: '夏天很暖和。冬天很冷。', meaningHint: 'Describe summer and winter.', suggestedPatternIds: ['in-season'], referenceAnswers: ['In summer, it is warm. In winter, it is cold.'], outputTopic: 'Summer and Winter', outputPrompts: ['How is summer?', 'How is winter?'], outputTemplate: ['In summer, it is warm.', 'The sun gives heat.', 'In winter, it is cold.', 'I keep warm.'], storyPrompt: 'Make a short story about summer and winter.' }),
  makeDay({ dayNumber: 82, weekId: 'week-12', title: 'North and South', goal: 'Describe north and south.', wordIds: ['north', 'south', 'cold', 'warm', 'weather', 'way'], patternIds: ['north-south'], choicePrompt: 'Which sentence describes north?', choiceOptions: ['The north is cold.', 'I have an idea.', 'This is a page.'], correctOption: 'The north is cold.', fillPrompt: 'The north is ___.', fillAnswers: ['cold'], orderTokens: ['north', 'cold', 'is', 'The'], order: ['The', 'north', 'is', 'cold'], finalSentence: 'The north is cold.', secondFillPrompt: 'The south is ___.', secondFillAnswers: ['warm'], secondChoicePrompt: 'Which sentence describes south?', secondChoiceOptions: ['The south is warm.', 'I love my family.', 'There is a page.'], secondCorrectOption: 'The south is warm.', chinesePrompt: '北方很冷。南方很暖和。', meaningHint: 'Describe north and south.', suggestedPatternIds: ['north-south'], referenceAnswers: ['The north is cold. The south is warm.'], outputTopic: 'North and South', outputPrompts: ['How is the north?', 'How is the south?'], outputTemplate: ['The north is cold.', 'The south is warm.', 'The weather is different.', 'This way is good.'], storyPrompt: 'Make a short story about north and south.' }),
  makeDay({ dayNumber: 83, weekId: 'week-12', title: 'Time Story', goal: 'Use yesterday and tomorrow in one story.', wordIds: ['yesterday', 'tomorrow', 'will', 'week', 'work', 'study'], patternIds: ['i-will-tomorrow', 'yesterday-i', 'this-week'], choicePrompt: 'Which sentence says future time?', choiceOptions: ['I will work tomorrow.', 'Yesterday I was home.', 'The north is cold.'], correctOption: 'I will work tomorrow.', fillPrompt: 'I will ___ tomorrow.', fillAnswers: ['work', 'study'], orderTokens: ['tomorrow', 'study', 'will', 'I'], order: ['I', 'will', 'study', 'tomorrow'], finalSentence: 'I will study tomorrow.', secondFillPrompt: 'Yesterday I ___ home.', secondFillAnswers: ['was'], secondChoicePrompt: 'Which sentence uses week?', secondChoiceOptions: ['This week is good.', 'The baby is happy.', 'I make a record.'], secondCorrectOption: 'This week is good.', chinesePrompt: '昨天我在家。明天我会学习。这一周很好。', meaningHint: 'Use past and future time.', suggestedPatternIds: ['i-will-tomorrow', 'yesterday-i', 'this-week'], referenceAnswers: ['Yesterday I was home. I will study tomorrow. This week is good.'], outputTopic: 'Time Story', outputPrompts: ['What was true yesterday?', 'What will be true tomorrow?'], outputTemplate: ['Yesterday I was home.', 'This week is good.', 'I will study tomorrow.', 'I will work tomorrow.'], storyPrompt: 'Make a short story with yesterday and tomorrow.' }),
  makeDay({ dayNumber: 84, weekId: 'week-12', title: 'Week 12 Time Story', goal: 'Tell a full time and place story.', wordIds: ['will', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'summer', 'winter', 'north', 'south'], patternIds: ['i-will-tomorrow', 'yesterday-i', 'this-week', 'in-season', 'north-south'], choicePrompt: 'Which sentence starts a time story?', choiceOptions: ['Yesterday I was home.', 'The baby is small.', 'I print a page.'], correctOption: 'Yesterday I was home.', fillPrompt: 'I will go ___.', fillAnswers: ['tomorrow'], orderTokens: ['week', 'good', 'is', 'This'], order: ['This', 'week', 'is', 'good'], finalSentence: 'This week is good.', secondFillPrompt: 'In winter, it is ___.', secondFillAnswers: ['cold'], secondChoicePrompt: 'Which sentence can end a place story?', secondChoiceOptions: ['The south is warm.', 'I have a meeting.', 'There is a tree.'], secondCorrectOption: 'The south is warm.', chinesePrompt: '昨天我在家。明天我会去。这一周很好。冬天很冷，南方很暖和。', meaningHint: 'Tell a full time and place story.', suggestedPatternIds: ['i-will-tomorrow', 'yesterday-i', 'this-week', 'in-season'], referenceAnswers: ['Yesterday I was home. I will go tomorrow. This week is good. In winter, it is cold. The south is warm.'], outputTopic: 'Time and Place Story', outputPrompts: ['What was true yesterday?', 'What will be true tomorrow?', 'How are summer, winter, and place?'], outputTemplate: ['Yesterday I was home.', 'I will go tomorrow.', 'This week is good.', 'In summer, it is warm.', 'In winter, it is cold.', 'The south is warm.'], storyPrompt: 'Make a full story with yesterday, tomorrow, summer, winter, and place.', recapTopic: 'time' }),
]);

export const week8to12Words = [...week8Words, ...week9Words, ...week10Words, ...week11Words, ...week12Words];
export const week8to12Patterns = [
  ...week8Patterns,
  ...week9Patterns,
  ...week10Patterns,
  ...week11Patterns,
  ...week12Patterns,
];
export const week8to12 = [week8, week9, week10, week11, week12];
