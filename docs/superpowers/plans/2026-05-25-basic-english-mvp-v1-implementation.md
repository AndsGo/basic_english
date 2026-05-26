# Basic English MVP v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Week 1 MVP of the Basic English 12 Weeks website: a mobile-first Today-task learning flow with local progress, review, Week 1 content, and a weekly check.

**Architecture:** Build a frontend-only Vite React app. Static course content lives in typed TypeScript modules and is validated by pure functions. User progress is stored in IndexedDB behind a repository interface so future cloud sync can be added without rewriting learning logic.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, fake-indexeddb, IndexedDB, CSS modules or plain CSS.

---

## Spec Source

Implement against:

- `docs/superpowers/specs/2026-05-25-basic-english-12-weeks-mvp-v1-design.md`

Current workspace status:

- No `package.json` exists.
- No frontend app exists.
- Existing files are learning/design documents only.
- This directory is not currently a git repository, so commit steps are intentionally omitted from this plan.

## File Structure

Create this structure:

```text
basic_english/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  src/
    main.tsx
    App.tsx
    styles.css
    content/
      week1.ts
      validateContent.ts
      validateContent.test.ts
    domain/
      types.ts
      progress.ts
      progress.test.ts
      review.ts
      review.test.ts
    storage/
      progressRepository.ts
      indexedDbProgressRepository.ts
      indexedDbProgressRepository.test.ts
    components/
      Layout.tsx
      TodayPage.tsx
      Stepper.tsx
      WordCards.tsx
      PatternCards.tsx
      ExerciseRenderer.tsx
      TranslationTask.tsx
      OutputTaskEditor.tsx
      CompletionSummary.tsx
      CoursePage.tsx
      ReviewPage.tsx
      WordsPage.tsx
      MePage.tsx
    test/
      setup.ts
```

Responsibility boundaries:

- `content/`: static Week 1 course data and validation.
- `domain/`: pure business logic for progress, unlocking, review, and derived state.
- `storage/`: persistence adapter only.
- `components/`: React rendering and user interaction.
- `App.tsx`: route/tab state and repository wiring.

---

### Task 1: Scaffold the Vite React TypeScript App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "idb": "^8.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^25.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create app config files**

`index.html`:

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Basic English 12 Weeks</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 3: Create initial React entry files**

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
```

`src/main.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Basic English 12 Weeks</p>
        <h1>Week 1 starts here.</h1>
        <p>One task per day. Finish five short steps. Your progress is saved on this browser.</p>
        <button type="button" className="primary-button">Start Day 1</button>
      </section>
    </main>
  );
}
```

`src/styles.css`:

```css
:root {
  color: #17211a;
  background: #f7f5ef;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

button,
input,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.hero-panel {
  max-width: 720px;
  margin: 0 auto;
}

.eyebrow {
  color: #496454;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.primary-button {
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  padding: 0 18px;
  color: white;
  background: #265c46;
  font-weight: 700;
}
```

- [ ] **Step 4: Install dependencies and verify scaffold**

Run:

```powershell
npm install
npm test
npm run build
```

Expected:

- `npm install` completes.
- `npm test` exits with no test files or all tests passing.
- `npm run build` exits with code 0.

---

### Task 2: Add Domain Types and Week 1 Course Content

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/content/week1.ts`
- Create: `src/content/validateContent.ts`
- Create: `src/content/validateContent.test.ts`

- [ ] **Step 1: Create failing content validation tests**

`src/content/validateContent.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { week1Course } from './week1';
import { validateCourseContent } from './validateContent';

describe('week1Course', () => {
  it('has seven complete days with required learning assets', () => {
    const result = validateCourseContent(week1Course);
    expect(result.errors).toEqual([]);
    expect(week1Course.weeks[0].days).toHaveLength(7);
  });

  it('keeps Chinese text readable', () => {
    const serialized = JSON.stringify(week1Course);
    expect(serialized).not.toContain('�');
    expect(serialized).not.toMatch(/æ|ç|è|å|涓|鐨/);
  });
});
```

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: fails because `week1.ts` and `validateContent.ts` do not exist.

- [ ] **Step 2: Define content and progress types**

`src/domain/types.ts`:

```ts
export type WordCategory = 'operation' | 'general_thing' | 'picturable_thing' | 'quality' | 'opposite_quality' | 'structure';

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
}

export interface ReviewSpec {
  wordCount: number;
  patternCount: number;
}

export interface Word {
  id: string;
  text: string;
  category: WordCategory;
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

export type Exercise = ChoiceExercise | FillBlankExercise | SentenceOrderExercise | ReplacementExercise | TranslationExercise;

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
}
```

- [ ] **Step 3: Create Week 1 static content**

Create `src/content/week1.ts` with a complete `week1Course` export. Use these exact day IDs and lesson goals:

```ts
import type { Course, Pattern, Word } from '../domain/types';

const words: Word[] = [
  { id: 'name', text: 'name', category: 'general_thing', chinese: '名字', example: 'My name is Li.', weekIntroduced: 1, tags: ['identity'] },
  { id: 'my', text: 'my', category: 'structure', chinese: '我的', example: 'My friend is here.', weekIntroduced: 1, tags: ['pronoun'] },
  { id: 'i', text: 'I', category: 'structure', chinese: '我', example: 'I am a student.', weekIntroduced: 1, tags: ['pronoun'] },
  { id: 'am', text: 'am', category: 'operation', chinese: '是', example: 'I am from China.', weekIntroduced: 1, tags: ['be'] },
  { id: 'from', text: 'from', category: 'structure', chinese: '来自', example: 'I am from China.', weekIntroduced: 1, tags: ['place'] },
  { id: 'china', text: 'China', category: 'general_thing', chinese: '中国', example: 'I am from China.', weekIntroduced: 1, tags: ['place'] },
  { id: 'student', text: 'student', category: 'general_thing', chinese: '学生', example: 'I am a student.', weekIntroduced: 1, tags: ['identity'] },
  { id: 'happy', text: 'happy', category: 'quality', chinese: '高兴的', example: 'I am happy today.', weekIntroduced: 1, tags: ['feeling'] },
  { id: 'have', text: 'have', category: 'operation', chinese: '有', example: 'I have a question.', weekIntroduced: 1, tags: ['possession'] },
  { id: 'question', text: 'question', category: 'general_thing', chinese: '问题', example: 'I have a question.', weekIntroduced: 1, tags: ['study'] },
  { id: 'friend', text: 'friend', category: 'general_thing', chinese: '朋友', example: 'This is my friend.', weekIntroduced: 1, tags: ['people'] },
  { id: 'this', text: 'this', category: 'structure', chinese: '这个', example: 'This is my friend.', weekIntroduced: 1, tags: ['demonstrative'] },
  { id: 'he', text: 'he', category: 'structure', chinese: '他', example: 'He is kind.', weekIntroduced: 1, tags: ['pronoun'] },
  { id: 'she', text: 'she', category: 'structure', chinese: '她', example: 'She is kind.', weekIntroduced: 1, tags: ['pronoun'] },
  { id: 'kind', text: 'kind', category: 'quality', chinese: '友好的', example: 'She is kind.', weekIntroduced: 1, tags: ['people'] },
  { id: 'study', text: 'study', category: 'operation', chinese: '学习', example: 'I study English.', weekIntroduced: 1, tags: ['study'] },
  { id: 'english', text: 'English', category: 'general_thing', chinese: '英语', example: 'I study English.', weekIntroduced: 1, tags: ['study'] },
  { id: 'because', text: 'because', category: 'structure', chinese: '因为', example: 'I study English because it is useful.', weekIntroduced: 1, tags: ['reason'] },
  { id: 'want', text: 'want', category: 'operation', chinese: '想要', example: 'I want to learn English.', weekIntroduced: 1, tags: ['desire'] },
  { id: 'learn', text: 'learn', category: 'operation', chinese: '学习', example: 'I want to learn English.', weekIntroduced: 1, tags: ['study'] },
];

const patterns: Pattern[] = [
  { id: 'my-name-is', title: 'My name is ___.', use: '说出自己的名字', structure: 'My name is {name}.', examples: ['My name is Li.', 'My name is Anna.'], slots: ['name'] },
  { id: 'i-am-from', title: 'I am from ___.', use: '说明自己来自哪里', structure: 'I am from {place}.', examples: ['I am from China.', 'I am from Shanghai.'], slots: ['place'] },
  { id: 'i-am', title: 'I am ___.', use: '描述身份或状态', structure: 'I am {description}.', examples: ['I am a student.', 'I am happy today.'], slots: ['description'] },
  { id: 'i-have', title: 'I have ___.', use: '表达自己有什么', structure: 'I have {thing}.', examples: ['I have a question.', 'I have a friend.'], slots: ['thing'] },
  { id: 'this-is', title: 'This is ___.', use: '介绍一个人或物', structure: 'This is {personOrThing}.', examples: ['This is my friend.', 'This is my book.'], slots: ['personOrThing'] },
  { id: 'he-she-is', title: 'He/She is ___.', use: '描述另一个人', structure: '{pronoun} is {description}.', examples: ['He is kind.', 'She is a student.'], slots: ['pronoun', 'description'] },
  { id: 'study-because', title: 'I study English because ___.', use: '说明学习英语的原因', structure: 'I study English because {reason}.', examples: ['I study English because it is useful.', 'I study English because I want to speak.'], slots: ['reason'] },
];

export const week1Course: Course = {
  id: 'basic-english-12-weeks',
  title: 'Basic English 12 Weeks',
  contentVersion: '1.0.0',
  schemaVersion: 1,
  words,
  patterns,
  weeks: [
    {
      id: 'week-01',
      number: 1,
      title: 'People, Identity, and Basic Sentences',
      goal: 'Introduce yourself and another person using simple Basic English.',
      days: [
        {
          id: 'day-001',
          weekId: 'week-01',
          dayNumber: 1,
          title: 'My Name',
          goal: 'Say your name and where you are from.',
          estimatedMinutes: 25,
          review: { wordCount: 0, patternCount: 0 },
          wordIds: ['name', 'my', 'i', 'am', 'from', 'china'],
          patternIds: ['my-name-is', 'i-am-from'],
          exercises: [
            { type: 'choice', id: 'day-001-choice-001', prompt: 'What does "name" mean?', options: ['名字', '问题', '朋友'], correctOption: '名字' },
            { type: 'fill_blank', id: 'day-001-fill-001', prompt: 'My ___ is Li.', acceptedAnswers: ['name'] },
            { type: 'sentence_order', id: 'day-001-order-001', tokens: ['from', 'China', 'am', 'I'], correctOrder: ['I', 'am', 'from', 'China'], finalSentence: 'I am from China.' },
            { type: 'replacement', id: 'day-001-replace-001', patternId: 'my-name-is', slotValues: { name: 'Anna' }, referenceAnswer: 'My name is Anna.' },
            { type: 'translation', id: 'day-001-translation-001', chinesePrompt: '我的名字是李。', coreMeaningHint: 'Say your name.', suggestedPatternIds: ['my-name-is'], referenceAnswers: ['My name is Li.'] },
          ],
          outputTask: {
            id: 'day-001-output',
            topic: 'My Name',
            prompts: ['What is your name?', 'Where are you from?'],
            template: ['My name is ___.', 'I am from ___.', 'I study English.'],
            requiredSentenceCount: 4,
          },
        },
        {
          id: 'day-002',
          weekId: 'week-01',
          dayNumber: 2,
          title: 'I Am',
          goal: 'Describe who you are and how you feel.',
          estimatedMinutes: 25,
          review: { wordCount: 3, patternCount: 1 },
          wordIds: ['student', 'happy', 'i', 'am', 'english', 'study'],
          patternIds: ['i-am'],
          exercises: [
            { type: 'choice', id: 'day-002-choice-001', prompt: 'Which sentence is correct?', options: ['I am a student.', 'I a student am.', 'Am I student a.'], correctOption: 'I am a student.' },
            { type: 'fill_blank', id: 'day-002-fill-001', prompt: 'I ___ happy today.', acceptedAnswers: ['am'] },
            { type: 'replacement', id: 'day-002-replace-001', patternId: 'i-am', slotValues: { description: 'a student' }, referenceAnswer: 'I am a student.' },
            { type: 'translation', id: 'day-002-translation-001', chinesePrompt: '我是学生。', coreMeaningHint: 'Say your identity.', suggestedPatternIds: ['i-am'], referenceAnswers: ['I am a student.'] },
            { type: 'sentence_order', id: 'day-002-order-001', tokens: ['happy', 'am', 'I', 'today'], correctOrder: ['I', 'am', 'happy', 'today'], finalSentence: 'I am happy today.' },
          ],
          outputTask: {
            id: 'day-002-output',
            topic: 'I Am',
            prompts: ['Who are you?', 'How do you feel today?'],
            template: ['I am ___.', 'I am from ___.', 'I am ___ today.'],
            requiredSentenceCount: 4,
          },
        },
        {
          id: 'day-003',
          weekId: 'week-01',
          dayNumber: 3,
          title: 'I Have',
          goal: 'Say what you have in your life or study.',
          estimatedMinutes: 25,
          review: { wordCount: 3, patternCount: 1 },
          wordIds: ['have', 'question', 'friend', 'english', 'study', 'my'],
          patternIds: ['i-have'],
          exercises: [
            { type: 'choice', id: 'day-003-choice-001', prompt: 'What does "question" mean?', options: ['问题', '名字', '中国'], correctOption: '问题' },
            { type: 'fill_blank', id: 'day-003-fill-001', prompt: 'I ___ a question.', acceptedAnswers: ['have'] },
            { type: 'replacement', id: 'day-003-replace-001', patternId: 'i-have', slotValues: { thing: 'a friend' }, referenceAnswer: 'I have a friend.' },
            { type: 'translation', id: 'day-003-translation-001', chinesePrompt: '我有一个问题。', coreMeaningHint: 'Say what you have.', suggestedPatternIds: ['i-have'], referenceAnswers: ['I have a question.'] },
            { type: 'sentence_order', id: 'day-003-order-001', tokens: ['a', 'have', 'friend', 'I'], correctOrder: ['I', 'have', 'a', 'friend'], finalSentence: 'I have a friend.' },
          ],
          outputTask: {
            id: 'day-003-output',
            topic: 'What I Have',
            prompts: ['What do you have?', 'Do you have a question?'],
            template: ['I have ___.', 'I have a question.', 'I study English.'],
            requiredSentenceCount: 4,
          },
        },
        {
          id: 'day-004',
          weekId: 'week-01',
          dayNumber: 4,
          title: 'This Is',
          goal: 'Introduce a person or thing.',
          estimatedMinutes: 25,
          review: { wordCount: 3, patternCount: 1 },
          wordIds: ['this', 'friend', 'my', 'name', 'happy', 'kind'],
          patternIds: ['this-is'],
          exercises: [
            { type: 'choice', id: 'day-004-choice-001', prompt: 'Which sentence introduces a friend?', options: ['This is my friend.', 'I have from China.', 'Name my is Li.'], correctOption: 'This is my friend.' },
            { type: 'fill_blank', id: 'day-004-fill-001', prompt: 'This ___ my friend.', acceptedAnswers: ['is'] },
            { type: 'replacement', id: 'day-004-replace-001', patternId: 'this-is', slotValues: { personOrThing: 'my friend' }, referenceAnswer: 'This is my friend.' },
            { type: 'translation', id: 'day-004-translation-001', chinesePrompt: '这是我的朋友。', coreMeaningHint: 'Introduce a friend.', suggestedPatternIds: ['this-is'], referenceAnswers: ['This is my friend.'] },
            { type: 'sentence_order', id: 'day-004-order-001', tokens: ['my', 'This', 'friend', 'is'], correctOrder: ['This', 'is', 'my', 'friend'], finalSentence: 'This is my friend.' },
          ],
          outputTask: {
            id: 'day-004-output',
            topic: 'My Friend',
            prompts: ['Who is this?', 'What is his or her name?'],
            template: ['This is my ___.', 'His/Her name is ___.', 'He/She is ___.'],
            requiredSentenceCount: 4,
          },
        },
        {
          id: 'day-005',
          weekId: 'week-01',
          dayNumber: 5,
          title: 'He and She',
          goal: 'Describe another person.',
          estimatedMinutes: 25,
          review: { wordCount: 3, patternCount: 1 },
          wordIds: ['he', 'she', 'kind', 'friend', 'student', 'happy'],
          patternIds: ['he-she-is'],
          exercises: [
            { type: 'choice', id: 'day-005-choice-001', prompt: 'Which means "她很友好"?', options: ['She is kind.', 'He is from China.', 'I have a question.'], correctOption: 'She is kind.' },
            { type: 'fill_blank', id: 'day-005-fill-001', prompt: 'She ___ kind.', acceptedAnswers: ['is'] },
            { type: 'replacement', id: 'day-005-replace-001', patternId: 'he-she-is', slotValues: { pronoun: 'He', description: 'a student' }, referenceAnswer: 'He is a student.' },
            { type: 'translation', id: 'day-005-translation-001', chinesePrompt: '他是学生。', coreMeaningHint: 'Describe another person.', suggestedPatternIds: ['he-she-is'], referenceAnswers: ['He is a student.'] },
            { type: 'sentence_order', id: 'day-005-order-001', tokens: ['kind', 'is', 'She'], correctOrder: ['She', 'is', 'kind'], finalSentence: 'She is kind.' },
          ],
          outputTask: {
            id: 'day-005-output',
            topic: 'Describe a Person',
            prompts: ['Who is this person?', 'What is this person like?'],
            template: ['This is my ___.', 'He/She is ___.', 'He/She is kind.'],
            requiredSentenceCount: 4,
          },
        },
        {
          id: 'day-006',
          weekId: 'week-01',
          dayNumber: 6,
          title: 'Why I Study English',
          goal: 'Give a simple reason for studying English.',
          estimatedMinutes: 30,
          review: { wordCount: 4, patternCount: 1 },
          wordIds: ['study', 'english', 'because', 'want', 'learn', 'question'],
          patternIds: ['study-because'],
          exercises: [
            { type: 'choice', id: 'day-006-choice-001', prompt: 'What does "because" show?', options: ['原因', '名字', '朋友'], correctOption: '原因' },
            { type: 'fill_blank', id: 'day-006-fill-001', prompt: 'I study English ___ it is useful.', acceptedAnswers: ['because'] },
            { type: 'replacement', id: 'day-006-replace-001', patternId: 'study-because', slotValues: { reason: 'I want to learn' }, referenceAnswer: 'I study English because I want to learn.' },
            { type: 'translation', id: 'day-006-translation-001', chinesePrompt: '我学习英语，因为我想学习。', coreMeaningHint: 'Give a reason.', suggestedPatternIds: ['study-because'], referenceAnswers: ['I study English because I want to learn.'] },
            { type: 'sentence_order', id: 'day-006-order-001', tokens: ['English', 'study', 'I', 'because', 'learn', 'want', 'to', 'I'], correctOrder: ['I', 'study', 'English', 'because', 'I', 'want', 'to', 'learn'], finalSentence: 'I study English because I want to learn.' },
          ],
          outputTask: {
            id: 'day-006-output',
            topic: 'Why I Study English',
            prompts: ['Why do you study English?', 'What do you want?'],
            template: ['I study English because ___.', 'I want to ___.', 'English is important for me.'],
            requiredSentenceCount: 5,
          },
        },
        {
          id: 'day-007',
          weekId: 'week-01',
          dayNumber: 7,
          title: 'Weekly Check',
          goal: 'Introduce yourself without fully copying the template.',
          estimatedMinutes: 35,
          review: { wordCount: 8, patternCount: 3 },
          wordIds: ['name', 'my', 'i', 'am', 'from', 'student', 'have', 'friend', 'study', 'english', 'because', 'want', 'learn'],
          patternIds: ['my-name-is', 'i-am-from', 'i-am', 'i-have', 'study-because'],
          exercises: [
            { type: 'choice', id: 'day-007-choice-001', prompt: 'Choose the best self-introduction sentence.', options: ['My name is Li.', 'Friend my is Li.', 'Because name my.'], correctOption: 'My name is Li.' },
            { type: 'fill_blank', id: 'day-007-fill-001', prompt: 'I study English ___ I want to learn.', acceptedAnswers: ['because'] },
            { type: 'sentence_order', id: 'day-007-order-001', tokens: ['have', 'I', 'a', 'question'], correctOrder: ['I', 'have', 'a', 'question'], finalSentence: 'I have a question.' },
            { type: 'translation', id: 'day-007-translation-001', chinesePrompt: '我来自中国。我学习英语，因为我想学习。', coreMeaningHint: 'Introduce place and reason.', suggestedPatternIds: ['i-am-from', 'study-because'], referenceAnswers: ['I am from China. I study English because I want to learn.'] },
            { type: 'replacement', id: 'day-007-replace-001', patternId: 'i-am', slotValues: { description: 'happy today' }, referenceAnswer: 'I am happy today.' },
          ],
          outputTask: {
            id: 'day-007-output',
            topic: 'Week 1 Self Introduction',
            prompts: ['What is your name?', 'Where are you from?', 'Who are you?', 'Why do you study English?'],
            template: ['My name is ___.', 'I am from ___.', 'I am ___.', 'I have ___.', 'I study English because ___.'],
            requiredSentenceCount: 6,
          },
        },
      ],
    },
  ],
};
```

- [ ] **Step 4: Add content validator**

`src/content/validateContent.ts`:

```ts
import type { Course } from '../domain/types';

export interface ValidationResult {
  errors: string[];
}

const mojibakePattern = /æ|ç|è|å|涓|鐨|�/;

export function validateCourseContent(course: Course): ValidationResult {
  const errors: string[] = [];
  const wordIds = new Set(course.words.map((word) => word.id));
  const patternIds = new Set(course.patterns.map((pattern) => pattern.id));
  const allIds = new Set<string>();

  const registerId = (id: string, label: string) => {
    if (allIds.has(id)) {
      errors.push(`Duplicate id: ${id}`);
    }
    if (!id.trim()) {
      errors.push(`Empty id for ${label}`);
    }
    allIds.add(id);
  };

  registerId(course.id, 'course');
  course.words.forEach((word) => {
    registerId(word.id, 'word');
    if (!word.text || !word.chinese || !word.example) {
      errors.push(`Word ${word.id} is missing text, chinese, or example`);
    }
  });
  course.patterns.forEach((pattern) => {
    registerId(pattern.id, 'pattern');
    if (!pattern.title || !pattern.use || pattern.examples.length === 0) {
      errors.push(`Pattern ${pattern.id} is incomplete`);
    }
  });

  course.weeks.forEach((week) => {
    registerId(week.id, 'week');
    week.days.forEach((day) => {
      registerId(day.id, 'day');
      if (day.wordIds.length < 6 || day.wordIds.length > 13) {
        errors.push(`${day.id} must have 6-13 words`);
      }
      if (day.patternIds.length < 1 || day.patternIds.length > 5) {
        errors.push(`${day.id} must have 1-5 patterns`);
      }
      if (day.exercises.length < 5) {
        errors.push(`${day.id} must have at least 5 exercises`);
      }
      if (!day.exercises.some((exercise) => exercise.type === 'translation')) {
        errors.push(`${day.id} must have a translation exercise`);
      }
      day.wordIds.forEach((wordId) => {
        if (!wordIds.has(wordId)) {
          errors.push(`${day.id} references missing word ${wordId}`);
        }
      });
      day.patternIds.forEach((patternId) => {
        if (!patternIds.has(patternId)) {
          errors.push(`${day.id} references missing pattern ${patternId}`);
        }
      });
      day.exercises.forEach((exercise) => {
        registerId(exercise.id, 'exercise');
        if (exercise.type === 'replacement' && !patternIds.has(exercise.patternId)) {
          errors.push(`${exercise.id} references missing pattern ${exercise.patternId}`);
        }
        if (exercise.type === 'translation') {
          exercise.suggestedPatternIds.forEach((patternId) => {
            if (!patternIds.has(patternId)) {
              errors.push(`${exercise.id} references missing pattern ${patternId}`);
            }
          });
        }
      });
      if (day.outputTask.requiredSentenceCount < 4) {
        errors.push(`${day.id} output requires too few sentences`);
      }
    });
  });

  if (mojibakePattern.test(JSON.stringify(course))) {
    errors.push('Content contains invalid Chinese text or mojibake');
  }

  return { errors };
}
```

- [ ] **Step 5: Run content tests**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: all tests pass.

---

### Task 3: Add Pure Progress and Review Domain Logic

**Files:**
- Create: `src/domain/progress.ts`
- Create: `src/domain/progress.test.ts`
- Create: `src/domain/review.ts`
- Create: `src/domain/review.test.ts`

- [ ] **Step 1: Write progress tests**

`src/domain/progress.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { completeStep, getNextUnlockedDayId, startDay } from './progress';

describe('progress domain', () => {
  it('starts a day at review step', () => {
    const progress = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');
    expect(progress.status).toBe('in_progress');
    expect(progress.currentStep).toBe('review');
  });

  it('moves to the next step after completion', () => {
    const started = startDay('day-001', '1.0.0', '2026-05-25T12:00:00.000Z');
    const updated = completeStep(started, 'review', '2026-05-25T12:05:00.000Z');
    expect(updated.currentStep).toBe('words');
  });

  it('unlocks the next day after completion', () => {
    const next = getNextUnlockedDayId(['day-001'], ['day-001', 'day-002', 'day-003']);
    expect(next).toBe('day-002');
  });
});
```

- [ ] **Step 2: Implement progress logic**

`src/domain/progress.ts`:

```ts
export type StepId = 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'output' | 'done';

export interface DayProgress {
  id: string;
  dayId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  currentStep: StepId;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  contentVersion: string;
}

export const stepOrder: StepId[] = ['review', 'words', 'patterns', 'drills', 'translate', 'output', 'done'];

export function startDay(dayId: string, contentVersion: string, now: string): DayProgress {
  return {
    id: dayId,
    dayId,
    status: 'in_progress',
    currentStep: 'review',
    startedAt: now,
    updatedAt: now,
    contentVersion,
  };
}

export function completeStep(progress: DayProgress, step: StepId, now: string): DayProgress {
  const currentIndex = stepOrder.indexOf(step);
  const nextStep = stepOrder[currentIndex + 1] ?? 'done';
  return {
    ...progress,
    currentStep: nextStep,
    status: nextStep === 'done' ? 'completed' : 'in_progress',
    completedAt: nextStep === 'done' ? now : progress.completedAt,
    updatedAt: now,
  };
}

export function getNextUnlockedDayId(completedDayIds: string[], orderedDayIds: string[]): string {
  const completed = new Set(completedDayIds);
  return orderedDayIds.find((dayId) => !completed.has(dayId)) ?? orderedDayIds[orderedDayIds.length - 1];
}
```

- [ ] **Step 3: Write review tests**

`src/domain/review.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { selectReviewWordIds } from './review';

describe('review domain', () => {
  it('selects review words before known words', () => {
    const result = selectReviewWordIds(
      [
        { wordId: 'name', status: 'known', lastSeenAt: '2026-05-24T00:00:00.000Z' },
        { wordId: 'friend', status: 'review', lastSeenAt: '2026-05-24T00:00:00.000Z' },
        { wordId: 'student', status: 'seen', lastSeenAt: '2026-05-24T00:00:00.000Z' },
      ],
      2,
    );
    expect(result).toEqual(['friend', 'student']);
  });
});
```

- [ ] **Step 4: Implement review selection**

`src/domain/review.ts`:

```ts
export interface ReviewWordState {
  wordId: string;
  status: 'new' | 'seen' | 'review' | 'known' | 'mastered';
  lastSeenAt?: string;
}

const rank: Record<ReviewWordState['status'], number> = {
  review: 0,
  seen: 1,
  known: 2,
  new: 3,
  mastered: 4,
};

export function selectReviewWordIds(words: ReviewWordState[], count: number): string[] {
  return [...words]
    .sort((a, b) => {
      const byStatus = rank[a.status] - rank[b.status];
      if (byStatus !== 0) return byStatus;
      return (a.lastSeenAt ?? '').localeCompare(b.lastSeenAt ?? '');
    })
    .slice(0, count)
    .map((word) => word.wordId);
}
```

- [ ] **Step 5: Run domain tests**

Run:

```powershell
npm test -- src/domain
```

Expected: all tests pass.

---

### Task 4: Implement IndexedDB Progress Repository

**Files:**
- Create: `src/storage/progressRepository.ts`
- Create: `src/storage/indexedDbProgressRepository.ts`
- Create: `src/storage/indexedDbProgressRepository.test.ts`

- [ ] **Step 1: Write repository tests**

`src/storage/indexedDbProgressRepository.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { createIndexedDbProgressRepository } from './indexedDbProgressRepository';

describe('indexedDbProgressRepository', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('basic-english-test');
  });

  it('saves and loads day progress', async () => {
    const repo = createIndexedDbProgressRepository('basic-english-test');
    await repo.saveDayProgress({
      id: 'day-001',
      dayId: 'day-001',
      status: 'in_progress',
      currentStep: 'words',
      startedAt: '2026-05-25T12:00:00.000Z',
      updatedAt: '2026-05-25T12:05:00.000Z',
      contentVersion: '1.0.0',
    });

    const loaded = await repo.getDayProgress('day-001');
    expect(loaded?.currentStep).toBe('words');
  });

  it('saves user output without losing text', async () => {
    const repo = createIndexedDbProgressRepository('basic-english-test');
    await repo.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: 'My name is Li.',
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      updatedAt: '2026-05-25T12:00:00.000Z',
    });

    const output = await repo.getUserOutput('day-001');
    expect(output?.text).toBe('My name is Li.');
  });
});
```

- [ ] **Step 2: Define repository interface**

`src/storage/progressRepository.ts`:

```ts
import type { DayProgress } from '../domain/progress';

export interface StepProgress {
  id: string;
  dayId: string;
  stepId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: string;
}

export interface ExerciseAttempt {
  id: string;
  exerciseId: string;
  dayId: string;
  answer: unknown;
  result: 'correct' | 'incorrect' | 'self_mark_close' | 'self_mark_review';
  createdAt: string;
}

export interface UserOutput {
  id: string;
  dayId: string;
  text: string;
  selfRating: 'easy' | 'ok' | 'hard';
  checklist: {
    usedTargetPattern: boolean;
    usedLessonWords: boolean;
    hasSubjects: boolean;
    meaningIsClear: boolean;
  };
  updatedAt: string;
}

export interface WordProgress {
  id: string;
  wordId: string;
  status: 'new' | 'seen' | 'review' | 'known' | 'mastered';
  seenCount: number;
  correctCount: number;
  lastSeenAt?: string;
  updatedAt: string;
}

export interface ProgressRepository {
  getDayProgress(dayId: string): Promise<DayProgress | null>;
  listDayProgress(): Promise<DayProgress[]>;
  saveDayProgress(progress: DayProgress): Promise<void>;
  saveStepProgress(progress: StepProgress): Promise<void>;
  saveExerciseAttempt(attempt: ExerciseAttempt): Promise<void>;
  saveUserOutput(output: UserOutput): Promise<void>;
  getUserOutput(dayId: string): Promise<UserOutput | null>;
  saveWordProgress(progress: WordProgress): Promise<void>;
  listReviewWords(): Promise<WordProgress[]>;
}
```

- [ ] **Step 3: Implement IndexedDB adapter**

`src/storage/indexedDbProgressRepository.ts`:

```ts
import { openDB, type IDBPDatabase } from 'idb';
import type { DayProgress } from '../domain/progress';
import type { ExerciseAttempt, ProgressRepository, StepProgress, UserOutput, WordProgress } from './progressRepository';

interface ProgressDb {
  dayProgress: DayProgress;
  stepProgress: StepProgress;
  exerciseAttempts: ExerciseAttempt;
  userOutputs: UserOutput;
  wordProgress: WordProgress;
}

async function openProgressDb(name: string): Promise<IDBPDatabase<ProgressDb>> {
  return openDB<ProgressDb>(name, 1, {
    upgrade(db) {
      db.createObjectStore('dayProgress', { keyPath: 'id' });
      db.createObjectStore('stepProgress', { keyPath: 'id' });
      db.createObjectStore('exerciseAttempts', { keyPath: 'id' });
      db.createObjectStore('userOutputs', { keyPath: 'id' });
      db.createObjectStore('wordProgress', { keyPath: 'id' });
    },
  });
}

export function createIndexedDbProgressRepository(dbName = 'basic-english-progress'): ProgressRepository {
  const dbPromise = openProgressDb(dbName);

  return {
    async getDayProgress(dayId) {
      const db = await dbPromise;
      return (await db.get('dayProgress', dayId)) ?? null;
    },
    async listDayProgress() {
      const db = await dbPromise;
      return db.getAll('dayProgress');
    },
    async saveDayProgress(progress) {
      const db = await dbPromise;
      await db.put('dayProgress', progress);
    },
    async saveStepProgress(progress) {
      const db = await dbPromise;
      await db.put('stepProgress', progress);
    },
    async saveExerciseAttempt(attempt) {
      const db = await dbPromise;
      await db.put('exerciseAttempts', attempt);
    },
    async saveUserOutput(output) {
      const db = await dbPromise;
      await db.put('userOutputs', output);
    },
    async getUserOutput(dayId) {
      const db = await dbPromise;
      return (await db.get('userOutputs', `output-${dayId}`)) ?? null;
    },
    async saveWordProgress(progress) {
      const db = await dbPromise;
      await db.put('wordProgress', progress);
    },
    async listReviewWords() {
      const db = await dbPromise;
      const all = await db.getAll('wordProgress');
      return all.filter((word) => word.status === 'review' || word.status === 'seen');
    },
  };
}
```

- [ ] **Step 4: Run repository tests**

Run:

```powershell
npm test -- src/storage/indexedDbProgressRepository.test.ts
```

Expected: all tests pass.

---

### Task 5: Build App Shell and Mobile Navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/components/Layout.tsx`
- Create: `src/components/CoursePage.tsx`
- Create: `src/components/ReviewPage.tsx`
- Create: `src/components/WordsPage.tsx`
- Create: `src/components/MePage.tsx`

- [ ] **Step 1: Create page shell components**

`src/components/Layout.tsx`:

```tsx
export type TabId = 'today' | 'course' | 'review' | 'words' | 'me';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'course', label: 'Course' },
  { id: 'review', label: 'Review' },
  { id: 'words', label: 'Words' },
  { id: 'me', label: 'Me' },
];

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: React.ReactNode;
}

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <p className="eyebrow">Basic English 12 Weeks</p>
          <h1>Week 1 MVP</h1>
        </div>
      </header>
      <main className="page-content">{children}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'nav-item active' : 'nav-item'}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
```

Create minimal secondary pages:

```tsx
// src/components/CoursePage.tsx
import type { Course } from '../domain/types';

export function CoursePage({ course }: { course: Course }) {
  const week = course.weeks[0];
  return (
    <section className="panel">
      <h2>{week.title}</h2>
      <p>{week.goal}</p>
      <div className="day-list">
        {week.days.map((day) => (
          <article className="day-row" key={day.id}>
            <strong>Day {day.dayNumber}: {day.title}</strong>
            <span>{day.goal}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/components/ReviewPage.tsx
export function ReviewPage() {
  return (
    <section className="panel">
      <h2>Review</h2>
      <p>Review words and missed items from your daily tasks.</p>
    </section>
  );
}
```

```tsx
// src/components/WordsPage.tsx
import type { Course } from '../domain/types';

export function WordsPage({ course }: { course: Course }) {
  return (
    <section className="panel">
      <h2>Week 1 Words</h2>
      <div className="word-bank">
        {course.words.map((word) => (
          <article className="word-bank-item" key={word.id}>
            <strong>{word.text}</strong>
            <span>{word.chinese}</span>
            <small>{word.example}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```tsx
// src/components/MePage.tsx
export function MePage() {
  return (
    <section className="panel">
      <h2>My Progress</h2>
      <p>Complete Week 1 to see your self-introduction and weekly check.</p>
    </section>
  );
}
```

- [ ] **Step 2: Wire tabs in `App.tsx`**

Replace `src/App.tsx`:

```tsx
import { useState } from 'react';
import { week1Course } from './content/week1';
import { CoursePage } from './components/CoursePage';
import { Layout, type TabId } from './components/Layout';
import { MePage } from './components/MePage';
import { ReviewPage } from './components/ReviewPage';
import { TodayPage } from './components/TodayPage';
import { WordsPage } from './components/WordsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayPage course={week1Course} />}
      {activeTab === 'course' && <CoursePage course={week1Course} />}
      {activeTab === 'review' && <ReviewPage />}
      {activeTab === 'words' && <WordsPage course={week1Course} />}
      {activeTab === 'me' && <MePage />}
    </Layout>
  );
}
```

- [ ] **Step 3: Add mobile-first styles**

Append to `src/styles.css`:

```css
.layout {
  min-height: 100vh;
  padding: 16px 16px 88px;
}

.topbar {
  max-width: 960px;
  margin: 0 auto 16px;
}

.topbar h1 {
  margin: 0;
  font-size: 1.4rem;
}

.page-content {
  max-width: 960px;
  margin: 0 auto;
}

.panel {
  background: #fffdf8;
  border: 1px solid #ded8ca;
  border-radius: 8px;
  padding: 16px;
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  padding: 8px;
  background: #fffdf8;
  border-top: 1px solid #ded8ca;
}

.nav-item {
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  color: #33443a;
  background: transparent;
  font-weight: 700;
}

.nav-item.active {
  color: white;
  background: #265c46;
}

.day-list,
.word-bank {
  display: grid;
  gap: 10px;
}

.day-row,
.word-bank-item {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #e5dfd1;
  border-radius: 8px;
  background: white;
}

@media (min-width: 760px) {
  .layout {
    padding: 24px 24px 96px;
  }

  .topbar h1 {
    font-size: 2rem;
  }
}
```

- [ ] **Step 4: Run build**

Run:

```powershell
npm run build
```

Expected: build exits with code 0.

---

### Task 6: Implement Today Flow Components

**Files:**
- Create: `src/components/TodayPage.tsx`
- Create: `src/components/Stepper.tsx`
- Create: `src/components/WordCards.tsx`
- Create: `src/components/PatternCards.tsx`

- [ ] **Step 1: Create stepper and learning cards**

`src/components/Stepper.tsx`:

```tsx
import type { StepId } from '../domain/progress';

const steps: Array<{ id: StepId; label: string }> = [
  { id: 'review', label: 'Review' },
  { id: 'words', label: 'Words' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'drills', label: 'Drills' },
  { id: 'translate', label: 'Translate' },
  { id: 'output', label: 'Output' },
];

export function Stepper({ currentStep }: { currentStep: StepId }) {
  return (
    <ol className="stepper">
      {steps.map((step) => (
        <li className={step.id === currentStep ? 'step current' : 'step'} key={step.id}>
          {step.label}
        </li>
      ))}
    </ol>
  );
}
```

`src/components/WordCards.tsx`:

```tsx
import type { Word } from '../domain/types';

export function WordCards({ words, onReview, onKnow }: { words: Word[]; onReview: (wordId: string) => void; onKnow: (wordId: string) => void }) {
  return (
    <div className="card-grid">
      {words.map((word) => (
        <article className="learning-card" key={word.id}>
          <h3>{word.text}</h3>
          <p>{word.chinese}</p>
          <p className="example">{word.example}</p>
          <div className="button-row">
            <button type="button" onClick={() => onReview(word.id)}>Review</button>
            <button type="button" onClick={() => onKnow(word.id)}>Know</button>
          </div>
        </article>
      ))}
    </div>
  );
}
```

`src/components/PatternCards.tsx`:

```tsx
import type { Pattern } from '../domain/types';

export function PatternCards({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="card-grid">
      {patterns.map((pattern) => (
        <article className="learning-card" key={pattern.id}>
          <h3>{pattern.title}</h3>
          <p>{pattern.use}</p>
          <ul>
            {pattern.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create Today page with local step state**

`src/components/TodayPage.tsx`:

```tsx
import { useMemo, useState } from 'react';
import type { Course } from '../domain/types';
import { type StepId, stepOrder } from '../domain/progress';
import { PatternCards } from './PatternCards';
import { Stepper } from './Stepper';
import { WordCards } from './WordCards';

export function TodayPage({ course }: { course: Course }) {
  const [currentStep, setCurrentStep] = useState<StepId>('review');
  const day = course.weeks[0].days[0];
  const words = useMemo(() => course.words.filter((word) => day.wordIds.includes(word.id)), [course.words, day.wordIds]);
  const patterns = useMemo(() => course.patterns.filter((pattern) => day.patternIds.includes(pattern.id)), [course.patterns, day.patternIds]);

  const moveNext = () => {
    const index = stepOrder.indexOf(currentStep);
    setCurrentStep(stepOrder[index + 1] ?? 'done');
  };

  return (
    <section className="today">
      <div className="today-header panel">
        <p className="eyebrow">Week 1 / Day {day.dayNumber}</p>
        <h2>{day.title}</h2>
        <p>{day.goal}</p>
        <p className="time-label">{day.estimatedMinutes} minutes</p>
        <Stepper currentStep={currentStep} />
      </div>

      <div className="panel">
        {currentStep === 'review' && (
          <section>
            <h3>Quick Review</h3>
            <p>Day 1 has no review. Start with today&apos;s words.</p>
          </section>
        )}
        {currentStep === 'words' && <WordCards words={words} onReview={() => undefined} onKnow={() => undefined} />}
        {currentStep === 'patterns' && <PatternCards patterns={patterns} />}
        {currentStep === 'drills' && <p>Drills come next.</p>}
        {currentStep === 'translate' && <p>Translation practice comes next.</p>}
        {currentStep === 'output' && <p>Personal output comes next.</p>}
        {currentStep === 'done' && <p>Day complete.</p>}
      </div>

      {currentStep !== 'done' && (
        <button type="button" className="sticky-next primary-button" onClick={moveNext}>
          Continue
        </button>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Add Today styles**

Append to `src/styles.css`:

```css
.today {
  display: grid;
  gap: 14px;
}

.today-header h2 {
  margin: 4px 0;
  font-size: 1.8rem;
}

.time-label {
  color: #59675f;
  font-weight: 700;
}

.stepper {
  display: flex;
  gap: 6px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
}

.step {
  flex: 0 0 auto;
  padding: 8px 10px;
  border-radius: 999px;
  color: #496454;
  background: #e8e2d4;
  font-size: 0.85rem;
  font-weight: 700;
}

.step.current {
  color: white;
  background: #265c46;
}

.card-grid {
  display: grid;
  gap: 12px;
}

.learning-card {
  padding: 14px;
  border: 1px solid #e5dfd1;
  border-radius: 8px;
  background: white;
}

.learning-card h3 {
  margin: 0 0 6px;
  font-size: 1.35rem;
}

.example {
  color: #59675f;
}

.button-row {
  display: flex;
  gap: 8px;
}

.button-row button {
  min-height: 42px;
  border: 1px solid #cfc7b8;
  border-radius: 8px;
  background: #fffdf8;
}

.sticky-next {
  position: fixed;
  right: 16px;
  bottom: 78px;
  left: 16px;
}

@media (min-width: 760px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sticky-next {
    right: 24px;
    left: auto;
    min-width: 220px;
  }
}
```

- [ ] **Step 4: Run build**

Run:

```powershell
npm run build
```

Expected: build exits with code 0.

---

### Task 7: Implement Exercise, Translation, Output, and Completion Components

**Files:**
- Create: `src/components/ExerciseRenderer.tsx`
- Create: `src/components/TranslationTask.tsx`
- Create: `src/components/OutputTaskEditor.tsx`
- Create: `src/components/CompletionSummary.tsx`
- Modify: `src/components/TodayPage.tsx`

- [ ] **Step 1: Create exercise renderer**

`src/components/ExerciseRenderer.tsx`:

```tsx
import { useState } from 'react';
import type { Exercise } from '../domain/types';

export function ExerciseRenderer({ exercises }: { exercises: Exercise[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const drills = exercises.filter((exercise) => exercise.type !== 'translation');

  return (
    <div className="exercise-list">
      {drills.map((exercise) => (
        <article className="exercise-card" key={exercise.id}>
          {exercise.type === 'choice' && (
            <>
              <h3>{exercise.prompt}</h3>
              <div className="option-list">
                {exercise.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={answers[exercise.id] === option ? 'selected-option' : ''}
                    onClick={() => setAnswers((current) => ({ ...current, [exercise.id]: option }))}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {answers[exercise.id] && <p>{answers[exercise.id] === exercise.correctOption ? 'Correct' : 'Try again'}</p>}
            </>
          )}
          {exercise.type === 'fill_blank' && (
            <>
              <h3>{exercise.prompt}</h3>
              <input value={answers[exercise.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [exercise.id]: event.target.value }))} />
              {answers[exercise.id] && <p>{exercise.acceptedAnswers.includes(answers[exercise.id].trim()) ? 'Correct' : 'Check the pattern and try again'}</p>}
            </>
          )}
          {exercise.type === 'sentence_order' && (
            <>
              <h3>Put the words in order</h3>
              <p>{exercise.tokens.join(' / ')}</p>
              <p className="example">Answer: {exercise.finalSentence}</p>
            </>
          )}
          {exercise.type === 'replacement' && (
            <>
              <h3>Make a sentence</h3>
              <p>{Object.values(exercise.slotValues).join(', ')}</p>
              <p className="example">Reference: {exercise.referenceAnswer}</p>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create translation and output components**

`src/components/TranslationTask.tsx`:

```tsx
import { useState } from 'react';
import type { TranslationExercise } from '../domain/types';

export function TranslationTask({ exercises }: { exercises: TranslationExercise[] }) {
  const [shown, setShown] = useState<Record<string, boolean>>({});

  return (
    <div className="exercise-list">
      {exercises.map((exercise) => (
        <article className="exercise-card" key={exercise.id}>
          <h3>{exercise.chinesePrompt}</h3>
          <p>Core meaning: {exercise.coreMeaningHint}</p>
          <button type="button" onClick={() => setShown((current) => ({ ...current, [exercise.id]: true }))}>
            Show reference
          </button>
          {shown[exercise.id] && (
            <ul>
              {exercise.referenceAnswers.map((answer) => (
                <li key={answer}>{answer}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
```

`src/components/OutputTaskEditor.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { OutputTask } from '../domain/types';

export function OutputTaskEditor({ task, onTextChange }: { task: OutputTask; onTextChange: (text: string) => void }) {
  const [text, setText] = useState('');

  useEffect(() => {
    onTextChange(text);
  }, [onTextChange, text]);

  return (
    <section className="output-editor">
      <h3>{task.topic}</h3>
      <div className="prompt-list">
        {task.prompts.map((prompt) => (
          <p key={prompt}>{prompt}</p>
        ))}
      </div>
      <div className="template-list">
        {task.template.map((line) => (
          <code key={line}>{line}</code>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        aria-label="Daily output"
        placeholder="Write your sentences here."
      />
      <div className="checklist">
        <label><input type="checkbox" /> I used today's pattern.</label>
        <label><input type="checkbox" /> I used lesson words.</label>
        <label><input type="checkbox" /> Each sentence has a subject.</label>
        <label><input type="checkbox" /> My meaning is clear.</label>
      </div>
    </section>
  );
}
```

`src/components/CompletionSummary.tsx`:

```tsx
import type { Day } from '../domain/types';

export function CompletionSummary({ day, outputText }: { day: Day; outputText: string }) {
  return (
    <section className="completion-summary">
      <h3>Day complete</h3>
      <p>You can now say: {day.goal}</p>
      <h4>Your output</h4>
      <p className="saved-output">{outputText || 'No saved output text.'}</p>
      <p>Come back for the next day.</p>
    </section>
  );
}
```

- [ ] **Step 3: Wire components into Today**

Update the imports and body in `src/components/TodayPage.tsx` so `drills`, `translate`, `output`, and `done` render these components:

```tsx
import { useMemo, useState } from 'react';
import type { Course, TranslationExercise } from '../domain/types';
import { type StepId, stepOrder } from '../domain/progress';
import { CompletionSummary } from './CompletionSummary';
import { ExerciseRenderer } from './ExerciseRenderer';
import { OutputTaskEditor } from './OutputTaskEditor';
import { PatternCards } from './PatternCards';
import { Stepper } from './Stepper';
import { TranslationTask } from './TranslationTask';
import { WordCards } from './WordCards';

export function TodayPage({ course }: { course: Course }) {
  const [currentStep, setCurrentStep] = useState<StepId>('review');
  const [outputText, setOutputText] = useState('');
  const day = course.weeks[0].days[0];
  const words = useMemo(() => course.words.filter((word) => day.wordIds.includes(word.id)), [course.words, day.wordIds]);
  const patterns = useMemo(() => course.patterns.filter((pattern) => day.patternIds.includes(pattern.id)), [course.patterns, day.patternIds]);
  const translationExercises = day.exercises.filter((exercise): exercise is TranslationExercise => exercise.type === 'translation');

  const moveNext = () => {
    const index = stepOrder.indexOf(currentStep);
    setCurrentStep(stepOrder[index + 1] ?? 'done');
  };

  return (
    <section className="today">
      <div className="today-header panel">
        <p className="eyebrow">Week 1 / Day {day.dayNumber}</p>
        <h2>{day.title}</h2>
        <p>{day.goal}</p>
        <p className="time-label">{day.estimatedMinutes} minutes</p>
        <Stepper currentStep={currentStep} />
      </div>

      <div className="panel">
        {currentStep === 'review' && (
          <section>
            <h3>Quick Review</h3>
            <p>Day 1 has no review. Start with today&apos;s words.</p>
          </section>
        )}
        {currentStep === 'words' && <WordCards words={words} onReview={() => undefined} onKnow={() => undefined} />}
        {currentStep === 'patterns' && <PatternCards patterns={patterns} />}
        {currentStep === 'drills' && <ExerciseRenderer exercises={day.exercises} />}
        {currentStep === 'translate' && <TranslationTask exercises={translationExercises} />}
        {currentStep === 'output' && <OutputTaskEditor task={day.outputTask} onTextChange={setOutputText} />}
        {currentStep === 'done' && <CompletionSummary day={day} outputText={outputText} />}
      </div>

      {currentStep !== 'done' && (
        <button type="button" className="sticky-next primary-button" onClick={moveNext}>
          Continue
        </button>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Add exercise styles**

Append to `src/styles.css`:

```css
.exercise-list,
.prompt-list,
.template-list,
.checklist {
  display: grid;
  gap: 10px;
}

.exercise-card {
  padding: 14px;
  border: 1px solid #e5dfd1;
  border-radius: 8px;
  background: white;
}

.option-list {
  display: grid;
  gap: 8px;
}

.option-list button,
.exercise-card button {
  min-height: 44px;
  border: 1px solid #cfc7b8;
  border-radius: 8px;
  background: #fffdf8;
}

.selected-option {
  border-color: #265c46 !important;
  box-shadow: 0 0 0 2px rgba(38, 92, 70, 0.2);
}

.output-editor textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cfc7b8;
  border-radius: 8px;
  padding: 12px;
  resize: vertical;
}

.template-list code {
  display: block;
  padding: 8px;
  border-radius: 6px;
  background: #eee8da;
}

.checklist label {
  display: flex;
  gap: 8px;
  align-items: center;
}

.saved-output {
  white-space: pre-wrap;
}
```

- [ ] **Step 5: Run build**

Run:

```powershell
npm run build
```

Expected: build exits with code 0.

---

### Task 8: Connect Today Flow to IndexedDB Progress

**Files:**
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/MePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Pass repository into Today and Me**

Modify `src/App.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { week1Course } from './content/week1';
import { CoursePage } from './components/CoursePage';
import { Layout, type TabId } from './components/Layout';
import { MePage } from './components/MePage';
import { ReviewPage } from './components/ReviewPage';
import { TodayPage } from './components/TodayPage';
import { WordsPage } from './components/WordsPage';
import { createIndexedDbProgressRepository } from './storage/indexedDbProgressRepository';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const repository = useMemo(() => createIndexedDbProgressRepository(), []);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayPage course={week1Course} repository={repository} />}
      {activeTab === 'course' && <CoursePage course={week1Course} />}
      {activeTab === 'review' && <ReviewPage />}
      {activeTab === 'words' && <WordsPage course={week1Course} />}
      {activeTab === 'me' && <MePage repository={repository} />}
    </Layout>
  );
}
```

- [ ] **Step 2: Persist Today step and output**

Update `TodayPage` props and persistence calls:

```tsx
import { useEffect, useMemo, useState } from 'react';
import type { Course, TranslationExercise } from '../domain/types';
import { completeStep, type DayProgress, type StepId, startDay, stepOrder } from '../domain/progress';
import type { ProgressRepository } from '../storage/progressRepository';
import { CompletionSummary } from './CompletionSummary';
import { ExerciseRenderer } from './ExerciseRenderer';
import { OutputTaskEditor } from './OutputTaskEditor';
import { PatternCards } from './PatternCards';
import { Stepper } from './Stepper';
import { TranslationTask } from './TranslationTask';
import { WordCards } from './WordCards';

export function TodayPage({ course, repository }: { course: Course; repository: ProgressRepository }) {
  const day = course.weeks[0].days[0];
  const [dayProgress, setDayProgress] = useState<DayProgress>(() => startDay(day.id, course.contentVersion, new Date().toISOString()));
  const [outputText, setOutputText] = useState('');
  const words = useMemo(() => course.words.filter((word) => day.wordIds.includes(word.id)), [course.words, day.wordIds]);
  const patterns = useMemo(() => course.patterns.filter((pattern) => day.patternIds.includes(pattern.id)), [course.patterns, day.patternIds]);
  const translationExercises = day.exercises.filter((exercise): exercise is TranslationExercise => exercise.type === 'translation');

  useEffect(() => {
    repository.getDayProgress(day.id).then((saved) => {
      if (saved) setDayProgress(saved);
    });
    repository.getUserOutput(day.id).then((saved) => {
      if (saved) setOutputText(saved.text);
    });
  }, [day.id, repository]);

  const moveNext = async () => {
    const updated = completeStep(dayProgress, dayProgress.currentStep, new Date().toISOString());
    setDayProgress(updated);
    await repository.saveDayProgress(updated);
    if (updated.currentStep === 'done') {
      await repository.saveUserOutput({
        id: `output-${day.id}`,
        dayId: day.id,
        text: outputText,
        selfRating: 'ok',
        checklist: {
          usedTargetPattern: true,
          usedLessonWords: true,
          hasSubjects: true,
          meaningIsClear: true,
        },
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleOutputText = async (text: string) => {
    setOutputText(text);
    await repository.saveUserOutput({
      id: `output-${day.id}`,
      dayId: day.id,
      text,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: false,
        usedLessonWords: false,
        hasSubjects: false,
        meaningIsClear: false,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <section className="today">
      <div className="today-header panel">
        <p className="eyebrow">Week 1 / Day {day.dayNumber}</p>
        <h2>{day.title}</h2>
        <p>{day.goal}</p>
        <p className="time-label">{day.estimatedMinutes} minutes</p>
        <Stepper currentStep={dayProgress.currentStep} />
      </div>

      <div className="panel">
        {dayProgress.currentStep === 'review' && (
          <section>
            <h3>Quick Review</h3>
            <p>Day 1 has no review. Start with today&apos;s words.</p>
          </section>
        )}
        {dayProgress.currentStep === 'words' && <WordCards words={words} onReview={() => undefined} onKnow={() => undefined} />}
        {dayProgress.currentStep === 'patterns' && <PatternCards patterns={patterns} />}
        {dayProgress.currentStep === 'drills' && <ExerciseRenderer exercises={day.exercises} />}
        {dayProgress.currentStep === 'translate' && <TranslationTask exercises={translationExercises} />}
        {dayProgress.currentStep === 'output' && <OutputTaskEditor task={day.outputTask} onTextChange={handleOutputText} />}
        {dayProgress.currentStep === 'done' && <CompletionSummary day={day} outputText={outputText} />}
      </div>

      {dayProgress.currentStep !== 'done' && (
        <button type="button" className="sticky-next primary-button" onClick={moveNext}>
          Continue
        </button>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Show persisted summary in Me**

`src/components/MePage.tsx`:

```tsx
import { useEffect, useState } from 'react';
import type { DayProgress } from '../domain/progress';
import type { ProgressRepository, UserOutput } from '../storage/progressRepository';

export function MePage({ repository }: { repository: ProgressRepository }) {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [output, setOutput] = useState<UserOutput | null>(null);

  useEffect(() => {
    repository.listDayProgress().then(setDays);
    repository.getUserOutput('day-001').then(setOutput);
  }, [repository]);

  const completedCount = days.filter((day) => day.status === 'completed').length;

  return (
    <section className="panel">
      <h2>My Progress</h2>
      <p>Completed days: {completedCount}</p>
      <h3>Saved Output</h3>
      <p className="saved-output">{output?.text || 'No output saved yet.'}</p>
    </section>
  );
}
```

- [ ] **Step 4: Run build and repository tests**

Run:

```powershell
npm test -- src/storage src/domain
npm run build
```

Expected: tests pass and build exits with code 0.

---

### Task 9: Add Component Tests for the Today MVP Flow

**Files:**
- Create: `src/components/TodayPage.test.tsx`

- [ ] **Step 1: Write Today flow tests**

`src/components/TodayPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { week1Course } from '../content/week1';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import { TodayPage } from './TodayPage';

describe('TodayPage', () => {
  it('shows a clear Day 1 start state and advances through learning steps', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-page-test-1');

    render(<TodayPage course={week1Course} repository={repo} />);

    expect(screen.getByText('My Name')).toBeInTheDocument();
    expect(screen.getByText('Quick Review')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('name')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('My name is ___.')).toBeInTheDocument();
  });

  it('autosaves user output text', async () => {
    const user = userEvent.setup();
    const repo = createIndexedDbProgressRepository('today-page-test-2');

    render(<TodayPage course={week1Course} repository={repo} />);

    for (let index = 0; index < 5; index += 1) {
      await user.click(screen.getByRole('button', { name: 'Continue' }));
    }

    const textarea = screen.getByLabelText('Daily output');
    await user.type(textarea, 'My name is Li.');

    const output = await repo.getUserOutput('day-001');
    expect(output?.text).toContain('My name is Li.');
  });
});
```

- [ ] **Step 2: Run component tests**

Run:

```powershell
npm test -- src/components/TodayPage.test.tsx
```

Expected: tests pass.

---

### Task 10: Final Verification and Dev Server

**Files:**
- Modify only if verification exposes a concrete issue in files already created.

- [ ] **Step 1: Run full tests**

Run:

```powershell
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: build exits with code 0 and creates `dist/`.

- [ ] **Step 3: Start local dev server**

Run:

```powershell
npm run dev
```

Expected:

- Vite starts successfully.
- It prints a local URL, usually `http://localhost:5173/`.
- The Today page loads.
- Bottom navigation switches pages.
- Day 1 can progress from Review to Words to Patterns.

## Self-Review Checklist

Spec coverage:

- Week 1 complete content: Task 2.
- Today task flow: Tasks 6-8.
- Mobile-first layout: Task 5 and Task 6 styles.
- Local progress persistence: Task 4 and Task 8.
- Simple review foundation: Task 3 and Today review step.
- Non-AI feedback scaffolding: Task 7 output checklist and reference answers.
- Weekly check content: Task 2 Day 7.
- Minimal Course Map: Task 5.
- Minimal Progress summary: Task 8.
- Small Word Bank: Task 5.

Type consistency:

- Exercise types are discriminated unions in `src/domain/types.ts`.
- `DayProgress.currentStep` uses `StepId`.
- Repository accepts the same `DayProgress` type produced by domain functions.
- User output IDs use `output-${dayId}`, matching repository reads.

Verification commands:

```powershell
npm test
npm run build
```

Expected final state:

- All tests pass.
- Build passes.
- Dev server can run with `npm run dev`.
