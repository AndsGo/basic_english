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
  'day-015': [
    {
      id: 'day-015-remix-wash-put-on',
      type: 'replace',
      prompt: 'Change wash my face to put on my clothes.',
      source: 'I wash my face.',
      referenceAnswers: ['I put on my clothes.'],
    },
  ],
  'day-016': [
    {
      id: 'day-016-remix-school-work',
      type: 'replace',
      prompt: 'Change school to work.',
      source: 'I go to school.',
      referenceAnswers: ['I go to work.'],
    },
  ],
  'day-017': [
    {
      id: 'day-017-remix-open-close',
      type: 'replace',
      prompt: 'Change open to close.',
      source: 'I open the book.',
      referenceAnswers: ['I close the book.'],
    },
  ],
  'day-018': [
    {
      id: 'day-018-remix-morning-evening',
      type: 'replace',
      prompt: 'Change morning to evening.',
      source: 'In the morning, I read.',
      referenceAnswers: ['In the evening, I read.'],
    },
  ],
  'day-019': [
    {
      id: 'day-019-remix-read-write',
      type: 'replace',
      prompt: 'Change read to write.',
      source: 'Then I read.',
      referenceAnswers: ['Then I write.'],
    },
  ],
  'day-020': [
    {
      id: 'day-020-remix-often-sometimes',
      type: 'replace',
      prompt: 'Change often to sometimes.',
      source: 'I often read.',
      referenceAnswers: ['I sometimes read.'],
    },
  ],
  'day-021': [
    {
      id: 'day-021-remix-normal-day',
      type: 'extend',
      prompt: 'Add two more sentences about your normal day.',
      referenceAnswers: ['In the afternoon, I study.', 'In the evening, I am at home.'],
    },
  ],
  'day-022': [
    {
      id: 'day-022-remix-bread-rice',
      type: 'replace',
      prompt: 'Change bread to rice.',
      source: 'I eat bread.',
      referenceAnswers: ['I eat rice.'],
    },
  ],
  'day-023': [
    {
      id: 'day-023-remix-want-need',
      type: 'replace',
      prompt: 'Change want to need.',
      source: 'I want some water.',
      referenceAnswers: ['I need some water.'],
    },
  ],
  'day-024': [
    {
      id: 'day-024-remix-bread-milk',
      type: 'replace',
      prompt: 'Change bread to milk.',
      source: 'I buy bread.',
      referenceAnswers: ['I buy milk.'],
    },
  ],
  'day-025': [
    {
      id: 'day-025-remix-little-much',
      type: 'replace',
      prompt: 'Change little to much.',
      source: 'It costs little.',
      referenceAnswers: ['It costs much.'],
    },
  ],
  'day-026': [
    {
      id: 'day-026-remix-show-bring',
      type: 'replace',
      prompt: 'Change show to bring.',
      source: 'Can you show me the book?',
      referenceAnswers: ['Can you bring me the book?'],
    },
  ],
  'day-027': [
    {
      id: 'day-027-remix-full-empty',
      type: 'replace',
      prompt: 'Change full to empty.',
      source: 'The cup is full.',
      referenceAnswers: ['The cup is empty.'],
    },
  ],
  'day-028': [
    {
      id: 'day-028-remix-shopping-scene',
      type: 'extend',
      prompt: 'Add two more sentences to the shopping scene.',
      referenceAnswers: ['I need more water.', 'The food is good.'],
    },
  ],
  'day-029': [
    {
      id: 'day-029-remix-food-water',
      type: 'replace',
      prompt: 'Change food to water.',
      source: 'I go out because I need food.',
      referenceAnswers: ['I go out because I need water.'],
    },
  ],
  'day-030': [
    {
      id: 'day-030-remix-stop-store',
      type: 'replace',
      prompt: 'Change bus stop to store.',
      source: 'I walk to the bus stop.',
      referenceAnswers: ['I walk to the store.'],
    },
  ],
  'day-031': [
    {
      id: 'day-031-remix-store-home',
      type: 'replace',
      prompt: 'Change store to home.',
      source: 'I take the bus to the store.',
      referenceAnswers: ['I take the bus home.'],
    },
  ],
  'day-032': [
    {
      id: 'day-032-remix-bread-milk',
      type: 'replace',
      prompt: 'Change bread to milk.',
      source: 'I find bread in the store.',
      referenceAnswers: ['I find milk in the store.'],
    },
  ],
  'day-033': [
    {
      id: 'day-033-remix-food-bread',
      type: 'replace',
      prompt: 'Change food to bread.',
      source: 'I am in line and pay for food.',
      referenceAnswers: ['I am in line and pay for bread.'],
    },
  ],
  'day-034': [
    {
      id: 'day-034-remix-food-bag',
      type: 'replace',
      prompt: 'Change food to bag.',
      source: 'I carry food home.',
      referenceAnswers: ['I carry the bag home.'],
    },
  ],
  'day-035': [
    {
      id: 'day-035-remix-errand-story',
      type: 'extend',
      prompt: 'Put more sentences in the outside story.',
      referenceAnswers: ['I am in line.', 'I come back home.'],
    },
  ],
  'day-036': [
    {
      id: 'day-036-remix-early-late',
      type: 'replace',
      prompt: 'Change early to late.',
      source: 'I am early and waiting for the bus.',
      referenceAnswers: ['I am late and waiting for the bus.'],
    },
  ],
  'day-037': [
    {
      id: 'day-037-remix-clear-way',
      type: 'replace',
      prompt: 'Change clear to not clear.',
      source: 'The way is clear.',
      referenceAnswers: ['The way is not clear.'],
    },
  ],
  'day-038': [
    {
      id: 'day-038-remix-wrong-way',
      type: 'replace',
      prompt: 'Change straight to turn right.',
      source: 'I go straight.',
      referenceAnswers: ['I turn right.'],
    },
  ],
  'day-039': [
    {
      id: 'day-039-remix-repeat-please',
      type: 'replace',
      prompt: 'Change I understand to Please repeat.',
      source: 'I understand.',
      referenceAnswers: ['Please repeat.'],
    },
  ],
  'day-040': [
    {
      id: 'day-040-remix-understand-hear',
      type: 'replace',
      prompt: 'Change understand to get the answer.',
      source: 'I do not understand.',
      referenceAnswers: ['I do not get the answer.'],
    },
  ],
  'day-041': [
    {
      id: 'day-041-remix-help-answer',
      type: 'replace',
      prompt: 'Change help to answer.',
      source: 'I am kind and ask for help.',
      referenceAnswers: ['I am kind and ask for an answer.'],
    },
  ],
  'day-042': [
    {
      id: 'day-042-remix-problem-story',
      type: 'extend',
      prompt: 'Put the problem story in order.',
      referenceAnswers: ['The way is not clear.', 'This way is wrong.', 'I need another way.', 'Please repeat.', 'I understand.', 'I am kind.'],
    },
  ],
};
