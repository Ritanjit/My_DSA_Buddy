import { Flame, Trophy, Target, Clock } from 'lucide-react';
import type { UserStats } from '@shared/types/progress';

interface Props {
  stats: UserStats;
}

export default function StatsPanel({ stats }: Props) {
  const items = [
    { icon: Target, label: 'Total Solved', value: stats.totalSolved, color: 'var(--color-primary)' },
    { icon: Flame, label: 'Current Streak', value: `${stats.currentStreak}d`, color: 'var(--color-difficulty-medium)' },
    { icon: Trophy, label: 'Longest Streak', value: `${stats.longestStreak}d`, color: 'var(--color-difficulty-easy)' },
    { icon: Clock, label: 'Last Solved', value: stats.lastSolvedAt ? formatRelative(stats.lastSolvedAt) : '—', color: 'var(--color-muted)' },
  ];

  return (
    <div className="card-cream">
      <h3 className="font-display text-ink text-lg mb-5">Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${item.color} 15%, transparent)` }}
              >
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <p className="font-mono text-ink text-base font-medium leading-tight">{item.value}</p>
                <p className="text-xs text-muted mt-0.5">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}
