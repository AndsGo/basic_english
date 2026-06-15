import { useState } from 'react';
import type { SceneGoal } from '../domain/types';

const visibleSceneCount = 5;

function getVisibleGoals(goals: SceneGoal[], currentSceneId: string | undefined, isExpanded: boolean): SceneGoal[] {
  if (isExpanded || !currentSceneId || goals.length <= visibleSceneCount) return goals;

  const currentIndex = goals.findIndex((goal) => goal.id === currentSceneId);
  if (currentIndex === -1) return goals.slice(0, visibleSceneCount);

  const preferredStart = currentIndex - Math.floor(visibleSceneCount / 2);
  const maxStart = goals.length - visibleSceneCount;
  const start = Math.min(Math.max(preferredStart, 0), maxStart);
  return goals.slice(start, start + visibleSceneCount);
}

export function SceneMap({
  goals,
  completedSceneIds,
  currentSceneId,
}: {
  goals: SceneGoal[];
  completedSceneIds: string[];
  currentSceneId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const completed = new Set(completedSceneIds);
  const isFoldable = Boolean(currentSceneId) && goals.length > visibleSceneCount;
  const visibleGoals = getVisibleGoals(goals, currentSceneId, isExpanded);

  return (
    <section className="scene-map">
      <div className="scene-map-header">
        <h3>Scenes I Can Describe</h3>
        {isFoldable && (
          <button type="button" className="secondary-button scene-map-toggle" onClick={() => setIsExpanded((current) => !current)}>
            {isExpanded ? 'Show fewer scenes' : 'Show all scenes'}
          </button>
        )}
      </div>
      <ul>
        {visibleGoals.map((goal) => {
          const isCompleted = completed.has(goal.id);
          const isCurrent = goal.id === currentSceneId;
          const status = isCompleted ? 'Completed' : isCurrent ? 'Today' : 'Next';

          return (
            <li
              key={goal.id}
              className={`scene-map-item${isCompleted ? ' scene-map-item--completed' : ''}${isCurrent ? ' scene-map-item--current' : ''}`}
              aria-label={`${goal.title} ${status}`}
            >
              <span>{goal.title}</span>
              <small>{status}</small>
            </li>
          );
        })}
      </ul>
      {isFoldable && !isExpanded && <p className="scene-map-summary">Showing nearby scenes. Expand to see all {goals.length}.</p>}
    </section>
  );
}
