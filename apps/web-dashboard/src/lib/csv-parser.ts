import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import type { Problem } from '@shared/types/problem';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');

const cache = new Map<string, Problem[]>();

export function parseProblemsCsv(filePath: string, companyTag?: string): Problem[] {
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(DATA_DIR, filePath);
  const cacheKey = companyTag ? `${resolvedPath}::${companyTag}` : resolvedPath;

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  if (!fs.existsSync(resolvedPath)) return [];

  const content = fs.readFileSync(resolvedPath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Array<Record<string, string>>;

  if (records.length === 0) return [];

  const firstRow = records[0];
  const hasCompanyFormat = 'ID' in firstRow && 'URL' in firstRow;

  const problems: Problem[] = records.map((row) => {
    if (hasCompanyFormat) {
      const freq = row['Frequency %'] ? parseFloat(row['Frequency %'].replace('%', '')) : undefined;
      const companyName = companyTag ? companyTag.charAt(0).toUpperCase() + companyTag.slice(1) : '';
      return {
        id: parseInt(row['ID'], 10),
        title: row['Title'],
        difficulty: row['Difficulty'] as Problem['difficulty'],
        topics: [],
        companies: companyName ? [companyName] : [],
        status: 'unsolved' as const,
        url: row['URL'] || `https://leetcode.com/problems/${slugify(row['Title'])}/`,
        frequency: freq ? Math.round(freq) : undefined,
      };
    }

    return {
      id: parseInt(row.problem_id, 10),
      title: row.title,
      difficulty: row.difficulty as Problem['difficulty'],
      topics: row.topics ? row.topics.split(';').map((t) => t.trim()) : [],
      companies: row.companies ? row.companies.split(';').map((c) => c.trim()) : [],
      status: 'unsolved' as const,
      url: row.url || `https://leetcode.com/problems/${slugify(row.title)}/`,
      frequency: row.frequency ? parseInt(row.frequency, 10) : undefined,
    };
  });

  cache.set(cacheKey, problems);
  return problems;
}

export interface CompanyCategory {
  company: string;
  category: string;
  filePath: string;
}

export function getCompanyCategories(): CompanyCategory[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const results: CompanyCategory[] = [];
  const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const companyDir = path.join(DATA_DIR, entry.name);
      const csvFiles = fs.readdirSync(companyDir).filter((f) => f.endsWith('.csv'));
      for (const file of csvFiles) {
        results.push({
          company: entry.name,
          category: file.replace('.csv', ''),
          filePath: path.join(companyDir, file),
        });
      }
    }
  }

  return results;
}

export function getAllCsvProblems(): Problem[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const seen = new Set<number>();
  const all: Problem[] = [];

  const topLevelFiles = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.csv'));

  for (const file of topLevelFiles) {
    for (const problem of parseProblemsCsv(path.join(DATA_DIR, file.name))) {
      if (!seen.has(problem.id)) {
        seen.add(problem.id);
        all.push(problem);
      }
    }
  }

  for (const { company, filePath } of getCompanyCategories()) {
    for (const problem of parseProblemsCsv(filePath, company)) {
      if (!seen.has(problem.id)) {
        seen.add(problem.id);
        all.push(problem);
      } else {
        const existing = all.find((p) => p.id === problem.id);
        if (existing && problem.companies.length > 0) {
          const companyName = problem.companies[0];
          if (!existing.companies.includes(companyName)) {
            existing.companies.push(companyName);
          }
        }
      }
    }
  }

  return all;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
