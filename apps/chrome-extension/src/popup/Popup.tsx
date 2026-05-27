import React, { useEffect, useState } from 'react';
import {
  getGithubSettings,
  setGithubSettings,
  getSyncStatus,
  getSyncAllProgress,
  getExtSettings,
  setExtSettings,
  clearAllData,
  clearGithubSettings,
  type GithubSettings,
  type SyncStatus,
  type SyncAllProgress,
  type ExtensionSettings,
} from '../shared/storage';

interface ProgressStats {
  totalSolved: number;
  currentStreak: number;
  byDifficulty: { easy: number; medium: number; hard: number };
}

const DASHBOARD_URL = 'http://localhost:4321';

export default function Popup() {
  const [settings, setSettings] = useState<GithubSettings | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [syncAllProgress, setSyncAllProgress] = useState<SyncAllProgress | null>(null);
  const [extSettings, setExtSettingsState] = useState<ExtensionSettings>({ submitNewOnly: true, syncMultiple: false });
  const [dashboardOnline, setDashboardOnline] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('main');

  useEffect(() => {
    loadLocalState();
    checkDashboard();
    const interval = setInterval(pollProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadLocalState() {
    const gh = await getGithubSettings();
    setSettings(gh);
    setPatInput(gh.githubPat ? gh.githubPat.slice(0, 4) + '****' : '');
    setRepoInput(gh.githubRepo);
    setBranchInput(gh.githubBranch || 'main');

    const status = await getSyncStatus();
    setSyncStatus(status);

    const ext = await getExtSettings();
    setExtSettingsState(ext);

    const progress = await getSyncAllProgress();
    setSyncAllProgress(progress);
  }

  async function checkDashboard() {
    try {
      const r = await fetch(`${DASHBOARD_URL}/api/progress`);
      setDashboardOnline(true);
      const data = await r.json();
      if (data?.stats) {
        setStats({
          totalSolved: data.stats.totalSolved,
          currentStreak: data.stats.currentStreak,
          byDifficulty: data.stats.byDifficulty || { easy: 0, medium: 0, hard: 0 },
        });
      }
      chrome.runtime.sendMessage({ type: 'FLUSH_QUEUE', payload: {} }).catch(() => {});
    } catch {
      setDashboardOnline(false);
    }
  }

  async function pollProgress() {
    const progress = await getSyncAllProgress();
    setSyncAllProgress(progress);
    const status = await getSyncStatus();
    setSyncStatus(status);
  }

  const githubConfigured = !!(settings?.githubPat && settings?.githubRepo);

  async function handleSaveSettings() {
    const newSettings: Partial<GithubSettings> = { githubRepo: repoInput, githubBranch: branchInput };
    if (patInput && !patInput.includes('****')) {
      newSettings.githubPat = patInput;
    }
    await setGithubSettings(newSettings);
    const updated = await getGithubSettings();
    setSettings(updated);
    setShowSettings(false);

    if (dashboardOnline) {
      try {
        await fetch(`${DASHBOARD_URL}/api/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });
      } catch {}
    }
  }

  async function handleSyncAll() {
    setSyncing(true);
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SYNC_ALL_TO_GITHUB', payload: {} });
      if (response?.error) {
        const status = await getSyncStatus();
        setSyncStatus({ ...status, error: response.error });
      }
    } catch (err) {
      console.error('Sync all failed:', err);
      const status = await getSyncStatus();
      setSyncStatus({ ...status, error: `Sync failed: ${err instanceof Error ? err.message : String(err)}` });
    }
    setSyncing(false);
  }

  async function handleUnlink() {
    await clearGithubSettings();
    setSettings(await getGithubSettings());
    setPatInput('');
    setRepoInput('');
    try {
      await chrome.runtime.sendMessage({ type: 'UNLINK_GITHUB', payload: {} });
    } catch {}
  }

  async function handleLogout() {
    try {
      await chrome.runtime.sendMessage({ type: 'LOGOUT', payload: {} });
    } catch {}
    await clearAllData();
    setSettings(null);
    setSyncStatus(null);
    setStats(null);
    setSyncAllProgress(null);
  }

  function updateExtSetting(key: keyof ExtensionSettings, value: boolean) {
    const updated = { ...extSettings, [key]: value };
    setExtSettingsState(updated);
    setExtSettings(updated);
  }

  if (showSettings) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>GitHub Settings</span>
          <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8e8b82' }}>×</button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6c6a64', marginBottom: '4px' }}>Personal Access Token</label>
          <input
            type="password"
            value={patInput}
            onChange={(e) => setPatInput(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e8e5df', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
          />
          <p style={{ fontSize: '10px', color: '#8e8b82', marginTop: '4px' }}>Needs `repo` scope. Stored locally in extension only.</p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6c6a64', marginBottom: '4px' }}>Repository</label>
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="username/repo-name"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e8e5df', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6c6a64', marginBottom: '4px' }}>Branch</label>
          <input
            type="text"
            value={branchInput}
            onChange={(e) => setBranchInput(e.target.value)}
            placeholder="main"
            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e8e5df', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }}
          />
        </div>

        <button
          onClick={handleSaveSettings}
          style={{ width: '100%', padding: '9px', borderRadius: '6px', border: 'none', backgroundColor: '#cc785c', color: '#fff', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
        >
          Save Settings
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#cc785c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>D</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>My DSA Buddy</div>
          <div style={{ fontSize: '10px', color: '#8e8b82' }}>LeetCode Progress Tracker</div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8b82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
        <StatBox label="Easy" value={stats?.byDifficulty.easy ?? 0} color="#5db872" />
        <StatBox label="Medium" value={stats?.byDifficulty.medium ?? 0} color="#f5a623" />
        <StatBox label="Hard" value={stats?.byDifficulty.hard ?? 0} color="#c64545" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
        <StatBox label="Total Solved" value={stats?.totalSolved ?? 0} color="#cc785c" />
        <StatBox label="Day Streak" value={stats?.currentStreak ?? 0} color="#cc785c" />
      </div>

      {/* Status */}
      <div style={{ padding: '8px 10px', borderRadius: '7px', backgroundColor: '#f5f0e8', marginBottom: '12px' }}>
        <StatusRow label="Dashboard" status={dashboardOnline === null ? 'checking' : dashboardOnline ? 'ok' : 'warn'} detail={dashboardOnline ? 'Online' : dashboardOnline === null ? '...' : 'Offline'} />
        <StatusRow label="GitHub" status={githubConfigured ? 'ok' : 'error'} detail={githubConfigured ? 'Linked' : 'Not configured'} />
      </div>

      {/* Repository */}
      {githubConfigured && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: '6px 10px', borderRadius: '7px', backgroundColor: '#f5f0e8' }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="#8e8b82">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
          </svg>
          <a href={`https://github.com/${settings!.githubRepo}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#cc785c', textDecoration: 'none', flex: 1 }}>
            {settings!.githubRepo}
          </a>
          <span style={{ fontSize: '10px', color: '#8e8b82' }}>{settings!.githubBranch || 'main'}</span>
        </div>
      )}

      {/* Sync */}
      <Section title="Sync">
        {syncAllProgress?.inProgress ? (
          <div>
            <div style={{ fontSize: '11px', color: '#3d3d3a', marginBottom: '4px' }}>
              Pushing to GitHub... {syncAllProgress.completed}/{syncAllProgress.total}
            </div>
            <div style={{ height: '4px', borderRadius: '2px', backgroundColor: '#e8e5df', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '2px', backgroundColor: '#cc785c', width: syncAllProgress.total > 0 ? `${(syncAllProgress.completed / syncAllProgress.total) * 100}%` : '0%', transition: 'width 0.3s' }} />
            </div>
            {syncAllProgress.failed > 0 && <div style={{ fontSize: '10px', color: '#c64545', marginTop: '3px' }}>{syncAllProgress.failed} failed</div>}
          </div>
        ) : (
          <button
            onClick={handleSyncAll}
            disabled={syncing || !githubConfigured}
            style={{ width: '100%', padding: '7px', borderRadius: '6px', border: 'none', backgroundColor: githubConfigured ? '#cc785c' : '#d4d2cd', color: '#fff', fontSize: '11px', fontWeight: 500, cursor: githubConfigured ? 'pointer' : 'not-allowed' }}
          >
            {syncing ? 'Starting...' : 'Sync All Solved to GitHub'}
          </button>
        )}

        {syncStatus?.lastProblemTitle && (
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #e8e5df' }}>
            <div style={{ fontSize: '10px', color: '#8e8b82' }}>Last synced</div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#3d3d3a' }}>{syncStatus.lastProblemTitle}</div>
            {syncStatus.lastSyncAt && <div style={{ fontSize: '10px', color: '#8e8b82', fontFamily: 'monospace' }}>{formatRelative(syncStatus.lastSyncAt)}</div>}
          </div>
        )}

        {!syncStatus?.lastProblemTitle && !syncAllProgress?.inProgress && (
          <div style={{ fontSize: '10px', color: '#8e8b82', marginTop: '6px' }}>No synchronization performed yet</div>
        )}
      </Section>

      {/* Error */}
      {syncStatus?.error && (
        <div style={{ padding: '7px 10px', borderRadius: '7px', backgroundColor: '#fef2f2', marginBottom: '10px', fontSize: '10px', color: '#c64545' }}>
          {syncStatus.error}
        </div>
      )}

      {/* Extension Settings */}
      <Section title="Settings">
        <ToggleRow label="Submit only new solutions" checked={extSettings.submitNewOnly} onChange={(v) => updateExtSetting('submitNewOnly', v)} />
        <ToggleRow label="Sync multiple submissions" checked={extSettings.syncMultiple} onChange={(v) => updateExtSetting('syncMultiple', v)} />
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <a href={`${DASHBOARD_URL}/dashboard`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', textAlign: 'center', padding: '8px', borderRadius: '7px', backgroundColor: '#cc785c', color: '#fff', fontSize: '11px', fontWeight: 500, textDecoration: 'none' }}>
          Open Dashboard
        </a>
        {githubConfigured && (
          <button onClick={handleUnlink} style={{ padding: '8px 10px', borderRadius: '7px', border: '1px solid #e8e5df', backgroundColor: 'transparent', color: '#6c6a64', fontSize: '10px', cursor: 'pointer' }}>
            Unlink
          </button>
        )}
        <button onClick={handleLogout} style={{ padding: '8px 10px', borderRadius: '7px', border: '1px solid #fecaca', backgroundColor: 'transparent', color: '#c64545', fontSize: '10px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {!dashboardOnline && (
        <p style={{ fontSize: '9px', color: '#8e8b82', textAlign: 'center' }}>
          Dashboard offline — solves are queued and will sync when it's back.
        </p>
      )}

      <p style={{ fontSize: '9px', color: '#8e8b82', textAlign: 'center', marginTop: '4px' }}>
        Solve problems on LeetCode — they sync automatically.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#8e8b82', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ padding: '8px 10px', borderRadius: '7px', backgroundColor: '#f5f0e8' }}>{children}</div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: '8px 6px', borderRadius: '7px', backgroundColor: '#f5f0e8', textAlign: 'center' }}>
      <div style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'monospace', color }}>{value}</div>
      <div style={{ fontSize: '9px', color: '#6c6a64', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function StatusRow({ label, status, detail }: { label: string; status: 'ok' | 'warn' | 'error' | 'checking'; detail: string }) {
  const colors = { ok: '#5db872', warn: '#d4a017', error: '#c64545', checking: '#8e8b82' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '2px 0' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors[status], flexShrink: 0 }} />
      <span style={{ fontSize: '11px', color: '#6c6a64', flex: 1 }}>{label}</span>
      <span style={{ fontSize: '11px', color: '#3d3d3a', fontWeight: 500 }}>{detail}</span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: '11px', color: '#3d3d3a' }}>{label}</span>
      <label style={{ position: 'relative', display: 'inline-block', width: '32px', height: '16px', cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '8px', transition: 'background-color 0.2s', backgroundColor: checked ? '#cc785c' : '#d4d2cd' }}>
          <span style={{ position: 'absolute', left: checked ? '16px' : '2px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
        </span>
      </label>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
