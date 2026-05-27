import type { APIRoute } from 'astro';
import { getAllCsvProblems } from '../../lib/csv-parser';
import { getSolvedProblems } from '../../lib/db';

export const GET: APIRoute = async ({ url }) => {
  const difficulty = url.searchParams.get('difficulty');
  const topic = url.searchParams.get('topic');
  const company = url.searchParams.get('company');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  let problems = getAllCsvProblems();

  const solvedMap = new Map<number, { status: string; solvedAt?: string; language?: string }>();
  for (const sp of getSolvedProblems()) {
    solvedMap.set(sp.id, { status: sp.status, solvedAt: sp.solvedAt, language: sp.language });
  }

  problems = problems.map((p) => {
    const solved = solvedMap.get(p.id);
    if (solved) {
      return { ...p, status: solved.status as typeof p.status, solvedAt: solved.solvedAt, language: solved.language };
    }
    return p;
  });

  if (difficulty) {
    problems = problems.filter((p) => p.difficulty === difficulty);
  }
  if (topic) {
    problems = problems.filter((p) => p.topics.includes(topic));
  }
  if (company) {
    problems = problems.filter((p) => p.companies.includes(company));
  }
  if (status) {
    problems = problems.filter((p) => p.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    problems = problems.filter((p) => p.title.toLowerCase().includes(q) || String(p.id).includes(q));
  }

  return new Response(JSON.stringify(problems), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
