import type { ScenarioCapability } from './types';

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
