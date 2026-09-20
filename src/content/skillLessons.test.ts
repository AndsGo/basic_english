import { describe, expect, it } from 'vitest';
import { skillLessonsByDayId } from './skillLessons';

describe('Day 1 skill lesson', () => {
  it('has three hidden-text listening checks and two speaking tasks', () => {
    const lesson = skillLessonsByDayId['day-001'];
    expect(lesson.listening).toHaveLength(3);
    expect(lesson.speaking).toHaveLength(2);
    expect(lesson.listening.every((task) => task.options.includes(task.answer))).toBe(true);
  });
});
