import { Button } from './ui/Button';
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
              {showChineseHelp && (
                <p className="muted">
                  Chinese: <span lang="zh">{word.chinese}</span>
                </p>
              )}
            </div>
            <p className="example">
              {word.example}
              <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
            </p>
            <div className="card-actions">
              <Button variant="secondary"
                type="button"
                aria-label={`Add to review: ${word.text}`}
                aria-pressed={marks[word.id] === 'review'}
                onClick={() => onReview(word.id)}>
                Add to review
              </Button>
              <Button variant="secondary"
                type="button"
                aria-label={`I know this: ${word.text}`}
                aria-pressed={marks[word.id] === 'known'}
                onClick={() => onKnow(word.id)}>
                I know this
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
