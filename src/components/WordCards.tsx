import type { Word } from '../domain/types';
import { SpeechButton } from './SpeechButton';

interface WordCardsProps {
  words: Word[];
  showChineseHelp?: boolean;
  onReview: (wordId: string) => void;
  onKnow: (wordId: string) => void;
}

export function WordCards({ words, showChineseHelp = false, onReview, onKnow }: WordCardsProps) {
  return (
    <section>
      <h3>Words</h3>
      <div className="card-grid">
        {words.map((word) => (
          <article className="learning-card word-card" key={word.id}>
            <div>
              <p className="word-text">
                {word.text}
                <SpeechButton text={word.text} label={`Read word ${word.text}`} />
              </p>
              <p className="muted">
                {word.definition}
                <SpeechButton text={word.definition} label={`Read definition for ${word.text}`} />
              </p>
              {showChineseHelp && <p className="muted">Chinese: {word.chinese}</p>}
            </div>
            <p className="example">
              {word.example}
              <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
            </p>
            <div className="card-actions">
              <button
                type="button"
                className="secondary-button"
                aria-label={`Review ${word.text}`}
                onClick={() => onReview(word.id)}
              >
                Review
              </button>
              <button
                type="button"
                className="secondary-button"
                aria-label={`Know ${word.text}`}
                onClick={() => onKnow(word.id)}
              >
                Know
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
