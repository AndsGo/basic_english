# Basic English V1.10 Week 5-6 Errand Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the app from 4 weeks to 6 weeks with Week 5-6 errand story content, light story output guidance, Basic English 850 vocabulary validation, complete word images, and complete picture-description scenes.

**Architecture:** Keep the existing Today flow and content architecture. Add `week5.ts` and `week6.ts`, wire them into the existing course/content registries, extend `OutputTask` with optional story metadata, and add validation helpers under `src/content` so content failures are caught by `validateContent.test.ts`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, local PNG assets, existing content modules.

---

## File Structure

Create:

- `src/content/basicEnglish850.ts` - source-controlled Basic English vocabulary allowlist, small product exception list, and normalization helpers.
- `src/content/week5.ts` - Week 5 words, patterns, days, exercises, and story output tasks.
- `src/content/week6.ts` - Week 6 words, patterns, days, exercises, and story output tasks.
- `src/assets/word-flashcards/*.png` - one approved 512x512 flashcard image for each new Week 5-6 course word.
- `src/assets/picture-describe/day-029-getting-ready-to-go-out.png`
- `src/assets/picture-describe/day-030-walking-to-the-bus-place.png`
- `src/assets/picture-describe/day-031-taking-the-bus.png`
- `src/assets/picture-describe/day-032-finding-things-in-store.png`
- `src/assets/picture-describe/day-033-waiting-and-paying.png`
- `src/assets/picture-describe/day-034-coming-back-home.png`
- `src/assets/picture-describe/day-035-errand-story-recap.png`
- `src/assets/picture-describe/day-036-asking-the-way.png`
- `src/assets/picture-describe/day-037-late-bus-time-problem.png`
- `src/assets/picture-describe/day-038-store-does-not-have-it.png`
- `src/assets/picture-describe/day-039-not-enough-money.png`
- `src/assets/picture-describe/day-040-ask-again.png`
- `src/assets/picture-describe/day-041-polite-help.png`
- `src/assets/picture-describe/day-042-problem-story-recap.png`

Modify:

- `src/domain/types.ts` - add optional `storyMode` and `storyPrompt` to `OutputTask`.
- `src/components/OutputTaskEditor.tsx` - render story guidance when output metadata exists.
- `src/components/OutputTaskEditor.test.tsx` - cover story guidance and absence on ordinary tasks.
- `src/content/validateContent.ts` - call Basic English vocabulary validation and report actionable errors.
- `src/content/validateContent.test.ts` - add 850 validation tests and update course expectations to 6 weeks / 42 days.
- `src/content/course.ts` - import Weeks 5-6, set `contentVersion` to `1.10.0`, include new words, patterns, and weeks.
- `src/content/scenarioCapabilities.ts` - add Week 5-6 roadmap/capabilities.
- `src/content/sceneGoals.ts` - add scene goals for Day 29-42 and expand the day-id union.
- `src/content/sceneRemixTasks.ts` - add one scene remix task per Day 29-42.
- `src/content/pictureDescribeTasks.ts` - import and register Day 29-42 picture tasks.
- `src/content/wordFlashcardImages.ts` - import and register all new word images with correct metadata.
- `src/components/TodayPage.test.tsx` - cover Week 5 ordinary day and Week 6 recap day story rendering.
- `src/components/CoursePage.test.tsx`, `src/components/MePage.test.tsx`, and any tests expecting the last day to be Day 28 - update to Day 42 if they assert course completion.

Use these final V1.10 new course words unless Basic English validation forces one of the documented fallback expressions:

```text
outside, way, stop, left, right, straight, far, ride, wait, late,
early, seat, line, turn, list, carry, back, heavy, light, lost,
wrong, another, understand, repeat, sorry, excuse, thank
```

Do not add these as course words unless they are confirmed in the allowlist or added as documented exceptions:

```text
errand, station, ticket, counter, thanks
```

Use allowed expression rewrites instead:

```text
errand -> thing I need to do
station -> place for the bus
ticket -> paper for the bus
counter -> table in the shop
thanks -> thank you
```

---

### Task 1: Add Basic English 850 Vocabulary Validation

**Files:**
- Create: `src/content/basicEnglish850.ts`
- Modify: `src/content/validateContent.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Write failing tests for Basic English validation**

Add imports in `src/content/validateContent.test.ts`:

```ts
import { validateBasicEnglishVocabulary } from './basicEnglish850';
```

Add this describe block near the existing `basicEnglishCourse V1.2` tests:

```ts
describe('Basic English 850 validation', () => {
  it('accepts existing shipped course content under the allowlist and exception policy', () => {
    expect(validateBasicEnglishVocabulary(basicEnglishCourse).errors).toEqual([]);
  });

  it('reports actionable errors for unapproved non-Basic course words', () => {
    const course = structuredClone(basicEnglishCourse);
    course.words.push({
      id: 'airport',
      text: 'airport',
      category: 'general_thing',
      definition: 'a place for airplanes',
      chinese: '机场',
      example: 'I go to the airport.',
      weekIntroduced: 5,
      tags: ['outside'],
    });
    course.weeks[0].days[0].wordIds.push('airport');

    expect(validateBasicEnglishVocabulary(course).errors).toContain(
      'Non-Basic English word "airport" in word airport text',
    );
  });

  it('checks learner-facing examples and output templates', () => {
    const course = structuredClone(basicEnglishCourse);
    course.words[0].example = 'I visit a museum.';
    course.weeks[0].days[0].outputTask.template.push('I visit a museum.');

    expect(validateBasicEnglishVocabulary(course).errors).toEqual(
      expect.arrayContaining([
        'Non-Basic English word "visit" in word name example',
        'Non-Basic English word "museum" in word name example',
        'Non-Basic English word "visit" in day-001 output template',
        'Non-Basic English word "museum" in day-001 output template',
      ]),
    );
  });

  it('allows simple inflections from allowed base words', () => {
    const course = structuredClone(basicEnglishCourse);
    course.words[0].example = 'I walked home.';
    course.weeks[0].days[0].outputTask.template.push('I am walking home.');
    course.weeks[0].days[0].outputTask.template.push('I have books.');

    expect(validateBasicEnglishVocabulary(course).errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: fail with an import or missing export error for `./basicEnglish850`.

- [ ] **Step 3: Create the allowlist and validator**

Create `src/content/basicEnglish850.ts`:

```ts
import type { Course, Exercise } from '../domain/types';

export interface BasicEnglishValidationResult {
  errors: string[];
}

const basicEnglish850Words = [
  'a',
  'about',
  'after',
  'again',
  'against',
  'all',
  'almost',
  'among',
  'and',
  'angle',
  'angry',
  'animal',
  'answer',
  'any',
  'apparatus',
  'apple',
  'approval',
  'arch',
  'argument',
  'arm',
  'army',
  'art',
  'as',
  'at',
  'attack',
  'attempt',
  'attention',
  'attraction',
  'authority',
  'automatic',
  'awake',
  'baby',
  'back',
  'bad',
  'bag',
  'balance',
  'ball',
  'band',
  'base',
  'basin',
  'basket',
  'bath',
  'be',
  'beautiful',
  'because',
  'bed',
  'bee',
  'before',
  'behavior',
  'belief',
  'bell',
  'bent',
  'berry',
  'between',
  'bird',
  'birth',
  'bit',
  'bite',
  'bitter',
  'black',
  'blade',
  'blood',
  'blow',
  'blue',
  'board',
  'boat',
  'body',
  'boiling',
  'bone',
  'book',
  'boot',
  'bottle',
  'box',
  'boy',
  'brain',
  'brake',
  'branch',
  'brass',
  'bread',
  'breath',
  'brick',
  'bridge',
  'bright',
  'broken',
  'brother',
  'brown',
  'brush',
  'bucket',
  'building',
  'bulb',
  'burn',
  'burst',
  'business',
  'but',
  'butter',
  'button',
  'by',
  'cake',
  'camera',
  'canvas',
  'card',
  'care',
  'carriage',
  'cart',
  'cat',
  'cause',
  'certain',
  'chain',
  'chalk',
  'chance',
  'change',
  'cheap',
  'cheese',
  'chemical',
  'chest',
  'chief',
  'chin',
  'church',
  'circle',
  'clean',
  'clear',
  'clock',
  'cloth',
  'cloud',
  'coal',
  'coat',
  'cold',
  'collar',
  'color',
  'comb',
  'come',
  'comfort',
  'committee',
  'common',
  'company',
  'comparison',
  'competition',
  'complete',
  'complex',
  'condition',
  'connection',
  'conscious',
  'control',
  'cook',
  'copper',
  'copy',
  'cord',
  'cork',
  'cotton',
  'cough',
  'country',
  'cover',
  'cow',
  'crack',
  'credit',
  'crime',
  'cruel',
  'crush',
  'cry',
  'cup',
  'current',
  'curtain',
  'curve',
  'cushion',
  'cut',
  'damage',
  'danger',
  'dark',
  'daughter',
  'day',
  'dead',
  'dear',
  'death',
  'debt',
  'decision',
  'deep',
  'degree',
  'delicate',
  'dependent',
  'design',
  'desire',
  'destruction',
  'detail',
  'development',
  'different',
  'digestion',
  'direction',
  'dirty',
  'discovery',
  'discussion',
  'disease',
  'disgust',
  'distance',
  'distribution',
  'division',
  'do',
  'dog',
  'door',
  'doubt',
  'down',
  'drain',
  'drawer',
  'dress',
  'drink',
  'driving',
  'drop',
  'dry',
  'dust',
  'ear',
  'early',
  'earth',
  'east',
  'edge',
  'education',
  'effect',
  'egg',
  'elastic',
  'electric',
  'end',
  'engine',
  'enough',
  'equal',
  'error',
  'even',
  'event',
  'ever',
  'every',
  'example',
  'exchange',
  'existence',
  'expansion',
  'experience',
  'expert',
  'eye',
  'face',
  'fact',
  'fall',
  'false',
  'family',
  'far',
  'farm',
  'fat',
  'father',
  'fear',
  'feather',
  'feeble',
  'feeling',
  'female',
  'fertile',
  'fiction',
  'field',
  'fight',
  'finger',
  'fire',
  'first',
  'fish',
  'fixed',
  'flag',
  'flame',
  'flat',
  'flight',
  'floor',
  'flower',
  'fly',
  'fold',
  'food',
  'foolish',
  'foot',
  'for',
  'force',
  'fork',
  'form',
  'forward',
  'fowl',
  'frame',
  'free',
  'frequent',
  'friend',
  'from',
  'front',
  'fruit',
  'full',
  'future',
  'garden',
  'general',
  'get',
  'girl',
  'give',
  'glass',
  'glove',
  'go',
  'goat',
  'gold',
  'good',
  'government',
  'grain',
  'grass',
  'gray',
  'great',
  'green',
  'grip',
  'group',
  'growth',
  'guide',
  'gun',
  'hair',
  'hammer',
  'hand',
  'hanging',
  'happy',
  'harbor',
  'hard',
  'harmony',
  'hat',
  'hate',
  'have',
  'he',
  'head',
  'healthy',
  'hearing',
  'heart',
  'heat',
  'help',
  'here',
  'high',
  'history',
  'hole',
  'hollow',
  'hook',
  'hope',
  'horn',
  'horse',
  'hospital',
  'hour',
  'house',
  'how',
  'humor',
  'i',
  'ice',
  'idea',
  'if',
  'ill',
  'important',
  'impulse',
  'in',
  'increase',
  'industry',
  'ink',
  'insect',
  'instrument',
  'insurance',
  'interest',
  'invention',
  'iron',
  'island',
  'jelly',
  'jewel',
  'join',
  'journey',
  'judge',
  'jump',
  'keep',
  'kettle',
  'key',
  'kick',
  'kind',
  'kiss',
  'knee',
  'knife',
  'knot',
  'knowledge',
  'land',
  'language',
  'last',
  'late',
  'laugh',
  'law',
  'lead',
  'leaf',
  'learning',
  'leather',
  'left',
  'leg',
  'less',
  'letter',
  'level',
  'library',
  'lift',
  'light',
  'like',
  'limit',
  'line',
  'linen',
  'lip',
  'liquid',
  'list',
  'little',
  'living',
  'lock',
  'long',
  'look',
  'loose',
  'loss',
  'loud',
  'love',
  'low',
  'machine',
  'make',
  'male',
  'man',
  'manager',
  'map',
  'mark',
  'market',
  'married',
  'mass',
  'match',
  'material',
  'may',
  'meal',
  'measure',
  'meat',
  'medical',
  'meeting',
  'memory',
  'metal',
  'middle',
  'military',
  'milk',
  'mind',
  'mine',
  'minute',
  'mist',
  'mixed',
  'money',
  'monkey',
  'month',
  'moon',
  'morning',
  'mother',
  'motion',
  'mountain',
  'mouth',
  'move',
  'much',
  'muscle',
  'music',
  'nail',
  'name',
  'narrow',
  'nation',
  'natural',
  'near',
  'necessary',
  'neck',
  'need',
  'needle',
  'nerve',
  'net',
  'new',
  'news',
  'night',
  'no',
  'noise',
  'normal',
  'north',
  'nose',
  'not',
  'note',
  'now',
  'number',
  'nut',
  'observation',
  'of',
  'off',
  'offer',
  'office',
  'oil',
  'old',
  'on',
  'only',
  'open',
  'operation',
  'opinion',
  'opposite',
  'or',
  'orange',
  'order',
  'organization',
  'ornament',
  'other',
  'out',
  'oven',
  'over',
  'owner',
  'page',
  'pain',
  'paint',
  'paper',
  'parallel',
  'parcel',
  'part',
  'past',
  'paste',
  'payment',
  'peace',
  'pen',
  'pencil',
  'person',
  'physical',
  'picture',
  'pig',
  'pin',
  'pipe',
  'place',
  'plane',
  'plant',
  'plate',
  'play',
  'please',
  'pleasure',
  'plough',
  'pocket',
  'point',
  'poison',
  'polish',
  'political',
  'poor',
  'porter',
  'position',
  'possible',
  'pot',
  'potato',
  'powder',
  'power',
  'present',
  'price',
  'print',
  'prison',
  'private',
  'probable',
  'process',
  'produce',
  'profit',
  'property',
  'prose',
  'protest',
  'public',
  'pull',
  'pump',
  'punishment',
  'purpose',
  'push',
  'put',
  'quality',
  'question',
  'quick',
  'quiet',
  'quite',
  'rail',
  'rain',
  'range',
  'rat',
  'rate',
  'ray',
  'reaction',
  'reading',
  'ready',
  'reason',
  'receipt',
  'record',
  'red',
  'regret',
  'regular',
  'relation',
  'religion',
  'representative',
  'request',
  'respect',
  'responsible',
  'rest',
  'reward',
  'rhythm',
  'rice',
  'right',
  'ring',
  'river',
  'road',
  'rod',
  'roll',
  'roof',
  'room',
  'root',
  'rough',
  'round',
  'rub',
  'rule',
  'run',
  'sad',
  'safe',
  'sail',
  'salt',
  'same',
  'sand',
  'say',
  'scale',
  'school',
  'science',
  'scissors',
  'screw',
  'sea',
  'seat',
  'second',
  'secret',
  'secretary',
  'seed',
  'seem',
  'selection',
  'self',
  'send',
  'sense',
  'separate',
  'serious',
  'servant',
  'sex',
  'shade',
  'shake',
  'shame',
  'sharp',
  'she',
  'sheep',
  'shelf',
  'ship',
  'shirt',
  'shock',
  'shoe',
  'short',
  'shut',
  'side',
  'sign',
  'silk',
  'silver',
  'simple',
  'sister',
  'size',
  'skin',
  'skirt',
  'sky',
  'sleep',
  'slip',
  'slope',
  'slow',
  'small',
  'smash',
  'smell',
  'smile',
  'smoke',
  'smooth',
  'snake',
  'sneeze',
  'snow',
  'so',
  'soap',
  'society',
  'sock',
  'soft',
  'solid',
  'some',
  'son',
  'song',
  'sort',
  'sound',
  'soup',
  'south',
  'space',
  'spade',
  'special',
  'sponge',
  'spoon',
  'spring',
  'square',
  'stamp',
  'star',
  'start',
  'statement',
  'station',
  'steam',
  'steel',
  'stem',
  'step',
  'stick',
  'sticky',
  'stiff',
  'still',
  'stitch',
  'stocking',
  'stomach',
  'stone',
  'stop',
  'store',
  'story',
  'straight',
  'strange',
  'street',
  'stretch',
  'strong',
  'structure',
  'substance',
  'such',
  'sudden',
  'sugar',
  'suggestion',
  'summer',
  'support',
  'surprise',
  'sweet',
  'swim',
  'system',
  'table',
  'tail',
  'take',
  'talk',
  'tall',
  'taste',
  'tax',
  'teaching',
  'tendency',
  'test',
  'than',
  'that',
  'the',
  'then',
  'there',
  'thick',
  'thin',
  'thing',
  'this',
  'thought',
  'thread',
  'throat',
  'through',
  'thumb',
  'thunder',
  'ticket',
  'tight',
  'till',
  'time',
  'tin',
  'tired',
  'to',
  'toe',
  'together',
  'tomorrow',
  'tongue',
  'tooth',
  'top',
  'touch',
  'town',
  'trade',
  'train',
  'transport',
  'tray',
  'tree',
  'trick',
  'trouble',
  'trousers',
  'true',
  'turn',
  'twist',
  'umbrella',
  'un',
  'under',
  'unit',
  'up',
  'use',
  'value',
  'verse',
  'very',
  'vessel',
  'view',
  'violent',
  'voice',
  'waiting',
  'walk',
  'wall',
  'war',
  'warm',
  'wash',
  'waste',
  'watch',
  'water',
  'wave',
  'wax',
  'way',
  'weather',
  'week',
  'weight',
  'well',
  'west',
  'wet',
  'wheel',
  'when',
  'where',
  'while',
  'whip',
  'whistle',
  'white',
  'who',
  'why',
  'wide',
  'will',
  'wind',
  'window',
  'wine',
  'wing',
  'winter',
  'wire',
  'wise',
  'with',
  'woman',
  'wood',
  'wool',
  'word',
  'work',
  'worm',
  'wound',
  'writing',
  'wrong',
  'year',
  'yellow',
  'yes',
  'yesterday',
  'you',
  'young',
] as const;

export const basicEnglishAllowedWords = new Set<string>(basicEnglish850Words);

export const basicEnglishCourseExceptions = new Set<string>([
  'english',
  'japan',
  'li',
  'teacher',
  'desk',
  'breakfast',
  'kitchen',
  'afternoon',
  'evening',
  'habit',
  'practice',
  'shop',
  'buy',
  'sell',
  'cost',
  'find',
  'show',
  'bring',
  'more',
  'much',
  'empty',
  'another',
  'outside',
  'sorry',
  'excuse',
  'repeat',
  'understand',
]);

const contractionParts = new Set(['m', 's', 're', 've', 'll', 'd', 't']);

export function normalizeBasicEnglishToken(token: string): string {
  return token.toLowerCase().replace(/^'+|'+$/g, '');
}

export function tokenizeBasicEnglishText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[{}]/g, ' ')
    .replace(/[_/]/g, ' ')
    .split(/[^a-z']+/)
    .map(normalizeBasicEnglishToken)
    .filter((token) => token.length > 0 && !contractionParts.has(token));
}

export function isAllowedBasicEnglishToken(token: string): boolean {
  const normalized = normalizeBasicEnglishToken(token);
  if (!normalized) return true;
  if (basicEnglishAllowedWords.has(normalized) || basicEnglishCourseExceptions.has(normalized)) return true;

  const candidates = new Set<string>();
  if (normalized.endsWith('ies') && normalized.length > 3) candidates.add(`${normalized.slice(0, -3)}y`);
  if (normalized.endsWith('es') && normalized.length > 2) candidates.add(normalized.slice(0, -2));
  if (normalized.endsWith('s') && normalized.length > 1) candidates.add(normalized.slice(0, -1));
  if (normalized.endsWith('ed') && normalized.length > 2) candidates.add(normalized.slice(0, -2));
  if (normalized.endsWith('ing') && normalized.length > 3) {
    candidates.add(normalized.slice(0, -3));
    candidates.add(`${normalized.slice(0, -3)}e`);
  }
  if (normalized.endsWith('ly') && normalized.length > 2) candidates.add(normalized.slice(0, -2));

  return [...candidates].some((candidate) => basicEnglishAllowedWords.has(candidate) || basicEnglishCourseExceptions.has(candidate));
}

function collectTextFromExercise(exercise: Exercise): Array<{ text: string; label: string }> {
  if (exercise.type === 'choice') {
    return [
      { text: exercise.prompt, label: `${exercise.id} prompt` },
      ...exercise.options.map((option) => ({ text: option, label: `${exercise.id} option` })),
      { text: exercise.correctOption, label: `${exercise.id} correct option` },
    ];
  }
  if (exercise.type === 'fill_blank') {
    return [
      { text: exercise.prompt, label: `${exercise.id} prompt` },
      ...exercise.acceptedAnswers.map((answer) => ({ text: answer, label: `${exercise.id} accepted answer` })),
    ];
  }
  if (exercise.type === 'sentence_order') {
    return [{ text: exercise.finalSentence, label: `${exercise.id} final sentence` }];
  }
  if (exercise.type === 'replacement') {
    return [{ text: exercise.referenceAnswer, label: `${exercise.id} reference answer` }];
  }
  return exercise.referenceAnswers.map((answer) => ({ text: answer, label: `${exercise.id} reference answer` }));
}

function validateText(text: string, label: string, errors: string[]) {
  for (const token of tokenizeBasicEnglishText(text)) {
    if (!isAllowedBasicEnglishToken(token)) {
      errors.push(`Non-Basic English word "${token}" in ${label}`);
    }
  }
}

export function validateBasicEnglishVocabulary(course: Course): BasicEnglishValidationResult {
  const errors: string[] = [];

  for (const word of course.words) {
    validateText(word.text, `word ${word.id} text`, errors);
    validateText(word.example, `word ${word.id} example`, errors);
  }

  for (const pattern of course.patterns) {
    validateText(pattern.title, `pattern ${pattern.id} title`, errors);
    validateText(pattern.structure, `pattern ${pattern.id} structure`, errors);
    pattern.examples.forEach((example) => validateText(example, `pattern ${pattern.id} example`, errors));
  }

  for (const week of course.weeks) {
    for (const day of week.days) {
      day.exercises.forEach((exercise) => {
        collectTextFromExercise(exercise).forEach((item) => validateText(item.text, item.label, errors));
      });
      day.outputTask.prompts.forEach((prompt) => validateText(prompt, `${day.id} output prompt`, errors));
      day.outputTask.template.forEach((template) => validateText(template, `${day.id} output template`, errors));
      if (day.outputTask.storyPrompt) validateText(day.outputTask.storyPrompt, `${day.id} story prompt`, errors);
    }
  }

  return { errors: [...new Set(errors)] };
}
```

- [ ] **Step 4: Wire validation into `validateContent`**

Modify `src/content/validateContent.ts`:

```ts
import { validateBasicEnglishVocabulary } from './basicEnglish850';
```

Inside `validateCourseContent`, immediately before `return { errors };`, add:

```ts
  errors.push(...validateBasicEnglishVocabulary(course).errors);
```

- [ ] **Step 5: Run tests and tighten exceptions**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: pass. If the shipped course produces non-Basic errors, prefer rewriting learner-facing text. Only add exceptions to `basicEnglishCourseExceptions` for existing proper names or course-specific words already in production.

- [ ] **Step 6: Commit**

```powershell
git add src/content/basicEnglish850.ts src/content/validateContent.ts src/content/validateContent.test.ts
git commit -m "test: validate course vocabulary against basic english"
```

---

### Task 2: Add Story Output Metadata and UI

**Files:**
- Modify: `src/domain/types.ts`
- Modify: `src/components/OutputTaskEditor.tsx`
- Test: `src/components/OutputTaskEditor.test.tsx`

- [ ] **Step 1: Write failing story UI tests**

If `src/components/OutputTaskEditor.test.tsx` does not exist, create it. If it exists, add these tests:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { OutputTask } from '../domain/types';
import type { UserOutput } from '../storage/progressRepository';
import { OutputTaskEditor } from './OutputTaskEditor';

function output(overrides: Partial<UserOutput> = {}): UserOutput {
  return {
    id: 'output-day-029',
    dayId: 'day-029',
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    updatedAt: '2026-06-08T00:00:00.000Z',
    ...overrides,
  };
}

function task(overrides: Partial<OutputTask> = {}): OutputTask {
  return {
    id: 'day-029-output',
    topic: 'Going Out',
    prompts: ['Where do you go?'],
    template: ['I go out because I need food.'],
    requiredSentenceCount: 4,
    ...overrides,
  };
}

describe('OutputTaskEditor story guidance', () => {
  it('shows Today story sentence when storyMode is sentence', () => {
    render(
      <OutputTaskEditor
        task={task({
          storyMode: 'sentence',
          storyPrompt: 'Write one sentence you can reuse in your errand story.',
        })}
        value={output()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Today story sentence')).toBeInTheDocument();
    expect(screen.getByText('Write one sentence you can reuse in your errand story.')).toBeInTheDocument();
  });

  it('shows Story recap when storyMode is recap', () => {
    render(
      <OutputTaskEditor
        task={task({
          storyMode: 'recap',
          storyPrompt: 'Write 6-8 sentences: home -> road -> bus -> store -> pay -> home.',
        })}
        value={output()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Story recap')).toBeInTheDocument();
    expect(screen.getByText('Write 6-8 sentences: home -> road -> bus -> store -> pay -> home.')).toBeInTheDocument();
  });

  it('does not show story UI for ordinary output tasks', () => {
    render(<OutputTaskEditor task={task()} value={output()} onChange={vi.fn()} />);

    expect(screen.queryByText('Today story sentence')).not.toBeInTheDocument();
    expect(screen.queryByText('Story recap')).not.toBeInTheDocument();
  });

  it('continues updating output text with story metadata present', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <OutputTaskEditor
        task={task({ storyMode: 'sentence', storyPrompt: 'Write one story sentence.' })}
        value={output()}
        onChange={onChange}
      />,
    );

    await user.type(screen.getByLabelText('Daily output'), 'I go out.');

    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/components/OutputTaskEditor.test.tsx
```

Expected: fail because `storyMode` and `storyPrompt` are not part of `OutputTask` and UI labels do not exist.

- [ ] **Step 3: Extend the type**

Modify `src/domain/types.ts`:

```ts
export interface OutputTask {
  id: string;
  topic: string;
  prompts: string[];
  template: string[];
  requiredSentenceCount: number;
  storyMode?: 'sentence' | 'recap';
  storyPrompt?: string;
}
```

- [ ] **Step 4: Render story guidance**

Modify `src/components/OutputTaskEditor.tsx` inside the returned `<section>`, immediately after `<h3>{task.topic}</h3>`:

```tsx
      {task.storyMode ? (
        <div className="story-guidance">
          <strong>{task.storyMode === 'recap' ? 'Story recap' : 'Today story sentence'}</strong>
          {task.storyPrompt ? <p>{task.storyPrompt}</p> : null}
        </div>
      ) : null}
```

- [ ] **Step 5: Run tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/components/OutputTaskEditor.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit**

```powershell
git add src/domain/types.ts src/components/OutputTaskEditor.tsx src/components/OutputTaskEditor.test.tsx
git commit -m "feat: show errand story output guidance"
```

---

### Task 3: Add Week 5-6 Course Content

**Files:**
- Create: `src/content/week5.ts`
- Create: `src/content/week6.ts`
- Modify: `src/content/course.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Write failing course expansion tests**

In `src/content/validateContent.test.ts`, replace the V1.9-only course shape test with this V1.10 test:

```ts
  it('includes playable Week 3 through Week 6 content for V1.10', () => {
    const result = validateCourseContent(basicEnglishCourse);

    expect(result.errors).toEqual([]);
    expect(basicEnglishCourse.contentVersion).toBe('1.10.0');
    expect(basicEnglishCourse.weeks).toHaveLength(6);
    expect(basicEnglishCourse.weeks.map((week) => week.days.length)).toEqual([7, 7, 7, 7, 7, 7]);
    expect(basicEnglishCourse.weeks[4]).toMatchObject({
      id: 'week-05',
      number: 5,
      title: 'Going Out for an Errand',
    });
    expect(basicEnglishCourse.weeks[5]).toMatchObject({
      id: 'week-06',
      number: 6,
      title: 'Problems Outside',
    });
    expect(basicEnglishCourse.weeks[4].days[0]).toMatchObject({ id: 'day-029', dayNumber: 29 });
    expect(basicEnglishCourse.weeks[5].days[6]).toMatchObject({ id: 'day-042', dayNumber: 42 });
  });

  it('gives every Week 5 and Week 6 day a complete story-oriented Today content set', () => {
    const newDays = basicEnglishCourse.weeks.slice(4, 6).flatMap((week) => week.days);

    expect(newDays.map((day) => day.id)).toEqual([
      'day-029',
      'day-030',
      'day-031',
      'day-032',
      'day-033',
      'day-034',
      'day-035',
      'day-036',
      'day-037',
      'day-038',
      'day-039',
      'day-040',
      'day-041',
      'day-042',
    ]);

    for (const day of newDays) {
      const translationCount = day.exercises.filter((exercise) => exercise.type === 'translation').length;
      expect(day.wordIds.length, `${day.id} word count`).toBeGreaterThanOrEqual(6);
      expect(day.patternIds.length, `${day.id} pattern count`).toBeGreaterThanOrEqual(1);
      expect(day.exercises.length, `${day.id} exercise count`).toBeGreaterThanOrEqual(5);
      expect(translationCount, `${day.id} translation count`).toBeGreaterThanOrEqual(1);
      expect(day.outputTask.requiredSentenceCount, `${day.id} output sentences`).toBeGreaterThanOrEqual(4);
      expect(day.outputTask.storyMode, `${day.id} story mode`).toMatch(/sentence|recap/);
      expect(day.outputTask.storyPrompt, `${day.id} story prompt`).toMatch(/\S/);
    }
  });

  it('keeps Day 42 as the course completion day', () => {
    const allDays = basicEnglishCourse.weeks.flatMap((week) => week.days);

    expect(allDays.at(-1)?.id).toBe('day-042');
    expect(allDays.at(-1)?.weeklyCheckRubric).toBeDefined();
  });
```

- [ ] **Step 2: Run failing test**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: fail because Weeks 5-6 do not exist and course length is still 4.

- [ ] **Step 3: Create `src/content/week5.ts`**

Create `src/content/week5.ts` following the Week 4 style. Use these exports:

```ts
import type { Pattern, Week, Word } from '../domain/types';

export const week5Words: Word[] = [
  { id: 'outside', text: 'outside', category: 'structure', definition: 'out of a room or building', chinese: '外面', example: 'I go outside.', weekIntroduced: 5, tags: ['outside'] },
  { id: 'way', text: 'way', category: 'general_thing', definition: 'a road, direction, or method', chinese: '路；方式', example: 'I know the way.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'stop', text: 'stop', category: 'general_thing', definition: 'a place where a bus stops', chinese: '站点', example: 'I walk to the bus stop.', weekIntroduced: 5, tags: ['transport'] },
  { id: 'far', text: 'far', category: 'quality', definition: 'not near', chinese: '远的', example: 'The stop is far.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'ride', text: 'ride', category: 'operation', definition: 'to go in or on a vehicle', chinese: '乘坐', example: 'I ride the bus.', weekIntroduced: 5, tags: ['transport'] },
  { id: 'wait', text: 'wait', category: 'operation', definition: 'to stay until something happens', chinese: '等待', example: 'I wait for the bus.', weekIntroduced: 5, tags: ['transport'] },
  { id: 'seat', text: 'seat', category: 'picturable_thing', definition: 'a thing for sitting', chinese: '座位', example: 'I have a seat.', weekIntroduced: 5, tags: ['transport'] },
  { id: 'left', text: 'left', category: 'quality', definition: 'on the left side', chinese: '左边的', example: 'The store is on the left.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'right', text: 'right', category: 'quality', definition: 'on the right side; correct', chinese: '右边的；正确的', example: 'The price is right.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'straight', text: 'straight', category: 'quality', definition: 'not turning', chinese: '直的', example: 'Go straight.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'line', text: 'line', category: 'general_thing', definition: 'people waiting one after another', chinese: '队伍', example: 'I wait in line.', weekIntroduced: 5, tags: ['shopping'] },
  { id: 'turn', text: 'turn', category: 'general_thing', definition: 'a time for one person to do something', chinese: '轮次', example: 'It is my turn.', weekIntroduced: 5, tags: ['shopping'] },
  { id: 'list', text: 'list', category: 'general_thing', definition: 'a number of things written together', chinese: '清单', example: 'I have a food list.', weekIntroduced: 5, tags: ['shopping'] },
  { id: 'carry', text: 'carry', category: 'operation', definition: 'to take something in the hands or arms', chinese: '携带', example: 'I carry the bag home.', weekIntroduced: 5, tags: ['action'] },
  { id: 'back', text: 'back', category: 'structure', definition: 'to the earlier place', chinese: '回；返回', example: 'I come back home.', weekIntroduced: 5, tags: ['direction'] },
  { id: 'heavy', text: 'heavy', category: 'quality', definition: 'having much weight', chinese: '重的', example: 'The bag is heavy.', weekIntroduced: 5, tags: ['quality'] },
  { id: 'light', text: 'light', category: 'quality', definition: 'not heavy', chinese: '轻的', example: 'The bag is light.', weekIntroduced: 5, tags: ['quality'] },
];

export const week5Patterns: Pattern[] = [
  { id: 'i-go-out-because', title: 'I go out because ___.', use: 'Say why you go outside.', structure: 'I go out because {reason}.', examples: ['I go out because I need food.', 'I go out because I need water.'], slots: ['reason'] },
  { id: 'i-walk-to', title: 'I walk to ___.', use: 'Say where you walk.', structure: 'I walk to {place}.', examples: ['I walk to the bus stop.', 'I walk to the store.'], slots: ['place'] },
  { id: 'the-place-is-near-far', title: 'The ___ is near/far.', use: 'Say distance simply.', structure: 'The {place} is {distance}.', examples: ['The stop is near.', 'The store is far.'], slots: ['place', 'distance'] },
  { id: 'i-wait-for', title: 'I wait for ___.', use: 'Say what you wait for.', structure: 'I wait for {thing}.', examples: ['I wait for the bus.', 'I wait for my turn.'], slots: ['thing'] },
  { id: 'i-ride-to', title: 'I ride ___ to ___.', use: 'Say transport and place.', structure: 'I ride {transport} to {place}.', examples: ['I ride the bus to the store.', 'I ride the bus to the stop.'], slots: ['transport', 'place'] },
  { id: 'the-thing-is-left-right', title: 'The ___ is on the left/right.', use: 'Say side or direction.', structure: 'The {thing} is on the {side}.', examples: ['The bread is on the left.', 'The milk is on the right.'], slots: ['thing', 'side'] },
  { id: 'i-wait-in-line', title: 'I wait in line.', use: 'Say waiting with other people.', structure: 'I wait in line.', examples: ['I wait in line.'], slots: [] },
  { id: 'it-is-my-turn', title: 'It is my turn.', use: 'Say you can act now.', structure: 'It is my turn.', examples: ['It is my turn.'], slots: [] },
  { id: 'i-carry-home', title: 'I carry ___ home.', use: 'Say what you take home.', structure: 'I carry {thing} home.', examples: ['I carry food home.', 'I carry the bag home.'], slots: ['thing'] },
  { id: 'i-come-back-home', title: 'I come back home.', use: 'Say returning home.', structure: 'I come back home.', examples: ['I come back home.'], slots: [] },
];
```

Then add a `week5` `Week` object with Day 29-35. Each day must use the words, patterns, exercises, and story prompts from the spec. Keep all learner-facing text within the Basic English validator; use `thing I need to do` rather than adding `errand` as a word.

- [ ] **Step 4: Create `src/content/week6.ts`**

Create `src/content/week6.ts` following the Week 4 style. Use these exports:

```ts
import type { Pattern, Week, Word } from '../domain/types';

export const week6Words: Word[] = [
  { id: 'late', text: 'late', category: 'quality', definition: 'after the right time', chinese: '迟的', example: 'The bus is late.', weekIntroduced: 6, tags: ['time'] },
  { id: 'early', text: 'early', category: 'quality', definition: 'before the usual time', chinese: '早的', example: 'I am early.', weekIntroduced: 6, tags: ['time'] },
  { id: 'lost', text: 'lost', category: 'quality', definition: 'not knowing the way', chinese: '迷路的', example: 'I am lost.', weekIntroduced: 6, tags: ['problem'] },
  { id: 'wrong', text: 'wrong', category: 'opposite_quality', definition: 'not right', chinese: '错误的', example: 'The price is wrong.', weekIntroduced: 6, tags: ['problem'] },
  { id: 'another', text: 'another', category: 'structure', definition: 'one more or a different one', chinese: '另一个', example: 'Do you have another one?', weekIntroduced: 6, tags: ['shopping'] },
  { id: 'understand', text: 'understand', category: 'operation', definition: 'to get the idea of something said', chinese: '理解', example: 'I do not understand.', weekIntroduced: 6, tags: ['communication'] },
  { id: 'repeat', text: 'repeat', category: 'operation', definition: 'to say again', chinese: '重复', example: 'Please repeat that.', weekIntroduced: 6, tags: ['communication'] },
  { id: 'sorry', text: 'sorry', category: 'quality', definition: 'a polite word when there is a problem', chinese: '抱歉', example: 'Sorry, I have a problem.', weekIntroduced: 6, tags: ['polite'] },
  { id: 'excuse', text: 'excuse', category: 'operation', definition: 'a polite word used before asking', chinese: '打扰；请问', example: 'Excuse me, can you help me?', weekIntroduced: 6, tags: ['polite'] },
  { id: 'thank', text: 'thank', category: 'operation', definition: 'to say you are pleased with help', chinese: '感谢', example: 'I thank you.', weekIntroduced: 6, tags: ['polite'] },
];

export const week6Patterns: Pattern[] = [
  { id: 'i-am-lost', title: 'I am lost.', use: 'Say you do not know the way.', structure: 'I am lost.', examples: ['I am lost.'], slots: [] },
  { id: 'can-you-tell-way', title: 'Can you tell me the way?', use: 'Ask for directions.', structure: 'Can you tell me the way?', examples: ['Can you tell me the way?'], slots: [] },
  { id: 'go-direction', title: 'Go left/right/straight.', use: 'Give a simple direction.', structure: 'Go {direction}.', examples: ['Go left.', 'Go straight.'], slots: ['direction'] },
  { id: 'the-bus-is-late', title: 'The bus is late.', use: 'Say a bus time problem.', structure: 'The bus is late.', examples: ['The bus is late.'], slots: [] },
  { id: 'i-do-not-have-enough', title: 'I do not have enough ___.', use: 'Say you lack enough of something.', structure: 'I do not have enough {thing}.', examples: ['I do not have enough time.', 'I do not have enough money.'], slots: ['thing'] },
  { id: 'i-cannot-find', title: 'I cannot find ___.', use: 'Say you cannot find a thing.', structure: 'I cannot find {thing}.', examples: ['I cannot find bread.', 'I cannot find the store.'], slots: ['thing'] },
  { id: 'do-you-have-another', title: 'Do you have another ___?', use: 'Ask for a different thing.', structure: 'Do you have another {thing}?', examples: ['Do you have another cup?', 'Do you have another one?'], slots: ['thing'] },
  { id: 'i-do-not-understand', title: 'I do not understand.', use: 'Say you do not understand.', structure: 'I do not understand.', examples: ['I do not understand.'], slots: [] },
  { id: 'please-say-again', title: 'Please say it again.', use: 'Ask for repetition using Basic English.', structure: 'Please say it again.', examples: ['Please say it again.'], slots: [] },
  { id: 'excuse-can-help', title: 'Excuse me, can you help me?', use: 'Ask politely for help.', structure: 'Excuse me, can you help me?', examples: ['Excuse me, can you help me?'], slots: [] },
  { id: 'thank-you-help', title: 'Thank you for your help.', use: 'Thank someone politely.', structure: 'Thank you for your help.', examples: ['Thank you for your help.'], slots: [] },
];
```

Then add a `week6` `Week` object with Day 36-42. Day 42 must include a `weeklyCheckRubric` with a `minimumSentenceCount` no greater than the output template length.

- [ ] **Step 5: Wire Weeks 5-6 into `course.ts`**

Modify `src/content/course.ts`:

```ts
import { week5, week5Patterns, week5Words } from './week5';
import { week6, week6Patterns, week6Words } from './week6';
```

Update the course:

```ts
  contentVersion: '1.10.0',
  words: [...week1Words, ...week2Words, ...week3Words, ...week4Words, ...week5Words, ...week6Words],
  patterns: [...week1Patterns, ...week2Patterns, ...week3Patterns, ...week4Patterns, ...week5Patterns, ...week6Patterns],
  weeks: [week1, week2, week3, week4, week5, week6],
```

- [ ] **Step 6: Run content tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected at this point: content shape tests pass or fail only on missing scene remix, picture describe, image, and scenario capability references that are intentionally handled in later tasks. If Basic English vocabulary errors appear, rewrite the Week 5-6 content before continuing.

- [ ] **Step 7: Commit**

```powershell
git add src/content/week5.ts src/content/week6.ts src/content/course.ts src/content/validateContent.test.ts
git commit -m "feat: add v1.10 week five and six course content"
```

---

### Task 4: Add Scenario Capabilities, Scene Goals, and Remix Tasks

**Files:**
- Modify: `src/content/scenarioCapabilities.ts`
- Modify: `src/content/sceneGoals.ts`
- Modify: `src/content/sceneRemixTasks.ts`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Add failing validation expectations**

In the `scene goals` validation test, update the expected array construction to include Week 5-6 day ids:

```ts
    const weekThreeThroughSixDayIds = basicEnglishCourse.weeks
      .slice(2, 6)
      .flatMap((week) => week.days.map((day) => day.id));

    expect(Object.keys(sceneGoalsByDayId)).toEqual(
      expect.arrayContaining(['day-001', 'day-008', 'day-009', 'day-010', ...weekThreeThroughSixDayIds]),
    );
```

Add a new scenario capability assertion:

```ts
  it('adds Week 5 and Week 6 scenario capabilities', () => {
    expect(scenarioCapabilities.map((capability) => capability.id)).toEqual(
      expect.arrayContaining(['errand-story', 'outside-problems']),
    );
    expect(validateScenarioCapabilities(scenarioCapabilities, basicEnglishCourse).errors).toEqual([]);
  });
```

- [ ] **Step 2: Run failing tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: fail because Week 5-6 scene goals and capabilities are not registered.

- [ ] **Step 3: Add scenario capabilities**

In `src/content/scenarioCapabilities.ts`, add two capabilities:

```ts
  {
    id: 'errand-story',
    title: 'I can tell an errand story.',
    description: 'Describe going out, taking a bus, finding things, paying, and coming back home.',
    unlockedByDayIds: ['day-035'],
    exampleOutputs: [
      'I go out because I need food. I walk to the bus stop. I ride the bus to the store. I buy food and come back home.',
    ],
  },
  {
    id: 'outside-problems',
    title: 'I can ask for help outside.',
    description: 'Describe a problem outside and ask another person for help politely.',
    unlockedByDayIds: ['day-042'],
    exampleOutputs: [
      'I am lost. I ask for help. The person tells me the way. I say thank you.',
    ],
  },
```

Also update `scenarioWeekMap` entries for week 5 and week 6:

```ts
  {
    weekNumber: 5,
    theme: 'Going Out for an Errand',
    expressionOutcome: 'Tell a complete outside errand story.',
  },
  {
    weekNumber: 6,
    theme: 'Problems Outside',
    expressionOutcome: 'Describe outside problems and ask for help politely.',
  },
```

- [ ] **Step 4: Add scene goals for Day 29-42**

In `src/content/sceneGoals.ts`, extend `SceneGoalDayId` with `'day-029'` through `'day-042'`.

Add records. Use this pattern for all fourteen days:

```ts
  'day-029': {
    id: 'getting-ready-to-go-out',
    title: 'Getting Ready to Go Out',
    capability: 'I can say why I go out and what I take.',
    templates: ['I go out because I need ____.', 'I take my ____.', 'I have a list.', 'I am ready to go.'],
    guidedPrompts: ['Say why you go out.', 'Say what you take.', 'Say what you have.', 'Say that you are ready.'],
    scenePrompt: 'Describe getting ready to go out.',
    dialoguePrompts: ['Ask and answer why you go out.', 'Ask and answer what you take.'],
  },
```

For Day 30-42, use these exact ids and titles:

```text
day-030: walking-to-the-bus-place / Walking to the Bus Place
day-031: taking-the-bus / Taking the Bus
day-032: finding-things-in-store / Finding Things in the Store
day-033: waiting-and-paying / Waiting and Paying
day-034: coming-back-home / Coming Back Home
day-035: errand-story-recap / Errand Story Recap
day-036: asking-the-way / Asking the Way
day-037: late-bus-time-problem / Late Bus and Time Problem
day-038: store-does-not-have-it / The Store Does Not Have It
day-039: not-enough-money / Not Enough Money
day-040: ask-again / Ask Again
day-041: polite-help / Polite Help
day-042: problem-story-recap / Problem Story Recap
```

Keep each scene goal at 4 templates, 4 guided prompts, 1 scene prompt, and 2 dialogue prompts.

- [ ] **Step 5: Add scene remix tasks**

In `src/content/sceneRemixTasks.ts`, add one task per Day 29-42:

```ts
  'day-029': [
    {
      id: 'day-029-remix-food-water',
      type: 'replace',
      prompt: 'Change food to water.',
      source: 'I go out because I need food.',
      referenceAnswers: ['I go out because I need water.'],
    },
  ],
```

Use these exact ids and prompts for the remaining days:

```text
day-030-remix-stop-store: Change bus stop to store. -> I walk to the store.
day-031-remix-store-home: Change store to home. -> I ride the bus home.
day-032-remix-bread-milk: Change bread to milk. -> I find milk in the store.
day-033-remix-food-bread: Change food to bread. -> I wait in line and pay for bread.
day-034-remix-food-bag: Change food to bag. -> I carry the bag home.
day-035-remix-errand-story: Add two more sentences to the errand story. -> I wait in line. I come back home.
day-036-remix-left-right: Change left to right. -> Go right.
day-037-remix-bus-time: Change bus to time. -> I wait for more time.
day-038-remix-bread-cup: Change bread to cup. -> I cannot find a cup.
day-039-remix-money-time: Change money to time. -> I do not have enough time.
day-040-remix-understand-hear: Change understand to hear. -> I do not hear.
day-041-remix-help-answer: Change help to answer. -> Thank you for your answer.
day-042-remix-problem-story: Add two more sentences to the problem story. -> I ask for help. I say thank you.
```

If `hear` is rejected by Basic English validation, use `I do not get the answer.` and update the prompt to `Change understand to get the answer.`

- [ ] **Step 6: Run tests and commit**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: scenario and remix validation pass, with remaining failures only for picture describe and image registration if those tasks are not done yet.

Commit:

```powershell
git add src/content/scenarioCapabilities.ts src/content/sceneGoals.ts src/content/sceneRemixTasks.ts src/content/validateContent.test.ts
git commit -m "feat: add errand story scene practice content"
```

---

### Task 5: Register Picture Describe Tasks and Images

**Files:**
- Modify: `src/content/pictureDescribeTasks.ts`
- Add: `src/assets/picture-describe/day-029-getting-ready-to-go-out.png` through `day-042-problem-story-recap.png`
- Test: `src/content/validateContent.test.ts`

- [ ] **Step 1: Write or update failing picture task expectations**

The existing test `has one task for every playable course day` should fail after Week 5-6 are added. Keep it as the failing test.

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: fail because Day 29-42 picture tasks are missing.

- [ ] **Step 2: Generate first three picture scene samples**

Use `image_gen` for Day 29-31 only first.

Day 29 prompt:

```text
Create a 512x512 Basic English picture-description scene showing a learner at home getting ready to go outside. The learner puts a wallet, a small blank paper list, and a water bottle into a bag near a door.
Style: warm polished cartoon daily-life illustration matching the accepted Week 1/2 picture describe assets, natural perspective, soft shadows, clear objects, friendly character.
Composition: one complete room scene, not a collage or comic strip, readable at learning-card size.
Constraints: no text, no Chinese, no watermark, no labels, no arrows, no speech bubbles, no readable writing on the list, no multi-panel layout.
```

Day 30 prompt:

```text
Create a 512x512 Basic English picture-description scene showing a learner walking from home along a quiet road toward a simple bus stop shelter.
Style: warm polished cartoon daily-life illustration matching the accepted Week 1/2 picture describe assets, natural perspective, soft shadows, clear objects, friendly character.
Composition: one complete outdoor scene, not a collage or comic strip, readable at learning-card size.
Constraints: no text, no Chinese, no watermark, no labels, no arrows, no speech bubbles, no readable signs, no route numbers, no multi-panel layout.
```

Day 31 prompt:

```text
Create a 512x512 Basic English picture-description scene showing a learner riding a bus and sitting on a seat with a bag, looking out the window toward a small store street.
Style: warm polished cartoon daily-life illustration matching the accepted Week 1/2 picture describe assets, natural perspective, soft shadows, clear objects, friendly character.
Composition: one complete bus interior scene, not a collage or comic strip, readable at learning-card size.
Constraints: no text, no Chinese, no watermark, no labels, no arrows, no speech bubbles, no route numbers, no readable signs, no multi-panel layout.
```

Copy generated files into the target paths and create `tmp/image-style-candidates/picture-week5-sample-sheet.png`. Visually inspect with `view_image`.

- [ ] **Step 3: Generate remaining Day 32-42 picture scenes**

Generate and save the remaining images with these scene descriptions:

```text
day-032: learner inside a warm grocery store looking at shelves and asking a worker for help, no readable shelf labels
day-033: learner waiting in a short line at a shop counter and paying for bread and milk, no prices or numbers
day-034: learner coming back home with a shopping bag and putting food on a table
day-035: one complete errand recap scene showing home door, road, bus stop, small store, and return home in one natural perspective scene, not a collage
day-036: learner at a street corner politely asking a friendly person for the way, no readable street signs
day-037: learner waiting at a bus stop with a concerned face and a bus far down the road, no timetable text
day-038: learner in a store looking at an empty shelf area and asking a worker for another item, no labels
day-039: learner at a shop counter with a small item and not enough money, no visible numbers or price tags
day-040: learner speaking politely with a worker and asking them to say it again, no speech bubbles
day-041: learner politely asking a person for help outside a store, friendly body language, no signs
day-042: complete problem-solving scene outside with learner asking for help and continuing toward a store, no text
```

Create contact sheets in batches of 5 and inspect each before committing.

- [ ] **Step 4: Register picture tasks**

In `src/content/pictureDescribeTasks.ts`, import the images:

```ts
import day029Image from '../assets/picture-describe/day-029-getting-ready-to-go-out.png';
```

Repeat through `day042Image`.

Add task records for Day 29-42. Use this Day 29 shape:

```ts
  'day-029': {
    id: 'picture-day-029-getting-ready-to-go-out',
    dayId: 'day-029',
    title: 'Getting Ready to Go Out',
    goal: 'Say why the learner goes out and what the learner takes.',
    image: day029Image,
    targetWords: ['outside', 'bag', 'list', 'carry', 'ready'],
    suggestedPatterns: ['I go out because I need food.', 'I take my bag.', 'I am ready to go.'],
    requiredSentenceCount: 4,
    simpleVersion: ['I go out because I need food.', 'I take my bag.', 'I have a list.', 'I am ready to go.'],
  },
```

For Day 30-42, use titles and image ids matching the file names, 4-6 target words, 2-3 suggested patterns, `requiredSentenceCount: 4` for ordinary days and `6` for recap days. `simpleVersion.length` must equal `requiredSentenceCount`.

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts
```

Expected: picture describe tests pass.

Commit:

```powershell
git add src/content/pictureDescribeTasks.ts src/assets/picture-describe/day-029-getting-ready-to-go-out.png src/assets/picture-describe/day-030-walking-to-the-bus-place.png src/assets/picture-describe/day-031-taking-the-bus.png src/assets/picture-describe/day-032-finding-things-in-store.png src/assets/picture-describe/day-033-waiting-and-paying.png src/assets/picture-describe/day-034-coming-back-home.png src/assets/picture-describe/day-035-errand-story-recap.png src/assets/picture-describe/day-036-asking-the-way.png src/assets/picture-describe/day-037-late-bus-time-problem.png src/assets/picture-describe/day-038-store-does-not-have-it.png src/assets/picture-describe/day-039-not-enough-money.png src/assets/picture-describe/day-040-ask-again.png src/assets/picture-describe/day-041-polite-help.png src/assets/picture-describe/day-042-problem-story-recap.png
git commit -m "feat: add v1.10 picture describe scenes"
```

---

### Task 6: Generate and Register New Word Flashcard Images

**Files:**
- Add: `src/assets/word-flashcards/*.png` for each new word
- Modify: `src/content/wordFlashcardImages.ts`
- Test: `src/content/validateContent.test.ts`, `src/components/WordsPage.test.tsx`

- [ ] **Step 1: Confirm missing image failures**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts src/components/WordsPage.test.tsx
```

Expected: fail for Week 5-6 words missing flashcard images.

- [ ] **Step 2: Generate first sample batch**

Generate these five sample word flashcards:

```text
outside: scene, learner stepping out of a home door into warm daylight, no text
way: scene, simple road path through neighborhood, clear direction through perspective, no arrows
stop: concrete/scene, simple bus stop shelter with bench and road, no signs or route numbers
ride: scene, learner riding on a bus seat, no text
line: scene, three friendly people waiting one after another at a shop counter, no signs
```

Use the AGENTS.md prompt pattern. Save at `512x512`. Create a contact sheet comparing these with accepted `bus`, `road`, `shop`, `store`, and `walk`.

- [ ] **Step 3: Generate remaining word flashcards**

Generate the remaining words in batches of 5:

```text
wait, late, early, seat, left
right, straight, far, turn, list
carry, back, heavy, light, lost
wrong, another, understand, repeat, sorry
excuse, thank
```

For grammar-like polite words (`sorry`, `excuse`, `thank`) use grammar cards only if a concrete scene becomes unclear. Otherwise prefer a polite help scene with no text.

- [ ] **Step 4: Register images**

In `src/content/wordFlashcardImages.ts`, import each new image and add records. Use this pattern:

```ts
import outsideImage from '../assets/word-flashcards/outside.png';
```

Add records near the Week 5-6 section:

```ts
  wordImageAsset('outside', outsideImage, 'place', 'scene', 'none', 'A simple outside scene for a learner going out.'),
  wordImageAsset('way', wayImage, 'place', 'scene', 'none', 'A simple road and path scene for the word way.'),
  wordImageAsset('stop', stopImage, 'place', 'scene', 'none', 'A simple bus stop place scene with no text.'),
```

Use these metadata assignments:

```text
outside place scene none
way place scene none
stop place scene none
far position relation none
ride action scene none
wait action scene none
seat object concrete none
left position relation none
right position relation none
straight position relation none
line abstract scene none
turn abstract scene none
list object concrete none
carry action scene none
back structure grammar english-keyword
heavy quality scene none
light quality scene none
late time scene none
early time scene none
lost quality scene none
wrong quality scene none
another structure grammar english-keyword
understand action scene none
repeat action scene none
sorry quality scene none
excuse action scene none
thank action scene none
```

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/content/validateContent.test.ts src/components/WordsPage.test.tsx
```

Expected: image coverage and metadata tests pass.

Commit:

```powershell
git add src/assets/word-flashcards src/content/wordFlashcardImages.ts
git commit -m "feat: add v1.10 word flashcard images"
```

---

### Task 7: Add Today and Completion Test Coverage

**Files:**
- Modify: `src/components/TodayPage.test.tsx`
- Modify: `src/components/CoursePage.test.tsx`
- Modify: `src/components/MePage.test.tsx`
- Modify any test that asserts Day 28 is final

- [ ] **Step 1: Add Today story rendering tests**

In `src/components/TodayPage.test.tsx`, add tests that select Day 29 and Day 42. Use the repository setup helpers already present in the file.

Add assertions equivalent to:

```ts
expect(await screen.findByText('Today story sentence')).toBeInTheDocument();
expect(screen.getByText('Write one sentence you can reuse in your outside story.')).toBeInTheDocument();
```

For Day 42:

```ts
expect(await screen.findByText('Story recap')).toBeInTheDocument();
expect(screen.getByText(/problem -> ask -> answer\/help -> action -> result -> thank/i)).toBeInTheDocument();
```

- [ ] **Step 2: Update final-day expectations**

Search:

```powershell
rg -n "day-028|Day 28|28 days|4 weeks|contentVersion|1\\.9\\.0" src tests
```

Update final course expectations to:

```text
day-042
Day 42
42 days
6 weeks
1.10.0
```

Do not change historical test names unless they become misleading.

- [ ] **Step 3: Run component tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**" src/components/TodayPage.test.tsx src/components/CoursePage.test.tsx src/components/MePage.test.tsx
```

Expected: pass.

- [ ] **Step 4: Commit**

```powershell
git add src/components/TodayPage.test.tsx src/components/CoursePage.test.tsx src/components/MePage.test.tsx
git commit -m "test: cover v1.10 story days"
```

---

### Task 8: Full Verification, Build, and Release-Ready Cleanup

**Files:**
- Review all touched files
- Remove `tmp/` contact sheets before commit

- [ ] **Step 1: Run full tests**

Run:

```powershell
npm test -- --run --exclude ".worktrees/**"
```

Expected: all test files pass.

- [ ] **Step 2: Run build**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build succeed.

- [ ] **Step 3: Check asset coverage and low-size image sanity**

Run:

```powershell
$content = Get-Content src\content\wordFlashcardImages.ts -Raw
$ids = [regex]::Matches($content, "wordImageAsset\('([^']+)'") | ForEach-Object { $_.Groups[1].Value }
$missing = @()
foreach ($id in $ids) { if (-not (Test-Path "src\assets\word-flashcards\$id.png")) { $missing += $id } }
[pscustomobject]@{ RegisteredWords=$ids.Count; MissingImages=$missing.Count; MissingList=($missing -join ', ') }
Get-ChildItem src\assets\word-flashcards -File -Filter *.png | Sort-Object Length | Select-Object -First 25 Name,@{Name='KB';Expression={[math]::Round($_.Length/1KB,1)}}
```

Expected:

```text
MissingImages: 0
```

Small files should be grammar cards only.

- [ ] **Step 4: Remove temporary files**

Run:

```powershell
Remove-Item -Recurse -Force tmp -ErrorAction SilentlyContinue
git status --short
```

Expected: no `tmp/` files.

- [ ] **Step 5: Commit final cleanup if needed**

If any source/test cleanup remains:

```powershell
git add <changed-files>
git commit -m "chore: finalize v1.10 errand story release"
```

If no cleanup remains, do not create an empty commit.

---

## Self-Review

Spec coverage:

- Week 5-6 course content: Task 3.
- Story sentence and recap UI: Task 2 and Task 7.
- Basic English 850 validation: Task 1.
- Scenario capabilities: Task 4.
- Scene goals and scene remix: Task 4.
- Picture describe tasks and images: Task 5.
- Word flashcard images and metadata: Task 6.
- Course validation, image coverage, Today rendering, build: Tasks 1, 3, 5, 6, 7, 8.

No scope gaps found. The plan intentionally avoids conversation engines, voice recording, pronunciation scoring, backend sync, cross-day aggregation, new routes, and route-map UI.

Placeholder scan:

- The plan contains no unresolved placeholder markers.
- Image generation tasks use exact prompts or exact scene descriptions.
- Content tasks provide exact new words, patterns, metadata, test commands, and commit commands.

Type consistency:

- `OutputTask.storyMode?: 'sentence' | 'recap'` and `OutputTask.storyPrompt?: string` are introduced in Task 2 and used by later tasks.
- Validation export is consistently named `validateBasicEnglishVocabulary`.
- New course version is consistently `1.10.0`.
