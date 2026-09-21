import familyImage from '../assets/picture-describe/day-197-family-relations.webp';
import feelingsImage from '../assets/picture-describe/day-204-feelings-opinions.webp';
import healthImage from '../assets/picture-describe/day-211-health-body.webp';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week29to31 } from './week29to31';

const images = [familyImage, feelingsImage, healthImage];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const allDays = week29to31.flatMap((week, index) => week.days.map((day) => ({ weekIndex: index, day })));

export const week29to31PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(
  allDays.map(({ weekIndex, day }) => [day.id, {
    id: `picture-${day.id}-${slug(day.title)}`,
    dayId: day.id,
    title: day.title,
    goal: day.goal,
    image: images[weekIndex],
    targetWords: day.wordIds.slice(0, 4),
    suggestedPatterns: day.outputTask.template.slice(0, 3),
    requiredSentenceCount: day.outputTask.requiredSentenceCount,
    simpleVersion: day.outputTask.template.slice(0, day.outputTask.requiredSentenceCount),
  }]),
);

export const week29to31SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(
  allDays.map(({ day }) => [day.id, {
    id: slug(day.title),
    title: day.title,
    capability: `I can ${day.goal.toLowerCase()}`,
    templates: day.outputTask.template,
    guidedPrompts: day.outputTask.prompts,
    scenePrompt: day.outputTask.storyPrompt ?? '',
    dialoguePrompts: [`Ask and answer about ${day.title}.`],
  }]),
);

export const week29to31SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(
  allDays.map(({ day }) => [day.id, [{
    id: `${day.id}-remix-${slug(day.title)}`,
    type: 'replace',
    prompt: `Change one sentence with ${day.wordIds[0]}.`,
    source: day.outputTask.template[0],
    referenceAnswers: day.outputTask.template.slice(1, 3),
  }]]),
);
