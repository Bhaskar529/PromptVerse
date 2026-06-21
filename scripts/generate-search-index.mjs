
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const outFile = path.join(root, 'public', 'search-index.json');

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCase(value = '') {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\w/g, (m) => m.toUpperCase())
    .trim();
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function walk(dir) {
  const output = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) output.push(...walk(full));
    else if (item.isFile() && item.name.endsWith('.json') && item.name !== 'marketplace-brief.json') output.push(full);
  }
  return output;
}

const files = walk(contentDir);
const entries = [];

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rel = path.relative(contentDir, file).split(path.sep);
  const category = rel[0];
  const bundleSlug = path.basename(file, '.json');
  const bundleTitle = titleCase(bundleSlug);
  const prompts = Array.isArray(raw) ? raw : Array.isArray(raw.prompts) ? raw.prompts : [];
  const bundleTags = !Array.isArray(raw) ? safeArray(raw.tags) : [];
  const bundleTools = !Array.isArray(raw) ? safeArray(raw.tools) : [];
  const bundleSubcategory = !Array.isArray(raw) ? (raw.subcategory || raw.title || bundleTitle) : bundleTitle;

  for (const prompt of prompts) {
    if (!prompt || typeof prompt !== 'object') continue;
    const title = prompt.title || titleCase(prompt.slug || prompt.id || 'untitled-prompt');
    const slug = String(prompt.slug || prompt.id || slugify(title));
    const subcategory = String(prompt.subcategory || bundleSubcategory || bundleTitle);
    const subcategorySlug = slugify(subcategory) || bundleSlug;
    const href = `/${category}-prompts/${slug}`;
    const description = String(prompt.description || '').slice(0, 220);
    const template = String(prompt.template || prompt.promptTemplate || '').slice(0, 240);
    const example = String(prompt.example || prompt.examplePrompt || '').slice(0, 240);
    const tags = safeArray(prompt.tags).concat(bundleTags).filter(Boolean).slice(0, 12);
    const tools = safeArray(prompt.tools).concat(bundleTools).filter(Boolean).slice(0, 8);
    const joined = `${template} ${example} ${description}`;
    const referenceMatches = joined.match(/\[([A-Z_]+)\]/g) || [];
    const referenceTokens = Array.from(new Set(referenceMatches.map((token) => token.replace(/[\[\]]/g, ''))));

    entries.push({
      id: slug,
      href,
      slug,
      title,
      description,
      category,
      categoryLabel: `${titleCase(category)} Prompt`,
      sectionSlug: `${category}-prompts`,
      subcategory,
      subcategorySlug,
      tags: Array.from(new Set(tags)),
      tools: Array.from(new Set(tools)),
      template,
      example,
      referenceTokens,
      analytics: {
        searchBucket: category,
        popularityHint: Number(prompt.featured ? 30 : 0) + Number(tags.length) + Number(tools.length),
      },
    });
  }
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(entries, null, 2));
console.log(`Generated ${entries.length} search index entries at ${outFile}`);
