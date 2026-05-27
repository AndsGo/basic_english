import type { SceneGoal } from '../domain/types';

export function SceneGoalBanner({ goal }: { goal: SceneGoal }) {
  return (
    <section className="scene-goal-banner" aria-label="Today scene goal">
      <span className="eyebrow">Today</span>
      <strong>{goal.capability}</strong>
      <span className="scene-chip">{goal.title}</span>
    </section>
  );
}
