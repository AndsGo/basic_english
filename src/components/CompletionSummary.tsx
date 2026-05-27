import type { Day } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';

const completedChecklistLabels: Record<keyof UserOutput['checklist'], string> = {
  usedTargetPattern: "Used today's pattern",
  usedLessonWords: 'Used lesson words',
  hasSubjects: 'Each sentence has a subject',
  meaningIsClear: 'Meaning is clear',
};

export function CompletionSummary({
  day,
  output,
  reviewCount,
  nextDay,
  onStartNextDay,
}: {
  day: Day;
  output: UserOutput;
  reviewCount: number;
  nextDay?: Day;
  onStartNextDay?: () => void;
}) {
  const completedChecklist = Object.entries(output.checklist)
    .filter(([, isComplete]) => isComplete)
    .map(([key]) => completedChecklistLabels[key as keyof UserOutput['checklist']]);
  const hasSceneSummary = Boolean(output.scene?.sceneText.trim() || output.scene?.dialogue.trim());

  return (
    <section className="completion-summary">
      <h3>Day {day.dayNumber} complete</h3>
      <p>You can now say: {day.goal}</p>
      <p>Practiced {day.wordIds.length} words and {day.patternIds.length} patterns.</p>
      <h4>Your output</h4>
      {output.scene && hasSceneSummary ? (
        <div className="saved-output">
          <p>
            <strong>Scene</strong>
          </p>
          <p>{output.scene.sceneText}</p>
          <p>
            <strong>Dialogue</strong>
          </p>
          <p>{output.scene.dialogue}</p>
        </div>
      ) : (
        <p className="saved-output">{output.text || 'No saved output text.'}</p>
      )}
      <p>Self rating: {output.selfRating}</p>
      {completedChecklist.length > 0 && (
        <ul className="completion-checklist">
          {completedChecklist.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      )}
      <p>Review tomorrow: {reviewCount}</p>
      {nextDay ? (
        <button type="button" className="primary-button" onClick={onStartNextDay}>
          Start Day {nextDay.dayNumber}
        </button>
      ) : (
        <p>View course result</p>
      )}
    </section>
  );
}
