import amImage from '../assets/word-flashcards/am.png';
import bagImage from '../assets/word-flashcards/bag.png';
import becauseImage from '../assets/word-flashcards/because.png';
import bedImage from '../assets/word-flashcards/bed.png';
import bigImage from '../assets/word-flashcards/big.png';
import bookImage from '../assets/word-flashcards/book.png';
import boxImage from '../assets/word-flashcards/box.png';
import cardImage from '../assets/word-flashcards/card.png';
import chairImage from '../assets/word-flashcards/chair.png';
import chinaImage from '../assets/word-flashcards/china.png';
import cleanImage from '../assets/word-flashcards/clean.png';
import cupImage from '../assets/word-flashcards/cup.png';
import dayImage from '../assets/word-flashcards/day.png';
import doorImage from '../assets/word-flashcards/door.png';
import englishImage from '../assets/word-flashcards/english.png';
import everyImage from '../assets/word-flashcards/every.png';
import friendImage from '../assets/word-flashcards/friend.png';
import fromImage from '../assets/word-flashcards/from.png';
import goodImage from '../assets/word-flashcards/good.png';
import happyImage from '../assets/word-flashcards/happy.png';
import haveImage from '../assets/word-flashcards/have.png';
import heImage from '../assets/word-flashcards/he.png';
import homeImage from '../assets/word-flashcards/home.png';
import iImage from '../assets/word-flashcards/i.png';
import importantImage from '../assets/word-flashcards/important.png';
import inImage from '../assets/word-flashcards/in.png';
import keyImage from '../assets/word-flashcards/key.png';
import kindImage from '../assets/word-flashcards/kind.png';
import learnImage from '../assets/word-flashcards/learn.png';
import moneyImage from '../assets/word-flashcards/money.png';
import myImage from '../assets/word-flashcards/my.png';
import nameImage from '../assets/word-flashcards/name.png';
import nearImage from '../assets/word-flashcards/near.png';
import newImage from '../assets/word-flashcards/new.png';
import oldImage from '../assets/word-flashcards/old.png';
import onImage from '../assets/word-flashcards/on.png';
import paperImage from '../assets/word-flashcards/paper.png';
import penImage from '../assets/word-flashcards/pen.png';
import phoneImage from '../assets/word-flashcards/phone.png';
import questionImage from '../assets/word-flashcards/question.png';
import roomImage from '../assets/word-flashcards/room.png';
import sheImage from '../assets/word-flashcards/she.png';
import smallImage from '../assets/word-flashcards/small.png';
import studentImage from '../assets/word-flashcards/student.png';
import studyImage from '../assets/word-flashcards/study.png';
import tableImage from '../assets/word-flashcards/table.png';
import thingImage from '../assets/word-flashcards/thing.png';
import thisImage from '../assets/word-flashcards/this.png';
import underImage from '../assets/word-flashcards/under.png';
import useImage from '../assets/word-flashcards/use.png';
import usefulImage from '../assets/word-flashcards/useful.png';
import wantImage from '../assets/word-flashcards/want.png';
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

function wordImageAsset(
  wordId: string,
  image: string,
  kind: WordImageKind,
  labelPolicy: WordImageLabelPolicy,
  prompt: string,
): WordImageAsset {
  return { wordId, image, kind, labelPolicy, prompt };
}

export const wordImageAssets: WordImageAsset[] = [
  wordImageAsset('name', nameImage, 'abstract', 'english-keyword', 'A simple name card scene showing what a person is called.'),
  wordImageAsset('my', myImage, 'structure', 'english-keyword', 'A simple ownership scene showing something belonging to me.'),
  wordImageAsset('i', iImage, 'structure', 'english-keyword', 'A simple first-person cue for the person speaking.'),
  wordImageAsset('am', amImage, 'structure', 'english-keyword', 'A simple be-verb cue for the sentence I am here.'),
  wordImageAsset('from', fromImage, 'structure', 'english-keyword', 'A simple starting-place cue for coming from a place.'),
  wordImageAsset('china', chinaImage, 'place', 'none', 'A simple China place flashcard image for Basic English learners.'),
  wordImageAsset('student', studentImage, 'person', 'none', 'A simple student flashcard image for Basic English learners.'),
  wordImageAsset('happy', happyImage, 'quality', 'none', 'A simple happy feeling scene for Basic English learners.'),
  wordImageAsset('have', haveImage, 'action', 'none', 'A simple possession scene showing having a thing.'),
  wordImageAsset('question', questionImage, 'abstract', 'none', 'A simple question scene with a clear asking cue.'),
  wordImageAsset('friend', friendImage, 'person', 'none', 'A simple friend flashcard image for Basic English learners.'),
  wordImageAsset('this', thisImage, 'structure', 'english-keyword', 'A simple near-object cue for the word this.'),
  wordImageAsset('he', heImage, 'person', 'none', 'A simple male person cue for Basic English learners.'),
  wordImageAsset('she', sheImage, 'person', 'none', 'A simple female person cue for Basic English learners.'),
  wordImageAsset('kind', kindImage, 'quality', 'none', 'A simple helpful-person scene for the quality kind.'),
  wordImageAsset('study', studyImage, 'action', 'none', 'A simple study scene with a learner and book.'),
  wordImageAsset('english', englishImage, 'abstract', 'english-keyword', 'A simple English language cue with ABC lettering.'),
  wordImageAsset('because', becauseImage, 'structure', 'english-keyword', 'A simple reason cue for the word because.'),
  wordImageAsset('want', wantImage, 'action', 'none', 'A simple wish scene for wanting something.'),
  wordImageAsset('learn', learnImage, 'action', 'none', 'A simple learning scene for getting knowledge or skill.'),
  wordImageAsset('room', roomImage, 'place', 'none', 'A simple room flashcard image for Basic English learners.'),
  wordImageAsset('home', homeImage, 'place', 'none', 'A simple home flashcard image for Basic English learners.'),
  wordImageAsset('table', tableImage, 'object', 'none', 'A simple table flashcard image for Basic English learners.'),
  wordImageAsset('chair', chairImage, 'object', 'none', 'A simple chair flashcard image for Basic English learners.'),
  wordImageAsset('bed', bedImage, 'object', 'none', 'A simple bed flashcard image for Basic English learners.'),
  wordImageAsset('door', doorImage, 'object', 'none', 'A simple door flashcard image for Basic English learners.'),
  wordImageAsset('window', windowImage, 'object', 'none', 'A simple window flashcard image for Basic English learners.'),
  wordImageAsset('book', bookImage, 'object', 'none', 'A simple book flashcard image for Basic English learners.'),
  wordImageAsset('phone', phoneImage, 'object', 'none', 'A simple phone flashcard image for Basic English learners.'),
  wordImageAsset('bag', bagImage, 'object', 'none', 'A simple bag flashcard image for Basic English learners.'),
  wordImageAsset('box', boxImage, 'object', 'none', 'A simple box flashcard image for Basic English learners.'),
  wordImageAsset('cup', cupImage, 'object', 'none', 'A simple cup flashcard image for Basic English learners.'),
  wordImageAsset('pen', penImage, 'object', 'none', 'A simple pen flashcard image for Basic English learners.'),
  wordImageAsset('paper', paperImage, 'abstract', 'none', 'A simple paper flashcard image for Basic English learners.'),
  wordImageAsset('thing', thingImage, 'abstract', 'none', 'A simple object cue for a general thing.'),
  wordImageAsset('in', inImage, 'position', 'english-keyword', 'A simple position diagram showing an object inside.'),
  wordImageAsset('on', onImage, 'position', 'english-keyword', 'A simple position diagram showing an object on top.'),
  wordImageAsset('under', underImage, 'position', 'english-keyword', 'A simple position diagram showing an object below.'),
  wordImageAsset('near', nearImage, 'position', 'english-keyword', 'A simple position diagram showing an object not far away.'),
  wordImageAsset('small', smallImage, 'quality', 'none', 'A simple size cue showing small.'),
  wordImageAsset('big', bigImage, 'quality', 'none', 'A simple size cue showing big.'),
  wordImageAsset('clean', cleanImage, 'quality', 'none', 'A simple clean state cue for Basic English learners.'),
  wordImageAsset('new', newImage, 'quality', 'none', 'A simple new state cue for Basic English learners.'),
  wordImageAsset('old', oldImage, 'quality', 'none', 'A simple old state cue for Basic English learners.'),
  wordImageAsset('useful', usefulImage, 'quality', 'none', 'A simple useful object cue for Basic English learners.'),
  wordImageAsset('important', importantImage, 'quality', 'none', 'A simple important value cue for Basic English learners.'),
  wordImageAsset('good', goodImage, 'quality', 'none', 'A simple good quality cue for Basic English learners.'),
  wordImageAsset('use', useImage, 'action', 'none', 'A simple action scene showing using a thing.'),
  wordImageAsset('every', everyImage, 'structure', 'english-keyword', 'A simple each-one cue for the word every.'),
  wordImageAsset('day', dayImage, 'time', 'english-keyword', 'A simple day cue from morning to night.'),
  wordImageAsset('money', moneyImage, 'abstract', 'none', 'A simple money cue for buying things.'),
  wordImageAsset('card', cardImage, 'abstract', 'none', 'A simple card cue for a small flat thing.'),
  wordImageAsset('key', keyImage, 'object', 'none', 'A simple key flashcard image for Basic English learners.'),
];

export const wordFlashcardImages: Partial<Record<string, string>> = Object.fromEntries(
  wordImageAssets.map((asset) => [asset.wordId, asset.image]),
);
