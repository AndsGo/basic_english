import { RadioGroup, Switch } from './ui/SelectionControls';
import { useEffect, useState } from 'react';
import { getCapabilityStates, getScenarioCapabilityMasteryState } from '../domain/capabilities';
import { buildDailyLearningInsight, type DailyLearningInsight } from '../domain/dailyLearningInsights';
import { toLocalDateString, type MasteryProgress, type ScenarioMasteryState } from '../domain/mastery';
import type { DayProgress } from '../domain/progress';
import type { ReviewItem } from '../domain/review';
import { getCompletedSceneIds } from '../domain/sceneOutput';
import type { Course, PictureDescribeTask, ScenarioCapability, SceneGoal } from '../domain/types';
import type { SpeechLanguage, SpeechRate } from '../speech/speechService';
import type { ThemePreference } from '../theme';
import type { PictureDescription, ProgressRepository, ReinforcementPracticeSession, StudyActivity, UserOutput } from '../storage/progressRepository';
import { SceneMap } from './SceneMap';
import { getLatestCapabilityAttempts, type CapabilityCheckAttempt } from '../domain/capabilityCheck';
import { capabilityChecksByDayId } from '../content/capabilityChecks';
import { loadStoryProgress } from '../storage/storyProgress';

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

function formatScenarioMasteryStatus(status: ScenarioMasteryState['status']) {
  return {
    not_started: 'Not started',
    building: 'Building',
    ready: 'Ready',
    strong: 'Strong',
  }[status];
}

function getCapabilityNextAction(state: ScenarioMasteryState, missingDayIds: string[]) {
  if (missingDayIds.length > 0) return `Complete ${formatDayId(missingDayIds[0])}`;
  if (state.status === 'strong') return 'Keep it strong with future review.';

  const reviewCount = Math.max(0, state.totalCount - state.verifiedCount);
  return `Review ${reviewCount} item${reviewCount === 1 ? '' : 's'}`;
}

export function MePage({
  repository,
  course,
  scenarioCapabilities,
  sceneGoalsByDayId,
  pictureDescribeTasksByDayId = {},
  showChineseHelp = false,
  onShowChineseHelpChange,
  readingEnabled = true,
  onReadingEnabledChange,
  speechRate = 'normal',
  onSpeechRateChange,
  speechLanguage = 'en-US',
  onSpeechLanguageChange,
  themePreference = 'system',
  onThemePreferenceChange,
  totalDayCount = DEFAULT_TOTAL_DAY_COUNT,
}: {
  repository: ProgressRepository;
  course: Course;
  scenarioCapabilities?: ScenarioCapability[];
  sceneGoalsByDayId?: Partial<Record<string, SceneGoal>>;
  pictureDescribeTasksByDayId?: Partial<Record<string, PictureDescribeTask>>;
  showChineseHelp?: boolean;
  onShowChineseHelpChange?: (showChineseHelp: boolean) => void;
  readingEnabled?: boolean;
  onReadingEnabledChange?: (readingEnabled: boolean) => void;
  speechRate?: SpeechRate;
  onSpeechRateChange?: (speechRate: SpeechRate) => void;
  speechLanguage?: SpeechLanguage;
  onSpeechLanguageChange?: (speechLanguage: SpeechLanguage) => void;
  themePreference?: ThemePreference;
  onThemePreferenceChange?: (themePreference: ThemePreference) => void;
  totalDayCount?: number;
}) {
  const [days, setDays] = useState<DayProgress[]>([]);
  const [outputs, setOutputs] = useState<UserOutput[]>([]);
  const [pictureDescriptions, setPictureDescriptions] = useState<PictureDescription[]>([]);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [masteryProgress, setMasteryProgress] = useState<MasteryProgress[]>([]);
  const [dailyLearningInsight, setDailyLearningInsight] = useState<DailyLearningInsight | undefined>();
  const [reinforcementSessions, setReinforcementSessions] = useState<ReinforcementPracticeSession[]>([]);
  const [capabilityAttempts, setCapabilityAttempts] = useState<CapabilityCheckAttempt[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [storySentences, setStorySentences] = useState<Array<{ id: string; title: string; wordId: string; sentence: string }>>([]);

  useEffect(() => {
    let active = true;
    void import('../content/wordStories').then(({ wordStories }) => {
      if (active) setStorySentences(wordStories.flatMap(story => {
        const sentence = loadStoryProgress(story.id).sentence;
        return sentence ? [{ id: story.id, title: story.title, wordId: story.wordId, sentence }] : [];
      }));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setHasLoadedProgress(false);

    async function loadProgress() {
      try {
        const [savedDays, savedOutputs, savedPictureDescriptions, activeReviewItems, savedActivities, savedMasteryProgress, savedCapabilityAttempts] = await Promise.all([
          repository.listDayProgress(),
          repository.listUserOutputs(),
          repository.listPictureDescriptions(),
          repository.listReviewItems('active'),
          repository.listStudyActivities(),
          repository.listMasteryProgress(),
          repository.listCapabilityCheckAttempts?.() ?? Promise.resolve([]),
        ]);

        if (!isMounted) return;
        setDays(savedDays);
        setOutputs(savedOutputs);
        setPictureDescriptions(savedPictureDescriptions);
        setReviewItems(activeReviewItems);
        setActivities(savedActivities);
        setMasteryProgress(savedMasteryProgress);
        setCapabilityAttempts(savedCapabilityAttempts);
        setLoadError(false);
        setHasLoadedProgress(true);

        try {
          const localDate = toLocalDateString(new Date());
          const [masterySession, savedReinforcementSessions] = await Promise.all([
            repository.getMasteryReviewSession(localDate),
            repository.listReinforcementPracticeSessions(),
          ]);
          if (!isMounted) return;
          const completedDayIds = savedDays.filter(isCompletedDay).map((day) => day.dayId);
          setDailyLearningInsight(buildDailyLearningInsight({
            course,
            capabilities: scenarioCapabilities ?? [],
            completedDayIds,
            masteryProgress: savedMasteryProgress,
            activeReviewItems,
            masterySessions: masterySession ? [masterySession] : [],
            localDate,
          }));
          setReinforcementSessions(savedReinforcementSessions);
        } catch {
          if (!isMounted) return;
          setDailyLearningInsight(undefined);
          setReinforcementSessions([]);
        }
      } catch {
        if (!isMounted) return;
        setDays([]);
        setOutputs([]);
        setPictureDescriptions([]);
        setReviewItems([]);
        setActivities([]);
        setMasteryProgress([]);
        setDailyLearningInsight(undefined);
        setReinforcementSessions([]);
        setCapabilityAttempts([]);
        setLoadError(true);
        setHasLoadedProgress(true);
      }
    }

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [course, repository, scenarioCapabilities]);

  const completedDayCount = days.filter(isCompletedDay).length;
  const currentStreakDays = getCurrentStreakDays(activities);
  const hasSettings = Boolean(
    onShowChineseHelpChange || onReadingEnabledChange || onSpeechRateChange || onSpeechLanguageChange || onThemePreferenceChange,
  );
  const completedDayIds = days.filter(isCompletedDay).map((day) => day.dayId);
  const capabilityStates =
    scenarioCapabilities && hasLoadedProgress && !loadError ? getCapabilityStates(scenarioCapabilities, completedDayIds) : null;
  const missingNextDayIds =
    capabilityStates?.next?.unlockedByDayIds.filter((dayId) => !completedDayIds.includes(dayId)) ?? [];
  const capabilityMasteryStates =
    scenarioCapabilities && hasLoadedProgress && !loadError
      ? scenarioCapabilities.map((capability) => ({
          capability,
          state: getScenarioCapabilityMasteryState(course, capability, completedDayIds, masteryProgress),
        }))
      : null;
  const sceneGoals = sceneGoalsByDayId ? Object.values(sceneGoalsByDayId).filter((goal): goal is SceneGoal => Boolean(goal)) : [];
  const completedSceneIds = getCompletedSceneIds(days, outputs);
  const checkedPictureDescriptions = pictureDescriptions.filter((description) => Boolean(description.checkedAt));
  const latestReinforcementSession = dailyLearningInsight
    ? reinforcementSessions
      .filter((session) => session.insightId === dailyLearningInsight.id && session.localDate === dailyLearningInsight.localDate)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
    : undefined;
  const practiceState = latestReinforcementSession?.status === 'completed'
    ? 'Practice complete'
    : latestReinforcementSession?.status === 'skipped'
      ? 'Practice skipped'
      : 'Practice available';
  const latestCapabilityAttempts = getLatestCapabilityAttempts(capabilityAttempts);
  const independentAttempts = latestCapabilityAttempts.filter((attempt) => attempt.result === 'independent');
  const capabilityResultLabel = {
    independent: 'Independent',
    'with-help': 'With help',
    'practice-again': 'Practice again',
  } as const;

  return (
    <section className="panel me-page">
      <p className="eyebrow">Your English, growing every day</p>
      <h2>My Progress</h2>
      {loadError && <p role="alert">Progress could not be loaded.</p>}
      <p>
        <span>Completed days: {completedDayCount}</span> / {totalDayCount}
      </p>
      <p>Current streak: {currentStreakDays} days</p>
      <p>Review items: {reviewItems.length}</p>
      <section className="saved-story-sentences">
        <h3>My story sentences</h3>
        {storySentences.length === 0 ? <p className="muted">No sentences yet. Save your own sentence after a story.</p> :
          storySentences.map(story => <article className="output-card" key={story.id}><p className="muted">{story.title} · {story.wordId}</p><p>{story.sentence}</p></article>)}
      </section>
      {dailyLearningInsight && (
        <section className="daily-learning-report">
          <h3>Latest learning</h3>
          <p className="daily-learning-report-outcome">
            {dailyLearningInsight.items.length === 0
              ? 'Strong today'
              : dailyLearningInsight.items.length === 1
                ? 'Keep practicing'
                : `Focus on ${dailyLearningInsight.items.length} items`}
          </p>
          {dailyLearningInsight.items.length === 0 ? (
            <p>No targeted practice due today.</p>
          ) : (
            <ul className="daily-learning-report-list">
              {dailyLearningInsight.items.map((item) => (
                <li key={item.contentKey}>
                  <p>{item.reason}</p>
                  {item.scenarioTitle && <p>Scenario: {item.scenarioTitle}</p>}
                </li>
              ))}
            </ul>
          )}
          {dailyLearningInsight.items.length > 0 && <p>{practiceState}</p>}
        </section>
      )}
      {repository.listCapabilityCheckAttempts && (
        <section className="capability-outcomes">
          <div className="section-header">
            <h3>Scenes I Can Describe</h3>
            <span className="muted">{independentAttempts.length} independent</span>
          </div>
          {independentAttempts.length === 0 ? (
            <p>Complete a capability check without help to add a scene here.</p>
          ) : (
            <ul className="independent-scene-list">
              {independentAttempts.map((attempt) => (
                <li key={attempt.capabilityId}>
                  <strong>{capabilityChecksByDayId[attempt.dayId]?.title ?? attempt.capabilityId}</strong>
                  <span>Independent</span>
                </li>
              ))}
            </ul>
          )}
          <h4>Latest capability checks</h4>
          {latestCapabilityAttempts.length === 0 ? (
            <p>No capability checks completed yet.</p>
          ) : (
            <div className="capability-check-summary">
              {latestCapabilityAttempts.map((attempt) => (
                <article key={attempt.capabilityId}>
                  <strong>{capabilityChecksByDayId[attempt.dayId]?.title ?? attempt.capabilityId}</strong>
                  <span className={`capability-result capability-result--${attempt.result}`}>
                    {capabilityResultLabel[attempt.result]}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
      {scenarioCapabilities && !hasLoadedProgress && (
        <section>
          <h3>I Can Say</h3>
          <p>Loading capabilities...</p>
        </section>
      )}
      {capabilityStates && (
        <section>
          <h3>I Can Say</h3>
          {capabilityMasteryStates && (
            <div className="capability-status-list">
              {capabilityMasteryStates.map(({ capability, state }) => {
                const missingDayIds = capability.unlockedByDayIds.filter((dayId) => !completedDayIds.includes(dayId));

                return (
                  <article className="capability-status" key={capability.id}>
                    <strong>Scenario: {capability.title}</strong>
                    <p>{formatScenarioMasteryStatus(state.status)}</p>
                    <p>Verified: {state.verifiedCount} / {state.totalCount}</p>
                    <p className="capability-next-action">{getCapabilityNextAction(state, missingDayIds)}</p>
                  </article>
                );
              })}
            </div>
          )}
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
        <section className="settings-section">
          <h3>Settings</h3>
          {onShowChineseHelpChange && <Switch label="Show Chinese help" checked={showChineseHelp} onChange={event => onShowChineseHelpChange(event.target.checked)} />}
          {onReadingEnabledChange && <Switch label="Enable reading aloud" checked={readingEnabled} onChange={event => onReadingEnabledChange(event.target.checked)} />}
          {onSpeechRateChange && <RadioGroup label="Voice speed" name="speech-rate" value={speechRate} onValueChange={value => onSpeechRateChange(value as SpeechRate)}
            options={[{ value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow' }]} />}
          {onSpeechLanguageChange && <RadioGroup label="Voice language" name="speech-language" value={speechLanguage} onValueChange={value => onSpeechLanguageChange(value as SpeechLanguage)}
            options={[{ value: 'en-US', label: 'American English' }, { value: 'en-GB', label: 'British English' }, { value: 'en-AU', label: 'Australian English' }, { value: 'en-CA', label: 'Canadian English' }]} />}
          {onThemePreferenceChange && <RadioGroup label="Theme" name="theme" value={themePreference} onValueChange={value => onThemePreferenceChange(value as ThemePreference)}
            options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />}
        </section>
      )}
      {hasLoadedProgress && !loadError && !repository.listCapabilityCheckAttempts && sceneGoals.length > 0 && (
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
