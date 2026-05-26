import { useEffect, useMemo, useRef, useState } from 'react';
import type { Course, TranslationExercise } from '../domain/types';
import { completeStep, type DayProgress, startDay } from '../domain/progress';
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

export function TodayPage({
  course,
  repository,
  showChineseHelp = false,
}: {
  course: Course;
  repository: ProgressRepository;
  showChineseHelp?: boolean;
}) {
  const day = course.weeks[0].days[0];
  const [dayProgress, setDayProgress] = useState<DayProgress>(() =>
    startDay(day.id, course.contentVersion, new Date().toISOString()),
  );
  const [outputDraft, setOutputDraft] = useState<UserOutput>(() => createInitialOutput(day.id));
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const outputSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const words = useMemo(() => course.words.filter((word) => day.wordIds.includes(word.id)), [course.words, day.wordIds]);
  const patterns = useMemo(() => course.patterns.filter((pattern) => day.patternIds.includes(pattern.id)), [course.patterns, day.patternIds]);
  const translationExercises = day.exercises.filter((exercise): exercise is TranslationExercise => exercise.type === 'translation');
  const currentStep = dayProgress.currentStep;

  useEffect(() => {
    let isMounted = true;

    async function loadSavedProgress() {
      setIsHydrating(true);
      const [savedProgress, savedOutput] = await Promise.all([
        repository.getDayProgress(day.id),
        repository.getUserOutput(day.id),
      ]);

      if (!isMounted) return;
      if (savedProgress) setDayProgress(savedProgress);
      if (savedOutput) setOutputDraft(savedOutput);
      setIsHydrating(false);
    }

    void loadSavedProgress();

    return () => {
      isMounted = false;
    };
  }, [day.id, repository]);

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

  const moveNext = async () => {
    if (isHydrating || isAdvancing) return;

    const updatedProgress = completeStep(dayProgress, currentStep, new Date().toISOString());
    setIsAdvancing(true);
    try {
      if (updatedProgress.currentStep === 'done') {
        await enqueueOutputSave(outputDraft);
      }
      await repository.saveDayProgress(updatedProgress);
      setDayProgress(updatedProgress);
    } finally {
      setIsAdvancing(false);
    }
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
          <WordCards words={words} showChineseHelp={showChineseHelp} onReview={() => undefined} onKnow={() => undefined} />
        )}
        {currentStep === 'patterns' && <PatternCards patterns={patterns} />}
        {currentStep === 'drills' && <ExerciseRenderer exercises={day.exercises} />}
        {currentStep === 'translate' && <TranslationTask exercises={translationExercises} />}
        {currentStep === 'output' && <OutputTaskEditor task={day.outputTask} value={outputDraft} onChange={saveOutputDraft} />}
        {currentStep === 'done' && <CompletionSummary day={day} output={outputDraft} />}
      </div>

      {hasStickyNext && (
        <button type="button" className="sticky-next primary-button" onClick={moveNext} disabled={isHydrating || isAdvancing}>
          Continue
        </button>
      )}
    </section>
  );
}
