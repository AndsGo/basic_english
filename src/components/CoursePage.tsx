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
  const allDays = course.weeks.flatMap((week) => week.days);
  const dayStates = deriveCourseDayStates({
    orderedDayIds: allDays.map((day) => day.id),
    completedDayIds,
    activeReviewDayIds,
  });
  const completedDays = new Set(completedDayIds);

  return (
    <section className="panel">
      <p>
        Review: {reviewCount} {reviewCount === 1 ? 'item' : 'items'}
      </p>
      {course.weeks.map((week, weekIndex) => {
        const previousWeeks = course.weeks.slice(0, weekIndex);
        const isWeekLocked = previousWeeks.some((previousWeek) =>
          previousWeek.days.some((day) => !completedDays.has(day.id)),
        );
        const completedWeekDayCount = week.days.filter((day) => completedDays.has(day.id)).length;
        const lockedMessage = isWeekLocked ? `Complete Week ${week.number - 1} to unlock ${week.title}.` : undefined;

        return (
          <section className="week-section" key={week.id}>
            <h2>{week.title}</h2>
            <p>{week.goal}</p>
            <p>
              {completedWeekDayCount} / {week.days.length} days completed
            </p>
            <div className="day-list">
              {week.days.map((day) => {
                const state = isWeekLocked ? 'locked' : dayStates[day.id];
                const actionLabel =
                  state === 'current' ? 'Open Today' : state === 'review_needed' ? 'Review Day' : undefined;

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
                    {lockedMessage && <small className="helper-text">{lockedMessage}</small>}
                    {actionLabel && (
                      <button type="button" className="secondary-button" onClick={() => onStartDay(day.id)}>
                        {actionLabel}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}
