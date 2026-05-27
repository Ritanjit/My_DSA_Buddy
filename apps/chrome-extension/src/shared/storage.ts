export interface SyncStatus {
  lastSyncAt: string | null;
  lastProblemTitle: string | null;
  totalSynced: number;
  error: string | null;
}

export interface GithubSettings {
  githubPat: string;
  githubRepo: string;
  githubBranch: string;
  solutionFormat: string;
  solutionPath: string;
}

export interface SyncQueueItem {
  problemId: number;
  title: string;
  difficulty: string;
  topics: string[];
  language: string;
  solution: string;
  solvedAt: string;
  url: string;
  githubPath: string | null;
}

export interface SyncAllProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

export interface ExtensionSettings {
  submitNewOnly: boolean;
  syncMultiple: boolean;
}

const KEYS = {
  GITHUB_SETTINGS: 'dsabuddy-github-settings',
  SYNC_STATUS: 'dsabuddy-sync-status',
  SYNC_QUEUE: 'dsabuddy-sync-queue',
  SYNC_ALL_PROGRESS: 'dsabuddy-sync-all-progress',
  EXT_SETTINGS: 'dsabuddy-ext-settings',
  SOLVED_PROBLEMS: 'dsabuddy-solved-problems',
};

export async function getGithubSettings(): Promise<GithubSettings> {
  const result = await chrome.storage.local.get(KEYS.GITHUB_SETTINGS);
  return result[KEYS.GITHUB_SETTINGS] || {
    githubPat: '',
    githubRepo: '',
    githubBranch: 'main',
    solutionFormat: 'markdown',
    solutionPath: 'problems/{topic}/{slug}.md',
  };
}

export async function setGithubSettings(settings: Partial<GithubSettings>): Promise<void> {
  const current = await getGithubSettings();
  await chrome.storage.local.set({ [KEYS.GITHUB_SETTINGS]: { ...current, ...settings } });
}

export async function clearGithubSettings(): Promise<void> {
  await chrome.storage.local.set({
    [KEYS.GITHUB_SETTINGS]: {
      githubPat: '',
      githubRepo: '',
      githubBranch: 'main',
      solutionFormat: 'markdown',
      solutionPath: 'problems/{topic}/{slug}.md',
    },
  });
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const result = await chrome.storage.local.get(KEYS.SYNC_STATUS);
  return result[KEYS.SYNC_STATUS] || {
    lastSyncAt: null,
    lastProblemTitle: null,
    totalSynced: 0,
    error: null,
  };
}

export async function updateSyncStatus(update: Partial<SyncStatus>): Promise<void> {
  const current = await getSyncStatus();
  await chrome.storage.local.set({ [KEYS.SYNC_STATUS]: { ...current, ...update } });
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const result = await chrome.storage.local.get(KEYS.SYNC_QUEUE);
  return result[KEYS.SYNC_QUEUE] || [];
}

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  const queue = await getSyncQueue();
  queue.push(item);
  await chrome.storage.local.set({ [KEYS.SYNC_QUEUE]: queue });
}

export async function clearSyncQueue(): Promise<void> {
  await chrome.storage.local.set({ [KEYS.SYNC_QUEUE]: [] });
}

export async function getSyncAllProgress(): Promise<SyncAllProgress> {
  const result = await chrome.storage.local.get(KEYS.SYNC_ALL_PROGRESS);
  return result[KEYS.SYNC_ALL_PROGRESS] || { total: 0, completed: 0, failed: 0, inProgress: false };
}

export async function updateSyncAllProgress(progress: SyncAllProgress): Promise<void> {
  await chrome.storage.local.set({ [KEYS.SYNC_ALL_PROGRESS]: progress });
}

export async function getExtSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(KEYS.EXT_SETTINGS);
  return result[KEYS.EXT_SETTINGS] || { submitNewOnly: true, syncMultiple: false };
}

export async function setExtSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [KEYS.EXT_SETTINGS]: settings });
}

export async function getSolvedProblems(): Promise<SyncQueueItem[]> {
  const result = await chrome.storage.local.get(KEYS.SOLVED_PROBLEMS);
  return result[KEYS.SOLVED_PROBLEMS] || [];
}

export async function addSolvedProblem(item: SyncQueueItem): Promise<void> {
  const problems = await getSolvedProblems();
  const existing = problems.findIndex((p) => p.problemId === item.problemId);
  if (existing >= 0) {
    problems[existing] = item;
  } else {
    problems.push(item);
  }
  await chrome.storage.local.set({ [KEYS.SOLVED_PROBLEMS]: problems });
}

export async function clearAllData(): Promise<void> {
  await chrome.storage.local.clear();
}
