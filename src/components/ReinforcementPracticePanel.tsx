import { useEffect, useState } from 'react';
import { toLocalDateString, type MasteryProgress } from '../domain/mastery';
import { buildMasteryQuestion, type MasteryQuestion } from '../domain/masteryQuestions';
import type { DailyLearningInsight } from '../domain/dailyLearningInsights';
import type { Course } from '../domain/types';
import type { ProgressRepository, ReinforcementPracticeSession } from '../storage/progressRepository';

type PracticeQuestion = {
  contentKey: string;
  question: MasteryQuestion;
};

const defaultNow = () => new Date();

function answersMatch(question: MasteryQuestion, answer: string | string[]): boolean {
  if (Array.isArray(question.correctAnswer)) {
    return Array.isArray(answer)
      && answer.length === question.correctAnswer.length
      && answer.every((token, index) => token === question.correctAnswer[index]);
  }

  return typeof answer === 'string' && answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
}

function practiceProgress(item: DailyLearningInsight['items'][number], current: Date): MasteryProgress {
  return Object.freeze({
    id: `reinforcement-${item.contentType}-${item.contentId}`,
    contentType: item.contentType,
    contentId: item.contentId,
    sourceDayId: 'reinforcement-practice',
    status: 'needs_reinforcement',
    consecutiveCorrect: 0,
    dueAt: current.toISOString(),
    updatedAt: current.toISOString(),
  });
}

function createSession(localDate: string, insightId: string, questions: PracticeQuestion[], current: Date): ReinforcementPracticeSession {
  return {
    id: `reinforcement-practice-${localDate}-${insightId}`,
    localDate,
    insightId,
    contentKeys: questions.map(({ contentKey }) => contentKey),
    answers: [],
    status: 'in_progress',
    updatedAt: current.toISOString(),
  };
}

export function ReinforcementPracticePanel({
  insight,
  course,
  repository,
  now = defaultNow,
  onComplete,
  onSkip,
}: {
  insight: DailyLearningInsight;
  course: Course;
  repository: ProgressRepository;
  now?: () => Date;
  onComplete?: () => void;
  onSkip?: () => void;
}) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [session, setSession] = useState<ReinforcementPracticeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [orderedAnswer, setOrderedAnswer] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadPractice() {
      const current = now();
      const localDate = toLocalDateString(current);
      const seenKeys = new Set<string>();
      let skippedContent = false;
      const candidates = insight.items.flatMap((item) => {
        if (seenKeys.has(item.contentKey)) return [];
        seenKeys.add(item.contentKey);

        try {
          return [{ contentKey: item.contentKey, question: buildMasteryQuestion(practiceProgress(item, current), course) }];
        } catch {
          skippedContent = true;
          return [];
        }
      }).slice(0, 3);

      try {
        const stored = await repository.getReinforcementPracticeSession(localDate, insight.id);
        const nextSession = stored ?? createSession(localDate, insight.id, candidates, current);
        if (!stored) await repository.saveReinforcementPracticeSession(nextSession);
        const allowedKeys = new Set(nextSession.contentKeys);
        const sessionQuestions = candidates.filter((candidate) => allowedKeys.has(candidate.contentKey));

        if (!isMounted) return;
        setQuestions(sessionQuestions);
        setSession(nextSession);
        setContentError(skippedContent || (nextSession.contentKeys.length > 0 && sessionQuestions.length !== nextSession.contentKeys.length));
        setLoadError(false);
      } catch {
        if (!isMounted) return;
        setQuestions([]);
        setSession(null);
        setLoadError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadPractice();
    return () => {
      isMounted = false;
    };
  }, [course, insight, now, repository]);

  const answeredProgressIds = new Set(session?.answers.map((answer) => answer.progressId));
  const position = questions.findIndex(({ question }) => !answeredProgressIds.has(question.progressId));
  const currentQuestion = position >= 0 ? questions[position] : undefined;

  const saveSession = async (nextSession: ReinforcementPracticeSession): Promise<boolean> => {
    setSaving(true);
    setSaveError(false);
    try {
      await repository.saveReinforcementPracticeSession(nextSession);
      setSession(nextSession);
      return true;
    } catch {
      setSaveError(true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitAnswer = async (answer: string | string[]) => {
    if (!session || !currentQuestion || saving || answered) return;

    const current = now();
    const correct = answersMatch(currentQuestion.question, answer);
    const nextAnswers = [...session.answers, {
      progressId: currentQuestion.question.progressId,
      correct,
      answeredAt: current.toISOString(),
    }];
    const saved = await saveSession({
      ...session,
      answers: nextAnswers,
      status: 'in_progress',
      updatedAt: current.toISOString(),
    });

    if (!saved) return;
    setAnswered(true);
    setFeedback(correct ? 'Correct.' : `Not quite. Correct answer: ${currentQuestion.question.correctAnswerText}`);
  };

  const finishPractice = async () => {
    if (!session || saving || session.status !== 'in_progress' || session.answers.length !== questions.length) return;
    const current = now();
    const saved = await saveSession({ ...session, status: 'completed', updatedAt: current.toISOString() });
    if (saved) onComplete?.();
  };

  const skipPractice = async () => {
    if (!session || saving || session.status !== 'in_progress') return;
    const current = now();
    const saved = await saveSession({ ...session, status: 'skipped', updatedAt: current.toISOString() });
    if (saved) onSkip?.();
  };

  const nextQuestion = () => {
    setAnswered(false);
    setFeedback(null);
    setTextAnswer('');
    setOrderedAnswer([]);
  };

  if (loading) return <section className="reinforcement-practice" aria-busy="true" />;

  if (loadError) {
    return <section className="reinforcement-practice"><p role="alert">Reinforcement practice could not be loaded.</p></section>;
  }

  if (session?.status === 'completed') {
    return (
      <section className="reinforcement-practice">
        <p className="reinforcement-practice-complete">Practice complete</p>
        {feedback && <p className="reinforcement-practice-feedback" role="status">{feedback}</p>}
      </section>
    );
  }

  if (session?.status === 'skipped') {
    return <section className="reinforcement-practice"><p>Practice skipped.</p></section>;
  }

  const readyToFinish = session?.status === 'in_progress' && questions.length > 0 && session.answers.length === questions.length;

  if (readyToFinish) {
    return (
      <section className="reinforcement-practice">
        <div className="reinforcement-practice-header">
          <h2>Reinforcement practice</h2>
          <p className="reinforcement-practice-progress">{questions.length} of {questions.length}</p>
        </div>
        {saveError && <p role="alert">Reinforcement practice could not be saved.</p>}
        {feedback && <p className="reinforcement-practice-feedback" role="status">{feedback}</p>}
        <div className="reinforcement-practice-actions">
          <button type="button" className="primary-button" disabled={saving} onClick={() => void finishPractice()}>Finish practice</button>
          <button type="button" className="secondary-button" disabled={saving} onClick={() => void skipPractice()}>Skip practice</button>
        </div>
      </section>
    );
  }

  if (!currentQuestion) {
    return (
      <section className="reinforcement-practice">
        {contentError ? <p role="alert">Reinforcement practice questions could not be prepared.</p> : <p>No reinforcement practice is available.</p>}
      </section>
    );
  }

  const { question } = currentQuestion;
  const controlsDisabled = saving || answered;

  return (
    <section className="reinforcement-practice">
      <div className="reinforcement-practice-header">
        <h2>Reinforcement practice</h2>
        <p className="reinforcement-practice-progress">{position + 1} of {questions.length}</p>
      </div>
      {contentError && <p role="alert">Some reinforcement practice questions could not be prepared.</p>}
      <article className="reinforcement-practice-question">
        <p>{question.prompt}</p>
        {question.options && (
          <div className="reinforcement-practice-options">
            {question.options.map((option) => (
              <button key={option} type="button" className="secondary-button" disabled={controlsDisabled} onClick={() => void submitAnswer(option)}>{option}</button>
            ))}
          </div>
        )}
        {question.kind === 'pattern_fill_blank' && (
          <form className="reinforcement-practice-answer" onSubmit={(event) => {
            event.preventDefault();
            void submitAnswer(textAnswer);
          }}>
            <label htmlFor={`reinforcement-answer-${question.id}`}>Your answer</label>
            <input id={`reinforcement-answer-${question.id}`} value={textAnswer} disabled={controlsDisabled} onChange={(event) => setTextAnswer(event.target.value)} />
            <button type="submit" className="primary-button" disabled={controlsDisabled || !textAnswer.trim()}>Submit answer</button>
          </form>
        )}
        {question.kind === 'pattern_sentence_order' && question.tokens && (
          <div className="reinforcement-practice-order">
            <p>{orderedAnswer.map((index) => question.tokens?.[index]).join(' ')}</p>
            <div className="reinforcement-practice-options">
              {question.tokens.map((token, index) => (
                <button key={`${token}-${index}`} type="button" className="secondary-button" disabled={controlsDisabled || orderedAnswer.includes(index)} onClick={() => setOrderedAnswer((current) => [...current, index])}>{token}</button>
              ))}
            </div>
            <button type="button" className="primary-button" disabled={controlsDisabled || orderedAnswer.length !== question.tokens.length} onClick={() => void submitAnswer(orderedAnswer.map((index) => question.tokens![index]))}>Submit answer</button>
          </div>
        )}
      </article>
      {saveError && <p role="alert">Reinforcement practice could not be saved.</p>}
      {feedback && <p className="reinforcement-practice-feedback" role="status">{feedback}</p>}
      <div className="reinforcement-practice-actions">
        {answered && session?.status === 'in_progress' && <button type="button" className="primary-button" onClick={nextQuestion}>Next question</button>}
        <button type="button" className="secondary-button" disabled={saving} onClick={() => void skipPractice()}>Skip practice</button>
      </div>
    </section>
  );
}
