# Basic English Learning Workspace UI Design

**Date:** 2026-09-14

## Purpose

Turn the current multi-page course interface into a calm, English-first learning workspace. The design must help a learner understand today's outcome, continue with one clear action, and see course progress without burying the active lesson under future content.

The visual direction is **Calm Learning Studio**: warm neutral surfaces, restrained forest green, intentional typography, and focused learning cards. It is not a game UI and does not depend on high-energy rewards or decorative illustration.

## Product Structure

Today is the primary workspace. Words, Review, Course, and Me support the daily session rather than competing with it.

| Area | Primary job | First-screen content |
| --- | --- | --- |
| Today | Start or continue one daily session | Day identity, outcome, progress, grouped lesson path, one primary action |
| Words | Learn or revisit individual vocabulary | Flashcard, listening, confidence choice, navigation |
| Review | Complete items that are due | Due count, time estimate, one start action |
| Course | Understand the complete learning journey | Current week, days, completion and lock states |
| Me | Inspect personal progress and alter preferences | Key numbers, scenario capability states, settings |

## Today Workspace

### Header

The header shows the current `Day N`, scenario title, week, overall completion (`N / totalDays`), and an optional active-streak signal. It includes a slim progress indicator. It must not use build-stage copy such as `MVP`.

### Outcome Card

The first card states one practical ability in plain English. For example, `Ask for help in a store.` It includes the expected time and the compact scope of the session: word count, pattern count, and expected output.

The outcome is the visual and semantic focus of the screen. It determines the primary CTA label, such as `Start: review yesterday` or `Continue: learn words`.

### Learning Path

The current eight implementation steps are grouped into four learner-facing stages:

1. Review
2. Input (words and patterns)
3. Practice (drills and translation)
4. Output (scene, picture, and writing)

Inside a stage, the existing granular progress remains available. The first-screen path is a compact overview, not eight equally prominent controls.

### Weekly Context

Replace the long open `Scenes I Can Describe` list with a compact `This week` / `Journey` section. It displays completed, current, and the next few days. The full course map remains available from Course. Future days must look deliberately unavailable, not like controls that failed to respond.

### Actions

There is only one primary green CTA at a time. On mobile it is fixed above the safe-area-aware navigation bar without covering content. On desktop it remains within the main reading column or a contextual side area.

When a CTA is unavailable, the unmet completion rule is immediately visible in text. Disabled styling alone is insufficient.

## Visual System

### Tokens

Use a semantic token layer, retaining existing warm-neutral and forest-green foundations:

- Background and surfaces: warm neutral layers that distinguish page, ordinary card, and selected card.
- Primary: forest green only for the current state, completion, and primary command.
- Review: muted amber for due or attention-required state.
- Error: restrained brick red, used only for errors and destructive action.
- Shape: `6px` small controls and `8px` cards; reserved pill geometry for compact status labels.
- Spacing: a single `4 / 8 / 12 / 16 / 24 / 32` scale.

Cards may use background elevation or one fine border; avoid nested card frames. Every card must have one dominant job.

### Typography

Use an editorial but readable display face for the product/page identity where the shipped font budget permits. Use the existing sans-serif system stack for body, controls, phonetics, and form content.

The hierarchy must reliably distinguish:

1. Practical outcome or page title
2. Target word or current learning unit
3. Supporting definition, progress, or instruction

Do not rely on making every label bold. Phonetic text is quiet secondary information, not a competing title.

### Icons

Use one consistent familiar icon set for navigation, listening, progress, completion, and settings. Icons supplement short labels; they do not replace meaningful labels in the bottom navigation.

## Words Workspace

### Flashcard

The flashcard is the dominant object. Its front displays the generated visual, target word, and phonetic spelling. Its back displays the English definition, an example sentence, and the learner's confidence action.

Use exactly one primary Listen control per card face. The example sentence can expose a compact secondary listen action. Listening states must make it clear which content is playing.

Confidence actions use explicit language:

- `Need review`
- `I know this`

After selection, provide an immediate visible acknowledgment and move naturally to the next card. Respect reduced-motion preferences for flipping or transitions.

### Word List

List mode is a compact index, not a second learning-card layout. Each item contains the word, phonetic spelling, and a mastery marker. Selecting it opens that word in Flashcards mode.

## Review Workspace

The review landing state displays the number of items due, an estimated duration, and one primary `Start review` CTA. During a session, one question or recall action is clearly dominant. On completion, the learner sees a concise outcome connected to vocabulary, pattern, and scenario growth.

An empty state must communicate that no review is currently needed and offer a quiet secondary route to Words or Today.

## Course and Me

### Course

Use a week-oriented vertical timeline. Expand the current week by default. A completed day has a visible check state; the current day has a clear open action; future days have a lock or scheduled state. Do not style all day rows as equivalent controls.

### Me

Place the three essential facts at the top: completed days, current streak, and due reviews. Scenario capabilities follow as short status rows with the next required action. Settings appear last and use full-row controls with a minimum 44px touch target.

## Interaction Rules

- Every command returns immediate visual feedback: pressed/selected state, result message, progress change, or a controlled transition.
- Only one speech utterance may run at a time. Starting another utterance, navigating away, changing a flashcard, or pressing the active control stops the prior utterance.
- The active navigation item uses `aria-current="page"`.
- Actions that affect progress communicate their result with an appropriate live region.
- All async progress loads and saves have intentional loading and failure states.

## Accessibility and Responsive Requirements

- Interactive targets are at least `44 x 44px`; a smaller visual icon may use an enlarged transparent hit target.
- Every interactive element has a high-contrast `:focus-visible` state across light, dark, selected, and disabled-adjacent contexts.
- Chinese helper content is marked with `lang="zh"`; English stays the default language. Toggling Chinese help must not alter the English-first hierarchy.
- Use `viewport-fit=cover` and safe-area-aware bottom spacing for mobile navigation and fixed CTAs.
- Desktop is a learning workspace, not a scaled mobile page: maintain a readable main column of roughly 640px and use a restrained secondary column for weekly context or learner status when width allows.
- Dark mode uses equivalent surface levels and contrast rather than a simple color inversion. Generated learning imagery retains a neutral display surface.
- Motion follows `prefers-reduced-motion`.

## Component Boundaries

| Component area | Responsibility |
| --- | --- |
| App shell and navigation | Active destination, semantic navigation, safe-area layout |
| Today workspace header | Day identity, overall progress, streak and outcome |
| Learning path | Maps granular implementation steps to learner-facing stages |
| Weekly journey | Compact weekly state, expansion, and route to Course |
| Lesson action bar | One CTA plus readable unmet requirement state |
| Flashcard workspace | Card face, speech state, confidence choice, navigation |
| Review dashboard | Due summary, start state, empty state, completion state |
| Course timeline | Week expansion and day state presentation |
| Progress dashboard | Personal statistics and scenario capability status |
| Settings rows | Theme, Chinese assistance, speech language/rate and enablement |

Existing domain and storage behavior remain the source of truth. This UI work must not redefine review scheduling, mastery rules, word coverage, or course content.

## Delivery Sequence

1. Introduce/refine semantic tokens, baseline controls, icon conventions, focus styles, safe-area support, and screenshot accessibility coverage.
2. Rebuild Layout and Today around the daily outcome, grouped path, compact weekly journey, and safe fixed action placement.
3. Rebuild Words and Review around focused sessions, controlled speech state, confidence feedback, and clear empty/completion states.
4. Rebuild Course and Me as a timeline and personal dashboard while preserving their existing data sources.
5. Run responsive visual regression, keyboard navigation, light/dark theme review, speech-concurrency E2E, and standard unit/E2E regression.

## Acceptance Criteria

- Within three seconds of opening Today, a learner can identify today's ability, estimated duration, current course position, and next action.
- The default mobile Today screen does not expose a long list of future scenes or permit fixed controls to cover content.
- Words has one clearly dominant flashcard and does not present duplicate peer-level speech actions.
- Any command produces visible feedback and a listener cannot trigger overlapping speech.
- Keyboard focus, touch targets, language semantics, contrast, safe areas, reduced motion, and dark mode meet the stated constraints.
- Existing course, review, progress, speech, theme, and content tests continue to pass; new behavior has focused unit and E2E coverage.
