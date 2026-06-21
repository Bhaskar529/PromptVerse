import fs from 'node:fs';
import path from 'node:path';
import { getSectionBySlug, getSectionByType, SECTIONS, slugify, titleCaseSlug, type PromptType } from '@/lib/sections';
import type { PromptBundle, PromptRecord, SearchManifestSection, StructuredSearchParams, StructuredSearchResult } from '@/lib/types';

const CONTENT_ROOT = path.join(process.cwd(), 'content');

type TypeCache = {
  type: PromptType;
  bundles: PromptBundle[];
  prompts: PromptRecord[];
  promptMap: Map<string, PromptRecord>;
};

type LibraryCache = {
  byType: Record<PromptType, TypeCache>;
  allPrompts: PromptRecord[];
};

let cache: LibraryCache | null = null;

function fileExists(filePath: string) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function toSentence(value: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

function titleFromSlug(slug: string) {
  return titleCaseSlug(slug).replace(/Ai/g, 'AI');
}

function normalizeList(values: string[]) {
  return unique(values.map((value) => String(value).trim()).filter(Boolean));
}

function inferAudience(subcategory: string, tags: string[]) {
  const combined = `${subcategory} ${tags.join(' ')}`.toLowerCase();
  if (combined.includes('marketing') || combined.includes('business')) return 'marketing teams and business decision-makers';
  if (combined.includes('coding') || combined.includes('developer')) return 'developers and technical teams';
  if (combined.includes('music') || combined.includes('audio')) return 'creators, composers, and audio producers';
  if (combined.includes('photography') || combined.includes('portrait') || combined.includes('anime') || combined.includes('image')) return 'designers, visual artists, and prompt-driven creators';
  if (combined.includes('video') || combined.includes('commercial') || combined.includes('documentary')) return 'creative teams, filmmakers, and editors';
  return 'creators who want polished, production-ready results';
}

function inferRole(type: PromptType, tools: string[], tags: string[]) {
  const combined = `${type} ${tools.join(' ')} ${tags.join(' ')}`.toLowerCase();
  if (type === 'chat') return 'You are an expert strategist, researcher, and execution-focused assistant';
  if (type === 'image') return 'You are a world-class visual director and prompt engineer for image generation';
  if (type === 'video') return 'You are a cinematic director and video prompt engineer';
  if (type === 'audio') return 'You are an elite music, sound, and audio prompt engineer';
  if (combined.includes('seo')) return 'You are an SEO strategist and conversion-focused content expert';
  return 'You are an expert prompt engineer focused on clarity, quality, and usable outputs';
}

function inferLength(type: PromptType) {
  if (type === 'video') return 'Keep the output structured for a 20 to 45 second video concept unless specified otherwise';
  if (type === 'audio') return 'Keep the output concise but detailed enough for a complete audio generation prompt';
  if (type === 'chat') return 'Use a concise but thorough response with clearly separated sections';
  return 'Keep the output detailed, specific, and generation-ready';
}

function buildStructuredPrompt(params: {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
  tools: string[];
  difficulty: string;
  source: string;
  type: PromptType;
  example?: boolean;
}) {
  const { title, description, category, subcategory, tags, tools, difficulty, source, type, example = false } = params;
  const cleanTags = normalizeList(tags);
  const cleanTools = normalizeList(tools);
  const purpose = example
    ? `Create a polished example output for ${title} in the ${subcategory} subcategory.`
    : `Generate a high-quality ${title} prompt for the ${subcategory} subcategory.`;
  const role = inferRole(type, cleanTools, cleanTags);
  const audience = inferAudience(subcategory, cleanTags);
  const contextBits = [description, source].map((value) => value.trim()).filter(Boolean);
  const context = contextBits.length > 0 ? contextBits.map(toSentence).join(' ') : `The prompt belongs to ${category} and should reflect best practices for ${subcategory}.`;
  const toolLine = cleanTools.length > 0 ? `Use conventions compatible with ${cleanTools.join(', ')}.` : 'Keep the prompt tool-agnostic and broadly usable.';
  const tagLine = cleanTags.length > 0 ? `Naturally incorporate these themes when relevant: ${cleanTags.join(', ')}.` : 'Use strong thematic specificity and visual or structural clarity.';
  const specifics = [
    'Include clear subject, environment, style, composition, and output intent.',
    type === 'chat' ? 'Request a structured response with headings, reasoning, and action-oriented output.' : 'Use concrete descriptive details instead of vague language.',
    type === 'audio' ? 'Specify mood, instrumentation, rhythm, pacing, and production texture.' : '',
    type === 'video' ? 'Specify scene flow, camera language, lighting, pacing, and cinematic tone.' : '',
    `Match a ${difficulty.toLowerCase()} difficulty level while staying easy to reuse.`,
  ].filter(Boolean);
  const tone = example
    ? 'Use a confident, polished, and example-ready tone.'
    : 'Use a precise, premium, production-ready tone.';

  return [
    role + '.',
    '',
    `Purpose: ${purpose}`,
    `Audience: ${audience}`,
    `Context: ${context}`,
    `Length: ${inferLength(type)}`,
    `Specific requirements: ${specifics.join(' ')}`,
    `Keywords and tools: ${toolLine} ${tagLine}`,
    `Tone: ${tone}`,
  ].join('\n');
}

function normalizePromptFramework(prompt: Omit<PromptRecord, 'href'> & { href?: string }) {
  const title = prompt.title || titleFromSlug(prompt.slug);
  const description = prompt.description || `${title} for ${prompt.subcategory}.`;
  const template = String(prompt.template || '').trim();
  const examplePrompt = String(prompt.examplePrompt || '').trim();

  return {
    ...prompt,
    title,
    description,
    template: buildStructuredPrompt({
      title,
      description,
      category: prompt.category,
      subcategory: prompt.subcategory,
      tags: prompt.tags,
      tools: prompt.tools,
      difficulty: prompt.difficulty,
      source: template,
      type: prompt.type,
    }),
    examplePrompt: buildStructuredPrompt({
      title,
      description,
      category: prompt.category,
      subcategory: prompt.subcategory,
      tags: prompt.tags,
      tools: prompt.tools,
      difficulty: prompt.difficulty,
      source: examplePrompt || template,
      type: prompt.type,
      example: true,
    }),
  };
}

function loadJson(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function listJsonFiles(type: PromptType) {
  const directory = path.join(CONTENT_ROOT, type);
  if (!fileExists(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(directory, file));
}

function normalizePrompt(raw: Record<string, unknown>, type: PromptType, subcategorySlug: string): PromptRecord {
  const section = getSectionByType(type);
  const slug = String(raw.slug || raw.id || `${subcategorySlug}-${Math.random().toString(36).slice(2, 10)}`);
  const subcategory = String(raw.subcategory || titleCaseSlug(subcategorySlug));
  const difficulty = String(raw.difficulty || 'Intermediate');
  const tools = unique(ensureArray<string>(raw.tools).map((value) => String(value)));
  const tags = unique(ensureArray<string>(raw.tags).map((value) => String(value)));

  return normalizePromptFramework({
    id: String(raw.id || slug),
    slug,
    title: String(raw.title || titleCaseSlug(slug)),
    description: String(raw.description || ''),
    category: String(raw.category || section.title),
    subcategory,
    subcategorySlug,
    tags,
    tools,
    difficulty,
    template: String(raw.template || ''),
    examplePrompt: String(raw.examplePrompt || ''),
    type,
    sectionSlug: section.slug,
    href: `/${section.slug}/${slug}`,
  });
}

function loadBundle(filePath: string, type: PromptType): PromptBundle {
  const subcategorySlug = path.basename(filePath, '.json');
  const json = loadJson(filePath) as { prompts?: unknown } | unknown[];
  const entries = Array.isArray(json)
    ? json
    : Array.isArray((json as { prompts?: unknown[] }).prompts)
      ? (json as { prompts: unknown[] }).prompts
      : [];
  const prompts = entries
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((entry) => normalizePrompt(entry, type, subcategorySlug));
  const section = getSectionByType(type);

  return {
    type,
    sectionSlug: section.slug,
    subcategorySlug,
    subcategoryTitle: prompts[0]?.subcategory || titleCaseSlug(subcategorySlug),
    filePath,
    publicPath: `/content/${type}/${subcategorySlug}.json`,
    promptCount: prompts.length,
    prompts,
    tags: unique(prompts.flatMap((prompt) => prompt.tags)),
    tools: unique(prompts.flatMap((prompt) => prompt.tools)),
    difficulties: unique(prompts.map((prompt) => prompt.difficulty)),
  };
}

function buildLibrary(): LibraryCache {
  if (cache) return cache;

  const byType = Object.fromEntries(
    (['image', 'video', 'audio', 'chat'] as PromptType[]).map((type) => {
      const bundles = listJsonFiles(type)
        .map((filePath) => loadBundle(filePath, type))
        .sort((a, b) => a.subcategoryTitle.localeCompare(b.subcategoryTitle));
      const prompts = bundles.flatMap((bundle) => bundle.prompts);
      const promptMap = new Map(prompts.map((prompt) => [prompt.slug, prompt]));
      return [type, { type, bundles, prompts, promptMap }];
    }),
  ) as Record<PromptType, TypeCache>;

  cache = {
    byType,
    allPrompts: Object.values(byType).flatMap((entry) => entry.prompts),
  };

  return cache;
}

export function getLibraryOverview() {
  const library = buildLibrary();

  return SECTIONS.map((section) => {
    const typeData = library.byType[section.type];
    return {
      ...section,
      promptCount: typeData.prompts.length,
      subcategoryCount: typeData.bundles.length,
      featured: typeData.bundles.flatMap((bundle) => bundle.prompts.slice(0, 2)).slice(0, 6),
      subcategories: typeData.bundles.map((bundle) => ({
        slug: bundle.subcategorySlug,
        title: bundle.subcategoryTitle,
        count: bundle.promptCount,
        href: `/${section.slug}/${bundle.subcategorySlug}`,
      })),
    };
  });
}

export function getSearchManifest(): SearchManifestSection[] {
  const library = buildLibrary();

  return SECTIONS.map((section) => {
    const typeData = library.byType[section.type];
    return {
      slug: section.slug,
      type: section.type,
      title: section.title,
      accent: section.accent,
      description: section.description,
      subcategories: typeData.bundles.map((bundle) => ({
        slug: bundle.subcategorySlug,
        title: bundle.subcategoryTitle,
        count: bundle.promptCount,
        fetchPath: bundle.publicPath,
        tags: bundle.tags,
        tools: bundle.tools,
        difficulties: bundle.difficulties,
      })),
    };
  });
}

export function getTypePageData(type: PromptType) {
  return buildLibrary().byType[type];
}

export function getSubcategoryPageData(type: PromptType, subcategorySlug: string) {
  return buildLibrary().byType[type].bundles.find((bundle) => bundle.subcategorySlug === subcategorySlug) || null;
}

export function getPromptPageData(type: PromptType, slug: string) {
  return buildLibrary().byType[type].promptMap.get(slug) || null;
}

export function getRelatedPrompts(prompt: PromptRecord, limit = 6) {
  return buildLibrary()
    .byType[prompt.type]
    .prompts.filter((candidate) => {
      if (candidate.slug === prompt.slug) return false;
      if (candidate.subcategorySlug === prompt.subcategorySlug) return true;
      return candidate.tags.some((tag) => prompt.tags.includes(tag));
    })
    .slice(0, limit);
}

export function getFeaturedPrompts(limitPerType = 3) {
  return SECTIONS.flatMap((section) => buildLibrary().byType[section.type].prompts.slice(0, limitPerType));
}

export function getAllPromptPaths() {
  return buildLibrary().allPrompts.map((prompt) => ({
    sectionSlug: prompt.sectionSlug,
    slug: prompt.slug,
  }));
}

export function getAllSubcategoryPaths() {
  return SECTIONS.flatMap((section) =>
    buildLibrary().byType[section.type].bundles.map((bundle) => ({
      sectionSlug: section.slug,
      slug: bundle.subcategorySlug,
    })),
  );
}

export function getToolIndex() {
  const buckets = new Map<string, { slug: string; label: string; prompts: PromptRecord[] }>();
  for (const prompt of buildLibrary().allPrompts) {
    for (const tool of prompt.tools) {
      const slug = slugify(tool);
      if (!buckets.has(slug)) buckets.set(slug, { slug, label: tool, prompts: [] });
      buckets.get(slug)!.prompts.push(prompt);
    }
  }
  return [...buckets.values()].sort((a, b) => b.prompts.length - a.prompts.length || a.label.localeCompare(b.label));
}

export function getTagIndex() {
  const buckets = new Map<string, { slug: string; label: string; prompts: PromptRecord[] }>();
  for (const prompt of buildLibrary().allPrompts) {
    for (const tag of prompt.tags) {
      const slug = slugify(tag);
      if (!buckets.has(slug)) buckets.set(slug, { slug, label: tag, prompts: [] });
      buckets.get(slug)!.prompts.push(prompt);
    }
  }
  return [...buckets.values()].sort((a, b) => b.prompts.length - a.prompts.length || a.label.localeCompare(b.label));
}


export function getTagPageData(tagSlug: string) {
  return getTagIndex().find((tag) => tag.slug === tagSlug) || null;
}

export function getFooterCollections() {
  return {
    tools: getToolIndex().slice(0, 10),
    tags: getTagIndex().slice(0, 10),
  };
}

export const TOOL_PAGE_SIZE = 18;


export function getToolArchiveIndex() {
  const library = buildLibrary();
  const toolMap = new Map<string, { slug: string; label: string; prompts: PromptRecord[] }>();

  for (const prompt of library.allPrompts) {
    for (const rawTool of ensureArray<string>(prompt.tools)) {
      const tool = String(rawTool).trim();
      if (!tool) continue;
      const slug = slugify(tool);
      if (!slug) continue;
      const existing = toolMap.get(slug);
      if (existing) existing.prompts.push(prompt);
      else toolMap.set(slug, { slug, label: tool, prompts: [prompt] });
    }
  }

  return [...toolMap.values()]
    .map((entry) => ({ slug: entry.slug, label: entry.label, prompts: entry.prompts.sort((a, b) => a.title.localeCompare(b.title)) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getToolArchivePage(toolSlug: string, pageNumber = 1) {
  const tool = getToolArchiveIndex().find((entry) => entry.slug === toolSlug);
  if (!tool) return null;
  const totalPrompts = tool.prompts.length;
  const totalPages = Math.max(1, Math.ceil(totalPrompts / TOOL_PAGE_SIZE));
  const page = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (page - 1) * TOOL_PAGE_SIZE;
  return {
    slug: tool.slug,
    label: tool.label,
    prompts: tool.prompts.slice(start, start + TOOL_PAGE_SIZE),
    page,
    totalPages,
    totalPrompts,
  };
}

export function getToolPageData(toolSlug: string) {
  return getToolArchivePage(toolSlug, 1);
}


export const STRUCTURED_SEARCH_PAGE_SIZE = 20;

function normalizeSearchValue(value: string) {
  return String(value || '').trim();
}

export function getStructuredSearchOptions() {
  return SECTIONS.map((section) => {
    const typeData = buildLibrary().byType[section.type];
    return {
      value: section.slug,
      label: section.title,
      type: section.type,
      subcategories: typeData.bundles.map((bundle) => ({
        value: bundle.subcategorySlug,
        label: bundle.subcategoryTitle,
        count: bundle.promptCount,
      })),
    };
  });
}

export function runStructuredSearch(params: StructuredSearchParams, pageNumber = 1): StructuredSearchResult | null {
  const query = normalizeSearchValue(params.searchText);
  const category = normalizeSearchValue(params.category);
  const subcategory = normalizeSearchValue(params.subcategory);
  if (!query || !category || !subcategory) return null;

  const section = getSectionBySlug(category);
  if (!section) return null;

  const bundle = getSubcategoryPageData(section.type, subcategory);
  if (!bundle) return null;

  const Fuse = require('fuse.js');
  const fuse = new Fuse(bundle.prompts, {
    includeScore: true,
    threshold: 0.38,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.35 },
      { name: 'description', weight: 0.2 },
      { name: 'tags', weight: 0.12 },
      { name: 'tools', weight: 0.1 },
      { name: 'template', weight: 0.13 },
      { name: 'examplePrompt', weight: 0.1 },
    ],
  });

  const matches = fuse.search(query).map((entry: { item: PromptRecord }) => entry.item);
  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / STRUCTURED_SEARCH_PAGE_SIZE));
  const page = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (page - 1) * STRUCTURED_SEARCH_PAGE_SIZE;

  return {
    items: matches.slice(start, start + STRUCTURED_SEARCH_PAGE_SIZE),
    total,
    page,
    perPage: STRUCTURED_SEARCH_PAGE_SIZE,
    totalPages,
    categoryLabel: section.title,
    subcategoryLabel: bundle.subcategoryTitle,
    query,
  };
}

export function getStructuredSearchFallbacks(sectionSlug?: string) {
  const section = sectionSlug ? getSectionBySlug(sectionSlug) : null;
  const featured = getFeaturedPrompts(3).slice(0, 6);
  const categorySuggestions = getStructuredSearchOptions().map((item) => ({ value: item.value, label: item.label })).slice(0, 4);
  const subcategorySuggestions = section
    ? getStructuredSearchOptions().find((item) => item.value === section.slug)?.subcategories.slice(0, 6) || []
    : getStructuredSearchOptions().flatMap((item) => item.subcategories.slice(0, 2)).slice(0, 6);
  const popularSearches = getTagIndex().slice(0, 6).map((tag) => tag.label);

  return {
    categories: categorySuggestions,
    subcategories: subcategorySuggestions,
    popularSearches,
    trendingPrompts: featured,
  };
}
