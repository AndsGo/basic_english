import type { StudyActivity } from '../storage/progressRepository';

/** Local calendar date as YYYY-MM-DD (used to group study activity and compute streaks). */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Upsert today's study-activity record, merging the completed day id without duplicates. */
export function buildStudyActivity(
  existing: StudyActivity | undefined,
  dayId: string,
  localDate: string,
): StudyActivity {
  const completedDayIds = new Set(existing?.completedDayIds ?? []);
  completedDayIds.add(dayId);

  return {
    id: `activity-${localDate}`,
    localDate,
    completedDayIds: [...completedDayIds],
  };
}
