import type { PictureDescribeTask } from './types';

export type PictureDescriptionStatus = 'ready' | 'needs_work';

export interface PictureDescriptionFeedback {
  status: PictureDescriptionStatus;
  sentenceCount: number;
  matchedTargetWords: string[];
  matchedPatterns: string[];
  messages: string[];
  simpleVersion: string[];
}

const basicPatternChecks = ['This is', 'There is', 'There are', 'I can see', 'I have', 'I am', 'He is', 'She is'];

function normalizeText(text: string): string {
  return text.toLowerCase();
}

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter((word) => /[a-z]/i.test(word)).length;
}

export function countMeaningfulSentences(text: string): number {
  return splitSentences(text).filter((sentence) => wordCount(sentence) >= 3).length;
}

export function checkPictureDescription(task: PictureDescribeTask, text: string): PictureDescriptionFeedback {
  const normalized = normalizeText(text);
  const sentenceCount = countMeaningfulSentences(text);
  const matchedTargetWords = task.targetWords.filter((word) => normalized.includes(word.toLowerCase()));
  const matchedPatterns = basicPatternChecks.filter((pattern) => normalized.includes(pattern.toLowerCase()));
  const messages: string[] = [];

  if (sentenceCount < task.requiredSentenceCount) {
    messages.push('Add one more sentence about the picture.');
  }
  if (matchedTargetWords.length < 2) {
    messages.push(`Use picture words like ${task.targetWords.slice(0, 3).join(', ')}.`);
  }
  if (matchedPatterns.length === 0) {
    messages.push('Try one simple pattern: There is ...');
  }

  const isReady = sentenceCount >= task.requiredSentenceCount && (matchedTargetWords.length >= 2 || matchedPatterns.length > 0);

  return {
    status: isReady ? 'ready' : 'needs_work',
    sentenceCount,
    matchedTargetWords,
    matchedPatterns,
    messages: isReady ? ['Clear enough. You can continue.'] : messages.slice(0, 2),
    simpleVersion: task.simpleVersion,
  };
}
