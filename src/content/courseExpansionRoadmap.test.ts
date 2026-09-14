import { describe, expect, it } from 'vitest';
import { basicEnglishWordList, basicEnglishAllowedWords } from './basicEnglish850';
import { basicEnglishCourse } from './course';
import { courseExpansionRoadmap, summarizeCourseExpansionRoadmap } from './courseExpansionRoadmap';

describe('courseExpansionRoadmap', () => {
  it('plans Weeks 13-52 as the long-term Basic English 850 expansion', () => {
    expect(courseExpansionRoadmap).toHaveLength(40);
    expect(courseExpansionRoadmap.map((week) => week.weekNumber)).toEqual(
      Array.from({ length: 40 }, (_, index) => index + 13),
    );
  });

  it('keeps future weekly core-word load in a sustainable range', () => {
    for (const week of courseExpansionRoadmap) {
      expect(week.targetCoreWords).toBeGreaterThanOrEqual(14);
      expect(week.targetCoreWords).toBeLessThanOrEqual(18);
      expect(week.focusCategories.length).toBeGreaterThanOrEqual(2);
      expect(week.theme.trim()).not.toBe('');
      expect(week.expressionOutcome.trim()).not.toBe('');
    }
  });

  it('has enough target capacity to finish the remaining Basic English core words', () => {
    const summary = summarizeCourseExpansionRoadmap({
      course: basicEnglishCourse,
      basicEnglishAllowedWords,
      basicEnglishWordList,
      roadmap: courseExpansionRoadmap,
    });

    expect(summary.currentCoreCoverage).toBe(550);
    expect(summary.remainingCoreWords).toBe(300);
    expect(summary.plannedFutureCoreWords).toBeGreaterThanOrEqual(summary.remainingCoreWords);
    expect(summary.totalPlannedWeeks).toBe(74);
    expect(summary.averageFutureCoreWordsPerWeek).toBeCloseTo(17, 1);
  });
});
