import { expect, test, type Page, type Route } from '@playwright/test';

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

async function continueTo(page: Page, heading: string, level?: number) {
  const button = page.getByRole('button', { name: 'Continue' });
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByRole('heading', { name: heading, level })).toBeVisible();
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

async function completeDayOneDrillsWithWrongChoice(page: Page) {
  const choiceCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'What does "name" mean?' }),
  });
  await choiceCard.getByRole('button').nth(1).click();
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
    await expect(page.getByRole('button', { name: 'Read example My name is Li.' })).toBeVisible();
    await completeDayOnePatterns(page);

    await continueTo(page, 'What does "name" mean?');
    await completeDayOneDrillsWithWrongChoice(page);

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

    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await expect(page.getByText('3 items to review')).toBeVisible();
    const exerciseReview = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'What does "name" mean?' }),
    });
    await expect(exerciseReview.getByText('exercise / day-001')).toBeVisible();
    await expect(exerciseReview.getByText(/User answer:/)).toBeVisible();
    await expect(exerciseReview.getByText(/Reference answer:/)).toBeVisible();
    await page.getByRole('button', { name: 'I know this' }).first().click();
    await expect(page.getByText('2 items to review')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'I Am' })).toBeVisible();
    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await expect(page.getByText('2 items to review')).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByText('Completed days: 1')).toBeVisible();
    await expect(page.getByText('Review items: 2')).toBeVisible();
    await expect(page.getByText('My name is Li.\nI am from China.\nI am a student.\nI study English.')).toBeVisible();
  });

  test('navigates course and word bank views with configurable Chinese help', async ({ page }) => {
    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByRole('heading', { name: 'People, Identity, and Basic Sentences' })).toBeVisible();
    await expect(page.getByText('Day 7: Weekly Check')).toBeVisible();

    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('heading', { name: 'Week 1 Words' })).toBeVisible();
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

    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
  });

  test('exposes primary navigation on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await expect(page.getByRole('heading', { name: 'My Name' })).toBeVisible();
    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByText('0 / 7 days completed')).toBeVisible();
    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('heading', { name: 'Review today' })).toBeVisible();
    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My Progress' })).toBeVisible();
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByText('Day 1 has no review')).toBeVisible();
  });
});
