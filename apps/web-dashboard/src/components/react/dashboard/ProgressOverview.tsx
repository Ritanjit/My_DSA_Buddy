import { ProgressRing } from '../ui';
import type { UserStats } from '@shared/types/progress';

interface Props {
  stats: UserStats;
}

export default function ProgressOverview({ stats }: Props) {
  const { byDifficulty, totalSolved } = stats;
  const total = byDifficulty.easy + byDifficulty.medium + byDifficulty.hard;

  const rings = [
    { label: 'Easy', value: byDifficulty.easy, max: 300, color: 'var(--color-difficulty-easy)' },
    { label: 'Medium', value: byDifficulty.medium, max: 500, color: 'var(--color-difficulty-medium)' },
    { label: 'Hard', value: byDifficulty.hard, max: 200, color: 'var(--color-difficulty-hard)' },
  ];

  return (
    <div className="card-cream">
      <h3 className="font-display text-ink text-lg mb-6">Progress Overview</h3>

      <div className="flex items-center justify-center mb-6">
        <ProgressRing
          value={Math.min(100, (totalSolved / 1000) * 100)}
          size={120}
          strokeWidth={8}
          color="var(--color-primary)"
          label={`${totalSolved}`}
        />
      </div>

      <p className="text-center text-muted text-sm mb-6">Total Problems Solved</p>

      <div className="grid grid-cols-3 gap-4">
        {rings.map((ring) => (
          <div key={ring.label} className="flex flex-col items-center gap-2">
            <ProgressRing
              value={ring.max > 0 ? (ring.value / ring.max) * 100 : 0}
              size={56}
              strokeWidth={5}
              color={ring.color}
              label={`${ring.value}`}
            />
            <span className="text-xs font-mono text-muted">{ring.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
