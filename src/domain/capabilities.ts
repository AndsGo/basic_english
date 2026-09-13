import { getScenarioMasteryState, type MasteryProgress, type ScenarioMasteryState } from './mastery';
import type { Course, ScenarioCapability } from './types';

export interface CapabilityStates {
  unlocked: ScenarioCapability[];
  locked: ScenarioCapability[];
  next: ScenarioCapability | null;
}

export function getCapabilityStates(capabilities: ScenarioCapability[], completedDayIds: string[]): CapabilityStates {
  const completed = new Set(completedDayIds);
  const unlocked: ScenarioCapability[] = [];
  const locked: ScenarioCapability[] = [];

  capabilities.forEach((capability) => {
    const isUnlocked = capability.unlockedByDayIds.every((dayId) => completed.has(dayId));
    if (isUnlocked) {
      unlocked.push(capability);
    } else {
      locked.push(capability);
    }
  });

  return {
    unlocked,
    locked,
    next: locked[0] ?? null,
  };
}

export function getScenarioCapabilityMasteryState(
  course: Course,
  capability: ScenarioCapability,
  completedDayIds: string[],
  records: MasteryProgress[],
): ScenarioMasteryState {
  const prerequisiteDays = new Set(capability.unlockedByDayIds);
  const contentIds = course.weeks
    .flatMap((week) => week.days)
    .filter((day) => prerequisiteDays.has(day.id))
    .flatMap((day) => [
      ...day.wordIds.map((wordId) => `word:${wordId}`),
      ...day.patternIds.map((patternId) => `pattern:${patternId}`),
    ]);

  return getScenarioMasteryState({
    prerequisiteDayIds: capability.unlockedByDayIds,
    completedDayIds,
    contentIds: [...new Set(contentIds)],
    records,
  });
}
