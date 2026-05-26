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

test.describe('Basic English MVP e2e', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
  });

  test('completes Day 1 flow, saves output, and reloads saved state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'My Name' })).toBeVisible();
    await expect(page.getByText('Day 1 has no review')).toBeVisible();

    await continueTo(page, 'name');
    await expect(page.getByText('what a person is called')).toBeVisible();
    await expect(page.getByText(/名字/)).toBeHidden();
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read definition for name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example for name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review name' })).toBeVisible();
    await page.getByRole('button', { name: 'Know name' }).click();

    await continueTo(page, 'Patterns');
    await expect(page.getByText('My name is Li.')).toBeVisible();
    await expect(page.getByText('My name is ___.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read pattern My name is ___.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read structure My name is {name}.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read example My name is Li.' })).toBeVisible();

    await continueTo(page, 'What does "name" mean?');
    const choiceCard = page.getByRole('article').filter({
      has: page.getByRole('heading', { name: 'What does "name" mean?' }),
    });
    await choiceCard.getByRole('button', { name: /名字/ }).click();
    await expect(choiceCard.getByRole('status')).toHaveText('Correct');
    await page.getByLabel('My ___ is Li.').fill('NAME');
    await expect(page.getByRole('status').filter({ hasText: 'Correct' })).toHaveCount(2);

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Core meaning: Say your name.')).toBeVisible();
    await expect(page.getByText('My name is Li.', { exact: true })).toBeHidden();
    await page.getByRole('button', { name: 'Show reference' }).click();
    await expect(page.getByText('My name is Li.', { exact: true })).toBeVisible();

    await continueTo(page, 'My Name', 3);
    await page.getByLabel('Daily output').fill('My name is Li.\nI am from China.\nI study English.');
    await page.getByLabel("I used today's pattern.").check();
    await page.getByLabel('I used lesson words.').check();
    await page.getByLabel('OK').check();

    await continueTo(page, 'Day complete');
    await expect(page.getByText('My name is Li.\nI am from China.\nI study English.')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Day complete' })).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByText('Completed days: 1')).toBeVisible();
    await expect(page.getByText('My name is Li.\nI am from China.\nI study English.')).toBeVisible();
  });

  test('navigates course and word bank views with configurable Chinese help', async ({ page }) => {
    await page.getByRole('button', { name: 'Course' }).click();
    await expect(page.getByRole('heading', { name: 'People, Identity, and Basic Sentences' })).toBeVisible();
    await expect(page.getByText('Day 7: Weekly Check')).toBeVisible();

    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('heading', { name: 'Week 1 Words' })).toBeVisible();
    await expect(page.getByText('what a person is called')).toBeVisible();
    await expect(page.getByText(/名字/)).toBeHidden();
    await expect(page.getByText('My name is Li.')).toBeVisible();

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await expect(page.getByLabel('Enable reading aloud')).toBeChecked();
    await page.getByLabel('Enable reading aloud').uncheck();
    await page.getByLabel('Show Chinese help').check();
    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('button', { name: 'Read word name' })).toBeDisabled();
    await expect(page.getByText(/名字/)).toBeVisible();

    await page.getByRole('button', { name: 'Review' }).click();
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  });

  test('supports mobile viewport navigation and primary Today action', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile project only');

    await expect(page.getByRole('heading', { name: 'My Name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    await page.getByRole('button', { name: 'Words' }).click();
    await expect(page.getByRole('heading', { name: 'Week 1 Words' })).toBeVisible();
    await page.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByText('Day 1 has no review')).toBeVisible();
  });
});
