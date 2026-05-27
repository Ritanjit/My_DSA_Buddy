import type { DailyProgress } from '@shared/types/progress';

interface Props {
  progress: DailyProgress[];
}

export default function StreakCalendar({ progress }: Props) {
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
  // Align to start of week (Sunday)
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().split('T')[0];
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

  return (
    <div className="card-cream overflow-hidden">
      <h3 className="font-display text-ink text-lg mb-4">Activity</h3>

      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          {/* Month labels */}
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
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 justify-between py-[2px]">
              {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                <span key={i} className="text-[9px] text-muted font-mono h-[11px] leading-[11px]">
                  {d}
                </span>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ backgroundColor: getColor(day.count) }}
                    title={`${day.date.toISOString().split('T')[0]}: ${day.count} problem${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
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
    </div>
  );
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
