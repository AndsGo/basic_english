import { useEffect, useState } from 'react';
import { applyMasteryAnswer, selectDueMasteryProgress, toLocalDateString, type MasteryProgress } from '../domain/mastery';
import { buildMasteryQuestion, type MasteryQuestion } from '../domain/masteryQuestions';
import type { Course } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';

type ScheduledQuestion = {
  progress: MasteryProgress;
  question: MasteryQuestion;
};

const defaultNow = () => new Date();

function answersMatch(question: MasteryQuestion, answer: string | string[]): boolean {
  if (Array.isArray(question.correctAnswer)) {
    return Array.isArray(answer) && answer.length === question.correctAnswer.length && answer.every((token, index) => token === question.correctAnswer[index]);
  }
  return typeof answer === 'string' && answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
}

export function MasteryReviewPanel({
  course,
  repository,
  now = defaultNow,
  onChange,
}: {
  course: Course;
  repository: ProgressRepository;
  now?: () => Date;
  onChange?: () => void;
}) {
  const [questions, setQuestions] = useState<ScheduledQuestion[]>([]);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [orderedAnswer, setOrderedAnswer] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestions() {
      try {
        const current = now();
        const localDate = toLocalDateString(current);
        const [records, session] = await Promise.all([
          repository.listMasteryProgress(),
          repository.getMasteryReviewSession(localDate),
        ]);
        const completedProgressIds = session?.completedProgressIds ?? [];
        const due = selectDueMasteryProgress(records, {
          now: current.toISOString(),
          completedProgressIds,
          limit: Math.max(0, 8 - completedProgressIds.length),
        });
        const scheduled = due.map((progress) => ({ progress, question: buildMasteryQuestion(progress, course) }));
        if (!isMounted) return;
        setQuestions(scheduled);
        setPosition(0);
        setLoadError(false);
      } catch {
        if (!isMounted) return;
        setQuestions([]);
        setLoadError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadQuestions();
    return () => {
      isMounted = false;
    };
  }, [course, now, repository]);

  const scheduled = questions[position];
  const question = scheduled?.question;

  const submitAnswer = async (answer: string | string[]) => {
    if (!scheduled || saving || answered) return;

    const current = now();
    const correct = answersMatch(scheduled.question, answer);
    const updatedProgress = applyMasteryAnswer(scheduled.progress, { correct, now: current.toISOString() });
    const localDate = toLocalDateString(current);
    setSaving(true);
    setSaveError(false);

    try {
      await repository.saveMasteryProgress(updatedProgress);
      const existingSession = await repository.getMasteryReviewSession(localDate);
      await repository.saveMasteryReviewSession({
        id: `mastery-session-${localDate}`,
        localDate,
        completedProgressIds: Array.from(new Set([...(existingSession?.completedProgressIds ?? []), scheduled.progress.id])),
        updatedAt: current.toISOString(),
      });
      setAnswered(true);
      setFeedback(correct ? 'Correct. Well done.' : `Not quite. ${scheduled.question.explanation}`);
      onChange?.();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const continueToNext = () => {
    setPosition((current) => current + 1);
    setAnswered(false);
    setFeedback(null);
    setTextAnswer('');
    setOrderedAnswer([]);
  };

  if (loading) {
    return <section className="mastery-review-panel" aria-busy="true" />;
  }

  if (loadError) {
    return (
      <section className="mastery-review-panel">
        <h2>Mastery review</h2>
        <p role="alert">Mastery review could not be loaded.</p>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="mastery-review-panel">
        <h2>Mastery review</h2>
        <p>No mastery review due today.</p>
      </section>
    );
  }

  const controlsDisabled = saving || answered;

  return (
    <section className="mastery-review-panel">
      <h2>Mastery review</h2>
      <p className="mastery-review-count">Question {position + 1} of {questions.length}</p>
      <article className="mastery-review-question">
        <p>{question.prompt}</p>
        {question.options && (
          <div className="mastery-review-options">
            {question.options.map((option) => (
              <button key={option} type="button" className="secondary-button" disabled={controlsDisabled} onClick={() => void submitAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
        {question.kind === 'pattern_fill_blank' && (
          <form className="mastery-review-answer" onSubmit={(event) => {
            event.preventDefault();
            void submitAnswer(textAnswer);
          }}>
            <label htmlFor={`mastery-answer-${question.id}`}>Your answer</label>
            <input id={`mastery-answer-${question.id}`} value={textAnswer} disabled={controlsDisabled} onChange={(event) => setTextAnswer(event.target.value)} />
            <button type="submit" className="primary-button" disabled={controlsDisabled || !textAnswer.trim()}>Submit answer</button>
          </form>
        )}
        {question.kind === 'pattern_sentence_order' && question.tokens && (
          <div className="mastery-review-order">
            <p>{orderedAnswer.map((index) => question.tokens?.[index]).join(' ')}</p>
            <div className="mastery-review-options">
              {question.tokens.map((token, index) => (
                <button key={`${token}-${index}`} type="button" className="secondary-button" disabled={controlsDisabled || orderedAnswer.includes(index)} onClick={() => setOrderedAnswer((current) => [...current, index])}>
                  {token}
                </button>
              ))}
            </div>
            <button type="button" className="primary-button" disabled={controlsDisabled || orderedAnswer.length !== question.tokens.length} onClick={() => void submitAnswer(orderedAnswer.map((index) => question.tokens![index]))}>
              Submit answer
            </button>
          </div>
        )}
      </article>
      {saveError && <p role="alert">Mastery review could not be saved.</p>}
      {feedback && <p className="mastery-review-feedback" role="status">{feedback}</p>}
      {answered && (
        <button type="button" className="primary-button mastery-review-continue" onClick={continueToNext}>
          {position + 1 === questions.length ? 'Finish' : 'Next question'}
        </button>
      )}
    </section>
  );
}
