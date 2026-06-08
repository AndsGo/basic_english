export type WordCategory =
  | 'operation'
  | 'general_thing'
  | 'picturable_thing'
  | 'quality'
  | 'opposite_quality'
  | 'structure';

export interface Course {
  id: string;
  title: string;
  contentVersion: string;
  schemaVersion: number;
  weeks: Week[];
  words: Word[];
  patterns: Pattern[];
}

export interface Week {
  id: string;
  number: number;
  title: string;
  goal: string;
  days: Day[];
}

export interface Day {
  id: string;
  weekId: string;
  dayNumber: number;
  title: string;
  goal: string;
  estimatedMinutes: number;
  review: ReviewSpec;
  wordIds: string[];
  patternIds: string[];
  exercises: Exercise[];
  outputTask: OutputTask;
  weeklyCheckRubric?: WeeklyCheckRubric;
}

export interface ReviewSpec {
  wordCount: number;
  patternCount: number;
}

export interface Word {
  id: string;
  text: string;
  category: WordCategory;
  definition: string;
  chinese: string;
  example: string;
  weekIntroduced: number;
  tags: string[];
}

export interface Pattern {
  id: string;
  title: string;
  use: string;
  structure: string;
  examples: string[];
  slots: string[];
}

export type Exercise =
  | ChoiceExercise
  | FillBlankExercise
  | SentenceOrderExercise
  | ReplacementExercise
  | TranslationExercise;

export interface ChoiceExercise {
  type: 'choice';
  id: string;
  prompt: string;
  options: string[];
  correctOption: string;
  explanation?: string;
}

export interface FillBlankExercise {
  type: 'fill_blank';
  id: string;
  prompt: string;
  acceptedAnswers: string[];
  explanation?: string;
}

export interface SentenceOrderExercise {
  type: 'sentence_order';
  id: string;
  tokens: string[];
  correctOrder: string[];
  finalSentence: string;
}

export interface ReplacementExercise {
  type: 'replacement';
  id: string;
  patternId: string;
  slotValues: Record<string, string>;
  referenceAnswer: string;
}

export interface TranslationExercise {
  type: 'translation';
  id: string;
  chinesePrompt: string;
  coreMeaningHint: string;
  suggestedPatternIds: string[];
  referenceAnswers: string[];
}

export interface OutputTask {
  id: string;
  topic: string;
  prompts: string[];
  template: string[];
  requiredSentenceCount: number;
  storyMode?: 'sentence' | 'recap';
  storyPrompt?: string;
}

export interface PictureDescribeTask {
  id: string;
  dayId: string;
  title: string;
  goal: string;
  image: string;
  targetWords: string[];
  suggestedPatterns: string[];
  requiredSentenceCount: number;
  simpleVersion: string[];
}

export type SceneHelpMode = 'template' | 'guided' | 'free';

export interface SceneOutput {
  sceneId: string;
  helpMode: SceneHelpMode;
  sentences: string[];
  sceneText: string;
  dialogue: string;
  completedAt?: string;
}

export interface SceneGoal {
  id: string;
  title: string;
  capability: string;
  templates: string[];
  guidedPrompts: string[];
  scenePrompt: string;
  dialoguePrompts: string[];
}

export type SceneRemixTaskType = 'replace' | 'extend' | 'dialogue';

export interface SceneRemixTask {
  id: string;
  type: SceneRemixTaskType;
  prompt: string;
  source?: string;
  referenceAnswers: string[];
}

export type SceneRemixSelfMark = 'close' | 'review';

export interface WeeklyCheckRubric {
  scale: {
    min: 0;
    max: 2;
  };
  pass: {
    minimumTotalScore: number;
    minimumMeaningScore: number;
    minimumSentenceCount: number;
  };
  criteria: WeeklyCheckCriterion[];
}

export interface WeeklyCheckCriterion {
  id: string;
  label: string;
  scores: [string, string, string];
}

export interface ScenarioCapability {
  id: string;
  title: string;
  description: string;
  unlockedByDayIds: string[];
  exampleOutputs: string[];
}

export interface ScenarioWeek {
  weekNumber: number;
  theme: string;
  expressionOutcome: string;
}
