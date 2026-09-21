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

### Semantic Teaching Components

These rules apply when a word's meaning needs context, comparison, or a relationship that a single illustration cannot explain. Frequency words such as `always` are adverbs, not prepositions.

- Keep `visualStyle` as image metadata; it is not a part-of-speech or teaching-method classification. Model a teaching presentation separately when implementing it.
- Existing keyword-only grammar images are legacy assets, not the quality standard for new or revised learning presentations. A keyword alone does not explain meaning.
- Combine approved cartoon artwork with semantic HTML for records, comparisons, short English explanations, and example sentences. Do not bake this text or these diagrams into raster artwork.
- Page-level records, timelines, labels, and relationship indicators are permitted when they explain the target meaning. This permission does not relax the image rules above or the Picture Describe Scene Rules below.
- Keep English as the default. Chinese help must follow the existing user setting and must never be embedded in images.
- Bind each presentation to the word's taught sense, definition, and example. Do not reuse an image merely because its subject is related; shared artwork is acceptable only when the complete presentation accurately distinguishes each target meaning.
- Do not require a picture-only explanation for articles, auxiliaries, or logical relationships. Use short contextual sentences when needed, with vocabulary checked through the project's existing content validation policy.

Choose the presentation by meaning:

| Meaning | Examples | Presentation |
| --- | --- | --- |
| Concrete object | book, key | One recognizable cartoon object. |
| Action or state | walk, happy | A clear action or state in a daily-life scene. |
| Spatial relationship | under, between | Consistent concrete objects with the target placement made clear. |
| Frequency | always, usually, often, sometimes, never | The same action across comparable occasions, with an English summary. |
| Quantity or scope | all, some, every | A concrete group showing the relevant whole, subset, or each member. |
| Degree or comparison | very, more, than | Comparable objects or situations with the relevant difference isolated. |
| Cause, condition, or result | because, if, so | Related situations plus a short sentence clarifying the logical relationship. |
| Reference or ownership | my, your, this, that | Explicit speaker, owner, or distance context. |
| Article or auxiliary | a, the, be, will | Short contextual sentence examples with supporting artwork where useful. |

#### Frequency Pilot Acceptance Examples

Use one explicit context, such as having water with breakfast, across comparable breakfast occasions. A sample week illustrates a habit; it does not prove a person's lifetime behavior.

| Word | Required meaning | Illustrative presentation |
| --- | --- | --- |
| always | Every time in the stated context. | The action occurs on every displayed occasion. |
| usually | On most occasions, with exceptions. | Most occasions include the action; some do not. |
| often | Many times; not a fixed proportion. | Repeated occurrences supported by a short contextual explanation. |
| sometimes | On some occasions, not every time. | Some occurrences and some non-occurrences with a contextual explanation. |
| never | Not on any occasion in the stated context. | Every occasion explicitly records that the action did not occur. |

- Never teach fixed percentages or occurrence counts as definitions of `usually`, `often`, or `sometimes`. Their uses overlap; do not grade ambiguous records as having only one possible label.
- A blank record means unknown unless explicitly defined otherwise. Distinguish occurrence, non-occurrence, and missing data using text or accessible symbols as well as color.
- Pilot all five frequency words together before expanding to other semantic families. Retain the sample approval requirement for newly generated artwork.

#### Verification Before Delivery

- Check that the complete presentation communicates meaning beyond repeating the keyword, and that its artwork, records, explanation, and example agree.
- Check related words side by side for misleading distinctions, ambiguous references, and accidental claims of exact frequency.
- Keep word, phonetic text, and playback controls visible. Constrain the media region so it cannot push text out of the card.
- Preserve stable front/back card dimensions and navigation placement on Flip and Previous/Next. Verify desktop and narrow mobile layouts, including long text and enabled Chinese help.
- Provide accessible text for visual records; do not depend only on color, hover, animation, or sound. Respect reduced-motion preferences if animation is added.
- Preserve existing playback, automatic navigation speech, review, and known-word behavior. For UI implementation changes, verify these flows and inspect rendered layouts; documentation-only edits require consistency and diff checks, not claims of completed UI testing.

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
