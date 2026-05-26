import type { ScenarioCapability, ScenarioWeek } from '../domain/types';

export const scenarioWeekMap: ScenarioWeek[] = [
  { weekNumber: 1, theme: 'People & Identity', expressionOutcome: 'Introduce yourself and another person.' },
  { weekNumber: 2, theme: 'Home & Things', expressionOutcome: 'Describe your room, things, and where things are.' },
  { weekNumber: 3, theme: 'Daily Life', expressionOutcome: 'Say what you do every day.' },
  { weekNumber: 4, theme: 'Food & Shopping', expressionOutcome: 'Order food and buy simple things.' },
  { weekNumber: 5, theme: 'Places & Directions', expressionOutcome: 'Ask where things are and say where to go.' },
  { weekNumber: 6, theme: 'People & Feelings', expressionOutcome: 'Describe feelings, likes, and simple relationships.' },
  { weekNumber: 7, theme: 'Problems & Help', expressionOutcome: 'Explain a problem and ask for help.' },
  { weekNumber: 8, theme: 'Health & Body', expressionOutcome: 'Describe simple health and body problems.' },
  { weekNumber: 9, theme: 'Past Simple Ideas', expressionOutcome: 'Say what happened yesterday.' },
  { weekNumber: 10, theme: 'Future Plans', expressionOutcome: 'Say what you will do tomorrow or later.' },
  { weekNumber: 11, theme: 'Opinions & Reasons', expressionOutcome: 'Say what you like, dislike, and why.' },
  { weekNumber: 12, theme: 'Final Scenario Practice', expressionOutcome: 'Answer daily-life scenario prompts.' },
];

export const scenarioCapabilities: ScenarioCapability[] = [
  {
    id: 'introduce-myself',
    title: 'I can introduce myself.',
    description: 'Say your name, place, and learner identity.',
    unlockedByDayIds: ['day-001'],
    exampleOutputs: ['My name is Li.', 'I am from China.'],
  },
  {
    id: 'introduce-another-person',
    title: 'I can introduce another person.',
    description: 'Introduce a friend or family member.',
    unlockedByDayIds: ['day-004'],
    exampleOutputs: ['This is my friend.', 'She is kind.'],
  },
  {
    id: 'say-why-i-study-english',
    title: 'I can say why I study English.',
    description: 'Give a simple reason for learning English.',
    unlockedByDayIds: ['day-006'],
    exampleOutputs: ['I study English because it is useful.'],
  },
  {
    id: 'describe-my-room',
    title: 'I can describe my room.',
    description: 'Say simple facts about your room.',
    unlockedByDayIds: ['day-008'],
    exampleOutputs: ['This is my room.', 'My room is small.'],
  },
  {
    id: 'say-things-in-my-room',
    title: 'I can say what things are in my room.',
    description: 'Say what objects are in your room.',
    unlockedByDayIds: ['day-009'],
    exampleOutputs: ['There is a book in my room.'],
  },
  {
    id: 'say-where-things-are',
    title: 'I can say where things are.',
    description: 'Use in, on, under, and near.',
    unlockedByDayIds: ['day-010'],
    exampleOutputs: ['The book is on the table.'],
  },
  {
    id: 'describe-study-things',
    title: 'I can describe study things on my table.',
    description: 'Describe a table and study objects.',
    unlockedByDayIds: ['day-011'],
    exampleOutputs: ['There is a pen on my table.'],
  },
  {
    id: 'describe-personal-things',
    title: 'I can describe personal things in my bag.',
    description: 'Describe personal things used every day.',
    unlockedByDayIds: ['day-012'],
    exampleOutputs: ['My phone is in my bag.'],
  },
  {
    id: 'describe-important-things',
    title: 'I can describe important things in my life.',
    description: 'Say why a thing is useful or important.',
    unlockedByDayIds: ['day-014'],
    exampleOutputs: ['It is important.', 'I use it every day.'],
  },
];
