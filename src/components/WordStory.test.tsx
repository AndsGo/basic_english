import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { basicEnglishCourse } from '../content/course';
import { SpeechProvider } from '../speech/SpeechProvider';
import { WordStory } from './WordStory';
import { giveStory, wordStories } from '../content/wordStories';

const service = { isSupported: () => true, speak: vi.fn(() => null), stop: vi.fn() };
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

function setup(showChineseHelp = false, enabled = true, story = giveStory) {
  return render(<SpeechProvider enabled={enabled} rate="slow" service={service}>
    <WordStory words={basicEnglishCourse.words} showChineseHelp={showChineseHelp} story={story} />
  </SpeechProvider>);
}

it('reads page text, stops on navigation and keeps Chinese help optional', async () => {
  const user = userEvent.setup();
  setup();
  expect(screen.queryByText('我有一本书。我的朋友在这里。')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Read story page' }));
  expect(service.speak).toHaveBeenCalledWith('I have a book. My friend is here.', 'slow', 'en-US');
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(service.stop).toHaveBeenCalled();
  expect(screen.getByText('My friend has no book.')).toBeInTheDocument();
  expect(service.speak).toHaveBeenLastCalledWith('My friend has no book.', 'slow', 'en-US');
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(service.speak).toHaveBeenLastCalledWith('I give a book to my friend.', 'slow', 'en-US');
});

it.each(wordStories)('automatically reads the next page of $wordId', async (story) => {
  const user = userEvent.setup();
  setup(false, true, story);
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(service.speak).toHaveBeenLastCalledWith(story.pages[1].text, 'slow', 'en-US');
});

it('does not automatically read the next page when speech is disabled', async () => {
  const user = userEvent.setup();
  setup(false, false);
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('My friend has no book.')).toBeInTheDocument();
  expect(service.speak).not.toHaveBeenCalled();
});

it('records reading separately, gives retry feedback and supports rereading', async () => {
  const user = userEvent.setup();
  const view = setup(true);
  expect(screen.getByText('我有一本书。我的朋友在这里。')).toBeInTheDocument();
  for (let index = 0; index < 3; index++) await user.click(screen.getByRole('button', { name: 'Next page' }));
  expect(localStorage.getItem('basic-english-story-give-a-book-read')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Finish story' }));
  await user.click(screen.getByRole('button', { name: 'I have the pen.' }));
  expect(screen.getByRole('status')).toHaveTextContent('Look again');
  await user.click(screen.getByRole('button', { name: 'My friend has the pen.' }));
  expect(screen.getByRole('status')).toHaveTextContent(giveStory.check.success);
  expect(screen.getByText('I give a ___ to my friend.')).toBeInTheDocument();
  expect(localStorage.getItem('basic-english-story-give-a-book-read')).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Read again' }));
  expect(screen.getByText('1 / 4')).toBeInTheDocument();
  view.unmount();
  setup();
  expect(screen.getByText(/Week 3.*Read/)).toBeInTheDocument();
});

it('restores the meaning check and saved sentence without marking the word known', async () => {
  const user = userEvent.setup();
  const view = setup();
  for (let index = 0; index < 3; index++) await user.click(screen.getByRole('button', { name: 'Next page' }));
  await user.click(screen.getByRole('button', { name: 'Finish story' }));
  await user.click(screen.getByRole('button', { name: giveStory.check.options[giveStory.check.correctIndex] }));
  await user.type(screen.getByRole('textbox', { name: 'Your sentence' }), 'I give a cup to my friend.');
  await user.click(screen.getByRole('button', { name: 'Save my sentence' }));
  view.unmount();
  setup();
  expect(screen.getByRole('heading', { name: 'Your turn' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Your sentence' })).toHaveValue('I give a cup to my friend.');
  expect(screen.getByRole('status')).toHaveTextContent(giveStory.check.success);
  expect(JSON.parse(localStorage.getItem('basic-english-story-give-a-book-progress')!).answer.correct).toBe(true);
});

it('provides readable records outside the illustration', () => {
  const record = { kind: 'record', label: 'Today', lines: ['I clean the table.'], accessibleSummary: 'A record of my work today.' };
  setup(false, true, { ...giveStory, pages: giveStory.pages.map(page => ({ ...page, semanticText: record })) });
  expect(screen.getByRole('complementary', { name: record.accessibleSummary })).toHaveTextContent('I clean the table.');
});

it('keeps read flags saved before the progress format was added', () => {
  localStorage.setItem('basic-english-story-give-a-book-read', 'true');
  setup();
  expect(screen.getByText(/Week 3.*Read/)).toBeInTheDocument();
});

it('resumes the saved page without starting speech or marking the story read', async () => {
  const user = userEvent.setup();
  const view = setup();
  await user.click(screen.getByRole('button', { name: 'Next page' }));
  view.unmount();
  vi.clearAllMocks();
  setup();
  expect(screen.getByText('2 / 4')).toBeInTheDocument();
  expect(screen.getByText(giveStory.pages[1].text)).toBeInTheDocument();
  expect(service.speak).not.toHaveBeenCalled();
  expect(localStorage.getItem('basic-english-story-give-a-book-read')).toBeNull();
});

it.each([-1, 99, '2'])('starts at page one when the stored page is invalid: %s', pageIndex => {
  localStorage.setItem('basic-english-story-give-a-book-progress', JSON.stringify({ read: false, pageIndex }));
  setup();
  expect(screen.getByText('1 / 4')).toBeInTheDocument();
});
