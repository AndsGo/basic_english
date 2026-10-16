import { useCallback, useEffect, useState } from 'react';
import {
  REVIEW_INTERVAL_DAYS,
  rescheduleReviewItem,
  resolveReviewItem,
  selectDueReviewItems,
  type ReviewItem,
} from '../domain/review';
import type { Course, SceneRemixTask } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { MasteryReviewPanel } from './MasteryReviewPanel';
import { PictureDescriptionReviewCard } from './PictureDescriptionReviewCard';
import { SceneRemixCard, type SceneRemixSubmitResult } from './SceneRemixCard';
import { selectDueCapabilityAttempts, type CapabilityCheckAttempt } from '../domain/capabilityCheck';
import { capabilityChecksByDayId } from '../content/capabilityChecks';
import { CapabilityCheckPanel } from './CapabilityCheckPanel';

function makeSceneRemixTaskFromReviewItem(item: ReviewItem): SceneRemixTask {
  return {
    id: item.taskId ?? item.id,
    type: 'replace',
    prompt: item.prompt,
    source: item.source,
    referenceAnswers: item.referenceAnswer ? [item.referenceAnswer] : [],
  };
}

function makeSceneRemixReviewAttemptId(dayId: string, taskId: string, now: string): string {
  return `scene-remix-review-attempt-${dayId}-${taskId}-${now}`;
}

export function ReviewPage({
  course,
  repository,
  onStartToday,
  onReviewChange,
}: {
  course: Course;
  repository: ProgressRepository;
  onStartToday?: () => void;
  onReviewChange?: () => void;
}) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [capabilityAttempts, setCapabilityAttempts] = useState<CapabilityCheckAttempt[]>([]);

  const loadItems = useCallback(async () => {
    try {
      const [reviewItems, attempts] = await Promise.all([
        repository.listReviewItems('active'),
        repository.listCapabilityCheckAttempts?.() ?? Promise.resolve([]),
      ]);
      setItems(reviewItems);
      setCapabilityAttempts(attempts);
      setLoadError(false);
    } catch {
      setItems([]);
      setCapabilityAttempts([]);
      setLoadError(true);
    }
  }, [repository]);

  useEffect(() => {
    let isMounted = true;

    async function loadActiveItems() {
      try {
        const [activeItems, attempts] = await Promise.all([
          repository.listReviewItems('active'),
          repository.listCapabilityCheckAttempts?.() ?? Promise.resolve([]),
        ]);
        if (!isMounted) return;
        setItems(activeItems);
        setCapabilityAttempts(attempts);
        setLoadError(false);
      } catch {
        if (!isMounted) return;
        setItems([]);
        setLoadError(true);
      }
    }

    void loadActiveItems();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  const markKnown = async (item: ReviewItem) => {
    await repository.saveReviewItem(resolveReviewItem(item, new Date().toISOString()));
    await loadItems();
    onReviewChange?.();
  };

  const reviewAgain = async (item: ReviewItem) => {
    const now = new Date().toISOString();
    const days = REVIEW_INTERVAL_DAYS[Math.min(item.reviewStage ?? 0, REVIEW_INTERVAL_DAYS.length - 1)];
    await repository.saveReviewItem(rescheduleReviewItem(item, now));
    setFeedback(`Saved for later — back in ${days} day${days === 1 ? '' : 's'}.`);
    await loadItems();
    onReviewChange?.();
  };

  const markSceneRemix = async (item: ReviewItem, result: SceneRemixSubmitResult) => {
    const now = new Date().toISOString();
    const taskId = item.taskId ?? item.id;
    await repository.saveSceneRemixAttempt({
      id: makeSceneRemixReviewAttemptId(item.sourceDayId, taskId, now),
      dayId: item.sourceDayId,
      taskId,
      userAnswer: result.userAnswer,
      selfMark: result.selfMark,
      createdAt: now,
    });

    if (result.selfMark === 'close') {
      await repository.saveReviewItem(resolveReviewItem(item, now));
    } else {
      await repository.saveReviewItem({
        ...item,
        userAnswer: result.userAnswer,
        status: 'active',
        updatedAt: now,
      });
    }
    await loadItems();
    onReviewChange?.();
  };

  const dueItems = selectDueReviewItems(items, new Date().toISOString());
  const dueCapabilityAttempts = selectDueCapabilityAttempts(capabilityAttempts, new Date().toISOString());
  const dueCapabilityTasks = dueCapabilityAttempts
    .map((attempt) => capabilityChecksByDayId[attempt.dayId])
    .filter((task) => Boolean(task));

  const handleCapabilityChange = useCallback((isComplete: boolean) => {
    if (!isComplete) return;
    void loadItems();
    onReviewChange?.();
  }, [loadItems, onReviewChange]);

  return (
    <section className="panel">
      <h2>Review today</h2>
      <section aria-label="Mastery review">
        <MasteryReviewPanel course={course} repository={repository} onChange={onReviewChange} />
      </section>
      {repository.listCapabilityCheckAttempts && repository.saveCapabilityCheckAttempt && (
        <section className="capability-review" aria-label="Capability checks">
          <div className="section-header">
            <h2>Capability checks</h2>
            <span className="muted">{dueCapabilityTasks.length} due</span>
          </div>
          {dueCapabilityTasks.length === 0 ? (
            <p>No capability checks due today.</p>
          ) : (
            <div className="capability-review-list">
              {dueCapabilityTasks.map((task) => (
                <CapabilityCheckPanel
                  key={task.id}
                  task={task}
                  repository={repository}
                  practiceMode
                  onCompletionChange={handleCapabilityChange}
                />
              ))}
            </div>
          )}
        </section>
      )}
      <section aria-label="Practice again">
        <h2>Practice again</h2>
        {loadError && <p role="alert">Review items could not be loaded.</p>}
        {feedback && (
          <p className="selection-status" role="status">
            {feedback}
          </p>
        )}
        {dueItems.length === 0 ? (
          <>
            <p>No practice items due today.</p>
            {onStartToday && (
              <button type="button" className="primary-button" onClick={onStartToday}>
                Start today
              </button>
            )}
          </>
        ) : (
          <>
            <p>
              {dueItems.length} {dueItems.length === 1 ? 'item' : 'items'} to review
            </p>
            <div className="review-list">
              {dueItems.map((item) =>
          item.type === 'scene_remix' ? (
            <SceneRemixCard
              key={item.id}
              title="Review Scene Remix"
              task={makeSceneRemixTaskFromReviewItem(item)}
              initialAnswer=""
              onSubmit={(result) => markSceneRemix(item, result)}
            />
          ) : item.type === 'picture_description' ? (
            <PictureDescriptionReviewCard
              key={item.id}
              item={item}
              onKnown={() => markKnown(item)}
              onReviewAgain={() => reviewAgain(item)}
            />
          ) : (
            <article className="review-card" key={item.id}>
              <p className="eyebrow">
                {item.type} / {item.sourceDayId}
              </p>
              <h3>{item.prompt}</h3>
              {item.userAnswer && <p>User answer: {item.userAnswer}</p>}
              {item.referenceAnswer && <p>Reference answer: {item.referenceAnswer}</p>}
              <div className="button-row">
                <button type="button" className="primary-button" onClick={() => void markKnown(item)}>
                  I know this
                </button>
                <button type="button" className="secondary-button" onClick={() => void reviewAgain(item)}>
                  Review again
                </button>
              </div>
            </article>
          ),
              )}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
