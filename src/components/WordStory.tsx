import { useEffect, useState } from 'react';
import { giveStory, type WordStoryContent } from '../content/wordStories';
import type { Word } from '../domain/types';
import { useSpeech } from '../speech/SpeechProvider';
import { PhoneticText } from './PhoneticText';
import { SpeechButton } from './SpeechButton';
import { loadStoryProgress, saveStoryProgress } from '../storage/storyProgress';

export function WordStory({ words, showChineseHelp, story = giveStory, onReview }: {
  words: Word[];
  showChineseHelp: boolean;
  story?: WordStoryContent;
  onReview?: (word: Word) => Promise<void>;
}) {
  const word = words.find((entry) => entry.id === story.wordId);
  const [progress, setProgress] = useState(() => loadStoryProgress(story.id));
  const [pageIndex, setPageIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(() => {
    const saved = progress.answer;
    const index = saved?.question === story.check.prompt ? story.check.options.indexOf(saved.text) : -1;
    return index >= 0 ? index : null;
  });
  const [sentence, setSentence] = useState(progress.sentence ?? '');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const { stop, speak } = useSpeech();
  useEffect(() => () => stop(), [stop]);

  if (!word) return <p>No stories for these words yet.</p>;

  const page = story.pages[pageIndex];
  const isCheck = pageIndex === story.pages.length;
  const sentenceLines = Math.max(4, ...story.pages.map(item => Math.ceil(item.text.length / 16)));
  const chineseLines = Math.max(2, ...story.pages.map(item => Math.ceil(item.chinese.length / 10)));
  const recordLines = Math.max(0, ...story.pages.map(item => item.semanticText
    ? Math.ceil(item.semanticText.label.length / 20) + item.semanticText.lines.reduce((sum, line) => sum + Math.ceil(line.length / 20), 0)
    : 0));
  const updateProgress = (next: typeof progress) => {
    setProgress(next);
    return saveStoryProgress(story.id, next);
  };
  const moveTo = (index: number, autoRead = false) => {
    stop();
    setPageIndex(index);
    if (autoRead && story.pages[index]) {
      speak(story.pages[index].text, 'Read story page');
    }
    if (index === story.pages.length) {
      updateProgress({ ...progress, read: true });
    }
  };

  return (
    <section className="word-story" aria-label="Word story">
      <header className="story-heading">
        <div>
          <p className="muted">Week {story.week} · A short story {progress.read && '· Read'}</p>
          <h3>{story.title}</h3>
        </div>
        <div className="word-heading">
          <strong>{word.text}</strong>
          <PhoneticText value={word.phonetic} />
          <SpeechButton text={word.text} label={`Read story word ${word.text}`} />
        </div>
      </header>
      <p>{story.definition}{showChineseHelp && ` · ${story.definitionChinese}`}</p>
      {story.contextSupport.length > 0 && <details className="story-context">
        <summary>A little help before reading</summary>
        {story.contextSupport.map((item) => <p key={item.text}><strong>{item.text}</strong> — {item.definition}
          {showChineseHelp && ` · ${item.chinese}`}
          <SpeechButton text={item.text} label={`Read story help word ${item.text}`} />
        </p>)}
      </details>}
      <details className="story-review">
        <summary>Words to read again: {story.reviewWordIds.join(', ')}</summary>
        <p className="muted">Need help with a word? Read it before the story.</p>
        {story.reviewWordIds.map((id) => {
          const reviewWord = words.find((entry) => entry.id === id);
          return reviewWord && <p key={id}><strong>{reviewWord.text}</strong> — {reviewWord.definition}
            {showChineseHelp && ` · ${reviewWord.chinese}`}
            <SpeechButton text={reviewWord.text} label={`Read story review word ${id}`} />
          </p>;
        })}
      </details>
      <div className={`story-spread${isCheck ? ' story-check' : ''}`}>
        {!isCheck && <img className="story-image" src={page.image} alt={page.alt} width="512" height="512" />}
        <div className="story-copy" aria-live="polite">
          {isCheck ? (
            <>
              <h4>Your turn</h4>
              <p>{story.check.prompt}<SpeechButton text={story.check.prompt} label="Read story question" /></p>
              {showChineseHelp && <p className="muted">{story.check.chinese}</p>}
              <div className="story-answers" role="group" aria-label="Story question answers">
                {story.check.options.map((option, index) => <button key={option} type="button"
                  className={`secondary-button${answer === index ? ' selected-button' : ''}`}
                  aria-pressed={answer === index} onClick={() => {
                    setAnswer(index);
                    updateProgress({ ...progress, answer: { question: story.check.prompt, text: option, correct: index === story.check.correctIndex } });
                  }}>{option}</button>)}
              </div>
              {answer !== null && <p role="status">{answer === story.check.correctIndex ? story.check.success : story.check.retry}</p>}
              {answer === story.check.correctIndex && <div className="story-practice">
                <p>Now make your own sentence:</p>
                <strong>{story.practice}</strong>
                <label htmlFor="story-sentence">Your sentence</label>
                <textarea id="story-sentence" rows={3} value={sentence} placeholder={story.practice}
                  onChange={(event) => { setSentence(event.target.value); setSaveFeedback(''); }} />
                <div className="story-practice-actions">
                  <button type="button" className="secondary-button" disabled={!sentence.trim()} onClick={() => {
                    const saved = updateProgress({ ...progress, sentence: sentence.trim() });
                    setSaveFeedback(saved ? 'Saved on this device.' : 'Kept for this visit.');
                  }}>Save my sentence</button>
                  <SpeechButton text={sentence} label="Read my story sentence" />
                </div>
                {saveFeedback && <p>{saveFeedback}</p>}
                <details><summary>One possible sentence</summary><p>{story.practiceExamples.join(' · ')}</p></details>
              </div>}
              <p className="muted">Story read. You can review the word again in Flashcards.</p>
              {onReview && <div>
                <button type="button" className="secondary-button" disabled={reviewFeedback === 'Saving...'} onClick={async () => {
                  setReviewFeedback('Saving...');
                  try { await onReview(word); setReviewFeedback('Added to word review.'); }
                  catch { setReviewFeedback('Could not save. Please try again.'); }
                }}>Review this word</button>
                {reviewFeedback && <p>{reviewFeedback}</p>}
              </div>}
            </>
          ) : (
            <>
              <p className="muted">{story.narrator}</p>
              {showChineseHelp && <p className="muted">{story.narratorChinese}</p>}
              <p className="story-sentence" style={{ minHeight: `${sentenceLines * 1.65}em` }}>{page.text.split(new RegExp(`\\b(${story.wordId})\\b`, 'i')).map((part, index) => part.toLowerCase() === story.wordId ? <mark key={index}>{part}</mark> : part)}</p>
              <SpeechButton text={page.text} label="Read story page" />
              {showChineseHelp && <p className="story-chinese" style={{ minHeight: `${chineseLines * 1.6}em` }}>{page.chinese}</p>}
              {recordLines > 0 && <div className="story-record-region" style={{ minHeight: `${(recordLines + 2) * 1.6}em` }}>
                {page.semanticText && <aside className="story-record" aria-label={page.semanticText.accessibleSummary}>
                  <strong>{page.semanticText.label}</strong>
                  {page.semanticText.lines.length > 0 && <ul>{page.semanticText.lines.map(line => <li key={line}>{line}</li>)}</ul>}
                </aside>}
              </div>}
            </>
          )}
        </div>
      </div>
      <nav className="story-navigation" aria-label="Story pages">
        <button type="button" className="secondary-button" disabled={pageIndex === 0} onClick={() => moveTo(pageIndex - 1)}>Previous page</button>
        <span>{isCheck ? 'Your turn' : `${pageIndex + 1} / ${story.pages.length}`}</span>
        <button type="button" className="secondary-button" onClick={() => {
          if (isCheck) setAnswer(null);
          moveTo(isCheck ? 0 : pageIndex + 1, !isCheck);
        }}>{isCheck ? 'Read again' : pageIndex === story.pages.length - 1 ? 'Finish story' : 'Next page'}</button>
      </nav>
    </section>
  );
}
