import { describe, expect, it } from 'vitest';
import { week13, week13Patterns, week13Words } from './week13';
import { pictureDescribeTasksByDayId } from './pictureDescribeTasks';
import { sceneGoalsByDayId } from './sceneGoals';
import { sceneRemixTasksByDayId } from './sceneRemixTasks';
import { wordFlashcardImages } from './wordFlashcardImages';

describe('Week 13 content', () => {
  it('adds seven playable days and 17 new core words', () => {
    expect(week13.days.map((day) => day.id)).toEqual(['day-085', 'day-086', 'day-087', 'day-088', 'day-089', 'day-090', 'day-091']);
    expect(week13Words).toHaveLength(17);
    expect(week13Patterns).toHaveLength(4);
    expect(week13.days.every((day) => day.exercises.length >= 5)).toBe(true);
  });

  it('has all learning assets for every Week 13 day and word', () => {
    for (const word of week13Words) expect(wordFlashcardImages[word.id]).toBeDefined();
    for (const day of week13.days) {
      expect(pictureDescribeTasksByDayId[day.id]).toBeDefined();
      expect(sceneGoalsByDayId[day.id]).toBeDefined();
      expect(sceneRemixTasksByDayId[day.id]?.length).toBeGreaterThan(0);
    }
  });
});
