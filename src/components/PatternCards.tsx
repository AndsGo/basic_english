import type { Pattern } from '../domain/types';
import { SpeechButton } from './SpeechButton';

export function PatternCards({ patterns }: { patterns: Pattern[] }) {
  return (
    <section>
      <h3>Patterns</h3>
      <div className="card-grid">
        {patterns.map((pattern) => (
          <article className="learning-card pattern-card" key={pattern.id}>
            <div>
              <p className="pattern-title">
                {pattern.title}
                <SpeechButton text={pattern.title} label={`Read pattern ${pattern.title}`} />
              </p>
              <p className="muted">Use: {pattern.use}</p>
            </div>
            <p className="structure">
              {pattern.structure}
              <SpeechButton text={pattern.structure} label={`Read structure ${pattern.structure}`} />
            </p>
            <div className="example-list">
              {pattern.examples.map((example) => (
                <p className="example" key={example}>
                  {example}
                  <SpeechButton text={example} label={`Read example ${example}`} />
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
