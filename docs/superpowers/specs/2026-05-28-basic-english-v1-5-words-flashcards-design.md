# Basic English V1.5 Words Flashcards Design

## Purpose

V1.5 adds a picture-first flashcard mode to the Words page.

The learning goal remains:

> Learners can use Basic English to describe common daily-life scenes and express simple personal ideas.

The Words page currently works as a word bank. V1.5 keeps that list intact and adds a focused practice mode:

```text
See image + word -> flip -> read English meaning and example -> mark Know or Review -> next card
```

This makes word review more visual while keeping the all-English learning environment.

## Scope

### Build in V1.5

- `List / Flashcards` mode switch on the Words page.
- Single-card flashcard practice mode.
- Generated local images for the first 16 visual words.
- Fallback text card for words without images.
- Flip interaction to show definition, example, speech buttons, and optional Chinese.
- `Know` and `Review` actions connected to existing word progress storage.
- Visible feedback after `Know` or `Review`.
- Tests for Words page mode switching, image/fallback rendering, flip behavior, Chinese help, progress actions, and E2E coverage.

### Do Not Build in V1.5

- Spaced repetition scheduling changes.
- Random shuffle.
- Category filters.
- Hide-word recall mode.
- Bulk image generation for all 850 Basic English words.
- AI-generated definitions or examples.
- New backend or cloud sync.

## Product Behavior

### Entry

The Words page gets a top mode switch:

```text
List | Flashcards
```

Default mode remains `List`, preserving current behavior.

### Flashcard Front

The front of a card shows:

- generated illustration if available.
- word text.
- `Flip` button.
- `Previous` and `Next` navigation.
- progress label such as `3 / 58`.

V1 shows the word on the front by default. A future version may add `Hide word`.

### Flashcard Back

After `Flip`, the back shows:

- English definition.
- English example sentence.
- speech buttons for word, definition, and example.
- Chinese only when `showChineseHelp` is enabled.
- actions:
  - `Review`
  - `Know`
  - `Next`

`Review` displays visible feedback:

```text
Added to Review
```

`Know` displays visible feedback:

```text
Marked Known
```

Neither action navigates away from Words. The learner stays in the flashcard flow.

## Initial Image Set

V1.5 ships 16 generated image assets:

```text
room
home
table
chair
bed
door
window
book
phone
bag
box
cup
pen
paper
student
friend
```

These words were chosen because they are common in Week 1-2 and can be represented clearly with simple images.

Abstract and structure words such as `am`, `my`, `because`, and `from` do not receive forced symbolic art in V1. They appear as text fallback cards.

## Image Style

Images should be generated as local assets.

Style requirements:

- simple learning illustration.
- light neutral background.
- one clear object or simple daily-life scene.
- consistent square or near-square composition.
- no English or Chinese text inside the image.
- no logos, brands, or busy backgrounds.

Recommended path:

```text
src/assets/word-flashcards/<word-id>.png
```

Recommended mapping:

```ts
export const wordFlashcardImages: Partial<Record<string, string>> = {
  room: roomImage,
  book: bookImage,
};
```

## Queue Rules

Flashcards use all course words.

Ordering:

1. words with generated images.
2. remaining words as text fallback cards.

Navigation:

- `Previous` goes to the previous card and is disabled on the first card.
- `Next` goes to the next card and is disabled on the last card.
- changing card resets to the front side.
- progress label shows current position and total count.

No shuffle or filters are included in V1.5.

## Data Flow

`WordsPage` needs repository access so flashcard actions can update word progress.

Recommended prop change:

```ts
export function WordsPage({
  course,
  repository,
  showChineseHelp = false,
  onProgressChange,
}: {
  course: Course;
  repository: ProgressRepository;
  showChineseHelp?: boolean;
  onProgressChange?: () => void;
})
```

Actions:

```text
Know -> saveWordProgress(status: 'known')
Review -> saveWordProgress(status: 'review') + create a word ReviewItem
```

Use timestamps consistent with Today word learning.

When a word is marked `Review` from Words Flashcards, V1.5 should also create the existing `word` type `ReviewItem`, using the same domain helper as Today word learning. This keeps the learner's visible feedback honest: after `Added to Review`, the item can appear in the Review page. The implementation should avoid duplicate active word review items for repeated clicks on the same word.

## Components

### WordsPage

Responsibilities:

- keep current list mode.
- hold selected mode state.
- pass data and handlers to flashcard mode.

### WordFlashcards

New focused component.

Responsibilities:

- build image-first queue.
- track current index.
- track front/back side.
- render image or fallback.
- call `onKnow(word)` and `onReview(word)`.
- show feedback after actions.

### WordFlashcardImage Mapping

New content/asset mapping file.

Responsibilities:

- centralize which word ids have local image assets.
- let the UI check image availability without guessing filenames.

## Error Handling

- If an image import is missing, the build should fail. This is preferable to a silent broken image for shipped assets.
- If a word has no image mapping, show the text fallback card.
- If saving word progress fails, keep the learner on the current card and show a small error message such as:

```text
Could not save. Try again.
```

- If the course has no words, show the existing empty-state style if present, or a simple message:

```text
No words yet.
```

## Testing

### Unit / Component Tests

Cover `WordsPage` and `WordFlashcards`:

- Words page defaults to list mode.
- switching to Flashcards shows the single-card experience.
- an image-backed word renders an image.
- a non-image word renders text fallback.
- `Flip` shows definition and example.
- Chinese text is hidden by default.
- Chinese text appears when `showChineseHelp` is true.
- `Know` saves known progress and shows `Marked Known`.
- `Review` saves review progress, creates a word review item, and shows `Added to Review`.
- `Next` and `Previous` change cards and reset to the front side.
- Today word learning tests continue to pass.

### E2E

Add a small E2E path:

1. Open Words.
2. Confirm list mode still shows the word bank.
3. Switch to Flashcards.
4. See a generated image card.
5. Flip the card.
6. Mark Review and see `Added to Review`.

## Acceptance Criteria

V1.5 is complete when:

- Words page keeps current list behavior by default.
- Flashcards mode can be entered from Words.
- first 16 visual words have generated local images.
- image-backed cards show images.
- non-image words show fallback cards.
- card front shows image and word.
- card back shows definition, example, speech controls, and optional Chinese.
- `Know` writes known word progress.
- `Review` writes review word progress, creates a word review item, and shows `Added to Review`.
- flashcard navigation works.
- existing Today Words flow still works.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.

## Future Ideas

- Hide-word recall mode.
- shuffle.
- category filters.
- image coverage for more Basic English picturable words.
- daily flashcard streak.
- progress stats on Me page.
