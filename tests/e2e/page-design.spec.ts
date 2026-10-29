import { expect, test } from '@playwright/test';
import catalog from '../../src/content/storybookCatalog.json';

test('page designs fit themes and narrow screens, with a cover catalog and resumable reading', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('basic-english-reading-enabled', 'false'));
  await page.goto('/basic_english/');
  for (const width of testInfo.project.name === 'chromium' ? [1440] : [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      for (const chinese of [false, true]) {
        await page.getByRole('button', { name: 'Me', exact: true }).click();
        await page.getByRole('radio', { name: theme === 'light' ? 'Light' : 'Dark', exact: true }).check();
        await page.getByRole('switch', { name: 'Show Chinese help' }).setChecked(chinese);
        for (const tab of ['Today', 'Course', 'Review', 'Words', 'Me']) {
          await page.getByRole('button', { name: tab, exact: true }).click();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          if (!chinese) await page.screenshot({ path: testInfo.outputPath(`${tab}-${width}-${theme}.png`) });
        }
        await page.getByRole('button', { name: 'Words', exact: true }).click();
        await page.getByRole('button', { name: 'Stories', exact: true }).click();
        await expect(page.locator('.story-cover')).toHaveCount(53);
        expect(await page.locator('.story-cover-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(width === 320 ? 1 : width === 390 ? 2 : 4);
        await expect.poll(() => page.locator('.story-cover img').first().evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(512);
        if (!chinese) await page.screenshot({ path: testInfo.outputPath(`stories-${width}-${theme}.png`) });
        await page.getByRole('combobox', { name: 'Course stage' }).selectOption('4');
        await expect(page.locator('.story-cover')).toHaveCount(catalog.filter(story => story.ready && story.courseWeek >= 40).length);
        await page.getByRole('combobox', { name: 'Reading status' }).selectOption('read');
        await expect(page.getByText('No stories match these filters.')).toBeVisible();
        await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
        await expect(page.locator('.story-cover')).toHaveCount(53);
        await page.getByRole('searchbox', { name: 'Search stories' }).fill('give');
        await expect(page.locator('.story-cover')).toHaveCount(1);
        const card = page.locator('.story-cover');
        await card.click();
        await expect(page.getByRole('region', { name: 'Before reading' })).toBeVisible();
        if (!chinese) await page.screenshot({ path: testInfo.outputPath(`intro-${width}-${theme}.png`) });
        await page.getByRole('button', { name: /^(Read story|Continue reading)$/ }).click();
        await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
        if (await page.getByRole('button', { name: 'Read again', exact: true }).count()) await page.getByRole('button', { name: 'Read again', exact: true }).click();
        while (!(await page.getByRole('button', { name: 'Previous page', exact: true }).isDisabled())) await page.getByRole('button', { name: 'Previous page', exact: true }).click();
        const navigation = page.getByRole('navigation', { name: 'Story pages' });
        const firstTop = await navigation.evaluate(element => element.getBoundingClientRect().top);
        for (let index = 0; index < 3; index++) {
          await page.getByRole('button', { name: 'Next page', exact: true }).click();
          expect(Math.abs(await navigation.evaluate(element => element.getBoundingClientRect().top) - firstTop)).toBeLessThan(2);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: testInfo.outputPath(`reader-${width}-${theme}-${chinese}.png`), fullPage: true });
        await page.getByRole('button', { name: 'Back to stories' }).click();
        await expect(card).toBeFocused();
        await expect(page.getByRole('searchbox', { name: 'Search stories' })).toHaveValue('give');
        await card.click();
        await page.getByRole('button', { name: 'Continue reading', exact: true }).click();
        await expect(page.getByText('4 / 4', { exact: true })).toBeVisible();
        const recordStory = catalog.find(story => story.wordId === 'so')!;
        await page.getByRole('combobox', { name: 'Choose a story' }).selectOption(recordStory.id);
        while (!(await page.getByRole('button', { name: 'Previous page', exact: true }).isDisabled())) await page.getByRole('button', { name: 'Previous page', exact: true }).click();
        await page.getByRole('button', { name: 'Next page', exact: true }).click();
        await expect(page.locator('.story-record')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.getByRole('region', { name: 'Story content' }).evaluate(element => { element.scrollTop = element.scrollHeight; });
        await page.screenshot({ path: testInfo.outputPath(`record-${width}-${theme}-${chinese}.png`) });
        await page.getByRole('button', { name: 'Back to stories' }).click();
      }
    }
  }
  expect(errors).toEqual([]);
});
