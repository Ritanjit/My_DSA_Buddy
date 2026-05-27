import { CheckCircle2 } from 'lucide-react';
import type { Problem } from '@shared/types/problem';

interface Props {
  problems: Problem[];
}

export default function RecentActivity({ problems }: Props) {
  const recent = problems.slice(0, 8);

  const difficultyColor = {
    Easy: 'var(--color-difficulty-easy)',
    Medium: 'var(--color-difficulty-medium)',
    Hard: 'var(--color-difficulty-hard)',
  };

  return (
    <div className="card-cream">
      <h3 className="font-display text-ink text-lg mb-5">Recent Activity</h3>

      {recent.length === 0 ? (
        <p className="text-muted text-sm">No recent activity. Solve a problem to see it here.</p>
      ) : (
        <div className="space-y-3">
          {recent.map((problem) => (
            <div
              key={problem.id}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-surface-soft)' }}
            >
              <CheckCircle2 size={16} style={{ color: difficultyColor[problem.difficulty], flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink truncate">
                  <span className="font-mono text-muted text-xs mr-2">#{problem.id}</span>
                  {problem.title}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {problem.language && <span className="font-mono">{problem.language}</span>}
                  {problem.solvedAt && <span className="ml-2">{formatDate(problem.solvedAt)}</span>}
                </p>
              </div>
              <span
                className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full"
                style={{
                  color: difficultyColor[problem.difficulty],
                  backgroundColor: `color-mix(in srgb, ${difficultyColor[problem.difficulty]} 12%, transparent)`,
                }}
              >
                {problem.difficulty}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
