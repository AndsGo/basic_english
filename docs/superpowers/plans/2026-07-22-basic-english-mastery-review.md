# Basic English Mastery Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Add a daily eight-question, objectively scored mastery-review loop for words and patterns, then expose verified ability by daily-life scenario.

**Architecture:** Store verified mastery separately from self-marks and manual \`reviewItems\`. A pure domain module schedules due content and applies answer transitions. A reusable panel renders objective questions in Today and Review. Capability state is derived from prerequisite days plus mastery records for content introduced by those days.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, fake-indexeddb, idb 8, Playwright.

## Global Constraints

- Preserve \`reviewItems\` for manual/error-driven practice. Mastery review must not resolve, delete, or create those records.
- Limit each local calendar date to eight completed mastery questions and never ask the same content twice on that date.
- Keep automatic scoring limited to English word and pattern questions; never score free writing, scene remix, or picture descriptions.
- Upgrade the existing IndexedDB database without discarding user data.
- Retain the current manual Review page and previous-day review behavior.

---

## File Structure

| File | Responsibility |
| --- | --- |
| \`src/domain/mastery.ts\` | Types, transitions, due selection, daily sessions, scenario state. |
| \`src/domain/mastery.test.ts\` | Pure state-machine and scheduling tests. |
| \`src/domain/masteryQuestions.ts\` | Deterministic question construction from \`Course\`. |
| \`src/domain/masteryQuestions.test.ts\` | Question factory tests. |
| \`src/storage/progressRepository.ts\` | Mastery repository contracts. |
| \`src/storage/indexedDbProgressRepository.ts\` | IndexedDB v6 stores and methods. |
| \`src/storage/indexedDbProgressRepository.test.ts\` | Persistence and v5-to-v6 migration tests. |
| \`src/components/MasteryReviewPanel.tsx\` | Reusable scheduled-question interface. |
| \`src/components/MasteryReviewPanel.test.tsx\` | Panel behavior tests. |
| \`src/components/TodayPage.tsx\` | Mastery step and lesson-completion seed. |
| \`src/domain/progress.ts\`, \`src/components/Stepper.tsx\` | New step identity and label. |
| \`src/components/ReviewPage.tsx\` | Separate Mastery review and Practice again sections. |
| \`src/domain/capabilities.ts\`, \`src/components/MePage.tsx\` | Scenario mastery status and rendering. |
| \`src/App.tsx\` | Course props and combined Review badge count. |
| \`tests/e2e/basic-english.spec.ts\` | Browser-level mastery journey. |

### Task 1: Mastery State Machine and Scheduler

**Files:**
- Create: \`src/domain/mastery.ts\`
- Create: \`src/domain/mastery.test.ts\`

**Interfaces:**
- Produces \`MasteryContentType\`, \`MasteryStatus\`, \`MasteryProgress\`, \`MasteryReviewSession\`, \`createPendingMasteryProgress\`, \`selectDueMasteryProgress\`, \`applyMasteryAnswer\`, \`toLocalDateString\`, and \`getScenarioMasteryState\`.
- Consumed by Tasks 2-6.

- [ ] **Step 1: Write failing transition and selection tests.**

\`\`\`ts
import { describe, expect, it } from 'vitest';
import { applyMasteryAnswer, createPendingMasteryProgress, selectDueMasteryProgress } from './mastery';

const now = '2026-07-22T08:00:00.000Z';

it('prioritizes overdue reinforcement and returns at most eight unseen records', () => {
  const records = Array.from({ length: 10 }, (_, index) =>
    createPendingMasteryProgress({ contentType: 'word', contentId: \`word-\${index}\`, sourceDayId: 'day-001', now }),
  );
  records[9] = { ...records[9], status: 'needs_reinforcement', dueAt: '2026-07-20T08:00:00.000Z' };

  const result = selectDueMasteryProgress(records, { now, completedContentIds: ['word-0'] });

  expect(result).toHaveLength(8);
  expect(result[0].contentId).toBe('word-9');
  expect(result.map((record) => record.contentId)).not.toContain('word-0');
});

it('promotes correct answers through learning, stable, and mastered', () => {
  const pending = createPendingMasteryProgress({ contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now });
  const learning = applyMasteryAnswer(pending, { correct: true, now });
  const stable = applyMasteryAnswer(learning, { correct: true, now: '2026-07-23T08:00:00.000Z' });
  const mastered = applyMasteryAnswer(stable, { correct: true, now: '2026-07-26T08:00:00.000Z' });

  expect([learning.status, stable.status, mastered.status]).toEqual(['learning', 'stable', 'mastered']);
  expect(mastered.dueAt).toBe('2026-08-02T08:00:00.000Z');
});
\`\`\`

Add tests for incorrect \`stable\` and \`mastered\` records becoming \`needs_reinforcement\` on the next day, a session exclusion preventing same-day repetition, and capability thresholds: incomplete prerequisite is \`not_started\`; 70% stable/mastered is \`ready\`; 90% plus reinforcement is not \`strong\`.

- [ ] **Step 2: Run the test and verify failure.**

Run: \`npx vitest run src/domain/mastery.test.ts\`

Expected: FAIL because \`./mastery\` does not exist.

- [ ] **Step 3: Implement exact core interfaces and pure rules.**

\`\`\`ts
export type MasteryContentType = 'word' | 'pattern';
export type MasteryStatus = 'pending_validation' | 'learning' | 'stable' | 'mastered' | 'needs_reinforcement';

export interface MasteryProgress {
  id: string;
  contentType: MasteryContentType;
  contentId: string;
  sourceDayId: string;
  status: MasteryStatus;
  consecutiveCorrect: number;
  dueAt: string;
  lastAnsweredAt?: string;
  updatedAt: string;
}

export interface MasteryReviewSession {
  id: string;
  localDate: string;
  completedProgressIds: string[];
  updatedAt: string;
}

export function createPendingMasteryProgress(input: {
  contentType: MasteryContentType; contentId: string; sourceDayId: string; now: string;
}): MasteryProgress;

export function selectDueMasteryProgress(
  records: MasteryProgress[],
  input: { now: string; completedProgressIds: string[]; limit?: number },
): MasteryProgress[];

export function applyMasteryAnswer(
  record: MasteryProgress,
  input: { correct: boolean; now: string },
): MasteryProgress;
\`\`\`

Use a private ISO-safe \`addDays\`. Correct answers schedule 1, 3, then 7 days while moving \`pending_validation -> learning -> stable -> mastered\`. Any incorrect answer resets \`consecutiveCorrect\`, schedules tomorrow, and sets \`needs_reinforcement\` if the previous state was \`stable\` or \`mastered\`; otherwise retain \`learning\`. Select due records only, order by reinforcement, learning/stable, pending, mastered, then oldest \`dueAt\`, then oldest \`lastAnsweredAt\`; exclude session IDs and slice at eight.

- [ ] **Step 4: Run focused tests.**

Run: \`npx vitest run src/domain/mastery.test.ts\`

Expected: PASS.

- [ ] **Step 5: Commit.**

\`\`\`bash
git add src/domain/mastery.ts src/domain/mastery.test.ts
git commit -m "feat: add mastery scheduling rules"
\`\`\`

### Task 2: Repository Contract and IndexedDB v6 Migration

**Files:**
- Modify: \`src/storage/progressRepository.ts\`
- Modify: \`src/storage/indexedDbProgressRepository.ts\`
- Modify: \`src/storage/indexedDbProgressRepository.test.ts\`

**Interfaces:**
- Consumes Task 1 types.
- Produces \`saveMasteryProgress\`, \`getMasteryProgress\`, \`listMasteryProgress\`, \`saveMasteryReviewSession\`, \`getMasteryReviewSession\`.

- [ ] **Step 1: Write failing persistence and migration tests.**

\`\`\`ts
it('persists mastery records and a local-date session', async () => {
  const repo = createIndexedDbProgressRepository(nextDbName());
  const record = createPendingMasteryProgress({
    contentType: 'word', contentId: 'name', sourceDayId: 'day-001', now: '2026-07-22T08:00:00.000Z',
  });
  await repo.saveMasteryProgress(record);
  await repo.saveMasteryReviewSession({
    id: 'mastery-session-2026-07-22', localDate: '2026-07-22',
  completedProgressIds: ['mastery-word-name'], updatedAt: '2026-07-22T08:05:00.000Z',
  });

  await expect(repo.getMasteryProgress('word', 'name')).resolves.toEqual(record);
  await expect(repo.getMasteryReviewSession('2026-07-22')).resolves.toMatchObject({ completedProgressIds: ['mastery-word-name'] });
});
\`\`\`

Add a v5 fixture using the existing legacy-store pattern. Open it through the new repository, write mastery data, and assert the pre-existing \`userOutputs\` record is still readable.

- [ ] **Step 2: Run the test and verify failure.**

Run: \`npx vitest run src/storage/indexedDbProgressRepository.test.ts\`

Expected: FAIL because mastery methods and stores do not exist.

- [ ] **Step 3: Add contracts and v6 stores.**

\`\`\`ts
export interface ProgressRepository {
  // existing methods
  saveMasteryProgress(progress: MasteryProgress): Promise<void>;
  getMasteryProgress(contentType: MasteryContentType, contentId: string): Promise<MasteryProgress | null>;
  listMasteryProgress(): Promise<MasteryProgress[]>;
  saveMasteryReviewSession(session: MasteryReviewSession): Promise<void>;
  getMasteryReviewSession(localDate: string): Promise<MasteryReviewSession | null>;
}
\`\`\`

Set \`DB_VERSION = 6\`. Add \`masteryProgress\` keyed by \`id\`, indexed by \`contentId\` and \`dueAt\`; add \`masteryReviewSessions\` keyed by \`localDate\`. In the existing \`upgrade\`, create only stores that are missing. Sort \`listMasteryProgress\` by \`dueAt\`, then \`id\`.

- [ ] **Step 4: Run tests and commit.**

Run: \`npx vitest run src/storage/indexedDbProgressRepository.test.ts\`

Expected: PASS.

\`\`\`bash
git add src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts
git commit -m "feat: persist mastery review progress"
\`\`\`

### Task 3: Question Factory and Reusable Mastery Panel

**Files:**
- Create: \`src/domain/masteryQuestions.ts\`
- Create: \`src/domain/masteryQuestions.test.ts\`
- Create: \`src/components/MasteryReviewPanel.tsx\`
- Create: \`src/components/MasteryReviewPanel.test.tsx\`
- Modify: \`src/styles.css\`

**Interfaces:**
- Produces \`MasteryQuestion\`, \`buildMasteryQuestion\`, and \`<MasteryReviewPanel course repository now? onChange?>\`.
- Consumes Tasks 1-2 and \`Course\`.

- [ ] **Step 1: Write failing factory and panel tests.**

\`\`\`ts
it('builds an English word definition choice with exactly one correct definition', () => {
  const question = buildMasteryQuestion(wordRecord, course);
  expect(question.kind).toBe('word_definition_choice');
  expect(question.options).toContain('the title of a person or thing');
  expect(question.options).toHaveLength(3);
  expect(question.options?.filter((option) => option === question.correctAnswer)).toHaveLength(1);
});
\`\`\`

\`\`\`tsx
it('records a correct answer, announces feedback, and never presents more than eight questions', async () => {
  // seed nine due records, render with now={() => new Date('2026-07-22T08:00:00.000Z')}
  expect(await screen.findByText('Mastery review')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /the title of a person or thing/i }));
  expect(await screen.findByRole('status')).toHaveTextContent('Correct');
});
\`\`\`

Also test empty due state, storage error alert, incorrect answer persistence, and a completed session item being absent after rerender.

- [ ] **Step 2: Run targeted tests and verify failure.**

Run: \`npx vitest run src/domain/masteryQuestions.test.ts src/components/MasteryReviewPanel.test.tsx\`

Expected: FAIL because factory and panel do not exist.

- [ ] **Step 3: Implement deterministic questions.**

\`\`\`ts
export type MasteryQuestion = {
  id: string;
  progressId: string;
  kind: 'word_definition_choice' | 'pattern_sentence_choice' | 'pattern_fill_blank' | 'pattern_sentence_order';
  prompt: string;
  options?: string[];
  tokens?: string[];
  correctAnswer: string | string[];
  explanation: string;
};

export function buildMasteryQuestion(progress: MasteryProgress, course: Course): MasteryQuestion;
\`\`\`

Pick a question kind from a stable hash of \`progress.id\`. For words, use target \`definition\` and two distinct definitions from other course words. For patterns, rotate among correct \`examples[0]\` plus two other examples, one token blank in that example, and its ordered tokens. Reject missing content with a typed error; never read \`chinese\`.

- [ ] **Step 4: Implement panel persistence and accessible feedback.**

\`\`\`tsx
export function MasteryReviewPanel({
  course, repository, now = () => new Date(), onChange,
}: {
  course: Course;
  repository: ProgressRepository;
  now?: () => Date;
  onChange?: () => void;
}) { /* load records/session, select due, persist result then session */ }
\`\`\`

Use \`toLocalDateString(now())\` to load a session. Render \`No mastery review due today.\` when empty, \`Question {completed + 1} of {total}\` while active, and a \`role=\"status\"\` result after answer. Disable controls during save and after answer. Save the updated record first, then a session whose \`completedProgressIds\` includes the record ID. Add only \`mastery-review-*\` CSS selectors and reuse existing button styles.

- [ ] **Step 5: Run tests and commit.**

Run: \`npx vitest run src/domain/masteryQuestions.test.ts src/components/MasteryReviewPanel.test.tsx\`

Expected: PASS.

\`\`\`bash
git add src/domain/masteryQuestions.ts src/domain/masteryQuestions.test.ts src/components/MasteryReviewPanel.tsx src/components/MasteryReviewPanel.test.tsx src/styles.css
git commit -m "feat: add mastery review questions"
\`\`\`

### Task 4: Today and Review Integration

**Files:**
- Modify: \`src/domain/progress.ts\`
- Modify: \`src/domain/progress.test.ts\`
- Modify: \`src/components/Stepper.tsx\`
- Modify: \`src/components/TodayPage.tsx\`
- Modify: \`src/components/TodayPage.test.tsx\`
- Modify: \`src/components/ReviewPage.tsx\`
- Modify: \`src/components/ReviewPage.test.tsx\`
- Modify: \`src/App.tsx\`
- Modify: \`src/App.test.tsx\`

**Interfaces:**
- Consumes Task 3 panel and Task 1 scheduler.
- Produces a first Today step, idempotent lesson seeding, separated Review sections, and a combined due badge.

- [ ] **Step 1: Add failing progress, Today, Review, and App tests.**

\`\`\`ts
it('starts with mastery review and proceeds to the existing previous-day review', () => {
  const progress = startDay('day-001', '1.0.0', now);
  expect(progress.currentStep).toBe('mastery-review');
  expect(completeStep(progress, 'mastery-review', now).currentStep).toBe('review');
});
\`\`\`

\`\`\`tsx
it('keeps mastery review separate from manual Practice again', async () => {
  // seed one due mastery record and one createWordReviewItem
  render(<ReviewPage course={basicEnglishCourse} repository={repo} />);
  expect(await screen.findByRole('heading', { name: 'Mastery review' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Practice again' })).toBeInTheDocument();
});
\`\`\`

Add a Today completion test asserting unique word and pattern records were seeded with \`pending_validation\`; add an App test asserting one manual due item plus one due mastery record renders Review badge \`2\`.

- [ ] **Step 2: Run tests and verify failure.**

Run: \`npx vitest run src/domain/progress.test.ts src/components/TodayPage.test.tsx src/components/ReviewPage.test.tsx src/App.test.tsx\`

Expected: FAIL because \`mastery-review\` and the new props do not exist.

- [ ] **Step 3: Add the step and idempotent seed.**

\`\`\`ts
export type StepId = 'mastery-review' | 'review' | 'words' | 'patterns' | 'drills' | 'translate' | 'scene-remix' | 'picture' | 'output' | 'done';
export const stepOrder: StepId[] = ['mastery-review', 'review', 'words', 'patterns', 'drills', 'translate', 'scene-remix', 'picture', 'output', 'done'];
\`\`\`

Add \`mastery-review: 'Mastery'\` in \`Stepper\`. In Today, render the Task 3 panel during the new step; it is passable only after all selected questions are answered, or immediately when none are due. When output completes a day, load records, use \`new Set(day.wordIds)\` and \`new Set(day.patternIds)\`, and save only IDs absent from stored mastery records. Keep the existing \`review\` branch untouched for previous-day recap. Update complete-day fixtures to include \`mastery-review\`.

- [ ] **Step 4: Split Review and update badge.**

Pass \`course: Course\` into \`ReviewPage\`. Render a \`Mastery review\` section containing the panel and a \`Practice again\` section containing existing manual due items. Change only manual empty copy to \`No practice items due today.\`. In \`App.refreshProgressSummary\`, load mastery records and today's session together with active manual items, then set the badge to \`selectDueReviewItems(...).length + selectDueMasteryProgress(...).length\`. Pass \`basicEnglishCourse\` to ReviewPage.

- [ ] **Step 5: Run tests and commit.**

Run: \`npx vitest run src/domain/progress.test.ts src/components/TodayPage.test.tsx src/components/ReviewPage.test.tsx src/App.test.tsx\`

Expected: PASS.

\`\`\`bash
git add src/domain/progress.ts src/domain/progress.test.ts src/components/Stepper.tsx src/components/TodayPage.tsx src/components/TodayPage.test.tsx src/components/ReviewPage.tsx src/components/ReviewPage.test.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: integrate daily mastery review"
\`\`\`

### Task 5: Scenario Ability Map, E2E, and Documentation

**Files:**
- Modify: \`src/domain/capabilities.ts\`
- Modify: \`src/domain/capabilities.test.ts\`
- Modify: \`src/components/MePage.tsx\`
- Modify: \`src/components/MePage.test.tsx\`
- Modify: \`src/styles.css\`
- Modify: \`tests/e2e/basic-english.spec.ts\`
- Modify: \`docs/superpowers/specs/2026-07-22-basic-english-mastery-review-design.md\`

**Interfaces:**
- Consumes Task 1 state calculation, course days, scenario capabilities, and persisted mastery data.
- Produces visible \`Not started\`, \`Building\`, \`Ready\`, \`Strong\` states with verified counts and next actions.

- [ ] **Step 1: Write failing capability and Me page tests.**

\`\`\`ts
it('returns Ready at the 70 percent threshold', () => {
  const result = getScenarioMasteryState({
    prerequisiteDayIds: ['day-001'], completedDayIds: ['day-001'], contentIds: ['word:name', 'pattern:i-am'],
    records: [stableWord, masteredPattern],
  });
  expect(result).toMatchObject({ status: 'ready', stablePercent: 100 });
});
\`\`\`

\`\`\`tsx
it('shows status, verified ratio, and concrete next action', async () => {
  render(<MePage course={basicEnglishCourse} repository={repository} scenarioCapabilities={scenarioCapabilities} />);
  expect(await screen.findByText('Building')).toBeInTheDocument();
  expect(screen.getByText(/Verified: 1 \\/ 2/)).toBeInTheDocument();
  expect(screen.getByText(/Review 1 item/)).toBeInTheDocument();
});
\`\`\`

- [ ] **Step 2: Run tests and verify failure.**

Run: \`npx vitest run src/domain/capabilities.test.ts src/components/MePage.test.tsx\`

Expected: FAIL because capability state currently considers completed days only.

- [ ] **Step 3: Implement mapping and My Progress display.**

Add a capability helper accepting \`Course\`, a \`ScenarioCapability\`, completed day IDs, and mastery records. Collect unique word/pattern IDs from every \`unlockedByDayIds\` day; prefix them with \`word:\` or \`pattern:\` before comparing. Use Task 1 thresholds. In MePage, accept required \`course: Course\`, load \`listMasteryProgress()\` in its existing \`Promise.all\`, and show each capability's exact status, \`Verified: {verifiedCount} / {totalCount}\`, and next action. For incomplete prerequisites say \`Complete Day N\`; for weak verified content say \`Review N item(s)\`; for Strong say \`Keep it strong with future review.\` Pass \`basicEnglishCourse\` from App and add compact \`capability-status\` / \`capability-next-action\` CSS.

- [ ] **Step 4: Add failing E2E then implement seed helper.**

Add a \`seedMasteryProgress\` helper next to existing IndexedDB helpers. It opens database version 6, creates missing \`masteryProgress\` and \`masteryReviewSessions\` stores, and writes a due word record. Add a test that opens Review, answers the word question, observes \`Correct\`, opens Me, and observes the scenario state update.

Run: \`npx playwright test tests/e2e/basic-english.spec.ts --grep \"mastery question\"\`

Expected: PASS after all prior tasks are integrated.

- [ ] **Step 5: Append implementation notes and run the complete verification suite.**

Append \`## Implementation Notes\` to the approved spec with database version 6, both new store names, the \`mastery-review\` step, and the final verification commands.

Run: \`npx vitest run --exclude ".worktrees/**"\`

Expected: PASS.

Run: \`npm run build\`

Expected: PASS.

Run: \`npm run content:health\`

Expected: output contains \`Errors (0)\`.

Run: \`npm run test:e2e\`

Expected: PASS on chromium and mobile-chrome.

- [ ] **Step 6: Commit.**

\`\`\`bash
git add src/domain/capabilities.ts src/domain/capabilities.test.ts src/components/MePage.tsx src/components/MePage.test.tsx src/styles.css tests/e2e/basic-english.spec.ts docs/superpowers/specs/2026-07-22-basic-english-mastery-review-design.md
git commit -m "feat: show scenario mastery progress"
\`\`\`

## Plan Self-Review

- The new standalone mastery model, daily session, and safe v6 migration are covered by Tasks 1-2.
- Daily cap, priority, 1/3/7 scheduling, no-repeat guarantee, and objective English questions are covered by Tasks 1 and 3.
- Today insertion, previous-day review preservation, and day-completion seeding are covered by Task 4.
- Manual review isolation and combined navigation count are covered by Task 4.
- Scenario thresholds, suggestions, component tests, E2E, build, health, and browser verification are covered by Task 5.
- Task dependencies use only interfaces introduced in earlier tasks.
