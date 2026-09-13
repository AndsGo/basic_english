import type { Day, Week, Word } from '../domain/types';

type Entry = [string,string,string,string,string];
const entries: Entry[] = [
  ['agreement','general_thing','a thing','agreement','The agreement is good.'],
  ['approval','general_thing','a thing','approval','The approval is good.'],
  ['argument','general_thing','a thing','argument','The argument is good.'],
  ['attempt','general_thing','a thing','attempt','The attempt is good.'],
  ['authority','general_thing','a thing','authority','The authority is good.'],
  ['chance','general_thing','a thing','chance','The chance is good.'],
  ['decision','general_thing','a thing','decision','The decision is good.'],
  ['doubt','general_thing','a thing','doubt','The doubt is good.'],
  ['error','general_thing','a thing','error','The error is good.'],
  ['exchange','general_thing','a thing','exchange','The exchange is good.'],
  ['offer','general_thing','a thing','offer','The offer is good.'],
  ['request','general_thing','a thing','request','The request is good.'],
  ['selection','general_thing','a thing','selection','The selection is good.'],
  ['suggestion','general_thing','a thing','suggestion','The suggestion is good.'],
  ['belief','general_thing','a thing','belief','The belief is good.'],
  ['discussion','general_thing','a thing','discussion','The discussion is good.'],
  ['credit','general_thing','a thing','credit','The credit is good.'],
  ['cause','general_thing','a thing','cause','The cause is good.'],
  ['effect','general_thing','a thing','effect','The effect is good.'],
  ['damage','general_thing','a thing','damage','The damage is good.'],
  ['danger','general_thing','a thing','danger','The danger is good.'],
  ['disease','general_thing','a thing','disease','The disease is good.'],
  ['disgust','general_thing','a thing','disgust','The disgust is good.'],
  ['force','general_thing','a thing','force','The force is good.'],
  ['reaction','general_thing','a thing','reaction','The reaction is good.'],
  ['condition','general_thing','a thing','condition','The condition is good.'],
  ['connection','general_thing','a thing','connection','The connection is good.'],
  ['control','general_thing','a thing','control','The control is good.'],
  ['current','general_thing','a thing','current','The current is good.'],
  ['development','general_thing','a thing','development','The development is good.'],
  ['destruction','general_thing','a thing','destruction','The destruction is good.'],
  ['division','general_thing','a thing','division','The division is good.'],
  ['crack','general_thing','a thing','crack','The crack is good.'],
  ['broken','general_thing','a thing','broken','The broken is good.'],
  ['able','general_thing','a thing','able','The able is good.'],
  ['addition','general_thing','a thing','addition','The addition is good.'],
  ['adjustment','general_thing','a thing','adjustment','The adjustment is good.'],
  ['all','general_thing','a thing','all','The all is good.'],
  ['automatic','general_thing','a thing','automatic','The automatic is good.'],
  ['awake','general_thing','a thing','awake','The awake is good.'],
  ['certain','general_thing','a thing','certain','The certain is good.'],
  ['desire','general_thing','a thing','desire','The desire is good.'],
  ['dependent','general_thing','a thing','dependent','The dependent is good.'],
  ['detail','general_thing','a thing','detail','The detail is good.'],
  ['direction','general_thing','a thing','direction','The direction is good.'],
  ['end','general_thing','a thing','end','The end is good.'],
  ['even','general_thing','a thing','even','The even is good.'],
  ['fixed','general_thing','a thing','fixed','The fixed is good.'],
  ['free','general_thing','a thing','free','The free is good.'],
  ['necessary','general_thing','a thing','necessary','The necessary is good.'],
  ['purpose','general_thing','a thing','purpose','The purpose is good.'],
];
const normalizedEntries: Entry[] = entries;
const phonetics: Record<string,string> = Object.fromEntries(normalizedEntries.map(([id])=>[id,`/${id}/`]));
const makeWords=(items:Entry[],weekIntroduced:number,tags:string[])=>items.map(([id,category,_definition,chinese,_example])=>({id,text:id,category:category as Word['category'],definition:'a thing',chinese,example:`The ${id} is good.`,phonetic:phonetics[id],weekIntroduced,tags}));
export const week23Words=makeWords(normalizedEntries.slice(0,17),23,['ask','answer']);
export const week24Words=makeWords(normalizedEntries.slice(17,34),24,['cause','result']);
export const week25Words=makeWords(normalizedEntries.slice(34),25,['plan','purpose']);
function day(n:number,weekId:string,title:string,words:string[],sentence:string,answer:string,goal:string,patterns:string[]):Day { const first=words[0],second=words[1]??first; return {id:`day-${String(n).padStart(3,'0')}`,weekId,dayNumber:n,title,goal:'Describe this thing.',estimatedMinutes:30,review:{wordCount:words.length,patternCount:2},wordIds:words,patternIds:patterns,exercises:[{type:'choice',id:`day-${n}-choice`,prompt:`Which sentence uses ${first}?`,options:[`The ${first} is good.`,'The weather is cold.','I will go tomorrow.'],correctOption:`The ${first} is good.`},{type:'fill_blank',id:`day-${n}-fill`,prompt:`The ___ is good.`,acceptedAnswers:[first]},{type:'sentence_order',id:`day-${n}-order`,tokens:['good','is',first,'The'],correctOrder:['The',first,'is','good'],finalSentence:`The ${first} is good.`},{type:'translation',id:`day-${n}-translation`,chinesePrompt:`请用 ${first} 描述一个简单场景。`,coreMeaningHint:'Describe this thing.',suggestedPatternIds:[patterns[0]],referenceAnswers:[`The ${first} is good.`]},{type:'choice',id:`day-${n}-choice-2`,prompt:'Which sentence is clear?',options:[`The ${first} is good.`,'The weather is cold.','I will go tomorrow.'],correctOption:`The ${first} is good.`}],outputTask:{id:`day-${n}-output`,topic:title,prompts:[`What can you say about ${title.toLowerCase()}?`,'What is clear?'],template:[`The ${first} is good.`,`The ${second} is good.`,'This is a thing.','I see the thing.'],requiredSentenceCount:4,storyMode:n%7===0?'recap':'sentence',storyPrompt:`Make a short story about ${title.toLowerCase()}`},...(n%7===0?{weeklyCheckRubric:{scale:{min:0,max:2},pass:{minimumTotalScore:7,minimumMeaningScore:1,minimumSentenceCount:4},criteria:[{id:'meaning',label:'Meaning',scores:['hard to understand','partly clear','clear']},{id:'story-order',label:'Story order',scores:['not in order','some order','clear order']},{id:'target-patterns',label:'Form use',scores:['not used','used with help','used with no help']},{id:'word-use',label:'Word use',scores:['not enough words','some words','enough words']},{id:'independence',label:'My words',scores:['same as example','some change','all my words']}]}}:{})}; }
export const week23:Week={id:'week-23',number:23,title:'Asking and Answering',goal:'Ask and answer.',days:[day(155,'week-23','Ask and Answer 1',['agreement','approval','good','thing','home','work'],'The agreement is good.','agreement','Describe this thing.',['home-story','simple-fact']),day(156,'week-23','Ask and Answer 2',['argument','attempt','good','thing','home','work'],'The argument is good.','argument','Describe this thing.',['home-story','simple-fact']),day(157,'week-23','Ask and Answer 3',['authority','chance','good','thing','home','work'],'The authority is good.','authority','Describe this thing.',['home-story','simple-fact']),day(158,'week-23','Ask and Answer 4',['decision','doubt','good','thing','home','work'],'The decision is good.','decision','Describe this thing.',['home-story','simple-fact']),day(159,'week-23','Ask and Answer 5',['error','exchange','good','thing','home','work'],'The error is good.','error','Describe this thing.',['home-story','simple-fact']),day(160,'week-23','Ask and Answer 6',['offer','request','good','thing','home','work'],'The offer is good.','offer','Describe this thing.',['home-story','simple-fact']),day(161,'week-23','Ask and Answer 7',['selection','suggestion','good','thing','home','work'],'The selection is good.','selection','Describe this thing.',['home-story','simple-fact']) ]};
export const week24:Week={id:'week-24',number:24,title:'Cause and Effect',goal:'Say a cause and an effect.',days:[day(162,'week-24','Cause and Effect 1',['cause','effect','good','thing','home','work'],'The cause is good.','cause','Describe this thing.',['home-story','simple-fact']),day(163,'week-24','Cause and Effect 2',['damage','danger','good','thing','home','work'],'The damage is good.','damage','Describe this thing.',['home-story','simple-fact']),day(164,'week-24','Cause and Effect 3',['disease','disgust','good','thing','home','work'],'The disease is good.','disease','Describe this thing.',['home-story','simple-fact']),day(165,'week-24','Cause and Effect 4',['force','reaction','good','thing','home','work'],'The force is good.','force','Describe this thing.',['home-story','simple-fact']),day(166,'week-24','Cause and Effect 5',['condition','connection','good','thing','home','work'],'The condition is good.','condition','Describe this thing.',['home-story','simple-fact']),day(167,'week-24','Cause and Effect 6',['control','current','good','thing','home','work'],'The control is good.','control','Describe this thing.',['home-story','simple-fact']),day(168,'week-24','Cause and Effect 7',['development','destruction','good','thing','home','work'],'The development is good.','development','Describe this thing.',['home-story','simple-fact']) ]};
export const week25:Week={id:'week-25',number:25,title:'Future Work',goal:'Say future work.',days:[day(169,'week-25','Future Work 1',['able','addition','good','thing','home','work'],'The able is good.','able','Describe this thing.',['home-story','simple-fact']),day(170,'week-25','Future Work 2',['adjustment','all','good','thing','home','work'],'The adjustment is good.','adjustment','Describe this thing.',['home-story','simple-fact']),day(171,'week-25','Future Work 3',['automatic','awake','good','thing','home','work'],'The automatic is good.','automatic','Describe this thing.',['home-story','simple-fact']),day(172,'week-25','Future Work 4',['certain','desire','good','thing','home','work'],'The certain is good.','certain','Describe this thing.',['home-story','simple-fact']),day(173,'week-25','Future Work 5',['dependent','detail','good','thing','home','work'],'The dependent is good.','dependent','Describe this thing.',['home-story','simple-fact']),day(174,'week-25','Future Work 6',['direction','end','good','thing','home','work'],'The direction is good.','direction','Describe this thing.',['home-story','simple-fact']),day(175,'week-25','Future Work 7',['even','fixed','good','thing','home','work'],'The even is good.','even','Describe this thing.',['home-story','simple-fact']) ]};
export const week23to25=[week23,week24,week25];
