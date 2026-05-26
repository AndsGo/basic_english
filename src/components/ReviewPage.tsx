import { useEffect, useState } from 'react';
import { resolveReviewItem, type ReviewItem } from '../domain/review';
import type { ProgressRepository } from '../storage/progressRepository';

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
        {items.map((item) => (
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
        ))}
      </div>
    </section>
  );
}
