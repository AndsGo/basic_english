import type { SceneGoal } from '../domain/types';

export function SceneMap({
  goals,
  completedSceneIds,
  currentSceneId,
}: {
  goals: SceneGoal[];
  completedSceneIds: string[];
  currentSceneId?: string;
}) {
  const completed = new Set(completedSceneIds);

  return (
    <section className="scene-map">
      <h3>Scenes I Can Describe</h3>
      <ul>
        {goals.map((goal) => {
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
    </section>
  );
}
