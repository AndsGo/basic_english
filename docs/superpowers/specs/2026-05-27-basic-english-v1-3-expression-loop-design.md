# Basic English V1.3 Expression Loop Design

## Purpose

V1.3 makes daily learning end with a concrete daily-life expression result.

The long-term product goal remains:

> A learner can use Basic English to describe common daily-life scenes and express simple personal ideas.

V1.3 upgrades the final Today output step into a three-part scene expression loop:

```text
Build Sentences -> Make a Scene -> Speak as Dialogue
```

The learner should finish each day with a saved piece of English that describes a real life scene.

## Scope

### Build in V1.3

- Scene goal data for each playable day.
- Today scene goal banner.
- Three-part scene output editor.
- Help mode control with `Template`, `Guided`, and `Free` modes.
- Scene output persistence in IndexedDB.
- Completion gating that requires all three output parts.
- Lightweight scene capability map on Today and Me.
- Tests for output completion, persistence, help mode behavior, and scene unlocks.

### Do Not Build in V1.3

- AI correction.
- grammar scoring.
- pronunciation scoring.
- speech recording.
- full conversation bot.
- drag-and-drop game UI.
- full course restructuring around scene selection.
- cloud sync or account system.

## Product Outcome

After V1.3, the product should communicate:

> I am not only learning words and patterns. I am learning to describe life scenes.

Examples:

```text
Today: I can describe myself.
Today: I can describe my room.
Today: I can say where things are.
```

The learner should be able to open Me and see which daily-life scenes they can already describe.

## Learning Flow

Today keeps the current step sequence:

```text
Review -> Words -> Patterns -> Drills -> Translation -> Output
```

The final `Output` step becomes `Scene Output`.

### Build Sentences

The learner writes 4-6 simple sentences using the day's words and patterns.

Example:

```text
My name is Li.
I am from China.
I am a student.
I study English.
```

Goal:

> Say clear facts with Basic English.

### Make a Scene

The learner combines or rewrites the sentences into a short scene description.

Example:

```text
My name is Li. I am from China. I am a student. I study English every day.
```

Goal:

> Describe one life scene continuously.

### Speak as Dialogue

The learner turns the scene into a short dialogue.

Example:

```text
A: What is your name?
B: My name is Li.
A: Where are you from?
B: I am from China.
```

Goal:

> Prepare the same meaning for simple real conversation.

## Help Modes

Each Scene Output has one help mode.

### Template

Default mode.

Show sentence frames that the learner can fill.

Example:

```text
My name is ____.
I am from ____.
I am a ____.
```

This mode protects beginner completion.

### Guided

Show prompts and reference examples, but ask the learner to write full sentences.

Example:

```text
Say your name.
Say where you are from.
Say what you do.
```

This mode gives more expression practice.

### Free

Show only the scene goal and minimum requirements.

Example:

```text
Describe yourself in simple English.
Use at least 4 sentences.
```

This mode supports stronger learners without adding a separate advanced flow.

Switching help modes must not clear learner input.

## Data Model

Extend the existing output model instead of replacing storage.

Recommended type:

```ts
type SceneOutput = {
  sceneId: string;
  helpMode: 'template' | 'guided' | 'free';
  sentences: string[];
  sceneText: string;
  dialogue: string;
  completedAt?: string;
};
```

Each playable day receives a scene goal:

```ts
type SceneGoal = {
  id: string;
  title: string;
  capability: string;
  templates: string[];
  guidedPrompts: string[];
  scenePrompt: string;
  dialoguePrompts: string[];
};
```

Example:

```ts
{
  id: 'self',
  title: 'Describe Myself',
  capability: 'I can describe myself.',
  templates: [
    'My name is ____.',
    'I am from ____.',
    'I am a ____.'
  ],
  guidedPrompts: [
    'Say your name.',
    'Say where you are from.',
    'Say what you do.'
  ],
  scenePrompt: 'Use your sentences to describe yourself clearly.',
  dialoguePrompts: [
    'Ask and answer about your name.',
    'Ask and answer about where you are from.'
  ]
}
```

## Completion Rules

Scene Output is complete when:

- at least 4 sentence lines are non-empty.
- `sceneText` is non-empty.
- `dialogue` is non-empty.

V1.3 does not judge grammar quality. The learner can complete the day when the required parts are present.

This keeps the feature local, predictable, and suitable for beginners.

## Components

### SceneGoalBanner

Location:

- Today top area.

Responsibility:

- show today's scene target.
- show the related capability statement.

Example:

```text
Today: I can describe myself.
Scene: Self
```

### SceneOutputEditor

Location:

- Today final output step.

Responsibility:

- edit sentence lines.
- edit scene text.
- edit dialogue.
- show the selected help mode.
- expose completion state to Today.

This replaces or upgrades the current `OutputTaskEditor`.

### HelpModeControl

Location:

- inside Scene Output.

Responsibility:

- switch between `Template`, `Guided`, and `Free`.
- preserve existing input while switching.

### SceneMap

Location:

- Today and Me.

Today version:

- show the current scene target only.
- make the daily purpose visible before the learner starts.

Me version:

- show all available scene capabilities.
- completed scenes are highlighted.
- next scenes remain muted.

## Me Page Behavior

Me keeps the existing settings:

- Show Chinese help.
- Enable reading aloud.
- Voice speed.

Add a lightweight scene map section.

Example:

```text
Scenes I Can Describe

Completed
- Self
- Room

Next
- Family
- Food
```

A scene is completed when the corresponding day has a complete Scene Output and the day is completed.

## Storage

Scene output should be saved with existing user output data where possible.

Persistence requirements:

- sentence lines persist.
- scene text persists.
- dialogue persists.
- help mode persists.
- completed scene can be restored after reload.

If an IndexedDB schema upgrade is needed, it must preserve existing learner progress.

## Error Handling

- If a day has no scene goal, Today should fall back to the existing output task behavior.
- If stored scene output is missing fields, default to empty strings and `template` help mode.
- If IndexedDB save fails, keep the current in-memory draft and show the existing save failure behavior if present.

## Testing

### Unit and Component Tests

Cover:

- Scene Output is incomplete until all three parts are present.
- at least 4 non-empty sentence lines are required.
- switching help modes does not clear input.
- each help mode displays the correct guidance.
- SceneGoalBanner shows the current day capability.
- SceneMap highlights completed scenes.
- existing non-scene output behavior still works for days without scene goals.

### Storage Tests

Cover:

- Scene Output saves to IndexedDB.
- Scene Output reloads after page refresh.
- help mode reloads after page refresh.
- existing stored user outputs remain readable after schema changes.

### E2E Tests

Cover:

1. Complete Day 1 with the three-part Scene Output.
2. Verify Me highlights the Self scene.
3. Reload and verify the completed scene remains highlighted.
4. Complete Day 8 and verify the Room scene is highlighted.
5. Verify Chinese help remains configurable and does not appear by default.

## Acceptance Criteria

V1.3 is complete when:

- Today shows the current scene goal.
- Today final output has Build Sentences, Make a Scene, and Speak as Dialogue.
- help modes can switch without clearing input.
- the day cannot complete until the three output parts are complete.
- completed scene capability appears on Me.
- scene output persists after reload.
- existing review, course, speech, and word help behavior still works.
- `npm test` passes.
- `npm run build` passes.
- `npm run test:e2e` passes.

## Non-Goals

V1.3 does not include:

- AI feedback.
- automated grammar correction.
- voice recording.
- pronunciation scoring.
- real-time conversation.
- reward economy.
- backend services.
- account login.
- replacing the 12-week curriculum.
