import { useEffect, useState } from 'react';
import { getCapabilityStates } from '../domain/capabilities';
import type { DayProgress } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import type { ScenarioCapability } from '../domain/types';
import type { SpeechRate } from '../speech/speechService';
import type { ProgressRepository, StudyActivity, UserOutput } from '../storage/progressRepository';

const WEEK_DAY_COUNT = 7;

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
  showChineseHelp = false,
  onShowChineseHelpChange,
  readingEnabled = true,
  onReadingEnabledChange,
  speechRate = 'normal',
  onSpeechRateChange,
}: {
  repository: ProgressRepository;
  scenarioCapabilities?: ScenarioCapability[];
  showChineseHelp?: boolean;
  onShowChineseHelpChange?: (showChineseHelp: boolean) => void;
  readingEnabled?: boolean;
  onReadingEnabledChange?: (readingEnabled: boolean) => void;
  speechRate?: SpeechRate;
  onSpeechRateChange?: (speechRate: SpeechRate) => void;
}) {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [outputs, setOutputs] = useState<UserOutput[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProgress() {
      try {
        const [savedDays, savedOutputs, activeReviewItems, savedActivities] = await Promise.all([
          repository.listDayProgress(),
          repository.listUserOutputs(),
          repository.listReviewItems('active'),
          repository.listStudyActivities(),
        ]);

        if (!isMounted) return;
        setDays(savedDays);
        setOutputs(savedOutputs);
        setReviewItems(activeReviewItems);
        setActivities(savedActivities);
        setLoadError(false);
      } catch {
        if (!isMounted) return;
        setDays([]);
        setOutputs([]);
        setReviewItems([]);
        setActivities([]);
        setLoadError(true);
      }
    }

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const completedDayCount = days.filter((day) => day.status === 'completed').length;
  const currentStreakDays = getCurrentStreakDays(activities);
  const hasSettings = Boolean(onShowChineseHelpChange || onReadingEnabledChange || onSpeechRateChange);
  const completedDayIds = days.filter((day) => day.status === 'completed').map((day) => day.dayId);
  const capabilityStates = scenarioCapabilities ? getCapabilityStates(scenarioCapabilities, completedDayIds) : null;
  const missingNextDayIds =
    capabilityStates?.next?.unlockedByDayIds.filter((dayId) => !completedDayIds.includes(dayId)) ?? [];

  return (
    <section className="panel">
      <h2>My Progress</h2>
      {loadError && <p role="alert">Progress could not be loaded.</p>}
      <p>
        <span>Completed days: {completedDayCount}</span> / {WEEK_DAY_COUNT}
      </p>
      <p>Current streak: {currentStreakDays} days</p>
      <p>Review items: {reviewItems.length}</p>
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
      <section>
        <h3>Saved Outputs</h3>
        {outputs.length > 0 ? (
          <div className="output-list">
            {outputs.map((output) => (
              <article className="output-card" key={output.dayId}>
                <strong>{output.dayId}</strong>
                <p className="saved-output">{output.text}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>No output saved yet.</p>
        )}
      </section>
    </section>
  );
}
