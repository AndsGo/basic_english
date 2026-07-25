import { describe, expect, it } from 'vitest';
import type { MasteryProgress } from './mastery';
import type { Course, ScenarioCapability } from './types';
import { getCapabilityStates, getScenarioCapabilityMasteryState } from './capabilities';

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

  it('returns Ready at the 70 percent threshold from prerequisite day content', () => {
    const course: Course = {
      id: 'test-course',
      title: 'Test course',
      contentVersion: 'test',
      schemaVersion: 1,
      words: [],
      patterns: [],
      weeks: [
        {
          id: 'week-1',
          number: 1,
          title: 'Week 1',
          goal: 'Test',
          days: [
            {
              id: 'day-001',
              weekId: 'week-1',
              dayNumber: 1,
              title: 'Day 1',
              goal: 'Test',
              estimatedMinutes: 5,
              review: { wordCount: 0, patternCount: 0 },
              wordIds: ['word-1', 'word-2', 'word-3', 'word-4', 'word-5'],
              patternIds: ['pattern-1', 'pattern-2', 'pattern-3', 'pattern-4', 'pattern-5'],
              exercises: [],
              outputTask: { id: 'output', topic: 'Test', prompts: [], template: [], requiredSentenceCount: 1 },
            },
          ],
        },
      ],
    };
    const records: MasteryProgress[] = Array.from({ length: 7 }, (_, index) => ({
      id: `mastery-${index}`,
      contentType: index < 5 ? 'word' : 'pattern',
      contentId: index < 5 ? `word-${index + 1}` : `pattern-${index - 4}`,
      sourceDayId: 'day-001',
      status: index < 5 ? 'stable' : 'mastered',
      consecutiveCorrect: index < 5 ? 2 : 3,
      dueAt: '2026-07-25T00:00:00.000Z',
      updatedAt: '2026-07-22T00:00:00.000Z',
    }));

    const result = getScenarioCapabilityMasteryState(course, capabilities[0], ['day-001'], records);

    expect(result).toMatchObject({ status: 'ready', stablePercent: 70, verifiedCount: 7, totalCount: 10 });
  });
});
