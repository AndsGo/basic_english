import { useState } from 'react';
import { wordFlashcardImages } from '../content/wordFlashcardImages';
import { createWordReviewItem, hasActiveWordReviewItem, resolveReviewItem } from '../domain/review';
import type { Course, Word } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { SpeechButton } from './SpeechButton';
import { WordFlashcards } from './WordFlashcards';

type WordsMode = 'list' | 'flashcards';

export function WordsPage({
  course,
  repository,
  showChineseHelp = false,
  imageByWordId = wordFlashcardImages,
  onProgressChange,
}: {
  course: Course;
  repository: ProgressRepository;
  showChineseHelp?: boolean;
  imageByWordId?: Partial<Record<string, string>>;
  onProgressChange?: () => void;
}) {
  const [mode, setMode] = useState<WordsMode>('list');

  const saveWordMark = async (word: Word, status: 'known' | 'review') => {
    const now = new Date().toISOString();

    await repository.saveWordProgress({
      id: word.id,
      wordId: word.id,
      status,
      seenCount: 1,
      correctCount: status === 'known' ? 1 : 0,
      lastSeenAt: now,
      updatedAt: now,
    });

    const activeItems = await repository.listReviewItems('active');

    if (status === 'review') {
      if (!hasActiveWordReviewItem(activeItems, word.id)) {
        await repository.saveReviewItem(
          createWordReviewItem({ wordId: word.id, wordText: word.text, sourceDayId: 'words-page', now }),
        );
      }
    } else {
      await Promise.all(
        activeItems
          .filter((item) => hasActiveWordReviewItem([item], word.id))
          .map((item) => repository.saveReviewItem(resolveReviewItem(item, now))),
      );
    }

    onProgressChange?.();
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h2>Course Words</h2>
        <div className="segmented-control" aria-label="Words view mode">
          <button
            type="button"
            className={`secondary-button${mode === 'list' ? ' selected-button' : ''}`}
            aria-pressed={mode === 'list'}
            onClick={() => setMode('list')}
          >
            List
          </button>
          <button
            type="button"
            className={`secondary-button${mode === 'flashcards' ? ' selected-button' : ''}`}
            aria-pressed={mode === 'flashcards'}
            onClick={() => setMode('flashcards')}
          >
            Flashcards
          </button>
        </div>
      </div>
      {mode === 'flashcards' ? (
        <WordFlashcards
          words={course.words}
          imageByWordId={imageByWordId}
          showChineseHelp={showChineseHelp}
          onKnow={(word) => saveWordMark(word, 'known')}
          onReview={(word) => saveWordMark(word, 'review')}
        />
      ) : (
        <div className="word-bank">
          {course.words.map((word) => (
            <article className="word-bank-item" key={word.id}>
              <strong>
                {word.text}
                <SpeechButton text={word.text} label={`Read word ${word.text}`} />
              </strong>
              <span>
                {word.definition}
                <SpeechButton text={word.definition} label={`Read definition for ${word.text}`} />
              </span>
              {showChineseHelp && <span>Chinese: {word.chinese}</span>}
              <small>
                {word.example}
                <SpeechButton text={word.example} label={`Read example for ${word.text}`} />
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
