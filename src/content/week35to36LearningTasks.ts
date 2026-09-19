import week35Scene from '../assets/picture-describe/day-239-help-and-support.png';
import week36Scene from '../assets/picture-describe/day-246-person-story.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week35to36 } from './week35to36';

const images = [week35Scene, week36Scene];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const allDays = week35to36.flatMap((week, index) => week.days.map((day) => ({ index, day })));

export const week35to36PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(allDays.map(({ index, day }) => [day.id, {
  id: `picture-${day.id}-${slug(day.title)}`,
  dayId: day.id,
  title: day.title,
  goal: day.goal,
  image: images[index],
  targetWords: day.wordIds.slice(0, 4),
  suggestedPatterns: day.outputTask.template.slice(0, 3),
  requiredSentenceCount: day.outputTask.requiredSentenceCount,
  simpleVersion: day.outputTask.template.slice(0, day.outputTask.requiredSentenceCount),
}]));

export const week35to36SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(allDays.map(({ day }) => [day.id, {
  id: slug(day.title),
  title: day.title,
  capability: `I can ${day.goal.toLowerCase()}`,
  templates: day.outputTask.template,
  guidedPrompts: day.outputTask.prompts,
  scenePrompt: day.outputTask.storyPrompt ?? '',
  dialoguePrompts: [`Ask and answer about ${day.title}.`],
}]));

export const week35to36SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(allDays.map(({ day }) => [day.id, [{
  id: `${day.id}-remix-${slug(day.title)}`,
  type: 'replace',
  prompt: `Change one sentence with ${day.wordIds[0]}.`,
  source: day.outputTask.template[0],
  referenceAnswers: day.outputTask.template.slice(1, 3),
}]]));
