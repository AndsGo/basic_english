import week13Image from '../assets/picture-describe/day-085-things-at-home.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week13 } from './week13';

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const week13PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(
  week13.days.map((day) => [day.id, { id: `picture-${day.id}-${slug(day.title)}`, dayId: day.id, title: day.title, goal: day.goal, image: week13Image, targetWords: day.wordIds.slice(0, 4), suggestedPatterns: day.outputTask.template.slice(0, 3), requiredSentenceCount: day.outputTask.requiredSentenceCount, simpleVersion: day.outputTask.template.slice(0, day.outputTask.requiredSentenceCount) }]),
);
export const week13SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(
  week13.days.map((day) => [day.id, { id: slug(day.title), title: day.title, capability: `I can ${day.goal.toLowerCase()}`, templates: day.outputTask.template, guidedPrompts: day.outputTask.prompts, scenePrompt: day.outputTask.storyPrompt ?? '', dialoguePrompts: [`Ask and answer about ${day.title}.`] }]),
);
export const week13SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(
  week13.days.map((day) => [day.id, [{ id: `${day.id}-remix-${slug(day.title)}`, type: 'replace', prompt: `Change one sentence with ${day.wordIds[0]}.`, source: day.outputTask.template[0], referenceAnswers: day.outputTask.template.slice(1, 3) }]]),
);
