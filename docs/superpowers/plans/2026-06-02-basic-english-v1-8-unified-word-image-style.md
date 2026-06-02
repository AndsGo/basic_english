# Basic English V1.8 Unified Word Image Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all current Words flashcard images with a unified semi-realistic image system and enforce the new visual-style rules with metadata tests.

**Architecture:** Keep `WordsPage` and `WordFlashcards` behavior unchanged. Upgrade `wordImageAssets` with `visualStyle` metadata, validate the new mapping in content tests, and replace the PNG files under `src/assets/word-flashcards/` after sample approval.

**Tech Stack:** React, TypeScript, Vite image imports, Vitest, Playwright, PNG assets at `1024x1024`.

---

## File Structure

- Modify `src/content/wordFlashcardImages.ts`: add `validWordImageVisualStyles`, `WordImageVisualStyle`, `visualStyle` field, and update all 53 metadata entries.
- Modify `src/content/validateContent.test.ts`: add tests for `visualStyle` validity and label-policy rules.
- Replace all 53 files under `src/assets/word-flashcards/` after sample approval.
- Keep `src/components/WordsPage.tsx` and `src/components/WordFlashcards.tsx` unchanged unless tests expose a real regression.
- Use `docs/superpowers/specs/2026-06-02-basic-english-v1-8-unified-word-image-style-design.md` as the source of truth.

## Visual Style Mapping

Use this exact mapping:

```ts
const visualStyleByWordId = {
  name: 'grammar',
  my: 'grammar',
  i: 'grammar',
  am: 'grammar',
  from: 'grammar',
  china: 'scene',
  student: 'scene',
  happy: 'scene',
  have: 'scene',
  question: 'scene',
  friend: 'scene',
  this: 'grammar',
  he: 'scene',
  she: 'scene',
  kind: 'scene',
  study: 'scene',
  english: 'scene',
  because: 'grammar',
  want: 'scene',
  learn: 'scene',
  room: 'scene',
  home: 'scene',
  table: 'concrete',
  chair: 'concrete',
  bed: 'concrete',
  door: 'concrete',
  window: 'concrete',
  book: 'concrete',
  phone: 'concrete',
  bag: 'concrete',
  box: 'concrete',
  cup: 'concrete',
  pen: 'concrete',
  paper: 'concrete',
  thing: 'scene',
  in: 'relation',
  on: 'relation',
  under: 'relation',
  near: 'relation',
  small: 'scene',
  big: 'scene',
  clean: 'scene',
  new: 'scene',
  old: 'scene',
  useful: 'scene',
  important: 'scene',
  good: 'scene',
  use: 'scene',
  every: 'grammar',
  day: 'scene',
  money: 'concrete',
  card: 'concrete',
  key: 'concrete',
} as const;
```

## Task 1: Add Visual Style Metadata Tests

**Files:**
- Modify: `src/content/validateContent.test.ts`
- Modify: `src/content/wordFlashcardImages.ts`

- [ ] **Step 1: Write failing tests for visual style metadata**

In `src/content/validateContent.test.ts`, update the existing import from `wordFlashcardImages` to include the new exports:

```ts
import {
  validWordImageVisualStyles,
  wordFlashcardImages,
  wordImageAssets,
  wordImageVisualStyleByWordId,
} from './wordFlashcardImages';
```

Keep `validWordImageKinds` in the import if the current file already imports it.

Add these tests inside the `basicEnglishCourse V1.2` describe block:

```ts
  it('assigns a visual style to every course word image', () => {
    const courseWordIds = basicEnglishCourse.words.map((word) => word.id);
    const missingVisualStyleWordIds = courseWordIds.filter((wordId) => !wordImageVisualStyleByWordId[wordId]);

    expect(missingVisualStyleWordIds).toEqual([]);
    expect(Object.keys(wordImageVisualStyleByWordId).sort()).toEqual([...courseWordIds].sort());
  });

  it('uses valid word image visual styles', () => {
    wordImageAssets.forEach((asset) => {
      expect(validWordImageVisualStyles).toContain(asset.visualStyle);
    });
  });

  it('limits English keyword labels to grammar cards', () => {
    const nonGrammarWithEnglishLabels = wordImageAssets
      .filter((asset) => asset.visualStyle !== 'grammar' && asset.labelPolicy !== 'none')
      .map((asset) => asset.wordId);
    const grammarWithoutEnglishLabels = wordImageAssets
      .filter((asset) => asset.visualStyle === 'grammar' && asset.labelPolicy !== 'english-keyword')
      .map((asset) => asset.wordId);

    expect(nonGrammarWithEnglishLabels).toEqual([]);
    expect(grammarWithoutEnglishLabels).toEqual([]);
  });
```

- [ ] **Step 2: Run tests to verify the expected failure**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL because `validWordImageVisualStyles`, `wordImageVisualStyleByWordId`, and `asset.visualStyle` do not exist yet.

- [ ] **Step 3: Add visual style types and mapping**

In `src/content/wordFlashcardImages.ts`, add:

```ts
export const validWordImageVisualStyles = ['concrete', 'scene', 'relation', 'grammar'] as const;

export type WordImageVisualStyle = (typeof validWordImageVisualStyles)[number];
```

Update `WordImageAsset`:

```ts
export interface WordImageAsset {
  wordId: string;
  image: string;
  kind: WordImageKind;
  visualStyle: WordImageVisualStyle;
  labelPolicy: WordImageLabelPolicy;
  prompt: string;
}
```

Update `wordImageAsset`:

```ts
function wordImageAsset(
  wordId: string,
  image: string,
  kind: WordImageKind,
  visualStyle: WordImageVisualStyle,
  labelPolicy: WordImageLabelPolicy,
  prompt: string,
): WordImageAsset {
  return { wordId, image, kind, visualStyle, labelPolicy, prompt };
}
```

Add the exact `visualStyleByWordId` mapping from this plan and export it:

```ts
export const wordImageVisualStyleByWordId: Partial<Record<string, WordImageVisualStyle>> = Object.fromEntries(
  wordImageAssets.map((asset) => [asset.wordId, asset.visualStyle]),
);
```

Update all 53 `wordImageAsset(...)` calls with the right visual style. Example:

```ts
wordImageAsset('key', keyImage, 'object', 'concrete', 'none', 'A semi-realistic key object image with no text.'),
```

- [ ] **Step 4: Run content tests**

Run:

```bash
npm test -- src/content/validateContent.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit metadata tests and implementation**

Run:

```bash
git add src/content/validateContent.test.ts src/content/wordFlashcardImages.ts
git commit -m "test: enforce word image visual styles"
```

## Task 2: Generate Four Sample Images For Approval

**Files:**
- Replace: `src/assets/word-flashcards/key.png`
- Replace: `src/assets/word-flashcards/study.png`
- Replace: `src/assets/word-flashcards/under.png`
- Replace: `src/assets/word-flashcards/because.png`

- [ ] **Step 1: Generate the Concrete Visual sample**

Generate `src/assets/word-flashcards/key.png`.

Prompt:

```text
Use case: scientific-educational
Asset type: Basic English word flashcard image
Primary request: a clear semi-realistic image of a single small metal key
Scene/backdrop: simple clean tabletop or soft neutral background
Subject: one key, easy to recognize
Style/medium: semi-realistic educational product image, close to a clean app flashcard asset
Composition/framing: centered square composition, generous padding, 1024x1024
Lighting/mood: soft natural light, calm learning-product feel
Constraints: no text, no letters, no Chinese, no watermark, no extra objects, not a flat icon
Avoid: abstract symbols, line art, cartoon geometry, labels, clutter
```

- [ ] **Step 2: Generate the Scene Visual sample**

Generate `src/assets/word-flashcards/study.png`.

Prompt:

```text
Use case: scientific-educational
Asset type: Basic English word flashcard image
Primary request: a student studying English at a desk with an open book
Scene/backdrop: simple room or study desk
Subject: one learner, open book, pen or notebook
Style/medium: semi-realistic educational scene, not flat icon art
Composition/framing: centered square composition, readable at flashcard size, 1024x1024
Lighting/mood: soft natural light, focused and calm
Constraints: no visible text, no readable book text, no Chinese, no watermark
Avoid: abstract symbols, flat vector card, labels, overly busy classroom
```

- [ ] **Step 3: Generate the Relation Diagram sample**

Generate `src/assets/word-flashcards/under.png`.

Prompt:

```text
Use case: scientific-educational
Asset type: Basic English word flashcard image
Primary request: a book clearly under a small table
Scene/backdrop: simple floor and neutral wall
Subject: one book placed under one table
Style/medium: semi-realistic educational relation image, clear spatial relation
Composition/framing: square, centered, object relation easy to read at small size, 1024x1024
Lighting/mood: soft natural light
Constraints: no text, no arrows, no labels, no Chinese, no watermark
Avoid: flat diagram, abstract geometry, clutter, multiple books
```

- [ ] **Step 4: Generate the Grammar Card sample**

Generate `src/assets/word-flashcards/because.png`.

Prompt:

```text
Use case: scientific-educational
Asset type: Basic English grammar flashcard image
Primary request: a clean grammar cue card for the word because
Scene/backdrop: simple soft card-like background
Subject: the English keyword "because" and a minimal reason cue such as a small arrow from action to reason
Style/medium: polished grammar card, consistent with an educational app, not realistic photography
Composition/framing: centered square composition, 1024x1024
Text: "because"
Constraints: exact English text only, no Chinese, no extra sentence, no watermark
Avoid: clutter, long explanations, illegible text, realistic object photo
```

- [ ] **Step 5: Inspect the four samples**

Use `view_image` or a local contact sheet to inspect:

- `key.png`
- `study.png`
- `under.png`
- `because.png`

Check:

- key is semi-realistic and text-free.
- study is a semi-realistic life scene and text-free.
- under clearly shows relation and is text-free.
- because is a clean Grammar Card and includes only the English keyword.

- [ ] **Step 6: Run smoke verification**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/WordsPage.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit samples**

Run:

```bash
git add src/assets/word-flashcards/key.png src/assets/word-flashcards/study.png src/assets/word-flashcards/under.png src/assets/word-flashcards/because.png
git commit -m "feat: add v1.8 word image style samples"
```

- [ ] **Step 8: Human approval gate**

Stop and show the four sample images to the user. Do not generate the remaining 49 images until the user approves the sample style.

## Task 3: Replace Concrete Visual Images

**Files:**
- Replace concrete PNGs under `src/assets/word-flashcards/`

- [ ] **Step 1: Replace concrete images**

Generate or replace these images with semi-realistic, text-free object images:

```text
book, table, chair, bed, door, window, phone, bag, box, cup, pen, paper, card, money
```

`key` was already approved in Task 2 unless the user requested changes.

Use this prompt pattern:

```text
Use case: scientific-educational
Asset type: Basic English word flashcard image
Primary request: a clear semi-realistic image of <word>
Scene/backdrop: simple clean tabletop, room corner, or neutral everyday setting appropriate for <word>
Subject: <word>, easy to recognize
Style/medium: semi-realistic educational product image, close to a clean app flashcard asset
Composition/framing: centered square composition, generous padding, 1024x1024
Lighting/mood: soft natural light, calm learning-product feel
Constraints: no text, no letters, no Chinese, no watermark, no extra unrelated objects, not a flat icon
Avoid: abstract symbols, line art, cartoon geometry, labels, clutter
```

- [ ] **Step 2: Inspect concrete images**

Inspect all concrete images and reject any image with text, Chinese, watermark, obvious flat-symbol style, or unclear object identity.

- [ ] **Step 3: Run tests and build**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/WordsPage.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit concrete images**

Run:

```bash
git add src/assets/word-flashcards
git commit -m "feat: unify concrete word images"
```

## Task 4: Replace Scene Visual Images

**Files:**
- Replace scene PNGs under `src/assets/word-flashcards/`

- [ ] **Step 1: Replace scene images**

Generate or replace these images with semi-realistic, text-free scene images:

```text
room, home, china, student, friend, he, she, happy, kind, learn, want, use, have, small, big, clean, new, old, useful, important, good, question, english, thing, day
```

`study` was already approved in Task 2 unless the user requested changes.

Use this prompt pattern:

```text
Use case: scientific-educational
Asset type: Basic English word flashcard image
Primary request: a simple semi-realistic scene showing <word meaning>
Scene/backdrop: everyday life setting appropriate for the word
Subject: one clear main subject or action
Style/medium: semi-realistic educational scene, not flat icon art
Composition/framing: centered square composition, readable at flashcard size, 1024x1024
Lighting/mood: soft natural light, calm and clear
Constraints: no visible text, no Chinese, no watermark, simple scene, easy to describe in Basic English
Avoid: abstract symbols, flat vector card, labels, clutter, complicated story
```

Specific scene meanings:

```text
china: a simple recognizable China travel/place scene, no flags with text
student: one learner at a desk
friend: two friendly people together
he: one male person, neutral scene
she: one female person, neutral scene
happy: one happy person
kind: one person helping another
learn: learner understanding something from a book or teacher
want: person reaching for or looking at a desired object
use: person using a pen or phone
have: person holding one object
small: small object next to larger context
big: large object in simple setting
clean: clean room or clean table
new: new clean object in package-free simple scene
old: old worn object in simple scene
useful: useful object being used
important: key/card/money kept carefully
good: pleasant helpful room/object scene
question: person asking with visual question cue, no written text
english: English learning scene with book/classroom; no readable text
thing: small group of everyday objects
day: morning daylight scene
```

- [ ] **Step 2: Inspect scene images**

Inspect all scene images and reject any image with text, Chinese, watermark, pure symbol-card style, or unclear word meaning.

- [ ] **Step 3: Run tests and build**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/WordsPage.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit scene images**

Run:

```bash
git add src/assets/word-flashcards
git commit -m "feat: unify scene word images"
```

## Task 5: Replace Relation And Grammar Images

**Files:**
- Replace relation and grammar PNGs under `src/assets/word-flashcards/`

- [ ] **Step 1: Replace relation images**

Generate or replace:

```text
in, on, near
```

`under` was already approved in Task 2 unless the user requested changes.

Use consistent objects across relation images where possible, such as a book and a table or box. No text, no arrows, no labels.

- [ ] **Step 2: Replace grammar card images**

Generate or replace:

```text
name, my, i, am, from, this, every
```

`because` was already approved in Task 2 unless the user requested changes.

Use the approved Grammar Card style. Each card may include only the target English keyword. No Chinese, no long sentence, no extra explanation.

- [ ] **Step 3: Inspect relation and grammar images**

Check:

- relation images show relation without text.
- grammar cards are visually consistent.
- grammar cards contain exact English keyword only.
- no Chinese appears.

- [ ] **Step 4: Run tests and build**

Run:

```bash
npm test -- src/content/validateContent.test.ts src/components/WordsPage.test.tsx
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit relation and grammar images**

Run:

```bash
git add src/assets/word-flashcards
git commit -m "feat: unify relation and grammar word images"
```

## Task 6: Final Verification And Review

**Files:**
- No new code changes expected.

- [ ] **Step 1: Create a final contact sheet**

Create a temporary visual contact sheet outside committed source, for example:

```bash
New-Item -ItemType Directory -Force tmp | Out-Null
```

Use available local tooling to assemble or inspect all 53 word images. Do not commit the contact sheet unless explicitly requested.

- [ ] **Step 2: Final asset audit**

Verify:

- 53 word images exist.
- all images are `1024x1024`.
- Concrete Visual images have no text and are object-focused.
- Scene Visual images have no text and are life-scene-focused.
- Relation Diagram images have no text and clearly show spatial relation.
- Grammar Card images use only target English keyword.
- no image contains Chinese.

- [ ] **Step 3: Run full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Run E2E**

Run:

```bash
npm run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 6: Request final review**

Request review focused on:

- style compliance against V1.8 spec;
- metadata/test coverage;
- image consistency and obvious asset issues.

- [ ] **Step 7: Inspect Git status**

Run:

```bash
git status --short --branch
git log --oneline main..HEAD
```

Expected: clean worktree on `feature/v1-8-unified-word-images`, ahead of `main` by the V1.8 plan and implementation commits.
