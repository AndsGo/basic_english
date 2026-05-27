# Basic English V1.3 Expression Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the final Today output step into a three-part daily-life expression loop and surface completed scene abilities in Today and Me.

**Architecture:** Extend the existing local-first `UserOutput` record with an optional `scene` object, so IndexedDB keeps using the existing `userOutputs` store. Add scene goal content as a day-id keyed map, use pure domain helpers for completion and scene state, then integrate focused React components into Today and Me.

**Tech Stack:** React 19, TypeScript, Vite, Vitest with Testing Library, IndexedDB via `idb`, Playwright E2E.

---

## Preflight

The working tree currently contains uncommitted Today speech and button feedback fixes. Before implementing this V1.3 plan, either commit those fixes or move V1.3 work to a clean worktree.

Run:

```powershell
git status --short
```

Expected before starting V1.3 implementation:

```text
```

If the tree is not clean, stop and preserve existing work with a focused commit before continuing.

## File Structure

Create:

- `src/content/sceneGoals.ts` - V1.3 scene goal content, keyed by day id.
- `src/domain/sceneOutput.ts` - pure helpers for scene output defaults, completion, and completed scene ids.
- `src/domain/sceneOutput.test.ts` - tests for pure scene output behavior.
- `src/components/SceneGoalBanner.tsx` - Today scene target summary.
- `src/components/SceneGoalBanner.test.tsx` - component tests for the banner.
- `src/components/SceneOutputEditor.tsx` - three-part output editor with help modes.
- `src/components/SceneOutputEditor.test.tsx` - component tests for editor behavior.
- `src/components/SceneMap.tsx` - reusable lightweight scene map for Today and Me.
- `src/components/SceneMap.test.tsx` - component tests for completed/current/next states.

Modify:

- `src/domain/types.ts` - add `SceneGoal`, `SceneOutput`, and `SceneHelpMode` types.
- `src/storage/progressRepository.ts` - add optional `scene` to `UserOutput`.
- `src/storage/indexedDbProgressRepository.ts` - normalize partially missing scene output fields.
- `src/storage/indexedDbProgressRepository.test.ts` - verify scene persistence and backward compatibility.
- `src/content/validateContent.ts` - validate scene goals.
- `src/content/validateContent.test.ts` - cover valid and invalid scene goal content.
- `src/components/TodayPage.tsx` - wire scene goals, scene completion, and scene editor into the output step.
- `src/components/TodayPage.test.tsx` - cover Today scene gating and persistence.
- `src/components/MePage.tsx` - use completed scene outputs when highlighting capabilities.
- `src/components/MePage.test.tsx` - cover Me scene map behavior.
- `src/App.tsx` - pass scene goals into Today and Me.
- `src/styles.css` - add focused styles for scene banner, editor, help mode control, and scene map.
- `tests/e2e/basic-english.spec.ts` - update Day 1 and Day 8 flows to fill scene output and verify scene map persistence.

---

### Task 1: Add Scene Output Types and Content

**Files:**
- Modify: `src/domain/types.ts`
- Create: `src/content/sceneGoals.ts`
- Modify: `src/content/validateContent.ts`
- Modify: `src/content/validateContent.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add these tests to `src/content/validateContent.test.ts`:

```ts
import { sceneGoalsByDayId } from './sceneGoals';
import { validateSceneGoals } from './validateContent';

it('validates scene goals for existing playable days', () => {
  const result = validateSceneGoals(sceneGoalsByDayId, basicEnglishCourse);

  expect(result.errors).toEqual([]);
});

it('reports scene goals that reference missing days', () => {
  const result = validateSceneGoals(
    {
      'day-999': {
        id: 'missing-day-scene',
        title: 'Missing Day',
        capability: 'I can describe a missing day.',
        templates: ['This is ____.'],
        guidedPrompts: ['Say one thing.'],
        scenePrompt: 'Describe one thing.',
        dialoguePrompts: ['Ask and answer one question.'],
      },
    },
    basicEnglishCourse,
  );

  expect(result.errors).toContain('Scene goal day-999 references missing day');
});

it('reports incomplete scene goals', () => {
  const result = validateSceneGoals(
    {
      'day-001': {
        id: '',
        title: '',
        capability: '',
        templates: [''],
        guidedPrompts: [],
        scenePrompt: '',
        dialoguePrompts: [],
      },
    },
    basicEnglishCourse,
  );

  expect(result.errors).toEqual([
    'Scene goal for day-001 is missing id, title, or capability',
    'Scene goal for day-001 must include non-empty templates',
    'Scene goal for day-001 must include non-empty guided prompts',
    'Scene goal for day-001 must include a scene prompt',
    'Scene goal for day-001 must include non-empty dialogue prompts',
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/content/validateContent.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because `sceneGoals`, `SceneGoal`, and `validateSceneGoals` do not exist.

- [ ] **Step 3: Add scene types**

Add to `src/domain/types.ts`:

```ts
export type SceneHelpMode = 'template' | 'guided' | 'free';

export interface SceneOutput {
  sceneId: string;
  helpMode: SceneHelpMode;
  sentences: string[];
  sceneText: string;
  dialogue: string;
  completedAt?: string;
}

export interface SceneGoal {
  id: string;
  title: string;
  capability: string;
  templates: string[];
  guidedPrompts: string[];
  scenePrompt: string;
  dialoguePrompts: string[];
}
```

- [ ] **Step 4: Add initial scene goal content**

Create `src/content/sceneGoals.ts`:

```ts
import type { SceneGoal } from '../domain/types';

export const sceneGoalsByDayId: Record<string, SceneGoal> = {
  'day-001': {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: ['My name is ____.', 'I am from ____.', 'I am a ____.', 'I study English.'],
    guidedPrompts: ['Say your name.', 'Say where you are from.', 'Say what you do.', 'Say why you study English.'],
    scenePrompt: 'Use your sentences to describe yourself clearly.',
    dialoguePrompts: ['Ask and answer about your name.', 'Ask and answer about where you are from.'],
  },
  'day-008': {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: ['This is my room.', 'My room is ____.', 'I have a ____.', 'There is a ____ in my room.'],
    guidedPrompts: ['Say what your room is.', 'Say if it is big or small.', 'Say what you have.', 'Say one thing in your room.'],
    scenePrompt: 'Use your sentences to describe your room.',
    dialoguePrompts: ['Ask and answer about your room.', 'Ask and answer about one thing in your room.'],
  },
  'day-009': {
    id: 'room-things',
    title: 'Things in My Room',
    capability: 'I can say what things are in my room.',
    templates: ['There is a ____.', 'There are ____.', 'I have a ____ in my room.', 'The ____ is useful.'],
    guidedPrompts: ['Say one thing in your room.', 'Say more than one thing.', 'Say what you have.', 'Say why one thing is useful.'],
    scenePrompt: 'Describe things in your room.',
    dialoguePrompts: ['Ask and answer about things in your room.'],
  },
  'day-010': {
    id: 'where-things-are',
    title: 'Where Things Are',
    capability: 'I can say where things are.',
    templates: ['The ____ is on the ____.', 'The ____ is in the ____.', 'The ____ is under the ____.', 'The ____ is near the ____.'],
    guidedPrompts: ['Say one thing on a table.', 'Say one thing in a bag or box.', 'Say one thing under something.', 'Say one thing near something.'],
    scenePrompt: 'Describe where things are.',
    dialoguePrompts: ['Ask and answer where one thing is.'],
  },
};
```

V1.3 starts with Day 1 and Week 2 entry points. Keep these four goals in the first implementation slice because tests and E2E depend on them.

- [ ] **Step 5: Add scene goal validation**

Add to `src/content/validateContent.ts`:

```ts
import type { Course, Exercise, Pattern, SceneGoal, ScenarioCapability, ScenarioWeek, WeeklyCheckRubric } from '../domain/types';
```

Then add this exported function:

```ts
export function validateSceneGoals(sceneGoalsByDayId: Record<string, SceneGoal>, course: Course): ValidationResult {
  const errors: string[] = [];
  const dayIds = new Set(course.weeks.flatMap((week) => week.days.map((day) => day.id)));

  Object.entries(sceneGoalsByDayId).forEach(([dayId, sceneGoal]) => {
    if (!dayIds.has(dayId)) errors.push(`Scene goal ${dayId} references missing day`);
    if (!sceneGoal.id.trim() || !sceneGoal.title.trim() || !sceneGoal.capability.trim()) {
      errors.push(`Scene goal for ${dayId} is missing id, title, or capability`);
    }
    if (sceneGoal.templates.length === 0 || sceneGoal.templates.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty templates`);
    }
    if (sceneGoal.guidedPrompts.length === 0 || sceneGoal.guidedPrompts.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty guided prompts`);
    }
    if (!sceneGoal.scenePrompt.trim()) {
      errors.push(`Scene goal for ${dayId} must include a scene prompt`);
    }
    if (sceneGoal.dialoguePrompts.length === 0 || sceneGoal.dialoguePrompts.some((item) => !item.trim())) {
      errors.push(`Scene goal for ${dayId} must include non-empty dialogue prompts`);
    }
  });

  return { errors };
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/content/validateContent.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/domain/types.ts src/content/sceneGoals.ts src/content/validateContent.ts src/content/validateContent.test.ts
git commit -m "feat: add scene goal content model"
```

---

### Task 2: Add Pure Scene Output Helpers

**Files:**
- Create: `src/domain/sceneOutput.ts`
- Create: `src/domain/sceneOutput.test.ts`
- Modify: `src/domain/stepCompletion.ts`
- Modify: `src/domain/stepCompletion.test.ts`

- [ ] **Step 1: Write failing scene output helper tests**

Create `src/domain/sceneOutput.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  createInitialSceneOutput,
  getCompletedSceneIds,
  getSceneOutputCompletion,
  normalizeSceneOutput,
} from './sceneOutput';

describe('scene output helpers', () => {
  it('creates an empty template-mode scene output', () => {
    expect(createInitialSceneOutput('self')).toEqual({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['', '', '', ''],
      sceneText: '',
      dialogue: '',
    });
  });

  it('requires four sentences, scene text, and dialogue', () => {
    const result = getSceneOutputCompletion({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', ''],
      sceneText: '',
      dialogue: '',
    });

    expect(result).toEqual({
      isComplete: false,
      missingRequirements: [
        'Write at least 4 scene sentences.',
        'Write the scene description.',
        'Write the dialogue.',
      ],
    });
  });

  it('accepts complete scene output', () => {
    const result = getSceneOutputCompletion({
      sceneId: 'self',
      helpMode: 'guided',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
      sceneText: 'My name is Li. I am from China. I am a student. I study English.',
      dialogue: 'A: What is your name?\nB: My name is Li.',
    });

    expect(result).toEqual({ isComplete: true, missingRequirements: [] });
  });

  it('normalizes partially missing stored scene output', () => {
    expect(
      normalizeSceneOutput({
        sceneId: 'self',
        sentences: ['My name is Li.'],
      }),
    ).toEqual({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', '', '', ''],
      sceneText: '',
      dialogue: '',
    });
  });

  it('returns completed scene ids only for completed days with complete scene output', () => {
    const sceneIds = getCompletedSceneIds(
      [
        { dayId: 'day-001', status: 'completed', currentStep: 'done' },
        { dayId: 'day-008', status: 'in_progress', currentStep: 'output' },
      ],
      [
        {
          dayId: 'day-001',
          scene: {
            sceneId: 'self',
            helpMode: 'template',
            sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
            sceneText: 'My name is Li. I am from China.',
            dialogue: 'A: What is your name?\nB: My name is Li.',
          },
        },
        {
          dayId: 'day-008',
          scene: {
            sceneId: 'room',
            helpMode: 'template',
            sentences: ['This is my room.', 'My room is small.', 'I have a bed.', 'There is a table.'],
            sceneText: 'This is my room.',
            dialogue: 'A: Is this your room?\nB: Yes.',
          },
        },
      ],
    );

    expect(sceneIds).toEqual(['self']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/domain/sceneOutput.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because `src/domain/sceneOutput.ts` does not exist.

- [ ] **Step 3: Implement scene output helpers**

Create `src/domain/sceneOutput.ts`:

```ts
import type { DayProgress, StepId } from './progress';
import type { SceneHelpMode, SceneOutput } from './types';

type PartialSceneOutput = Partial<SceneOutput> & { sceneId?: string };

export interface SceneCompletionGate {
  isComplete: boolean;
  missingRequirements: string[];
}

function isCompletedDay(progress: Pick<DayProgress, 'status' | 'currentStep'>) {
  return progress.status === 'completed' || progress.currentStep === ('done' as StepId);
}

function normalizeHelpMode(value: unknown): SceneHelpMode {
  return value === 'guided' || value === 'free' ? value : 'template';
}

export function createInitialSceneOutput(sceneId: string): SceneOutput {
  return {
    sceneId,
    helpMode: 'template',
    sentences: ['', '', '', ''],
    sceneText: '',
    dialogue: '',
  };
}

export function normalizeSceneOutput(scene: PartialSceneOutput | undefined, fallbackSceneId = ''): SceneOutput {
  const sentences = Array.isArray(scene?.sentences) ? scene.sentences.slice(0, 6) : [];
  while (sentences.length < 4) sentences.push('');

  return {
    sceneId: scene?.sceneId?.trim() || fallbackSceneId,
    helpMode: normalizeHelpMode(scene?.helpMode),
    sentences,
    sceneText: scene?.sceneText ?? '',
    dialogue: scene?.dialogue ?? '',
    completedAt: scene?.completedAt,
  };
}

export function getSceneOutputCompletion(scene: SceneOutput): SceneCompletionGate {
  const missingRequirements: string[] = [];
  const sentenceCount = scene.sentences.filter((sentence) => sentence.trim()).length;

  if (sentenceCount < 4) missingRequirements.push('Write at least 4 scene sentences.');
  if (!scene.sceneText.trim()) missingRequirements.push('Write the scene description.');
  if (!scene.dialogue.trim()) missingRequirements.push('Write the dialogue.');

  return { isComplete: missingRequirements.length === 0, missingRequirements };
}

export function getCompletedSceneIds(
  dayProgress: Array<Pick<DayProgress, 'dayId' | 'status' | 'currentStep'>>,
  outputs: Array<{ dayId: string; scene?: SceneOutput }>,
): string[] {
  const completedDayIds = new Set(dayProgress.filter(isCompletedDay).map((progress) => progress.dayId));

  return outputs
    .filter((output) => completedDayIds.has(output.dayId) && output.scene && getSceneOutputCompletion(output.scene).isComplete)
    .map((output) => output.scene!.sceneId);
}
```

- [ ] **Step 4: Add step completion wrapper tests**

Add to `src/domain/stepCompletion.test.ts`:

```ts
import { getSceneOutputStepCompletion } from './stepCompletion';

it('uses scene output completion requirements when a scene output exists', () => {
  const result = getSceneOutputStepCompletion({
    sceneId: 'self',
    helpMode: 'template',
    sentences: ['My name is Li.', 'I am from China.', 'I am a student.', ''],
    sceneText: '',
    dialogue: '',
  });

  expect(result).toEqual({
    isComplete: false,
    missingRequirements: [
      'Write at least 4 scene sentences.',
      'Write the scene description.',
      'Write the dialogue.',
    ],
  });
});
```

- [ ] **Step 5: Implement step completion wrapper**

Modify `src/domain/stepCompletion.ts`:

```ts
import { getSceneOutputCompletion } from './sceneOutput';
import type { SceneOutput } from './types';
```

Add:

```ts
export function getSceneOutputStepCompletion(scene: SceneOutput): CompletionGate {
  return getSceneOutputCompletion(scene);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/domain/sceneOutput.test.ts src/domain/stepCompletion.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/domain/sceneOutput.ts src/domain/sceneOutput.test.ts src/domain/stepCompletion.ts src/domain/stepCompletion.test.ts
git commit -m "feat: add scene output completion helpers"
```

---

### Task 3: Persist Scene Output With Existing User Outputs

**Files:**
- Modify: `src/storage/progressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.ts`
- Modify: `src/storage/indexedDbProgressRepository.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Add to `src/storage/indexedDbProgressRepository.test.ts`:

```ts
it('saves and reloads scene output with user output', async () => {
  const repository = createIndexedDbProgressRepository('scene-output-persistence');

  await repository.saveUserOutput({
    id: 'output-day-001',
    dayId: 'day-001',
    text: 'My name is Li.',
    sentenceCount: 4,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: true,
      usedLessonWords: true,
      hasSubjects: true,
      meaningIsClear: true,
    },
    scene: {
      sceneId: 'self',
      helpMode: 'guided',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
      sceneText: 'My name is Li. I am from China. I am a student. I study English.',
      dialogue: 'A: What is your name?\nB: My name is Li.',
      completedAt: '2026-05-27T00:00:00.000Z',
    },
    updatedAt: '2026-05-27T00:00:00.000Z',
  });

  await expect(repository.getUserOutput('day-001')).resolves.toMatchObject({
    dayId: 'day-001',
    scene: {
      sceneId: 'self',
      helpMode: 'guided',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
      sceneText: 'My name is Li. I am from China. I am a student. I study English.',
      dialogue: 'A: What is your name?\nB: My name is Li.',
    },
  });
});

it('normalizes incomplete stored scene output', async () => {
  const repository = createIndexedDbProgressRepository('scene-output-normalization');

  await repository.saveUserOutput({
    id: 'output-day-001',
    dayId: 'day-001',
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    scene: {
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.'],
      sceneText: '',
      dialogue: '',
    },
    updatedAt: '2026-05-27T00:00:00.000Z',
  });

  await expect(repository.getUserOutput('day-001')).resolves.toMatchObject({
    scene: {
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', '', '', ''],
      sceneText: '',
      dialogue: '',
    },
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/storage/indexedDbProgressRepository.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because `UserOutput` has no `scene` property.

- [ ] **Step 3: Extend `UserOutput`**

Modify `src/storage/progressRepository.ts`:

```ts
import type { SceneOutput } from '../domain/types';
```

Add the optional field inside `UserOutput`:

```ts
  scene?: SceneOutput;
```

- [ ] **Step 4: Normalize stored scene output**

Modify `src/storage/indexedDbProgressRepository.ts`:

```ts
import { normalizeSceneOutput } from '../domain/sceneOutput';
```

Replace `normalizeUserOutput` with:

```ts
function normalizeUserOutput(output: UserOutput): UserOutput {
  return {
    ...output,
    sentenceCount: output.sentenceCount ?? 0,
    scene: output.scene ? normalizeSceneOutput(output.scene) : undefined,
  };
}
```

Modify `saveUserOutput` so the saved scene is normalized:

```ts
await db.put('userOutputs', normalizeUserOutput({
  ...output,
  id: output.id || `output-${output.dayId}`,
  sentenceCount: output.sentenceCount ?? 0,
}));
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/storage/indexedDbProgressRepository.test.ts --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/storage/progressRepository.ts src/storage/indexedDbProgressRepository.ts src/storage/indexedDbProgressRepository.test.ts
git commit -m "feat: persist scene output drafts"
```

---

### Task 4: Build Scene Output Editor

**Files:**
- Create: `src/components/SceneOutputEditor.tsx`
- Create: `src/components/SceneOutputEditor.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing editor tests**

Create `src/components/SceneOutputEditor.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialSceneOutput } from '../domain/sceneOutput';
import type { SceneGoal, SceneOutput } from '../domain/types';
import { SceneOutputEditor } from './SceneOutputEditor';

const sceneGoal: SceneGoal = {
  id: 'self',
  title: 'Self',
  capability: 'I can describe myself.',
  templates: ['My name is ____.', 'I am from ____.', 'I am a ____.', 'I study English.'],
  guidedPrompts: ['Say your name.', 'Say where you are from.', 'Say what you do.', 'Say why you study English.'],
  scenePrompt: 'Use your sentences to describe yourself clearly.',
  dialoguePrompts: ['Ask and answer about your name.'],
};

describe('SceneOutputEditor', () => {
  it('shows template guidance by default', () => {
    render(<SceneOutputEditor goal={sceneGoal} value={createInitialSceneOutput('self')} onChange={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Build Sentences' })).toBeInTheDocument();
    expect(screen.getByText('My name is ____.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Template' })).toBeChecked();
  });

  it('switches help modes without clearing input', async () => {
    const user = userEvent.setup();
    let value: SceneOutput = createInitialSceneOutput('self');
    const onChange = vi.fn((next: SceneOutput) => {
      value = next;
      rerender(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);
    });
    const { rerender } = render(<SceneOutputEditor goal={sceneGoal} value={value} onChange={onChange} />);

    await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
    await user.click(screen.getByRole('radio', { name: 'Guided' }));

    expect(screen.getByLabelText('Scene sentence 1')).toHaveValue('My name is Li.');
    expect(screen.getByText('Say your name.')).toBeInTheDocument();
  });

  it('updates sentences, scene text, and dialogue', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SceneOutputEditor goal={sceneGoal} value={createInitialSceneOutput('self')} onChange={onChange} />);

    await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
    await user.type(screen.getByLabelText('Scene description'), 'My name is Li. I study English.');
    await user.type(screen.getByLabelText('Scene dialogue'), 'A: What is your name?');

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sentences: ['My name is Li.', '', '', ''] }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ sceneText: 'My name is Li. I study English.' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dialogue: 'A: What is your name?' }));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/components/SceneOutputEditor.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because `SceneOutputEditor` does not exist.

- [ ] **Step 3: Implement editor**

Create `src/components/SceneOutputEditor.tsx`:

```tsx
import type { SceneGoal, SceneHelpMode, SceneOutput } from '../domain/types';

const helpModes: Array<{ value: SceneHelpMode; label: string }> = [
  { value: 'template', label: 'Template' },
  { value: 'guided', label: 'Guided' },
  { value: 'free', label: 'Free' },
];

export function SceneOutputEditor({
  goal,
  value,
  onChange,
}: {
  goal: SceneGoal;
  value: SceneOutput;
  onChange: (output: SceneOutput) => void;
}) {
  const updateValue = (patch: Partial<SceneOutput>) => {
    onChange({ ...value, ...patch });
  };

  const updateSentence = (index: number, sentence: string) => {
    const sentences = [...value.sentences];
    sentences[index] = sentence;
    updateValue({ sentences });
  };

  return (
    <section className="scene-output-editor">
      <div className="help-mode-control" role="radiogroup" aria-label="Output help mode">
        {helpModes.map((mode) => (
          <label key={mode.value}>
            <input
              type="radio"
              name={`${goal.id}-help-mode`}
              value={mode.value}
              checked={value.helpMode === mode.value}
              onChange={() => updateValue({ helpMode: mode.value })}
            />{' '}
            {mode.label}
          </label>
        ))}
      </div>

      <section>
        <h3>Build Sentences</h3>
        {value.helpMode === 'template' && (
          <div className="template-list" aria-label="Scene templates">
            {goal.templates.map((template) => (
              <code key={template}>{template}</code>
            ))}
          </div>
        )}
        {value.helpMode === 'guided' && (
          <div className="prompt-list" aria-label="Scene prompts">
            {goal.guidedPrompts.map((prompt) => (
              <p key={prompt}>{prompt}</p>
            ))}
          </div>
        )}
        {value.helpMode === 'free' && <p className="helper-text">Use at least 4 simple sentences.</p>}
        {value.sentences.map((sentence, index) => (
          <input
            key={index}
            type="text"
            value={sentence}
            onChange={(event) => updateSentence(index, event.target.value)}
            aria-label={`Scene sentence ${index + 1}`}
            placeholder={`Sentence ${index + 1}`}
          />
        ))}
      </section>

      <section>
        <h3>Make a Scene</h3>
        <p className="helper-text">{goal.scenePrompt}</p>
        <textarea
          value={value.sceneText}
          onChange={(event) => updateValue({ sceneText: event.target.value })}
          rows={5}
          aria-label="Scene description"
          placeholder="Write your scene here."
        />
      </section>

      <section>
        <h3>Speak as Dialogue</h3>
        <div className="prompt-list" aria-label="Dialogue prompts">
          {goal.dialoguePrompts.map((prompt) => (
            <p key={prompt}>{prompt}</p>
          ))}
        </div>
        <textarea
          value={value.dialogue}
          onChange={(event) => updateValue({ dialogue: event.target.value })}
          rows={5}
          aria-label="Scene dialogue"
          placeholder="A: ...&#10;B: ..."
        />
      </section>
    </section>
  );
}
```

- [ ] **Step 4: Add editor styles**

Add to `src/styles.css`:

```css
.scene-output-editor {
  display: grid;
  gap: 20px;
}

.scene-output-editor section {
  display: grid;
  gap: 10px;
}

.scene-output-editor input[type='text'] {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #c7d3cb;
  border-radius: 6px;
  font: inherit;
}

.help-mode-control {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.help-mode-control label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid #c7d3cb;
  border-radius: 6px;
  background: #f8faf8;
  font-weight: 700;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/components/SceneOutputEditor.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/SceneOutputEditor.tsx src/components/SceneOutputEditor.test.tsx src/styles.css
git commit -m "feat: add scene output editor"
```

---

### Task 5: Add Scene Banner and Scene Map

**Files:**
- Create: `src/components/SceneGoalBanner.tsx`
- Create: `src/components/SceneGoalBanner.test.tsx`
- Create: `src/components/SceneMap.tsx`
- Create: `src/components/SceneMap.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing component tests**

Create `src/components/SceneGoalBanner.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { SceneGoalBanner } from './SceneGoalBanner';

const goal: SceneGoal = {
  id: 'self',
  title: 'Self',
  capability: 'I can describe myself.',
  templates: [],
  guidedPrompts: [],
  scenePrompt: '',
  dialoguePrompts: [],
};

describe('SceneGoalBanner', () => {
  it('shows the current scene capability', () => {
    render(<SceneGoalBanner goal={goal} />);

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('I can describe myself.')).toBeInTheDocument();
    expect(screen.getByText('Self')).toBeInTheDocument();
  });
});
```

Create `src/components/SceneMap.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SceneGoal } from '../domain/types';
import { SceneMap } from './SceneMap';

const goals: SceneGoal[] = [
  {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
  {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
];

describe('SceneMap', () => {
  it('marks completed and current scenes', () => {
    render(<SceneMap goals={goals} completedSceneIds={['self']} currentSceneId="room" />);

    expect(screen.getByRole('listitem', { name: /Self Completed/ })).toHaveClass('scene-map-item--completed');
    expect(screen.getByRole('listitem', { name: /Room Today/ })).toHaveClass('scene-map-item--current');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/components/SceneGoalBanner.test.tsx src/components/SceneMap.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement `SceneGoalBanner`**

Create `src/components/SceneGoalBanner.tsx`:

```tsx
import type { SceneGoal } from '../domain/types';

export function SceneGoalBanner({ goal }: { goal: SceneGoal }) {
  return (
    <section className="scene-goal-banner" aria-label="Today scene goal">
      <span className="eyebrow">Today</span>
      <strong>{goal.capability}</strong>
      <span className="scene-chip">{goal.title}</span>
    </section>
  );
}
```

- [ ] **Step 4: Implement `SceneMap`**

Create `src/components/SceneMap.tsx`:

```tsx
import type { SceneGoal } from '../domain/types';

export function SceneMap({
  goals,
  completedSceneIds,
  currentSceneId,
}: {
  goals: SceneGoal[];
  completedSceneIds: string[];
  currentSceneId?: string;
}) {
  const completed = new Set(completedSceneIds);

  return (
    <section className="scene-map">
      <h3>Scenes I Can Describe</h3>
      <ul>
        {goals.map((goal) => {
          const isCompleted = completed.has(goal.id);
          const isCurrent = goal.id === currentSceneId;
          const status = isCompleted ? 'Completed' : isCurrent ? 'Today' : 'Next';

          return (
            <li
              key={goal.id}
              className={`scene-map-item${isCompleted ? ' scene-map-item--completed' : ''}${isCurrent ? ' scene-map-item--current' : ''}`}
              aria-label={`${goal.title} ${status}`}
            >
              <span>{goal.title}</span>
              <small>{status}</small>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Add banner and map styles**

Add to `src/styles.css`:

```css
.scene-goal-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #d8e2dc;
  border-radius: 8px;
  background: #f7fbf8;
}

.scene-chip {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  color: #265c46;
  background: #dceee6;
  font-weight: 800;
}

.scene-map ul {
  display: grid;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.scene-map-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #d8e2dc;
  border-radius: 8px;
  background: #f8faf8;
}

.scene-map-item--completed {
  border-color: #265c46;
  background: #dceee6;
}

.scene-map-item--current {
  border-color: #265c46;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/components/SceneGoalBanner.test.tsx src/components/SceneMap.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/components/SceneGoalBanner.tsx src/components/SceneGoalBanner.test.tsx src/components/SceneMap.tsx src/components/SceneMap.test.tsx src/styles.css
git commit -m "feat: add scene goal display components"
```

---

### Task 6: Integrate Scene Output Into Today

**Files:**
- Modify: `src/components/TodayPage.tsx`
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing Today integration tests**

Add to `src/components/TodayPage.test.tsx`:

```tsx
import { sceneGoalsByDayId } from '../content/sceneGoals';

it('shows the scene goal banner for the current day', async () => {
  const repo = createIndexedDbProgressRepository('today-scene-goal-banner');
  renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

  expect(await screen.findByLabelText('Today scene goal')).toHaveTextContent('I can describe myself.');
});

it('requires complete scene output before finishing the output step', async () => {
  const user = userEvent.setup();
  const repo = createIndexedDbProgressRepository('today-scene-output-gate');
  renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

  await completeDayOneThroughOutput(user);

  expect(screen.getByRole('heading', { name: 'Build Sentences' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(screen.getByText('Write at least 4 scene sentences.')).toBeInTheDocument();

  await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
  await user.type(screen.getByLabelText('Scene sentence 2'), 'I am from China.');
  await user.type(screen.getByLabelText('Scene sentence 3'), 'I am a student.');
  await user.type(screen.getByLabelText('Scene sentence 4'), 'I study English.');
  await user.type(screen.getByLabelText('Scene description'), 'My name is Li. I am from China. I am a student. I study English.');
  await user.type(screen.getByLabelText('Scene dialogue'), 'A: What is your name?\nB: My name is Li.');

  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
});

it('persists scene output drafts', async () => {
  const user = userEvent.setup();
  const repo = createIndexedDbProgressRepository('today-scene-output-persistence');
  const { unmount } = renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);

  await completeDayOneThroughOutput(user);
  await user.type(screen.getByLabelText('Scene sentence 1'), 'My name is Li.');
  await user.click(screen.getByRole('radio', { name: 'Guided' }));

  await waitFor(async () => {
    await expect(repo.getUserOutput('day-001')).resolves.toMatchObject({
      scene: { helpMode: 'guided', sentences: ['My name is Li.', '', '', ''] },
    });
  });

  unmount();
  renderWithSpeech(<TodayPage course={week1Course} repository={repo} sceneGoalsByDayId={sceneGoalsByDayId} />);
  await completeDayOneThroughOutput(user);

  expect(await screen.findByLabelText('Scene sentence 1')).toHaveValue('My name is Li.');
  expect(screen.getByRole('radio', { name: 'Guided' })).toBeChecked();
});
```

Use the existing `completeToOutput(user)` helper in `src/components/TodayPage.test.tsx`. If the helper is missing because the test file changed, add this exact helper:

```ts
async function completeDayOneThroughOutput(user: ReturnType<typeof userEvent.setup>) {
  await completeToOutput(user);
}
```

Use `completeDayOneThroughOutput(user)` in the new tests so the new test names are self-explanatory.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/components/TodayPage.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1 --testTimeout=10000
```

Expected: FAIL because `TodayPage` does not accept `sceneGoalsByDayId` and does not render scene output.

- [ ] **Step 3: Add Today props and scene lookup**

Modify `src/components/TodayPage.tsx` imports:

```ts
import { createInitialSceneOutput, normalizeSceneOutput } from '../domain/sceneOutput';
import type { Course, Exercise, SceneGoal, TranslationExercise, Word } from '../domain/types';
import { SceneGoalBanner } from './SceneGoalBanner';
import { SceneMap } from './SceneMap';
import { SceneOutputEditor } from './SceneOutputEditor';
```

Modify props:

```ts
  sceneGoalsByDayId = {},
}: {
  course: Course;
  repository: ProgressRepository;
  sceneGoalsByDayId?: Record<string, SceneGoal>;
  showChineseHelp?: boolean;
  onProgressChange?: () => void;
}) {
```

Add after `day`:

```ts
  const sceneGoal = sceneGoalsByDayId[day.id];
  const allSceneGoals = useMemo(() => Object.values(sceneGoalsByDayId), [sceneGoalsByDayId]);
```

- [ ] **Step 4: Initialize and load scene output**

Add helper near `createInitialOutput`:

```ts
function withSceneOutput(output: UserOutput, sceneGoal: SceneGoal | undefined): UserOutput {
  if (!sceneGoal) return output;
  return {
    ...output,
    scene: normalizeSceneOutput(output.scene ?? createInitialSceneOutput(sceneGoal.id), sceneGoal.id),
  };
}
```

Modify the saved progress load:

```ts
const nextOutput = savedOutput ?? createInitialOutput(day.id);
setOutputDraft(withSceneOutput(nextOutput, sceneGoal));
```

Include `sceneGoal` in the effect dependency list.

- [ ] **Step 5: Use scene completion for scene days**

Modify `currentGate`:

```ts
if (currentStep === 'output' && sceneGoal && outputDraft.scene) return getSceneOutputStepCompletion(outputDraft.scene);
if (currentStep === 'output') return getOutputCompletion(outputDraft, day.outputTask.requiredSentenceCount);
```

Import `getSceneOutputStepCompletion` from `stepCompletion`.

- [ ] **Step 6: Save scene editor changes**

Add:

```ts
const saveSceneOutputDraft = (scene: SceneOutput) => {
  saveOutputDraft({
    ...outputDraft,
    scene,
    updatedAt: new Date().toISOString(),
  });
};
```

Use `SceneOutput` import from `../domain/types`.

- [ ] **Step 7: Render banner, map, and editor**

Inside the Today header, after the time label:

```tsx
{sceneGoal && <SceneGoalBanner goal={sceneGoal} />}
```

Inside the step panel for output:

```tsx
{currentStep === 'output' &&
  (sceneGoal && outputDraft.scene ? (
    <SceneOutputEditor goal={sceneGoal} value={outputDraft.scene} onChange={saveSceneOutputDraft} />
  ) : (
    <OutputTaskEditor task={day.outputTask} value={outputDraft} onChange={saveOutputDraft} />
  ))}
```

For Today lightweight map, render after the header when scene goals exist:

```tsx
{allSceneGoals.length > 0 && sceneGoal && <SceneMap goals={allSceneGoals} completedSceneIds={[]} currentSceneId={sceneGoal.id} />}
```

V1.3 Today only needs to show the current scene target; completed scene state is fully handled in Me.

- [ ] **Step 8: Pass scene goals from App**

Modify `src/App.tsx`:

```ts
import { scenarioCapabilities } from './content/scenarioCapabilities';
import { sceneGoalsByDayId } from './content/sceneGoals';
```

Then:

```tsx
<TodayPage
  course={basicEnglishCourse}
  repository={repository}
  sceneGoalsByDayId={sceneGoalsByDayId}
  showChineseHelp={showChineseHelp}
  onProgressChange={() => void refreshProgressSummary()}
/>
```

- [ ] **Step 9: Run Today tests**

Run:

```powershell
npx vitest run src/components/TodayPage.test.tsx src/App.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1 --testTimeout=10000
```

Expected: PASS.

- [ ] **Step 10: Commit**

```powershell
git add src/components/TodayPage.tsx src/components/TodayPage.test.tsx src/App.tsx
git commit -m "feat: integrate scene output into today"
```

---

### Task 7: Integrate Completed Scene Map Into Me

**Files:**
- Modify: `src/components/MePage.tsx`
- Modify: `src/components/MePage.test.tsx` or `src/App.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing Me test**

Create `src/components/MePage.test.tsx` with:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createIndexedDbProgressRepository } from '../storage/indexedDbProgressRepository';
import type { SceneGoal } from '../domain/types';
import { MePage } from './MePage';

const sceneGoalsByDayId: Record<string, SceneGoal> = {
  'day-001': {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
  'day-008': {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: [],
    guidedPrompts: [],
    scenePrompt: '',
    dialoguePrompts: [],
  },
};

describe('MePage scene map', () => {
  it('highlights completed scenes from completed day outputs', async () => {
    const repository = createIndexedDbProgressRepository('me-scene-map');
    await repository.saveDayProgress({
      id: 'progress-day-001',
      dayId: 'day-001',
      currentStep: 'done',
      status: 'completed',
      startedAt: '2026-05-27T00:00:00.000Z',
      completedAt: '2026-05-27T00:00:00.000Z',
      contentVersion: '1.2.0',
    });
    await repository.saveUserOutput({
      id: 'output-day-001',
      dayId: 'day-001',
      text: '',
      sentenceCount: 0,
      selfRating: 'ok',
      checklist: {
        usedTargetPattern: true,
        usedLessonWords: true,
        hasSubjects: true,
        meaningIsClear: true,
      },
      scene: {
        sceneId: 'self',
        helpMode: 'template',
        sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
        sceneText: 'My name is Li. I am from China.',
        dialogue: 'A: What is your name?\nB: My name is Li.',
      },
      updatedAt: '2026-05-27T00:00:00.000Z',
    });

    render(<MePage repository={repository} sceneGoalsByDayId={sceneGoalsByDayId} />);

    expect(await screen.findByRole('listitem', { name: /Self Completed/ })).toHaveClass('scene-map-item--completed');
    expect(screen.getByRole('listitem', { name: /Room Next/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```powershell
npx vitest run src/components/MePage.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: FAIL because `MePage` does not accept `sceneGoalsByDayId`.

- [ ] **Step 3: Add Me scene map props**

Modify `src/components/MePage.tsx`:

```ts
import { getCompletedSceneIds } from '../domain/sceneOutput';
import type { ScenarioCapability, SceneGoal } from '../domain/types';
import { SceneMap } from './SceneMap';
```

Add prop:

```ts
  sceneGoalsByDayId,
}: {
  repository: ProgressRepository;
  scenarioCapabilities?: ScenarioCapability[];
  sceneGoalsByDayId?: Record<string, SceneGoal>;
```

Add:

```ts
const sceneGoals = sceneGoalsByDayId ? Object.values(sceneGoalsByDayId) : [];
const completedSceneIds = getCompletedSceneIds(days, outputs);
```

Render before Saved Outputs:

```tsx
{sceneGoals.length > 0 && <SceneMap goals={sceneGoals} completedSceneIds={completedSceneIds} />}
```

- [ ] **Step 4: Pass scene goals from App to Me**

Modify `src/App.tsx`:

```tsx
<MePage
  repository={repository}
  scenarioCapabilities={scenarioCapabilities}
  sceneGoalsByDayId={sceneGoalsByDayId}
  showChineseHelp={showChineseHelp}
  onShowChineseHelpChange={setShowChineseHelp}
  readingEnabled={readingEnabled}
  onReadingEnabledChange={setReadingEnabled}
  speechRate={speechRate}
  onSpeechRateChange={setSpeechRate}
  totalDayCount={basicEnglishCourse.weeks.flatMap((week) => week.days).length}
/>
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```powershell
npx vitest run src/components/MePage.test.tsx src/App.test.tsx --pool=threads --maxWorkers=1 --minWorkers=1
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/components/MePage.tsx src/components/MePage.test.tsx src/App.tsx
git commit -m "feat: show completed scene map in me"
```

---

### Task 8: Update E2E for the Expression Loop

**Files:**
- Modify: `tests/e2e/basic-english.spec.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Update E2E helpers**

Add helper:

```ts
async function completeSceneOutput(page: Page, scene: 'self' | 'room') {
  if (scene === 'self') {
    await page.getByLabel('Scene sentence 1').fill('My name is Li.');
    await page.getByLabel('Scene sentence 2').fill('I am from China.');
    await page.getByLabel('Scene sentence 3').fill('I am a student.');
    await page.getByLabel('Scene sentence 4').fill('I study English.');
    await page.getByLabel('Scene description').fill('My name is Li. I am from China. I am a student. I study English.');
    await page.getByLabel('Scene dialogue').fill('A: What is your name?\nB: My name is Li.');
    return;
  }

  await page.getByLabel('Scene sentence 1').fill('This is my room.');
  await page.getByLabel('Scene sentence 2').fill('My room is small.');
  await page.getByLabel('Scene sentence 3').fill('I have a bed.');
  await page.getByLabel('Scene sentence 4').fill('There is a table in my room.');
  await page.getByLabel('Scene description').fill('This is my room. My room is small. I have a bed. There is a table in my room.');
  await page.getByLabel('Scene dialogue').fill('A: Is this your room?\nB: Yes. This is my room.');
}
```

Modify the Day 1 output helper to call:

```ts
await completeSceneOutput(page, 'self');
```

Modify the Day 8 flow to call:

```ts
await completeSceneOutput(page, 'room');
```

- [ ] **Step 2: Add scene assertions**

In the Day 1 E2E, before leaving Today output:

```ts
await expect(page.getByRole('heading', { name: 'Build Sentences' })).toBeVisible();
await expect(page.getByText('I can describe myself.')).toBeVisible();
```

After navigating to Me:

```ts
await expect(page.getByRole('listitem', { name: /Self Completed/ })).toBeVisible();
```

After reload and Me navigation:

```ts
await expect(page.getByRole('listitem', { name: /Self Completed/ })).toBeVisible();
```

In the Day 8 E2E:

```ts
await expect(page.getByRole('listitem', { name: /Room Completed/ })).toBeVisible();
```

- [ ] **Step 3: Ensure Playwright ready URL is correct**

Verify `playwright.config.ts` contains:

```ts
webServer: {
  command: 'npm run dev -- --port 5187 --strictPort',
  url: 'http://127.0.0.1:5187/basic_english/',
  reuseExistingServer: false,
  timeout: 120_000,
},
```

- [ ] **Step 4: Run E2E**

Run:

```powershell
npm run test:e2e
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```powershell
git add tests/e2e/basic-english.spec.ts playwright.config.ts
git commit -m "test: cover scene expression loop e2e"
```

---

### Task 9: Final Verification and Cleanup

**Files:**
- Review all modified files.

- [ ] **Step 1: Run full tests**

Run:

```powershell
npx vitest run --pool=threads --maxWorkers=1 --minWorkers=1 --testTimeout=10000
```

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: TypeScript build and Vite build both pass.

- [ ] **Step 3: Run E2E**

Run:

```powershell
npm run test:e2e
```

Expected: 8 passed.

- [ ] **Step 4: Inspect final diff**

Run:

```powershell
git status --short
git log --oneline -8
```

Expected:

- no uncommitted V1.3 implementation files.
- recent commits match the task commits above.

- [ ] **Step 5: Report completion**

Include:

- one-sentence summary of the V1.3 expression loop.
- test commands and pass counts.
- any intentionally deferred items from Non-Goals.
