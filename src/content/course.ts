import type { Course } from '../domain/types';
import { week1, week1Patterns, week1Words } from './week1';
import { week2, week2Patterns, week2Words } from './week2';
import { week3, week3Patterns, week3Words } from './week3';
import { week4, week4Patterns, week4Words } from './week4';
import { week5, week5Patterns, week5Words } from './week5';
import { week6, week6Patterns, week6Words } from './week6';
import { week7, week7Patterns, week7Words } from './week7';
import { week8to12, week8to12Patterns, week8to12Words } from './week8to12';

export const basicEnglishCourse: Course = {
  id: 'basic-english-12-weeks',
  title: 'Basic English 12 Weeks',
  contentVersion: '1.12.0',
  schemaVersion: 1,
  words: [
    ...week1Words,
    ...week2Words,
    ...week3Words,
    ...week4Words,
    ...week5Words,
    ...week6Words,
    ...week7Words,
    ...week8to12Words,
  ],
  patterns: [
    ...week1Patterns,
    ...week2Patterns,
    ...week3Patterns,
    ...week4Patterns,
    ...week5Patterns,
    ...week6Patterns,
    ...week7Patterns,
    ...week8to12Patterns,
  ],
  weeks: [week1, week2, week3, week4, week5, week6, week7, ...week8to12],
};
