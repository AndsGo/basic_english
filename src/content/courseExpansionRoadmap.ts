import type { Course, WordCategory } from '../domain/types';

export interface CourseExpansionWeek {
  weekNumber: number;
  phase: 'foundation-extension' | 'daily-life-control' | 'people-and-society' | 'world-and-work' | 'fluency-consolidation';
  theme: string;
  expressionOutcome: string;
  targetCoreWords: number;
  focusCategories: WordCategory[];
}

export interface CourseExpansionSummary {
  currentWeeks: number;
  futureWeeks: number;
  totalPlannedWeeks: number;
  currentCoreCoverage: number;
  remainingCoreWords: number;
  plannedFutureCoreWords: number;
  averageFutureCoreWordsPerWeek: number;
}

export const courseExpansionRoadmap: CourseExpansionWeek[] = [
  {
    weekNumber: 13,
    phase: 'foundation-extension',
    theme: 'More Actions at Home',
    expressionOutcome: 'Say more about making, moving, opening, and changing things at home.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'quality'],
  },
  {
    weekNumber: 14,
    phase: 'foundation-extension',
    theme: 'Things and Materials',
    expressionOutcome: 'Describe what common things are made of and what they are like.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'picturable_thing', 'quality'],
  },
  {
    weekNumber: 15,
    phase: 'foundation-extension',
    theme: 'Shape and Position',
    expressionOutcome: 'Describe shape, side, line, level, and position in simple scenes.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'quality', 'general_thing'],
  },
  {
    weekNumber: 16,
    phase: 'foundation-extension',
    theme: 'Amount and Comparison',
    expressionOutcome: 'Compare amount, size, weight, and number with simple words.',
    targetCoreWords: 17,
    focusCategories: ['quality', 'structure', 'general_thing'],
  },
  {
    weekNumber: 17,
    phase: 'foundation-extension',
    theme: 'Light, Color, and Look',
    expressionOutcome: 'Describe what things look like using color, light, and simple qualities.',
    targetCoreWords: 17,
    focusCategories: ['quality', 'picturable_thing', 'general_thing'],
  },
  {
    weekNumber: 18,
    phase: 'foundation-extension',
    theme: 'Clothes and Personal Things',
    expressionOutcome: 'Talk about clothes, body items, and small personal things.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'quality'],
  },
  {
    weekNumber: 19,
    phase: 'foundation-extension',
    theme: 'Kitchen and Food Detail',
    expressionOutcome: 'Describe food, taste, cooking, and common kitchen objects.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'operation'],
  },
  {
    weekNumber: 20,
    phase: 'foundation-extension',
    theme: 'Home Story Check',
    expressionOutcome: 'Tell a complete home story with things, actions, amount, and quality.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'quality', 'structure'],
  },
  {
    weekNumber: 21,
    phase: 'daily-life-control',
    theme: 'Time, Frequency, and Order',
    expressionOutcome: 'Say when and how often things happen, and put actions in order.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'general_thing', 'operation'],
  },
  {
    weekNumber: 22,
    phase: 'daily-life-control',
    theme: 'Work and Study Actions',
    expressionOutcome: 'Describe simple work, study, reading, writing, and record tasks.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'structure'],
  },
  {
    weekNumber: 23,
    phase: 'daily-life-control',
    theme: 'Asking and Answering',
    expressionOutcome: 'Ask, answer, request, explain, and check information.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'structure', 'general_thing'],
  },
  {
    weekNumber: 24,
    phase: 'daily-life-control',
    theme: 'Cause and Effect',
    expressionOutcome: 'Give simple reasons and describe what causes a result.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'general_thing', 'operation'],
  },
  {
    weekNumber: 25,
    phase: 'daily-life-control',
    theme: 'Making Plans',
    expressionOutcome: 'Talk about plans, purpose, future actions, and what is possible.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'operation', 'quality'],
  },
  {
    weekNumber: 26,
    phase: 'daily-life-control',
    theme: 'Problems and Decisions',
    expressionOutcome: 'Describe a problem, compare choices, and say a simple decision.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'quality'],
  },
  {
    weekNumber: 27,
    phase: 'daily-life-control',
    theme: 'Rules and Control',
    expressionOutcome: 'Say what is allowed, controlled, stopped, or changed.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'structure'],
  },
  {
    weekNumber: 28,
    phase: 'daily-life-control',
    theme: 'Daily-Life Check',
    expressionOutcome: 'Tell a longer daily-life story with time, reason, plan, and result.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'structure', 'quality'],
  },
  {
    weekNumber: 29,
    phase: 'people-and-society',
    theme: 'Family and Relations',
    expressionOutcome: 'Describe family, relations, age, and simple social facts.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'structure', 'quality'],
  },
  {
    weekNumber: 30,
    phase: 'people-and-society',
    theme: 'Feelings and Opinions',
    expressionOutcome: 'Say feelings, likes, dislikes, beliefs, and opinions with reasons.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'quality', 'operation'],
  },
  {
    weekNumber: 31,
    phase: 'people-and-society',
    theme: 'Health and Body Detail',
    expressionOutcome: 'Describe body parts, pain, health, care, and simple medical needs.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'quality'],
  },
  {
    weekNumber: 32,
    phase: 'people-and-society',
    theme: 'People at Work',
    expressionOutcome: 'Describe persons, roles, groups, managers, and work relations.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'structure'],
  },
  {
    weekNumber: 33,
    phase: 'people-and-society',
    theme: 'Community Places',
    expressionOutcome: 'Talk about school, hospital, market, office, and public places.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'picturable_thing', 'operation'],
  },
  {
    weekNumber: 34,
    phase: 'people-and-society',
    theme: 'Agreement and Respect',
    expressionOutcome: 'Agree, disagree, show respect, and talk about responsible actions.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'quality', 'structure'],
  },
  {
    weekNumber: 35,
    phase: 'people-and-society',
    theme: 'Help, Care, and Support',
    expressionOutcome: 'Offer help, ask for support, and describe care between people.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'quality'],
  },
  {
    weekNumber: 36,
    phase: 'people-and-society',
    theme: 'People Story Check',
    expressionOutcome: 'Tell a people story with relation, feeling, reason, and action.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'structure'],
  },
  {
    weekNumber: 37,
    phase: 'world-and-work',
    theme: 'Nature and Weather',
    expressionOutcome: 'Describe air, earth, water, weather, plants, and natural changes.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'quality'],
  },
  {
    weekNumber: 38,
    phase: 'world-and-work',
    theme: 'Animals and Living Things',
    expressionOutcome: 'Describe animals, living things, growth, and simple natural actions.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'operation'],
  },
  {
    weekNumber: 39,
    phase: 'world-and-work',
    theme: 'Travel and Movement',
    expressionOutcome: 'Talk about roads, transport, direction, distance, and moving things.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'structure'],
  },
  {
    weekNumber: 40,
    phase: 'world-and-work',
    theme: 'Trade and Money',
    expressionOutcome: 'Describe buying, selling, account, value, payment, and trade.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'quality'],
  },
  {
    weekNumber: 41,
    phase: 'world-and-work',
    theme: 'Tools and Machines',
    expressionOutcome: 'Describe tools, machines, parts, force, and simple operations.',
    targetCoreWords: 17,
    focusCategories: ['picturable_thing', 'general_thing', 'operation'],
  },
  {
    weekNumber: 42,
    phase: 'world-and-work',
    theme: 'Materials and Production',
    expressionOutcome: 'Say how things are made, changed, produced, and used.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'general_thing', 'quality'],
  },
  {
    weekNumber: 43,
    phase: 'world-and-work',
    theme: 'Science and Systems',
    expressionOutcome: 'Describe simple systems, instruments, effects, and observations.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'structure'],
  },
  {
    weekNumber: 44,
    phase: 'world-and-work',
    theme: 'World Story Check',
    expressionOutcome: 'Tell a practical world story about place, object, system, and result.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'operation', 'quality'],
  },
  {
    weekNumber: 45,
    phase: 'fluency-consolidation',
    theme: 'Past Events',
    expressionOutcome: 'Tell what happened before, after, and again in a clear event story.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'operation', 'general_thing'],
  },
  {
    weekNumber: 46,
    phase: 'fluency-consolidation',
    theme: 'Future and Purpose',
    expressionOutcome: 'Say what will happen, why it will happen, and what it is for.',
    targetCoreWords: 17,
    focusCategories: ['structure', 'operation', 'quality'],
  },
  {
    weekNumber: 47,
    phase: 'fluency-consolidation',
    theme: 'Comparison and Quality',
    expressionOutcome: 'Compare people, things, places, and results with clear qualities.',
    targetCoreWords: 17,
    focusCategories: ['quality', 'structure', 'general_thing'],
  },
  {
    weekNumber: 48,
    phase: 'fluency-consolidation',
    theme: 'Argument and Reason',
    expressionOutcome: 'Give a simple argument with facts, reasons, and examples.',
    targetCoreWords: 17,
    focusCategories: ['general_thing', 'structure', 'operation'],
  },
  {
    weekNumber: 49,
    phase: 'fluency-consolidation',
    theme: 'Instructions and Processes',
    expressionOutcome: 'Give step-by-step instructions and describe a process.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'structure', 'general_thing'],
  },
  {
    weekNumber: 50,
    phase: 'fluency-consolidation',
    theme: 'Description Practice',
    expressionOutcome: 'Describe an unfamiliar picture using Basic English words only.',
    targetCoreWords: 17,
    focusCategories: ['quality', 'general_thing', 'picturable_thing'],
  },
  {
    weekNumber: 51,
    phase: 'fluency-consolidation',
    theme: 'Story Practice',
    expressionOutcome: 'Tell a complete story with person, place, reason, and result.',
    targetCoreWords: 17,
    focusCategories: ['operation', 'structure', 'general_thing'],
  },
  {
    weekNumber: 52,
    phase: 'fluency-consolidation',
    theme: '850 Word Final Check',
    expressionOutcome: 'Use the full Basic English word range in practical description and story tasks.',
    targetCoreWords: 16,
    focusCategories: ['operation', 'structure', 'quality'],
  },
];

export function summarizeCourseExpansionRoadmap(input: {
  course: Course;
  basicEnglishAllowedWords: ReadonlySet<string>;
  basicEnglishWordList: readonly string[];
  roadmap: readonly CourseExpansionWeek[];
}): CourseExpansionSummary {
  const currentCourseWords = new Set(input.course.words.map((word) => word.text.toLowerCase()));
  const currentCoreCoverage = [...currentCourseWords].filter((word) => input.basicEnglishAllowedWords.has(word)).length;
  const plannedFutureCoreWords = input.roadmap.reduce((total, week) => total + week.targetCoreWords, 0);

  return {
    currentWeeks: input.course.weeks.length,
    futureWeeks: input.roadmap.length,
    totalPlannedWeeks: input.course.weeks.length + input.roadmap.length,
    currentCoreCoverage,
    remainingCoreWords: input.basicEnglishWordList.length - currentCoreCoverage,
    plannedFutureCoreWords,
    averageFutureCoreWordsPerWeek: plannedFutureCoreWords / input.roadmap.length,
  };
}
