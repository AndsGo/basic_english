import week17Image from '../assets/picture-describe/day-113-light-color-look.png';
import week18Image from '../assets/picture-describe/day-120-clothes-personal-things.png';
import week19Image from '../assets/picture-describe/day-127-kitchen-food-detail.png';
import type { PictureDescribeTask, SceneGoal, SceneRemixTask } from '../domain/types';
import { week17to19 } from './week17to19';

const images=[week17Image,week18Image,week19Image];
const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const week17to19PictureDescribeTasksByDayId:Record<string,PictureDescribeTask>=Object.fromEntries(week17to19.flatMap((week,index)=>week.days.map(day=>[day.id,{id:`picture-${day.id}-${slug(day.title)}`,dayId:day.id,title:day.title,goal:day.goal,image:images[index],targetWords:day.wordIds.slice(0,4),suggestedPatterns:day.outputTask.template.slice(0,3),requiredSentenceCount:day.outputTask.requiredSentenceCount,simpleVersion:day.outputTask.template.slice(0,day.outputTask.requiredSentenceCount)}])));
export const week17to19SceneGoalsByDayId:Record<string,SceneGoal>=Object.fromEntries(week17to19.flatMap(week=>week.days.map(day=>[day.id,{id:slug(day.title),title:day.title,capability:`I can ${day.goal.toLowerCase()}`,templates:day.outputTask.template,guidedPrompts:day.outputTask.prompts,scenePrompt:day.outputTask.storyPrompt??'',dialoguePrompts:[`Ask and answer about ${day.title}.`]}])));
export const week17to19SceneRemixTasksByDayId:Record<string,SceneRemixTask[]>=Object.fromEntries(week17to19.flatMap(week=>week.days.map(day=>[day.id,[{id:`${day.id}-remix-${slug(day.title)}`,type:'replace',prompt:`Change one sentence with ${day.wordIds[0]}.`,source:day.outputTask.template[0],referenceAnswers:day.outputTask.template.slice(1,3)}]])));
