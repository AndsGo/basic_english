import { describe, expect, it } from 'vitest';
import type { ScenarioCapability } from './types';
import { getCapabilityStates } from './capabilities';

const capabilities: ScenarioCapability[] = [
  {
    id: 'introduce-myself',
    title: 'I can introduce myself.',
    description: 'Say name and place.',
    unlockedByDayIds: ['day-001'],
    exampleOutputs: ['My name is Li.'],
  },
  {
    id: 'describe-my-room',
    title: 'I can describe my room.',
    description: 'Say simple facts about a room.',
    unlockedByDayIds: ['day-008'],
    exampleOutputs: ['This is my room.'],
  },
  {
    id: 'say-where-things-are',
    title: 'I can say where things are.',
    description: 'Use in, on, under, and near.',
    unlockedByDayIds: ['day-010'],
    exampleOutputs: ['The book is on the table.'],
  },
];

describe('capability states', () => {
  it('marks capabilities unlocked when all required days are complete', () => {
    const states = getCapabilityStates(capabilities, ['day-001', 'day-008']);

    expect(states.unlocked.map((capability) => capability.id)).toEqual(['introduce-myself', 'describe-my-room']);
    expect(states.next?.id).toBe('say-where-things-are');
    expect(states.locked.map((capability) => capability.id)).toEqual(['say-where-things-are']);
  });

  it('keeps multi-day capabilities locked until every required day is complete', () => {
    const multiDay: ScenarioCapability = {
      id: 'week-2-check',
      title: 'I can describe my room and things.',
      description: 'Complete the Week 2 check.',
      unlockedByDayIds: ['day-008', 'day-014'],
      exampleOutputs: ['This is my room. There is a book on the table.'],
    };

    expect(getCapabilityStates([multiDay], ['day-008']).unlocked).toEqual([]);
    expect(getCapabilityStates([multiDay], ['day-008', 'day-014']).unlocked).toEqual([multiDay]);
  });
});
