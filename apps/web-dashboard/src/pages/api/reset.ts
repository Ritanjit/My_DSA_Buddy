import type { APIRoute } from 'astro';
import { resetAllProgress } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    resetAllProgress();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to reset data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
