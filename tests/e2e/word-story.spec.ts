import { expect, test } from '@playwright/test';
import catalog from '../../src/content/storybookCatalog.json';

test('read the give story with Chinese help and retry its meaning check', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('basic-english-show-chinese-help', 'true'));
  await page.goto('/basic_english/');
  await page.getByRole('button', { name: 'Words', exact: true }).click();
  await page.getByRole('button', { name: 'Read a story with give' }).click();
  await expect(page.getByText('我有一本书。我的朋友在这里。')).toBeVisible();
  const image = page.locator('.story-image');
  await expect(image).toBeVisible();
  expect(await image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBe(512);
  const nav = page.getByRole('navigation', { name: 'Story pages' });
  const firstTop = await nav.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  await page.screenshot({ path: test.info().outputPath('story-first.png'), fullPage: true });
  for (let index = 0; index < 3; index++) {
    await page.getByRole('button', { name: 'Next page' }).click();
    const nextTop = await nav.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    expect(Math.abs(nextTop - firstTop)).toBeLessThan(2);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Finish story' }).click();
  await page.getByRole('button', { name: 'I have the pen.', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Look again');
  await page.getByRole('button', { name: 'My friend has the pen.', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Correct.');
  await page.getByRole('textbox', { name: 'Your sentence' }).fill('I give a cup to my friend.');
  await page.getByRole('button', { name: 'Save my sentence' }).click();
  await expect(page.getByText('Saved on this device.')).toBeVisible();
  await page.getByRole('button', { name: 'Review this word' }).click();
  await expect(page.getByText('Added to word review.')).toBeVisible();
  await page.screenshot({ path: test.info().outputPath('story-check.png'), fullPage: true });
  await page.reload();
  await page.getByRole('button', { name: 'Words', exact: true }).click();
  await page.getByRole('button', { name: 'Stories', exact: true }).click();
  await page.getByRole('button', { name: 'Open story A book for my friend', exact: true }).click();
  await page.getByRole('button', { name: 'Read story', exact: true }).click();
  await expect(page.getByText(/Week 3.*Read/)).toBeVisible();
});

test('fits a narrow screen with English help and disabled speech', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.addInitScript(() => localStorage.setItem('basic-english-reading-enabled', 'false'));
  await page.goto('/basic_english/');
  await page.getByRole('button', { name: 'Words', exact: true }).click();
  await page.getByRole('button', { name: 'Stories', exact: true }).click();
  await page.getByRole('button', { name: 'Open story A book for my friend', exact: true }).click();
  await page.getByRole('button', { name: 'Read story', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Read story page' })).toBeDisabled();
  await expect(page.getByText('我有一本书。我的朋友在这里。')).toHaveCount(0);
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Next page' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('story-narrow.png'), fullPage: true });
});

test('reads each new story with its own images, highlight and meaning check', async ({ page }, testInfo) => {
  test.setTimeout(Math.max(30_000, catalog.filter(story => story.ready).length * 5_000));
  if (testInfo.project.name === 'mobile-chrome') await page.setViewportSize({ width: 320, height: 700 });
  await page.addInitScript(() => localStorage.setItem('basic-english-show-chinese-help', 'true'));
  await page.goto('/basic_english/');
  await page.getByRole('button', { name: 'Words', exact: true }).click();
  await page.getByRole('button', { name: 'Stories', exact: true }).click();
  await page.locator('.story-cover').first().click();
  await page.getByRole('button', { name: 'Read story', exact: true }).click();
  const stories = catalog.filter(story => story.ready);
  for (const story of stories) {
    await page.getByRole('combobox', { name: 'Choose a story' }).selectOption(story.id);
    await expect(page.getByText('1 / 4')).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Story pages' });
    const firstTop = await nav.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
    for (let index = 0; index < 4; index++) {
      const image = page.locator('.story-image');
      await expect.poll(() => image.evaluate((element) => [(element as HTMLImageElement).naturalWidth, (element as HTMLImageElement).naturalHeight])).toEqual([512, 512]);
      const nextTop = await nav.evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
      expect(Math.abs(nextTop - firstTop)).toBeLessThan(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (index === 2) {
        if (story.pages[index].text.toLowerCase().includes(story.wordId)) await expect(page.locator('.story-sentence mark')).toHaveText(story.wordId, { ignoreCase: true });
        await page.screenshot({ path: testInfo.outputPath(`${story.wordId}-story.png`), fullPage: true });
      }
      if (index === 1 && ['so', 'news'].includes(story.wordId)) {
        await page.screenshot({ path: testInfo.outputPath(`${story.wordId}-record.png`), fullPage: true });
      }
      if (index < 3) await page.getByRole('button', { name: 'Next page' }).click();
    }
    await page.getByRole('button', { name: 'Finish story' }).click();
    await page.getByRole('button', { name: story.check.options[story.check.correctIndex], exact: true }).click();
    await expect(page.getByRole('status')).toContainText(story.check.success);
    await expect(page.getByRole('textbox', { name: 'Your sentence' })).toBeVisible();
  }
});
