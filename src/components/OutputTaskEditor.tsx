import { TextArea } from './ui/TextFields';
import { Checkbox, RadioGroup } from './ui/SelectionControls';
import { countSentences } from '../domain/exercises';
import type { OutputTask } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';

const checklistItems: Array<{
  key: keyof UserOutput['checklist'];
  label: string;
}> = [
  { key: 'usedTargetPattern', label: "I used today's pattern." },
  { key: 'usedLessonWords', label: 'I used lesson words.' },
  { key: 'hasSubjects', label: 'Each sentence has a subject.' },
  { key: 'meaningIsClear', label: 'My meaning is clear.' },
];

const selfRatings: Array<{ value: UserOutput['selfRating']; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'ok', label: 'OK' },
  { value: 'hard', label: 'Hard' },
];

export function OutputTaskEditor({
  task,
  value,
  onChange,
}: {
  task: OutputTask;
  value: UserOutput;
  onChange: (output: UserOutput) => void;
}) {
  const updateValue = (patch: Partial<Pick<UserOutput, 'text' | 'sentenceCount' | 'selfRating' | 'checklist'>>) => {
    onChange({ ...value, ...patch, updatedAt: new Date().toISOString() });
  };

  return (
    <section className="output-editor">
      <h3>{task.topic}</h3>
      {task.storyMode ? (
        <div className="story-guidance">
          <strong>{task.storyMode === 'recap' ? 'Story recap' : 'Today story sentence'}</strong>
          {task.storyPrompt ? <p>{task.storyPrompt}</p> : null}
        </div>
      ) : null}
      <div className="prompt-list">
        {task.prompts.map((prompt) => (
          <p key={prompt}>{prompt}</p>
        ))}
      </div>
      <div className="template-list" aria-label="Output template">
        {task.template.map((line) => (
          <code key={line}>{line}</code>
        ))}
      </div>
      <TextArea label="Daily output"
        value={value.text}
        onChange={(event) =>
          updateValue({
            text: event.target.value,
            sentenceCount: countSentences(event.target.value),
          })
        }
        rows={8}
        aria-label="Daily output"
        placeholder="Write your sentences here." />
      <p className="helper-text">
        {value.sentenceCount} / {task.requiredSentenceCount} sentences
      </p>
      <div className="checklist">
        {checklistItems.map(item => <Checkbox key={item.key} label={item.label} checked={value.checklist[item.key]}
          onChange={event => updateValue({ checklist: { ...value.checklist, [item.key]: event.target.checked } })} />)}
      </div>
      <RadioGroup label="Self rating" name={task.id + '-self-rating'} value={value.selfRating ?? ''} options={selfRatings}
        onValueChange={rating => updateValue({ selfRating: rating as UserOutput['selfRating'] })} />
    </section>
  );
}
