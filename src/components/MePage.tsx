import { useEffect, useState } from 'react';
import { getCapabilityStates } from '../domain/capabilities';
import type { DayProgress } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import { getCompletedSceneIds } from '../domain/sceneOutput';
import type { PictureDescribeTask, ScenarioCapability, SceneGoal } from '../domain/types';
import type { SpeechRate } from '../speech/speechService';
import type { PictureDescription, ProgressRepository, StudyActivity, UserOutput } from '../storage/progressRepository';
import { SceneMap } from './SceneMap';

const DEFAULT_TOTAL_DAY_COUNT = 7;

function getCurrentStreakDays(activities: StudyActivity[]) {
  const dates = Array.from(new Set(activities.map((activity) => activity.localDate))).sort();
  if (dates.length === 0) return 0;

  let streak = 1;
  for (let index = dates.length - 1; index > 0; index -= 1) {
    const current = new Date(`${dates[index]}T00:00:00`).getTime();
    const previous = new Date(`${dates[index - 1]}T00:00:00`).getTime();
    if (current - previous !== 24 * 60 * 60 * 1000) break;
    streak += 1;
  }

  return streak;
}

function isCompletedDay(day: DayProgress) {
  return day.status === 'completed' || day.currentStep === 'done';
}

function formatDayId(dayId: string) {
  const dayNumber = Number(dayId.replace('day-', ''));
  return Number.isFinite(dayNumber) ? `Day ${dayNumber}` : dayId;
}

function formatDayCompletionHint(dayIds: string[]) {
  const formattedDays = dayIds.map(formatDayId);
  if (formattedDays.length === 0) return '';
  if (formattedDays.length === 1) return `Complete ${formattedDays[0]}.`;
  if (formattedDays.length === 2) return `Complete ${formattedDays[0]} and ${formattedDays[1]}.`;
  return `Complete ${formattedDays.slice(0, -1).join(', ')}, and ${formattedDays[formattedDays.length - 1]}.`;
}

export function MePage({
  repository,
  scenarioCapabilities,
  sceneGoalsByDayId,
  pictureDescribeTasksByDayId = {},
  showChineseHelp = false,
  onShowChineseHelpChange,
  readingEnabled = true,
  onReadingEnabledChange,
  speechRate = 'normal',
  onSpeechRateChange,
  totalDayCount = DEFAULT_TOTAL_DAY_COUNT,
}: {
  repository: ProgressRepository;
  scenarioCapabilities?: ScenarioCapability[];
  sceneGoalsByDayId?: Partial<Record<string, SceneGoal>>;
  pictureDescribeTasksByDayId?: Partial<Record<string, PictureDescribeTask>>;
  showChineseHelp?: boolean;
  onShowChineseHelpChange?: (showChineseHelp: boolean) => void;
  readingEnabled?: boolean;
  onReadingEnabledChange?: (readingEnabled: boolean) => void;
  speechRate?: SpeechRate;
  onSpeechRateChange?: (speechRate: SpeechRate) => void;
  totalDayCount?: number;
}) {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [outputs, setOutputs] = useState<UserOutput[]>([]);
  const [pictureDescriptions, setPictureDescriptions] = useState<PictureDescription[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setHasLoadedProgress(false);

    async function loadProgress() {
      try {
        const [savedDays, savedOutputs, savedPictureDescriptions, activeReviewItems, savedActivities] = await Promise.all([
          repository.listDayProgress(),
          repository.listUserOutputs(),
          repository.listPictureDescriptions(),
          repository.listReviewItems('active'),
          repository.listStudyActivities(),
        ]);

        if (!isMounted) return;
        setDays(savedDays);
        setOutputs(savedOutputs);
        setPictureDescriptions(savedPictureDescriptions);
        setReviewItems(activeReviewItems);
        setActivities(savedActivities);
        setLoadError(false);
        setHasLoadedProgress(true);
      } catch {
        if (!isMounted) return;
        setDays([]);
        setOutputs([]);
        setPictureDescriptions([]);
        setReviewItems([]);
        setActivities([]);
        setLoadError(true);
        setHasLoadedProgress(true);
      }
    }

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const completedDayCount = days.filter(isCompletedDay).length;
  const currentStreakDays = getCurrentStreakDays(activities);
  const hasSettings = Boolean(onShowChineseHelpChange || onReadingEnabledChange || onSpeechRateChange);
  const completedDayIds = days.filter(isCompletedDay).map((day) => day.dayId);
  const capabilityStates =
    scenarioCapabilities && hasLoadedProgress && !loadError ? getCapabilityStates(scenarioCapabilities, completedDayIds) : null;
  const missingNextDayIds =
    capabilityStates?.next?.unlockedByDayIds.filter((dayId) => !completedDayIds.includes(dayId)) ?? [];
  const sceneGoals = sceneGoalsByDayId ? Object.values(sceneGoalsByDayId).filter((goal): goal is SceneGoal => Boolean(goal)) : [];
  const completedSceneIds = getCompletedSceneIds(days, outputs);
  const checkedPictureDescriptions = pictureDescriptions.filter((description) => Boolean(description.checkedAt));

  return (
    <section className="panel">
      <h2>My Progress</h2>
      {loadError && <p role="alert">Progress could not be loaded.</p>}
      <p>
        <span>Completed days: {completedDayCount}</span> / {totalDayCount}
      </p>
      <p>Current streak: {currentStreakDays} days</p>
      <p>Review items: {reviewItems.length}</p>
      {scenarioCapabilities && !hasLoadedProgress && (
        <section>
          <h3>I Can Say</h3>
          <p>Loading capabilities...</p>
        </section>
      )}
      {capabilityStates && (
        <section>
          <h3>I Can Say</h3>
          <section>
            <h4>Unlocked</h4>
            {capabilityStates.unlocked.length > 0 ? (
              <ul>
                {capabilityStates.unlocked.map((capability) => (
                  <li key={capability.id}>{capability.title}</li>
                ))}
              </ul>
            ) : (
              <p>No capabilities unlocked yet.</p>
            )}
          </section>
          <section>
            <h4>Next</h4>
            {capabilityStates.next ? (
              <>
                <p>{capabilityStates.next.title}</p>
                <p>{formatDayCompletionHint(missingNextDayIds)}</p>
              </>
            ) : (
              <p>All available capabilities unlocked.</p>
            )}
          </section>
        </section>
      )}
      {hasSettings && (
        <section>
          <h3>Settings</h3>
          {onShowChineseHelpChange && (
            <label>
              <input
                type="checkbox"
                checked={showChineseHelp}
                onChange={(event) => onShowChineseHelpChange(event.target.checked)}
              />{' '}
              Show Chinese help
            </label>
          )}
          {onReadingEnabledChange && (
            <label>
              <input
                type="checkbox"
                checked={readingEnabled}
                onChange={(event) => onReadingEnabledChange(event.target.checked)}
              />{' '}
              Enable reading aloud
            </label>
          )}
          {onSpeechRateChange && (
            <fieldset className="self-rating">
              <legend>Voice speed</legend>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  value="normal"
                  checked={speechRate === 'normal'}
                  onChange={() => onSpeechRateChange('normal')}
                />{' '}
                Normal
              </label>
              <label>
                <input
                  type="radio"
                  name="speech-rate"
                  value="slow"
                  checked={speechRate === 'slow'}
                  onChange={() => onSpeechRateChange('slow')}
                />{' '}
                Slow
              </label>
            </fieldset>
          )}
        </section>
      )}
      {hasLoadedProgress && !loadError && sceneGoals.length > 0 && (
        <SceneMap goals={sceneGoals} completedSceneIds={completedSceneIds} />
      )}
      <section>
        <h3>My Descriptions</h3>
        {checkedPictureDescriptions.length > 0 ? (
          <div className="output-list">
            {checkedPictureDescriptions.map((description) => {
              const task = pictureDescribeTasksByDayId[description.dayId];

              return (
                <article className="output-card" key={description.dayId}>
                  <strong>{task?.title ?? description.taskId}</strong>
                  <small>{formatDayId(description.dayId)}</small>
                  <p className="saved-output">{description.text}</p>
                  {description.feedback?.status && <span className="status-pill">{description.feedback.status}</span>}
                </article>
              );
            })}
          </div>
        ) : (
          <p>No picture descriptions saved yet.</p>
        )}
      </section>
      <section>
        <h3>Saved Outputs</h3>
        {outputs.length > 0 ? (
          <div className="output-list">
            {outputs.map((output) => {
              const hasSceneOutput = Boolean(output.scene?.sceneText.trim() || output.scene?.dialogue.trim());

              return (
                <article className="output-card" key={output.dayId}>
                  <strong>{output.dayId}</strong>
                  {output.scene && hasSceneOutput ? (
                    <div className="saved-output">
                      {output.scene.sceneText.trim() && <p>{output.scene.sceneText}</p>}
                      {output.scene.dialogue.trim() && <p>{output.scene.dialogue}</p>}
                    </div>
                  ) : (
                    <p className="saved-output">{output.text}</p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <p>No output saved yet.</p>
        )}
      </section>
    </section>
  );
}
