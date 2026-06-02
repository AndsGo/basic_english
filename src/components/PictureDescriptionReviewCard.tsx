import type { ReviewItem } from '../domain/review';

export function PictureDescriptionReviewCard({ item, onKnown }: { item: ReviewItem; onKnown: () => void | Promise<void> }) {
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
      <label className="field-label" htmlFor={`picture-review-${item.id}`}>
        Picture description review answer
      </label>
      <textarea
        id={`picture-review-${item.id}`}
        className="large-textarea"
        defaultValue=""
        placeholder="Write the picture description again."
      />
      <div className="button-row">
        <button type="button" className="primary-button" onClick={() => void onKnown()}>
          I know this
        </button>
        <button type="button" className="secondary-button">
          Review again
        </button>
      </div>
    </article>
  );
}
