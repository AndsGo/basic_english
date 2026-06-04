import type { Course } from '../domain/types';
import { week1, week1Patterns, week1Words } from './week1';
import { week2, week2Patterns, week2Words } from './week2';
import { week3, week3Patterns, week3Words } from './week3';

export const basicEnglishCourse: Course = {
  id: 'basic-english-12-weeks',
  title: 'Basic English 12 Weeks',
  contentVersion: '1.9.0',
  schemaVersion: 1,
  words: [...week1Words, ...week2Words, ...week3Words],
  patterns: [...week1Patterns, ...week2Patterns, ...week3Patterns],
  weeks: [week1, week2, week3],
};
