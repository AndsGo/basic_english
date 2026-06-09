import type { SceneGoal } from '../domain/types';

type SceneGoalDayId =
  | 'day-001'
  | 'day-008'
  | 'day-009'
  | 'day-010'
  | 'day-015'
  | 'day-016'
  | 'day-017'
  | 'day-018'
  | 'day-019'
  | 'day-020'
  | 'day-021'
  | 'day-022'
  | 'day-023'
  | 'day-024'
  | 'day-025'
  | 'day-026'
  | 'day-027'
  | 'day-028'
  | 'day-029'
  | 'day-030'
  | 'day-031'
  | 'day-032'
  | 'day-033'
  | 'day-034'
  | 'day-035'
  | 'day-036'
  | 'day-037'
  | 'day-038'
  | 'day-039'
  | 'day-040'
  | 'day-041'
  | 'day-042';

export const sceneGoalsByDayId: Record<SceneGoalDayId, SceneGoal> = {
  'day-001': {
    id: 'self',
    title: 'Self',
    capability: 'I can say who I am.',
    templates: ['My name is ____.', 'I am from ____.', 'I am a ____.', 'I study English.'],
    guidedPrompts: ['Say your name.', 'Say where you are from.', 'Say what you do.', 'Say why you study English.'],
    scenePrompt: 'Use your sentences to say who you are clearly.',
    dialoguePrompts: ['Ask and answer about your name.', 'Ask and answer about where you are from.'],
  },
  'day-008': {
    id: 'room',
    title: 'Room',
    capability: 'I can describe my room.',
    templates: ['This is my room.', 'My room is ____.', 'I have a ____.', 'There is a ____ in my room.'],
    guidedPrompts: ['Say what your room is.', 'Say if it is big or small.', 'Say what you have.', 'Say one thing in your room.'],
    scenePrompt: 'Use your sentences to describe your room.',
    dialoguePrompts: ['Ask and answer about your room.', 'Ask and answer about one thing in your room.'],
  },
  'day-009': {
    id: 'room-things',
    title: 'Things in My Room',
    capability: 'I can say what things are in my room.',
    templates: ['There is a ____.', 'There are ____.', 'I have a ____ in my room.', 'The ____ is useful.'],
    guidedPrompts: ['Say one thing in your room.', 'Say more than one thing.', 'Say what you have.', 'Say why one thing is useful.'],
    scenePrompt: 'Describe things in your room.',
    dialoguePrompts: ['Ask and answer about things in your room.'],
  },
  'day-010': {
    id: 'where-things-are',
    title: 'Where Things Are',
    capability: 'I can say where things are.',
    templates: ['The ____ is on the ____.', 'The ____ is in the ____.', 'The ____ is under the ____.', 'The ____ is near the ____.'],
    guidedPrompts: ['Say one thing on a table.', 'Say one thing in a bag or box.', 'Say one thing under something.', 'Say one thing near something.'],
    scenePrompt: 'Describe where things are.',
    dialoguePrompts: ['Ask and answer where one thing is.'],
  },
  'day-015': {
    id: 'morning-routine',
    title: 'Morning Order',
    capability: 'I can describe my morning order.',
    templates: ['I get up in the morning.', 'I wash my face.', 'I put on my clothes.', 'I have water.'],
    guidedPrompts: ['Say when you get up.', 'Say what you wash.', 'Say what you put on.', 'Say one thing you have.'],
    scenePrompt: 'Describe what you do in the morning.',
    dialoguePrompts: ['Ask and answer about the morning.', 'Ask and answer about getting ready.'],
  },
  'day-016': {
    id: 'going-to-school-work',
    title: 'Going to School or Work',
    capability: 'I can say where I go and what I take.',
    templates: ['I go to school.', 'I go to work.', 'I take my bag.', 'I walk on the road.'],
    guidedPrompts: ['Say where you go.', 'Say what you take.', 'Say how you go.', 'Say who goes with you.'],
    scenePrompt: 'Describe going to school or work.',
    dialoguePrompts: ['Ask and answer where you go.', 'Ask and answer what you take.'],
  },
  'day-017': {
    id: 'useful-actions',
    title: 'Useful Actions',
    capability: 'I can describe simple useful actions.',
    templates: ['I open the book.', 'I read a book.', 'I write on paper.', 'I use a pen to write.'],
    guidedPrompts: ['Say what you open.', 'Say what you read.', 'Say what you write on.', 'Say what you use.'],
    scenePrompt: 'Describe useful actions with things.',
    dialoguePrompts: ['Ask and answer about using a thing.', 'Ask and answer about a book.'],
  },
  'day-018': {
    id: 'time-of-day',
    title: 'Time of Day',
    capability: 'I can describe actions at different times of day.',
    templates: ['In the morning, I get up.', 'In the afternoon, I study.', 'In the evening, I read.', 'At night, I sleep.'],
    guidedPrompts: ['Say a morning action.', 'Say an afternoon action.', 'Say an evening action.', 'Say a night action.'],
    scenePrompt: 'Describe your day by time.',
    dialoguePrompts: ['Ask and answer about morning.', 'Ask and answer about evening.'],
  },
  'day-019': {
    id: 'action-order',
    title: 'Action Order',
    capability: 'I can put simple actions in order.',
    templates: ['First, I open the book.', 'Then I read.', 'Next, I write.', 'Last, I close the book.'],
    guidedPrompts: ['Say the first action.', 'Say the next action.', 'Say another action.', 'Say the last action.'],
    scenePrompt: 'Describe actions in order.',
    dialoguePrompts: ['Ask and answer what comes first.', 'Ask and answer what comes last.'],
  },
  'day-020': {
    id: 'everyday-habits',
    title: 'Every Day Habits',
    capability: 'I can describe simple habits.',
    templates: ['I practice English every day.', 'I often read.', 'I sometimes walk.', 'This is a good habit.'],
    guidedPrompts: ['Say what you practice.', 'Say what you often do.', 'Say what you sometimes do.', 'Say one good habit.'],
    scenePrompt: 'Describe your every day habits.',
    dialoguePrompts: ['Ask and answer about practice.', 'Ask and answer about habits.'],
  },
  'day-021': {
    id: 'normal-day',
    title: 'One Normal Day',
    capability: 'I can describe one normal day.',
    templates: ['I get up in the morning.', 'I go to school.', 'In the afternoon, I study.', 'In the evening, I am at home.'],
    guidedPrompts: ['Say what you do in the morning.', 'Say where you go.', 'Say what you do in the afternoon.', 'Say where you are in the evening.'],
    scenePrompt: 'Describe one normal day from morning to evening.',
    dialoguePrompts: ['Ask and answer about one normal day.', 'Ask and answer about home and school.'],
  },
  'day-022': {
    id: 'food-and-drink',
    title: 'Food and Drink',
    capability: 'I can describe simple food and drink.',
    templates: ['I eat bread.', 'I drink milk.', 'I eat rice.', 'I have fruit.'],
    guidedPrompts: ['Say one food you eat.', 'Say one drink.', 'Say another food.', 'Say one thing you have.'],
    scenePrompt: 'Describe food and drink on a table.',
    dialoguePrompts: ['Ask and answer about food.', 'Ask and answer about drink.'],
  },
  'day-023': {
    id: 'want-and-need',
    title: 'Want and Need',
    capability: 'I can say what I want and need.',
    templates: ['I want some water.', 'I need food.', 'I need help.', 'Please help me.'],
    guidedPrompts: ['Say what you want.', 'Say what you need.', 'Say when you need help.', 'Ask politely.'],
    scenePrompt: 'Describe wants and needs.',
    dialoguePrompts: ['Ask and answer what you need.', 'Ask and answer how to help.'],
  },
  'day-024': {
    id: 'simple-shopping',
    title: 'Simple Shopping',
    capability: 'I can describe simple shopping.',
    templates: ['I go to the shop.', 'I buy bread.', 'I get milk from the shop.', 'I have money.'],
    guidedPrompts: ['Say where you go.', 'Say what you buy.', 'Say what you get.', 'Say what you have.'],
    scenePrompt: 'Describe buying simple things at a shop.',
    dialoguePrompts: ['Ask and answer about the shop.', 'Ask and answer what you buy.'],
  },
  'day-025': {
    id: 'money-and-price',
    title: 'Money and Price',
    capability: 'I can talk about price and paying.',
    templates: ['I buy food.', 'The price is good.', 'I pay for food.', 'I get change.'],
    guidedPrompts: ['Say what you buy.', 'Say if the price is good.', 'Say what you pay for.', 'Say what change you get.'],
    scenePrompt: 'Describe price and paying at a shop.',
    dialoguePrompts: ['Ask and answer about price.', 'Ask and answer about paying.'],
  },
  'day-026': {
    id: 'asking-for-help',
    title: 'Asking for Help',
    capability: 'I can ask for simple help.',
    templates: ['Please help me.', 'Can you show me the book?', 'Can you bring me the book?', 'I ask for help.'],
    guidedPrompts: ['Ask for help.', 'Ask a person to show a thing.', 'Ask a person to bring a thing.', 'Say what you ask for.'],
    scenePrompt: 'Ask another person for simple help.',
    dialoguePrompts: ['Ask and answer about help.', 'Ask and answer about showing a thing.'],
  },
  'day-027': {
    id: 'amount-and-quality',
    title: 'Amount and Quality',
    capability: 'I can describe amount and quality.',
    templates: ['I need more water.', 'I have enough food.', 'The cup is empty.', 'The food is good.'],
    guidedPrompts: ['Say what you need more of.', 'Say what is enough.', 'Say if a cup is full or empty.', 'Say if food is good.'],
    scenePrompt: 'Describe amount and quality.',
    dialoguePrompts: ['Ask and answer about more.', 'Ask and answer about enough.'],
  },
  'day-028': {
    id: 'meal-shopping-check',
    title: 'Meal and Shopping Week',
    capability: 'I can describe a meal and shopping scene.',
    templates: ['I go to the shop.', 'I buy food.', 'I need help.', 'Please help me.'],
    guidedPrompts: ['Say where you go.', 'Say what you buy.', 'Say what you need.', 'Ask politely.'],
    scenePrompt: 'Describe a simple meal and shopping scene.',
    dialoguePrompts: ['Ask and answer about food.', 'Ask and answer about help at a shop.'],
  },
  'day-029': {
    id: 'getting-ready-to-go-out',
    title: 'Getting Ready to Go Out',
    capability: 'I can say how I get ready to go out.',
    templates: ['I am ready.', 'I have my bag.', 'I have a list.', 'I go outside.'],
    guidedPrompts: ['Say you are ready.', 'Say what you have.', 'Say what is on your list.', 'Say you go outside.'],
    scenePrompt: 'Describe getting ready and going outside.',
    dialoguePrompts: ['Ask and answer about being ready.', 'Ask and answer about the list.'],
  },
  'day-030': {
    id: 'walking-to-the-bus-place',
    title: 'Walking to the Bus Place',
    capability: 'I can say how I walk to the bus place.',
    templates: ['I walk on the road.', 'The bus place is near.', 'I am waiting for the bus.', 'The seat is here.'],
    guidedPrompts: ['Say where you walk.', 'Say where the bus place is.', 'Say what you are waiting for.', 'Say where the seat is.'],
    scenePrompt: 'Describe walking to the bus place and waiting.',
    dialoguePrompts: ['Ask and answer about the bus place.', 'Ask and answer about waiting for the bus.'],
  },
  'day-031': {
    id: 'taking-the-bus',
    title: 'Taking the Bus',
    capability: 'I can describe taking the bus.',
    templates: ['I go by bus.', 'I am on the bus.', 'I am on a seat.', 'I get off at the store.'],
    guidedPrompts: ['Say how you go.', 'Say where you are.', 'Say where your seat is.', 'Say where you get off.'],
    scenePrompt: 'Describe taking the bus to the store.',
    dialoguePrompts: ['Ask and answer about going by bus.', 'Ask and answer about the seat.'],
  },
  'day-032': {
    id: 'finding-things-in-store',
    title: 'Finding Things in the Store',
    capability: 'I can find things in a store.',
    templates: ['I am in the store.', 'I find bread.', 'I find milk.', 'The thing is here.'],
    guidedPrompts: ['Say where you are.', 'Say one thing you find.', 'Say another thing you find.', 'Say where the thing is.'],
    scenePrompt: 'Describe finding things in a store.',
    dialoguePrompts: ['Ask and answer about one thing in the store.', 'Ask and answer where a thing is.'],
  },
  'day-033': {
    id: 'waiting-and-paying',
    title: 'Waiting and Paying',
    capability: 'I can be in line and pay in a store.',
    templates: ['I am in line.', 'I am waiting in line.', 'I pay for food.', 'I get change.'],
    guidedPrompts: ['Say where you are.', 'Say you are waiting in line.', 'Say what you pay for.', 'Say what you get.'],
    scenePrompt: 'Describe waiting and paying in a store.',
    dialoguePrompts: ['Ask and answer about the line.', 'Ask and answer about paying.'],
  },
  'day-034': {
    id: 'coming-back-home',
    title: 'Coming Back Home',
    capability: 'I can say how I come back home.',
    templates: ['I carry my bag.', 'The bag is light.', 'I go back home.', 'I put food on the table.'],
    guidedPrompts: ['Say what you carry.', 'Say if the bag is light.', 'Say where you go back.', 'Say where you put the food.'],
    scenePrompt: 'Describe coming back home with things.',
    dialoguePrompts: ['Ask and answer about the bag.', 'Ask and answer about going back home.'],
  },
  'day-035': {
    id: 'errand-story-recap',
    title: 'Going Out Story',
    capability: 'I can tell an outside story.',
    templates: ['I go outside with my list.', 'I take the bus.', 'I buy food at the store.', 'I go back home.'],
    guidedPrompts: ['Say how the story starts.', 'Say how you go.', 'Say what you buy.', 'Say how the story ends.'],
    scenePrompt: 'Tell a simple outside story from home to the store and back home.',
    dialoguePrompts: ['Ask and answer about the outside story.', 'Ask and answer what comes first and last.'],
  },
  'day-036': {
    id: 'early-late-bus',
    title: 'Early and Late',
    capability: 'I can say early, late, and waiting time.',
    templates: ['I am early.', 'I am late.', 'I am waiting for the bus.', 'The bus is late.'],
    guidedPrompts: ['Say if you are early.', 'Say if you are late.', 'Say what you are waiting for.', 'Say the bus time.'],
    scenePrompt: 'Describe waiting for the bus early or late.',
    dialoguePrompts: ['Ask and answer about the bus time.', 'Ask and answer about being early or late.'],
  },
  'day-037': {
    id: 'no-clear-way',
    title: 'No Clear Way',
    capability: 'I can ask for help when the way is not clear.',
    templates: ['The way is not clear.', 'I need another way.', 'Please help me.', 'The way is clear.'],
    guidedPrompts: ['Say the way is not clear.', 'Say you need another way.', 'Ask for help.', 'Say when the way is clear.'],
    scenePrompt: 'Describe a way that is not clear and ask for help.',
    dialoguePrompts: ['Ask and answer about the way.', 'Ask and answer about another way.'],
  },
  'day-038': {
    id: 'wrong-way',
    title: 'Wrong Way',
    capability: 'I can change from a wrong way to another way.',
    templates: ['This way is wrong.', 'I need another way.', 'I go straight.', 'I turn right.'],
    guidedPrompts: ['Say this way is wrong.', 'Say you need another way.', 'Say you go straight.', 'Say where you turn.'],
    scenePrompt: 'Describe a wrong way and another way.',
    dialoguePrompts: ['Ask and answer about the wrong way.', 'Ask and answer about turning.'],
  },
  'day-039': {
    id: 'repeat-please',
    title: 'Repeat Please',
    capability: 'I can ask a person to repeat.',
    templates: ['I do not understand.', 'Please repeat.', 'I understand now.', 'Please help me.'],
    guidedPrompts: ['Say you do not understand.', 'Ask the person to repeat.', 'Say you understand now.', 'Ask for help.'],
    scenePrompt: 'Ask a person to repeat in a help talk.',
    dialoguePrompts: ['Ask and answer with please repeat.', 'Ask and answer when you do not understand.'],
  },
  'day-040': {
    id: 'ask-again',
    title: 'Ask Again',
    capability: 'I can ask again when I do not understand.',
    templates: ['I do not understand.', 'Please repeat.', 'Say it again, please.', 'I understand now.'],
    guidedPrompts: ['Say you do not understand.', 'Ask the person to repeat.', 'Ask again with please.', 'Say you understand now.'],
    scenePrompt: 'Ask again in a simple help talk.',
    dialoguePrompts: ['Ask and answer with please repeat.', 'Ask and answer when something is not clear.'],
  },
  'day-041': {
    id: 'polite-help',
    title: 'Kind Help',
    capability: 'I can use kind words when I need help.',
    templates: ['Excuse me.', 'I am sorry.', 'Please help me.', 'You are kind.'],
    guidedPrompts: ['Start with kind words.', 'Say sorry.', 'Ask for help.', 'Say the person is kind.'],
    scenePrompt: 'Use kind words to ask for help outside.',
    dialoguePrompts: ['Ask and answer with excuse me.', 'Ask and answer with please and kind words.'],
  },
  'day-042': {
    id: 'problem-story-recap',
    title: 'Problem Story',
    capability: 'I can tell a simple outside problem story.',
    templates: ['The way is not clear.', 'This way is wrong.', 'I need another way.', 'Please repeat.', 'I understand.', 'I am kind.'],
    guidedPrompts: ['Say the way is not clear.', 'Say this way is wrong.', 'Say you need another way.', 'Ask the person to repeat.', 'Say you understand.', 'Say you are kind.'],
    scenePrompt: 'Tell the outside problem story in order with kind words.',
    dialoguePrompts: ['Ask and answer about the way problem.', 'Ask and answer with please repeat and kind words.'],
  },
};
