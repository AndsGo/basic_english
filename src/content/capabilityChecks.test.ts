import { describe, expect, it } from 'vitest';
import { scenarioCapabilities } from './scenarioCapabilities';
import { capabilityChecksByDayId } from './capabilityChecks';

describe('capability check pilot content', () => {
  it('defines the three pilot missions with valid capability and day links', () => {
    expect(Object.keys(capabilityChecksByDayId)).toEqual(['day-001', 'day-024', 'day-026']);
    const capabilityIds = new Set(scenarioCapabilities.map((capability) => capability.id));

    Object.entries(capabilityChecksByDayId).forEach(([dayId, task]) => {
      expect(task.dayId).toBe(dayId);
      expect(capabilityIds.has(task.capabilityId)).toBe(true);
      expect(task.listening.options).toContain(task.listening.answer);
      expect(task.requiredIdeas).toHaveLength(3);
      expect(task.minimumSentenceCount).toBeGreaterThanOrEqual(3);
    });
  });
});
