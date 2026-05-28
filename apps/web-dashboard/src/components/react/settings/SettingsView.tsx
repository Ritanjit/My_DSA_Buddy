import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Download, Upload, Pencil, AlertTriangle, Trash2 } from 'lucide-react';

interface Settings {
  githubPat: string;
  githubRepo: string;
  githubBranch: string;
  githubUsername: string;
  leetcodeUsername: string;
  syncOnSolve: boolean;
  theme: 'light' | 'dark' | 'system';
  solutionFormat: 'markdown' | 'code-only';
  solutionPath: string;
}

const defaultSettings: Settings = {
  githubPat: '',
  githubRepo: '',
  githubBranch: 'main',
  githubUsername: '',
  leetcodeUsername: '',
  syncOnSolve: true,
  theme: 'light',
  solutionFormat: 'markdown',
  solutionPath: 'problems/{topic}/{slug}.md',
};

export default function SettingsView() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPat, setShowPat] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [showPatEditModal, setShowPatEditModal] = useState(false);
  const [patEditValue, setPatEditValue] = useState('');
  const [patConfirmAction, setPatConfirmAction] = useState<'save' | 'delete' | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Settings) => {
        const storedTheme = localStorage.getItem('dsabuddy-theme') as Settings['theme'] | null;
        const merged = { ...data, theme: storedTheme || data.theme || 'light' };
        setSettings(merged);
        setPatInput(data.githubPat || '');
      })
      .finally(() => setLoading(false));
  }, []);

  function applyTheme(value: Settings['theme']) {
    localStorage.setItem('dsabuddy-theme', value);
    let resolved = value;
    if (value === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = resolved;
    window.dispatchEvent(new StorageEvent('storage', { key: 'dsabuddy-theme', newValue: value }));
  }

  function handleSaveClick() {
    doSave();
  }

  function handlePatEditSave() {
    setPatConfirmAction('save');
  }

  function handlePatDelete() {
    setPatConfirmAction('delete');
  }

  function confirmPatAction() {
    if (patConfirmAction === 'save') {
      setPatInput(patEditValue);
      setShowPatEditModal(false);
      setPatConfirmAction(null);
    } else if (patConfirmAction === 'delete') {
      setPatInput('');
      setPatEditValue('');
      setShowPatEditModal(false);
      setPatConfirmAction(null);
    }
  }

  async function doSave() {
    setSaving(true);
    setMessage(null);

    const payload: Record<string, unknown> = { ...settings };
    if (patInput && !patInput.includes('****')) {
      payload.githubPat = patInput;
    } else if (!patInput) {
      payload.githubPat = '';
    } else {
      delete payload.githubPat;
    }

    try {
      const r = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
      } else {
        const err = await r.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const [problems, progress, settingsData] = await Promise.all([
        fetch('/api/problems').then((r) => r.json()),
        fetch('/api/progress').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      const exportData = { problems, progress, settings: settingsData, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dsa-buddy-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Export failed.' });
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
    <div className="max-w-5xl">
      {/* GitHub Configuration */}
      <section className="py-8 border-b border-[var(--color-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6">
          <div>
            <h2 className="font-display text-ink text-lg">GitHub</h2>
            <p className="text-sm text-muted mt-1">Connect your GitHub repository to push solutions automatically.</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Personal Access Token
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 px-3 flex items-center rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)]">
                  {patInput ? (
                    <span className="text-[var(--color-muted)]">
                      {showPat ? patInput : '•'.repeat(Math.min(patInput.length, 30))}
                    </span>
                  ) : (
                    <span className="text-[var(--color-muted-soft)]">Not configured</span>
                  )}
                </div>
                {patInput && (
                  <button
                    type="button"
                    onClick={() => setShowPat(!showPat)}
                    className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]"
                    title={showPat ? 'Hide' : 'Show'}
                  >
                    {showPat ? <EyeOff size={16} style={{ color: 'var(--color-muted)' }} /> : <Eye size={16} style={{ color: 'var(--color-muted)' }} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setPatEditValue(patInput); setShowPatEditModal(true); }}
                  className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-soft)] border border-[var(--color-hairline)]"
                  title="Edit PAT"
                >
                  <Pencil size={16} style={{ color: 'var(--color-muted)' }} />
                </button>
              </div>
              <p className="text-xs text-muted mt-1.5">Stored locally. Never transmitted to third parties.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Repository
              </label>
              <input
                type="text"
                value={settings.githubRepo || ''}
                onChange={(e) => setSettings({ ...settings, githubRepo: e.target.value })}
                placeholder="username/dsa-solutions"
                className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Branch
              </label>
              <input
                type="text"
                value={settings.githubBranch}
                onChange={(e) => setSettings({ ...settings, githubBranch: e.target.value })}
                placeholder="main"
                className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="text-xs text-muted space-y-2 md:border-l md:border-[var(--color-hairline)] md:pl-4">
            <p className="font-medium text-ink text-xs">How to generate a PAT:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Go to GitHub Settings</li>
              <li>Developer settings → Personal access tokens → Tokens (classic)</li>
              <li>Generate new token</li>
              <li>Select the <code className="font-mono bg-[var(--color-surface-soft)] px-1 rounded">repo</code> scope</li>
              <li>Copy and paste below</li>
            </ol>
            <p className="mt-2">Repository format: <code className="font-mono bg-[var(--color-surface-soft)] px-1 rounded">username/repo-name</code></p>
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section className="py-8 border-b border-[var(--color-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6">
          <div>
            <h2 className="font-display text-ink text-lg">Profiles</h2>
            <p className="text-sm text-muted mt-1">Your usernames for contribution graph embeds on the Dashboard.</p>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">GitHub Username</label>
              <input
                type="text"
                value={settings.githubUsername || ''}
                onChange={(e) => setSettings({ ...settings, githubUsername: e.target.value })}
                placeholder="octocat"
                className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">LeetCode Username</label>
              <input
                type="text"
                value={settings.leetcodeUsername || ''}
                onChange={(e) => setSettings({ ...settings, leetcodeUsername: e.target.value })}
                placeholder="leetcoder123"
                className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="text-xs text-muted space-y-2 md:border-l md:border-[var(--color-hairline)] md:pl-4">
            <p>Used to display your LeetCode and GitHub contribution graphs on the Dashboard Activity widget.</p>
            <p>These are public usernames — no tokens needed.</p>
          </div>
        </div>
      </section>

      {/* Sync Settings */}
      <section className="py-8 border-b border-[var(--color-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6">
          <div>
            <h2 className="font-display text-ink text-lg">Sync</h2>
            <p className="text-sm text-muted mt-1">Configure how solutions are synced to your repository.</p>
          </div>
          <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.syncOnSolve}
                onChange={(e) => setSettings({ ...settings, syncOnSolve: e.target.checked })}
                className="w-4 h-4 rounded accent-[var(--color-primary)]"
              />
              <span className="text-sm text-ink">Auto-sync when a problem is solved</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Solution Format
              </label>
              <select
                value={settings.solutionFormat}
                onChange={(e) => setSettings({ ...settings, solutionFormat: e.target.value as Settings['solutionFormat'] })}
                className="h-10 px-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none"
              >
                <option value="markdown">Markdown (with metadata)</option>
                <option value="code-only">Code only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Solution Path Template
              </label>
              <input
                type="text"
                value={settings.solutionPath}
                onChange={(e) => setSettings({ ...settings, solutionPath: e.target.value })}
                className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)]"
              />
              <p className="text-xs text-muted mt-1.5">
                Available variables: <code className="font-mono text-[var(--color-primary)]">{'{topic}'}</code>, <code className="font-mono text-[var(--color-primary)]">{'{slug}'}</code>, <code className="font-mono text-[var(--color-primary)]">{'{id}'}</code>, <code className="font-mono text-[var(--color-primary)]">{'{language}'}</code>
              </p>
            </div>
          </div>
          <div className="text-xs text-muted space-y-2 md:border-l md:border-[var(--color-hairline)] md:pl-4">
            <p><strong className="text-ink">Markdown</strong> — Wraps your code in a .md file with frontmatter (problem ID, title, difficulty, topics, date).</p>
            <p><strong className="text-ink">Code only</strong> — Saves the raw solution file without metadata.</p>
            <p className="mt-2 font-medium text-ink">Path template variables:</p>
            <ul className="space-y-0.5 font-mono">
              <li><code className="bg-[var(--color-surface-soft)] px-1 rounded">{'{topic}'}</code> → e.g. arrays</li>
              <li><code className="bg-[var(--color-surface-soft)] px-1 rounded">{'{slug}'}</code> → e.g. two-sum</li>
              <li><code className="bg-[var(--color-surface-soft)] px-1 rounded">{'{id}'}</code> → e.g. 1</li>
              <li><code className="bg-[var(--color-surface-soft)] px-1 rounded">{'{language}'}</code> → e.g. python</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="py-8 border-b border-[var(--color-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6">
          <div>
            <h2 className="font-display text-ink text-lg">Theme</h2>
            <p className="text-sm text-muted mt-1">Choose your preferred color scheme.</p>
          </div>
          <div>
            <select
              value={settings.theme}
              onChange={(e) => {
                const value = e.target.value as Settings['theme'];
                setSettings({ ...settings, theme: value });
                applyTheme(value);
              }}
              className="h-10 px-3 rounded-[var(--radius-md)] text-sm bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="text-xs text-muted md:border-l md:border-[var(--color-hairline)] md:pl-4">
            <p><strong className="text-ink">System</strong> — Follows your OS preference automatically.</p>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="py-8 border-b border-[var(--color-hairline)]">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_220px] gap-6">
          <div>
            <h2 className="font-display text-ink text-lg">Data</h2>
            <p className="text-sm text-muted mt-1">Export or import your progress and settings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExport} className="btn-secondary inline-flex items-center gap-2">
              <Download size={14} /> Export Data
            </button>
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
              <Upload size={14} /> Import Data
              <input type="file" accept=".json" className="hidden" onChange={() => setMessage({ type: 'success', text: 'Import not yet implemented.' })} />
            </label>
          </div>
          <div className="text-xs text-muted space-y-2 md:border-l md:border-[var(--color-hairline)] md:pl-4">
            <p><strong className="text-ink">Export</strong> — Downloads a JSON file containing all solved problems, daily progress, streaks, and settings.</p>
            <p><strong className="text-ink">Import</strong> — Accepts a previously exported JSON backup file.</p>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="py-8 flex items-center gap-4">
        <button onClick={handleSaveClick} disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {message.text}
          </span>
        )}
      </div>

      {showPatEditModal && !patConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <h3 className="font-display text-ink text-lg mb-2">Edit GitHub PAT</h3>
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-soft)' }}>
              <AlertTriangle size={16} className="shrink-0" style={{ color: 'var(--color-warning, #e5a00d)' }} />
              <p className="text-xs text-muted">Your PAT grants write access to your repository. Keep it secure and never share it.</p>
            </div>
            <label className="block text-sm font-medium text-ink mb-1.5">Personal Access Token</label>
            <input
              type="text"
              value={patEditValue}
              onChange={(e) => setPatEditValue(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full h-10 px-3 rounded-[var(--radius-md)] text-sm font-mono bg-[var(--color-surface-soft)] border border-[var(--color-hairline)] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] outline-none focus:border-[var(--color-primary)] mb-5"
            />
            <div className="flex gap-3 justify-between">
              <button
                onClick={handlePatDelete}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 inline-flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPatEditModal(false)}
                  className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePatEditSave}
                  disabled={!patEditValue.trim()}
                  className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {patConfirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl" style={{ backgroundColor: 'var(--color-surface-card)' }}>
            <h3 className="font-display text-ink text-lg mb-2">
              {patConfirmAction === 'delete' ? 'Delete PAT?' : 'Update PAT?'}
            </h3>
            <p className="text-sm text-muted mb-6">
              {patConfirmAction === 'delete'
                ? 'This will remove your GitHub PAT. The extension will no longer be able to push solutions until a new token is added.'
                : 'Are you sure you want to update your GitHub Personal Access Token? This will be used to push solutions to your repository.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPatConfirmAction(null)}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--color-hairline)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmPatAction}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium text-white"
                style={{ backgroundColor: patConfirmAction === 'delete' ? 'var(--color-error, #dc2626)' : 'var(--color-primary)' }}
              >
                {patConfirmAction === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
