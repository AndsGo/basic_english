import { type StepId, stepOrder } from '../domain/progress';

const stepLabels: Record<StepId, string> = {
  'mastery-review': 'Mastery',
  review: 'Review',
  words: 'Words',
  patterns: 'Patterns',
  drills: 'Drills',
  translate: 'Translate',
  'scene-remix': 'Scene Remix',
  picture: 'Picture',
  output: 'Output',
  done: 'Done',
};

export function Stepper({ currentStep }: { currentStep: StepId }) {
  const currentIndex = stepOrder.indexOf(currentStep);

  return (
    <ol className="stepper" aria-label="Today steps">
      {stepOrder
        .filter((step) => step !== 'done')
        .map((step) => {
          const stepIndex = stepOrder.indexOf(step);
          const state = stepIndex < currentIndex ? 'complete' : step === currentStep ? 'current' : 'upcoming';

          return (
            <li key={step} className={`stepper-item ${state}`} aria-current={step === currentStep ? 'step' : undefined}>
              <span className="step-dot">{stepIndex + 1}</span>
              <span>{stepLabels[step]}</span>
            </li>
          );
        })}
    </ol>
  );
}
