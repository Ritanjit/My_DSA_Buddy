import type { APIRoute } from 'astro';
import { getSolvedProblems, insertSolvedProblem, updateDailyProgress } from '../../lib/db';
import type { Difficulty, ProblemStatus } from '@shared/types/problem';

export const GET: APIRoute = async ({ url }) => {
  const difficulty = url.searchParams.get('difficulty') as Difficulty | null;
  const topic = url.searchParams.get('topic');
  const company = url.searchParams.get('company');
  const status = url.searchParams.get('status') as ProblemStatus | null;

  const problems = getSolvedProblems({
    difficulty: difficulty || undefined,
    topic: topic || undefined,
    company: company || undefined,
    status: status || undefined,
  });

  return new Response(JSON.stringify(problems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { problemId, title, difficulty, topics, language, solution, url, status } = body as {
    problemId?: number;
    title?: string;
    difficulty?: string;
    topics?: string[];
    language?: string;
    solution?: string;
    url?: string;
    status?: string;
  };

  if (!problemId || !title || !difficulty) {
    return new Response(JSON.stringify({ error: 'Missing required fields: problemId, title, difficulty' }), { status: 400 });
  }

  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
    return new Response(JSON.stringify({ error: 'Invalid difficulty' }), { status: 400 });
  }

  try {
    const solvedAt = new Date().toISOString();
    insertSolvedProblem({
      problemId,
      title,
      difficulty: difficulty as Difficulty,
      topics: topics || [],
      language: language || 'unknown',
      solution: solution || '',
      solvedAt,
      url: url || `https://leetcode.com/problems/${problemId}/`,
    });

    if (status !== 'attempted') {
      const date = solvedAt.split('T')[0];
      updateDailyProgress(date, problemId);
    }

    return new Response(JSON.stringify({ success: true, problemId }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
