import { useState } from 'react';
import type { DailyProgress } from '@shared/types/progress';

type ViewMode = 'native' | 'leetcode' | 'github';

interface Props {
  progress: DailyProgress[];
  githubUsername?: string;
  leetcodeUsername?: string;
}

export default function StreakCalendar({ progress, githubUsername, leetcodeUsername }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('native');

  return (
    <div className="card-cream overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-ink text-lg">Activity</h3>
        <div className="flex rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden">
          {(['native', 'leetcode', 'github'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeView === view
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-soft)] text-muted hover:text-ink'
              }`}
            >
              {view === 'native' ? 'My DSA Buddy' : view === 'leetcode' ? 'LeetCode' : 'GitHub'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'native' && <NativeHeatmap progress={progress} />}
      {activeView === 'leetcode' && <LeetCodeEmbed username={leetcodeUsername} />}
      {activeView === 'github' && <GitHubEmbed username={githubUsername} />}
    </div>
  );
}

function NativeHeatmap({ progress }: { progress: DailyProgress[] }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  const progressMap = new Map<string, number>();
  for (const p of progress) {
    progressMap.set(p.date, p.problemsSolved);
  }

  const weeks: { date: Date; count: number }[][] = [];
  let currentWeek: { date: Date; count: number }[] = [];

  const cursor = new Date(startDate);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  while (cursor <= endDate) {
    const dateStr = toLocalDateStr(cursor);
    const count = progressMap.get(dateStr) || 0;
    currentWeek.push({ date: new Date(cursor), count });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const months = getMonthLabels(weeks);
  const hasData = progress.length > 0;

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="flex mb-1 ml-8">
            {months.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-muted font-mono"
                style={{ width: `${m.span * 13}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-[2px]">
            <div className="flex flex-col gap-[2px] mr-1 justify-between py-[2px]">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <span key={i} className="text-[9px] text-muted font-mono h-[11px] leading-[11px]">
                  {d}
                </span>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ backgroundColor: getColor(day.count) }}
                    title={`${toLocalDateStr(day.date)}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-3 justify-end">
            <span className="text-[10px] text-muted font-mono mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: getColor(level) }}
              />
            ))}
            <span className="text-[10px] text-muted font-mono ml-1">More</span>
          </div>
        </div>
      </div>

      {!hasData && (
        <p className="text-xs text-muted text-center mt-3">
          No activity yet. Solve problems on LeetCode with the extension to see your progress here.
        </p>
      )}
    </>
  );
}

function LeetCodeEmbed({ username }: { username?: string }) {
  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-muted">LeetCode username not configured.</p>
        <a href="/settings" className="text-sm text-[var(--color-primary)] hover:underline mt-1">
          Configure in Settings &rarr;
        </a>
      </div>
    );
  }

  const theme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

  return (
    <div className="flex justify-center py-4 overflow-x-auto">
      <img
        src={`https://leetcard.jacoblin.cool/${username}?theme=${theme}&ext=heatmap`}
        alt={`${username}'s LeetCode contribution graph`}
        className="max-w-full rounded"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML =
            '<p class="text-xs text-muted text-center">Failed to load LeetCode graph. Check your username in Settings.</p>';
        }}
      />
    </div>
  );
}

function GitHubEmbed({ username }: { username?: string }) {
  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-muted">GitHub username not configured.</p>
        <a href="/settings" className="text-sm text-[var(--color-primary)] hover:underline mt-1">
          Configure in Settings &rarr;
        </a>
      </div>
    );
  }

  const theme = typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'teal' : '';

  return (
    <div className="flex justify-center py-4 overflow-x-auto">
      <img
        src={`https://ghchart.rshah.org/${theme ? theme + '/' : ''}${username}`}
        alt={`${username}'s GitHub contribution graph`}
        className="w-full max-w-full rounded"
        style={{ imageRendering: 'crisp-edges' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML =
            '<p class="text-xs text-muted text-center">Failed to load GitHub graph. Check your username in Settings.</p>';
        }}
      />
    </div>
  );
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getColor(count: number): string {
  if (count === 0) return 'var(--color-surface-soft)';
  if (count === 1) return 'rgba(204, 120, 92, 0.3)';
  if (count === 2) return 'rgba(204, 120, 92, 0.5)';
  if (count === 3) return 'rgba(204, 120, 92, 0.75)';
  return 'var(--color-primary)';
}

function getMonthLabels(weeks: { date: Date; count: number }[][]): { label: string; span: number }[] {
  const months: { label: string; span: number }[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;

  for (const week of weeks) {
    const firstDay = week[0];
    const month = firstDay.date.getMonth();
    if (month !== lastMonth) {
      months.push({ label: monthNames[month], span: 1 });
      lastMonth = month;
    } else {
      months[months.length - 1].span++;
    }
  }

  return months;
}
