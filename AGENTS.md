# Agent Guidelines

## Image Asset Style Rules

These rules are mandatory for any future agent that creates or replaces image assets in this project.

### Global Image Rules

- Keep generated learning assets square at `512x512` unless a feature spec explicitly requires another size.
- Use a simple, polished cartoon educational style with concrete shapes, soft natural lighting, gentle shadows, and visible volume.
- Use warm, clean, lightly textured neutral backgrounds similar to the existing accepted assets.
- Do not add Chinese text to images.
- Do not add watermarks, signatures, UI chrome, captions, labels, or decorative text unless the asset is explicitly a Grammar Card.
- Do not generate flat vector icons, line-art symbols, stick figures, abstract geometry, emoji-like symbols, or minimal diagram cards as replacements for the word flashcard images.
- Do not use a compression or resizing process that changes the picture content or redraws it into simplified shapes. Compression may only preserve the same visual content.

### Word Flashcard Image Rules

Word flashcard images live under `src/assets/word-flashcards/` and are consumed through `src/content/wordFlashcardImages.ts`.

Use the `visualStyle` metadata as the source of truth:

- `concrete`: show one clear everyday object with cartoon volume and soft shadow. No text.
- `scene`: show a small daily-life cartoon scene that can be described with Basic English. No text.
- `relation`: show a clear spatial relationship using concrete cartoon objects, such as a book and table. No text, no arrows, no labels.
- `grammar`: use a clean educational grammar card. This is the only style that may include the exact English keyword.

For non-grammar word images:

- The image must be understandable without text.
- The subject should be specific and visible, not represented by abstract icons.
- Prefer one main subject or action with minimal clutter.
- Avoid flowcharts, speech bubbles, arrows, symbolic dots, timeline widgets, and generic stick people.

For grammar card images:

- Include only the exact target English keyword, such as `because`.
- Do not include full example sentences unless the product spec explicitly requires them.
- Keep the card style polished and consistent with the rest of the app.

### Picture Describe Scene Rules

Picture describe images live under `src/assets/picture-describe/`.

- Use one complete daily-life scene, not a comic strip, collage, multi-panel grid, or process diagram.
- Keep the scene concrete and easy to describe in Basic English.
- Match the existing accepted Week 1/2 picture style: warm room or daily-life setting, friendly cartoon people, soft shadows, clear objects, and natural perspective.
- Characters may repeat for continuity, but avoid making every new scene look like the same child in the same outfit unless the lesson intentionally follows that character.
- Do not include readable text, Chinese, labels, arrows, or explanatory overlays.

### Required Review Before Replacing Many Images

Before replacing a large batch of images:

1. Generate a small sample set first.
2. Create a contact sheet comparing old accepted images with new candidates.
3. Check for style drift: flatness, line-art, icon-like abstraction, missing shadows, text, labels, collage layout, and inconsistent character design.
4. Only continue the batch after the sample style is approved.

### Preferred Prompt Pattern

For concrete word images:

```text
Create a 512x512 Basic English word flashcard image of <subject>.
Style: simple polished cartoon educational asset, warm neutral background, soft natural light, gentle shadow, clear volume, concrete and easy to recognize.
Composition: centered square composition, generous padding, readable at flashcard size.
Constraints: no text, no Chinese, no watermark, no labels, no arrows, not a flat icon, not line art, not stick figures, not abstract geometry.
```

For scene word images:

```text
Create a 512x512 Basic English word flashcard image showing <meaning> in a simple daily-life scene.
Style: simple polished cartoon educational scene, warm clean background, soft natural light, gentle shadows, concrete people and objects, easy to describe with Basic English.
Composition: one main subject or action, centered, minimal clutter.
Constraints: no visible text, no Chinese, no watermark, no labels, no arrows, not a flat icon card, not a diagram, not stick figures.
```

For picture describe scenes:

```text
Create a 512x512 Basic English picture-description scene showing <scene>.
Style: warm polished cartoon daily-life illustration matching the accepted Week 1/2 picture describe assets, natural perspective, soft shadows, clear objects, friendly characters.
Composition: one complete scene, not a collage or comic strip, readable at learning-card size.
Constraints: no text, no Chinese, no watermark, no labels, no arrows, no speech bubbles, no multi-panel layout.
```
