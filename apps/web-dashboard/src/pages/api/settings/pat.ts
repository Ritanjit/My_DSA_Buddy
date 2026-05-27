import type { APIRoute } from 'astro';
import { getSettings } from '../../../lib/db';

export const GET: APIRoute = async ({ request }) => {
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const settings = getSettings();

  return new Response(JSON.stringify({
    githubPat: settings.githubPat || null,
    githubRepo: settings.githubRepo || null,
    githubBranch: settings.githubBranch,
    solutionFormat: settings.solutionFormat,
    solutionPath: settings.solutionPath,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
