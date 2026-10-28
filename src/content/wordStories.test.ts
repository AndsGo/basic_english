import { describe, expect, it } from 'vitest';
import { validateBasicEnglishTextEntries } from './basicEnglish850';
import { basicEnglishCourse } from './course';
import { giveStory, wordStories } from './wordStories';
import catalog from './storybookCatalog.json';
import design from '../../docs/storybooks/curriculum.json';

describe.each(wordStories)('$wordId story content', (story) => {
  it('uses approved vocabulary throughout its teaching content', () => {
    const texts = [story.title, story.definition, story.narrator, story.practice, ...story.practiceExamples,
      ...story.contextSupport.flatMap(item => [item.text, item.definition]),
      ...story.pages.flatMap((page) => [page.text, page.alt, ...(page.semanticText ? [page.semanticText.label, ...page.semanticText.lines, page.semanticText.accessibleSummary] : [])]),
      story.check.prompt, ...story.check.options, story.check.success, story.check.retry];
    expect(validateBasicEnglishTextEntries(texts.map((text) => ({ text, label: story.id })))).toEqual([]);
  });

  it('reviews earlier course words and repeats the target sense in context', () => {
    const target = basicEnglishCourse.words.find((word) => word.id === story.wordId)!;
    expect(target.weekIntroduced).toBeLessThanOrEqual(story.week);
    expect(story.pages).toHaveLength(4);
    for (const id of story.reviewWordIds) {
      expect(basicEnglishCourse.words.find(word => word.id === id)?.weekIntroduced).toBeLessThanOrEqual(story.week);
    }
    expect(story.pages.some((page) => page.text.toLowerCase().includes(target.text.toLowerCase()))).toBe(true);
    expect(story.check.options[story.check.correctIndex]).toBeDefined();
    for (const id of story.reviewWordIds) {
      const review = basicEnglishCourse.words.find((word) => word.id === id);
      expect(review).toBeDefined();
      expect(review!.weekIntroduced).toBeLessThanOrEqual(story.week);
    }
  });
});

it('retains all 53 planned scripts and publishes only complete artwork sets', () => {
  expect(catalog).toHaveLength(53);
  expect(new Set(catalog.map(story => story.id)).size).toBe(53);
  expect(wordStories.map(story => story.id)).toEqual(catalog.filter(story => story.ready).map(story => story.id));
  for (const story of catalog) {
    const source = [...design.books, ...design.companionBooks].find(item => item.id === story.sourceId)!;
    expect(story.wordId).toBe(source.targetWordId);
    expect(story.definition).toBe(source.teachingDefinition);
    expect(story.pages.map(page => ({ text: page.text, chinese: page.chinese }))).toEqual(source.pages.map(page => ({ text: page.text, chinese: page.chinese })));
    expect(story.check.options[story.check.correctIndex]).toBe(source.check.options[source.check.correctIndex]);
    expect(story.pages).toHaveLength(4);
    const texts = [story.title, story.definition, story.practice, ...story.practiceExamples,
      ...story.pages.flatMap(page => [page.text, ...(page.semanticText ? [page.semanticText.label, ...page.semanticText.lines, page.semanticText.accessibleSummary] : [])]),
      story.check.prompt, ...story.check.options, story.check.success, story.check.retry];
    expect(validateBasicEnglishTextEntries(texts.map(text => ({ text, label: story.id })))).toEqual([]);
    if (story.ready) expect(story.pages.every(page => page.alt && page.file)).toBe(true);
  }
});

it('keeps the approved give example', () => {
  const target = basicEnglishCourse.words.find((word) => word.id === giveStory.wordId)!;
  expect(giveStory.pages.some((page) => page.text === target.example)).toBe(true);
});
