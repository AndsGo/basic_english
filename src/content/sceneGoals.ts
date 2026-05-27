import type { SceneGoal } from '../domain/types';

export const sceneGoalsByDayId: Record<string, SceneGoal> = {
  'day-001': {
    id: 'self',
    title: 'Self',
    capability: 'I can describe myself.',
    templates: ['My name is ____.', 'I am from ____.', 'I am a ____.', 'I study English.'],
    guidedPrompts: ['Say your name.', 'Say where you are from.', 'Say what you do.', 'Say why you study English.'],
    scenePrompt: 'Use your sentences to describe yourself clearly.',
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
};
