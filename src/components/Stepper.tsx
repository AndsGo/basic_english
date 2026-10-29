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
  const groups: Array<{ label: string; steps: StepId[] }> = [
    { label: 'Review', steps: ['mastery-review', 'review'] },
    { label: 'Learn', steps: ['words', 'patterns'] },
    { label: 'Practice', steps: ['drills', 'translate', 'scene-remix', 'picture'] },
    { label: 'Use it', steps: ['output', 'done'] },
  ];
  const groupIndex = groups.findIndex(group => group.steps.includes(currentStep));

  return (
    <div className="learning-path">
    <ol className="learning-groups" aria-label="Learning stages">
      {groups.map((group, index) => <li key={group.label} className={index === groupIndex ? 'current' : index < groupIndex ? 'complete' : ''} aria-current={index === groupIndex ? 'step' : undefined}><span>{index < groupIndex ? '✓' : index + 1}</span>{group.label}</li>)}
    </ol>
    <details className="lesson-steps"><summary>Lesson steps · {stepLabels[currentStep]}</summary>
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
    </details>
    </div>
  );
}
