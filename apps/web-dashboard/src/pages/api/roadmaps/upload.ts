import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const VALID_CATEGORIES = ['all', 'six-months', 'thirty-days', 'three-months'];
const DATA_DIR = path.resolve(process.cwd(), 'public/data');

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const company = (formData.get('company') as string || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = (formData.get('category') as string || '').trim();

    if (!file || !company || !category) {
      return new Response(JSON.stringify({ error: 'Missing required fields: file, company, category' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const content = await file.text();
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return new Response(JSON.stringify({ error: 'CSV file must have a header row and at least one data row' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const header = lines[0].toLowerCase();
    const hasRequiredColumns = header.includes('id') && header.includes('title') && header.includes('difficulty');
    if (!hasRequiredColumns) {
      return new Response(JSON.stringify({ error: 'CSV must contain columns: ID, Title, Difficulty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const companyDir = path.join(DATA_DIR, company);
    const filePath = path.join(companyDir, `${category}.csv`);

    if (fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: `${company}/${category}.csv already exists. Delete it first to re-upload.` }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    fs.mkdirSync(companyDir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');

    return new Response(JSON.stringify({ success: true, path: `${company}/${category}.csv`, rows: lines.length - 1 }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
