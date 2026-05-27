import { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Upload, X, ExternalLink, ChevronDown, ChevronUp, EyeOff, Eye } from 'lucide-react';
import { ProgressBar, CustomSelect } from '../ui';

interface RoadmapData {
  id: string;
  name: string;
  description: string;
  type: string;
  company: string;
  category: string;
  totalProblems: number;
  solvedCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All Time' },
  { value: 'thirty-days', label: '30 Days' },
  { value: 'three-months', label: '3 Months' },
  { value: 'six-months', label: '6 Months' },
];

export default function RoadmapsView() {
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [allHidden, setAllHidden] = useState(false);

  function fetchRoadmaps() {
    setLoading(true);
    fetch('/api/roadmaps')
      .then((r) => r.json())
      .then((data: RoadmapData[]) => setRoadmaps(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const companies = [...new Set(roadmaps.filter((r) => r.type === 'company').map((r) => r.company))].sort();

  const filtered = roadmaps.filter((r) => {
    if (companyFilter && r.company !== companyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.company.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
    }
    return true;
  });

  const companyRoadmaps = filtered.filter((r) => r.type === 'company');
  const customRoadmaps = filtered.filter((r) => r.type !== 'company');

  const grouped: Record<string, RoadmapData[]> = {};
  for (const r of companyRoadmaps) {
    const key = r.company;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  function toggleCompany(company: string) {
    setCollapsed((prev) => ({ ...prev, [company]: !prev[company] }));
  }

  function toggleAll() {
    const keys = Object.keys(grouped);
    if (allHidden) {
      const next: Record<string, boolean> = {};
      keys.forEach((k) => (next[k] = false));
      setCollapsed(next);
      setAllHidden(false);
    } else {
      const next: Record<string, boolean> = {};
      keys.forEach((k) => (next[k] = true));
      setCollapsed(next);
      setAllHidden(true);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <span className="text-sm text-muted font-mono">
          {roadmaps.length} roadmaps
        </span>
        <span className="text-sm font-mono" style={{ color: 'var(--color-primary)' }}>
          {companies.length} companies
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
            placeholder="Search by company or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <CustomSelect
          value={companyFilter}
          onChange={(v) => setCompanyFilter(v)}
          options={[
            { value: '', label: 'All Companies' },
            ...companies.map((c) => ({ value: c, label: c })),
          ]}
        />

        <button
          onClick={toggleAll}
          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-[var(--radius-md)] text-xs font-medium transition-colors border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] text-[var(--color-ink)]"
        >
          {allHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          {allHidden ? 'Show All' : 'Hide All'}
        </button>

        <button
          onClick={() => setShowUpload(true)}
          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-[var(--radius-md)] text-xs font-medium transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          <Upload size={14} />
          Upload
        </button>
      </div>

      {/* Roadmap list */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted py-12">No roadmaps found matching your filters.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([company, items]) => (
            <div key={company}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-display text-ink text-lg">{company}</h3>
                <span className="text-xs text-muted font-mono ml-auto">{items.reduce((sum, r) => sum + r.totalProblems, 0)} problems</span>
                <button
                  onClick={() => toggleCompany(company)}
                  className="p-1.5 rounded hover:bg-[var(--color-surface-soft)] transition-colors"
                >
                  {collapsed[company]
                    ? <ChevronDown size={16} style={{ color: 'var(--color-muted)' }} />
                    : <ChevronUp size={16} style={{ color: 'var(--color-muted)' }} />}
                </button>
              </div>

              {!collapsed[company] && (
                <div className="space-y-2">
                  {items.map((roadmap) => {
                    const progress = roadmap.totalProblems > 0
                      ? Math.round((roadmap.solvedCount / roadmap.totalProblems) * 100)
                      : 0;

                    return (
                      <a
                        key={roadmap.id}
                        href={`/problems?company=${roadmap.company}`}
                        className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[var(--color-surface-soft)] hover:scale-[1.02] no-underline cursor-pointer"
                        style={{ backgroundColor: 'var(--color-surface-card)', textDecoration: 'none' }}
                      >
                        <span className="text-sm text-ink font-medium w-[120px] flex-shrink-0 capitalize truncate">
                          {roadmap.category.replace(/-/g, ' ')}
                        </span>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium"
                            style={{ borderColor: 'var(--color-difficulty-easy)', color: 'var(--color-difficulty-easy)' }}
                          >
                            {roadmap.easyCount}
                          </span>
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium"
                            style={{ borderColor: 'var(--color-difficulty-medium)', color: 'var(--color-difficulty-medium)' }}
                          >
                            {roadmap.mediumCount}
                          </span>
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium"
                            style={{ borderColor: 'var(--color-difficulty-hard)', color: 'var(--color-difficulty-hard)' }}
                          >
                            {roadmap.hardCount}
                          </span>
                        </div>

                        <div className="flex-1 min-w-[80px]">
                          <ProgressBar value={progress} variant="primary" size="sm" />
                        </div>

                        <span className="font-mono text-xs text-muted flex-shrink-0 w-16 text-right">
                          {roadmap.solvedCount}/{roadmap.totalProblems}
                        </span>

                        <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} className="flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {customRoadmaps.length > 0 && (
            <div>
              <h3 className="font-display text-ink text-lg mb-3">Custom Roadmaps</h3>
              <div className="space-y-2">
                {customRoadmaps.map((roadmap) => {
                  const progress = roadmap.totalProblems > 0
                    ? Math.round((roadmap.solvedCount / roadmap.totalProblems) * 100)
                    : 0;

                  return (
                    <a
                      key={roadmap.id}
                      href={`/problems?company=${roadmap.company || roadmap.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-[var(--color-surface-soft)] hover:scale-[1.02] no-underline cursor-pointer"
                      style={{ backgroundColor: 'var(--color-surface-card)' }}
                    >
                      <span className="text-sm text-ink font-medium w-[120px] flex-shrink-0 min-w-0 truncate">
                        {roadmap.name}
                      </span>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium" style={{ borderColor: 'var(--color-muted)', color: 'var(--color-muted)' }}>—</span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium" style={{ borderColor: 'var(--color-muted)', color: 'var(--color-muted)' }}>—</span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border text-[11px] font-mono font-medium" style={{ borderColor: 'var(--color-muted)', color: 'var(--color-muted)' }}>—</span>
                      </div>

                      <div className="flex-1 min-w-[80px]">
                        <ProgressBar value={progress} variant="primary" size="sm" />
                      </div>

                      <span className="font-mono text-xs text-muted flex-shrink-0 w-16 text-right">
                        {roadmap.solvedCount}/{roadmap.totalProblems}
                      </span>

                      <ArrowRight size={14} style={{ color: 'var(--color-muted)' }} className="flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            fetchRoadmaps();
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('all');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !company) {
      setError('Company name and CSV file are required.');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('company', company);
    formData.append('category', category);

    try {
      const res = await fetch('/api/roadmaps/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      onSuccess();
    } catch {
      setError('Network error');
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-xl"
        style={{ backgroundColor: 'var(--color-surface-card)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-ink text-lg">Upload Company CSV</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-soft)]">
            <X size={18} style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-body mb-1">Company Name</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Amazon, Google, Meta"
              className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-body mb-1">CSV File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-body file:mr-3 file:py-1.5 file:px-3 file:rounded-[var(--radius-md)] file:border-0 file:text-xs file:font-medium file:bg-[var(--color-surface-soft)] file:text-[var(--color-ink)] hover:file:bg-[var(--color-hairline)]"
            />
            <p className="text-[10px] text-muted mt-1">Required columns: ID, Title, Difficulty</p>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full h-9 rounded-[var(--radius-md)] text-sm font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
