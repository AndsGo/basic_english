import { useEffect, useMemo, useState } from 'react';
import { checkPictureDescription, countMeaningfulSentences } from '../domain/pictureDescription';
import type { PictureDescribeTask } from '../domain/types';
import type { PictureDescription } from '../storage/progressRepository';

function createDraft(task: PictureDescribeTask, value: PictureDescription, text: string): PictureDescription {
  return {
    ...value,
    id: value.id || `picture-description-${task.dayId}`,
    dayId: task.dayId,
    taskId: task.id,
    text,
    updatedAt: new Date().toISOString(),
  };
}

export function PictureDescribeStep({
  task,
  value,
  onChange,
  onChecked,
  onAddToReview,
  isReviewAdded = false,
}: {
  task: PictureDescribeTask;
  value: PictureDescription;
  onChange: (description: PictureDescription) => void;
  onChecked: (description: PictureDescription) => void;
  onAddToReview: (description: PictureDescription) => void | Promise<void>;
  isReviewAdded?: boolean;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const sentenceCount = useMemo(() => countMeaningfulSentences(draft.text), [draft.text]);
  const hasText = draft.text.trim().length > 0;
  const reviewAlreadyAdded = isReviewAdded || Boolean(draft.addedToReviewAt);

  const updateText = (text: string) => {
    const next = createDraft(task, draft, text);
    setDraft(next);
    onChange(next);
  };

  const check = () => {
    const now = new Date().toISOString();
    const next = {
      ...createDraft(task, draft, draft.text),
      checkedAt: now,
      feedback: checkPictureDescription(task, draft.text),
      updatedAt: now,
    };
    setDraft(next);
    onChange(next);
    onChecked(next);
  };

  const addToReview = async () => {
    if (!hasText || reviewAlreadyAdded) return;
    await onAddToReview(draft);
  };

  return (
    <section className="picture-describe" aria-labelledby="picture-describe-heading">
      <div className="picture-describe-media">
        <img className="picture-describe-image" src={task.image} alt={task.title} />
      </div>
      <div className="picture-describe-body">
        <h3 id="picture-describe-heading">Describe the picture</h3>
        <p className="picture-describe-goal">{task.goal}</p>

        <div className="picture-support">
          <div>
            <p className="field-label">Picture words</p>
            <div className="picture-word-list">
              {task.targetWords.map((word) => (
                <span key={word}>{word}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="field-label">Patterns</p>
            <div className="picture-word-list">
              {task.suggestedPatterns.map((pattern) => (
                <span key={pattern}>{pattern}</span>
              ))}
            </div>
          </div>
        </div>

        <label className="field-label" htmlFor={`picture-description-${task.id}`}>
          Picture description
        </label>
        <textarea
          id={`picture-description-${task.id}`}
          className="large-textarea"
          value={draft.text}
          placeholder="Write 3 simple sentences about the picture."
          onChange={(event) => updateText(event.target.value)}
        />
        <p className="sentence-counter">
          {sentenceCount} / {task.requiredSentenceCount} sentences
        </p>

        <div className="button-row">
          <button type="button" className="primary-button" onClick={check} disabled={!hasText}>
            Check
          </button>
          <button type="button" className="secondary-button" onClick={addToReview} disabled={!hasText || reviewAlreadyAdded}>
            {reviewAlreadyAdded ? 'Added to Review' : 'Add to Review'}
          </button>
        </div>

        {draft.feedback && (
          <div className={`picture-feedback ${draft.feedback.status}`} role="status">
            {draft.feedback.messages.map((message) => (
              <p key={message}>{message}</p>
            ))}
            <p className="field-label">Simple version</p>
            <ul>
              {draft.feedback.simpleVersion.map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
