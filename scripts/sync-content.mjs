import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'content');
const target = path.join(root, 'public', 'content');
const sections = ['image', 'video', 'audio', 'chat'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    ensureDir(dest);
    return;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

ensureDir(source);
ensureDir(target);
for (const section of sections) {
  copyRecursive(path.join(source, section), path.join(target, section));
}


function normalizeSearchText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function extractReferenceTokens(text) {
  const matches = String(text ?? '').match(/\[(USER_PHOTO|FACE_REFERENCE|PRODUCT_REFERENCE|STYLE_REFERENCE|POSE_REFERENCE|BRAND_REFERENCE|COMPOSITION_REFERENCE|ENVIRONMENT_REFERENCE)\]/g) || [];
  return [...new Set(matches.map((token) => token.replace(/[\[\]]/g, '')))].sort((a, b) => a.localeCompare(b));
}

function buildSearchIndexEntry(prompt) {
  return {
    id: prompt.slug,
    slug: prompt.slug,
    href: prompt.href,
    title: normalizeSearchText(prompt.title),
    description: normalizeSearchText(prompt.description),
    category: normalizeSearchText(prompt.category),
    categoryLabel: normalizeSearchText(prompt.categoryLabel || prompt.sectionTitle || prompt.category),
    sectionSlug: normalizeSearchText(prompt.sectionSlug),
    subcategory: normalizeSearchText(prompt.subcategory),
    subcategorySlug: normalizeSearchText(prompt.subcategorySlug),
    tags: Array.isArray(prompt.tags) ? prompt.tags.map(normalizeSearchText).filter(Boolean) : [],
    tools: Array.isArray(prompt.tools) ? prompt.tools.map(normalizeSearchText).filter(Boolean) : [],
    template: normalizeSearchText(prompt.template),
    example: normalizeSearchText(prompt.examplePrompt),
    referenceTokens: extractReferenceTokens(`${prompt.template || ''} ${prompt.examplePrompt || ''} ${prompt.description || ''}`),
  };
}

function writeSearchIndex(allPrompts) {
  const outDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(outDir, { recursive: true });
  const index = allPrompts.map(buildSearchIndexEntry);
  fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(index, null, 2));
  console.log(`Search index written: ${index.length} records`);
}

try { writeSearchIndex(allPrompts); } catch (error) { console.error(error); }
