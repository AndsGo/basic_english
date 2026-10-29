import { TextArea } from './ui/TextFields';
import { Button } from './ui/Button';
import { useState } from 'react';
import type { SceneRemixSelfMark, SceneRemixTask } from '../domain/types';

export interface SceneRemixSubmitResult {
  userAnswer: string;
  selfMark: SceneRemixSelfMark;
}

export function SceneRemixCard({
  task,
  title = 'Try Another Scene',
  initialAnswer = '',
  onSubmit,
}: {
  task: SceneRemixTask;
  title?: string;
  initialAnswer?: string;
  onSubmit: (result: SceneRemixSubmitResult) => void | Promise<void>;
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [referencesVisible, setReferencesVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const trimmedAnswer = answer.trim();

  const submit = async (selfMark: SceneRemixSelfMark) => {
    if (!trimmedAnswer || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit({ userAnswer: trimmedAnswer, selfMark });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="scene-remix-card">
      <h3>{title}</h3>
      <p>{task.prompt}</p>
      {task.source && <p className="scene-remix-source">Source: {task.source}</p>}

      <TextArea label="Scene remix answer"
          aria-label="Scene remix answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={4} />

      <Button variant="secondary"
        type="button"
        disabled={!trimmedAnswer}
        onClick={() => setReferencesVisible(true)}>
        Show reference
      </Button>

      {referencesVisible && (
        <section className="scene-remix-reference" aria-labelledby={`${task.id}-reference-heading`}>
          <h4 id={`${task.id}-reference-heading`}>Reference</h4>
          <ul>
            {task.referenceAnswers.map((referenceAnswer) => (
              <li className="reference-answer" key={referenceAnswer}>
                {referenceAnswer}
              </li>
            ))}
          </ul>
          <div className="card-actions">
            <Button variant="primary" type="button" disabled={submitting} onClick={() => submit('close')}>
              Close enough
            </Button>
            <Button variant="secondary" type="button" disabled={submitting} onClick={() => submit('review')}>
              Need review
            </Button>
          </div>
        </section>
      )}
    </article>
  );
}
