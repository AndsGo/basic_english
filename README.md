# Basic English 52 Weeks

[![Deploy GitHub Pages](https://github.com/AndsGo/basic_english/actions/workflows/deploy-github-pages.yml/badge.svg)](https://github.com/AndsGo/basic_english/actions/workflows/deploy-github-pages.yml)

A browser-based Basic English learning application for building the ability to describe daily life and express simple ideas. It uses C. K. Ogden's Basic English 850 words as its foundation, then teaches them through everyday situations, reusable sentence patterns, listening, speaking, reading, and writing practice.

**Try it:** [andsgo.github.io/basic_english](https://andsgo.github.io/basic_english/)

## Learning goal

By completing the course, learners should be able to use a small, practical English vocabulary to:

- describe people, objects, places, routines, needs, feelings, and problems;
- handle common daily situations such as introductions, home life, food, transport, shopping, work, and health;
- understand and produce short, clear English sentences; and
- give simple reasons, preferences, plans, and opinions.

The course is designed around meaningful output, not isolated word memorization. The app contains a small number of product-approved supplementary forms where they are needed for usable beginner language; the canonical Ogden vocabulary is kept and validated separately.

## What is included

- **52-week course path** with daily lessons and scenario-based goals.
- **Course words** with English definitions, IPA pronunciation, examples, optional Chinese help, and 512 x 512 visual flashcards.
- **Words modes:** course list, flip flashcards, and an 850-word library.
- **Patterns and output tasks** for turning vocabulary into usable sentences.
- **Today flow** that guides the learner through the next practical lesson.
- **Review and mastery scheduling** for words, scenes, and learned capabilities.
- **Picture description and scene remix** activities for daily-life expression.
- **Listening and speaking pilot:** browser speech playback, microphone recording, playback, and self-checks.
- **Personal learning view** with progress, language-help, voice, playback-rate, and theme settings.

## How to learn with it

1. Open **Today** and complete the next lesson in order.
2. Listen first, then read aloud and reuse the sentence patterns with your own information.
3. Use **Words** flashcards to connect a word with its image, pronunciation, English definition, and example.
4. Finish the output activity by speaking or writing about your actual day.
5. Return to **Review** daily. Review items are scheduled from completed learning and mastery practice.

Chinese help is optional. Leave it off for an English-first environment, and enable it only when clarification is needed.

## Technology

- React 19
- TypeScript
- Vite
- IndexedDB via `idb` for on-device learning progress and recordings
- Web Speech API for text-to-speech
- MediaRecorder API for local speaking recordings
- Vitest and Testing Library for unit and component tests
- Playwright for end-to-end tests
- GitHub Actions and GitHub Pages for deployment

## Run locally

### Prerequisites

- Node.js 22 or later
- npm
- For image conversion only: `ffmpeg` with `libwebp` support

```bash
git clone https://github.com/AndsGo/basic_english.git
cd basic_english
npm ci
npm run dev
```

Vite prints the local URL in the terminal. The production build uses `/basic_english/` as its base path so that it works on GitHub Pages.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Vite development server. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm test` | Run the Vitest unit and component suite. |
| `npm run test:e2e` | Run the Playwright end-to-end suite. |
| `npm run content:health` | Generate the course content health report. |
| `npm run assets:webp` | Convert PNG learning assets to WebP at quality 90. |

The WebP converter also supports `--dry-run`, `--overwrite`, and `--quality <1-100>`. For example:

```bash
npm run assets:webp -- --dry-run
npm run assets:webp -- --quality 85 --overwrite
```

## Data and browser support

Learning progress, settings, and saved recordings stay in the browser's local storage and IndexedDB. They are not sent to an application server. Clearing browser site data will reset local progress and remove local recordings.

Speech playback depends on the voices installed in the learner's browser or operating system. Speaking practice requires a browser that supports microphone access and `MediaRecorder`; microphone permission is requested only when the learner starts a recording.

## Content and asset standards

- The canonical Basic English vocabulary is defined in [src/content/basicEnglish850.ts](src/content/basicEnglish850.ts).
- Course composition is assembled in [src/content/course.ts](src/content/course.ts).
- Content validation lives in [src/content/validateContent.test.ts](src/content/validateContent.test.ts).
- Image creation and replacement rules are maintained in [AGENTS.md](AGENTS.md). Word and scene images must preserve their intended meaning and follow the project's 512 x 512 polished-cartoon visual standard.

Supporting product, content, and implementation documents are in [docs](docs).

## Deployment

Every push to `main` runs the [GitHub Pages workflow](.github/workflows/deploy-github-pages.yml): it installs dependencies, builds the app, and deploys `dist/` to GitHub Pages.

## License

This project is available under the [MIT License](LICENSE).
