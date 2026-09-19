import week45Scene from '../assets/picture-describe/day-309-past-story.png';
import week46Scene from '../assets/picture-describe/day-316-future-purpose.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week45to46 } from './week45to46';

const images = [week45Scene, week46Scene];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const allDays = week45to46.flatMap((week, index) => week.days.map((day) => ({ index, day })));

export const week45to46PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(allDays.map(({ index, day }) => [day.id, {
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

export const week45to46SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(allDays.map(({ day }) => [day.id, {
  id: slug(day.title),
  title: day.title,
  capability: `I can ${day.goal.toLowerCase()}`,
  templates: day.outputTask.template,
  guidedPrompts: day.outputTask.prompts,
  scenePrompt: day.outputTask.storyPrompt ?? '',
  dialoguePrompts: [`Ask and answer about ${day.title}.`],
}]));

export const week45to46SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(allDays.map(({ day }) => [day.id, [{
  id: `${day.id}-remix-${slug(day.title)}`,
  type: 'replace',
  prompt: `Change one sentence with ${day.wordIds[0]}.`,
  source: day.outputTask.template[0],
  referenceAnswers: day.outputTask.template.slice(1, 3),
}]]));
