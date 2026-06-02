# Basic English V1.8 Unified Word Image Style Design

## Goal

Unify the Words flashcard image system so all current course words have a consistent visual language. V1.7 solved image coverage, but the added images are too flat and abstract compared with the older semi-realistic word images. V1.8 should replace all 53 current word images with a coherent style system.

The product goal remains English-first daily-life expression: learners should see an image and be able to recall or produce a simple Basic English sentence about the word.

## Decisions

- Rebuild all 53 word flashcard images, including the older images.
- Keep every image square at `1024x1024`.
- Use a semi-realistic, clear, life-oriented visual style close to the stronger older assets.
- Do not put Chinese text in any image.
- Only Grammar Card images may include English keyword text.
- Concrete, scene, and relation images should not include English word labels.
- Keep the existing Words page UI and flashcard behavior. This release is primarily an asset and metadata upgrade.

## Visual Style Types

### Concrete Visual

Use for directly visible objects. The image should show the object clearly, with simple lighting, little clutter, and no text.

Words:

`book`, `table`, `chair`, `bed`, `door`, `window`, `phone`, `bag`, `box`, `cup`, `pen`, `paper`, `card`, `key`, `money`

### Scene Visual

Use for people, places, actions, qualities, and concept words that are better understood through a small life scene. The image should be semi-realistic and describeable with simple English. No text should appear in the image.

Words:

`room`, `home`, `China`, `student`, `friend`, `he`, `she`, `happy`, `kind`, `study`, `learn`, `want`, `use`, `have`, `small`, `big`, `clean`, `new`, `old`, `useful`, `important`, `good`, `question`, `English`, `thing`, `day`

### Relation Diagram

Use for spatial relation words. The image should use semi-realistic objects to show the relationship clearly. It should avoid text labels unless future testing proves the relation cannot be recognized.

Words:

`in`, `on`, `under`, `near`

### Grammar Card

Use for structure words that are hard to show as concrete scenes. These may include a clean English keyword and a minimal cue. The style should be consistent across grammar cards and should not try to look like a realistic object photo.

Words:

`I`, `my`, `am`, `from`, `this`, `because`, `every`, `name`

## Current Course Mapping

The complete 53-word mapping is:

| Word | Visual Style |
| --- | --- |
| `name` | Grammar Card |
| `my` | Grammar Card |
| `i` | Grammar Card |
| `am` | Grammar Card |
| `from` | Grammar Card |
| `china` | Scene Visual |
| `student` | Scene Visual |
| `happy` | Scene Visual |
| `have` | Scene Visual |
| `question` | Scene Visual |
| `friend` | Scene Visual |
| `this` | Grammar Card |
| `he` | Scene Visual |
| `she` | Scene Visual |
| `kind` | Scene Visual |
| `study` | Scene Visual |
| `english` | Scene Visual |
| `because` | Grammar Card |
| `want` | Scene Visual |
| `learn` | Scene Visual |
| `room` | Scene Visual |
| `home` | Scene Visual |
| `table` | Concrete Visual |
| `chair` | Concrete Visual |
| `bed` | Concrete Visual |
| `door` | Concrete Visual |
| `window` | Concrete Visual |
| `book` | Concrete Visual |
| `phone` | Concrete Visual |
| `bag` | Concrete Visual |
| `box` | Concrete Visual |
| `cup` | Concrete Visual |
| `pen` | Concrete Visual |
| `paper` | Concrete Visual |
| `thing` | Scene Visual |
| `in` | Relation Diagram |
| `on` | Relation Diagram |
| `under` | Relation Diagram |
| `near` | Relation Diagram |
| `small` | Scene Visual |
| `big` | Scene Visual |
| `clean` | Scene Visual |
| `new` | Scene Visual |
| `old` | Scene Visual |
| `useful` | Scene Visual |
| `important` | Scene Visual |
| `good` | Scene Visual |
| `use` | Scene Visual |
| `every` | Grammar Card |
| `day` | Scene Visual |
| `money` | Concrete Visual |
| `card` | Concrete Visual |
| `key` | Concrete Visual |

## Metadata Model

Extend the current word image metadata with a separate visual style field. `kind` can continue to describe semantic type, while `visualStyle` describes how the image should look.

Suggested type:

```ts
export const validWordImageVisualStyles = ['concrete', 'scene', 'relation', 'grammar'] as const;

export type WordImageVisualStyle = (typeof validWordImageVisualStyles)[number];

export interface WordImageAsset {
  wordId: string;
  image: string;
  kind: WordImageKind;
  visualStyle: WordImageVisualStyle;
  labelPolicy: 'none' | 'english-keyword';
  prompt: string;
}
```

Rules:

- `visualStyle: 'grammar'` may use `labelPolicy: 'english-keyword'`.
- `visualStyle: 'concrete'`, `visualStyle: 'scene'`, and `visualStyle: 'relation'` should use `labelPolicy: 'none'`.
- `wordFlashcardImages` remains derived from `wordImageAssets`.

## Sample-First Workflow

Before replacing all 53 images, generate one sample per visual style:

- Concrete Visual sample: `key`
- Scene Visual sample: `study`
- Relation Diagram sample: `under`
- Grammar Card sample: `because`

Only after the samples are accepted should the full image batch be generated. This prevents repeating the V1.7 problem where coverage was correct but style quality was not.

## Testing

Add or update tests so they prove:

- Every current course word has one image asset.
- Every current course word has one visual style.
- Every image asset uses a valid `visualStyle`.
- Non-grammar styles use `labelPolicy: 'none'`.
- Grammar style is the only style allowed to use `labelPolicy: 'english-keyword'`.
- The real course Words page still does not show `No image yet`.

Run:

- `npm test`
- `npm run build`
- `npm run test:e2e`

## Out of Scope

- Changing the Words page layout.
- Adding image comparison UI.
- Generating or mapping the full C.K. Ogden 850 words.
- Adding Chinese labels to images.
- Making all images photorealistic photos. The target is semi-realistic consistency, not strict photography.

## Completion Criteria

V1.8 is complete when:

- Four sample images are generated and accepted.
- All 53 word flashcard images are replaced with the approved unified style system.
- `wordImageAssets` includes `visualStyle` metadata for every word.
- Tests enforce the visual style and label policy rules.
- Unit tests, build, and E2E tests pass.
