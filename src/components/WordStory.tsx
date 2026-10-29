import { TextArea } from './ui/TextFields';
import { AnswerOption, Button } from './ui/Button';
import { useEffect, useRef, useState } from 'react';
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
  const [pageIndex, setPageIndex] = useState(() => progress.pageIndex !== undefined && progress.pageIndex <= story.pages.length ? progress.pageIndex : 0);
  const [answer, setAnswer] = useState<number | null>(() => {
    const saved = progress.answer;
    const index = saved?.question === story.check.prompt ? story.check.options.indexOf(saved.text) : -1;
    return index >= 0 ? index : null;
  });
  const [sentence, setSentence] = useState(progress.sentence ?? '');
  const [saveFeedback, setSaveFeedback] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const { stop, speak } = useSpeech();
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => { if (contentRef.current) contentRef.current.scrollTop = 0; }, [pageIndex]);
  useEffect(() => {
    const saved = loadStoryProgress(story.id);
    saveStoryProgress(story.id, { ...saved, pageIndex: saved.pageIndex !== undefined && saved.pageIndex <= story.pages.length ? saved.pageIndex : 0, lastOpenedAt: new Date().toISOString() });
  }, [story.id, story.pages.length]);

  if (!word) return <p>No stories for these words yet.</p>;

  const page = story.pages[pageIndex];
  const isCheck = pageIndex === story.pages.length;
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
    updateProgress({ ...progress, read: progress.read || index === story.pages.length, pageIndex: index, lastOpenedAt: new Date().toISOString() });
  };

  return (
    <section className="word-story" aria-label="Word story">
      <header className="story-heading">
        <div>
          <p className="muted">Week {story.week} · A short story {progress.read && '· Read'}</p>
          <h3 ref={titleRef} tabIndex={-1}>{story.title}</h3>
        </div>
        <div className="word-heading">
          <strong>{word.text}</strong>
          <PhoneticText value={word.phonetic} />
          <SpeechButton text={word.text} label={`Read story word ${word.text}`} />
        </div>
      </header>
      <details className="story-reading-help"><summary>Reading help</summary>
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
      </details>
      <div ref={contentRef} className={`story-spread${isCheck ? ' story-check' : ''}`} tabIndex={0} role="region" aria-label="Story content">
        {!isCheck && <img className="story-image" src={page.image} alt={page.alt} width="512" height="512" />}
        <div className="story-copy" aria-live="polite">
          {isCheck ? (
            <>
              <h4>Your turn</h4>
              <p>{story.check.prompt}<SpeechButton text={story.check.prompt} label="Read story question" /></p>
              {showChineseHelp && <p className="muted">{story.check.chinese}</p>}
              <div className="story-answers" role="group" aria-label="Story question answers">
                {story.check.options.map((option, index) => <AnswerOption key={option} type="button"
                  selected={answer === index} result={index === story.check.correctIndex ? 'correct' : 'retry'} onClick={() => {
                    setAnswer(index);
                    updateProgress({ ...progress, answer: { question: story.check.prompt, text: option, correct: index === story.check.correctIndex } });
                  }}>{option}</AnswerOption>)}
              </div>
              {answer !== null && <p role="status">{answer === story.check.correctIndex ? story.check.success : story.check.retry}</p>}
              {answer === story.check.correctIndex && <div className="story-practice">
                <p>Now make your own sentence:</p>
                <strong>{story.practice}</strong>
                <TextArea label="Your sentence" id="story-sentence" rows={3} value={sentence} placeholder={story.practice}
                  onChange={(event) => { setSentence(event.target.value); setSaveFeedback(''); }} />
                <div className="story-practice-actions">
                  <Button variant="secondary" type="button" disabled={!sentence.trim()} onClick={() => {
                    const saved = updateProgress({ ...progress, sentence: sentence.trim() });
                    setSaveFeedback(saved ? 'Saved on this device.' : 'Kept for this visit.');
                  }}>Save my sentence</Button>
                  <SpeechButton text={sentence} label="Read my story sentence" />
                </div>
                {saveFeedback && <p>{saveFeedback}</p>}
                <details><summary>One possible sentence</summary><p>{story.practiceExamples.join(' · ')}</p></details>
              </div>}
              <p className="muted">Story read. You can review the word again in Flashcards.</p>
              {onReview && <div>
                <Button variant="secondary" type="button" loading={reviewFeedback === 'Saving...'} loadingLabel="Saving..." onClick={async () => {
                  setReviewFeedback('Saving...');
                  try { await onReview(word); setReviewFeedback('Added to word review.'); }
                  catch { setReviewFeedback('Could not save. Please try again.'); }
                }}>Review this word</Button>
                {reviewFeedback && <p>{reviewFeedback}</p>}
              </div>}
            </>
          ) : (
            <>
              <p className="muted">{story.narrator}</p>
              {showChineseHelp && <p className="muted">{story.narratorChinese}</p>}
              <p className="story-sentence">{page.text.split(new RegExp(`\\b(${story.wordId})\\b`, 'i')).map((part, index) => part.toLowerCase() === story.wordId ? <mark key={index}>{part}</mark> : part)}</p>
              <SpeechButton text={page.text} label="Read story page" />
              {showChineseHelp && <p className="story-chinese">{page.chinese}</p>}
              {page.semanticText && <div className="story-record-region">
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
        <Button variant="secondary" type="button" disabled={pageIndex === 0} onClick={() => moveTo(pageIndex - 1)}>Previous page</Button>
        <span>{isCheck ? 'Your turn' : `${pageIndex + 1} / ${story.pages.length}`}</span>
        <Button variant="primary" type="button" onClick={() => {
          if (isCheck) setAnswer(null);
          moveTo(isCheck ? 0 : pageIndex + 1, !isCheck);
        }}>{isCheck ? 'Read again' : pageIndex === story.pages.length - 1 ? 'Finish story' : 'Next page'}</Button>
      </nav>
    </section>
  );
}
