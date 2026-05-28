import type { SceneRemixTask } from '../domain/types';

export const sceneRemixTasksByDayId: Partial<Record<string, SceneRemixTask[]>> = {
  'day-001': [
    {
      id: 'day-001-remix-country-japan',
      type: 'replace',
      prompt: 'Change China to Japan.',
      source: 'I am from China.',
      referenceAnswers: ['I am from Japan.'],
    },
    {
      id: 'day-001-remix-job-teacher',
      type: 'replace',
      prompt: 'Change student to teacher.',
      source: 'I am a student.',
      referenceAnswers: ['I am a teacher.'],
    },
  ],
  'day-008': [
    {
      id: 'day-008-remix-room-office',
      type: 'replace',
      prompt: 'Change room to office.',
      source: 'My room is small.',
      referenceAnswers: ['My office is small.'],
    },
    {
      id: 'day-008-remix-bed-table',
      type: 'replace',
      prompt: 'Change bed to table.',
      source: 'I have a bed.',
      referenceAnswers: ['I have a table.'],
    },
    {
      id: 'day-008-remix-office-description',
      type: 'extend',
      prompt: 'Describe your office.',
      referenceAnswers: ['This is my office.', 'My office is small.', 'I have a table in my office.'],
    },
  ],
  'day-009': [
    {
      id: 'day-009-remix-book-phone',
      type: 'replace',
      prompt: 'Change book to phone.',
      source: 'There is a book in my room.',
      referenceAnswers: ['There is a phone in my room.'],
    },
    {
      id: 'day-009-remix-cup-bag',
      type: 'replace',
      prompt: 'Change cup to bag.',
      source: 'I have a cup.',
      referenceAnswers: ['I have a bag.'],
    },
  ],
  'day-010': [
    {
      id: 'day-010-remix-on-under',
      type: 'replace',
      prompt: 'Change on to under.',
      source: 'The book is on the table.',
      referenceAnswers: ['The book is under the table.'],
    },
    {
      id: 'day-010-remix-table-chair',
      type: 'replace',
      prompt: 'Change table to chair.',
      source: 'The bag is near the table.',
      referenceAnswers: ['The bag is near the chair.'],
    },
  ],
};
