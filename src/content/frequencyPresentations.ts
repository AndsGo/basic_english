export type FrequencyPresentation = {
  action: string;
  meaning: string;
  scene: string;
  occasions: readonly boolean[];
};

export const frequencyPresentations: Partial<Record<string, FrequencyPresentation>> = {
  always: {
    action: 'Study in the morning',
    meaning: 'Every time.',
    scene: 'A person studying at a desk in the morning.',
    occasions: [true, true, true, true, true, true, true],
  },
  usually: {
    action: 'Go by bus',
    meaning: 'Most times.',
    scene: 'A person getting on a bus.',
    occasions: [true, true, true, false, true, true, true],
  },
  often: {
    action: 'Read',
    meaning: 'Many times.',
    scene: 'A person reading a book in a comfortable chair.',
    occasions: [true, false, true, true, false, true, false],
  },
  sometimes: {
    action: 'Walk to school',
    meaning: 'Some times, but not always.',
    scene: 'A person with a school bag walking to school.',
    occasions: [false, true, false, false, true, false, false],
  },
  never: {
    action: 'Sleep at school',
    meaning: 'Not at any time.',
    scene: 'A student sitting awake and attentive in a classroom.',
    occasions: [false, false, false, false, false, false, false],
  },
};
