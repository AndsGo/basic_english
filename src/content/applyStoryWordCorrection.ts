import type { Word } from '../domain/types';
import corrections from './storyWordCorrections.json';

export function applyStoryWordCorrection(word: Word): Word {
  const correction = corrections[word.id as keyof typeof corrections];
  if (!correction) return word;
  return { ...word, ...correction, category: word.id === 'across' ? 'structure' : word.category };
}
