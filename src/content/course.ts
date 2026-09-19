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
import { week29, week29Words, week30, week30Words, week31, week31Words } from './week29to31';
import { week32, week32Words, week33, week33Words, week34, week34Words } from './week32to34';
import { week35, week35Words, week36, week36Words } from './week35to36';
import { week37, week37Words, week38, week38Words } from './week37to38';
import { week39, week39Words, week40, week40Words } from './week39to40';
import { week41, week41Words, week42, week42Words } from './week41to42';
import { week43, week43Words, week44, week44Words } from './week43to44';
import { week45, week45Words, week46, week46Words } from './week45to46';
import { week47, week47Words, week48, week48Words } from './week47to48';
import { week49, week49Words, week50, week50Words } from './week49to50';

export const basicEnglishCourse: Course = {
  id: 'basic-english-50-weeks',
  title: 'Basic English 50 Weeks',
  contentVersion: '1.50.0',
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
    ...week29Words,
    ...week30Words,
    ...week31Words,
    ...week32Words,
    ...week33Words,
    ...week34Words,
    ...week35Words,
    ...week36Words,
    ...week37Words,
    ...week38Words,
    ...week39Words,
    ...week40Words,
    ...week41Words,
    ...week42Words,
    ...week43Words,
    ...week44Words,
    ...week45Words,
    ...week46Words,
    ...week47Words,
    ...week48Words,
    ...week49Words,
    ...week50Words,
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
  weeks: [week1, week2, week3, week4, week5, week6, week7, ...week8to12, week13, week14, week15, week16, week17, week18, week19, week20, week21, week22, week23, week24, week25, week26, week27, week28, week29, week30, week31, week32, week33, week34, week35, week36, week37, week38, week39, week40, week41, week42, week43, week44, week45, week46, week47, week48, week49, week50],
};
