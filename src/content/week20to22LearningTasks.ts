import week20Image from '../assets/picture-describe/day-134-home-story-check.webp';
import week21Image from '../assets/picture-describe/day-141-time-frequency-order.webp';
import week22Image from '../assets/picture-describe/day-148-work-study-actions.webp';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week20to22 } from './week20to22';

const images=[week20Image,week21Image,week22Image];
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const week20to22PictureDescribeTasksByDayId:Record<string,PictureDescribeTask>=Object.fromEntries(week20to22.flatMap((week,index)=>week.days.map(day=>[day.id,{id:`picture-${day.id}-${slug(day.title)}`,dayId:day.id,title:day.title,goal:day.goal,image:images[index],targetWords:day.wordIds.slice(0,4),suggestedPatterns:day.outputTask.template.slice(0,3),requiredSentenceCount:day.outputTask.requiredSentenceCount,simpleVersion:day.outputTask.template.slice(0,day.outputTask.requiredSentenceCount)}])));
export const week20to22SceneGoalsByDayId:Record<string,SceneGoal>=Object.fromEntries(week20to22.flatMap(week=>week.days.map(day=>[day.id,{id:slug(day.title),title:day.title,capability:`I can ${day.goal.toLowerCase()}`,templates:day.outputTask.template,guidedPrompts:day.outputTask.prompts,scenePrompt:day.outputTask.storyPrompt??'',dialoguePrompts:[`Ask and answer about ${day.title}.`]}])));
export const week20to22SceneRemixTasksByDayId:Record<string,SceneRemixTask[]>=Object.fromEntries(week20to22.flatMap(week=>week.days.map(day=>[day.id,[{id:`${day.id}-remix-${slug(day.title)}`,type:'replace',prompt:`Change one sentence with ${day.wordIds[0]}.`,source:day.outputTask.template[0],referenceAnswers:day.outputTask.template.slice(1,3)}]])));
