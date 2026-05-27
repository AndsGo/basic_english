import type { DayProgress } from './progress';
import type { SceneHelpMode, SceneOutput } from './types';

type PartialSceneOutput = Partial<SceneOutput> & { sceneId?: string };

export interface SceneCompletionGate {
  isComplete: boolean;
  missingRequirements: string[];
}

function isCompletedDay(progress: Pick<DayProgress, 'status' | 'currentStep'>) {
  return progress.status === 'completed' || progress.currentStep === 'done';
}

function normalizeHelpMode(value: unknown): SceneHelpMode {
  return value === 'guided' || value === 'free' ? value : 'template';
}

export function createInitialSceneOutput(sceneId: string): SceneOutput {
  return {
    sceneId,
    helpMode: 'template',
    sentences: ['', '', '', ''],
    sceneText: '',
    dialogue: '',
  };
}

export function normalizeSceneOutput(scene: PartialSceneOutput | undefined, fallbackSceneId = ''): SceneOutput {
  const sentences = Array.isArray(scene?.sentences) ? [...scene.sentences] : [];
  while (sentences.length < 4) sentences.push('');

  return {
    sceneId: scene?.sceneId?.trim() || fallbackSceneId,
    helpMode: normalizeHelpMode(scene?.helpMode),
    sentences,
    sceneText: scene?.sceneText ?? '',
    dialogue: scene?.dialogue ?? '',
    completedAt: scene?.completedAt,
  };
}

export function getSceneOutputCompletion(scene: SceneOutput): SceneCompletionGate {
  const missingRequirements: string[] = [];
  const sentenceCount = scene.sentences.filter((sentence) => sentence.trim()).length;

  if (sentenceCount < 4) missingRequirements.push('Write at least 4 scene sentences.');
  if (!scene.sceneText.trim()) missingRequirements.push('Write the scene description.');
  if (!scene.dialogue.trim()) missingRequirements.push('Write the dialogue.');

  return { isComplete: missingRequirements.length === 0, missingRequirements };
}

export function getCompletedSceneIds(
  dayProgress: Array<Pick<DayProgress, 'dayId' | 'status' | 'currentStep'>>,
  outputs: Array<{ dayId: string; scene?: SceneOutput }>,
): string[] {
  const completedDayIds = new Set(dayProgress.filter(isCompletedDay).map((progress) => progress.dayId));

  return outputs.flatMap((output) => {
    if (!completedDayIds.has(output.dayId) || !output.scene) return [];
    return getSceneOutputCompletion(output.scene).isComplete ? [output.scene.sceneId] : [];
  });
}
