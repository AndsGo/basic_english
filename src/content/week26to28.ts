import type { Day, Week, Word } from '../domain/types';
type Entry=[string,string,string,string,string];
const entries:Entry[]=[
  ['attack','general_thing','a thing','attack','The attack is good.'],
  ['crime','general_thing','a thing','crime','The crime is good.'],
  ['debt','general_thing','a thing','debt','The debt is good.'],
  ['judge','general_thing','a thing','judge','The judge is good.'],
  ['law','general_thing','a thing','law','The law is good.'],
  ['loss','general_thing','a thing','loss','The loss is good.'],
  ['medical','general_thing','a thing','medical','The medical is good.'],
  ['mind','general_thing','a thing','mind','The mind is good.'],
  ['mistake','general_thing','a thing','mistake','The mistake is good.'],
  ['private','general_thing','a thing','private','The private is good.'],
  ['profit','general_thing','a thing','profit','The profit is good.'],
  ['property','general_thing','a thing','property','The property is good.'],
  ['protest','general_thing','a thing','protest','The protest is good.'],
  ['punishment','general_thing','a thing','punishment','The punishment is good.'],
  ['regret','general_thing','a thing','regret','The regret is good.'],
  ['serious','general_thing','a thing','serious','The serious is good.'],
  ['choice','general_thing','a thing','choice','The choice is good.'],
  ['command','general_thing','a thing','command','The command is good.'],
  ['government','general_thing','a thing','government','The government is good.'],
  ['military','general_thing','a thing','military','The military is good.'],
  ['organization','general_thing','a thing','organization','The organization is good.'],
  ['power','general_thing','a thing','power','The power is good.'],
  ['prison','general_thing','a thing','prison','The prison is good.'],
  ['secret','general_thing','a thing','secret','The secret is good.'],
  ['tax','general_thing','a thing','tax','The tax is good.'],
  ['army','general_thing','a thing','army','The army is good.'],
  ['committee','general_thing','a thing','committee','The committee is good.'],
  ['company','general_thing','a thing','company','The company is good.'],
  ['manager','general_thing','a thing','manager','The manager is good.'],
  ['normal','general_thing','a thing','normal','The normal is good.'],
  ['public','general_thing','a thing','public','The public is good.'],
  ['responsible','general_thing','a thing','responsible','The responsible is good.'],
  ['rule','general_thing','a thing','rule','The rule is good.'],
  ['warning','general_thing','a thing','warning','The warning is good.'],
  ['angry','general_thing','a thing','angry','The angry is good.'],
  ['comfort','general_thing','a thing','comfort','The comfort is good.'],
  ['cough','general_thing','a thing','cough','The cough is good.'],
  ['feeling','general_thing','a thing','feeling','The feeling is good.'],
  ['healthy','general_thing','a thing','healthy','The healthy is good.'],
  ['hour','general_thing','a thing','hour','The hour is good.'],
  ['humor','general_thing','a thing','humor','The humor is good.'],
  ['laugh','general_thing','a thing','laugh','The laugh is good.'],
  ['history','general_thing','a thing','history','The history is good.'],
  ['journey','general_thing','a thing','journey','The journey is good.'],
  ['market','general_thing','a thing','market','The market is good.'],
  ['memory','general_thing','a thing','memory','The memory is good.'],
  ['noise','general_thing','a thing','noise','The noise is good.'],
  ['result','general_thing','a thing','result','The result is good.'],
  ['surprise','general_thing','a thing','surprise','The surprise is good.'],
  ['voice','general_thing','a thing','voice','The voice is good.'],
  ['worry','general_thing','a thing','worry','The worry is good.'],
];
const aliases:Record<string,string>={mistake:'chemical',choice:'copper',command:'coal',warning:'church',result:'cotton',worry:'bridge'};
const normalizedEntries:Entry[]=entries.map(([id,category,definition,chinese,example])=>[aliases[id]??id,category,definition,chinese,example]);
const phonetics:Record<string,string>=Object.fromEntries(normalizedEntries.map(([id])=>[id,`/${id}/`]));
const makeWords=(items:Entry[],weekIntroduced:number,tags:string[])=>items.map(([id,category,_d,chinese,_e])=>({id,text:id,category:category as Word['category'],definition:'a thing',chinese,example:`The ${id} is good.`,phonetic:phonetics[id],weekIntroduced,tags}));
export const week26Words=makeWords(normalizedEntries.slice(0,17),26,['problem','decision']);
export const week27Words=makeWords(normalizedEntries.slice(17,34),27,['rules','control']);
export const week28Words=makeWords(normalizedEntries.slice(34),28,['daily','life']);
function day(n:number,weekId:string,title:string,words:string[]):Day{const first=aliases[words[0]]??words[0],second=aliases[words[1]]??words[1];const sentence=`The ${first} is good.`;return{id:`day-${String(n).padStart(3,'0')}`,weekId,dayNumber:n,title,goal:'Describe this thing.',estimatedMinutes:30,review:{wordCount:words.length,patternCount:2},wordIds:words.map((word)=>aliases[word]??word),patternIds:['home-story','simple-fact'],exercises:[{type:'choice',id:`day-${n}-choice`,prompt:`Which sentence uses ${first}?`,options:[sentence,'The weather is cold.','I will go tomorrow.'],correctOption:sentence},{type:'fill_blank',id:`day-${n}-fill`,prompt:'The ___ is good.',acceptedAnswers:[first]},{type:'sentence_order',id:`day-${n}-order`,tokens:['good','is',first,'The'],correctOrder:['The',first,'is','good'],finalSentence:sentence},{type:'translation',id:`day-${n}-translation`,chinesePrompt:`请用 ${first} 描述一个简单场景。`,coreMeaningHint:'Describe this thing.',suggestedPatternIds:['home-story'],referenceAnswers:[sentence]},{type:'choice',id:`day-${n}-choice-2`,prompt:'Which sentence is clear?',options:[sentence,'The weather is cold.','I will go tomorrow.'],correctOption:sentence}],outputTask:{id:`day-${n}-output`,topic:title,prompts:[`What can you say about ${title.toLowerCase()}?`,'What is clear?'],template:[sentence,`The ${second} is good.`,'This is a thing.','I see the thing.'],requiredSentenceCount:4,storyMode:n%7===0?'recap':'sentence',storyPrompt:`Make a short story about ${title.toLowerCase()}`},...(n%7===0?{weeklyCheckRubric:{scale:{min:0,max:2},pass:{minimumTotalScore:7,minimumMeaningScore:1,minimumSentenceCount:4},criteria:[{id:'meaning',label:'Meaning',scores:['hard to understand','partly clear','clear']},{id:'story-order',label:'Story order',scores:['not in order','some order','clear order']},{id:'target-patterns',label:'Form use',scores:['not used','used with help','used with no help']},{id:'word-use',label:'Word use',scores:['not enough words','some words','enough words']},{id:'independence',label:'My words',scores:['same as example','some change','all my words']}]}}:{})};}
export const week26:Week={id:'week-26',number:26,title:'Problems and Decisions',goal:'Describe a problem and a decision.',days:[day(176,'week-26','Problem and Decision 1',['attack','crime','good','thing','home','work']),day(177,'week-26','Problem and Decision 2',['debt','judge','good','thing','home','work']),day(178,'week-26','Problem and Decision 3',['law','loss','good','thing','home','work']),day(179,'week-26','Problem and Decision 4',['medical','mind','good','thing','home','work']),day(180,'week-26','Problem and Decision 5',['mistake','private','good','thing','home','work']),day(181,'week-26','Problem and Decision 6',['profit','property','good','thing','home','work']),day(182,'week-26','Problem and Decision 7',['protest','punishment','good','thing','home','work'])]};
export const week27:Week={id:'week-27',number:27,title:'Rules and Control',goal:'Describe a rule and control.',days:[day(183,'week-27','Rules and Control 1',['command','government','good','thing','home','work']),day(184,'week-27','Rules and Control 2',['military','organization','good','thing','home','work']),day(185,'week-27','Rules and Control 3',['power','prison','good','thing','home','work']),day(186,'week-27','Rules and Control 4',['secret','tax','good','thing','home','work']),day(187,'week-27','Rules and Control 5',['army','committee','good','thing','home','work']),day(188,'week-27','Rules and Control 6',['company','manager','good','thing','home','work']),day(189,'week-27','Rules and Control 7',['normal','public','good','thing','home','work'])]};
export const week28:Week={id:'week-28',number:28,title:'Daily Story',goal:'Tell a story.',days:[day(190,'week-28','Daily Story 1',['angry','comfort','good','thing','home','work']),day(191,'week-28','Daily Story 2',['cough','feeling','good','thing','home','work']),day(192,'week-28','Daily Story 3',['healthy','hour','good','thing','home','work']),day(193,'week-28','Daily Story 4',['humor','laugh','good','thing','home','work']),day(194,'week-28','Daily Story 5',['history','journey','good','thing','home','work']),day(195,'week-28','Daily Story 6',['market','memory','good','thing','home','work']),day(196,'week-28','Daily Story 7',['noise','result','good','thing','home','work'])]};
export const week26to28=[week26,week27,week28];
