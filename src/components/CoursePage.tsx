import type { Course } from '../domain/types';
import { deriveCourseDayStates, type CourseDayState } from '../domain/progress';

const dayStateLabels: Record<CourseDayState, string> = {
  completed: 'Completed',
  current: 'Current',
  locked: 'Locked',
  review_needed: 'Review needed',
};

export function CoursePage({
  course,
  completedDayIds,
  activeReviewDayIds,
  reviewCount,
  onStartDay,
}: {
  course: Course;
  completedDayIds: string[];
  activeReviewDayIds: string[];
  reviewCount: number;
  onStartDay: (dayId: string) => void;
}) {
  const week = course.weeks[0];
  const dayStates = deriveCourseDayStates({
    orderedDayIds: week.days.map((day) => day.id),
    completedDayIds,
    activeReviewDayIds,
  });

  return (
    <section className="panel">
      <h2>{week.title}</h2>
      <p>{week.goal}</p>
      <p>{completedDayIds.length} / {week.days.length} days completed</p>
      <p>
        Review: {reviewCount} {reviewCount === 1 ? 'item' : 'items'}
      </p>
      <div className="day-list">
        {week.days.map((day) => {
          const state = dayStates[day.id];
          const canOpen = state !== 'locked';

          return (
            <article className="day-row" key={day.id}>
              <div className="button-row">
                <strong>
                  Day {day.dayNumber}: {day.title}
                </strong>
                <span className="status-pill">{dayStateLabels[state]}</span>
              </div>
              <span>{day.goal}</span>
              <small>{day.estimatedMinutes} minutes</small>
              {canOpen && (
                <button type="button" className="secondary-button" onClick={() => onStartDay(day.id)}>
                  Open Today
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
