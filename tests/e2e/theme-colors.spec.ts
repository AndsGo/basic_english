import { expect, test, type Locator } from '@playwright/test';

async function colors(control: Locator) {
  return control.evaluate(element => {
    const style = getComputedStyle(element);
    const luminance = (color: string) => {
      const values = color.match(/[\d.]+/g)!.slice(0, 3).map(value => Number(value) / 255)
        .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return { foreground: style.color, background: style.backgroundColor,
      contrast: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
  });
}

for (const theme of ['light', 'dark'] as const) {
  test(`${theme} controls follow the theme and keep selected text readable`, async ({ page }, testInfo) => {
    if (testInfo.project.name === 'mobile-chrome') await page.setViewportSize({ width: 320, height: 760 });
    await page.addInitScript(theme => {
      if (!localStorage.getItem('basic-english-theme')) localStorage.setItem('basic-english-theme', theme);
      localStorage.setItem('basic-english-reading-enabled', 'false');
    }, theme);
    await page.goto('/basic_english/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveCSS('color-scheme', theme);

    await page.getByRole('button', { name: 'Me', exact: true }).click();
    const themeRadio = page.getByRole('radio', { name: theme === 'dark' ? 'Dark' : 'Light', exact: true });
    await expect(themeRadio).toBeChecked();
    const nativeAccent = await themeRadio.evaluate(element => getComputedStyle(element).accentColor);
    expect(nativeAccent).not.toBe('auto');

    await page.getByRole('button', { name: 'Today', exact: true }).click();
    await page.getByRole('button', { name: 'Read listening text', exact: true }).click();
    await page.getByRole('radio', { name: 'She is a student.', exact: true }).check();
    await page.getByRole('textbox', { name: 'Your answer', exact: true }).fill('My name is Li. I am from China. I am a student.');
    await page.getByRole('checkbox', { name: 'My answer includes all three ideas.', exact: true }).check();
    await page.getByRole('radio', { name: 'Clear', exact: true }).check();
    const primary = page.getByRole('button', { name: 'Save capability check', exact: true });
    await expect(primary).toBeVisible();
    await expect(primary).toBeEnabled();
    await page.mouse.move(1, 1);
    const primaryDefault = await colors(primary);
    expect(primaryDefault.background).toBe(nativeAccent);
    expect(primaryDefault.contrast).toBeGreaterThanOrEqual(4.5);
    await primary.hover();
    expect((await colors(primary)).contrast).toBeGreaterThanOrEqual(4.5);
    await primary.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(primary).toBeFocused();
    await expect(primary).toHaveCSS('outline-style', 'solid');

    await page.getByRole('button', { name: 'Words', exact: true }).click();
    const selected = page.getByRole('button', { name: 'Stories', exact: true });
    await selected.click();
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(1, 1);
    const selectedDefault = await colors(selected);
    expect(selectedDefault.contrast).toBeGreaterThanOrEqual(4.5);
    expect(selectedDefault.background).not.toBe(primaryDefault.background);
    await selected.hover();
    expect((await colors(selected)).contrast).toBeGreaterThanOrEqual(4.5);
    await selected.focus();
    expect((await colors(selected)).contrast).toBeGreaterThanOrEqual(4.5);

    await page.getByRole('button', { name: 'Open story A book for my friend', exact: true }).click();
    await page.getByRole('button', { name: 'Read story', exact: true }).click();
    const previous = page.getByRole('button', { name: 'Previous page', exact: true });
    await expect(previous).toBeDisabled();
    expect((await colors(previous)).contrast).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${theme}-story-controls.png`), fullPage: true });

    await page.getByRole('button', { name: 'Back to stories' }).click();
    await page.getByRole('button', { name: 'Me', exact: true }).click();
    await page.getByRole('radio', { name: theme === 'dark' ? 'Light' : 'Dark', exact: true }).check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
  });
}
