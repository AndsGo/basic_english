import { TextArea } from './ui/TextFields';
import { Button } from './ui/Button';
import type { ReviewItem } from '../domain/review';

export function PictureDescriptionReviewCard({
  item,
  onKnown,
  onReviewAgain,
}: {
  item: ReviewItem;
  onKnown: () => void | Promise<void>;
  onReviewAgain?: () => void | Promise<void>;
}) {
  return (
    <article className="review-card picture-review-card">
      <p className="eyebrow">picture / {item.sourceDayId}</p>
      <h3>Review Picture Description</h3>
      {item.image && <img className="picture-review-image" src={item.image} alt={item.prompt} />}
      {item.targetWords && item.targetWords.length > 0 && (
        <div>
          <p className="field-label">Picture words</p>
          <div className="picture-word-list">
            {item.targetWords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        </div>
      )}
      {item.userAnswer && (
        <div>
          <p className="field-label">Original answer</p>
          <p>{item.userAnswer}</p>
        </div>
      )}
      {item.simpleVersion && item.simpleVersion.length > 0 && (
        <div>
          <p className="field-label">Simple version</p>
          <ul>
            {item.simpleVersion.map((sentence) => (
              <li key={sentence}>{sentence}</li>
            ))}
          </ul>
        </div>
      )}
      <TextArea label="Picture description review answer"
        id={`picture-review-${item.id}`}
        className="large-textarea"
        defaultValue=""
        placeholder="Write the picture description again." />
      <div className="button-row">
        <Button variant="primary" type="button" onClick={() => void onKnown()}>
          I know this
        </Button>
        <Button variant="secondary" type="button" onClick={() => void onReviewAgain?.()}>
          Review again
        </Button>
      </div>
    </article>
  );
}
