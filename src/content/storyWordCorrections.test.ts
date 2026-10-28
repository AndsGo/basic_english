import { expect, it } from 'vitest';
import { basicEnglishCourse } from './course';
import corrections from './storyWordCorrections.json';
import { validateBasicEnglishTextEntries } from './basicEnglish850';

it('replaces all 31 placeholder entries with usable teaching content in the course', () => {
  expect(Object.keys(corrections)).toHaveLength(31);
  for (const id of Object.keys(corrections)) {
    const word = basicEnglishCourse.words.find(entry => entry.id === id)!;
    expect(word.definition).not.toBe('a thing');
    expect(word.example).not.toMatch(/^The .+ is (good|clear)\.$/);
    expect(word.chinese).toMatch(/\p{Script=Han}/u);
    expect(word.phonetic).not.toBe(`/${word.text}/`);
    expect(validateBasicEnglishTextEntries([word.definition, word.example].map(text => ({ text, label: id })))).toEqual([]);
  }
});

it('treats across as a relationship and gives while a valid sentence', () => {
  expect(basicEnglishCourse.words.find(word => word.id === 'across')?.category).toBe('structure');
  expect(basicEnglishCourse.words.find(word => word.id === 'while')?.example).toBe('I read while my friend writes.');
});
