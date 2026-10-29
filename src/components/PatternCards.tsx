import { Button } from './ui/Button';
import type { Pattern } from '../domain/types';
import { SpeechButton } from './SpeechButton';

export function PatternCards({
  patterns,
  practicedPatternIds = new Set<string>(),
  onPractice,
}: {
  patterns: Pattern[];
  practicedPatternIds?: Set<string>;
  onPractice?: (patternId: string) => void;
}) {
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
                  <SpeechButton text={example} label={`Read example for ${pattern.title}: ${example}`} />
                </p>
              ))}
            </div>
            {practicedPatternIds.has(pattern.id) && <p className="selection-status">Practiced</p>}
            <Button variant="secondary"
              type="button"
              aria-pressed={practicedPatternIds.has(pattern.id)}
              onClick={() => onPractice?.(pattern.id)}>
              Practice this
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
