import type { Course } from '../domain/types';
import { week1, week1Patterns, week1Words } from './week1';
import { week2, week2Patterns, week2Words } from './week2';

export const basicEnglishCourse: Course = {
  id: 'basic-english-12-weeks',
  title: 'Basic English 12 Weeks',
  contentVersion: '1.2.0',
  schemaVersion: 1,
  words: [...week1Words, ...week2Words],
  patterns: [...week1Patterns, ...week2Patterns],
  weeks: [week1, week2],
};
