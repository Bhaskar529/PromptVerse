import fs from 'fs';
import path from 'path';

interface PromptRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  tools: string[];
  difficulty: string;
  template: string;
  examplePrompt: string;
}

const ROOT = path.join(process.cwd(), 'content');
const IMAGE_TARGETS: Record<string, number> = {
  'realistic-photography': 0.40,
  'commercial-advertising': 0.20,
  portraits: 0.10,
  travel: 0.10,
  'product-photography': 0.10,
  architecture: 0.05,
  nature: 0.03,
  fantasy: 0.01,
  anime: 0.01,
};
const REFERENCE_KEYS = [
  '[USER_PHOTO]',
  '[FACE_REFERENCE]',
  '[PRODUCT_REFERENCE]',
  '[STYLE_REFERENCE]',
  '[POSE_REFERENCE]',
  '[COMPOSITION_REFERENCE]',
  '[CHARACTER_REFERENCE]',
  '[BRAND_REFERENCE]',
];
const OUTCOME_TAGS = [
  'linkedin', 'headshot', 'advertising', 'campaign', 'wedding', 'real-estate', 'poster', 'travel',
  'fitness', 'podcast', 'youtube', 'pitch-deck', 'cybersecurity', 'seo', 'code-review', 'e-commerce'
];
const INDUSTRIES = [
  'technology','healthcare','education','finance','travel','luxury-brands','restaurants','fitness','sports',
  'architecture','automotive','movies','music','photography','fashion','real-estate','artificial-intelligence',
  'cloud-computing','cybersecurity','programming','e-commerce','podcasting','youtube','content-creation',
  'history','science','space','nature','wildlife','psychology','self-improvement','legal','human-resources','startups','marketing'
];

function readJson(filePath: string): PromptRecord[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.prompts)) return json.prompts;
    return [];
  } catch {
    return [];
  }
}

function collectPromptFiles(rootDir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(rootDir)) return files;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) files.push(...collectPromptFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}

function classifyImage(prompt: PromptRecord, filePath: string): string {
  const hay = [prompt.category, prompt.subcategory, prompt.tags.join(' '), prompt.title, filePath].join(' ').toLowerCase();
  if (hay.includes('anime')) return 'anime';
  if (hay.includes('fantasy')) return 'fantasy';
  if (hay.includes('travel') || hay.includes('tourism')) return 'travel';
  if (hay.includes('architecture') || hay.includes('interior')) return 'architecture';
  if (hay.includes('nature') || hay.includes('wildlife') || hay.includes('landscape')) return 'nature';
  if (hay.includes('product')) return 'product-photography';
  if (hay.includes('portrait') || hay.includes('headshot')) return 'portraits';
  if (hay.includes('advertising') || hay.includes('campaign') || hay.includes('brand')) return 'commercial-advertising';
  return 'realistic-photography';
}

function normalizeStructure(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, '[slot]')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasReference(text: string): boolean {
  const hay = (text || '').toUpperCase();
  return REFERENCE_KEYS.some((k) => hay.includes(k));
}

function startsWithBannedPattern(text: string): boolean {
  const sample = (text || '').trim();
  return /^act as/i.test(sample)
    || /^create\s+\[[^\]]+\]\s+in\s+\[[^\]]+\]/i.test(sample)
    || /^generate\s+\[[^\]]+\]\s+with\s+\[[^\]]+\]/i.test(sample);
}

function main() {
  const files = collectPromptFiles(ROOT);
  const warnings: string[] = [];
  const errors: string[] = [];
  const structureMap = new Map<string, string[]>();
  const exampleMap = new Map<string, string[]>();
  const industryCounts: Record<string, number> = {};
  const imageCounts: Record<string, number> = {};
  let imageTotal = 0;
  let animeTotal = 0;
  let totalPrompts = 0;

  for (const filePath of files) {
    const prompts = readJson(filePath);
    const isImage = filePath.includes(`${path.sep}image${path.sep}`);

    for (const prompt of prompts) {
      totalPrompts += 1;
      const keyText = prompt.template || prompt.examplePrompt || prompt.description || prompt.title;
      const normalized = normalizeStructure(keyText);
      if (normalized) {
        structureMap.set(normalized, [...(structureMap.get(normalized) || []), prompt.slug || prompt.id || filePath]);
      }
      const exampleNormalized = normalizeStructure(prompt.examplePrompt || '');
      if (exampleNormalized) {
        exampleMap.set(exampleNormalized, [...(exampleMap.get(exampleNormalized) || []), prompt.slug || prompt.id || filePath]);
      }

      const tags = (prompt.tags || []).map((t) => t.toLowerCase());
      for (const industry of INDUSTRIES) {
        if (tags.includes(industry)) industryCounts[industry] = (industryCounts[industry] || 0) + 1;
      }

      if (!prompt.tools || !prompt.tools.length) {
        warnings.push(`Missing tools: ${prompt.slug} (${path.basename(filePath)})`);
      }
      if (!tags.some((t) => OUTCOME_TAGS.includes(t))) {
        warnings.push(`Missing clear use-case tag: ${prompt.slug} (${path.basename(filePath)})`);
      }
      if (startsWithBannedPattern(prompt.template || '')) {
        errors.push(`Banned low-quality template pattern: ${prompt.slug} (${path.basename(filePath)})`);
      }
      if ((hasReference(prompt.template || '') || hasReference(prompt.examplePrompt || '')) && !tags.some((t) => t.includes('reference'))) {
        warnings.push(`Reference workflow without reference tag: ${prompt.slug} (${path.basename(filePath)})`);
      }

      if (isImage) {
        imageTotal += 1;
        const bucket = classifyImage(prompt, filePath);
        imageCounts[bucket] = (imageCounts[bucket] || 0) + 1;
        if (bucket === 'anime') animeTotal += 1;
      }
    }
  }

  for (const [structure, slugs] of structureMap.entries()) {
    if (structure.length > 40 && slugs.length > 2) {
      warnings.push(`Repeated prompt structure detected (${slugs.length} items): ${slugs.slice(0, 5).join(', ')}`);
    }
  }
  for (const [example, slugs] of exampleMap.entries()) {
    if (example.length > 40 && slugs.length > 1) {
      errors.push(`Duplicate examplePrompt detected: ${slugs.slice(0, 5).join(', ')}`);
    }
  }

  if (imageTotal > 0) {
    const animeShare = animeTotal / imageTotal;
    if (animeShare > 0.015) {
      errors.push(`Anime share too high: ${(animeShare * 100).toFixed(2)}% (max 1.00%).`);
    }
  }

  const dominantIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0];
  if (dominantIndustry && totalPrompts >= 20) {
    const share = dominantIndustry[1] / totalPrompts;
    if (share > 0.18) warnings.push(`Industry dominance warning: ${dominantIndustry[0]} at ${(share * 100).toFixed(1)}% of prompts.`);
  }

  console.log(`Scanned ${totalPrompts} prompts across ${files.length} files.`);
  if (imageTotal > 0) {
    console.log('Image distribution:');
    for (const [bucket, target] of Object.entries(IMAGE_TARGETS)) {
      const actual = (imageCounts[bucket] || 0) / imageTotal;
      console.log(` - ${bucket}: ${(actual * 100).toFixed(1)}% (target ${(target * 100).toFixed(1)}%)`);
    }
  }

  if (warnings.length) {
    console.warn('
Warnings:');
    for (const w of warnings.slice(0, 200)) console.warn(` - ${w}`);
  }
  if (errors.length) {
    console.error('
Errors:');
    for (const e of errors.slice(0, 200)) console.error(` - ${e}`);
    process.exit(1);
  }
}

main();
