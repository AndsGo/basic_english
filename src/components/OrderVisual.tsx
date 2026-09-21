import type { OrderPresentation } from '../content/orderPresentations';

export function OrderVisual({ presentation, image, word }: {
  presentation: OrderPresentation;
  image?: string;
  word: string;
}) {
  return (
    <div className="order-visual">
      {image && <img className="flashcard-image" src={image} alt={presentation.scene} />}
      <div className="order-record" role="group" aria-label={`${presentation.routine}: example order`}>
        <p className="order-meaning">{word}: {presentation.steps[presentation.currentStep]}</p>
        <ol className="order-steps">
          {presentation.steps.map((step, index) => (
            <li key={step} className={index === presentation.currentStep ? 'order-step-current' : undefined}>
              <span aria-hidden="true">{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
