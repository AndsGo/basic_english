import { expect, test } from '@playwright/test';

test('browse every core word and reset the library search', async ({ page }) => {
  await page.goto('/basic_english/');
  await page.getByRole('button', { name: 'Words', exact: true }).click();
  await page.getByRole('button', { name: '850 Library' }).click();
  const entries = page.locator('.basic-library-item');
  await expect(entries).toHaveCount(120);
  await expect(page.getByText('191 / 850')).toBeVisible();
  for (let batch = 0; batch < 7; batch += 1) {
    await page.getByRole('button', { name: 'Show more' }).click();
  }
  await expect(entries).toHaveCount(850);
  await expect(page.getByRole('button', { name: 'Show more' })).toHaveCount(0);
  const search = page.getByRole('searchbox');
  await search.fill('young');
  await expect(entries).toHaveCount(1);
  await search.fill('');
  await expect(entries).toHaveCount(120);
  await expect(page.locator('body')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('word-library.png') });
});
