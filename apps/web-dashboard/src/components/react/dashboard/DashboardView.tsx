import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useProgress, useProblems } from '../../../hooks/useDashboard';
import ProgressOverview from './ProgressOverview';
import StatsPanel from './StatsPanel';
import StreakCalendar from './StreakCalendar';
import CategoryBreakdown from './CategoryBreakdown';
import RecentActivity from './RecentActivity';

export default function DashboardView() {
  const { stats, progress, loading: statsLoading } = useProgress();
  const { problems, loading: problemsLoading } = useProblems();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  async function handleClearRecords() {
    setClearing(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setClearMessage('All records cleared successfully.');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setClearMessage('Failed to clear records.');
      }
    } catch {
      setClearMessage('Network error.');
    } finally {
      setClearing(false);
      setShowFinalConfirm(false);
      setShowClearConfirm(false);
    }
  }

  if (statsLoading || problemsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-4 space-y-6">
          <ProgressOverview stats={stats} />
          <StatsPanel stats={stats} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-6">
          <StreakCalendar progress={progress} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryBreakdown stats={stats} />
            <RecentActivity problems={problems} />
          </div>
        </div>
      </div>

      {/* Clear Records */}
      <div className="pt-4 border-t border-[var(--color-hairline)] flex items-center gap-4">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} /> Clear All Records
        </button>
        {clearMessage && <span className="text-sm text-[var(--color-success)]">{clearMessage}</span>}
      </div>

      {showClearConfirm && !showFinalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <h3 className="font-display text-ink text-lg mb-2">Clear All Records?</h3>
            <p className="text-sm text-muted mb-6">
              This will permanently delete all solved problems and daily progress data. Your settings and roadmaps will be preserved.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFinalConfirm(true)}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <h3 className="font-display text-ink text-lg mb-2">Are you absolutely sure?</h3>
            <p className="text-sm text-muted mb-6">
              This action cannot be undone. All your solved problems, streaks, and progress history will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowFinalConfirm(false); setShowClearConfirm(false); }}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearRecords}
                disabled={clearing}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
