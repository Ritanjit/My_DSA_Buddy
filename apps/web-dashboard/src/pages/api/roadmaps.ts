import type { APIRoute } from 'astro';
import { parseProblemsCsv, getCompanyCategories } from '../../lib/csv-parser';
import { getSolvedProblems, getRoadmaps } from '../../lib/db';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = async () => {
  const dataDir = path.resolve(process.cwd(), 'public/data');
  const solvedIds = new Set(getSolvedProblems().map((p) => p.id));

  const companyRoadmaps: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    company: string;
    category: string;
    totalProblems: number;
    solvedCount: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  }> = [];

  const categories = getCompanyCategories();

  if (categories.length > 0) {
    for (const { company, category, filePath } of categories) {
      const problems = parseProblemsCsv(filePath, company);
      if (problems.length === 0) continue;

      const displayName = company.charAt(0).toUpperCase() + company.slice(1);
      const categoryLabel = category.replace(/-/g, ' ');
      const solved = problems.filter((p) => solvedIds.has(p.id)).length;

      companyRoadmaps.push({
        id: `company-${company}-${category}`,
        name: `${displayName} — ${categoryLabel}`,
        description: `${problems.length} problems asked at ${displayName} (${categoryLabel})`,
        type: 'company',
        company: displayName,
        category,
        totalProblems: problems.length,
        solvedCount: solved,
        easyCount: problems.filter((p) => p.difficulty === 'Easy').length,
        mediumCount: problems.filter((p) => p.difficulty === 'Medium').length,
        hardCount: problems.filter((p) => p.difficulty === 'Hard').length,
      });
    }
  }

  const nestedCompanies = new Set(categories.map(({ company }) => company));

  if (fs.existsSync(dataDir)) {
    const topLevelCsvs = fs.readdirSync(dataDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.csv'));

    for (const entry of topLevelCsvs) {
      const company = entry.name.replace('.csv', '');
      if (nestedCompanies.has(company)) continue;

      const name = company.charAt(0).toUpperCase() + company.slice(1);
      const problems = parseProblemsCsv(path.join(dataDir, entry.name), company);
      const solved = problems.filter((p) => solvedIds.has(p.id)).length;

      companyRoadmaps.push({
        id: `company-${company}`,
        name,
        description: `Top ${problems.length} problems frequently asked at ${name}`,
        type: 'company',
        company: name,
        category: 'all',
        totalProblems: problems.length,
        solvedCount: solved,
        easyCount: problems.filter((p) => p.difficulty === 'Easy').length,
        mediumCount: problems.filter((p) => p.difficulty === 'Medium').length,
        hardCount: problems.filter((p) => p.difficulty === 'Hard').length,
      });
    }
  }

  const customRoadmaps = getRoadmaps().map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    type: r.type,
    company: r.company || '',
    category: '',
    totalProblems: r.problemIds.length,
    solvedCount: r.problemIds.filter((id) => solvedIds.has(id)).length,
    easyCount: 0,
    mediumCount: 0,
    hardCount: 0,
  }));

  return new Response(JSON.stringify([...companyRoadmaps, ...customRoadmaps]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
