// Product documentation capture: a fresh, isolated browser session; no test fixtures.
// Start Vite first: npm run dev -- --port 5195 --strictPort
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const destination = path.resolve(__dirname, '../docs/product/screenshots');
const baseURL = process.env.PRODUCT_CAPTURE_URL || 'http://localhost:5195/basic_english/';

(async () => {
  fs.mkdirSync(destination, { recursive: true });
  const browser = await chromium.launch({ args: ['--mute-audio'] });
  try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const captures = [];
  const tab = name => ['Today', 'Course', 'Review', 'Words', 'Me'].includes(name)
    ? page.locator('.nav-item').filter({ has: page.getByText(name, { exact: true }) }).click()
    : page.getByRole('button', { name, exact: true }).click();
  const capture = async (name, description, fullPage = false) => {
    const viewport = page.viewportSize();
    // Expand the actual viewport for a long-page capture so fixed navigation
    // stays at the bottom instead of appearing across the middle of the image.
    if (fullPage) {
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, height) });
    }
    const playing = page.locator('.speech-button[aria-pressed="true"]');
    if (await playing.count()) await playing.first().click();
    await page.mouse.move(0, 0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].filter(image => image.getBoundingClientRect().top < innerHeight).map(image => image.decode().catch(() => {})));
    });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow in ${name}`);
    await page.screenshot({ path: path.join(destination, `${name}.png`), animations: 'disabled' });
    captures.push({ file: `${name}.png`, description, viewport, captureViewport: page.viewportSize(), fullPage });
    if (fullPage) await page.setViewportSize(viewport);
  };

  await page.goto(baseURL);
  await tab('Me');
  await page.getByRole('radio', { name: 'Light', exact: true }).check();
  await page.getByRole('switch', { name: 'Show Chinese help', exact: true }).uncheck();
  // Keep speech enabled, but mute the isolated browser page during capture.
  await page.getByRole('switch', { name: 'Enable reading aloud', exact: true }).check();
  await tab('Today');
  await page.getByRole('heading', { name: 'Introduce yourself', exact: true }).waitFor();
  await capture('01-today-desktop', 'Day 1 before starting; full daily task and requirements.', true);
  await tab('Course');
  await capture('02-course-desktop', 'Week 1 expanded, Day 1 current; no invented completed days.');
  await tab('Words');
  await tab('Flashcards');
  const giveIndex = await page.evaluate(async () => {
    const { basicEnglishCourse } = await import('/basic_english/src/content/course.ts');
    return basicEnglishCourse.words.findIndex(word => word.id === 'give');
  });
  if (giveIndex < 0) throw new Error('Missing give word');
  for (let index = 0; index < giveIndex; index++) await tab('Next');
  await page.getByRole('heading', { name: 'give', exact: true }).waitFor();
  await capture('03-give-flashcard-front', 'Give illustration, target word and IPA, before marking mastery.');
  await tab('Flip');
  await capture('04-give-flashcard-back', 'Give definition, example and audio/review controls.');
  await tab('Stories');
  await capture('05-story-library-desktop', 'Fresh catalog of 53 books before reading the give story.');
  await page.getByRole('button', { name: 'Open story A book for my friend', exact: true }).click();
  await capture('06-story-intro-desktop', 'The give story introduction before first reading.');
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await capture('07-story-intro-mobile', 'Same give introduction; light theme, English-first.', true);
  await tab('Read story');
  await tab('Next page');
  await tab('Next page');
  await page.getByText('3 / 4', { exact: true }).waitFor();
  await capture('08-give-reader-mobile', 'Page 3 of the give story; illustration, sentence, playback and controls.');
  await page.setViewportSize({ width: 1440, height: 1200 });
  await capture('09-give-reader-desktop', 'The identical page 3 in the desktop reader.');
  await tab('Next page');
  await tab('Finish story');
  await page.getByRole('button', { name: 'My friend has the pen.', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your sentence' }).fill('I give a book to my friend.');
  await tab('Save my sentence');
  await page.getByText('Saved on this device.', { exact: true }).waitFor();
  await tab('Review this word');
  await page.getByText('Added to word review.', { exact: true }).waitFor();
  if (await page.locator('.story-spread').evaluate(element => element.scrollHeight > element.clientHeight + 1)) throw new Error('Desktop practice does not fit the capture viewport.');
  await capture('10-give-practice-desktop', 'Correct meaning answer, saved personal sentence, and word added to review.');
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole('region', { name: 'Story content' }).evaluate(element => { element.scrollTop = element.scrollHeight; });
  await capture('11-give-sentence-mobile', 'Practice scrolled to show the saved sentence and review confirmation.');
  await tab('Back to stories');
  await page.setViewportSize({ width: 1440, height: 1200 });
  await tab('Review');
  await page.getByRole('heading', { name: 'give', exact: true }).waitFor();
  await capture('12-review-desktop', 'The give word is now in Review, created by the preceding story action.', true);
  await tab('Me');
  await page.getByText('I give a book to my friend.', { exact: true }).waitFor();
  await page.evaluate(() => scrollTo(0, 0));
  await capture('13-my-sentence-desktop', 'Me shows the exact sentence saved in the story; course-day progress remains independent.');
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await tab('Words');
  await tab('Stories');
  await page.getByRole('button', { name: 'Open story A book for my friend', exact: true }).click();
  await tab('Read story');
  await tab('Read again');
  await tab('Next page');
  await tab('Next page');
  await capture('14-give-reader-desktop-dark', 'Same give page 3, now dark theme; separate theme comparison.');
  await page.setViewportSize({ width: 390, height: 1000 });
  await capture('15-give-reader-mobile-dark', 'Same give page 3, dark mobile comparison.');

  if (errors.length) throw new Error(errors.join('\n'));
  fs.writeFileSync(path.join(destination, 'capture-manifest.json'), JSON.stringify({
    capturedAt: new Date().toISOString(), baseURL, sourceCommit: require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' }).trim(),
    method: 'Fresh Playwright browser context, real UI actions, no test output or progress fixtures; no CSS overrides or compositing.',
    settings: { primaryTheme: 'light', chineseHelp: false, speechEnabled: true },
    exampleSentence: 'I give a book to my friend.', captures, runtimeErrors: errors,
  }, null, 2) + '\n');
  console.log(`Captured ${captures.length} new product screenshots.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
