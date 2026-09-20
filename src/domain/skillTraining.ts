export type SkillHintKind = 'keywords' | 'reference' | 'transcript' | 'chinese';
export type SpeakingSelfMark = 'clear' | 'try_again';

export interface HintEvent {
  kind: SkillHintKind;
  at: string;
}

export interface SkillAttempt {
  id: string;
  dayId: string;
  taskId: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing';
  revision: number;
  createdAt: string;
  answer?: string;
  correct?: boolean;
  selfMark?: SpeakingSelfMark;
  recordingId?: string;
  playbackStartedAt?: string;
  hintEvents: HintEvent[];
  replayCount: number;
  usedSlowRate: boolean;
  afterFeedback: boolean;
}

export interface LocalRecording {
  id: string;
  dayId: string;
  taskId: string;
  attemptId: string;
  blob: Blob;
  mimeType: string;
  bytes: number;
  durationMs: number;
  createdAt: string;
}

export interface SkillDayProgress {
  id: string;
  dayId: string;
  revision: number;
  listeningComplete: boolean;
  speakingPending: boolean;
  updatedAt: string;
}

export function createSkillAttempt(input: Omit<SkillAttempt, 'hintEvents' | 'replayCount' | 'usedSlowRate' | 'afterFeedback'>): SkillAttempt {
  return { ...input, hintEvents: [], replayCount: 0, usedSlowRate: false, afterFeedback: false };
}

export function isSpeakingAttemptComplete(attempt: SkillAttempt): boolean {
  return Boolean(attempt.recordingId && attempt.playbackStartedAt && attempt.selfMark);
}
