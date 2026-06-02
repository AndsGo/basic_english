# Basic English V1.7 All Word Images Design

## Goal

Every word in the current course should have a usable flashcard image so the Words page never shows `No image yet` in normal product use. The image system should also define rules that can scale to the future C.K. Ogden Basic English 850-word set.

The learning goal is not decorative coverage. Images should help learners describe daily life scenes in English by making words easier to recall and connect to concrete use.

## Product Decisions

- Use a mixed visual style.
- Concrete object words use clear object or simple environment images.
- Abstract, structure, action, and quality words use small meaning scenes.
- English labels are allowed only when the image meaning would otherwise be unclear.
- Chinese text must not appear in flashcard images.
- The app keeps the `No image yet` fallback as a development safeguard, but tests should prove that current course words all have mapped images.

## Word Image Taxonomy

Each current and future word image should belong to one visual kind:

- `object`: a concrete visible thing, such as `book`, `table`, `phone`, `key`.
- `place`: a visible place or setting, such as `home`, `room`, `China`.
- `person`: a visible person role or relationship, such as `student`, `friend`, `he`, `she`.
- `position`: a spatial relation diagram, such as `in`, `on`, `under`, `near`.
- `quality`: a visible state or quality, such as `happy`, `kind`, `small`, `big`, `clean`, `new`, `old`, `good`, `useful`, `important`.
- `action`: a visible action scene, such as `study`, `learn`, `use`, `have`, `want`.
- `structure`: a grammar or relation cue, such as `I`, `my`, `am`, `from`, `this`, `because`, `every`.
- `time`: a time cue, such as `day`.
- `abstract`: a general idea or container concept, such as `thing`, `question`, `English`, `name`, `money`, `card`, `paper`.

The taxonomy is content metadata, not UI text. It exists so image coverage can be tested and future image generation can follow consistent prompts.

## Current Course Coverage

The current course has 53 words across Week 1 and Week 2. Sixteen already have flashcard images:

`bag`, `bed`, `book`, `box`, `chair`, `cup`, `door`, `friend`, `home`, `paper`, `pen`, `phone`, `room`, `student`, `table`, `window`

The missing words should receive images:

`name`, `my`, `i`, `am`, `from`, `china`, `happy`, `have`, `question`, `this`, `he`, `she`, `kind`, `study`, `english`, `because`, `want`, `learn`, `thing`, `in`, `on`, `under`, `near`, `small`, `big`, `clean`, `new`, `old`, `useful`, `important`, `good`, `use`, `every`, `day`, `money`, `card`, `key`

## Image Direction

Generated images should be simple, readable at flashcard size, and consistent with the existing friendly learning-product feel.

Concrete nouns:

- Use a centered object or a simple real-life setting.
- Avoid clutter, extra labels, or unrelated objects.

Position words:

- Use a repeated visual system, preferably the same object and table/box relationship.
- The target relation may appear as a small English label.

Structure and abstract words:

- Use a mini scene with the target word visible only when needed.
- Avoid Chinese and avoid dense explanatory text.
- Prefer scenes that can form a Basic English sentence in the learner's mind.

Quality and action words:

- Show a human or object state that makes the meaning clear.
- Keep the scene direct enough that the learner can describe it with simple English.

## Architecture

Add a content module for word image metadata. It should export image coverage in a structured form, then derive the current `wordFlashcardImages` mapping from that structure.

Suggested shape:

```ts
export type WordImageKind =
  | 'object'
  | 'place'
  | 'person'
  | 'position'
  | 'quality'
  | 'action'
  | 'structure'
  | 'time'
  | 'abstract';

export interface WordImageAsset {
  wordId: string;
  image: string;
  kind: WordImageKind;
  labelPolicy: 'none' | 'english-keyword';
  prompt: string;
}
```

`wordFlashcardImages` can stay as the consumer-facing map so `WordsPage` and `WordFlashcards` do not need broad UI changes.

## UI Behavior

Words flashcards continue to show:

- Image on the front side.
- Word text below the image.
- Definition, example, pronunciation, and optional Chinese help on the back side.

Because all current words have images, learners should not normally see `No image yet`. The fallback remains for defensive rendering and future content development.

## Testing

Add content tests that verify:

- Every `course.words` id has a matching image asset.
- Every image asset references an existing course word.
- Every image asset has valid taxonomy metadata.
- No current course flashcard image path is empty.
- The Words flashcard tests still cover the fallback behavior with injected missing images, but product content tests prove the real course has full coverage.

Run the normal verification set:

- `npm test`
- `npm run build`
- `npm run test:e2e`

## Out of Scope

- Planning or generating all 850 Ogden images now.
- Redesigning the Words page layout.
- Adding image editing controls.
- Adding Chinese text to images.
- Replacing existing good word flashcard images unless needed for consistency or quality.

## Completion Criteria

V1.7 is complete when:

- All 53 current course words have mapped flashcard images.
- Missing image assets have been generated and checked into `src/assets/word-flashcards/`.
- The image metadata taxonomy is present and tested.
- The Words page no longer shows `No image yet` with the real course content.
- Unit, build, and E2E verification pass.
