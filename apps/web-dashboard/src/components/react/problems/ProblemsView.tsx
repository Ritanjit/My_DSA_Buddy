import { useState, useEffect } from 'react';
import { Search, ExternalLink, CheckCircle2, Circle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomSelect } from '../ui';
import type { Problem, Difficulty, ProblemStatus } from '@shared/types/problem';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const STATUSES: { value: ProblemStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'solved', label: 'Solved' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'unsolved', label: 'Unsolved' },
];
const PAGE_SIZES = [10, 25, 50, 100];

const difficultyColor: Record<Difficulty, string> = {
  Easy: 'var(--color-difficulty-easy)',
  Medium: 'var(--color-difficulty-medium)',
  Hard: 'var(--color-difficulty-hard)',
};

const statusIcon: Record<ProblemStatus, typeof CheckCircle2> = {
  solved: CheckCircle2,
  attempted: Clock,
  unsolved: Circle,
};

function getInitialParams() {
  if (typeof window === 'undefined') return { company: '', difficulty: '', status: '', topic: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    company: params.get('company') || '',
    difficulty: params.get('difficulty') || '',
    status: params.get('status') || '',
    topic: params.get('topic') || '',
  };
}

export default function ProblemsView() {
  const initial = getInitialParams();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>(initial.difficulty as Difficulty | '');
  const [status, setStatus] = useState<ProblemStatus | ''>(initial.status as ProblemStatus | '');
  const [topic, setTopic] = useState(initial.topic);
  const [company, setCompany] = useState(initial.company);

  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allCompanies, setAllCompanies] = useState<string[]>([]);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchProblems();
  }, [difficulty, status, topic, company]);

  useEffect(() => {
    setPage(0);
  }, [search, difficulty, status, topic, company, pageSize]);

  function fetchProblems() {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);
    if (status) params.set('status', status);
    if (topic) params.set('topic', topic);
    if (company) params.set('company', company);

    fetch(`/api/all-problems?${params}`)
      .then((r) => r.json())
      .then((data: Problem[]) => {
        setProblems(data);
        if (allTopics.length === 0) {
          const topics = new Set<string>();
          data.forEach((p) => p.topics.forEach((t) => topics.add(t)));
          setAllTopics([...topics].sort());
        }
        if (allCompanies.length === 0) {
          const companies = new Set<string>();
          data.forEach((p) => p.companies.forEach((c) => companies.add(c)));
          setAllCompanies([...companies].sort());
        }
      })
      .finally(() => setLoading(false));
  }

  const filtered = search
    ? problems.filter(
        (p) => p.title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search)
      )
    : problems;

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const counts = {
    total: problems.length,
    solved: problems.filter((p) => p.status === 'solved').length,
    easy: problems.filter((p) => p.difficulty === 'Easy').length,
    medium: problems.filter((p) => p.difficulty === 'Medium').length,
    hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <span className="text-sm text-muted font-mono">
          {counts.total} problems
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--color-difficulty-easy)' }}>
          {counts.easy} Easy
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--color-difficulty-medium)' }}>
          {counts.medium} Medium
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--color-difficulty-hard)' }}>
          {counts.hard} Hard
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--color-primary)' }}>
          {counts.solved} Solved
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-muted)' }}
          />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <CustomSelect
          value={difficulty}
          onChange={(v) => setDifficulty(v as Difficulty | '')}
          options={[
            { value: '', label: 'All Difficulties' },
            ...DIFFICULTIES.map((d) => ({ value: d, label: d })),
          ]}
        />

        <CustomSelect
          value={status}
          onChange={(v) => setStatus(v as ProblemStatus | '')}
          options={STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />

        <CustomSelect
          value={topic}
          onChange={(v) => setTopic(v)}
          options={[
            { value: '', label: 'All Topics' },
            ...allTopics.map((t) => ({ value: t, label: t })),
          ]}
          maxDropdownWidth={180}
        />

        <CustomSelect
          value={company}
          onChange={(v) => setCompany(v)}
          options={[
            { value: '', label: 'All Companies' },
            ...allCompanies.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      {/* Problem list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted py-12">No problems found matching your filters.</p>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((problem) => {
              const StatusIcon = statusIcon[problem.status];
              return (
                <a
                  key={problem.id}
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[var(--color-surface-soft)] hover:scale-[1.02] cursor-pointer no-underline"
                  style={{ backgroundColor: 'var(--color-surface-card)', textDecoration: 'none' }}
                >
                  <StatusIcon
                    size={16}
                    style={{
                      color: problem.status === 'solved' ? 'var(--color-difficulty-easy)' : 'var(--color-muted)',
                      flexShrink: 0,
                    }}
                  />

                  <span className="font-mono text-xs text-muted w-10 flex-shrink-0">
                    {problem.id}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{problem.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {problem.topics.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-soft)] text-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span
                    className="text-xs font-mono font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      color: difficultyColor[problem.difficulty],
                      backgroundColor: `color-mix(in srgb, ${difficultyColor[problem.difficulty]} 12%, transparent)`,
                    }}
                  >
                    {problem.difficulty}
                  </span>

                  <span
                    className="p-1.5 rounded hover:bg-[var(--color-surface-soft)] transition-colors flex-shrink-0"
                    title="Open on LeetCode"
                  >
                    <ExternalLink size={18} style={{ color: 'var(--color-muted)' }} />
                  </span>
                </a>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-hairline)]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-7 px-2 rounded text-xs bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="text-xs text-muted ml-2">
                  {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded hover:bg-[var(--color-surface-soft)] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} style={{ color: 'var(--color-ink)' }} />
                </button>

                <PaginationPages current={page} total={totalPages} onPageChange={setPage} />

                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-1.5 rounded hover:bg-[var(--color-surface-soft)] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight size={16} style={{ color: 'var(--color-ink)' }} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaginationPages({ current, total, onPageChange }: { current: number; total: number; onPageChange: (p: number) => void }) {
  const pages: (number | 'ellipsis')[] = [];

  if (total <= 7) {
    for (let i = 0; i < total; i++) pages.push(i);
  } else {
    pages.push(0);

    const start = Math.max(1, current - 2);
    const end = Math.min(total - 2, current + 2);

    if (start > 1) pages.push('ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 2) pages.push('ellipsis');

    pages.push(total - 1);
  }

  return (
    <>
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-1 text-xs text-muted">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="min-w-[28px] h-7 px-1.5 rounded text-xs font-mono transition-colors"
            style={{
              backgroundColor: p === current ? 'var(--color-primary)' : 'transparent',
              color: p === current ? '#fff' : 'var(--color-ink)',
            }}
          >
            {p + 1}
          </button>
        )
      )}
    </>
  );
}
