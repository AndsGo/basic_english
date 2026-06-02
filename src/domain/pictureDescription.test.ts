import { describe, expect, it } from 'vitest';
import type { PictureDescribeTask } from './types';
import { checkPictureDescription, countMeaningfulSentences } from './pictureDescription';

const task: PictureDescribeTask = {
  id: 'picture-day-008-my-room',
  dayId: 'day-008',
  title: 'My Room',
  goal: 'Say what you can see in this room.',
  image: '/room.png',
  targetWords: ['room', 'bed', 'table', 'window'],
  suggestedPatterns: ['This is ...', 'There is ...', 'I can see ...'],
  requiredSentenceCount: 3,
  simpleVersion: ['This is my room.', 'There is a bed.', 'I can see a table.'],
};

describe('picture description feedback', () => {
  it('counts meaningful sentences from punctuation and line breaks', () => {
    expect(countMeaningfulSentences('This is my room. There is a bed.\nI can see a table.')).toBe(3);
    expect(countMeaningfulSentences('room. bed. table.')).toBe(0);
  });

  it('marks clear-enough answers ready', () => {
    expect(checkPictureDescription(task, 'This is my room. There is a bed. I can see a table.')).toEqual({
      status: 'ready',
      sentenceCount: 3,
      matchedTargetWords: ['room', 'bed', 'table'],
      matchedPatterns: ['This is', 'There is', 'I can see'],
      messages: ['Clear enough. You can continue.'],
      simpleVersion: task.simpleVersion,
    });
  });

  it('returns at most two actionable messages for weak answers', () => {
    const feedback = checkPictureDescription(task, 'room. bed.');

    expect(feedback.status).toBe('needs_work');
    expect(feedback.messages.length).toBeLessThanOrEqual(2);
    expect(feedback.messages).toContain('Add one more sentence about the picture.');
    expect(feedback.simpleVersion).toEqual(task.simpleVersion);
  });
});
