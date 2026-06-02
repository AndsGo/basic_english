import bagImage from '../assets/word-flashcards/bag.png';
import bedImage from '../assets/word-flashcards/bed.png';
import bookImage from '../assets/word-flashcards/book.png';
import boxImage from '../assets/word-flashcards/box.png';
import chairImage from '../assets/word-flashcards/chair.png';
import cupImage from '../assets/word-flashcards/cup.png';
import doorImage from '../assets/word-flashcards/door.png';
import friendImage from '../assets/word-flashcards/friend.png';
import homeImage from '../assets/word-flashcards/home.png';
import paperImage from '../assets/word-flashcards/paper.png';
import penImage from '../assets/word-flashcards/pen.png';
import phoneImage from '../assets/word-flashcards/phone.png';
import roomImage from '../assets/word-flashcards/room.png';
import studentImage from '../assets/word-flashcards/student.png';
import tableImage from '../assets/word-flashcards/table.png';
import windowImage from '../assets/word-flashcards/window.png';

export const validWordImageKinds = [
  'object',
  'place',
  'person',
  'position',
  'quality',
  'action',
  'structure',
  'time',
  'abstract',
] as const;

export type WordImageKind = (typeof validWordImageKinds)[number];
export type WordImageLabelPolicy = 'none' | 'english-keyword';

export interface WordImageAsset {
  wordId: string;
  image: string;
  kind: WordImageKind;
  labelPolicy: WordImageLabelPolicy;
  prompt: string;
}

export const wordImageAssets: WordImageAsset[] = [
  {
    wordId: 'bag',
    image: bagImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple bag flashcard image for Basic English learners.',
  },
  {
    wordId: 'bed',
    image: bedImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple bed flashcard image for Basic English learners.',
  },
  {
    wordId: 'book',
    image: bookImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple book flashcard image for Basic English learners.',
  },
  {
    wordId: 'box',
    image: boxImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple box flashcard image for Basic English learners.',
  },
  {
    wordId: 'chair',
    image: chairImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple chair flashcard image for Basic English learners.',
  },
  {
    wordId: 'cup',
    image: cupImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple cup flashcard image for Basic English learners.',
  },
  {
    wordId: 'door',
    image: doorImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple door flashcard image for Basic English learners.',
  },
  {
    wordId: 'friend',
    image: friendImage,
    kind: 'person',
    labelPolicy: 'none',
    prompt: 'A simple friend flashcard image for Basic English learners.',
  },
  {
    wordId: 'home',
    image: homeImage,
    kind: 'place',
    labelPolicy: 'none',
    prompt: 'A simple home flashcard image for Basic English learners.',
  },
  {
    wordId: 'paper',
    image: paperImage,
    kind: 'abstract',
    labelPolicy: 'none',
    prompt: 'A simple paper flashcard image for Basic English learners.',
  },
  {
    wordId: 'pen',
    image: penImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple pen flashcard image for Basic English learners.',
  },
  {
    wordId: 'phone',
    image: phoneImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple phone flashcard image for Basic English learners.',
  },
  {
    wordId: 'room',
    image: roomImage,
    kind: 'place',
    labelPolicy: 'none',
    prompt: 'A simple room flashcard image for Basic English learners.',
  },
  {
    wordId: 'student',
    image: studentImage,
    kind: 'person',
    labelPolicy: 'none',
    prompt: 'A simple student flashcard image for Basic English learners.',
  },
  {
    wordId: 'table',
    image: tableImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple table flashcard image for Basic English learners.',
  },
  {
    wordId: 'window',
    image: windowImage,
    kind: 'object',
    labelPolicy: 'none',
    prompt: 'A simple window flashcard image for Basic English learners.',
  },
];

export const wordFlashcardImages: Partial<Record<string, string>> = Object.fromEntries(
  wordImageAssets.map((asset) => [asset.wordId, asset.image]),
);
