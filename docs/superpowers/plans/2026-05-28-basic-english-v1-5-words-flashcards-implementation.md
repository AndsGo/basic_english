# Basic English V1.5 Words Flashcards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a picture-first flashcard mode to the Words page with generated local images, flip behavior, word progress saving, and Review integration.

**Architecture:** Keep the current Words list as the default mode and add an isolated `WordFlashcards` component for the single-card practice flow. Store generated bitmap assets under `src/assets/word-flashcards/` and expose them through a small content mapping file. Use the existing `ProgressRepository`, `saveWordProgress`, and `word` ReviewItem domain flow so Words flashcards behave consistently with Today word learning.

**Tech Stack:** React 19, TypeScript, Vite asset imports, Vitest, Testing Library, Playwright, local PNG assets generated with the image generation skill.

---

## File Structure

- Create `src/assets/word-flashcards/*.png`: generated image assets for the first 16 visual words.
- Create `src/content/wordFlashcardImages.ts`: imports image assets and maps `word.id` to image URL.
- Modify `src/domain/review.ts`: add optional `wordId` and `hasActiveWordReviewItem`.
- Modify `src/domain/review.test.ts`: test word review item metadata and duplicate detection.
- Create `src/components/WordFlashcards.tsx`: single-card flashcard practice component.
- Create `src/components/WordFlashcards.test.tsx`: component behavior tests.
- Modify `src/components/WordsPage.tsx`: add `List / Flashcards` modes and repository-backed Know/Review handlers.
- Create `src/components/WordsPage.test.tsx`: Words page integration tests.
- Modify `src/App.tsx`: pass repository and progress refresh callback into `WordsPage`.
- Modify `src/App.test.tsx`: keep existing Words navigation expectations passing and verify Flashcards entry.
- Modify `src/styles.css`: flashcard layout styles.
- Modify `tests/e2e/basic-english.spec.ts`: add flashcard flow to existing Words E2E path.

---

### Task 1: Generated Image Assets and Mapping

**Files:**
- Create: `src/assets/word-flashcards/room.png`
- Create: `src/assets/word-flashcards/home.png`
- Create: `src/assets/word-flashcards/table.png`
- Create: `src/assets/word-flashcards/chair.png`
- Create: `src/assets/word-flashcards/bed.png`
- Create: `src/assets/word-flashcards/door.png`
- Create: `src/assets/word-flashcards/window.png`
- Create: `src/assets/word-flashcards/book.png`
- Create: `src/assets/word-flashcards/phone.png`
- Create: `src/assets/word-flashcards/bag.png`
- Create: `src/assets/word-flashcards/box.png`
- Create: `src/assets/word-flashcards/cup.png`
- Create: `src/assets/word-flashcards/pen.png`
- Create: `src/assets/word-flashcards/paper.png`
- Create: `src/assets/word-flashcards/student.png`
- Create: `src/assets/word-flashcards/friend.png`
- Create: `src/content/wordFlashcardImages.ts`

- [ ] **Step 1: Generate the 16 PNG assets**

Use the image generation skill to generate one simple square learning illustration per word.

Use this shared style for every prompt:

```text
Simple English learning flashcard illustration, square composition, light neutral background, one clear subject, clean soft color palette, no text, no letters, no logos, no brand names, no watermark, child-friendly but not childish.
```

Generate these assets:

```text
room: a simple tidy small room with a bed, table, and window
home: a small friendly house exterior with door and window
table: a simple wooden table centered on a light background
chair: a simple chair centered on a light background
bed: a simple bed with pillow and blanket
door: a simple closed door in a wall
window: a simple window with daylight
book: a closed book and an open book
phone: a simple smartphone without logos or text
bag: a simple school bag or everyday bag
box: a simple cardboard box
cup: a simple cup
pen: a simple pen
paper: a clean sheet of paper with no writing
student: a student holding books, no text
friend: two friendly people standing together, no text
```

Save each output as the exact PNG path listed in the Files section.

- [ ] **Step 2: Create the mapping file**

Create `src/content/wordFlashcardImages.ts`:

```ts
import bagImage from '../assets/word-flashcards/bag.png';
import bedImage from '../assets/word-flashcards/bed.png';
import bookImage from '../assets/word-flashcards/book.png';
import boxImage from '../assets/word-flashcards/box.png';
import chairImage from '../assets/word-flashcards/chair.png';
import cupImage from '../assets/word-flashcards/cup.png';
import doorImage from '../assets/word-flashcards/door.png';
import friendImage from '../assets/word-flashcards/friend.png';
import homeImage from '../assets/word-flashcards/home.png';
import paperImage from '../assets/word-flashcards/paper.png';
import penImage from '../assets/word-flashcards/pen.png';
import phoneImage from '../assets/word-flashcards/phone.png';
import roomImage from '../assets/word-flashcards/room.png';
import studentImage from '../assets/word-flashcards/student.png';
import tableImage from '../assets/word-flashcards/table.png';
import windowImage from '../assets/word-flashcards/window.png';

export const wordFlashcardImages: Partial<Record<string, string>> = {
  bag: bagImage,
  bed: bedImage,
  book: bookImage,
  box: boxImage,
  chair: chairImage,
  cup: cupImage,
  door: doorImage,
  friend: friendImage,
  home: homeImage,
  paper: paperImage,
  pen: penImage,
  phone: phoneImage,
  room: roomImage,
  student: studentImage,
  table: tableImage,
  window: windowImage,
};
```

- [ ] **Step 3: Verify asset imports build**

Run:

```bash
npm run build
```

Expected: build passes and Vite accepts PNG imports.

- [ ] **Step 4: Commit Task 1**

```bash
git add src/assets/word-flashcards src/content/wordFlashcardImages.ts
git commit -m "feat: add word flashcard image assets"
```

---

### Task 2: Word Review Duplicate Helper

**Files:**
- Modify: `src/domain/review.ts`
- Modify: `src/domain/review.test.ts`

- [ ] **Step 1: Add failing domain tests**

Add to `src/domain/review.test.ts`:

```ts
import { createWordReviewItem, hasActiveWordReviewItem, resolveReviewItem } from './review';

describe('word review duplicate detection', () => {
  it('stores word id on word review items', () => {
    const item = createWordReviewItem({
      wordId: 'room',
      wordText: 'room',
      sourceDayId: 'words-page',
      now: '2026-05-28T00:00:00.000Z',
    });

    expect(item).toMatchObject({
      id: 'review-word-words-page-room',
      type: 'word',
      sourceDayId: 'words-page',
      sourceStepId: 'words',
      wordId: 'room',
      prompt: 'room',
      status: 'active',
    });
  });

  it('detects active word review items by stored word id or legacy stable id', () => {
    const activeItem = createWordReviewItem({
      wordId: 'room',
      wordText: 'room',
      sourceDayId: 'words-page',
      now: '2026-05-28T00:00:00.000Z',
    });
    const legacyItem = { ...activeItem, id: 'review-word-day-008-table', wordId: undefined, prompt: 'table' };
    const knownItem = resolveReviewItem(activeItem, '2026-05-28T00:01:00.000Z');

    expect(hasActiveWordReviewItem([activeItem], 'room')).toBe(true);
    expect(hasActiveWordReviewItem([legacyItem], 'table')).toBe(true);
    expect(hasActiveWordReviewItem([knownItem], 'room')).toBe(false);
    expect(hasActiveWordReviewItem([activeItem], 'book')).toBe(false);
  });
});
```

- [ ] **Step 2: Run review tests and confirm failure**

Run:

```bash
npm test -- src/domain/review.test.ts
```

Expected: fail because `wordId` metadata and `hasActiveWordReviewItem` do not exist.

- [ ] **Step 3: Implement word metadata and helper**

In `src/domain/review.ts`, add optional `wordId` to `ReviewItem`:

```ts
wordId?: string;
```

Update `createWordReviewItem` return object:

```ts
wordId,
```

Add helper near `hasActiveSceneRemixReviewItem`:

```ts
export function hasActiveWordReviewItem(items: ReviewItem[], wordId: string): boolean {
  return items.some(
    (item) =>
      item.type === 'word' &&
      item.status === 'active' &&
      (item.wordId === wordId || item.id.endsWith(`-${wordId}`)),
  );
}
```

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- src/domain/review.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/domain/review.ts src/domain/review.test.ts
git commit -m "feat: detect active word review items"
```

---

### Task 3: WordFlashcards Component

**Files:**
- Create: `src/components/WordFlashcards.tsx`
- Create: `src/components/WordFlashcards.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add failing component tests**

Create `src/components/WordFlashcards.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Word } from '../domain/types';
import { SpeechProvider } from '../speech/SpeechProvider';
import { WordFlashcards } from './WordFlashcards';

const words: Word[] = [
  {
    id: 'name',
    text: 'name',
    category: 'general_thing',
    definition: 'what a person is called',
    chinese: '名字',
    example: 'My name is Li.',
    weekIntroduced: 1,
    tags: ['identity'],
  },
  {
    id: 'room',
    text: 'room',
    category: 'picturable_thing',
    definition: 'a part of a house',
    chinese: '房间',
    example: 'My room is small.',
    weekIntroduced: 2,
    tags: ['home'],
  },
];

const speechService = {
  isSupported: () => true,
  speak: vi.fn(() => null),
  stop: vi.fn(),
};

function renderWithSpeech(ui: ReactNode) {
  return render(
    <SpeechProvider enabled rate="normal" service={speechService}>
      {ui}
    </SpeechProvider>,
  );
}

describe('WordFlashcards', () => {
  it('shows image-backed words first on the front side', () => {
    renderWithSpeech(<WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'room flashcard illustration' })).toHaveAttribute('src', '/room.png');
    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.queryByText('a part of a house')).not.toBeInTheDocument();
  });

  it('flips to definition and example with optional Chinese hidden by default', async () => {
    renderWithSpeech(<WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('a part of a house')).toBeInTheDocument();
    expect(screen.getByText('My room is small.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Read word room' })).toBeInTheDocument();
    expect(screen.queryByText('Chinese: 房间')).not.toBeInTheDocument();
  });

  it('shows Chinese on the back when enabled', async () => {
    renderWithSpeech(
      <WordFlashcards
        words={words}
        imageByWordId={{ room: '/room.png' }}
        showChineseHelp
        onKnow={vi.fn()}
        onReview={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText('Chinese: 房间')).toBeInTheDocument();
  });

  it('saves review feedback and keeps the learner in the deck', async () => {
    const onReview = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(<WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={onReview} />);

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));

    expect(onReview).toHaveBeenCalledWith(words[1]);
    expect(await screen.findByText('Added to Review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
  });

  it('saves known feedback', async () => {
    const onKnow = vi.fn().mockResolvedValue(undefined);
    renderWithSpeech(<WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={onKnow} onReview={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Know' }));

    expect(onKnow).toHaveBeenCalledWith(words[1]);
    expect(await screen.findByText('Marked Known')).toBeInTheDocument();
  });

  it('navigates next and previous, resetting to the front side', async () => {
    renderWithSpeech(<WordFlashcards words={words} imageByWordId={{ room: '/room.png' }} onKnow={vi.fn()} onReview={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('heading', { name: 'name' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    expect(screen.queryByText('what a person is called')).not.toBeInTheDocument();
    expect(screen.getByText('No image yet')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(screen.getByRole('heading', { name: 'room' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run component tests and confirm failure**

Run:

```bash
npm test -- src/components/WordFlashcards.test.tsx
```

Expected: fail because `WordFlashcards` does not exist.

- [ ] **Step 3: Implement `WordFlashcards`**

Create `src/components/WordFlashcards.tsx`:

```tsx
import { useMemo, useState } from 'react';
import type { Word } from '../domain/types';
import { SpeechButton } from './SpeechButton';

type FlashcardFeedback = 'review' | 'known' | 'error' | null;

export function WordFlashcards({
  words,
  imageByWordId = {},
  showChineseHelp = false,
  onKnow,
  onReview,
}: {
  words: Word[];
  imageByWordId?: Partial<Record<string, string>>;
  showChineseHelp?: boolean;
  onKnow: (word: Word) => void | Promise<void>;
  onReview: (word: Word) => void | Promise<void>;
}) {
  const queue = useMemo(
    () =>
      [...words].sort((a, b) => {
        const aHasImage = Boolean(imageByWordId[a.id]);
        const bHasImage = Boolean(imageByWordId[b.id]);
        if (aHasImage === bHasImage) return 0;
        return aHasImage ? -1 : 1;
      }),
    [imageByWordId, words],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [feedback, setFeedback] = useState<FlashcardFeedback>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentWord = queue[currentIndex];

  if (!currentWord) {
    return <p>No words yet.</p>;
  }

  const image = imageByWordId[currentWord.id];

  const moveTo = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setIsBackVisible(false);
    setFeedback(null);
  };

  const save = async (action: 'known' | 'review') => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (action === 'known') {
        await onKnow(currentWord);
        setFeedback('known');
      } else {
        await onReview(currentWord);
        setFeedback('review');
      }
    } catch {
      setFeedback('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="word-flashcards" aria-label="Word flashcards">
      <div className="flashcard-toolbar">
        <span>{currentIndex + 1} / {queue.length}</span>
      </div>
      <article className="flashcard">
        {!isBackVisible ? (
          <div className="flashcard-front">
            {image ? (
              <img src={image} alt={`${currentWord.text} flashcard illustration`} className="flashcard-image" />
            ) : (
              <div className="flashcard-image flashcard-image--fallback">No image yet</div>
            )}
            <h3>{currentWord.text}</h3>
          </div>
        ) : (
          <div className="flashcard-back">
            <h3>{currentWord.text}</h3>
            <p>
              {currentWord.definition}
              <SpeechButton text={currentWord.definition} label={`Read definition for ${currentWord.text}`} />
            </p>
            {showChineseHelp && <p className="muted">Chinese: {currentWord.chinese}</p>}
            <p className="example">
              {currentWord.example}
              <SpeechButton text={currentWord.example} label={`Read example for ${currentWord.text}`} />
            </p>
            <SpeechButton text={currentWord.text} label={`Read word ${currentWord.text}`} />
            <div className="card-actions">
              <button type="button" className="secondary-button" onClick={() => void save('review')} disabled={isSaving}>
                Review
              </button>
              <button type="button" className="secondary-button" onClick={() => void save('known')} disabled={isSaving}>
                Know
              </button>
            </div>
          </div>
        )}
      </article>
      {feedback === 'review' && <p className="selection-status">Added to Review</p>}
      {feedback === 'known' && <p className="selection-status">Marked Known</p>}
      {feedback === 'error' && <p className="requirement-list">Could not save. Try again.</p>}
      <div className="card-actions">
        <button type="button" className="secondary-button" onClick={() => moveTo(currentIndex - 1)} disabled={currentIndex === 0}>
          Previous
        </button>
        <button type="button" className="secondary-button" onClick={() => setIsBackVisible((current) => !current)}>
          Flip
        </button>
        <button type="button" className="secondary-button" onClick={() => moveTo(currentIndex + 1)} disabled={currentIndex === queue.length - 1}>
          Next
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add styles**

Append to `src/styles.css`:

```css
.word-flashcards {
  display: grid;
  gap: 12px;
}

.flashcard-toolbar {
  display: flex;
  justify-content: flex-end;
  color: #496454;
  font-weight: 700;
}

.flashcard {
  display: grid;
  min-height: 360px;
  border: 1px solid #e5dfd1;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.flashcard-front,
.flashcard-back {
  display: grid;
  gap: 14px;
  align-content: center;
  padding: 18px;
}

.flashcard-front {
  text-align: center;
}

.flashcard-image {
  width: min(100%, 420px);
  aspect-ratio: 1;
  justify-self: center;
  border-radius: 8px;
  object-fit: cover;
  background: #f4f7fb;
}

.flashcard-image--fallback {
  display: grid;
  place-items: center;
  border: 1px dashed #cfc7b8;
  color: #496454;
  font-weight: 800;
}
```

- [ ] **Step 5: Run component tests and build**

Run:

```bash
npm test -- src/components/WordFlashcards.test.tsx
npm run build
```

Expected: both pass.

- [ ] **Step 6: Commit Task 3**

```bash
git add src/components/WordFlashcards.tsx src/components/WordFlashcards.test.tsx src/styles.css
git commit -m "feat: add word flashcards component"
```

---

### Task 4: WordsPage and App Integration

**Files:**
- Modify: `src/components/WordsPage.tsx`
- Create: `src/components/WordsPage.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add failing WordsPage tests**

Create `src/components/WordsPage.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { week1Course } from '../content/week1';
import type { ReviewItem } from '../domain/review';
import { SpeechProvider } from '../speech/SpeechProvider';
import type { ProgressRepository, WordProgress } from '../storage/progressRepository';
import { WordsPage } from './WordsPage';

const speechService = {
  isSupported: () => true,
  speak: vi.fn(() => null),
  stop: vi.fn(),
};

function renderWithSpeech(ui: ReactNode) {
  return render(
    <SpeechProvider enabled rate="normal" service={speechService}>
      {ui}
    </SpeechProvider>,
  );
}

function createRepository(): ProgressRepository {
  const wordProgress: WordProgress[] = [];
  const reviewItems: ReviewItem[] = [];

  return {
    getDayProgress: vi.fn().mockResolvedValue(null),
    listDayProgress: vi.fn().mockResolvedValue([]),
    saveDayProgress: vi.fn().mockResolvedValue(undefined),
    saveStepProgress: vi.fn().mockResolvedValue(undefined),
    saveStepCompletion: vi.fn().mockResolvedValue(undefined),
    listStepCompletions: vi.fn().mockResolvedValue([]),
    saveExerciseAttempt: vi.fn().mockResolvedValue(undefined),
    listExerciseAttempts: vi.fn().mockResolvedValue([]),
    saveSceneRemixAttempt: vi.fn().mockResolvedValue(undefined),
    listSceneRemixAttempts: vi.fn().mockResolvedValue([]),
    saveUserOutput: vi.fn().mockResolvedValue(undefined),
    getUserOutput: vi.fn().mockResolvedValue(null),
    listUserOutputs: vi.fn().mockResolvedValue([]),
    async saveWordProgress(progress) {
      const existingIndex = wordProgress.findIndex((item) => item.id === progress.id);
      if (existingIndex >= 0) {
        wordProgress[existingIndex] = progress;
      } else {
        wordProgress.push(progress);
      }
    },
    async listReviewWords() {
      return wordProgress.filter((progress) => progress.status === 'review' || progress.status === 'seen');
    },
    async saveReviewItem(item) {
      reviewItems.push(item);
    },
    async listReviewItems(status) {
      return reviewItems.filter((item) => (status ? item.status === status : true));
    },
    async getReviewItem(id) {
      return reviewItems.find((item) => item.id === id) ?? null;
    },
    saveStudyActivity: vi.fn().mockResolvedValue(undefined),
    listStudyActivities: vi.fn().mockResolvedValue([]),
  };
}

describe('WordsPage', () => {
  it('defaults to the existing list mode', () => {
    renderWithSpeech(<WordsPage course={week1Course} repository={createRepository()} />);

    expect(screen.getByRole('heading', { name: 'Course Words' })).toBeInTheDocument();
    expect(screen.getByText('what a person is called')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByLabelText('Word flashcards')).not.toBeInTheDocument();
  });

  it('switches to flashcards and renders image-backed content', async () => {
    renderWithSpeech(
      <WordsPage
        course={week1Course}
        repository={createRepository()}
        imageByWordId={{ student: '/student.png' }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));

    expect(screen.getByLabelText('Word flashcards')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'student flashcard illustration' })).toBeInTheDocument();
  });

  it('shows Chinese help on the flashcard back when enabled', async () => {
    renderWithSpeech(
      <WordsPage
        course={week1Course}
        repository={createRepository()}
        imageByWordId={{ name: '/name.png' }}
        showChineseHelp
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));

    expect(screen.getByText(/Chinese:/)).toBeInTheDocument();
  });

  it('saves known word progress from flashcards', async () => {
    const repository = createRepository();
    const onProgressChange = vi.fn();
    renderWithSpeech(
      <WordsPage
        course={week1Course}
        repository={repository}
        imageByWordId={{ name: '/name.png' }}
        onProgressChange={onProgressChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Know' }));

    await waitFor(async () => {
      await expect(repository.listReviewWords()).resolves.toHaveLength(0);
    });
    expect(onProgressChange).toHaveBeenCalled();
    expect(screen.getByText('Marked Known')).toBeInTheDocument();
  });

  it('saves review word progress and creates one active review item', async () => {
    const repository = createRepository();
    renderWithSpeech(
      <WordsPage
        course={week1Course}
        repository={repository}
        imageByWordId={{ name: '/name.png' }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Flashcards' }));
    await userEvent.click(screen.getByRole('button', { name: 'Flip' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review' }));

    expect(await repository.listReviewWords()).toHaveLength(1);
    const activeReviews = await repository.listReviewItems('active');
    expect(activeReviews).toHaveLength(1);
    expect(activeReviews[0]).toMatchObject({ type: 'word', wordId: 'name', prompt: 'name', sourceDayId: 'words-page' });
    expect(screen.getByText('Added to Review')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run WordsPage tests and confirm failure**

Run:

```bash
npm test -- src/components/WordsPage.test.tsx
```

Expected: fail because `WordsPage` does not accept repository or render flashcards.

- [ ] **Step 3: Implement WordsPage integration**

Replace `src/components/WordsPage.tsx` with:

```tsx
import { useState } from 'react';
import { wordFlashcardImages } from '../content/wordFlashcardImages';
import type { Course, Word } from '../domain/types';
import { createWordReviewItem, hasActiveWordReviewItem } from '../domain/review';
import type { ProgressRepository } from '../storage/progressRepository';
import { SpeechButton } from './SpeechButton';
import { WordFlashcards } from './WordFlashcards';

type WordsMode = 'list' | 'flashcards';

export function WordsPage({
  course,
  repository,
  showChineseHelp = false,
  imageByWordId = wordFlashcardImages,
  onProgressChange,
}: {
  course: Course;
  repository: ProgressRepository;
  showChineseHelp?: boolean;
  imageByWordId?: Partial<Record<string, string>>;
  onProgressChange?: () => void;
}) {
  const [mode, setMode] = useState<WordsMode>('list');

  const saveWordMark = async (word: Word, status: 'known' | 'review') => {
    const now = new Date().toISOString();
    await repository.saveWordProgress({
      id: word.id,
      wordId: word.id,
      status,
      seenCount: 1,
      correctCount: status === 'known' ? 1 : 0,
      lastSeenAt: now,
      updatedAt: now,
    });

    if (status === 'review') {
      const activeItems = await repository.listReviewItems('active');
      if (!hasActiveWordReviewItem(activeItems, word.id)) {
        await repository.saveReviewItem(createWordReviewItem({ wordId: word.id, wordText: word.text, sourceDayId: 'words-page', now }));
      }
    }

    onProgressChange?.();
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Course Words</h2>
        <div className="segmented-control" aria-label="Words view mode">
          <button type="button" className={`secondary-button${mode === 'list' ? ' selected-button' : ''}`} aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
            List
          </button>
          <button type="button" className={`secondary-button${mode === 'flashcards' ? ' selected-button' : ''}`} aria-pressed={mode === 'flashcards'} onClick={() => setMode('flashcards')}>
            Flashcards
          </button>
        </div>
      </div>
      {mode === 'flashcards' ? (
        <WordFlashcards
          words={course.words}
          imageByWordId={imageByWordId}
          showChineseHelp={showChineseHelp}
          onKnow={(word) => saveWordMark(word, 'known')}
          onReview={(word) => saveWordMark(word, 'review')}
        />
      ) : (
        <div className="word-bank">
          {course.words.map((word) => (
            <article className="word-bank-item" key={word.id}>
              <strong>
                {word.text}
                <SpeechButton text={word.text} label={`Read word ${word.text}`} />
              </strong>
              <span>
                {word.definition}
                <SpeechButton text={word.definition} label={`Read definition for ${word.text}`} />
              </span>
              {showChineseHelp && <span>Chinese: {word.chinese}</span>}
              <small>
                {word.example}
                <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
```

If `section-header` or `segmented-control` already exists, reuse the existing names. If not, add minimal CSS in this task:

```css
.section-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.segmented-control {
  display: inline-flex;
  gap: 8px;
}
```

- [ ] **Step 4: Wire App**

In `src/App.tsx`, change:

```tsx
{activeTab === 'words' && <WordsPage course={basicEnglishCourse} showChineseHelp={showChineseHelp} />}
```

to:

```tsx
{activeTab === 'words' && (
  <WordsPage
    course={basicEnglishCourse}
    repository={repository}
    showChineseHelp={showChineseHelp}
    onProgressChange={() => void refreshProgressSummary()}
  />
)}
```

- [ ] **Step 5: Update App test**

In `src/App.test.tsx`, in the Words navigation test, after the existing word bank assertions add:

```ts
expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
expect(screen.getByRole('button', { name: 'Flashcards' })).toBeInTheDocument();
```

- [ ] **Step 6: Run integration tests**

Run:

```bash
npm test -- src/components/WordsPage.test.tsx src/App.test.tsx
npm run build
```

Expected: both pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add src/components/WordsPage.tsx src/components/WordsPage.test.tsx src/App.tsx src/App.test.tsx src/styles.css
git commit -m "feat: add words flashcard mode"
```

---

### Task 5: E2E and Final Verification

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Add E2E coverage**

In `tests/e2e/basic-english.spec.ts`, in the existing test `navigates course and word bank views with configurable Chinese help`, after the first Words list assertions add:

```ts
await expect(page.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
await page.getByRole('button', { name: 'Flashcards' }).click();
await expect(page.getByLabel('Word flashcards')).toBeVisible();
await expect(page.getByRole('img', { name: /flashcard illustration/ }).first()).toBeVisible();
await page.getByRole('button', { name: 'Flip' }).click();
await expect(page.getByRole('button', { name: 'Review' })).toBeVisible();
await page.getByRole('button', { name: 'Review' }).click();
await expect(page.getByText('Added to Review')).toBeVisible();
await page.getByRole('button', { name: 'List' }).click();
```

Keep the later Chinese help checks. After Chinese help is enabled and Words is opened again, switch to Flashcards and assert Chinese appears on the back:

```ts
await page.getByRole('button', { name: 'Flashcards' }).click();
await page.getByRole('button', { name: 'Flip' }).click();
await expect(page.getByText(/Chinese:/).first()).toBeVisible();
await page.getByRole('button', { name: 'List' }).click();
```

Adjust Review count expectations only if the test now intentionally adds one word review item. Prefer checking the Review page heading rather than a fixed count in this test.

- [ ] **Step 2: Run targeted E2E**

Run:

```bash
npm run test:e2e -- --grep "word bank views"
```

Expected: pass in Chromium and mobile Chrome projects.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all pass.

- [ ] **Step 4: Commit Task 5**

```bash
git add tests/e2e/basic-english.spec.ts
git commit -m "test: cover words flashcards e2e"
```

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git diff --stat origin/main..HEAD
git status --short
```

Expected: changes are limited to V1.5 Words Flashcards assets, code, styles, tests, and docs. Working tree is clean.

---

## Acceptance Checklist

- [ ] Words page keeps current list behavior by default.
- [ ] Flashcards mode can be entered from Words.
- [ ] First 16 visual words have generated local PNG images.
- [ ] Image-backed cards show images.
- [ ] Non-image words show fallback cards.
- [ ] Card front shows image and word.
- [ ] Card back shows definition, example, speech controls, and optional Chinese.
- [ ] `Know` writes known word progress and shows `Marked Known`.
- [ ] `Review` writes review word progress, creates one active word ReviewItem, and shows `Added to Review`.
- [ ] Duplicate active word ReviewItems are prevented for repeated Review clicks.
- [ ] Flashcard navigation works and resets to the front side.
- [ ] Existing Today Words flow still works.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes.
