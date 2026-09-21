import type { TruthPresentation } from '../content/truthPresentations';

export function TruthVisual({ presentation, image }: {
  presentation: TruthPresentation;
  image?: string;
}) {
  return (
    <div className="truth-visual">
      {image && <img className="flashcard-image" src={image} alt={presentation.scene} />}
      <div className="truth-record" aria-label="Fact check">
        <p className="truth-statement">{presentation.statement}</p>
        <p className="truth-answer">{presentation.answer}</p>
      </div>
    </div>
  );
}
