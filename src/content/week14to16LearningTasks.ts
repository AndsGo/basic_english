import week14Image from '../assets/picture-describe/day-092-things-materials.webp';
import week15Image from '../assets/picture-describe/day-099-shape-position.webp';
import week16Image from '../assets/picture-describe/day-106-amount-comparison.webp';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week14to16 } from './week14to16';

const images = [week14Image, week15Image, week16Image];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const week14to16PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(
  week14to16.flatMap((week, index) => week.days.map((day) => [day.id, { id: `picture-${day.id}-${slug(day.title)}`, dayId: day.id, title: day.title, goal: day.goal, image: images[index], targetWords: day.wordIds.slice(0, 4), suggestedPatterns: day.outputTask.template.slice(0, 3), requiredSentenceCount: day.outputTask.requiredSentenceCount, simpleVersion: day.outputTask.template.slice(0, day.outputTask.requiredSentenceCount) }])),
);

export const week14to16SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(
  week14to16.flatMap((week) => week.days.map((day) => [day.id, { id: slug(day.title), title: day.title, capability: `I can ${day.goal.toLowerCase()}`, templates: day.outputTask.template, guidedPrompts: day.outputTask.prompts, scenePrompt: day.outputTask.storyPrompt ?? '', dialoguePrompts: [`Ask and answer about ${day.title}.`] }])),
);

export const week14to16SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(
  week14to16.flatMap((week) => week.days.map((day) => [day.id, [{ id: `${day.id}-remix-${slug(day.title)}`, type: 'replace', prompt: `Change one sentence with ${day.wordIds[0]}.`, source: day.outputTask.template[0], referenceAnswers: day.outputTask.template.slice(1, 3) }]])),
);
