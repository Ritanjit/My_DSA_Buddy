import type { APIRoute } from 'astro';
import { getSettings, updateSettings } from '../../lib/db';
import type { UserSettings } from '@shared/types/settings';

export const GET: APIRoute = async () => {
  const settings = getSettings();

  const safe = { ...settings };
  if (safe.githubPat) {
    safe.githubPat = safe.githubPat.slice(0, 4) + '****' + safe.githubPat.slice(-4);
  }

  return new Response(JSON.stringify(safe), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: Partial<UserSettings>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const allowed: (keyof UserSettings)[] = [
    'githubPat', 'githubRepo', 'githubBranch',
    'syncOnSolve', 'theme', 'solutionFormat', 'solutionPath',
  ];

  const filtered: Partial<UserSettings> = {};
  for (const key of allowed) {
    if (key in body) {
      (filtered as Record<string, unknown>)[key] = body[key];
    }
  }

  if (Object.keys(filtered).length === 0) {
    return new Response(JSON.stringify({ error: 'No valid fields provided' }), { status: 400 });
  }

  try {
    updateSettings(filtered);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
