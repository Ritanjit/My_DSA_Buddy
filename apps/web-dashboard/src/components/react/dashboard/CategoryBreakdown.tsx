import { ProgressBar } from '../ui';
import type { UserStats } from '@shared/types/progress';

interface Props {
  stats: UserStats;
}

export default function CategoryBreakdown({ stats }: Props) {
  const entries = Object.entries(stats.byTopic)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const max = entries.length > 0 ? entries[0][1] : 1;

  return (
    <div className="card-cream">
      <h3 className="font-display text-ink text-lg mb-5">Topics</h3>

      {entries.length === 0 ? (
        <p className="text-muted text-sm">No problems solved yet. Start solving to see your topic breakdown.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([topic, count]) => (
            <div key={topic}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-body">{topic}</span>
                <span className="text-xs font-mono text-muted">{count}</span>
              </div>
              <ProgressBar value={(count / max) * 100} variant="primary" size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
