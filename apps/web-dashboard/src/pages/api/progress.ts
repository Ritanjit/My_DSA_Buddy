import type { APIRoute } from 'astro';
import { getUserStats, getDailyProgress } from '../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  const startDate = url.searchParams.get('start');
  const endDate = url.searchParams.get('end');

  const defaultStart = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];

  const stats = getUserStats();
  const progress = getDailyProgress(startDate || defaultStart, endDate || defaultEnd);

  return new Response(JSON.stringify({ stats, progress }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
