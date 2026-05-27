import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { Problem, Difficulty, ProblemStatus } from '@shared/types/problem';
import type { DailyProgress, UserStats } from '@shared/types/progress';
import type { UserSettings, SyncPayload } from '@shared/types/settings';
import type { Roadmap } from '@shared/types/roadmap';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, 'user.db');

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS solved_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Easy', 'Medium', 'Hard')),
    topics TEXT,
    companies TEXT,
    status TEXT DEFAULT 'solved',
    solved_at TEXT NOT NULL,
    time_spent INTEGER,
    language TEXT,
    solution TEXT,
    notes TEXT,
    url TEXT,
    github_path TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_progress (
    date TEXT PRIMARY KEY,
    problems_solved INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    problem_ids TEXT
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS roadmaps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('company', 'topic', 'custom')),
    company TEXT,
    problem_ids TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// --- Query Helpers ---

interface ProblemFilters {
  difficulty?: Difficulty;
  topic?: string;
  company?: string;
  status?: ProblemStatus;
}

export function getSolvedProblems(filters?: ProblemFilters): Problem[] {
  let query = 'SELECT * FROM solved_problems WHERE 1=1';
  const params: unknown[] = [];

  if (filters?.difficulty) {
    query += ' AND difficulty = ?';
    params.push(filters.difficulty);
  }
  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters?.topic) {
    query += ' AND topics LIKE ?';
    params.push(`%${filters.topic}%`);
  }
  if (filters?.company) {
    query += ' AND companies LIKE ?';
    params.push(`%${filters.company}%`);
  }

  query += ' ORDER BY solved_at DESC';

  const rows = db.prepare(query).all(...params) as Array<Record<string, unknown>>;
  return rows.map(rowToProblem);
}

export function insertSolvedProblem(data: SyncPayload & { timeSpent?: number; notes?: string }): void {
  const stmt = db.prepare(`
    INSERT INTO solved_problems (problem_id, title, difficulty, topics, companies, status, solved_at, time_spent, language, solution, notes, url, github_path)
    VALUES (?, ?, ?, ?, ?, 'solved', ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(problem_id) DO UPDATE SET
      status = 'solved',
      solved_at = excluded.solved_at,
      language = excluded.language,
      solution = excluded.solution,
      github_path = excluded.github_path
  `);

  stmt.run(
    data.problemId,
    data.title,
    data.difficulty,
    JSON.stringify(data.topics),
    JSON.stringify([]),
    data.solvedAt,
    data.timeSpent || null,
    data.language,
    data.solution,
    data.notes || null,
    data.url,
    data.githubPath || null,
  );
}

export function updateDailyProgress(date: string, problemId: number, timeSpent?: number): void {
  const existing = db.prepare('SELECT * FROM daily_progress WHERE date = ?').get(date) as Record<string, unknown> | undefined;

  if (existing) {
    const ids: number[] = JSON.parse((existing.problem_ids as string) || '[]');
    if (!ids.includes(problemId)) {
      ids.push(problemId);
      db.prepare(`
        UPDATE daily_progress SET problems_solved = ?, time_spent = time_spent + ?, problem_ids = ? WHERE date = ?
      `).run(ids.length, timeSpent || 0, JSON.stringify(ids), date);
    }
  } else {
    db.prepare(`
      INSERT INTO daily_progress (date, problems_solved, time_spent, problem_ids) VALUES (?, 1, ?, ?)
    `).run(date, timeSpent || 0, JSON.stringify([problemId]));
  }
}

export function getDailyProgress(startDate?: string, endDate?: string): DailyProgress[] {
  let query = 'SELECT * FROM daily_progress';
  const params: string[] = [];

  if (startDate && endDate) {
    query += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    query += ' WHERE date >= ?';
    params.push(startDate);
  }

  query += ' ORDER BY date DESC';

  const rows = db.prepare(query).all(...params) as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    date: row.date as string,
    problemsSolved: row.problems_solved as number,
    timeSpent: row.time_spent as number,
    problemIds: JSON.parse((row.problem_ids as string) || '[]'),
  }));
}

export function getUserStats(): UserStats {
  const totalRow = db.prepare('SELECT COUNT(*) as count FROM solved_problems WHERE status = ?').get('solved') as { count: number };
  const difficultyRows = db.prepare(`
    SELECT difficulty, COUNT(*) as count FROM solved_problems WHERE status = 'solved' GROUP BY difficulty
  `).all() as Array<{ difficulty: string; count: number }>;

  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  for (const row of difficultyRows) {
    const key = row.difficulty.toLowerCase() as keyof typeof byDifficulty;
    byDifficulty[key] = row.count;
  }

  const allProgress = db.prepare('SELECT date FROM daily_progress WHERE problems_solved > 0 ORDER BY date DESC').all() as Array<{ date: string }>;
  const { currentStreak, longestStreak } = computeStreaks(allProgress.map((r) => r.date));

  const topicRows = db.prepare("SELECT topics FROM solved_problems WHERE status = 'solved'").all() as Array<{ topics: string }>;
  const byTopic: Record<string, number> = {};
  for (const row of topicRows) {
    const topics: string[] = JSON.parse(row.topics || '[]');
    for (const t of topics) {
      byTopic[t] = (byTopic[t] || 0) + 1;
    }
  }

  const companyRows = db.prepare("SELECT companies FROM solved_problems WHERE status = 'solved'").all() as Array<{ companies: string }>;
  const byCompany: Record<string, number> = {};
  for (const row of companyRows) {
    const companies: string[] = JSON.parse(row.companies || '[]');
    for (const c of companies) {
      byCompany[c] = (byCompany[c] || 0) + 1;
    }
  }

  const lastRow = db.prepare("SELECT solved_at FROM solved_problems WHERE status = 'solved' ORDER BY solved_at DESC LIMIT 1").get() as { solved_at: string } | undefined;

  return {
    totalSolved: totalRow.count,
    currentStreak,
    longestStreak,
    byDifficulty,
    byTopic,
    byCompany,
    lastSolvedAt: lastRow?.solved_at,
  };
}

export function getSettings(): UserSettings {
  const rows = db.prepare('SELECT key, value FROM user_settings').all() as Array<{ key: string; value: string }>;
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  return {
    githubPat: map.githubPat || undefined,
    githubRepo: map.githubRepo || undefined,
    githubBranch: map.githubBranch || 'main',
    syncOnSolve: map.syncOnSolve === 'true',
    theme: (map.theme as UserSettings['theme']) || 'light',
    solutionFormat: (map.solutionFormat as UserSettings['solutionFormat']) || 'markdown',
    solutionPath: map.solutionPath || 'problems/{topic}/{slug}.md',
  };
}

export function updateSettings(partial: Partial<UserSettings>): void {
  const stmt = db.prepare('INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  const transaction = db.transaction((entries: [string, string][]) => {
    for (const [key, value] of entries) {
      stmt.run(key, value);
    }
  });

  const entries: [string, string][] = Object.entries(partial)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => [k, String(v)]);

  transaction(entries);
}

export function getRoadmaps(): Roadmap[] {
  const rows = db.prepare('SELECT * FROM roadmaps ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    type: row.type as Roadmap['type'],
    company: row.company as string | undefined,
    problemIds: JSON.parse((row.problem_ids as string) || '[]'),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export function upsertRoadmap(roadmap: Roadmap): void {
  db.prepare(`
    INSERT INTO roadmaps (id, name, description, type, company, problem_ids, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      description = excluded.description,
      problem_ids = excluded.problem_ids,
      updated_at = excluded.updated_at
  `).run(
    roadmap.id,
    roadmap.name,
    roadmap.description,
    roadmap.type,
    roadmap.company || null,
    JSON.stringify(roadmap.problemIds),
    roadmap.createdAt,
    roadmap.updatedAt,
  );
}

export function resetAllProgress(): void {
  db.exec('DELETE FROM solved_problems');
  db.exec('DELETE FROM daily_progress');
}

// --- Helpers ---

function rowToProblem(row: Record<string, unknown>): Problem {
  return {
    id: row.problem_id as number,
    title: row.title as string,
    difficulty: row.difficulty as Difficulty,
    topics: JSON.parse((row.topics as string) || '[]'),
    companies: JSON.parse((row.companies as string) || '[]'),
    status: row.status as ProblemStatus,
    solvedAt: row.solved_at as string | undefined,
    timeSpent: row.time_spent as number | undefined,
    language: row.language as string | undefined,
    solution: row.solution as string | undefined,
    notes: row.notes as string | undefined,
    url: row.url as string,
    githubPath: row.github_path as string | undefined,
  };
}

function computeStreaks(dates: string[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  if (sorted[0] === today || sorted[0] === yesterday) {
    currentStreak = 1;
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = (prev.getTime() - curr.getTime()) / 86400000;

    if (diffDays === 1) {
      streak++;
      if (i === 1 || currentStreak > 0) currentStreak = streak;
    } else {
      streak = 1;
      if (currentStreak === 0) currentStreak = 0;
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  longestStreak = Math.max(longestStreak, streak);
  return { currentStreak, longestStreak };
}

export default db;
