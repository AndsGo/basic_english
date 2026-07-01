import { describe, expect, it } from 'vitest';
import { basicEnglishAllowedWords } from './basicEnglish850';
import { basicEnglishCourse } from './course';
import {
  collectCourseHealthMetrics,
  defaultCourseHealthPolicy,
  validateCourseHealth,
} from './courseHealth';
import { pictureDescribeTasksByDayId } from './pictureDescribeTasks';
import { sceneGoalsByDayId } from './sceneGoals';
import { sceneRemixTasksByDayId } from './sceneRemixTasks';
import { wordFlashcardImages } from './wordFlashcardImages';

function collectCurrentMetrics() {
  return collectCourseHealthMetrics({
    course: basicEnglishCourse,
    basicEnglishAllowedWords,
    pictureDescribeTasksByDayId,
    sceneGoalsByDayId,
    sceneRemixTasksByDayId,
    wordFlashcardImages,
  });
}

describe('courseHealth', () => {
  it('summarizes current course scope and weekly load', () => {
    const metrics = collectCurrentMetrics();

    expect(metrics.courseWeeks).toBe(7);
    expect(metrics.courseDays).toBe(49);
    expect(metrics.courseWords).toBe(177);
    expect(metrics.basicEnglishCourseWords).toBe(126);
    expect(metrics.basicEnglishWordCount).toBe(855);
    expect(metrics.basicEnglishCoveragePercent).toBe(14.7);
    expect(metrics.pictureDescribe.covered).toBe(49);
    expect(metrics.sceneGoals.covered).toBe(49);
    expect(metrics.sceneRemix.covered).toBe(49);
    expect(metrics.byWeek.map((week) => week.introducedWords)).toEqual([20, 33, 48, 39, 17, 10, 10]);
    expect(metrics.byWeek[1]).toMatchObject({
      averageActiveDayWordRefs: 11.7,
      averageSupportDayWordRefs: 0.1,
    });
  });

  it('keeps blocking content defects separate from curriculum pacing warnings', () => {
    const result = validateCourseHealth(collectCurrentMetrics());

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        `Week 3 introduces 48 words; recommended max is ${defaultCourseHealthPolicy.recommendedMaxNewWordsPerWeek}.`,
      ]),
    );
    expect(result.warnings).not.toEqual(expect.arrayContaining([expect.stringContaining('Scene goal coverage')]));
    expect(result.warnings).not.toEqual(expect.arrayContaining([expect.stringContaining('Scene remix coverage')]));
  });

  it('reports missing required word flashcard images as errors', () => {
    const imagesWithoutName = { ...wordFlashcardImages };
    delete imagesWithoutName.name;

    const result = validateCourseHealth(
      collectCourseHealthMetrics({
        course: basicEnglishCourse,
        basicEnglishAllowedWords,
        pictureDescribeTasksByDayId,
        sceneGoalsByDayId,
        sceneRemixTasksByDayId,
        wordFlashcardImages: imagesWithoutName,
      }),
    );

    expect(result.errors).toContain('Missing flashcard images for 1 words: name');
  });
});
