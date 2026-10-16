export interface CapabilityCheckTask {
  id: string;
  capabilityId: string;
  dayId: string;
  title: string;
  mission: string;
  listening: {
    script: string;
    question: string;
    options: string[];
    answer: string;
    feedback: string;
  };
  outputPrompt: string;
  minimumSentenceCount: number;
  requiredIdeas: string[];
  keywords: string[];
  sentenceStarters: string[];
  referenceAnswer: string;
}

export const capabilityChecksByDayId: Record<string, CapabilityCheckTask> = {
  'day-001': {
    id: 'capability-check-introduce-myself',
    capabilityId: 'introduce-myself',
    dayId: 'day-001',
    title: 'Introduce yourself',
    mission: 'Say your name, where you are from, and what you do.',
    listening: {
      script: 'My name is Anna. I am from China. I am a student.',
      question: 'What does Anna do?',
      options: ['She is a student.', 'She is a teacher.', 'She is a friend.'],
      answer: 'She is a student.',
      feedback: 'Anna is a student.',
    },
    outputPrompt: 'Introduce yourself in at least three short sentences.',
    minimumSentenceCount: 3,
    requiredIdeas: ['Your name', 'Where you are from', 'What you do'],
    keywords: ['name', 'from', 'student', 'work', 'study'],
    sentenceStarters: ['My name is...', 'I am from...', 'I am a...'],
    referenceAnswer: 'My name is Li. I am from China. I am a student.',
  },
  'day-024': {
    id: 'capability-check-buy-simple-things',
    capabilityId: 'buy-simple-things',
    dayId: 'day-024',
    title: 'Buy simple things',
    mission: 'Say what you want, ask for it, and make your choice.',
    listening: {
      script: 'I want bread and water. I have money. I buy them at the shop.',
      question: 'What does the person buy?',
      options: ['Bread and water.', 'Tea and milk.', 'A book and a pen.'],
      answer: 'Bread and water.',
      feedback: 'The person buys bread and water.',
    },
    outputPrompt: 'Say what you want to buy and ask for help in at least three short sentences.',
    minimumSentenceCount: 3,
    requiredIdeas: ['What you want', 'A simple request', 'Your choice'],
    keywords: ['want', 'buy', 'shop', 'price', 'please'],
    sentenceStarters: ['I want...', 'Do you have...?', 'I will take...'],
    referenceAnswer: 'I want some bread. Do you have bread? I will take this bread, please.',
  },
  'day-026': {
    id: 'capability-check-ask-for-help',
    capabilityId: 'ask-for-help',
    dayId: 'day-026',
    title: 'Ask for help',
    mission: 'Explain a problem, ask for help, and check the answer.',
    listening: {
      script: 'I cannot find the book. Please help me. Can you show me the book?',
      question: 'What help does the person need?',
      options: ['Finding a book.', 'Buying some food.', 'Getting some water.'],
      answer: 'Finding a book.',
      feedback: 'The person needs help finding a book.',
    },
    outputPrompt: 'Explain a problem and ask for help in at least three short sentences.',
    minimumSentenceCount: 3,
    requiredIdeas: ['The problem', 'A request for help', 'A check or answer'],
    keywords: ['problem', 'find', 'help', 'show', 'please'],
    sentenceStarters: ['I cannot find...', 'Please help me.', 'Can you show me...?'],
    referenceAnswer: 'I cannot find the book. Please help me. Can you show me the book?',
  },
};
