import type { Day } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';

const completedChecklistLabels: Record<keyof UserOutput['checklist'], string> = {
  usedTargetPattern: "Used today's pattern",
  usedLessonWords: 'Used lesson words',
  hasSubjects: 'Each sentence has a subject',
  meaningIsClear: 'Meaning is clear',
};

export function CompletionSummary({ day, output }: { day: Day; output: UserOutput }) {
  const completedChecklist = Object.entries(output.checklist)
    .filter(([, isComplete]) => isComplete)
    .map(([key]) => completedChecklistLabels[key as keyof UserOutput['checklist']]);

  return (
    <section className="completion-summary">
      <h3>Day complete</h3>
      <p>You can now say: {day.goal}</p>
      <h4>Your output</h4>
      <p className="saved-output">{output.text || 'No saved output text.'}</p>
      <p>Self rating: {output.selfRating}</p>
      {completedChecklist.length > 0 && (
        <ul className="completion-checklist">
          {completedChecklist.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      )}
      <p>Come back for the next day.</p>
    </section>
  );
}
