import { useState } from 'react';
import type { DailyLearningInsight } from '../domain/dailyLearningInsights';
import type { Course } from '../domain/types';
import type { ProgressRepository } from '../storage/progressRepository';
import { ReinforcementPracticePanel } from './ReinforcementPracticePanel';

function outcomeCopy(insight: DailyLearningInsight | null) {
  const itemCount = insight?.items.length ?? 0;
  if (itemCount === 0) return { title: 'Strong today', detail: 'No targeted practice due today.' };
  if (itemCount === 1) return { title: 'Keep practicing' };
  return { title: `Focus on ${itemCount} items` };
}

export function DailyLearningReport({
  insight,
  course,
  repository,
  onPracticeChange,
}: {
  insight: DailyLearningInsight | null;
  course: Course;
  repository: ProgressRepository;
  onPracticeChange?: () => void;
}) {
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const copy = outcomeCopy(insight);
  const canPractice = (insight?.items.length ?? 0) >= 2;

  return (
    <section className="daily-learning-report">
      <h3>Today&apos;s Learning</h3>
      <p className="daily-learning-report-outcome">{copy.title}</p>
      {copy.detail && <p>{copy.detail}</p>}
      {insight && insight.items.length > 0 && (
        <ul className="daily-learning-report-list">
          {insight.items.map((item) => (
            <li key={item.contentKey}>
              <p>{item.reason}</p>
              {item.scenarioTitle && <p>Scenario: {item.scenarioTitle}</p>}
            </li>
          ))}
        </ul>
      )}
      {canPractice && !isPracticeOpen && (
        <button type="button" className="secondary-button" onClick={() => setIsPracticeOpen(true)}>
          Start 3-minute practice
        </button>
      )}
      {canPractice && isPracticeOpen && insight && (
        <ReinforcementPracticePanel
          insight={insight}
          course={course}
          repository={repository}
          onComplete={onPracticeChange}
          onSkip={onPracticeChange}
        />
      )}
    </section>
  );
}
