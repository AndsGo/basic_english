import type { Course } from '../domain/types';
import { SpeechButton } from './SpeechButton';

export function WordsPage({ course, showChineseHelp = false }: { course: Course; showChineseHelp?: boolean }) {
  return (
    <section className="panel">
      <h2>Course Words</h2>
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
    </section>
  );
}
