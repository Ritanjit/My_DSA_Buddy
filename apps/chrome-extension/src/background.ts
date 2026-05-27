import type { ProblemSolvedPayload } from './shared/messaging';
import {
  getGithubSettings,
  updateSyncStatus,
  getSyncStatus,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue,
  updateSyncAllProgress,
  getSolvedProblems,
  addSolvedProblem,
  clearGithubSettings,
  clearAllData,
  type SyncQueueItem,
  type GithubSettings,
} from './shared/storage';

const DASHBOARD_URL = 'http://localhost:4321';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'PROBLEM_SOLVED') {
    handleProblemSolved(message.payload)
      .then(sendResponse)
      .catch((err) => {
        console.error('[DSA Buddy] PROBLEM_SOLVED handler error:', err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
  if (message.type === 'SYNC_ALL_TO_GITHUB') {
    handleSyncAll()
      .then(sendResponse)
      .catch((err) => {
        console.error('[DSA Buddy] SYNC_ALL handler error:', err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
  if (message.type === 'FLUSH_QUEUE') {
    flushSyncQueue()
      .then(sendResponse)
      .catch((err) => {
        console.error('[DSA Buddy] FLUSH_QUEUE handler error:', err);
        sendResponse({ flushed: 0, failed: 0, error: String(err) });
      });
    return true;
  }
  if (message.type === 'UNLINK_GITHUB') {
    handleUnlink()
      .then(sendResponse)
      .catch((err) => {
        console.error('[DSA Buddy] UNLINK handler error:', err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
  if (message.type === 'LOGOUT') {
    handleLogout()
      .then(sendResponse)
      .catch((err) => {
        console.error('[DSA Buddy] LOGOUT handler error:', err);
        sendResponse({ success: false, error: String(err) });
      });
    return true;
  }
});

async function pushToGitHub(
  payload: ProblemSolvedPayload,
  settings: GithubSettings
): Promise<string | null> {
  const { githubPat, githubRepo, githubBranch = 'main', solutionFormat = 'markdown', solutionPath = 'problems/{topic}/{slug}.md' } = settings;

  if (!githubPat || !githubRepo) {
    const reason = !githubPat ? 'missing PAT' : 'missing repo';
    console.log(`[DSA Buddy] GitHub push skipped: ${reason}`);
    return null;
  }

  const authHeader = githubPat.startsWith('github_pat_')
    ? `Bearer ${githubPat}`
    : `token ${githubPat}`;

  const topic = payload.topics[0] || 'general';
  const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const titleSlug = payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const filePath = solutionPath
    .replace('{topic}', topicSlug)
    .replace('{slug}', titleSlug)
    .replace('{id}', String(payload.problemId))
    .replace('{language}', payload.language);

  let content: string;
  if (solutionFormat === 'markdown') {
    content = [
      '---',
      `problem_id: ${payload.problemId}`,
      `title: ${payload.title}`,
      `difficulty: ${payload.difficulty}`,
      `topics: [${payload.topics.join(', ')}]`,
      `solved_at: ${new Date().toISOString()}`,
      `language: ${payload.language}`,
      `url: ${payload.url}`,
      '---',
      '',
      '## Solution',
      '',
      '```' + payload.language,
      payload.solution,
      '```',
      '',
    ].join('\n');
  } else {
    content = payload.solution;
  }

  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  try {
    let sha: string | undefined;
    const checkUrl = `https://api.github.com/repos/${githubRepo}/contents/${filePath}?ref=${githubBranch}`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'My-DSA-Buddy',
      },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    } else if (checkRes.status === 401 || checkRes.status === 403) {
      const errText = await checkRes.text();
      console.error('[DSA Buddy] GitHub auth failed:', checkRes.status, errText);
      const hint = checkRes.status === 403
        ? 'PAT lacks write access. Classic tokens (ghp_) need "repo" scope. Fine-grained tokens (github_pat_) need "Contents: Read and write" permission.'
        : 'Invalid PAT. Check that your token is correct and not expired.';
      await updateSyncStatus({ error: hint });
      return null;
    } else if (checkRes.status !== 404) {
      const errText = await checkRes.text();
      console.error('[DSA Buddy] GitHub check failed:', checkRes.status, errText);
      await updateSyncStatus({ error: `GitHub error (${checkRes.status}): ${errText.slice(0, 80)}` });
      return null;
    }

    const putUrl = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`;
    const res = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'My-DSA-Buddy',
      },
      body: JSON.stringify({
        message: `Add solution: ${payload.title}`,
        content: encodedContent,
        branch: githubBranch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (res.ok) {
      console.log('[DSA Buddy] GitHub push success:', filePath);
      return filePath;
    }

    const errBody = await res.text();
    console.error('[DSA Buddy] GitHub push failed:', res.status, errBody);
    if (res.status === 403) {
      await updateSyncStatus({ error: 'PAT lacks write access. Classic tokens (ghp_) need "repo" scope. Fine-grained tokens (github_pat_) need "Contents: Read and write" permission.' });
    } else {
      await updateSyncStatus({ error: `GitHub push failed (${res.status}): ${errBody.slice(0, 80)}` });
    }
    return null;
  } catch (err) {
    console.error('[DSA Buddy] GitHub push error:', err);
    await updateSyncStatus({ error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}` });
    return null;
  }
}

async function handleProblemSolved(payload: ProblemSolvedPayload) {
  const solvedAt = new Date().toISOString();
  let githubPath: string | null = null;

  const settings = await getGithubSettings();
  console.log('[DSA Buddy] Settings from local storage:', { hasPat: !!settings.githubPat, repo: settings.githubRepo });

  if (settings.githubPat && settings.githubRepo) {
    try {
      githubPath = await pushToGitHub(payload, settings);
    } catch (err) {
      console.error('[DSA Buddy] pushToGitHub threw:', err);
    }
  }

  const queueItem: SyncQueueItem = {
    problemId: payload.problemId || slugToFakeId(payload.slug),
    title: payload.title,
    difficulty: payload.difficulty,
    topics: payload.topics,
    language: payload.language,
    solution: payload.solution,
    solvedAt,
    url: payload.url,
    githubPath,
  };

  await addSolvedProblem(queueItem);
  await addToSyncQueue(queueItem);

  const status = await getSyncStatus();
  await updateSyncStatus({
    lastSyncAt: solvedAt,
    lastProblemTitle: payload.title,
    totalSynced: (status.totalSynced || 0) + 1,
    error: githubPath ? null : (settings.githubPat ? status.error : 'GitHub not configured'),
  });

  await flushSyncQueue();

  return { success: true, githubPath };
}

async function flushSyncQueue(): Promise<{ flushed: number; failed: number }> {
  const queue = await getSyncQueue();
  if (queue.length === 0) return { flushed: 0, failed: 0 };

  let flushed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const res = await fetch(`${DASHBOARD_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        flushed++;
      } else {
        failed++;
      }
    } catch {
      failed += queue.length - flushed;
      break;
    }
  }

  if (flushed === queue.length) {
    await clearSyncQueue();
  } else if (flushed > 0) {
    const remaining = queue.slice(flushed);
    await chrome.storage.local.set({ 'dsabuddy-sync-queue': remaining });
  }

  return { flushed, failed };
}

async function handleSyncAll() {
  const settings = await getGithubSettings();
  if (!settings.githubPat || !settings.githubRepo) {
    return { success: false, error: 'GitHub not configured. Add PAT and repo in extension settings.' };
  }

  await updateSyncAllProgress({ total: 0, completed: 0, failed: 0, inProgress: true });

  const solvedProblems = await getSolvedProblems();

  if (solvedProblems.length === 0) {
    try {
      const res = await fetch(`${DASHBOARD_URL}/api/problems?status=solved`);
      if (res.ok) {
        const dashProblems = await res.json();
        if (dashProblems.length > 0) {
          return await syncProblemsToGitHub(dashProblems, settings);
        }
      }
    } catch {}

    await updateSyncAllProgress({ total: 0, completed: 0, failed: 0, inProgress: false });
    return { success: false, error: 'No solved problems found' };
  }

  return await syncProblemsToGitHub(solvedProblems, settings);
}

async function syncProblemsToGitHub(problems: SyncQueueItem[], settings: GithubSettings) {
  const total = problems.length;
  await updateSyncAllProgress({ total, completed: 0, failed: 0, inProgress: true });

  let completed = 0;
  let failed = 0;

  for (const problem of problems) {
    const payload: ProblemSolvedPayload = {
      problemId: problem.problemId,
      slug: problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: problem.title,
      difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
      topics: problem.topics || [],
      language: problem.language || 'python',
      solution: problem.solution || `// Solution for ${problem.title}`,
      url: problem.url || '',
    };

    const result = await pushToGitHub(payload, settings);
    if (result) {
      completed++;
    } else {
      failed++;
    }

    await updateSyncAllProgress({ total, completed, failed, inProgress: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  await updateSyncAllProgress({ total, completed, failed, inProgress: false });
  return { success: true, completed, failed, total };
}

async function handleUnlink() {
  await clearGithubSettings();
  try {
    await fetch(`${DASHBOARD_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubPat: '', githubRepo: '', githubBranch: 'main' }),
    });
  } catch {}
  return { success: true };
}

async function handleLogout() {
  try {
    await fetch(`${DASHBOARD_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubPat: '', githubRepo: '', githubBranch: 'main' }),
    });
  } catch {}
  await clearAllData();
  return { success: true };
}

function slugToFakeId(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100000;
}
