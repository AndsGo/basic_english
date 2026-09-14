import type { Course } from '../domain/types';
import { week1, week1Patterns, week1Words } from './week1';
import { week2, week2Patterns, week2Words } from './week2';
import { week3, week3Patterns, week3Words } from './week3';
import { week4, week4Patterns, week4Words } from './week4';
import { week5, week5Patterns, week5Words } from './week5';
import { week6, week6Patterns, week6Words } from './week6';
import { week7, week7Patterns, week7Words } from './week7';
import { week8to12, week8to12Patterns, week8to12Words } from './week8to12';
import { week13, week13Patterns, week13Words } from './week13';
import { week14, week14to16Patterns, week14Words, week15, week15Words, week16, week16Words } from './week14to16';
import { week17, week17to19Patterns, week17Words, week18, week18Words, week19, week19Words } from './week17to19';
import { week20, week20to22Patterns, week20Words, week21, week21Words, week22, week22Words } from './week20to22';
import { week23, week23Words, week24, week24Words, week25, week25Words } from './week23to25';
import { week26, week26Words, week27, week27Words, week28, week28Words } from './week26to28';

export const basicEnglishCourse: Course = {
  id: 'basic-english-28-weeks',
  title: 'Basic English 28 Weeks',
  contentVersion: '1.28.0',
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
    ...week13Words,
    ...week14Words,
    ...week15Words,
    ...week16Words,
    ...week17Words,
    ...week18Words,
    ...week19Words,
    ...week20Words,
    ...week21Words,
    ...week22Words,
    ...week23Words,
    ...week24Words,
    ...week25Words,
    ...week26Words,
    ...week27Words,
    ...week28Words,
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
    ...week13Patterns,
    ...week14to16Patterns,
    ...week17to19Patterns,
    ...week20to22Patterns,
  ],
  weeks: [week1, week2, week3, week4, week5, week6, week7, ...week8to12, week13, week14, week15, week16, week17, week18, week19, week20, week21, week22, week23, week24, week25, week26, week27, week28],
};
