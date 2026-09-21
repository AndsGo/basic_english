export type OrderPresentation = {
  routine: string;
  steps: readonly string[];
  currentStep: number;
  scene: string;
};

export const orderPresentations: Partial<Record<string, OrderPresentation>> = {
  first: {
    routine: 'Going out',
    steps: ['Put on clothes.', 'Open the door.', 'Go outside.', 'Go to school.'],
    currentStep: 0,
    scene: 'A child puts on clothes before going out.',
  },
  then: {
    routine: 'Going out',
    steps: ['Put on clothes.', 'Open the door.', 'Go outside.', 'Go to school.'],
    currentStep: 1,
    scene: 'A child opens the door after putting on clothes.',
  },
  next: {
    routine: 'Going out',
    steps: ['Put on clothes.', 'Open the door.', 'Go outside.', 'Go to school.'],
    currentStep: 2,
    scene: 'A child goes outside after opening the door.',
  },
  last: {
    routine: 'Going out',
    steps: ['Put on clothes.', 'Open the door.', 'Go outside.', 'Go to school.'],
    currentStep: 3,
    scene: 'A child goes to school at the end of the routine.',
  },
};
