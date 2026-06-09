# Basic English V1.11 Word Phonetics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add always-visible British IPA phonetics to every word display in Words, Flashcards, and Today word cards.

**Architecture:** Add `phonetic` to the shared `Word` model, require it in content validation, and render it through one reusable `PhoneticText` component. Keep IPA as metadata so Basic English 850 prose validation does not tokenize IPA symbols.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Playwright.

---

## File Structure

- Modify: `src/domain/types.ts`
  - Add required `phonetic: string` to `Word`.
- Modify: `src/content/week1.ts`
  - Change `wordsWithoutDefinitions` to omit both `definition` and `phonetic`.
  - Add a `phoneticByWordId` map.
  - Merge phonetics into each Week 1 word.
- Modify: `src/content/week2.ts` through `src/content/week6.ts`
  - Add `phonetic` to every `Word` object.
- Modify: `src/content/validateContent.ts`
  - Require non-empty slash-wrapped `word.phonetic`.
  - Keep `word.phonetic` out of Basic English prose validation.
- Modify: `src/content/validateContent.test.ts`
  - Add tests for missing phonetic, malformed phonetic, and IPA not being reported as non-Basic English prose.
- Create: `src/components/PhoneticText.tsx`
  - Render a consistent muted IPA line.
- Modify: `src/components/WordsPage.tsx`
  - Show phonetics in list mode beside/below word text.
- Modify: `src/components/WordFlashcards.tsx`
  - Show phonetics on front and back.
- Modify: `src/components/WordCards.tsx`
  - Show phonetics in Today word cards.
- Modify: `src/components/WordsPage.test.tsx`
  - Assert phonetics appears in list mode and remains visible when Chinese help is off.
- Modify: `src/components/WordFlashcards.test.tsx`
  - Add `phonetic` to fixtures and assert front/back rendering.
- Create: `src/components/WordCards.test.tsx`
  - Cover Today word card phonetics and Chinese-help independence.
- Modify: `src/styles.css`
  - Add `.phonetic-text` styling and small layout support.
- Modify: an existing Playwright spec under `tests/` or create `tests/word-phonetics.spec.ts`
  - Confirm Words, Flashcards, and Today UI show IPA in the running app.

---

### Task 1: Type and Content Validation Tests

**Files:**
- Modify: `src/content/validateContent.test.ts`
- Modify: `src/domain/types.ts`
- Modify: `src/content/validateContent.ts`

- [ ] **Step 1: Write failing validation tests**

Add these tests inside the `describe('week1Course', () => { ... })` block in `src/content/validateContent.test.ts`, near the existing required-word-field tests:

```ts
  it('requires every word to include British IPA phonetics', () => {
    const course = cloneCourse();
    delete (course.words[0] as Partial<(typeof course.words)[number]>).phonetic;

    expect(validateCourseContent(course).errors).toContain(`Word ${course.words[0].id} is missing phonetic`);
  });

  it('requires word phonetics to be slash wrapped', () => {
    const course = cloneCourse();
    course.words[0].phonetic = 'ne\u026am';

    expect(validateCourseContent(course).errors).toContain(`Word ${course.words[0].id} phonetic must be wrapped in /.../`);
  });

  it('does not treat IPA phonetics as Basic English prose', () => {
    const course = cloneCourse();
    course.words[0].phonetic = '/\u02c8kwest\u0283\u0259n/';

    expect(validateCourseContent(course).errors).not.toContain(
      `Non-Basic English word "kwest\u0283\u0259n" in word ${course.words[0].id} phonetic`,
    );
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: TypeScript or Vitest failure because `Word.phonetic` does not exist yet or validation does not report missing/malformed phonetics.

- [ ] **Step 3: Add the `Word.phonetic` type**

Modify `src/domain/types.ts`:

```ts
export interface Word {
  id: string;
  text: string;
  category: WordCategory;
  phonetic: string;
  definition: string;
  chinese: string;
  example: string;
  weekIntroduced: number;
  tags: string[];
}
```

- [ ] **Step 4: Add validation logic**

Modify the `course.words.forEach((word) => { ... })` block in `src/content/validateContent.ts` to this shape:

```ts
  course.words.forEach((word) => {
    registerId(word.id, 'word');
    if (!word.text || !word.definition || !word.chinese || !word.example) {
      errors.push(`Word ${word.id} is missing text, definition, chinese, or example`);
    }
    if (!word.phonetic || !word.phonetic.trim()) {
      errors.push(`Word ${word.id} is missing phonetic`);
    } else if (!word.phonetic.startsWith('/') || !word.phonetic.endsWith('/')) {
      errors.push(`Word ${word.id} phonetic must be wrapped in /.../`);
    }
  });
```

Do not add `word.phonetic` to `validateBasicEnglishVocabulary` inputs. It must remain metadata.

- [ ] **Step 5: Run tests and confirm the expected remaining failure is content data**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: tests still fail because existing content files do not have `phonetic` values yet.

- [ ] **Step 6: Commit validation scaffolding**

```powershell
git add src/domain/types.ts src/content/validateContent.ts src/content/validateContent.test.ts
git commit -m "test: require word phonetics metadata"
```

---

### Task 2: Add British IPA to Week Content

**Files:**
- Modify: `src/content/week1.ts`
- Modify: `src/content/week2.ts`
- Modify: `src/content/week3.ts`
- Modify: `src/content/week4.ts`
- Modify: `src/content/week5.ts`
- Modify: `src/content/week6.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Add Week 1 phonetics merge**

In `src/content/week1.ts`, change:

```ts
const wordsWithoutDefinitions: Array<Omit<Word, 'definition'>> = [
```

to:

```ts
const wordsWithoutDefinitions: Array<Omit<Word, 'definition' | 'phonetic'>> = [
```

Add a `phoneticByWordId` map next to `definitionByWordId`:

```ts
const phoneticByWordId: Record<string, string> = {
  name: '/ne\u026am/',
  student: '/\u02c8stju\u02d0d\u0259nt/',
  country: '/\u02c8k\u028cntri/',
  city: '/\u02c8s\u026ati/',
  friend: '/frend/',
  teacher: '/\u02c8ti\u02d0t\u0283\u0259/',
  day: '/de\u026a/',
  week: '/wi\u02d0k/',
  work: '/w\u025c\u02d0k/',
  home: '/h\u0259\u028am/',
  school: '/sku\u02d0l/',
  language: '/\u02c8l\u00e6\u014b\u0261w\u026ad\u0292/',
  question: '/\u02c8kwest\u0283\u0259n/',
  answer: '/\u02c8\u0251\u02d0ns\u0259/',
};
```

Update the mapper:

```ts
const words: Word[] = wordsWithoutDefinitions.map((word) => ({
  ...word,
  phonetic: phoneticByWordId[word.id],
  definition: definitionByWordId[word.id],
}));
```

- [ ] **Step 2: Add phonetics to Weeks 2-6**

For every object in `week2Words`, `week3Words`, `week4Words`, `week5Words`, and `week6Words`, add:

```ts
phonetic: '/.../',
```

Use British IPA from Cambridge Dictionary, Oxford Learner's Dictionaries, or another reliable British-English dictionary. Keep one primary UK form per word and include leading/trailing slashes.

Concrete examples to use when present:

```ts
{ id: 'room', text: 'room', phonetic: '/ru\u02d0m/', ... }
{ id: 'table', text: 'table', phonetic: '/\u02c8te\u026ab\u0259l/', ... }
{ id: 'bus', text: 'bus', phonetic: '/b\u028cs/', ... }
{ id: 'store', text: 'store', phonetic: '/st\u0254\u02d0/', ... }
{ id: 'bread', text: 'bread', phonetic: '/bred/', ... }
{ id: 'wrong', text: 'wrong', phonetic: '/r\u0252\u014b/', ... }
{ id: 'repeat', text: 'repeat', phonetic: '/r\u026a\u02c8pi\u02d0t/', ... }
```

If a content word is a phrase rather than one word, such as a taught chunk, use dictionary-quality IPA for the full phrase only if the `text` field is the phrase. Do not add labels like `UK`.

- [ ] **Step 3: Run content validation**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: PASS for validation tests. If a test fails on missing phonetic, use the error message word id to fill that word.

- [ ] **Step 4: Commit content phonetics**

```powershell
git add src/content/week1.ts src/content/week2.ts src/content/week3.ts src/content/week4.ts src/content/week5.ts src/content/week6.ts
git commit -m "feat: add British IPA word metadata"
```

---

### Task 3: Reusable Phonetic UI Component

**Files:**
- Create: `src/components/PhoneticText.tsx`
- Modify: `src/styles.css`
- Test: covered by Task 4 through Task 6 component tests

- [ ] **Step 1: Create `PhoneticText`**

Create `src/components/PhoneticText.tsx`:

```tsx
interface PhoneticTextProps {
  value: string;
}

export function PhoneticText({ value }: PhoneticTextProps) {
  return (
    <span className="phonetic-text" aria-label={`British pronunciation ${value}`}>
      {value}
    </span>
  );
}
```

- [ ] **Step 2: Add styles**

Add to `src/styles.css` near `.word-text`:

```css
.word-heading {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.phonetic-text {
  color: #66766c;
  font-size: 0.92rem;
  font-weight: 650;
  letter-spacing: 0;
}

.flashcard .phonetic-text {
  justify-self: center;
}
```

- [ ] **Step 3: Run build-level type check**

Run:

```powershell
npm run build
```

Expected: PASS after Task 1 and Task 2 are complete.

- [ ] **Step 4: Commit component**

```powershell
git add src/components/PhoneticText.tsx src/styles.css
git commit -m "feat: add phonetic text component"
```

---

### Task 4: Words List Integration

**Files:**
- Modify: `src/components/WordsPage.tsx`
- Modify: `src/components/WordsPage.test.tsx`

- [ ] **Step 1: Write failing WordsPage tests**

Add tests in `src/components/WordsPage.test.tsx`:

```tsx
  it('shows phonetics in list mode', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByText('/ne\u026am/')).toBeInTheDocument();
  });

  it('keeps phonetics visible when Chinese help is off', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByText('/ne\u026am/')).toBeInTheDocument();
    expect(screen.queryByText(/Chinese:/)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
npm test -- src/components/WordsPage.test.tsx
```

Expected: FAIL because `/neɪm/` is not rendered yet.

- [ ] **Step 3: Render phonetics in list mode**

Import `PhoneticText` in `src/components/WordsPage.tsx`:

```tsx
import { PhoneticText } from './PhoneticText';
```

Change the word heading markup inside list mode from:

```tsx
<strong>
  {word.text}
  <SpeechButton text={word.text} label={`Read word ${word.text}`} />
</strong>
```

to:

```tsx
<strong className="word-heading">
  <span>{word.text}</span>
  <PhoneticText value={word.phonetic} />
  <SpeechButton text={word.text} label={`Read word ${word.text}`} />
</strong>
```

- [ ] **Step 4: Run WordsPage tests**

Run:

```powershell
npm test -- src/components/WordsPage.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit WordsPage integration**

```powershell
git add src/components/WordsPage.tsx src/components/WordsPage.test.tsx
git commit -m "feat: show phonetics in words list"
```

---

### Task 5: Flashcard Integration

**Files:**
- Modify: `src/components/WordFlashcards.tsx`
- Modify: `src/components/WordFlashcards.test.tsx`

- [ ] **Step 1: Update test fixtures**

In `src/components/WordFlashcards.test.tsx`, add phonetics to the two fixture words:

```ts
    phonetic: '/ne\u026am/',
```

and:

```ts
    phonetic: '/ru\u02d0m/',
```

- [ ] **Step 2: Write failing flashcard tests**

In `src/components/WordFlashcards.test.tsx`, add:

```tsx
  it('shows phonetics on the front side', () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    expect(screen.getByText('/ru\u02d0m/')).toBeInTheDocument();
  });

  it('shows phonetics on the back side', async () => {
    renderWithSpeech(
      <WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('/ru\u02d0m/')).toBeInTheDocument();
  });
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
npm test -- src/components/WordFlashcards.test.tsx
```

Expected: FAIL because `WordFlashcards` does not render phonetics.

- [ ] **Step 4: Render phonetics in `WordFlashcards`**

Import:

```tsx
import { PhoneticText } from './PhoneticText';
```

Change the front:

```tsx
<h3>{currentWord.text}</h3>
<PhoneticText value={currentWord.phonetic} />
```

Change the back:

```tsx
<h3>{currentWord.text}</h3>
<PhoneticText value={currentWord.phonetic} />
```

Keep existing speech buttons unchanged.

- [ ] **Step 5: Run flashcard tests**

Run:

```powershell
npm test -- src/components/WordFlashcards.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit flashcard integration**

```powershell
git add src/components/WordFlashcards.tsx src/components/WordFlashcards.test.tsx
git commit -m "feat: show phonetics on word flashcards"
```

---

### Task 6: Today WordCards Integration

**Files:**
- Modify: `src/components/WordCards.tsx`
- Create: `src/components/WordCards.test.tsx`

- [ ] **Step 1: Add focused WordCards tests**

Create `src/components/WordCards.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../domain/types';
import { SpeechProvider } from '../speech/SpeechProvider';
import { WordCards } from './WordCards';

const speechService = {
  isSupported: () => true,
  speak: vi.fn(() => null),
  stop: vi.fn(),
};

const words: Word[] = [
  {
    id: 'name',
    text: 'name',
    category: 'general_thing',
    phonetic: '/ne\u026am/',
    definition: 'the word for a person or thing',
    chinese: '名字',
    example: 'My name is Li.',
    weekIntroduced: 1,
    tags: ['identity'],
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderWordCards(showChineseHelp = false) {
  return render(
    <SpeechProvider enabled rate="normal" service={speechService}>
      <WordCards words={words} showChineseHelp={showChineseHelp} onReview={vi.fn()} onKnow={vi.fn()} />
    </SpeechProvider>,
  );
}

describe('WordCards', () => {
  it('shows phonetics on Today word cards', () => {
    renderWordCards();

    expect(screen.getByText('/ne\u026am/')).toBeInTheDocument();
  });

  it('keeps phonetics visible while Chinese help is off', () => {
    renderWordCards();

    expect(screen.getByText('/ne\u026am/')).toBeInTheDocument();
    expect(screen.queryByText(/Chinese:/)).not.toBeInTheDocument();
  });

  it('still shows Chinese only when Chinese help is enabled', () => {
    renderWordCards(true);

    expect(screen.getByText('/ne\u026am/')).toBeInTheDocument();
    expect(screen.getByText('Chinese: 名字')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```powershell
npm test -- src/components/WordCards.test.tsx
```

Expected: FAIL because `WordCards` does not render phonetics.

- [ ] **Step 3: Render phonetics in `WordCards`**

Import:

```tsx
import { PhoneticText } from './PhoneticText';
```

Change:

```tsx
<p className="word-text">
  {word.text}
  <SpeechButton text={word.text} label={`Read word ${word.text}`} />
</p>
```

to:

```tsx
<p className="word-text word-heading">
  <span>{word.text}</span>
  <PhoneticText value={word.phonetic} />
  <SpeechButton text={word.text} label={`Read word ${word.text}`} />
</p>
```

- [ ] **Step 4: Run WordCards tests**

Run:

```powershell
npm test -- src/components/WordCards.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Today integration**

```powershell
git add src/components/WordCards.tsx src/components/WordCards.test.tsx
git commit -m "feat: show phonetics on today word cards"
```

---

### Task 7: E2E Coverage

**Files:**
- Create or modify: `tests/word-phonetics.spec.ts`

- [ ] **Step 1: Inspect existing Playwright patterns**

Run:

```powershell
Get-ChildItem tests
```

Open the closest Words/Today spec and reuse its app navigation pattern.

- [ ] **Step 2: Add E2E test**

Create `tests/word-phonetics.spec.ts` using the local app navigation conventions. The assertions must cover:

```ts
import { expect, test } from '@playwright/test';

test('word phonetics are visible in Words list and flashcards', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Words' }).click();

  await expect(page.getByText('/neɪm/')).toBeVisible();

  await page.getByRole('button', { name: 'Flashcards' }).click();
  await expect(page.getByLabel('Word flashcards')).toContainText('/');

  await page.getByRole('button', { name: 'Flip' }).click();
  await expect(page.getByLabel('Word flashcards')).toContainText('/');
});

test('word phonetics are visible in Today word cards', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Today' }).click();

  await expect(page.locator('.word-card .phonetic-text').first()).toBeVisible();
});
```

If the existing app navigation uses links instead of buttons, replace `getByRole('button', { name: ... })` with the existing pattern from the inspected specs. Keep the semantic assertions the same.

- [ ] **Step 3: Run E2E**

Run:

```powershell
npm run test:e2e -- tests/word-phonetics.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Commit E2E coverage**

```powershell
git add tests/word-phonetics.spec.ts
git commit -m "test: cover word phonetics e2e"
```

---

### Task 8: Full Verification and Release Commit Check

**Files:**
- No new files unless fixing issues found by verification.

- [ ] **Step 1: Run unit test suite**

```powershell
npm test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 3: Run E2E suite**

```powershell
npm run test:e2e
```

Expected: PASS.

- [ ] **Step 4: Inspect git history**

```powershell
git status --short --branch
git log --oneline -6
```

Expected:

- Working tree clean.
- Branch contains the V1.11 design commit and implementation commits.

- [ ] **Step 5: Prepare final handoff**

Report:

- Files changed.
- Test commands run and pass/fail status.
- Any phonetic entries that were uncertain and need follow-up dictionary review.

Do not claim completion unless all required verification commands have passed.

---

## Self-Review

- Spec coverage: The plan covers all design decisions: British IPA only, always visible, all word display surfaces, Chinese help independence, content validation, UI styling, and E2E coverage.
- Placeholder scan: The plan defines concrete files, commands, test assertions, and code shapes. The only variable work is filling all dictionary-sourced IPA values in content files, which is intentionally the content task.
- Type consistency: The plan uses one field name everywhere: `phonetic`. The reusable UI component uses one prop: `value`.
