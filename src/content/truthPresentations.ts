export type TruthPresentation = {
  statement: string;
  answer: string;
  scene: string;
};

export const truthPresentations: Partial<Record<string, TruthPresentation>> = {
  true: {
    statement: 'The cat is in the basket.',
    answer: 'True. The cat is in the basket.',
    scene: 'A sleeping orange cat in a blue basket.',
  },
  false: {
    statement: 'The cat is in the basket.',
    answer: 'False. The cat is not in the basket.',
    scene: 'An awake orange cat beside an empty blue basket.',
  },
};
