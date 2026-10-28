export interface StoryProgress {
  read: boolean;
  answer?: { question: string; text: string; correct: boolean };
  sentence?: string;
}

export function loadStoryProgress(storyId: string): StoryProgress {
  try {
    const stored = window.localStorage.getItem(`basic-english-story-${storyId}-progress`);
    const progress = stored ? JSON.parse(stored) : null;
    return {
      read: progress?.read === true || window.localStorage.getItem(`basic-english-story-${storyId}-read`) === 'true',
      answer: progress?.answer,
      sentence: typeof progress?.sentence === 'string' ? progress.sentence : '',
    };
  } catch {
    return { read: false, sentence: '' };
  }
}

export function saveStoryProgress(storyId: string, progress: StoryProgress): boolean {
  try {
    window.localStorage.setItem(`basic-english-story-${storyId}-progress`, JSON.stringify(progress));
    if (progress.read) window.localStorage.setItem(`basic-english-story-${storyId}-read`, 'true');
    return true;
  } catch {
    return false;
  }
}
