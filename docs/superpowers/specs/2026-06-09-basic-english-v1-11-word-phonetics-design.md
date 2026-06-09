# Basic English V1.11 Word Phonetics Design

## Goal

Add British IPA phonetics to every Basic English word display so learners can connect spelling, sound, and meaning in an English-first learning environment.

The learning goal remains: after the course, learners can describe almost all everyday life scenes with Basic English and express their own ideas. Phonetics supports this by making pronunciation visible wherever a learner studies a word.

## Confirmed Product Decisions

- Show phonetics everywhere a word is shown.
- Use British IPA only.
- Always show phonetics by default.
- Do not provide a hide/show setting in V1.11.
- Keep Chinese help controlled by the existing Chinese setting.
- Do not let IPA symbols affect Basic English 850 content validation.

## User Experience

### Words List

Each word row should show:

1. Word text as the primary label.
2. British IPA directly near the word, visually secondary.
3. English definition.
4. Chinese help only when enabled.
5. Example sentence.

Recommended layout:

```text
name
/IPA/
a word by which a person or thing is noted
```

The final IPA spelling should use proper IPA from a reliable dictionary source, not simplified ASCII, once the content data is filled.

### Word Flashcards

The flashcard front should show:

- Image.
- Word.
- British IPA.

The flashcard back should show:

- Word.
- British IPA.
- English definition.
- Chinese help when enabled.
- Example sentence.

Phonetics should not compete with the word title. It should sit below the word in a smaller, quieter text style.

### Today Word Cards

Today word cards should show:

- Word.
- British IPA.
- Existing definition/example/progress controls.

The new text must not make the card controls shift awkwardly or overlap on mobile screens.

## Data Model

Extend the shared `Word` type with:

```ts
phonetic: string;
```

Expected format:

```ts
phonetic: "/IPA/"
```

Rules:

- Use British IPA.
- Include leading and trailing slashes.
- Keep one primary pronunciation per word in V1.11.
- Do not include Chinese, explanatory labels, or alternative pronunciations in the field.

## Content Source Strategy

V1.11 should add phonetics to all existing word content files.

Preferred process:

1. Add the `phonetic` field to every word.
2. Use British IPA from a reliable dictionary source.
3. Review common Basic English words manually where spelling-to-sound is irregular.
4. Keep a short review note for any uncertain pronunciation.

If a word has multiple common British pronunciations, choose the common learner-friendly form unless the app later adds accent variants.

## Validation Rules

`validateContent` should continue checking that English learning content stays within Basic English 850 rules, but IPA must not be treated as normal English text.

Required validation behavior:

- `word.text`, `definition`, `example`, patterns, and story content remain checked as before.
- `word.phonetic` is validated as phonetic metadata, not Basic English prose.
- `word.phonetic` must exist for every word.
- `word.phonetic` must be wrapped in `/.../`.
- Empty phonetic strings should fail validation.

Recommended regex-level check:

```ts
phonetic.startsWith("/") && phonetic.endsWith("/") && phonetic.length > 2
```

Do not over-validate every IPA symbol in V1.11 because dictionary formats may include stress marks and length marks.

## UI Rules

- Add a small reusable `PhoneticText` component if it keeps styling consistent across Words, Flashcards, and Today cards.
- Style phonetics with muted text color and smaller font size than the word.
- Keep letter spacing at `0`.
- Do not use a pill/chip if it creates unnecessary visual noise.
- Keep phonetics readable on mobile.
- Speech buttons remain tied to the word, definition, and example. Phonetic text itself does not need a separate speech button in V1.11.

## Accessibility

- IPA text should be visible text, not hidden in a tooltip.
- Avoid adding redundant screen-reader labels unless the visual text is ambiguous.
- If a reusable component is used, it may expose `aria-label="British pronunciation: ..."` only if screen-reader output is useful and not repetitive.

## Testing Plan

### Unit and Component Tests

- `WordsPage` shows phonetics for words in list mode.
- `WordsPage` still hides Chinese when Chinese help is off.
- `WordsPage` still shows phonetics when Chinese help is off.
- `WordFlashcards` shows phonetics on the front.
- `WordFlashcards` shows phonetics on the back.
- Today word card component shows phonetics if it renders word details directly.

### Content Validation Tests

- Every word must have a non-empty `phonetic`.
- `phonetic` must start and end with `/`.
- `validateContent` must not report IPA symbols as Basic English 850 violations.

### E2E Tests

- Open Words page and confirm a visible word has IPA under or near the word.
- Open a flashcard and confirm IPA is visible before and after flip.
- Open Today flow and confirm IPA appears on word-learning cards.
- Confirm Chinese help off does not hide IPA.

## Non-Goals

- No American IPA in V1.11.
- No accent switcher in V1.11.
- No audio changes in V1.11.
- No per-word pronunciation drill in V1.11.
- No phonics lesson system in V1.11.

## Risks

- IPA accuracy matters. Incorrect phonetics would create wrong pronunciation habits.
- Some words have multiple accepted British pronunciations.
- Adding text to cards may cause spacing issues on small screens.
- Basic English validation may need careful adjustment so IPA is required but not interpreted as prose.

## Rollout Checklist

- Add `phonetic` to the `Word` type.
- Add phonetics to all current week content.
- Update content validation.
- Update Words list UI.
- Update Flashcards UI.
- Update Today word card UI.
- Add focused tests.
- Run full validation, unit tests, E2E, and production build.
