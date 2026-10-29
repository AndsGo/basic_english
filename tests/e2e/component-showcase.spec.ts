import { expect, test, type Locator } from '@playwright/test';

async function contrast(control: Locator, foreground = 'color') {
  return control.evaluate((element, property) => {
    const style = getComputedStyle(element);
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => value / 255)
        .map(value => value <= 0.04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
      return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const first = luminance(style.getPropertyValue(property));
    const second = luminance(style.backgroundColor);
    return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
  }, foreground);
}

test('component workshop supports independent keyboard controls without changing learning settings', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('basic-english-theme', 'dark');
    localStorage.setItem('basic-english-reading-enabled', 'false');
    localStorage.setItem('basic-english-show-chinese-help', 'false');
    localStorage.setItem('basic-english-story-give-a-book-progress', JSON.stringify({ read: true, sentence: 'A saved sentence.' }));
  });
  await page.goto('/basic_english/?view=components');
  const saved = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A calmer way to choose.');
  const switchControl = page.getByRole('switch', { name: 'Enable audio examples', exact: true });
  await switchControl.focus();
  await page.keyboard.press('Space');
  await expect(switchControl).not.toBeChecked();
  await expect(switchControl.locator('..').locator('..')).toHaveCSS('outline-style', 'solid');

  const slow = page.getByRole('group', { name: 'Voice speed', exact: true }).getByRole('radio', { name: 'Slow', exact: true });
  await page.getByRole('group', { name: 'Voice speed', exact: true }).getByRole('radio', { name: 'Normal', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(slow).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Still building', exact: true })).toBeChecked();
  await expect(page.getByText(/^Answer activations:/)).toContainText('Answer activations: 0');
  await page.getByRole('group', { name: 'Demo answer actions' }).getByRole('button').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText(/^Answer activations:/)).toContainText('Answer activations: 0');
  await page.keyboard.press('Enter');
  await expect(page.getByText(/^Answer activations:/)).toContainText('Answer activations: 1');

  const save = page.getByRole('button', { name: 'Save sentence', exact: true });
  const before = await save.boundingBox();
  await page.getByRole('switch', { name: 'Simulate saving', exact: true }).check();
  const pending = page.getByRole('button', { name: 'Saving…', exact: true });
  await expect(pending).toBeDisabled();
  expect((await pending.boundingBox())!.width).toBe(before!.width);
  await page.getByRole('switch', { name: 'Simulate saving', exact: true }).uncheck();

  await page.getByRole('textbox', { name: 'A field that needs attention', exact: true }).fill('give');
  await expect(page.getByText('Please write at least one word.')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Course stage', exact: true }).selectOption('4');
  await expect(page.getByText(/Demo search:/)).toContainText('Stage 4');
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(saved);
  await page.getByRole('link', { name: 'Back to the app' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  testInfo.annotations.push({ type: 'scope', description: 'Showcase-only interactions; no course migration.' });
});

test('component states fit both themes, bilingual text, high contrast and narrow layouts', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/basic_english/?view=components');
  const widths = testInfo.project.name === 'chromium' ? [1440] : [390, 320];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['Light', 'Dark']) {
      await page.getByRole('group', { name: 'Preview theme', exact: true }).getByRole('radio', { name: theme, exact: true }).check();
      await expect.poll(() => contrast(page.getByRole('button', { name: 'Save example', exact: true }))).toBeGreaterThanOrEqual(4.5);
      await expect.poll(() => contrast(page.getByRole('button', { name: 'Continue', exact: true }))).toBeGreaterThanOrEqual(4.5);
      expect(await contrast(page.getByRole('textbox', { name: 'Reference sentence', exact: true }))).toBeGreaterThanOrEqual(4.5);
      const uncheckedMarker = page.getByRole('checkbox', { name: 'I used the word in my own sentence.', exact: true }).locator('..').locator('.ui-choice-mark');
      expect(await contrast(uncheckedMarker, 'border-top-color')).toBeGreaterThanOrEqual(3);
      for (const chinese of [false, true]) {
        await page.getByRole('switch', { name: 'Show Chinese examples', exact: true }).setChecked(chinese);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const checkedRow = page.getByRole('checkbox', { name: 'A checked, unavailable example', exact: true });
        await expect(checkedRow).toBeChecked();
        await expect(checkedRow).toBeDisabled();
        if (chinese) await expect(page.getByText('我在自己的句子中使用了这个词。')).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`workshop-${width}-${theme}-${chinese}.png`), fullPage: true });
      }
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  }
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const native = page.getByRole('checkbox', { name: 'I used the word in my own sentence.', exact: true });
  await expect(native).toHaveCSS('opacity', '1');
  await native.focus();
  await page.keyboard.press('Space');
  await expect(native).toBeChecked();
  await expect(native.locator('..').locator('.ui-choice-mark')).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('workshop-forced-colors.png'), fullPage: true });
  expect(errors).toEqual([]);
});
