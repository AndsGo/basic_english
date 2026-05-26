import { useEffect, useMemo, useRef, useState } from 'react';
import { checkExerciseAnswer, type ExerciseAnswer, type ExerciseResult } from '../domain/exercises';
import { completeStep, getCurrentDayId, type DayProgress, startDay, type StepId } from '../domain/progress';
import {
  createExerciseReviewItem,
  createOutputReviewItem,
  createTranslationReviewItem,
  createWordReviewItem,
  type ReviewItem,
} from '../domain/review';
import {
  getDrillsCompletion,
  getOutputCompletion,
  getPatternsCompletion,
  getTranslationCompletion,
  getWordsCompletion,
  type TranslationDraft,
  type WordMark,
} from '../domain/stepCompletion';
import type { Course, Exercise, TranslationExercise, Word } from '../domain/types';
import type { ProgressRepository, UserOutput } from '../storage/progressRepository';
import { CompletionSummary } from './CompletionSummary';
import { ExerciseRenderer } from './ExerciseRenderer';
import { OutputTaskEditor } from './OutputTaskEditor';
import { PatternCards } from './PatternCards';
import { Stepper } from './Stepper';
import { TranslationTask } from './TranslationTask';
import { WordCards } from './WordCards';

function createInitialOutput(dayId: string): UserOutput {
  return {
    id: `output-${dayId}`,
    dayId,
    text: '',
    sentenceCount: 0,
    selfRating: 'ok',
    checklist: {
      usedTargetPattern: false,
      usedLessonWords: false,
      hasSubjects: false,
      meaningIsClear: false,
    },
    updatedAt: new Date().toISOString(),
  };
}

function getReferenceAnswer(exercise: Exercise): string | undefined {
  if (exercise.type === 'choice') return exercise.correctOption;
  if (exercise.type === 'fill_blank') return exercise.acceptedAnswers[0];
  if (exercise.type === 'sentence_order') return exercise.finalSentence;
  if (exercise.type === 'replacement') return exercise.referenceAnswer;
  return exercise.referenceAnswers[0];
}

function getExercisePrompt(exercise: Exercise): string {
  if (exercise.type === 'choice' || exercise.type === 'fill_blank') return exercise.prompt;
  if (exercise.type === 'sentence_order') return 'Put the words in order';
  if (exercise.type === 'replacement') return Object.values(exercise.slotValues).join(', ');
  return exercise.chinesePrompt;
}

function formatAnswer(answer: ExerciseAnswer): string {
  return Array.isArray(answer) ? answer.join(' ') : answer;
}

function hasAnswerInput(answer: ExerciseAnswer | undefined): answer is ExerciseAnswer {
  if (answer === undefined) return false;
  if (typeof answer === 'string') return answer.trim().length > 0;
  return answer.length > 0;
}

function makeStepCompletionId(dayId: string, stepId: StepId): string {
  return `completion-${dayId}-${stepId}`;
}

function makeAttemptId(dayId: string, exerciseId: string, now: string): string {
  return `attempt-${dayId}-${exerciseId}-${now}`;
}

export function TodayPage({
  course,
  repository,
  showChineseHelp = false,
}: {
  course: Course;
  repository: ProgressRepository;
  showChineseHelp?: boolean;
}) {
  const allDays = useMemo(() => course.weeks.flatMap((week) => week.days), [course.weeks]);
  const orderedDayIds = useMemo(() => allDays.map((courseDay) => courseDay.id), [allDays]);
  const [selectedDayId, setSelectedDayId] = useState(() => orderedDayIds[0]);
  const day = allDays.find((courseDay) => courseDay.id === selectedDayId) ?? allDays[0];
  const [dayProgress, setDayProgress] = useState<DayProgress>(() =>
    startDay(day.id, course.contentVersion, new Date().toISOString()),
  );
  const [outputDraft, setOutputDraft] = useState<UserOutput>(() => createInitialOutput(day.id));
  const [wordMarks, setWordMarks] = useState<Record<string, WordMark | undefined>>({});
  const [practicedPatternIds, setPracticedPatternIds] = useState<Set<string>>(() => new Set());
  const [drillAnswers, setDrillAnswers] = useState<Record<string, ExerciseAnswer | undefined>>({});
  const [translationDrafts, setTranslationDrafts] = useState<Record<string, TranslationDraft | undefined>>({});
  const [activeReviewItems, setActiveReviewItems] = useState<ReviewItem[]>([]);
  const [isCourseHydrating, setIsCourseHydrating] = useState(true);
  const [isDayHydrating, setIsDayHydrating] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const selectedDayIdRef = useRef(selectedDayId);
  const outputSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const words = useMemo(() => course.words.filter((word) => day.wordIds.includes(word.id)), [course.words, day.wordIds]);
  const patterns = useMemo(() => course.patterns.filter((pattern) => day.patternIds.includes(pattern.id)), [course.patterns, day.patternIds]);
  const drillExercises = useMemo(() => day.exercises.filter((exercise) => exercise.type !== 'translation'), [day.exercises]);
  const translationExercises = useMemo(
    () => day.exercises.filter((exercise): exercise is TranslationExercise => exercise.type === 'translation'),
    [day.exercises],
  );
  const currentStep = dayProgress.currentStep;
  const isHydrating = isCourseHydrating || isDayHydrating;

  useEffect(() => {
    selectedDayIdRef.current = selectedDayId;
  }, [selectedDayId]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseProgress() {
      setIsCourseHydrating(true);
      const [allProgress, activeReviews] = await Promise.all([
        repository.listDayProgress(),
        repository.listReviewItems('active'),
      ]);
      if (!isMounted) return;

      const completedDayIds = allProgress
        .filter((progress) => progress.status === 'completed' || progress.currentStep === 'done')
        .map((progress) => progress.dayId);
      setActiveReviewItems(activeReviews);
      const nextDayId = getCurrentDayId(completedDayIds, orderedDayIds);
      if (nextDayId !== selectedDayIdRef.current) setIsDayHydrating(true);
      setSelectedDayId(nextDayId);
      setIsCourseHydrating(false);
    }

    void loadCourseProgress();

    return () => {
      isMounted = false;
    };
  }, [orderedDayIds, repository]);

  useEffect(() => {
    let isMounted = true;

    async function loadSavedProgress() {
      setIsDayHydrating(true);
      const [savedProgress, savedOutput] = await Promise.all([
        repository.getDayProgress(day.id),
        repository.getUserOutput(day.id),
      ]);

      if (!isMounted) return;
      setDayProgress(savedProgress ?? startDay(day.id, course.contentVersion, new Date().toISOString()));
      setOutputDraft(savedOutput ?? createInitialOutput(day.id));
      setWordMarks({});
      setPracticedPatternIds(new Set());
      setDrillAnswers({});
      setTranslationDrafts({});
      setIsDayHydrating(false);
    }

    void loadSavedProgress();

    return () => {
      isMounted = false;
    };
  }, [day.id, repository]);

  const currentGate = useMemo(() => {
    if (currentStep === 'words') return getWordsCompletion(day.wordIds, wordMarks);
    if (currentStep === 'patterns') return getPatternsCompletion(day.patternIds, practicedPatternIds);
    if (currentStep === 'drills') return getDrillsCompletion(drillExercises.map((exercise) => exercise.id), drillAnswers);
    if (currentStep === 'translate') return getTranslationCompletion(translationExercises.map((exercise) => exercise.id), translationDrafts);
    if (currentStep === 'output') return getOutputCompletion(outputDraft, day.outputTask.requiredSentenceCount);
    return { isComplete: true, missingRequirements: [] };
  }, [
    currentStep,
    day.wordIds,
    day.patternIds,
    day.outputTask.requiredSentenceCount,
    wordMarks,
    practicedPatternIds,
    drillExercises,
    drillAnswers,
    translationExercises,
    translationDrafts,
    outputDraft,
  ]);

  const nextDay = useMemo(() => allDays[allDays.findIndex((courseDay) => courseDay.id === day.id) + 1], [allDays, day.id]);

  const saveReviewItem = async (item: ReviewItem) => {
    await repository.saveReviewItem(item);
    setActiveReviewItems(await repository.listReviewItems('active'));
  };

  const dayReviewCount = activeReviewItems.filter((item) => item.sourceDayId === day.id).length;

  const enqueueOutputSave = (output: UserOutput) => {
    const save = outputSaveQueue.current
      .catch(() => undefined)
      .then(() => repository.saveUserOutput(output));
    outputSaveQueue.current = save.catch(() => undefined);
    return save;
  };

  const saveOutputDraft = (output: UserOutput) => {
    setOutputDraft(output);
    void enqueueOutputSave(output);
  };

  const markWord = (word: Word, mark: WordMark) => {
    const now = new Date().toISOString();
    setWordMarks((current) => ({ ...current, [word.id]: mark }));
    void repository.saveWordProgress({
      id: word.id,
      wordId: word.id,
      status: mark,
      seenCount: 1,
      correctCount: mark === 'known' ? 1 : 0,
      lastSeenAt: now,
      updatedAt: now,
    });
    if (mark === 'review') {
      void saveReviewItem(createWordReviewItem({ wordId: word.id, wordText: word.text, sourceDayId: day.id, now }));
    }
  };

  const handleDrillAnswer = (exerciseId: string, answer: ExerciseAnswer, _result: ExerciseResult) => {
    setDrillAnswers((current) => ({ ...current, [exerciseId]: answer }));
  };

  const persistIncorrectDrillReviews = async (now: string) => {
    for (const exercise of drillExercises) {
      const answer = drillAnswers[exercise.id];
      if (!hasAnswerInput(answer) || checkExerciseAnswer(exercise, answer) !== 'incorrect') continue;

      await repository.saveExerciseAttempt({
        id: makeAttemptId(day.id, exercise.id, now),
        exerciseId: exercise.id,
        dayId: day.id,
        answer,
        result: 'incorrect',
        createdAt: now,
      });
      await saveReviewItem(
        createExerciseReviewItem({
          exerciseId: exercise.id,
          sourceDayId: day.id,
          prompt: getExercisePrompt(exercise),
          userAnswer: formatAnswer(answer),
          referenceAnswer: getReferenceAnswer(exercise),
          now,
        }),
      );
    }
  };

  const handleTranslationDraftChange = (exerciseId: string, draft: TranslationDraft) => {
    const exercise = translationExercises.find((item) => item.id === exerciseId);
    const previous = translationDrafts[exerciseId];
    const now = new Date().toISOString();
    setTranslationDrafts((current) => ({ ...current, [exerciseId]: draft }));

    if (!exercise || draft.selfMark !== 'review' || previous?.selfMark === 'review') return;

    void saveReviewItem(
      createTranslationReviewItem({
        exerciseId,
        sourceDayId: day.id,
        prompt: exercise.chinesePrompt,
        userAnswer: draft.answer ?? '',
        referenceAnswer: exercise.referenceAnswers[0],
        now,
      }),
    );
  };

  const moveNext = async () => {
    if (isHydrating || isAdvancing || !currentGate.isComplete) return;

    const now = new Date().toISOString();
    const updatedProgress = completeStep(dayProgress, currentStep, now);
    setIsAdvancing(true);
    try {
      if (currentStep === 'drills') {
        await persistIncorrectDrillReviews(now);
      }
      if (updatedProgress.currentStep === 'done') {
        await enqueueOutputSave(outputDraft);
        if (outputDraft.selfRating === 'hard') {
          await saveReviewItem(createOutputReviewItem({ sourceDayId: day.id, text: outputDraft.text, now }));
        }
      }
      await repository.saveStepCompletion({
        id: makeStepCompletionId(day.id, currentStep),
        dayId: day.id,
        stepId: currentStep,
        isComplete: currentGate.isComplete,
        completedAt: now,
        summary: {
          practicedCount:
            currentStep === 'words'
              ? Object.values(wordMarks).filter(Boolean).length
              : currentStep === 'patterns'
                ? practicedPatternIds.size
                : undefined,
          reviewCreatedCount: dayReviewCount,
          missingRequirements: currentGate.missingRequirements,
        },
      });
      await repository.saveDayProgress(updatedProgress);
      setDayProgress(updatedProgress);
    } finally {
      setIsAdvancing(false);
    }
  };

  const startNextDay = async () => {
    if (!nextDay) return;
    const nextProgress = startDay(nextDay.id, course.contentVersion, new Date().toISOString());
    await repository.saveDayProgress(nextProgress);
    setIsDayHydrating(true);
    setSelectedDayId(nextDay.id);
  };

  const hasStickyNext = currentStep !== 'done';

  return (
    <section className={hasStickyNext ? 'today today--with-sticky-next' : 'today'}>
      <div className="today-header panel">
        <p className="eyebrow">Week 1 / Day {day.dayNumber}</p>
        <h2>{day.title}</h2>
        <p>{day.goal}</p>
        <p className="time-label">{day.estimatedMinutes} minutes</p>
        <Stepper currentStep={currentStep} />
      </div>

      <div className="panel today-step-panel">
        {currentStep === 'review' && (
          <section>
            <h3>Quick Review</h3>
            <p>Day 1 has no review. Start with today&apos;s words.</p>
          </section>
        )}
        {currentStep === 'words' && (
          <WordCards
            words={words}
            showChineseHelp={showChineseHelp}
            marks={wordMarks}
            onReview={(wordId) => {
              const word = words.find((item) => item.id === wordId);
              if (word) markWord(word, 'review');
            }}
            onKnow={(wordId) => {
              const word = words.find((item) => item.id === wordId);
              if (word) markWord(word, 'known');
            }}
          />
        )}
        {currentStep === 'patterns' && (
          <PatternCards
            patterns={patterns}
            practicedPatternIds={practicedPatternIds}
            onPractice={(patternId) => setPracticedPatternIds((current) => new Set([...current, patternId]))}
          />
        )}
        {currentStep === 'drills' && <ExerciseRenderer exercises={drillExercises} answers={drillAnswers} onAnswer={handleDrillAnswer} />}
        {currentStep === 'translate' && (
          <TranslationTask exercises={translationExercises} drafts={translationDrafts} onDraftChange={handleTranslationDraftChange} />
        )}
        {currentStep === 'output' && <OutputTaskEditor task={day.outputTask} value={outputDraft} onChange={saveOutputDraft} />}
        {currentStep === 'done' && (
          <CompletionSummary
            day={day}
            output={outputDraft}
            reviewCount={dayReviewCount}
            nextDay={nextDay}
            onStartNextDay={startNextDay}
          />
        )}
      </div>

      {!currentGate.isComplete && (
        <div className="requirement-list" role="status">
          {currentGate.missingRequirements.map((requirement) => (
            <p key={requirement}>{requirement}</p>
          ))}
        </div>
      )}

      {hasStickyNext && (
        <button
          type="button"
          className="sticky-next primary-button"
          onClick={moveNext}
          disabled={isHydrating || isAdvancing || !currentGate.isComplete}
        >
          Continue
        </button>
      )}
    </section>
  );
}
