export interface ListeningTaskContent {
  id: string;
  script: string;
  question: string;
  options: string[];
  answer: string;
  feedback: string;
}

export interface SpeakingTaskContent {
  id: string;
  model: string;
  goal: string;
  keywords: string[];
  reference: string;
}

export interface SkillLessonContent {
  dayId: string;
  revision: number;
  listening: ListeningTaskContent[];
  speaking: SpeakingTaskContent[];
}

export const skillLessonsByDayId: Record<string, SkillLessonContent> = {
  'day-001': {
    dayId: 'day-001',
    revision: 1,
    listening: [
      { id: 'd001-l1', script: 'My name is Anna.', question: 'What is the name?', options: ['Anna', 'Li', 'China'], answer: 'Anna', feedback: 'Anna is the name.' },
      { id: 'd001-l2', script: 'I am from China.', question: 'Where is the person from?', options: ['China', 'Japan', 'Shanghai'], answer: 'China', feedback: 'The person is from China.' },
      { id: 'd001-l3', script: 'What is your name? My name is Li.', question: 'What is the name?', options: ['Anna', 'Li', 'China'], answer: 'Li', feedback: 'Li is the name.' },
    ],
    speaking: [
      { id: 'd001-s1', model: 'My name is Li. I am from China.', goal: 'Listen and repeat the model.', keywords: ['my name', 'from'], reference: 'My name is Li. I am from China.' },
      { id: 'd001-s2', model: '', goal: 'Say your name and where you are from.', keywords: ['my name', 'from'], reference: 'My name is ___. I am from ___.' },
    ],
  },
};
