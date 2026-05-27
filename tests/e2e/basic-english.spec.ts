import { expect, test, type Page, type Route } from '@playwright/test';
import { basicEnglishCourse } from '../../src/content/course';
import type { Day, Exercise, OutputTask } from '../../src/domain/types';

async function clearAppStorage(page: Page) {
  const blankPage = (route: Route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><body></body></html>',
    });
  await page.route('**/', blankPage);
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    const databases = await indexedDB.databases();
    await Promise.all(
      databases
        .filter((database) => database.name?.startsWith('basic-english'))
        .map(
          (database) =>
            new Promise<void>((resolve, reject) => {
              const request = indexedDB.deleteDatabase(database.name!);
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
              request.onblocked = () =>
                reject(new Error(`Could not delete blocked IndexedDB database "${database.name}"`));
            }),
        ),
    );
  });
  await page.unroute('**/', blankPage);
  await page.goto('/');
}

async function seedCompletedDays(page: Page, dayIds: string[]) {
  await page.evaluate(
    async ({ contentVersion, dayIdsToSeed }) => {
      const openRequest = indexedDB.open('basic-english-progress', 3);

      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        openRequest.onerror = () => reject(openRequest.error);
        openRequest.onupgradeneeded = () => {
          const db = openRequest.result;
          if (!db.objectStoreNames.contains('dayProgress')) {
            db.createObjectStore('dayProgress', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('stepProgress')) {
            db.createObjectStore('stepProgress', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('stepCompletions')) {
            const store = db.createObjectStore('stepCompletions', { keyPath: 'id' });
            store.createIndex('byDayId', 'dayId');
          }
          if (!db.objectStoreNames.contains('exerciseAttempts')) {
            const store = db.createObjectStore('exerciseAttempts', { keyPath: 'id' });
            store.createIndex('byDayId', 'dayId');
          }
          if (!db.objectStoreNames.contains('userOutputs')) {
            db.createObjectStore('userOutputs', { keyPath: 'dayId' });
          }
          if (!db.objectStoreNames.contains('wordProgress')) {
            db.createObjectStore('wordProgress', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('reviewItems')) {
            const store = db.createObjectStore('reviewItems', { keyPath: 'id' });
            store.createIndex('byStatus', 'status');
            store.createIndex('bySourceDayId', 'sourceDayId');
          }
          if (!db.objectStoreNames.contains('studyActivities')) {
            db.createObjectStore('studyActivities', { keyPath: 'id' });
          }
        };
        openRequest.onsuccess = () => resolve(openRequest.result);
      });

      const transaction = db.transaction(['dayProgress', 'studyActivities'], 'readwrite');
      const now = new Date().toISOString();
      for (const dayId of dayIdsToSeed) {
        transaction.objectStore('dayProgress').put({
          id: dayId,
          dayId,
          status: 'completed',
          currentStep: 'done',
          completedStepIds: ['review', 'words', 'patterns', 'drills', 'translate', 'output'],
          startedAt: now,
          completedAt: now,
          updatedAt: now,
          contentVersion,
        });
      }
      transaction.objectStore('studyActivities').put({
        id: `activity-${now}`,
        localDate: now.slice(0, 10),
        completedDayIds: dayIdsToSeed,
      });

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    },
    { contentVersion: basicEnglishCourse.contentVersion, dayIdsToSeed: dayIds },
  );
}

function getCourseDay(dayId: string): Day {
  const day = basicEnglishCourse.weeks.flatMap((week) => week.days).find((courseDay) => courseDay.id === dayId);
  if (!day) throw new Error(`Could not find course day "${dayId}".`);
  return day;
}

function getOutputText(task: OutputTask) {
  const replacements = ['room', 'clean', 'bed', 'chair', 'table', 'book'];
  let replacementIndex = 0;
  return task.template
    .slice(0, task.requiredSentenceCount)
    .map((line) =>
      line.replace(/___/g, () => {
        const replacement = replacements[replacementIndex] ?? 'thing';
        replacementIndex += 1;
        return replacement;
      }),
    )
    .join('\n');
}

async function completeWords(page: Page, day: Day) {
  for (const wordId of day.wordIds) {
    const word = basicEnglishCourse.words.find((item) => item.id === wordId);
    if (!word) throw new Error(`Could not find word "${wordId}".`);
    await page.getByRole('button', { name: `Know ${word.text}` }).click();
  }
}

async function completePatterns(page: Page) {
  const practiceButtons = page.getByRole('button', { name: 'Practice this' });
  const count = await practiceButtons.count();
  for (let index = 0; index < count; index += 1) {
    await practiceButtons.nth(index).click();
  }
}

async function completeDrill(page: Page, exercise: Exercise, replacementIndex: number) {
  if (exercise.type === 'choice') {
    const card = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: exercise.prompt }),
    });
    await card.getByRole('button', { name: exercise.correctOption, exact: true }).click();
    return replacementIndex;
  }

  if (exercise.type === 'fill_blank') {
    await page.getByLabel(exercise.prompt).fill(exercise.acceptedAnswers[0]);
    return replacementIndex;
  }

  if (exercise.type === 'sentence_order') {
    const card = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'Put the words in order' }),
    });
    for (const token of exercise.correctOrder) {
      await card.getByRole('button', { name: token, exact: true }).click();
    }
    return replacementIndex;
  }

  if (exercise.type === 'replacement') {
    await page.getByLabel('Replacement answer').nth(replacementIndex).fill(exercise.referenceAnswer);
    return replacementIndex + 1;
  }

  return replacementIndex;
}

async function completeDrills(page: Page, day: Day) {
  let replacementIndex = 0;
  for (const exercise of day.exercises.filter((item) => item.type !== 'translation')) {
    replacementIndex = await completeDrill(page, exercise, replacementIndex);
  }
}

async function completeTranslation(page: Page, day: Day) {
  for (const exercise of day.exercises.filter((item) => item.type === 'translation')) {
    await page.getByLabel(`Translation answer for ${exercise.id}`).fill(exercise.referenceAnswers[0]);
  }
  const referenceButtons = page.getByRole('button', { name: 'Show reference' });
  const count = await referenceButtons.count();
  for (let index = 0; index < count; index += 1) {
    await referenceButtons.nth(index).click();
  }
  await page.getByLabel('Close enough').check();
}

async function completeOutput(page: Page, day: Day) {
  await page.getByLabel('Daily output').fill(getOutputText(day.outputTask));
  await page.getByLabel("I used today's pattern.").check();
  await page.getByLabel('I used lesson words.').check();
  await page.getByLabel('Each sentence has a subject.').check();
  await page.getByLabel('My meaning is clear.').check();
  await page.getByLabel('OK').check();
}

async function completeCurrentDay(page: Page, dayId: string) {
  const day = getCourseDay(dayId);

  await continueTo(page, basicEnglishCourse.words.find((word) => word.id === day.wordIds[0])?.text ?? 'Words');
  await completeWords(page, day);

  await continueTo(page, 'Patterns');
  await completePatterns(page);

  const firstDrill = day.exercises.find((exercise) => exercise.type !== 'translation');
  if (!firstDrill) throw new Error(`Day "${dayId}" does not include drills.`);
  await continueTo(page, firstDrill.type === 'choice' || firstDrill.type === 'fill_blank' ? firstDrill.prompt : 'Put the words in order');
  await completeDrills(page, day);

  await page.getByRole('button', { name: 'Continue' }).click();
  await completeTranslation(page, day);

  await continueTo(page, day.outputTask.topic, 3);
  await completeOutput(page, day);

  await page.getByRole('button', { name: 'Continue' }).click();
}

async function continueTo(page: Page, heading: string, level?: number) {
  const button = page.getByRole('button', { name: 'Continue' });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByRole('heading', { name: heading, level })).toBeVisible();
}

async function goToReview(page: Page) {
  await page.getByRole('button', { name: /^Review(?:\s+\d+)?$/ }).click();
}

async function markDayOneWords(page: Page) {
  await page.getByRole('button', { name: 'Review name' }).click();
  await page.getByRole('button', { name: 'Know my' }).click();
  await page.getByRole('button', { name: 'Know I' }).click();
  await page.getByRole('button', { name: 'Know am' }).click();
  await page.getByRole('button', { name: 'Know from' }).click();
  await page.getByRole('button', { name: 'Know China' }).click();
}

async function completeDayOnePatterns(page: Page) {
  const practiceButtons = page.getByRole('button', { name: 'Practice this' });
  const count = await practiceButtons.count();
  for (let index = 0; index < count; index += 1) {
    await practiceButtons.nth(index).click();
  }
}

function getDayOneChoiceReviewValues() {
  const dayOne = basicEnglishCourse.weeks[0]?.days.find((day) => day.id === 'day-001');
  const exercise = dayOne?.exercises.find((item) => item.id === 'day-001-choice-001');

  if (!exercise || exercise.type !== 'choice') {
    throw new Error('Expected day-001-choice-001 to be a choice exercise.');
  }

  const wrongChoice = exercise.options.find((option) => option !== exercise.correctOption);
  if (!wrongChoice) {
    throw new Error('Expected day-001-choice-001 to include a wrong option.');
  }

  return { correctChoice: exercise.correctOption, wrongChoice };
}

async function completeDayOneDrillsWithWrongChoice(page: Page) {
  const choiceCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'What does "name" mean?' }),
  });
  const { correctChoice, wrongChoice } = getDayOneChoiceReviewValues();
  await choiceCard.getByRole('button', { name: wrongChoice, exact: true }).click();
  await expect(choiceCard.getByRole('status')).toHaveText('Try again');

  await page.getByLabel('My ___ is Li.').fill('name');
  await expect(page.getByRole('status').filter({ hasText: 'Correct' })).toHaveCount(1);

  const orderCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Put the words in order' }),
  });
  await orderCard.getByRole('button', { name: 'I', exact: true }).click();
  await orderCard.getByRole('button', { name: 'am', exact: true }).click();
  await orderCard.getByRole('button', { name: 'from', exact: true }).click();
  await orderCard.getByRole('button', { name: 'China', exact: true }).click();
  await expect(orderCard.getByRole('status')).toHaveText('Correct');

  await page.getByLabel('Replacement answer').fill('My name is Anna.');
  await expect(page.getByRole('status').filter({ hasText: 'Answer saved' })).toBeVisible();

  return { correctChoice, wrongChoice };
}

async function completeDayOneTranslationWithReview(page: Page) {
  await expect(page.getByText('Core meaning: Say your name.')).toBeVisible();
  await expect(page.getByText('My name is Li.', { exact: true })).toBeHidden();
  await page.getByLabel('Translation answer for day-001-translation-001').fill('My name is Li.');
  await page.getByRole('button', { name: 'Show reference' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'My name is Li.' })).toBeVisible();
  await page.getByLabel('Need review').check();
}

async function completeDayOneOutput(page: Page) {
  await page.getByLabel('Daily output').fill('My name is Li.\nI am from China.\nI am a student.\nI study English.');
  await page.getByLabel("I used today's pattern.").check();
  await page.getByLabel('I used lesson words.').check();
  await page.getByLabel('Each sentence has a subject.').check();
  await page.getByLabel('My meaning is clear.').check();
  await page.getByLabel('OK').check();
}

test.describe('Basic English MVP e2e', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('completes the V1.1 Day 1 learning loop, creates review, unlocks Day 2, and persists progress', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Name' })).toBeVisible();
    await expect(page.getByText('Week 1 / Day 1')).toBeVisible();
    await expect(page.getByText('Day 1 has no review')).toBeVisible();

    await continueTo(page, 'name');
    await expect(page.getByText('what a person is called')).toBeVisible();
    await expect(page.getByText(/Chinese:/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read definition for name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example for name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review name' })).toBeVisible();
    await markDayOneWords(page);

    await continueTo(page, 'Patterns');
    await expect(page.getByText('My name is Li.')).toBeVisible();
    await expect(page.getByText('My name is ___.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example for My name is ___.: My name is Li.' })).toBeVisible();
    await completeDayOnePatterns(page);

    await continueTo(page, 'What does "name" mean?');
    const drillReviewValues = await completeDayOneDrillsWithWrongChoice(page);

    await page.getByRole('button', { name: 'Continue' }).click();
    await completeDayOneTranslationWithReview(page);

    await continueTo(page, 'My Name', 3);
    await completeDayOneOutput(page);

    await continueTo(page, 'Day 1 complete');
    await expect(page.getByText('Review tomorrow: 3')).toBeVisible();
    await expect(page.getByText('My name is Li.\nI am from China.\nI am a student.\nI study English.')).toBeVisible();
    await page.getByRole('button', { name: 'Start Day 2' }).click();
    await expect(page.getByRole('heading', { name: 'I Am' })).toBeVisible();

    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByText('1 / 7 days completed')).toBeVisible();
    await expect(page.getByText('Review: 3 items')).toBeVisible();

    await goToReview(page);
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await expect(page.getByText('3 items to review')).toBeVisible();
    const exerciseReview = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'What does "name" mean?' }),
    });
    await expect(exerciseReview.getByText('exercise / day-001')).toBeVisible();
    await expect(exerciseReview.getByText(`User answer: ${drillReviewValues.wrongChoice}`)).toBeVisible();
    await expect(exerciseReview.getByText(`Reference answer: ${drillReviewValues.correctChoice}`)).toBeVisible();

    const translationReview = page.getByRole('article').filter({
      hasText: 'translation / day-001',
    });
    await expect(translationReview.getByText('User answer: My name is Li.')).toBeVisible();
    await expect(translationReview.getByText('Reference answer: My name is Li.')).toBeVisible();
    await page.getByRole('button', { name: 'I know this' }).first().click();
    await expect(page.getByText('2 items to review')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'I Am' })).toBeVisible();
    await goToReview(page);
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await expect(page.getByText('2 items to review')).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByText('Completed days: 1')).toBeVisible();
    await expect(page.getByText('Review items: 2')).toBeVisible();
    await expect(page.getByText('My name is Li.\nI am from China.\nI am a student.\nI study English.')).toBeVisible();
  });

  test('navigates course and word bank views with configurable Chinese help', async ({ page }) => {
    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByRole('heading', { name: 'Week 1: People, Identity, and Basic Sentences' })).toBeVisible();
    await expect(page.getByText('Day 7: Weekly Check')).toBeVisible();

    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('heading', { name: 'Course Words' })).toBeVisible();
    await expect(page.getByText('what a person is called')).toBeVisible();
    await expect(page.getByText(/Chinese:/)).toHaveCount(0);
    await expect(page.getByText('My name is Li.')).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByLabel('Enable reading aloud')).toBeChecked();
    await page.getByLabel('Enable reading aloud').uncheck();
    await page.getByLabel('Show Chinese help').check();
    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeDisabled();
    await expect(page.getByText(/Chinese:/).first()).toBeVisible();

    await goToReview(page);
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
  });

  test('unlocks Week 2 Day 8 after Week 1 and completes the My Room flow', async ({ page }) => {
    const week1DayIds = basicEnglishCourse.weeks[0].days.map((day) => day.id);

    await seedCompletedDays(page, week1DayIds);
    await page.reload();

    await expect(page.getByRole('heading', { name: 'My Room' })).toBeVisible();
    await expect(page.getByText('Week 2 / Day 8')).toBeVisible();

    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByRole('heading', { name: 'Week 2: Home & Things' })).toBeVisible();
    await expect(page.getByText('Day 8: My Room')).toBeVisible();

    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await completeCurrentDay(page, 'day-008');

    await expect(page.getByRole('heading', { name: 'Day 8 complete' })).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByText('I can describe my room.')).toBeVisible();
  });

  test('exposes primary navigation on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page.getByRole('heading', { name: 'My Name' })).toBeVisible();
    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByText('0 / 7 days completed').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Week 2: Home & Things' })).toBeVisible();
    const lockedDay8Card = page.getByRole('article').filter({ hasText: 'Day 8: My Room' });
    await expect(lockedDay8Card.getByText('Locked')).toBeVisible();
    await expect(lockedDay8Card.getByText('Complete Week 1 to unlock Home & Things.')).toBeVisible();
    await goToReview(page);
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My Progress' })).toBeVisible();
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByText('Day 1 has no review')).toBeVisible();
  });
});
