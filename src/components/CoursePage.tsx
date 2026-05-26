import type { Course } from '../domain/types';

export function CoursePage({ course }: { course: Course }) {
  const week = course.weeks[0];

  return (
    <section className="panel">
      <h2>{week.title}</h2>
      <p>{week.goal}</p>
      <div className="day-list">
        {week.days.map((day) => (
          <article className="day-row" key={day.id}>
            <strong>
              Day {day.dayNumber}: {day.title}
            </strong>
            <span>{day.goal}</span>
            <small>{day.estimatedMinutes} minutes</small>
          </article>
        ))}
      </div>
    </section>
  );
}
