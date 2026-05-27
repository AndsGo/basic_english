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
