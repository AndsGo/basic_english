# Basic English V1.2 Scenario Map and Week 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Scenario Map capabilities and a complete Week 2 learning week so learners can describe rooms, common things, and where things are.

**Architecture:** Keep the app frontend-only and data-driven. Split Week 2 content and scenario capabilities into typed content modules, add pure capability helpers, then update Course/Me/Today to operate across all weeks instead of Week 1 only.

**Tech Stack:** Vite, React, TypeScript, Vitest, React Testing Library, fake-indexeddb, IndexedDB via `idb`, Playwright.

---

## Spec Source

Implement against:

- `docs/superpowers/specs/2026-05-26-basic-english-v1-2-scenario-map-week-2-design.md`

Current important constraints:

- `src/content/week1.ts` currently exports `week1Course` with the full Course object.
- `TodayPage` already supports `course.weeks.flatMap(...)` and current-day selection across all supplied weeks.
- `CoursePage` still displays only `course.weeks[0]`.
- `MePage` has progress and saved outputs, but no `I Can Say` section.
- `validateCourseContent` validates a `Course`, but not scenario capabilities.
- Existing Week 1 Chinese strings contain mojibake. V1.2 should not add new mojibake; use readable English and simple Chinese only where existing type fields require Chinese.

## File Structure

Create:

- `src/content/week2.ts`: Week 2 words, patterns, days, and weekly check.
- `src/content/course.ts`: combines Week 1 and Week 2 into the exported `basicEnglishCourse`.
- `src/content/scenarioCapabilities.ts`: 12-week scenario roadmap and initial capability data.
- `src/domain/capabilities.ts`: pure helpers for unlocked and next capabilities.
- `src/domain/capabilities.test.ts`: tests for capability unlock state.

Modify:

- `src/domain/types.ts`: add scenario capability types.
- `src/content/week1.ts`: export Week 1 pieces or keep existing export while enabling `course.ts` to compose with Week 2.
- `src/content/validateContent.ts`: validate multi-week course and scenario capability references.
- `src/content/validateContent.test.ts`: cover Week 2 and scenario validation.
- `src/App.tsx`: import the combined course and scenario capabilities.
- `src/components/CoursePage.tsx`: render Week 1 and Week 2 sections.
- `src/components/CoursePage.test.tsx`: cover multi-week display and Week 2 lock/unlock states.
- `src/components/MePage.tsx`: render `I Can Say`.
- `src/components/TodayPage.test.tsx`: cover Day 8 current after Day 1-7 completion.
- `src/App.test.tsx`: update expectations for two-week Course and Me capability rendering.
- `tests/e2e/basic-english.spec.ts`: add V1.2 E2E coverage.

---

### Task 1: Add Scenario Capability Domain

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/domain/capabilities.ts`
- Create: `src/domain/capabilities.test.ts`

- [ ] **Step 1: Write failing capability tests**

Create `src/domain/capabilities.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { ScenarioCapability } from './types';
import { getCapabilityStates } from './capabilities';

const capabilities: ScenarioCapability[] = [
  {
    id: 'introduce-myself',
    title: 'I can introduce myself.',
    description: 'Say name and place.',
    unlockedByDayIds: ['day-001'],
    exampleOutputs: ['My name is Li.'],
  },
  {
    id: 'describe-my-room',
    title: 'I can describe my room.',
    description: 'Say simple facts about a room.',
    unlockedByDayIds: ['day-008'],
    exampleOutputs: ['This is my room.'],
  },
  {
    id: 'say-where-things-are',
    title: 'I can say where things are.',
    description: 'Use in, on, under, and near.',
    unlockedByDayIds: ['day-010'],
    exampleOutputs: ['The book is on the table.'],
  },
];

describe('capability states', () => {
  it('marks capabilities unlocked when all required days are complete', () => {
    const states = getCapabilityStates(capabilities, ['day-001', 'day-008']);

    expect(states.unlocked.map((capability) => capability.id)).toEqual(['introduce-myself', 'describe-my-room']);
    expect(states.next?.id).toBe('say-where-things-are');
    expect(states.locked.map((capability) => capability.id)).toEqual(['say-where-things-are']);
  });

  it('keeps multi-day capabilities locked until every required day is complete', () => {
    const multiDay: ScenarioCapability = {
      id: 'week-2-check',
      title: 'I can describe my room and things.',
      description: 'Complete the Week 2 check.',
      unlockedByDayIds: ['day-008', 'day-014'],
      exampleOutputs: ['This is my room. There is a book on the table.'],
    };

    expect(getCapabilityStates([multiDay], ['day-008']).unlocked).toEqual([]);
    expect(getCapabilityStates([multiDay], ['day-008', 'day-014']).unlocked).toEqual([multiDay]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/domain/capabilities.test.ts
```

Expected: FAIL because `ScenarioCapability` and `capabilities.ts` do not exist.

- [ ] **Step 3: Add capability types**

Append to `src/domain/types.ts`:

```ts
export interface ScenarioCapability {
  id: string;
  title: string;
  description: string;
  unlockedByDayIds: string[];
  exampleOutputs: string[];
}

export interface ScenarioWeek {
  weekNumber: number;
  theme: string;
  expressionOutcome: string;
}
```

- [ ] **Step 4: Implement capability helpers**

Create `src/domain/capabilities.ts`:

```ts
import type { ScenarioCapability } from './types';

export interface CapabilityStates {
  unlocked: ScenarioCapability[];
  locked: ScenarioCapability[];
  next: ScenarioCapability | null;
}

export function getCapabilityStates(capabilities: ScenarioCapability[], completedDayIds: string[]): CapabilityStates {
  const completed = new Set(completedDayIds);
  const unlocked: ScenarioCapability[] = [];
  const locked: ScenarioCapability[] = [];

  capabilities.forEach((capability) => {
    const isUnlocked = capability.unlockedByDayIds.every((dayId) => completed.has(dayId));
    if (isUnlocked) {
      unlocked.push(capability);
    } else {
      locked.push(capability);
    }
  });

  return {
    unlocked,
    locked,
    next: locked[0] ?? null,
  };
}
```

- [ ] **Step 5: Verify Task 1**

Run:

```powershell
npm test -- src/domain/capabilities.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit Task 1**

Run:

```powershell
git add src/domain/types.ts src/domain/capabilities.ts src/domain/capabilities.test.ts
git commit -m "feat: add scenario capability domain"
```

---

### Task 2: Add Week 2 Content and Combined Course

**Files:**
- Create: `src/content/week2.ts`
- Create: `src/content/course.ts`
- Modify: `src/content/week1.ts`
- Modify: `src/App.tsx`
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Write failing content composition test**

Create or update `src/content/validateContent.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import { basicEnglishCourse } from './course';
import { validateCourseContent } from './validateContent';

describe('basicEnglishCourse V1.2', () => {
  it('contains Week 1 and a complete Week 2', () => {
    expect(basicEnglishCourse.weeks).toHaveLength(2);
    expect(basicEnglishCourse.weeks[1]).toMatchObject({
      id: 'week-02',
      number: 2,
      title: 'Home & Things',
    });
    expect(basicEnglishCourse.weeks[1].days.map((day) => day.id)).toEqual([
      'day-008',
      'day-009',
      'day-010',
      'day-011',
      'day-012',
      'day-013',
      'day-014',
    ]);
  });

  it('validates the combined course content', () => {
    expect(validateCourseContent(basicEnglishCourse).errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL because `src/content/course.ts` and Week 2 do not exist.

- [ ] **Step 3: Refactor Week 1 exports carefully**

In `src/content/week1.ts`, keep `week1Course` exported for existing tests. Also export the reusable pieces:

```ts
export const week1Words = words;
export const week1Patterns = patterns;
export const week1 = week1Course.weeks[0];
```

Do not rename `week1Course` yet; existing imports can continue working.

- [ ] **Step 4: Create Week 2 content**

Create `src/content/week2.ts`.

Use these IDs:

- week: `week-02`
- days: `day-008` through `day-014`
- output IDs: `day-008-output` through `day-014-output`

Create words with readable English definitions and simple Chinese help. Required word IDs:

```text
room, home, table, chair, bed, door, window,
book, phone, bag, box, cup, pen, paper, thing,
in, on, under, near,
small, big, clean, new, old, useful, important, good,
use, every, day, money, card, key
```

For any word already present in Week 1, do not duplicate the word ID in Week 2 content. Use existing IDs when possible.

Create patterns with IDs:

```text
this-is-my
my-thing-is
i-have-a
there-is
there-are
thing-is-on
thing-is-in
thing-is-under
thing-is-near
it-is-useful
it-is-important
i-use-it-every-day
i-use-it-because
```

Each Day 8-14 must include:

- 6-13 words.
- 1-5 patterns.
- 5-8 exercises.
- at least one translation exercise.
- one output task with required sentence count 4+.

Use these day goals and output tasks:

```ts
Day 8: My Room
Goal: Describe your room with simple sentences.
Output: Write 4-5 sentences about your room.

Day 9: Things in My Room
Goal: Say what things are in your room.
Output: Write 4-5 sentences about things in your room.

Day 10: On / In / Under
Goal: Say where things are.
Output: Write 4-5 sentences saying where things are.

Day 11: My Table
Goal: Describe your table and study things.
Output: Write 4-5 sentences about your table or study place.

Day 12: My Phone and Bag
Goal: Describe personal things you use every day.
Output: Write 4-5 sentences about your phone, bag, or other personal things.

Day 13: Useful and Important Things
Goal: Say why a thing is useful or important.
Output: Write 5 sentences about things that are useful or important to you.

Day 14: Weekly Check
Goal: Describe your room and things without fully copying a template.
Output: Write 6-8 sentences describing your room, your things, and where things are.
```

For Day 14, include a weekly rubric following the same structure as Day 7.

- [ ] **Step 5: Combine Week 1 and Week 2 into a course**

Create `src/content/course.ts`:

```ts
import type { Course } from '../domain/types';
import { week1, week1Patterns, week1Words } from './week1';
import { week2, week2Patterns, week2Words } from './week2';

export const basicEnglishCourse: Course = {
  id: 'basic-english-12-weeks',
  title: 'Basic English 12 Weeks',
  contentVersion: '1.2.0',
  schemaVersion: 1,
  words: [...week1Words, ...week2Words],
  patterns: [...week1Patterns, ...week2Patterns],
  weeks: [week1, week2],
};
```

- [ ] **Step 6: Switch app and E2E imports to combined course**

In `src/App.tsx`, replace `week1Course` import/use with `basicEnglishCourse`.

In `tests/e2e/basic-english.spec.ts`, replace `week1Course` import/use with `basicEnglishCourse`. Keep any helper names accurate.

- [ ] **Step 7: Verify Task 2**

Run:

```powershell
npm test -- src/content/validateContent.test.ts src/App.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 8: Commit Task 2**

Run:

```powershell
git add src/content/week1.ts src/content/week2.ts src/content/course.ts src/content/validateContent.test.ts src/App.tsx tests/e2e/basic-english.spec.ts
git commit -m "feat: add week 2 course content"
```

---

### Task 3: Add Scenario Map Content and Validation

**Files:**
- Create: `src/content/scenarioCapabilities.ts`
- Modify: `src/content/validateContent.ts`
- Modify: `src/content/validateContent.test.ts`

- [ ] **Step 1: Write failing scenario validation tests**

Add to `src/content/validateContent.test.ts`:

```ts
import { scenarioCapabilities, scenarioWeekMap } from './scenarioCapabilities';
import { validateScenarioCapabilities } from './validateContent';

describe('scenario capabilities', () => {
  it('defines the 12-week scenario roadmap', () => {
    expect(scenarioWeekMap).toHaveLength(12);
    expect(scenarioWeekMap[1]).toMatchObject({
      weekNumber: 2,
      theme: 'Home & Things',
    });
  });

  it('references valid day IDs and has usable examples', () => {
    expect(validateScenarioCapabilities(scenarioCapabilities, basicEnglishCourse).errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/content/validateContent.test.ts
```

Expected: FAIL because `scenarioCapabilities.ts` and `validateScenarioCapabilities` do not exist.

- [ ] **Step 3: Create scenario content**

Create `src/content/scenarioCapabilities.ts`:

```ts
import type { ScenarioCapability, ScenarioWeek } from '../domain/types';

export const scenarioWeekMap: ScenarioWeek[] = [
  { weekNumber: 1, theme: 'People & Identity', expressionOutcome: 'Introduce yourself and another person.' },
  { weekNumber: 2, theme: 'Home & Things', expressionOutcome: 'Describe your room, things, and where things are.' },
  { weekNumber: 3, theme: 'Daily Life', expressionOutcome: 'Say what you do every day.' },
  { weekNumber: 4, theme: 'Food & Shopping', expressionOutcome: 'Order food and buy simple things.' },
  { weekNumber: 5, theme: 'Places & Directions', expressionOutcome: 'Ask where things are and say where to go.' },
  { weekNumber: 6, theme: 'People & Feelings', expressionOutcome: 'Describe feelings, likes, and simple relationships.' },
  { weekNumber: 7, theme: 'Problems & Help', expressionOutcome: 'Explain a problem and ask for help.' },
  { weekNumber: 8, theme: 'Health & Body', expressionOutcome: 'Describe simple health and body problems.' },
  { weekNumber: 9, theme: 'Past Simple Ideas', expressionOutcome: 'Say what happened yesterday.' },
  { weekNumber: 10, theme: 'Future Plans', expressionOutcome: 'Say what you will do tomorrow or later.' },
  { weekNumber: 11, theme: 'Opinions & Reasons', expressionOutcome: 'Say what you like, dislike, and why.' },
  { weekNumber: 12, theme: 'Final Scenario Practice', expressionOutcome: 'Answer daily-life scenario prompts.' },
];

export const scenarioCapabilities: ScenarioCapability[] = [
  {
    id: 'introduce-myself',
    title: 'I can introduce myself.',
    description: 'Say your name, place, and learner identity.',
    unlockedByDayIds: ['day-001'],
    exampleOutputs: ['My name is Li.', 'I am from China.'],
  },
  {
    id: 'introduce-another-person',
    title: 'I can introduce another person.',
    description: 'Introduce a friend or family member.',
    unlockedByDayIds: ['day-004'],
    exampleOutputs: ['This is my friend.', 'She is kind.'],
  },
  {
    id: 'say-why-i-study-english',
    title: 'I can say why I study English.',
    description: 'Give a simple reason for learning English.',
    unlockedByDayIds: ['day-006'],
    exampleOutputs: ['I study English because it is useful.'],
  },
  {
    id: 'describe-my-room',
    title: 'I can describe my room.',
    description: 'Say simple facts about your room.',
    unlockedByDayIds: ['day-008'],
    exampleOutputs: ['This is my room.', 'My room is small.'],
  },
  {
    id: 'say-things-in-my-room',
    title: 'I can say what things are in my room.',
    description: 'Say what objects are in your room.',
    unlockedByDayIds: ['day-009'],
    exampleOutputs: ['There is a book in my room.'],
  },
  {
    id: 'say-where-things-are',
    title: 'I can say where things are.',
    description: 'Use in, on, under, and near.',
    unlockedByDayIds: ['day-010'],
    exampleOutputs: ['The book is on the table.'],
  },
  {
    id: 'describe-study-things',
    title: 'I can describe study things on my table.',
    description: 'Describe a table and study objects.',
    unlockedByDayIds: ['day-011'],
    exampleOutputs: ['There is a pen on my table.'],
  },
  {
    id: 'describe-personal-things',
    title: 'I can describe personal things in my bag.',
    description: 'Describe personal things used every day.',
    unlockedByDayIds: ['day-012'],
    exampleOutputs: ['My phone is in my bag.'],
  },
  {
    id: 'describe-important-things',
    title: 'I can describe important things in my life.',
    description: 'Say why a thing is useful or important.',
    unlockedByDayIds: ['day-014'],
    exampleOutputs: ['It is important to me.', 'I use it every day.'],
  },
];
```

- [ ] **Step 4: Add scenario validation**

In `src/content/validateContent.ts`, export:

```ts
import type { Course, ScenarioCapability } from '../domain/types';

export function validateScenarioCapabilities(capabilities: ScenarioCapability[], course: Course): ValidationResult {
  const errors: string[] = [];
  const dayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));
  const capabilityIds = new Set<string>();

  capabilities.forEach((capability) => {
    if (!capability.id.trim()) errors.push('Scenario capability has empty id');
    if (capabilityIds.has(capability.id)) errors.push(`Duplicate scenario capability id: ${capability.id}`);
    capabilityIds.add(capability.id);

    if (!capability.title.trim() || !capability.description.trim()) {
      errors.push(`${capability.id} is missing title or description`);
    }
    if (capability.unlockedByDayIds.length === 0) {
      errors.push(`${capability.id} must reference at least one unlock day`);
    }
    capability.unlockedByDayIds.forEach((dayId) => {
      if (!dayIds.has(dayId)) errors.push(`${capability.id} references missing day ${dayId}`);
    });
    if (capability.exampleOutputs.length === 0 || capability.exampleOutputs.some((output) => !output.trim())) {
      errors.push(`${capability.id} must have non-empty example outputs`);
    }
  });

  return { errors };
}
```

If import duplication occurs because `Course` is already imported at the top, merge imports instead of adding a duplicate import.

- [ ] **Step 5: Verify Task 3**

Run:

```powershell
npm test -- src/content/validateContent.test.ts src/domain/capabilities.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit Task 3**

Run:

```powershell
git add src/content/scenarioCapabilities.ts src/content/validateContent.ts src/content/validateContent.test.ts
git commit -m "feat: add scenario map content validation"
```

---

### Task 4: Update Course for Multiple Weeks

**Files:**
- Modify: `src/components/CoursePage.tsx`
- Modify: `src/components/CoursePage.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing Course tests**

Add to `src/components/CoursePage.test.tsx`:

```tsx
import { basicEnglishCourse } from '../content/course';

it('shows Week 2 locked until Week 1 is complete', () => {
  render(
    <CoursePage
      course={basicEnglishCourse}
      completedDayIds={[]}
      activeReviewDayIds={[]}
      reviewCount={0}
      onStartDay={() => undefined}
    />,
  );

  expect(screen.getByText('Home & Things')).toBeInTheDocument();
  expect(screen.getByText('Complete Week 1 to unlock Home & Things.')).toBeInTheDocument();
});

it('shows Day 8 current after Week 1 is complete', () => {
  render(
    <CoursePage
      course={basicEnglishCourse}
      completedDayIds={['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006', 'day-007']}
      activeReviewDayIds={[]}
      reviewCount={0}
      onStartDay={() => undefined}
    />,
  );

  expect(screen.getByText('Week 2: Home & Things')).toBeInTheDocument();
  expect(screen.getByText('0 / 7 days completed')).toBeInTheDocument();
  expect(screen.getByText('Day 8: My Room')).toBeInTheDocument();
  expect(screen.getByText('Current')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/components/CoursePage.test.tsx
```

Expected: FAIL because Course renders only Week 1.

- [ ] **Step 3: Implement multi-week Course rendering**

Update `CoursePage` to render every `course.weeks` entry.

Rules:

- `orderedDayIds` for state derivation should include all days across all weeks.
- `completedDayIds` displayed per week should count only that week's days.
- Week 2 is locked when not every Week 1 day is completed.
- Locked weeks show the message `Complete Week 1 to unlock Home & Things.`.
- Day cards in locked weeks are visible but non-actionable.

Use helper functions inside `CoursePage.tsx`:

```ts
function isWeekUnlocked(weekNumber: number, course: Course, completedDayIds: string[]) {
  if (weekNumber === 1) return true;
  const previousWeeks = course.weeks.filter((week) => week.number < weekNumber);
  const requiredDayIds = previousWeeks.flatMap((week) => week.days.map((day) => day.id));
  const completed = new Set(completedDayIds);
  return requiredDayIds.every((dayId) => completed.has(dayId));
}

function countCompletedInWeek(dayIds: string[], completedDayIds: string[]) {
  const completed = new Set(completedDayIds);
  return dayIds.filter((dayId) => completed.has(dayId)).length;
}
```

Render week headings as:

```tsx
<h2>Week {week.number}: {week.title}</h2>
```

- [ ] **Step 4: Add multi-week Course styles**

Append:

```css
.week-section {
  display: grid;
  gap: 14px;
}

.week-section + .week-section {
  margin-top: 28px;
}
```

- [ ] **Step 5: Verify Task 4**

Run:

```powershell
npm test -- src/components/CoursePage.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit Task 4**

Run:

```powershell
git add src/components/CoursePage.tsx src/components/CoursePage.test.tsx src/styles.css
git commit -m "feat: show multi-week course map"
```

---

### Task 5: Add I Can Say to Me Page

**Files:**
- Modify: `src/components/MePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing App/Me tests**

Add to `src/App.test.tsx`:

```tsx
it('shows unlocked I Can Say capabilities in Me', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Me' }));

  expect(await screen.findByText('I Can Say')).toBeInTheDocument();
  expect(screen.getByText('Next')).toBeInTheDocument();
});
```

If existing `App.test.tsx` already has a Me navigation test, add these assertions there.

- [ ] **Step 2: Run test to verify failure**

Run:

```powershell
npm test -- src/App.test.tsx
```

Expected: FAIL because Me does not render `I Can Say`.

- [ ] **Step 3: Update MePage props and rendering**

In `src/components/MePage.tsx`, add props:

```ts
import type { ScenarioCapability } from '../domain/types';
import { getCapabilityStates } from '../domain/capabilities';

scenarioCapabilities?: ScenarioCapability[];
```

After completed days are loaded, compute:

```ts
const completedDayIds = days.filter((day) => day.status === 'completed').map((day) => day.dayId);
const capabilityStates = getCapabilityStates(scenarioCapabilities ?? [], completedDayIds);
```

Render:

```tsx
{scenarioCapabilities && scenarioCapabilities.length > 0 && (
  <section>
    <h3>I Can Say</h3>
    <h4>Unlocked</h4>
    {capabilityStates.unlocked.length > 0 ? (
      <ul>
        {capabilityStates.unlocked.map((capability) => (
          <li key={capability.id}>{capability.title}</li>
        ))}
      </ul>
    ) : (
      <p>No capabilities unlocked yet.</p>
    )}
    <h4>Next</h4>
    {capabilityStates.next ? (
      <p>{capabilityStates.next.title} Complete {capabilityStates.next.unlockedByDayIds[0].replace('day-0', 'Day ')}.</p>
    ) : (
      <p>All available capabilities unlocked.</p>
    )}
  </section>
)}
```

If day label formatting is awkward for `day-010`, implement a helper:

```ts
function formatDayLabel(dayId: string) {
  return `Day ${Number(dayId.replace('day-', ''))}`;
}
```

- [ ] **Step 4: Pass scenario capabilities from App**

In `src/App.tsx`, import:

```ts
import { scenarioCapabilities } from './content/scenarioCapabilities';
```

Pass to `MePage`:

```tsx
<MePage repository={repository} scenarioCapabilities={scenarioCapabilities} ... />
```

- [ ] **Step 5: Verify Task 5**

Run:

```powershell
npm test -- src/App.test.tsx src/domain/capabilities.test.ts
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 6: Commit Task 5**

Run:

```powershell
git add src/components/MePage.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: show i can say capabilities"
```

---

### Task 6: Wire Day 8 Current State and Week 2 Tests

**Files:**
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/domain/progress.test.ts`

- [ ] **Step 1: Add current-day tests across two weeks**

Add to `src/domain/progress.test.ts`:

```ts
it('selects Day 8 after Week 1 is complete', () => {
  const orderedDayIds = [
    'day-001',
    'day-002',
    'day-003',
    'day-004',
    'day-005',
    'day-006',
    'day-007',
    'day-008',
  ];
  expect(getCurrentDayId(orderedDayIds.slice(0, 7), orderedDayIds)).toBe('day-008');
});
```

Add to `src/components/TodayPage.test.tsx`:

```tsx
import { basicEnglishCourse } from '../content/course';

it('shows Day 8 after Day 1-7 are completed', async () => {
  const repo = createIndexedDbProgressRepository('today-v1-2-day-8');
  for (let index = 1; index <= 7; index += 1) {
    const dayId = `day-${String(index).padStart(3, '0')}`;
    await repo.saveDayProgress({
      id: dayId,
      dayId,
      status: 'completed',
      currentStep: 'done',
      completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
      startedAt: '2026-05-26T00:00:00.000Z',
      completedAt: '2026-05-26T00:10:00.000Z',
      updatedAt: '2026-05-26T00:10:00.000Z',
      contentVersion: basicEnglishCourse.contentVersion,
    });
  }

  render(<TodayPage course={basicEnglishCourse} repository={repo} />);

  expect(await screen.findByText('My Room')).toBeInTheDocument();
  expect(screen.getByText(/Week 2 \/ Day 8/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify**

Run:

```powershell
npm test -- src/domain/progress.test.ts src/components/TodayPage.test.tsx
```

Expected: tests pass if Task 2 content and Today's existing all-week logic are correct. If they fail because Today header hard-codes `Week 1`, update Today header to derive the week number from `day.weekId` or the parent week.

- [ ] **Step 3: Update Today week label**

Update `TodayPage.tsx` so the header derives the week from `day.weekId`:

```ts
const currentWeek = course.weeks.find((week) => week.id === day.weekId) ?? course.weeks[0];
```

Render:

```tsx
<p className="eyebrow">Week {currentWeek.number} / Day {day.dayNumber}</p>
```

- [ ] **Step 4: Verify Task 6**

Run:

```powershell
npm test -- src/domain/progress.test.ts src/components/TodayPage.test.tsx
npm run build
```

Expected: tests pass and build exits with code 0.

- [ ] **Step 5: Commit Task 6**

Run:

```powershell
git add src/domain/progress.test.ts src/components/TodayPage.test.tsx src/components/TodayPage.tsx
git commit -m "feat: support day 8 current learning state"
```

---

### Task 7: Add V1.2 E2E Coverage

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`

- [ ] **Step 1: Add helper to seed Week 1 completion**

In `tests/e2e/basic-english.spec.ts`, add a browser-side helper:

```ts
async function seedCompletedDays(page, dayIds: string[]) {
  await page.evaluate(async ({ dayIds }) => {
    const request = indexedDB.open('basic-english-progress', 3);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('dayProgress')) db.createObjectStore('dayProgress', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('userOutputs')) db.createObjectStore('userOutputs', { keyPath: 'dayId' });
        if (!db.objectStoreNames.contains('reviewItems')) db.createObjectStore('reviewItems', { keyPath: 'id' });
      };
    });

    await Promise.all(dayIds.map((dayId) => new Promise<void>((resolve, reject) => {
      const tx = db.transaction('dayProgress', 'readwrite');
      tx.objectStore('dayProgress').put({
        id: dayId,
        dayId,
        status: 'completed',
        currentStep: 'done',
        completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
        startedAt: '2026-05-26T00:00:00.000Z',
        completedAt: '2026-05-26T00:10:00.000Z',
        updatedAt: '2026-05-26T00:10:00.000Z',
        contentVersion: '1.2.0',
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    })));
    db.close();
  }, { dayIds });
}
```

If the app's repository creates more stores during upgrade, extend the helper to create those stores with the same key paths used in `indexedDbProgressRepository.ts`.

- [ ] **Step 2: Add Week 2 unlock and Day 8 test**

Add:

```ts
test('unlocks Week 2 after Week 1 and shows Day 8 capability after completion', async ({ page }) => {
  await page.goto('/');
  await seedCompletedDays(page, ['day-001', 'day-002', 'day-003', 'day-004', 'day-005', 'day-006', 'day-007']);
  await page.reload();

  await expect(page.getByText('My Room')).toBeVisible();
  await expect(page.getByText(/Week 2/)).toBeVisible();

  await page.getByRole('button', { name: 'Course' }).click();
  await expect(page.getByText('Week 2: Home & Things')).toBeVisible();
  await expect(page.getByText('Day 8: My Room')).toBeVisible();

  await page.getByRole('button', { name: 'Today' }).click();
  await completeCurrentDay(page, {
    output: 'This is my room. My room is small. I have a table. There is a book on the table.',
  });

  await expect(page.getByText('Day 8 complete')).toBeVisible();
  await page.getByRole('button', { name: 'Me' }).click();
  await expect(page.getByText('I can describe my room.')).toBeVisible();
});
```

Implement `completeCurrentDay` by reusing the existing Day 1 E2E flow helpers. It should:

- mark all current words Know or Review.
- practice all patterns.
- answer all drills.
- complete translation with `Close enough`.
- fill output and checklist.
- click Continue until done.

Avoid hard-coding Day 8-specific corrupted Chinese text.

- [ ] **Step 3: Add locked Week 2 mobile Course assertion**

Add or extend mobile E2E:

```ts
await page.getByRole('button', { name: 'Course' }).click();
await expect(page.getByText('Week 2: Home & Things')).toBeVisible();
await expect(page.getByText('Complete Week 1 to unlock Home & Things.')).toBeVisible();
```

- [ ] **Step 4: Verify Task 7**

Run:

```powershell
npm run build
npm run test:e2e
```

Expected: build passes and Playwright tests pass.

- [ ] **Step 5: Commit Task 7**

Run:

```powershell
git add tests/e2e/basic-english.spec.ts
git commit -m "test: cover v1.2 week 2 flow"
```

---

### Task 8: Final Verification

**Files:**
- Modify only files required by verification failures.

- [ ] **Step 1: Run full verification**

Run:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected:

- `npm test` exits with code 0.
- `npm run build` exits with code 0.
- `npm run test:e2e` exits with code 0.

- [ ] **Step 2: Check worktree**

Run:

```powershell
git status --short
```

Expected: clean.

- [ ] **Step 3: Commit verification fixes when verification changes files**

If verification exposed issues, fix them and run the failing command again. Commit fixes:

```powershell
git add src tests docs
git commit -m "fix: stabilize v1.2 verification"
```

When Step 1 and Step 2 pass with no file changes, skip this commit step.

---

## Self-Review Checklist

Spec coverage:

- Scenario capability data structure: Task 1.
- Initial 12-week scenario map: Task 3.
- Week 2 full content Day 8-14: Task 2.
- Course Week 1 + Week 2: Task 4.
- Day unlock across weeks: Task 6.
- Me `I Can Say`: Task 5.
- Multi-week and scenario validation: Task 3.
- E2E Day 8 unlock/completion/capability: Task 7.

Final commands:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected final state:

- Week 2 is playable through Day 14.
- Day 8 unlocks after Day 7.
- Course displays two weeks.
- Me displays `I Can Say`.
- V1.2 tests, build, and E2E pass.
