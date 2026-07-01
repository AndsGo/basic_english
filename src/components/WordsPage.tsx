import { useMemo, useState } from 'react';
import { basicEnglishWordList } from '../content/basicEnglish850';
import { wordFlashcardImages } from '../content/wordFlashcardImages';
import { createWordReviewItem, hasActiveWordReviewItem, resolveReviewItem } from '../domain/review';
import type { Course, Word } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { PhoneticText } from './PhoneticText';
import { SpeechButton } from './SpeechButton';
import { WordFlashcards } from './WordFlashcards';

type WordsMode = 'list' | 'flashcards' | 'library';
type LibraryFilter = 'all' | 'course' | 'future';

const LIBRARY_VISIBLE_LIMIT = 120;

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
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>('all');

  const courseWordByText = useMemo(
    () => new Map(course.words.map((word) => [word.text.toLowerCase(), word])),
    [course.words],
  );
  const coveredCoreWords = useMemo(
    () => new Set(basicEnglishWordList.filter((word) => courseWordByText.has(word))),
    [courseWordByText],
  );
  const coveragePercent = Math.round((coveredCoreWords.size / basicEnglishWordList.length) * 1000) / 10;
  const normalizedLibraryQuery = libraryQuery.trim().toLowerCase();
  const libraryEntries = basicEnglishWordList
    .filter((word) => {
      const inCourse = coveredCoreWords.has(word);
      if (libraryFilter === 'course' && !inCourse) return false;
      if (libraryFilter === 'future' && inCourse) return false;
      return normalizedLibraryQuery.length === 0 || word.includes(normalizedLibraryQuery);
    })
    .map((word) => ({ word, courseWord: courseWordByText.get(word) }));
  const visibleLibraryEntries = libraryEntries.slice(0, LIBRARY_VISIBLE_LIMIT);

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
          <button
            type="button"
            className={`secondary-button${mode === 'library' ? ' selected-button' : ''}`}
            aria-pressed={mode === 'library'}
            onClick={() => setMode('library')}
          >
            850 Library
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
      ) : mode === 'library' ? (
        <div className="basic-library">
          <div className="basic-library-header">
            <div>
              <h3>Basic English 850 Library</h3>
              <p className="muted">Core vocabulary coverage across the current 12-week course.</p>
            </div>
            <div className="basic-library-stats" aria-label="Basic English 850 coverage">
              <strong>{coveredCoreWords.size} / {basicEnglishWordList.length}</strong>
              <span>{coveragePercent}% course coverage</span>
              <span>{basicEnglishWordList.length - coveredCoreWords.size} future words</span>
            </div>
          </div>

          <div className="basic-library-controls">
            <label>
              <span>Search</span>
              <input
                type="search"
                aria-label="Search Basic English 850 words"
                value={libraryQuery}
                onChange={(event) => setLibraryQuery(event.target.value)}
                placeholder="word"
              />
            </label>
            <div className="segmented-control" aria-label="Basic English library filter">
              <button
                type="button"
                className={`secondary-button${libraryFilter === 'all' ? ' selected-button' : ''}`}
                aria-pressed={libraryFilter === 'all'}
                onClick={() => setLibraryFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`secondary-button${libraryFilter === 'course' ? ' selected-button' : ''}`}
                aria-pressed={libraryFilter === 'course'}
                onClick={() => setLibraryFilter('course')}
              >
                In Course
              </button>
              <button
                type="button"
                className={`secondary-button${libraryFilter === 'future' ? ' selected-button' : ''}`}
                aria-pressed={libraryFilter === 'future'}
                onClick={() => setLibraryFilter('future')}
              >
                Future
              </button>
            </div>
          </div>

          <p className="helper-text">
            Showing {visibleLibraryEntries.length} of {libraryEntries.length} matching words.
          </p>

          {visibleLibraryEntries.length > 0 ? (
            <ul className="basic-library-list">
              {visibleLibraryEntries.map(({ word, courseWord }) => (
                <li
                  key={word}
                  className="basic-library-item"
                  aria-label={`${word} ${courseWord ? 'in course' : 'future'}`}
                >
                  <strong>{word}</strong>
                  <span className="status-pill">{courseWord ? `Week ${courseWord.weekIntroduced}` : 'Future'}</span>
                  {courseWord && <small>{courseWord.definition}</small>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No words match this filter.</p>
          )}
        </div>
      ) : (
        <div className="word-bank">
          {course.words.map((word) => (
            <article className="word-bank-item" key={word.id}>
              <strong className="word-heading">
                <span>{word.text}</span>
                <PhoneticText value={word.phonetic} />
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
