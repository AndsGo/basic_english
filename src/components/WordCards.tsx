import type { Word } from '../domain/types';
import { PhoneticText } from './PhoneticText';
import { SpeechButton } from './SpeechButton';

interface WordCardsProps {
  words: Word[];
  showChineseHelp?: boolean;
  marks?: Record<string, 'known' | 'review' | undefined>;
  onReview: (wordId: string) => void;
  onKnow: (wordId: string) => void;
}

export function WordCards({ words, showChineseHelp = false, marks = {}, onReview, onKnow }: WordCardsProps) {
  return (
    <section>
      <h3>Words</h3>
      <div className="card-grid">
        {words.map((word) => (
          <article className="learning-card word-card" key={word.id}>
            <div>
              <p className="word-text word-heading">
                <span>{word.text}</span>
                <PhoneticText value={word.phonetic} />
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
            {marks[word.id] && <p className="selection-status">{marks[word.id] === 'known' ? 'Known' : 'Marked for review'}</p>}
            <div className="card-actions">
              <button
                type="button"
                className={`secondary-button${marks[word.id] === 'review' ? ' selected-button' : ''}`}
                aria-label={`Review ${word.text}`}
                aria-pressed={marks[word.id] === 'review'}
                onClick={() => onReview(word.id)}
              >
                Review
              </button>
              <button
                type="button"
                className={`secondary-button${marks[word.id] === 'known' ? ' selected-button' : ''}`}
                aria-label={`Know ${word.text}`}
                aria-pressed={marks[word.id] === 'known'}
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
