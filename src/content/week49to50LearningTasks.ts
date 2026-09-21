import week49Scene from '../assets/picture-describe/day-337-instructions-processes.webp';
import week50Scene from '../assets/picture-describe/day-344-description-practice.webp';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week49to50 } from './week49to50';

const images = [week49Scene, week50Scene];
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const allDays = week49to50.flatMap((week, index) => week.days.map((day) => ({ index, day })));
export const week49to50PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(allDays.map(({ index, day }) => [day.id, { id: `picture-${day.id}-${slug(day.title)}`, dayId: day.id, title: day.title, goal: day.goal, image: images[index], targetWords: day.wordIds.slice(0, 4), suggestedPatterns: day.outputTask.template.slice(0, 3), requiredSentenceCount: day.outputTask.requiredSentenceCount, simpleVersion: day.outputTask.template.slice(0, day.outputTask.requiredSentenceCount) }]));
export const week49to50SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(allDays.map(({ day }) => [day.id, { id: slug(day.title), title: day.title, capability: `I can ${day.goal.toLowerCase()}`, templates: day.outputTask.template, guidedPrompts: day.outputTask.prompts, scenePrompt: day.outputTask.storyPrompt ?? '', dialoguePrompts: [`Ask and answer about ${day.title}.`] }]));
export const week49to50SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(allDays.map(({ day }) => [day.id, [{ id: `${day.id}-remix-${slug(day.title)}`, type: 'replace', prompt: `Change one sentence with ${day.wordIds[0]}.`, source: day.outputTask.template[0], referenceAnswers: day.outputTask.template.slice(1, 3) }]]));
