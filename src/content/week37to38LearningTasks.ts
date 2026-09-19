import week37Scene from '../assets/picture-describe/day-253-nature-and-weather.png';
import week38Scene from '../assets/picture-describe/day-260-animals-and-living-things.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week37to38 } from './week37to38';

const images = [week37Scene, week38Scene];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const allDays = week37to38.flatMap((week, index) => week.days.map((day) => ({ index, day })));

export const week37to38PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(allDays.map(({ index, day }) => [day.id, {
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

export const week37to38SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(allDays.map(({ day }) => [day.id, {
  id: slug(day.title),
  title: day.title,
  capability: `I can ${day.goal.toLowerCase()}`,
  templates: day.outputTask.template,
  guidedPrompts: day.outputTask.prompts,
  scenePrompt: day.outputTask.storyPrompt ?? '',
  dialoguePrompts: [`Ask and answer about ${day.title}.`],
}]));

export const week37to38SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(allDays.map(({ day }) => [day.id, [{
  id: `${day.id}-remix-${slug(day.title)}`,
  type: 'replace',
  prompt: `Change one sentence with ${day.wordIds[0]}.`,
  source: day.outputTask.template[0],
  referenceAnswers: day.outputTask.template.slice(1, 3),
}]]));
