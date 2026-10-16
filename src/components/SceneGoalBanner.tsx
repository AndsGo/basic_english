import type { SceneGoal } from '../domain/types';

export function SceneGoalBanner({ goal, mission }: { goal: SceneGoal; mission?: string }) {
  return (
    <section className="scene-goal-banner" aria-label="Today scene goal">
      <span className="eyebrow">Today&apos;s mission</span>
      <strong>{mission ?? goal.capability}</strong>
      <span className="scene-chip">{goal.title}</span>
    </section>
  );
}
