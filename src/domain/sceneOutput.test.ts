import { describe, expect, it } from 'vitest';
import {
  createInitialSceneOutput,
  getCompletedSceneIds,
  getSceneOutputCompletion,
  normalizeSceneOutput,
} from './sceneOutput';

describe('scene output helpers', () => {
  it('creates an empty template-mode scene output', () => {
    expect(createInitialSceneOutput('self')).toEqual({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['', '', '', ''],
      sceneText: '',
      dialogue: '',
    });
  });

  it('requires four sentences, scene text, and dialogue', () => {
    const result = getSceneOutputCompletion({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', ''],
      sceneText: '',
      dialogue: '',
    });

    expect(result).toEqual({
      isComplete: false,
      missingRequirements: [
        'Write at least 4 scene sentences.',
        'Write the scene description.',
        'Write the dialogue.',
      ],
    });
  });

  it('accepts complete scene output', () => {
    const result = getSceneOutputCompletion({
      sceneId: 'self',
      helpMode: 'guided',
      sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
      sceneText: 'My name is Li. I am from China. I am a student. I study English.',
      dialogue: 'A: What is your name?\nB: My name is Li.',
    });

    expect(result).toEqual({ isComplete: true, missingRequirements: [] });
  });

  it('normalizes partially missing stored scene output', () => {
    expect(
      normalizeSceneOutput({
        sceneId: 'self',
        sentences: ['My name is Li.'],
      }),
    ).toEqual({
      sceneId: 'self',
      helpMode: 'template',
      sentences: ['My name is Li.', '', '', ''],
      sceneText: '',
      dialogue: '',
    });
  });

  it('preserves stored scene outputs with more than six sentences', () => {
    expect(
      normalizeSceneOutput({
        sceneId: 'self',
        sentences: ['One.', 'Two.', 'Three.', 'Four.', 'Five.', 'Six.', 'Seven.'],
      }).sentences,
    ).toEqual(['One.', 'Two.', 'Three.', 'Four.', 'Five.', 'Six.', 'Seven.']);
  });

  it('returns completed scene ids only for completed days with complete scene output', () => {
    const sceneIds = getCompletedSceneIds(
      [
        { dayId: 'day-001', status: 'completed', currentStep: 'done' },
        { dayId: 'day-008', status: 'in_progress', currentStep: 'output' },
      ],
      [
        {
          dayId: 'day-001',
          scene: {
            sceneId: 'self',
            helpMode: 'template',
            sentences: ['My name is Li.', 'I am from China.', 'I am a student.', 'I study English.'],
            sceneText: 'My name is Li. I am from China.',
            dialogue: 'A: What is your name?\nB: My name is Li.',
          },
        },
        {
          dayId: 'day-008',
          scene: {
            sceneId: 'room',
            helpMode: 'template',
            sentences: ['This is my room.', 'My room is small.', 'I have a bed.', 'There is a table.'],
            sceneText: 'This is my room.',
            dialogue: 'A: Is this your room?\nB: Yes.',
          },
        },
      ],
    );

    expect(sceneIds).toEqual(['self']);
  });
});
