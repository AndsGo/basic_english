import type { Course, Exercise } from '../domain/types';

const basicEnglish850Words = `
a able about account acid across act addition adjustment advertisement after again against agreement air all almost among amount amusement and angle angry animal answer ant any apparatus apple approval arch argument arm army art as at attack attempt attention attraction authority automatic awake
baby back bad bag balance ball band base basin basket bath be beautiful because bed bee before behavior belief bell bent berry between bird birth bit bite bitter black blade blood blow blue board boat body boiling bone book boot bottle box boy brain brake branch brass bread breath brick bridge bright broken brother brown brush bucket building bulb burn burst business but butter button by
cake camera canvas card care carriage cart cat cause certain chain chalk chance change cheap cheese chemical chest chief chin church circle clean clear clock cloth cloud coal coat cold collar color comb come comfort committee common company comparison competition complete complex condition connection conscious control cook copper copy cord cork cotton cough country cover cow crack credit crime cruel crush cry cup current curtain curve cushion cut
damage danger dark daughter day dead dear death debt decision deep degree delicate dependent design desire destruction detail development different digestion direction dirty discovery discussion disease disgust distance distribution division do dog door doubt down drain drawer dress drink driving drop dry dust
ear early earth east edge education effect egg elastic electric end engine enough equal error even event ever every example exchange existence expansion experience expert eye
face fact fall false family far farm fat father fear feather feeble feeling female fertile fiction field fight finger fire first fish fixed flag flame flat flight floor flower fly fold food foolish foot for force fork form forward fowl frame free frequent friend from front fruit full future
garden general get girl give glass glove go goat gold good government grain grass gray great green grip group growth guide gun
hair hammer hand hanging happy harbor hard harmony hat hate have he head healthy hearing heart heat help here high history hole hollow hook hope horn horse hospital hour house how humor
i ice idea if ill important impulse in increase industry ink insect instrument insurance interest invention iron island
jelly jewel join journey judge jump
keep kettle key kick kind kiss knee knife knot knowledge
land language last late laugh law lead leaf learning leather left leg less least let letter level library lift light like limit line linen lip liquid list little living lock long look loose loss loud love low
machine make male man manager map mark market married mass match material may meal measure meat medical meeting memory metal middle military milk mind mine minute mist mixed money monkey month moon morning mother motion mountain mouth move much most muscle music
nail name narrow nation natural near necessary neck need needle nerve net new news night no noise normal north nose not note now number nut
observation of off offer office oil old on only open operation opinion opposite or orange order organization ornament other out oven over owner
page pain paint paper parallel parcel part past paste payment peace pen pencil person physical picture pig pin pipe place plane plant plate play please pleasure plough pocket point poison polish political poor porter position possible pot potato powder power present price print prison private probable process produce profit property prose protest public pull pump punishment purpose push put
quality question quick quiet quite
rail rain range rat rate ray reaction reading ready reason receipt record red regret regular relation religion representative request respect responsible rest reward rhythm rice right ring river road rod roll roof room root rough round rub rule run
sad safe sail salt same sand say scale school science scissors screw sea seat second secret secretary see seed seem selection self send sense separate serious servant sex shade shake shame sharp she sheep shelf ship shirt shock shoe short shut side sign silk silver simple sister size skin skirt sky sleep slip slope slow small smash smell smile smoke smooth snake sneeze snow so soap society sock soft solid some son song sort sound soup south space spade special sponge spoon spring square stage stamp star start statement station steam steel stem step stick sticky stiff still stitch stocking stomach stone stop store story straight strange street stretch strong structure substance such sudden sugar suggestion summer sun support surprise sweet swim system
table tail take talk tall taste tax teaching tendency test than that the then theory there thick thin thing this though thought thread throat through thumb thunder ticket tight till time tin tired to toe together tomorrow tongue tooth top touch town trade train transport tray tree trick trouble trousers true turn twist
umbrella un under unit up use
value verse very vessel view violent voice
waiting walk wall war warm wash waste watch water wave wax way weather week weight well west wet wheel when where while whip whistle white who why wide will wind window wine wing winter wire wise with woman wood wool word work worm wound writing wrong
year yellow yes yesterday you young
`;

export const basicEnglishWordList = [...new Set(basicEnglish850Words.trim().split(/\s+/))].sort((left, right) =>
  left.localeCompare(right),
);

export const basicEnglishAllowedWords = new Set(basicEnglishWordList);

export const basicEnglishCourseExceptions = new Set([
  // Product-approved proper nouns and learner-course terms already present in shipped V1.9 content.
  'anna',
  'china',
  'english',
  'japan',
  'li',
  'shanghai',
  'student',
  'teacher',

  // Basic English operator/pronoun/article forms used in shipped beginner patterns.
  'am',
  'an',
  'are',
  'can',
  'has',
  'her',
  'his',
  'it',
  'me',
  'my',
  'they',
  'what',
  'which',
  'was',
  'your',

  // Existing beginner-course vocabulary intentionally used before a stricter Basic English rewrite.
  'action',
  'afternoon',
  'always',
  'another',
  'ask',
  'below',
  'best',
  'big',
  'basic',
  'belongs',
  'breakfast',
  'bring',
  'bus',
  'buy',
  'carry',
  'chair',
  'choose',
  'close',
  'correct',
  'cost',
  'daily',
  'describe',
  'does',
  'description',
  'desk',
  'eat',
  'empty',
  'evening',
  'excuse',
  'express',
  'feel',
  'find',
  'finish',
  'habit',
  'home',
  'happens',
  'identity',
  'introduce',
  'introduction',
  'learn',
  'matters',
  'mean',
  'more',
  'never',
  'next',
  'often',
  'one',
  'outside',
  'pay',
  'personal',
  'phone',
  'politely',
  'problem',
  'practice',
  'read',
  'repeat',
  'scene',
  'sell',
  'shop',
  'shopping',
  'show',
  'simply',
  'sorry',
  'something',
  'sometimes',
  'speak',
  'study',
  'tea',
  'tell',
  'sentence',
  'today',
  'understand',
  'useful',
  'usually',
  'want',
  'write',
]);

const contractionFragments = new Set(['d', 'll', 'm', 're', 's', 't', 've']);

export function normalizeBasicEnglishToken(token: string): string {
  return token.toLowerCase().replace(/^'+|'+$/g, '');
}

export function tokenizeBasicEnglishText(text: string): string[] {
  return text
    .replace(/\bisn't\b/gi, 'is not')
    .replace(/\baren't\b/gi, 'are not')
    .replace(/\bhaven't\b/gi, 'have not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/[_/']/g, ' ')
    .split(/[^A-Za-z]+/)
    .map(normalizeBasicEnglishToken)
    .filter((token) => token.length > 0 && !contractionFragments.has(token));
}

export function isAllowedBasicEnglishToken(token: string): boolean {
  const normalized = normalizeBasicEnglishToken(token);
  if (!normalized) return true;
  if (basicEnglishAllowedWords.has(normalized) || basicEnglishCourseExceptions.has(normalized)) return true;

  const candidates = new Set<string>();
  if (normalized.endsWith('ies') && normalized.length > 3) candidates.add(`${normalized.slice(0, -3)}y`);
  if (normalized.endsWith('es') && normalized.length > 2) candidates.add(normalized.slice(0, -2));
  if (normalized.endsWith('s') && normalized.length > 1) candidates.add(normalized.slice(0, -1));
  if (normalized.endsWith('ed') && normalized.length > 2) {
    const withoutEd = normalized.slice(0, -2);
    candidates.add(withoutEd);
    candidates.add(removeDoubledFinalConsonant(withoutEd));
    candidates.add(normalized.slice(0, -1));
    candidates.add(`${normalized.slice(0, -1)}e`);
  }
  if (normalized.endsWith('ing') && normalized.length > 3) {
    const withoutIng = normalized.slice(0, -3);
    candidates.add(withoutIng);
    candidates.add(removeDoubledFinalConsonant(withoutIng));
    candidates.add(`${withoutIng}e`);
  }
  if (normalized.endsWith('ly') && normalized.length > 2) candidates.add(normalized.slice(0, -2));

  return [...candidates].some((candidate) => basicEnglishAllowedWords.has(candidate) || basicEnglishCourseExceptions.has(candidate));
}

function removeDoubledFinalConsonant(token: string): string {
  if (token.length < 2) return token;

  const finalCharacter = token.at(-1);
  const previousCharacter = token.at(-2);
  if (finalCharacter && finalCharacter === previousCharacter && !'aeiou'.includes(finalCharacter)) {
    return token.slice(0, -1);
  }

  return token;
}

export interface BasicEnglishTextEntry {
  text: string;
  label: string;
}

function validateText(text: string, label: string, errors: string[]) {
  for (const token of tokenizeBasicEnglishText(text)) {
    if (!isAllowedBasicEnglishToken(token)) {
      errors.push(`Non-Basic English word "${token}" in ${label}`);
    }
  }
}

export function validateBasicEnglishTextEntries(texts: BasicEnglishTextEntry[]): string[] {
  const errors: string[] = [];

  texts.forEach(({ text, label }) => validateText(text, label, errors));

  return [...new Set(errors)];
}

function collectExerciseTexts(exercise: Exercise): Array<{ text: string; label: string }> {
  if (exercise.type === 'choice') {
    return [
      { text: exercise.prompt, label: `${exercise.id} prompt` },
      ...exercise.options.map((option) => ({ text: option, label: `${exercise.id} option` })),
      { text: exercise.correctOption, label: `${exercise.id} correct option` },
      ...(exercise.explanation ? [{ text: exercise.explanation, label: `${exercise.id} explanation` }] : []),
    ];
  }

  if (exercise.type === 'fill_blank') {
    return [
      { text: exercise.prompt, label: `${exercise.id} prompt` },
      ...exercise.acceptedAnswers.map((answer) => ({ text: answer, label: `${exercise.id} accepted answer` })),
      ...(exercise.explanation ? [{ text: exercise.explanation, label: `${exercise.id} explanation` }] : []),
    ];
  }

  if (exercise.type === 'sentence_order') {
    return [
      ...exercise.tokens.map((token) => ({ text: token, label: `${exercise.id} token` })),
      ...exercise.correctOrder.map((token) => ({ text: token, label: `${exercise.id} correct order` })),
      { text: exercise.finalSentence, label: `${exercise.id} final sentence` },
    ];
  }

  if (exercise.type === 'replacement') {
    return [
      ...Object.values(exercise.slotValues).map((value) => ({ text: value, label: `${exercise.id} slot value` })),
      { text: exercise.referenceAnswer, label: `${exercise.id} reference answer` },
    ];
  }

  return [
    { text: exercise.coreMeaningHint, label: `${exercise.id} meaning hint` },
    ...exercise.referenceAnswers.map((answer) => ({ text: answer, label: `${exercise.id} reference answer` })),
  ];
}

export function validateBasicEnglishVocabulary(course: Course): string[] {
  const errors: string[] = [];

  for (const word of course.words) {
    validateText(word.text, `word ${word.id} text`, errors);
    validateText(word.definition, `word ${word.id} definition`, errors);
    validateText(word.example, `word ${word.id} example`, errors);
  }

  for (const pattern of course.patterns) {
    validateText(pattern.title, `pattern ${pattern.id} title`, errors);
    validateText(pattern.use, `pattern ${pattern.id} use`, errors);
    validateText(pattern.structure, `pattern ${pattern.id} structure`, errors);
    pattern.examples.forEach((example) => validateText(example, `pattern ${pattern.id} example`, errors));
  }

  for (const week of course.weeks) {
    validateText(week.title, `week ${week.id} title`, errors);
    validateText(week.goal, `week ${week.id} goal`, errors);

    for (const day of week.days) {
      validateText(day.title, `${day.id} title`, errors);
      validateText(day.goal, `${day.id} goal`, errors);
      day.exercises.forEach((exercise) => {
        collectExerciseTexts(exercise).forEach(({ text, label }) => validateText(text, label, errors));
      });
      validateText(day.outputTask.topic, `${day.id} output topic`, errors);
      day.outputTask.prompts.forEach((prompt) => validateText(prompt, `${day.id} output prompt`, errors));
      day.outputTask.template.forEach((template) => validateText(template, `${day.id} output template`, errors));

      const outputTaskWithStoryPrompt = day.outputTask as typeof day.outputTask & { storyPrompt?: string };
      if (outputTaskWithStoryPrompt.storyPrompt) {
        validateText(outputTaskWithStoryPrompt.storyPrompt, `${day.id} story prompt`, errors);
      }

      day.weeklyCheckRubric?.criteria.forEach((criterion) => {
        validateText(criterion.label, `${day.id} weekly check rubric criterion ${criterion.id} label`, errors);
        criterion.scores.forEach((score, index) => {
          validateText(score, `${day.id} weekly check rubric criterion ${criterion.id} score ${index + 1}`, errors);
        });
      });
    }
  }

  return [...new Set(errors)];
}
