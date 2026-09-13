import { describe, expect, it } from 'vitest';
import { basicEnglishCourse } from './course';
import { week8to12Words } from './week8to12';
import { basicEnglishWordList, basicEnglishCourseExceptions } from './basicEnglish850';

describe('published content quality', () => {
  it('counts only the 850 headwords, retaining shipped forms as exceptions', () => {
    expect(basicEnglishWordList).toHaveLength(850);
    for (const form of ['less', 'least', 'most', 'she', 'un']) {
      expect(basicEnglishWordList).not.toContain(form);
      expect(basicEnglishCourseExceptions.has(form)).toBe(true);
    }
  });
  it('uses pronunciation, not spelling, for late-course words', () => {
    expect(week8to12Words.find((word) => word.id === 'family')?.phonetic).toBe('/ˈfæməli/');
    expect(week8to12Words.find((word) => word.id === 'wind')?.phonetic).toBe('/wɪnd/');
    expect(week8to12Words.find((word) => word.id === 'record')?.phonetic).toBe('/ˈrekɔːd/');
    expect(week8to12Words.every((word) => /^\/.+\/$/.test(word.phonetic ?? ''))).toBe(true);
  });

  it('does not teach much/little with countable days or rubric words', () => {
    const content = JSON.stringify(basicEnglishCourse.weeks);
    expect(content).not.toMatch(/much days/);
    for (const week of basicEnglishCourse.weeks) {
      for (const day of week.days) {
        for (const criterion of day.weeklyCheckRubric?.criteria ?? []) {
          expect(criterion.scores.join(' ')).not.toMatch(/(?:much|little) [^".]*words/);
        }
      }
    }
  });
});
