# Basic English Daily Learning Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an explainable English-first daily learning report and optional two-to-three-question reinforcement practice without changing lesson order, manual review, or verified mastery scheduling.

**Architecture:** Implement a pure `dailyLearningInsights` domain module that derives up to three candidates from mastery records, active manual review, completed lessons, and scenario capabilities. Persist only optional reinforcement sessions in IndexedDB v7. Render a reusable reinforcement panel in the completion view and a compact latest-report summary in My Progress.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, fake-indexeddb, idb 8, Playwright.

**Baseline:** Execute this plan from a new worktree based on `codex/mastery-review`, not current `main`. The feature depends on the mastery-review stores, domain types, panel, and scenario states that are not yet merged into `main`. Cherry-pick commit `5ef919d` into that worktree before implementation so the approved specification is present with the code.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/domain/dailyLearningInsights.ts` | Insight types, deterministic candidate selection, outcome text, and report identity. |
| `src/domain/dailyLearningInsights.test.ts` | Priority, de-duplication, scenario mapping, and empty-state tests. |
| `src/storage/progressRepository.ts` | Reinforcement session contracts. |
| `src/storage/indexedDbProgressRepository.ts` | IndexedDB v7 store and repository methods. |
| `src/storage/indexedDbProgressRepository.test.ts` | Session persistence and v6-to-v7 migration coverage. |
| `src/components/ReinforcementPracticePanel.tsx` | Optional objective practice UI and session persistence. |
| `src/components/ReinforcementPracticePanel.test.tsx` | Answer, completion, skip, retry, and error tests. |
| `src/components/DailyLearningReport.tsx` | Compact completion report and practice entry point. |
| `src/components/DailyLearningReport.test.tsx` | Report wording, reasons, empty, and non-blocking failure tests. |
| `src/components/CompletionSummary.tsx` | Report placement after the completed-day summary. |
| `src/components/TodayPage.tsx` | Loads report inputs and refreshes the report after practice. |
| `src/components/MePage.tsx` | Shows the latest report summary beside scenario progress. |
| `src/styles.css` | Report and practice styling without changing global button behavior. |
| `tests/e2e/basic-english.spec.ts` | Desktop and mobile completion-to-reinforcement journey. |

### Task 1: Derive Explainable Daily Learning Insights

**Files:**
- Create: `src/domain/dailyLearningInsights.ts`
- Create: `src/domain/dailyLearningInsights.test.ts`

- [ ] **Step 1: Write failing domain tests for priority, uniqueness, and scenario mapping.**

```ts
it('selects a recent mastery miss before learning, manual review, and scenario-gap content', () => {
  const result = buildDailyLearningInsight({
    course: basicEnglishCourse,
    capabilities: scenarioCapabilities,
    completedDayIds: ['day-001'],
    masteryProgress: [missedName, learningMy, scenarioGapPattern],
    activeReviewItems: [createWordReviewItem({ wordId: 'name', wordText: 'name', sourceDayId: 'day-001', now })],
    masterySessions: [sessionWithMissedName],
    localDate: '2026-07-27',
  });

  expect(result.outcome).toBe('focus');
  expect(result.items.map((item) => item.contentKey)).toEqual(['word:name', 'word:my', 'pattern:i-am']);
  expect(result.items[0]?.reason).toBe('You missed this word in mastery review.');
  expect(result.items[0]?.scenarioTitle).toBe('Self Introduction');
});

it('returns a strong outcome and no items when no source identifies targeted practice', () => {
  expect(buildDailyLearningInsight(emptyInput)).toEqual({
    id: 'daily-learning-insight-2026-07-27',
    localDate: '2026-07-27',
    outcome: 'strong',
    items: [],
  });
});
```

Include a test showing that one `word:name` candidate supplied by several sources appears once, and a test that partially completed prerequisites never create a scenario-gap candidate.

- [ ] **Step 2: Run the test to verify failure.**

Run: `npx vitest run src/domain/dailyLearningInsights.test.ts`

Expected: FAIL because `./dailyLearningInsights` does not exist.

- [ ] **Step 3: Implement the pure report types and deterministic selection.**

```ts
export type LearningInsightOutcome = 'strong' | 'keep_practicing' | 'focus';
export type LearningInsightSource = 'mastery_miss' | 'mastery_learning' | 'manual_review' | 'scenario_gap';

export interface DailyLearningInsightItem {
  contentType: MasteryContentType;
  contentId: string;
  contentKey: string;
  source: LearningInsightSource;
  reason: string;
  scenarioId?: string;
  scenarioTitle?: string;
}

export interface DailyLearningInsight {
  id: string;
  localDate: string;
  outcome: LearningInsightOutcome;
  items: DailyLearningInsightItem[];
}

export function buildDailyLearningInsight(input: {
  course: Course;
  capabilities: ScenarioCapability[];
  completedDayIds: string[];
  masteryProgress: MasteryProgress[];
  activeReviewItems: ReviewItem[];
  masterySessions: MasteryReviewSession[];
  localDate: string;
}): DailyLearningInsight;
```

Use `contentKey = \`${contentType}:${contentId}\`` and a `Map<string, DailyLearningInsightItem>` so earlier priority sources win. Derive missed IDs from the latest session whose completed IDs include a record with `lastAnsweredAt` on or before that session date and whose resulting record is `learning` or `needs_reinforcement`; do not infer a miss from absent records. Add learning/reinforcement records next, then active word/pattern manual review items only. Finally, use `getScenarioCapabilityMasteryState` and only add records from fully completed capability prerequisites whose status is `building`. Sort stable ties by `lastAnsweredAt`, then `dueAt`, then `contentKey`; slice at three. Map 0 items to `strong`, 1 item to `keep_practicing`, and 2-3 items to `focus`.

- [ ] **Step 4: Run focused tests.**

Run: `npx vitest run src/domain/dailyLearningInsights.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the domain module.**

```bash
git add src/domain/dailyLearningInsights.ts src/domain/dailyLearningInsights.test.ts
git commit -m "feat: derive daily learning insights"
```

### Task 2: Persist Optional Reinforcement Sessions

**Files:**
- Modify: `src/storage/progressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.test.ts`

- [ ] **Step 1: Add failing persistence and migration tests.**

```ts
it('persists an optional reinforcement session by local date and report identity', async () => {
  const repository = createIndexedDbProgressRepository(nextDbName());
  const session: ReinforcementPracticeSession = {
    id: 'reinforcement-2026-07-27-daily-learning-insight-2026-07-27',
    localDate: '2026-07-27',
    insightId: 'daily-learning-insight-2026-07-27',
    contentKeys: ['word:name', 'pattern:i-am'],
    answers: [],
    status: 'in_progress',
    updatedAt: now,
  };

  await repository.saveReinforcementPracticeSession(session);
  await expect(repository.getReinforcementPracticeSession(session.localDate, session.insightId)).resolves.toEqual(session);
});
```

Add a v6 fixture containing `masteryProgress` and `masteryReviewSessions`, open it through the v7 repository, save a reinforcement session, and verify the v6 records remain readable.

- [ ] **Step 2: Run the storage test to verify failure.**

Run: `npx vitest run src/storage/indexedDbProgressRepository.test.ts`

Expected: FAIL because the reinforcement methods and store do not exist.

- [ ] **Step 3: Add contracts, session types, and the v7 store.**

```ts
export interface ReinforcementPracticeAnswer {
  progressId: string;
  correct: boolean;
  answeredAt: string;
}

export interface ReinforcementPracticeSession {
  id: string;
  localDate: string;
  insightId: string;
  contentKeys: string[];
  answers: ReinforcementPracticeAnswer[];
  status: 'in_progress' | 'completed' | 'skipped';
  updatedAt: string;
}

// ProgressRepository additions
saveReinforcementPracticeSession(session: ReinforcementPracticeSession): Promise<void>;
getReinforcementPracticeSession(localDate: string, insightId: string): Promise<ReinforcementPracticeSession | null>;
listReinforcementPracticeSessions(): Promise<ReinforcementPracticeSession[]>;
```

Set `DB_VERSION = 7`. Add `reinforcementPracticeSessions` keyed by `id`, with an index `byLocalDate`. Use `id = \`reinforcement-${localDate}-${insightId}\``. All saves are full session replacements; no method writes to `masteryProgress` or `reviewItems`.

- [ ] **Step 4: Run focused storage tests.**

Run: `npx vitest run src/storage/indexedDbProgressRepository.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the repository update.**

```bash
git add src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts
git commit -m "feat: persist reinforcement practice sessions"
```

### Task 3: Build the Reinforcement Practice Panel

**Files:**
- Create: `src/components/ReinforcementPracticePanel.tsx`
- Create: `src/components/ReinforcementPracticePanel.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing panel tests.**

```tsx
it('answers a two-item session and does not mutate mastery records', async () => {
  render(<ReinforcementPracticePanel insight={focusInsight} course={basicEnglishCourse} repository={repository} />);

  expect(await screen.findByText('1 of 2')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: focusQuestion.correctAnswerText }));
  expect(await screen.findByRole('status')).toHaveTextContent('Correct');
  await user.click(screen.getByRole('button', { name: 'Next question' }));
  // Answer item two, then assert completion.
  expect(await screen.findByText('Practice complete')).toBeInTheDocument();
  expect(await repository.listMasteryProgress()).toEqual(seedMasteryProgress);
});

it('persists skip and shows an alert without trapping the learner when loading fails', async () => {
  render(<ReinforcementPracticePanel insight={focusInsight} course={basicEnglishCourse} repository={failingRepository} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Practice could not be loaded.');
});
```

- [ ] **Step 2: Run the component test to verify failure.**

Run: `npx vitest run src/components/ReinforcementPracticePanel.test.tsx`

Expected: FAIL because the panel does not exist.

- [ ] **Step 3: Implement the reusable panel with session-safe state.**

```tsx
export function ReinforcementPracticePanel({
  insight,
  course,
  repository,
  now = () => new Date(),
  onComplete,
  onSkip,
}: {
  insight: DailyLearningInsight;
  course: Course;
  repository: ProgressRepository;
  now?: () => Date;
  onComplete?: () => void;
  onSkip?: () => void;
}): JSX.Element;
```

Build questions by converting each insight item into a read-only `MasteryProgress` shape and calling `buildMasteryQuestion`. Catch `MasteryQuestionContentError` per item and continue with later candidates. Persist one answer at a time to `ReinforcementPracticeSession.answers`; set `completed` only after the final feedback is acknowledged. Render `1 of N`, `role="status"` feedback, the exact correct answer after an incorrect response, `Skip practice`, and `Next question`. Disable answer controls while saving. On any load or save error, render `role="alert"` and preserve the parent page's continue actions.

- [ ] **Step 4: Add compact, responsive styles and run panel tests.**

Add only `.reinforcement-practice*` selectors. Keep the existing primary/secondary button styles, use fixed progress-label width, and ensure options wrap without shifting the card.

Run: `npx vitest run src/components/ReinforcementPracticePanel.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the practice panel.**

```bash
git add src/components/ReinforcementPracticePanel.tsx src/components/ReinforcementPracticePanel.test.tsx src/styles.css
git commit -m "feat: add optional reinforcement practice"
```

### Task 4: Add the Daily Report to Completion and My Progress

**Files:**
- Create: `src/components/DailyLearningReport.tsx`
- Create: `src/components/DailyLearningReport.test.tsx`
- Modify: `src/components/CompletionSummary.tsx`
- Modify: `src/components/CompletionSummary.test.tsx`
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/components/MePage.tsx`
- Modify: `src/components/MePage.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing report and integration tests.**

```tsx
it('shows explainable focus items and opens optional practice from the completed-day summary', async () => {
  render(<DailyLearningReport insight={focusInsight} course={basicEnglishCourse} repository={repository} />);

  expect(screen.getByRole('heading', { name: "Today's Learning" })).toBeInTheDocument();
  expect(screen.getByText('Focus on 2 items')).toBeInTheDocument();
  expect(screen.getByText('You missed this word in mastery review.')).toBeInTheDocument();
  expect(screen.getByText('Scenario: Self Introduction')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Start 3-minute practice' }));
  expect(await screen.findByText('1 of 2')).toBeInTheDocument();
});

it('keeps day completion usable when report inputs fail', async () => {
  render(<TodayPage course={basicEnglishCourse} repository={repositoryThatFailsInsightReads} />);
  // Drive output to completion.
  expect(await screen.findByRole('button', { name: 'Start Day 2' })).toBeEnabled();
  expect(screen.getByRole('alert')).toHaveTextContent('Learning report is unavailable today.');
});
```

Add a MePage test that saves a completed reinforcement session and expects a `Latest learning` summary with the scenario title and `Practice complete` state.

- [ ] **Step 2: Run targeted tests to verify failure.**

Run: `npx vitest run src/components/DailyLearningReport.test.tsx src/components/CompletionSummary.test.tsx src/components/TodayPage.test.tsx src/components/MePage.test.tsx`

Expected: FAIL because the report and new props do not exist.

- [ ] **Step 3: Implement the report component and completion integration.**

```tsx
export function DailyLearningReport({
  insight,
  course,
  repository,
  onPracticeChange,
}: {
  insight: DailyLearningInsight | null;
  course: Course;
  repository: ProgressRepository;
  onPracticeChange?: () => void;
}): JSX.Element;
```

Render `Strong today` and `No targeted practice due today.` for an empty insight. Render `Keep practicing` for one item and `Focus on N items` for more. In `CompletionSummary`, accept an optional `learningReport` node and place it after `Review tomorrow`. In `TodayPage`, load day progress, active reviews, mastery progress, and mastery sessions in an isolated `loadDailyInsight` callback after the day reaches `done`; call `buildDailyLearningInsight`; set an error flag on failure; and pass either the report or `Learning report is unavailable today.` to the completion summary. Do not await this callback in the code path that completes the day.

- [ ] **Step 4: Implement the My Progress summary.**

In MePage's existing `Promise.all`, load mastery sessions and reinforcement sessions. Build an insight for today's local date using completed-day IDs, current mastery progress, active review items, and the capability list. Add a `Latest learning` section before `I Can Say`: show outcome text, up to three scenario titles, and `Practice complete`, `Practice skipped`, or `Practice available` based on the latest matching session. If loading these optional records fails, omit this section while retaining all existing progress content.

- [ ] **Step 5: Add report styles and run targeted tests.**

Add only `.daily-learning-report*` selectors. Keep the report unframed inside completion content, use a short list for reasons, and keep the practice panel as the only framed interactive surface.

Run: `npx vitest run src/components/DailyLearningReport.test.tsx src/components/CompletionSummary.test.tsx src/components/TodayPage.test.tsx src/components/MePage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit report integrations.**

```bash
git add src/components/DailyLearningReport.tsx src/components/DailyLearningReport.test.tsx src/components/CompletionSummary.tsx src/components/CompletionSummary.test.tsx src/components/TodayPage.tsx src/components/TodayPage.test.tsx src/components/MePage.tsx src/components/MePage.test.tsx src/styles.css
git commit -m "feat: show daily learning report"
```

### Task 5: Validate the Complete Learning Loop and Documentation

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`
- Modify: `docs/superpowers/specs/2026-07-27-basic-english-daily-learning-insights-design.md`

- [ ] **Step 1: Add a desktop and mobile E2E journey.**

```ts
test('shows a daily report and completes optional reinforcement without changing mastery state', async ({ page }) => {
  await seedMasteryProgress(page, missedNameRecord);
  await seedMasteryReviewSession(page, latestSession);
  await completeCurrentDay(page, 'day-001');

  await expect(page.getByRole('heading', { name: "Today's Learning" })).toBeVisible();
  await expect(page.getByText('Focus on 1 item')).toBeVisible();
  await page.getByRole('button', { name: 'Start 3-minute practice' }).click();
  await answerReinforcementQuestion(page, firstQuestion);
  await expect(page.getByText('Practice complete')).toBeVisible();

  await page.getByRole('button', { name: 'Me', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Latest learning' })).toBeVisible();
  await expect(page.getByText('Practice complete')).toBeVisible();
  await expectMasteryProgressUnchanged(page, missedNameRecord);
});
```

Run the same test under the existing `chromium` and `mobile-chrome` projects. Add a second E2E test that clicks `Skip practice` and verifies the next-day action remains available.

- [ ] **Step 2: Run the new E2E test before implementation completion.**

Run: `npx playwright test tests/e2e/basic-english.spec.ts --grep "daily report"`

Expected: PASS on chromium and mobile-chrome.

- [ ] **Step 3: Add implementation notes to the approved specification.**

Append an `## Implementation Notes` section that states: IndexedDB v7 adds `reinforcementPracticeSessions`; insights are derived rather than stored; reinforcement never changes `masteryProgress` or `reviewItems`; and final verification uses the commands below.

- [ ] **Step 4: Run all release verification commands.**

Run: `npx vitest run --exclude ".worktrees/**"`

Expected: all unit and component tests pass.

Run: `npm run build`

Expected: TypeScript and Vite build pass.

Run: `npm run content:health`

Expected: output contains `Errors (0)`.

Run: `npm run test:e2e`

Expected: all Chromium and mobile Chromium tests pass.

- [ ] **Step 5: Commit final verification and documentation.**

```bash
git add tests/e2e/basic-english.spec.ts docs/superpowers/specs/2026-07-27-basic-english-daily-learning-insights-design.md
git commit -m "test: cover daily learning insights journey"
```

## Plan Self-Review

- The daily report, scenario connection, explainable priority, and two-to-three-question optional practice are implemented by Tasks 1, 3, and 4.
- The strict separation from mastery and manual review is covered by Task 2 contracts and Task 3/component plus Task 5/E2E assertions.
- Empty, insufficient-data, question construction, and persistence failures are covered by Task 1 selection rules, Task 3 alert behavior, and Task 4 non-blocking integration tests.
- The IndexedDB v7 migration and compatibility of prior mastery stores are covered by Task 2.
- The plan contains no placeholder work and all referenced interfaces are introduced before their consumers.
