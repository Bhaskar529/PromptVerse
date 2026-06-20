import fs from 'fs';
import path from 'path';
import { titleCaseSlug, slugify } from '@/lib/sections';

const PAGE_SIZE = 20;
const ROOT = path.join(process.cwd(), 'content');
const SECTION_MAP = {
  image: 'image-prompts',
  video: 'video-prompts',
  audio: 'audio-prompts',
  chat: 'chat-prompts',
} as const;

type PromptRecord = {
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
  href: string;
};

type TagArchive = {
  slug: string;
  label: string;
  prompts: PromptRecord[];
};

let cache: TagArchive[] | null = null;

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function readJson(filePath: string) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function getAllPrompts(): PromptRecord[] {
  const prompts: PromptRecord[] = [];

  for (const [type, sectionSlug] of Object.entries(SECTION_MAP) as Array<[keyof typeof SECTION_MAP, string]>) {
    const dir = path.join(ROOT, type);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      const subcategorySlug = file.replace(/\.json$/i, '');
      const subcategoryLabel = titleCaseSlug(subcategorySlug);
      const json = readJson(path.join(dir, file));
      const entries = Array.isArray(json) ? json : [];

      for (const item of entries) {
        if (!item || typeof item !== 'object') continue;
        const slug = slugify(safeString((item as Record<string, unknown>).slug || (item as Record<string, unknown>).title));
        if (!slug) continue;
        prompts.push({
          id: safeString((item as Record<string, unknown>).id, `${type}-${subcategorySlug}-${slug}`),
          slug,
          title: safeString((item as Record<string, unknown>).title, titleCaseSlug(slug)),
          description: safeString((item as Record<string, unknown>).description),
          category: safeString((item as Record<string, unknown>).category, titleCaseSlug(type)),
          subcategory: safeString((item as Record<string, unknown>).subcategory, subcategoryLabel),
          tags: safeArray((item as Record<string, unknown>).tags),
          tools: safeArray((item as Record<string, unknown>).tools),
          difficulty: safeString((item as Record<string, unknown>).difficulty, 'Intermediate'),
          template: safeString((item as Record<string, unknown>).template),
          examplePrompt: safeString((item as Record<string, unknown>).examplePrompt),
          href: `/${sectionSlug}/${slug}`,
        });
      }
    }
  }

  return prompts;
}

function getArchives() {
  if (cache) return cache;

  const map = new Map<string, TagArchive>();
  for (const prompt of getAllPrompts()) {
    for (const rawTag of prompt.tags) {
      const label = safeString(rawTag).trim();
      if (!label) continue;
      const slug = slugify(label);
      if (!slug) continue;
      const existing = map.get(slug) || { slug, label, prompts: [] };
      existing.prompts.push(prompt);
      map.set(slug, existing);
    }
  }

  cache = Array.from(map.values())
    .map((archive) => ({
      ...archive,
      prompts: archive.prompts.sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return cache;
}

export function getTagIndex() {
  return getArchives().map((archive) => ({
    slug: archive.slug,
    label: archive.label,
    total: archive.prompts.length,
    totalPages: Math.max(1, Math.ceil(archive.prompts.length / PAGE_SIZE)),
  }));
}

export function getTagArchivePage(tagSlug: string, currentPage = 1) {
  const archive = getArchives().find((entry) => entry.slug === tagSlug);
  if (!archive) return null;
  const total = archive.prompts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  return {
    slug: archive.slug,
    label: archive.label,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages,
    prompts: archive.prompts.slice(start, end),
  };
}
