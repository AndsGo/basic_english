# Basic English V1.7 All Word Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every current course word a flashcard image and add metadata/tests that make the image system extensible toward the Basic English 850-word set.

**Architecture:** Keep `WordsPage` and `WordFlashcards` on the existing `imageByWordId` interface. Replace the flat image-only content module with structured word image metadata, then derive the same mapping from that metadata.

**Tech Stack:** React, TypeScript, Vite asset imports, Vitest, Playwright, PNG assets under `src/assets/word-flashcards/`.

---

## File Structure

- Modify `src/content/wordFlashcardImages.ts`: add taxonomy types, import all word images, export `wordImageAssets`, and derive `wordFlashcardImages`.
- Modify `src/content/validateContent.test.ts`: add image coverage and metadata tests.
- Modify `src/components/WordsPage.test.tsx`: prove the real course flashcard content does not show `No image yet`.
- Create 37 PNG files in `src/assets/word-flashcards/` for the currently missing course words.
- Keep `src/components/WordFlashcards.tsx` unchanged unless tests expose a real UI issue.

## Task 1: Content Tests For Full Image Coverage

**Files:**
- Modify: `src/content/validateContent.test.ts`
- Modify: `src/content/wordFlashcardImages.ts`

- [ ] **Step 1: Write failing coverage tests**

Add these imports near the existing content imports in `src/content/validateContent.test.ts`:

```ts
import { wordFlashcardImages, wordImageAssets, validWordImageKinds } from './wordFlashcardImages';
```

Add these tests inside the existing content test suite:

```ts
  it('has a flashcard image for every course word', () => {
    const missingWordIds = course.words
      .map((word) => word.id)
      .filter((wordId) => !wordFlashcardImages[wordId]);

    expect(missingWordIds).toEqual([]);
  });

  it('keeps word image metadata aligned with course words', () => {
    const courseWordIds = new Set(course.words.map((word) => word.id));
    const assetWordIds = wordImageAssets.map((asset) => asset.wordId);

    expect(new Set(assetWordIds).size).toBe(assetWordIds.length);
    expect(assetWordIds.filter((wordId) => !courseWordIds.has(wordId))).toEqual([]);
    expect(assetWordIds.sort()).toEqual([...courseWordIds].sort());
  });

  it('uses valid word image taxonomy metadata', () => {
    wordImageAssets.forEach((asset) => {
      expect(validWordImageKinds).toContain(asset.kind);
      expect(['none', 'english-keyword']).toContain(asset.labelPolicy);
      expect(asset.prompt.trim()).toBeTruthy();
      expect(asset.image).toMatch(/\S/);
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL because `wordImageAssets` and `validWordImageKinds` are not exported yet.

- [ ] **Step 3: Add metadata exports without full coverage**

In `src/content/wordFlashcardImages.ts`, add:

```ts
export const validWordImageKinds = [
  'object',
  'place',
  'person',
  'position',
  'quality',
  'action',
  'structure',
  'time',
  'abstract',
] as const;

export type WordImageKind = (typeof validWordImageKinds)[number];
export type WordImageLabelPolicy = 'none' | 'english-keyword';

export interface WordImageAsset {
  wordId: string;
  image: string;
  kind: WordImageKind;
  labelPolicy: WordImageLabelPolicy;
  prompt: string;
}
```

Then convert the existing 16 mapped images to `wordImageAssets` entries and derive:

```ts
export const wordFlashcardImages: Partial<Record<string, string>> = Object.fromEntries(
  wordImageAssets.map((asset) => [asset.wordId, asset.image]),
);
```

- [ ] **Step 4: Run test and confirm coverage failure is now precise**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL listing the 37 missing word ids.

- [ ] **Step 5: Commit metadata test and partial implementation**

Run:

```bash
git add src/content/validateContent.test.ts src/content/wordFlashcardImages.ts
git commit -m "test: require word flashcard image coverage"
```

## Task 2: Generate Missing Word Images

**Files:**
- Create: 37 PNG files in `src/assets/word-flashcards/`

- [ ] **Step 1: Generate concrete and place images**

Create images for:

```text
china, question, thing, money, card, key
```

Use simple flashcard-ready prompts with no Chinese text. `china` should be a simple map or landmark scene labeled only with `China` if needed. `question` may show a learner asking with a small `?`.

- [ ] **Step 2: Generate person and quality images**

Create images for:

```text
he, she, happy, kind, small, big, clean, new, old, useful, important, good
```

Use clear human or object-state scenes. Labels are allowed only when they clarify the abstract quality.

- [ ] **Step 3: Generate action images**

Create images for:

```text
have, study, want, learn, use
```

Use simple daily-life scenes. Keep objects recognizable and avoid explanatory paragraphs.

- [ ] **Step 4: Generate structure, position, and time images**

Create images for:

```text
name, my, i, am, from, this, because, english, in, on, under, near, every, day
```

Use English keywords sparingly for structure words. For `in`, `on`, `under`, and `near`, use a consistent object-position system.

- [ ] **Step 5: Check asset names**

Verify these files exist:

```bash
Get-ChildItem src/assets/word-flashcards | Select-Object -ExpandProperty Name
```

Expected: existing 16 files plus the 37 new files, all with lowercase hyphen-free word ids where possible, for example `china.png`, `because.png`, `under.png`.

## Task 3: Wire Full Image Metadata

**Files:**
- Modify: `src/content/wordFlashcardImages.ts`

- [ ] **Step 1: Import each new image**

Add imports for the 37 new files:

```ts
import amImage from '../assets/word-flashcards/am.png';
import becauseImage from '../assets/word-flashcards/because.png';
import bigImage from '../assets/word-flashcards/big.png';
import cardImage from '../assets/word-flashcards/card.png';
import chinaImage from '../assets/word-flashcards/china.png';
import cleanImage from '../assets/word-flashcards/clean.png';
import dayImage from '../assets/word-flashcards/day.png';
import englishImage from '../assets/word-flashcards/english.png';
import everyImage from '../assets/word-flashcards/every.png';
import fromImage from '../assets/word-flashcards/from.png';
import goodImage from '../assets/word-flashcards/good.png';
import happyImage from '../assets/word-flashcards/happy.png';
import haveImage from '../assets/word-flashcards/have.png';
import heImage from '../assets/word-flashcards/he.png';
import iImage from '../assets/word-flashcards/i.png';
import importantImage from '../assets/word-flashcards/important.png';
import inImage from '../assets/word-flashcards/in.png';
import keyImage from '../assets/word-flashcards/key.png';
import kindImage from '../assets/word-flashcards/kind.png';
import learnImage from '../assets/word-flashcards/learn.png';
import moneyImage from '../assets/word-flashcards/money.png';
import myImage from '../assets/word-flashcards/my.png';
import nameImage from '../assets/word-flashcards/name.png';
import nearImage from '../assets/word-flashcards/near.png';
import newImage from '../assets/word-flashcards/new.png';
import oldImage from '../assets/word-flashcards/old.png';
import onImage from '../assets/word-flashcards/on.png';
import questionImage from '../assets/word-flashcards/question.png';
import sheImage from '../assets/word-flashcards/she.png';
import smallImage from '../assets/word-flashcards/small.png';
import studyImage from '../assets/word-flashcards/study.png';
import thingImage from '../assets/word-flashcards/thing.png';
import thisImage from '../assets/word-flashcards/this.png';
import underImage from '../assets/word-flashcards/under.png';
import useImage from '../assets/word-flashcards/use.png';
import usefulImage from '../assets/word-flashcards/useful.png';
import wantImage from '../assets/word-flashcards/want.png';
```

- [ ] **Step 2: Add 53 metadata entries**

Make `wordImageAssets` contain every course word id exactly once. Existing entries should be converted to structured entries like:

```ts
{
  wordId: 'book',
  image: bookImage,
  kind: 'object',
  labelPolicy: 'none',
  prompt: 'A simple book flashcard image for Basic English learners.',
}
```

Use `labelPolicy: 'english-keyword'` only for `name`, `my`, `i`, `am`, `from`, `this`, `because`, `english`, `in`, `on`, `under`, `near`, `every`, and `day`.

- [ ] **Step 3: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit full metadata wiring**

Run:

```bash
git add src/content/wordFlashcardImages.ts src/assets/word-flashcards
git commit -m "feat: add all word flashcard images"
```

## Task 4: Product UI Regression Tests

**Files:**
- Modify: `src/components/WordsPage.test.tsx`

- [ ] **Step 1: Add a real-content no-fallback test**

Add this test to `src/components/WordsPage.test.tsx`:

```ts
  it('does not show missing-image fallback for real course flashcards', async () => {
    const user = userEvent.setup();

    render(<WordsPage course={week1Course} repository={createRepository()} />);

    await user.click(screen.getByRole('button', { name: 'Flashcards' }));

    expect(screen.queryByText('No image yet')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', expect.stringContaining('flashcard illustration'));
  });
```

If the test file uses only `week1Course`, keep this as Week 1 coverage and rely on content tests for full-course coverage.

- [ ] **Step 2: Run the Words page tests**

Run:

```bash
npm test -- src/components/WordsPage.test.tsx src/components/WordFlashcards.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit UI regression test**

Run:

```bash
git add src/components/WordsPage.test.tsx
git commit -m "test: cover real word flashcard images"
```

## Task 5: Final Verification

**Files:**
- No code changes expected.

- [ ] **Step 1: Run unit and component tests**

Run:

```bash
npm test
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 3: Run E2E tests**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 4: Inspect Git status**

Run:

```bash
git status --short --branch
git log --oneline main..HEAD
```

Expected: clean worktree on `feature/v1-7-all-word-images` with the V1.7 commits ahead of `main`.
