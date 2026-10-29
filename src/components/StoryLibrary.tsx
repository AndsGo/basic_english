import { TextField, Select } from './ui/TextFields';
import { Button } from './ui/Button';
import { useLayoutEffect, useRef, useState } from 'react';
import type { WordStoryContent } from '../content/wordStories';
import type { Word } from '../domain/types';
import { loadStoryProgress } from '../storage/storyProgress';
import { PhoneticText } from './PhoneticText';
import { SpeechButton } from './SpeechButton';
import { WordStory } from './WordStory';

export function StoryLibrary({ stories, words, showChineseHelp, initialStoryId, onReview }: {
  stories: WordStoryContent[];
  words: Word[];
  showChineseHelp: boolean;
  initialStoryId?: string;
  onReview: (word: Word) => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState(initialStoryId);
  const [reading, setReading] = useState(Boolean(initialStoryId));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [phase, setPhase] = useState('all');
  const catalogScroll = useRef(0);
  const openedCard = useRef<HTMLButtonElement | null>(null);
  const openedId = useRef<string | undefined>(undefined);
  const selected = stories.find(story => story.id === selectedId);
  const target = words.find(word => word.id === selected?.wordId);
  useLayoutEffect(() => {
    if (!selectedId && openedCard.current) {
      window.scrollTo(0, catalogScroll.current);
      openedCard.current.focus({ preventScroll: true });
    } else if (selectedId) window.scrollTo(0, 0);
  }, [selectedId]);

  if (selected && target) {
    const progress = loadStoryProgress(selected.id);
    return <div className={reading ? 'story-reader-view' : 'story-intro-view'}>
      <div className="story-reader-toolbar">
        <Button variant="secondary" type="button" onClick={() => { setSelectedId(undefined); setReading(false); }}>Back to stories</Button>
        {reading && <Select label="Choose a story" fieldClassName="story-picker" value={selected.id} onChange={event => setSelectedId(event.target.value)}>
            {stories.map(story => <option key={story.id} value={story.id}>Week {story.week} · {story.wordId} · {story.title}</option>)}
          </Select>}
      </div>
      {reading ? <WordStory key={selected.id} story={selected} words={words} showChineseHelp={showChineseHelp} onReview={onReview} /> :
        <section className="story-intro" aria-label="Before reading">
          <img src={selected.pages[0].image} alt={selected.pages[0].alt} width="512" height="512" />
          <div>
            <p className="eyebrow">Read after Week {selected.courseWeek} · {selected.pages.length} pages</p>
            <h2>{selected.title}</h2>
            <div className="word-heading"><strong>{target.text}</strong><PhoneticText value={target.phonetic} /><SpeechButton text={target.text} label={`Read story word ${target.text}`} /></div>
            <p>{selected.definition}</p>
            {showChineseHelp && <p className="muted">{selected.definitionChinese}</p>}
            <p className="muted">Words to read again: {selected.reviewWordIds.join(', ')}</p>
            {selected.contextSupport.length > 0 && <details><summary>A little help before reading</summary>{selected.contextSupport.map(item => <p key={item.text}><strong>{item.text}</strong> — {item.definition}{showChineseHelp && ` · ${item.chinese}`}<SpeechButton text={item.text} label={`Read story help word ${item.text}`} /></p>)}</details>}
            <Button variant="primary" type="button" onClick={() => setReading(true)}>{progress.pageIndex !== undefined && progress.pageIndex < selected.pages.length ? 'Continue reading' : 'Read story'}</Button>
            <p className="helper-text">Next page reads aloud when speech is enabled.</p>
          </div>
        </section>}
    </div>;
  }

  const visible = stories.filter(story => {
    const progress = loadStoryProgress(story.id);
    return `${story.title} ${story.wordId}`.toLowerCase().includes(query.trim().toLowerCase())
      && (status === 'all' || (status === 'read' ? progress.read : !progress.read))
      && (phase === 'all' || Math.ceil(story.courseWeek / 13) === Number(phase));
  });
  return <section className="story-library" aria-label="Story library">
    <header className="catalog-heading"><p className="muted">One word to learn. Familiar words to read again.</p></header>
    <div className="story-filters">
      <TextField label="Search stories" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Title or word" />
      <Select label="Reading status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All stories</option><option value="unread">Unread</option><option value="read">Read</option></Select>
      <Select label="Course stage" value={phase} onChange={event => setPhase(event.target.value)}><option value="all">All stages</option>{[1, 2, 3, 4].map(number => <option key={number} value={number}>Weeks {(number - 1) * 13 + 1}–{number * 13}</option>)}</Select>
    </div>
    <p className="helper-text" role="status">{visible.length} stories</p>
    <div className="story-cover-grid">
      {visible.map(story => {
        const progress = loadStoryProgress(story.id);
        return <button className="story-cover" type="button" key={story.id} aria-label={`Open story ${story.title}`} ref={node => { if (node && openedId.current === story.id) openedCard.current = node; }}
          onClick={event => { catalogScroll.current = window.scrollY; openedId.current = story.id; openedCard.current = event.currentTarget; setSelectedId(story.id); }}>
          <img src={story.pages[0].image} alt={story.pages[0].alt} width="512" height="512" loading="lazy" />
          <span className="story-cover-meta">Week {story.week} · {story.pages.length} pages <span>{progress.read ? '✓ Read' : progress.pageIndex !== undefined ? 'In progress' : 'Unread'}</span></span>
          <strong>{story.title}</strong><span className="muted">Learn <b>{story.wordId}</b> · Read after Week {story.courseWeek}</span>
        </button>;
      })}
    </div>
    {visible.length === 0 && <div className="catalog-empty"><h3>No stories match these filters.</h3><Button variant="secondary" type="button" onClick={() => { setQuery(''); setStatus('all'); setPhase('all'); }}>Clear filters</Button></div>}
  </section>;
}
