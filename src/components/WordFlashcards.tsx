import { useMemo, useState } from 'react';
import type { Word } from '../domain/types';
import { PhoneticText } from './PhoneticText';
import { SpeechButton } from './SpeechButton';

type FlashcardFeedback = 'review' | 'known' | 'error' | null;

export function WordFlashcards({
  words,
  imageByWordId = {},
  showChineseHelp = false,
  onKnow,
  onReview,
}: {
  words: Word[];
  imageByWordId?: Partial<Record<string, string>>;
  showChineseHelp?: boolean;
  onKnow: (word: Word) => void | Promise<void>;
  onReview: (word: Word) => void | Promise<void>;
}) {
  const queue = useMemo(
    () =>
      [...words].sort((a, b) => {
        const aHasImage = Boolean(imageByWordId[a.id]);
        const bHasImage = Boolean(imageByWordId[b.id]);

        if (aHasImage === bHasImage) return 0;

        return aHasImage ? -1 : 1;
      }),
    [imageByWordId, words],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBackVisible, setIsBackVisible] = useState(false);
  const [feedback, setFeedback] = useState<FlashcardFeedback>(null);
  const [isSaving, setIsSaving] = useState(false);
  const safeCurrentIndex = queue.length > 0 ? Math.min(currentIndex, queue.length - 1) : 0;
  const currentWord = queue[safeCurrentIndex];

  if (!currentWord) {
    return <p>No words yet.</p>;
  }

  const image = imageByWordId[currentWord.id];

  const moveTo = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setIsBackVisible(false);
    setFeedback(null);
  };

  const save = async (action: 'known' | 'review') => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      if (action === 'known') {
        await onKnow(currentWord);
        setFeedback('known');
      } else {
        await onReview(currentWord);
        setFeedback('review');
      }
    } catch {
      setFeedback('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="word-flashcards" aria-label="Word flashcards">
      <div className="flashcard-toolbar">
        <span>
          {safeCurrentIndex + 1} / {queue.length}
        </span>
      </div>
      <article className="flashcard">
        {!isBackVisible ? (
          <div className="flashcard-front">
            {image ? (
              <img src={image} alt={`${currentWord.text} flashcard illustration`} className="flashcard-image" />
            ) : (
              <div className="flashcard-image flashcard-image--fallback">No image yet</div>
            )}
            <h3>{currentWord.text}</h3>
            <PhoneticText value={currentWord.phonetic} />
          </div>
        ) : (
          <div className="flashcard-back">
            <h3>{currentWord.text}</h3>
            <PhoneticText value={currentWord.phonetic} />
            <p>
              {currentWord.definition}
              <SpeechButton text={currentWord.definition} label={`Read definition for ${currentWord.text}`} />
            </p>
            {showChineseHelp && (
              <p className="muted">
                Chinese: <span lang="zh">{currentWord.chinese}</span>
              </p>
            )}
            <p className="example">
              {currentWord.example}
              <SpeechButton text={currentWord.example} label={`Read example for ${currentWord.text}`} />
            </p>
            <SpeechButton text={currentWord.text} label={`Read word ${currentWord.text}`} />
            <div className="card-actions">
              <button type="button" className="secondary-button" onClick={() => void save('review')} disabled={isSaving}>
                Add to review
              </button>
              <button type="button" className="secondary-button" onClick={() => void save('known')} disabled={isSaving}>
                I know this
              </button>
            </div>
          </div>
        )}
      </article>
      {feedback === 'review' && <p className="selection-status" role="status">Added to Review</p>}
      {feedback === 'known' && <p className="selection-status" role="status">Marked Known</p>}
      {feedback === 'error' && <p className="requirement-list" role="alert">Could not save. Try again.</p>}
      <div className="flashcard-navigation">
        <button
          type="button"
          className="secondary-button"
          onClick={() => moveTo(safeCurrentIndex - 1)}
          disabled={isSaving || safeCurrentIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setIsBackVisible((current) => !current)}
          disabled={isSaving}
        >
          Flip
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => moveTo(safeCurrentIndex + 1)}
          disabled={isSaving || safeCurrentIndex === queue.length - 1}
        >
          Next
        </button>
      </div>
    </section>
  );
}
