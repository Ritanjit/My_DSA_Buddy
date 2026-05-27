import type { APIRoute } from 'astro';
import { insertSolvedProblem, updateDailyProgress } from '../../lib/db';
import type { SyncPayload } from '@shared/types/settings';

export const POST: APIRoute = async ({ request }) => {
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  let payload: SyncPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!payload.problemId || !payload.title || !payload.difficulty || !payload.solvedAt) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  if (!['Easy', 'Medium', 'Hard'].includes(payload.difficulty)) {
    return new Response(JSON.stringify({ error: 'Invalid difficulty' }), { status: 400 });
  }

  try {
    insertSolvedProblem(payload);
    const date = payload.solvedAt.split('T')[0];
    updateDailyProgress(date, payload.problemId);

    return new Response(JSON.stringify({ success: true, problemId: payload.problemId }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
