import { useEffect, useState } from 'react';
import { resolveReviewItem, type ReviewItem } from '../domain/review';
import type { SceneRemixTask } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { PictureDescriptionReviewCard } from './PictureDescriptionReviewCard';
import { SceneRemixCard, type SceneRemixSubmitResult } from './SceneRemixCard';

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
  repository,
  onStartToday,
  onReviewChange,
}: {
  repository: ProgressRepository;
  onStartToday?: () => void;
  onReviewChange?: () => void;
}) {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loadError, setLoadError] = useState(false);

  const loadItems = async () => {
    try {
      setItems(await repository.listReviewItems('active'));
      setLoadError(false);
    } catch {
      setItems([]);
      setLoadError(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadActiveItems() {
      try {
        const activeItems = await repository.listReviewItems('active');
        if (!isMounted) return;
        setItems(activeItems);
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

  if (items.length === 0) {
    return (
      <section className="panel">
        <h2>Review today</h2>
        {loadError && <p role="alert">Review items could not be loaded.</p>}
        <p>No review items. Start today&apos;s task.</p>
        {onStartToday && (
          <button type="button" className="primary-button" onClick={onStartToday}>
            Start today
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Review today</h2>
      {loadError && <p role="alert">Review items could not be loaded.</p>}
      <p>
        {items.length} {items.length === 1 ? 'item' : 'items'} to review
      </p>
      <div className="review-list">
        {items.map((item) =>
          item.type === 'scene_remix' ? (
            <SceneRemixCard
              key={item.id}
              title="Review Scene Remix"
              task={makeSceneRemixTaskFromReviewItem(item)}
              initialAnswer=""
              onSubmit={(result) => markSceneRemix(item, result)}
            />
          ) : item.type === 'picture_description' ? (
            <PictureDescriptionReviewCard key={item.id} item={item} onKnown={() => markKnown(item)} />
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
                <button type="button" className="secondary-button">
                  Review again
                </button>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
