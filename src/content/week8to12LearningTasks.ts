import day050Image from '../assets/picture-describe/day-050-family-persons.png';
import day057Image from '../assets/picture-describe/day-057-weather-garden.png';
import day064Image from '../assets/picture-describe/day-064-office-records.png';
import day071Image from '../assets/picture-describe/day-071-like-reason.png';
import day078Image from '../assets/picture-describe/day-078-time-place.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week8to12 } from './week8to12';

const imageByWeekNumber: Record<number, string> = {
  8: day050Image,
  9: day057Image,
  10: day064Image,
  11: day071Image,
  12: day078Image,
};

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const week8to12PictureDescribeTasksByDayId: Record<string, PictureDescribeTask> = Object.fromEntries(
  week8to12.flatMap((week) =>
    week.days.map((day) => [
      day.id,
      {
        id: `picture-${day.id}-${slug(day.title)}`,
        dayId: day.id,
        title: day.title,
        goal: day.goal,
        image: imageByWeekNumber[week.number],
        targetWords: day.wordIds.slice(0, 4),
        suggestedPatterns: day.outputTask.template.slice(0, 3),
        requiredSentenceCount: day.outputTask.requiredSentenceCount,
        simpleVersion: day.outputTask.template,
      },
    ]),
  ),
);

export const week8to12SceneGoalsByDayId: Record<string, SceneGoal> = Object.fromEntries(
  week8to12.flatMap((week) =>
    week.days.map((day) => [
      day.id,
      {
        id: slug(day.title),
        title: day.title,
        capability: `I can ${day.goal.toLowerCase()}`,
        templates: day.outputTask.template,
        guidedPrompts: day.outputTask.prompts,
        scenePrompt: day.outputTask.storyPrompt ?? `Make a short story about ${day.outputTask.topic}.`,
        dialoguePrompts: [`Ask and answer about ${day.outputTask.topic}.`, `Ask and answer with ${day.wordIds[0]}.`],
      },
    ]),
  ),
);

export const week8to12SceneRemixTasksByDayId: Record<string, SceneRemixTask[]> = Object.fromEntries(
  week8to12.flatMap((week) =>
    week.days.map((day) => [
      day.id,
      [
        {
          id: `${day.id}-remix-${slug(day.title)}`,
          type: day.outputTask.storyMode === 'recap' ? 'extend' : 'replace',
          prompt: `Change one sentence with ${day.wordIds[0]}.`,
          source: day.outputTask.template[0],
          referenceAnswers: day.outputTask.template.slice(1, Math.min(day.outputTask.template.length, 3)),
        },
      ],
    ]),
  ),
);
