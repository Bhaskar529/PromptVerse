import type { PromptRecord, SearchManifestSection } from '@/lib/types';

export type SearchIndexRecord = PromptRecord & {
  normalizedTitle: string;
  normalizedDescription: string;
  normalizedCategory: string;
  normalizedSubcategory: string;
  normalizedTags: string[];
  normalizedTools: string[];
  normalizedTemplate: string;
  normalizedExample: string;
  normalizedSearchText: string;
};

export type SearchFilters = {
  query: string;
  sectionSlug?: string;
  tag?: string;
  tool?: string;
  subcategorySlug?: string;
};

export function normalizeText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_/]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value: unknown): string[] {
  return normalizeText(value).split(' ').filter(Boolean);
}

export function createSearchIndex(prompts: PromptRecord[]): SearchIndexRecord[] {
  return prompts.map((prompt) => {
    const normalizedTitle = normalizeText(prompt.title);
    const normalizedDescription = normalizeText(prompt.description);
    const normalizedCategory = normalizeText(prompt.category);
    const normalizedSubcategory = normalizeText(prompt.subcategory);
    const normalizedTags = (prompt.tags || []).map(normalizeText).filter(Boolean);
    const normalizedTools = (prompt.tools || []).map(normalizeText).filter(Boolean);
    const normalizedTemplate = normalizeText(prompt.template);
    const normalizedExample = normalizeText(prompt.examplePrompt);
    const normalizedSearchText = [
      normalizedTitle,
      normalizedDescription,
      normalizedCategory,
      normalizedSubcategory,
      normalizedTags.join(' '),
      normalizedTools.join(' '),
      normalizedTemplate,
      normalizedExample,
    ].join(' ').trim();

    return {
      ...prompt,
      normalizedTitle,
      normalizedDescription,
      normalizedCategory,
      normalizedSubcategory,
      normalizedTags,
      normalizedTools,
      normalizedTemplate,
      normalizedExample,
      normalizedSearchText,
    };
  });
}

function looseIncludes(needle: string, haystack: string): boolean {
  if (!needle || !haystack) return false;
  if (haystack.includes(needle)) return true;
  if (needle.length >= 4 && haystack.includes(needle.slice(0, needle.length - 1))) return true;
  if (needle.length >= 5 && haystack.includes(needle.slice(0, needle.length - 2))) return true;
  return false;
}

function scoreToken(token: string, row: SearchIndexRecord): number {
  const fields = [
    { text: row.normalizedTitle, weight: 18 },
    { text: row.normalizedSubcategory, weight: 12 },
    { text: row.normalizedCategory, weight: 10 },
    { text: row.normalizedDescription, weight: 7 },
    { text: row.normalizedTags.join(' '), weight: 14 },
    { text: row.normalizedTools.join(' '), weight: 11 },
    { text: row.normalizedTemplate, weight: 5 },
    { text: row.normalizedExample, weight: 4 },
    { text: row.normalizedSearchText, weight: 3 },
  ];

  let score = 0;
  for (const field of fields) {
    if (!field.text) continue;
    if (field.text === token) score = Math.max(score, field.weight * 9);
    else if (field.text.startsWith(token)) score = Math.max(score, field.weight * 7);
    else if (field.text.split(' ').some((part) => part.startsWith(token))) score = Math.max(score, field.weight * 6);
    else if (looseIncludes(token, field.text)) score = Math.max(score, field.weight * 4);
  }

  return score;
}

export function scorePrompt(row: SearchIndexRecord, filters: SearchFilters): number {
  const queryTokens = tokenize(filters.query);
  let score = 0;

  if (filters.sectionSlug && filters.sectionSlug !== 'all') {
    if (row.sectionSlug !== filters.sectionSlug) return -1;
    score += 8;
  }

  if (filters.subcategorySlug && filters.subcategorySlug !== 'all') {
    if (row.subcategorySlug !== filters.subcategorySlug) return -1;
    score += 10;
  }

  if (filters.tag && filters.tag !== 'all') {
    const tagNeedle = normalizeText(filters.tag);
    const matches = row.normalizedTags.some((tag) => looseIncludes(tagNeedle, tag) || looseIncludes(tag, tagNeedle));
    if (!matches) return -1;
    score += 14;
  }

  if (filters.tool && filters.tool !== 'all') {
    const toolNeedle = normalizeText(filters.tool);
    const matches = row.normalizedTools.some((tool) => looseIncludes(toolNeedle, tool) || looseIncludes(tool, toolNeedle));
    if (!matches) return -1;
    score += 12;
  }

  if (!queryTokens.length) return score + 1;

  let matchedTokens = 0;
  for (const token of queryTokens) {
    const tokenScore = scoreToken(token, row);
    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  if (!matchedTokens) return -1;
  if (matchedTokens === queryTokens.length) score += 18;
  else score += matchedTokens * 4;

  return score;
}

export function searchIndex(index: SearchIndexRecord[], filters: SearchFilters, limit = 24) {
  return index
    .map((row) => ({ row, score: scorePrompt(row, filters) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.row.title.localeCompare(b.row.title))
    .slice(0, limit)
    .map((item) => item.row);
}

export function buildFallbackSuggestions(index: SearchIndexRecord[], sectionSlug?: string) {
  const scoped = sectionSlug && sectionSlug !== 'all'
    ? index.filter((row) => row.sectionSlug === sectionSlug)
    : index;

  const tagCounts = new Map<string, number>();
  const toolCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const row of scoped) {
    categoryCounts.set(row.subcategory, (categoryCounts.get(row.subcategory) || 0) + 1);
    for (const tag of row.tags) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    for (const tool of row.tools) toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);
  }

  const top = (map: Map<string, number>, kind: 'tag' | 'tool' | 'category') =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([label]) => ({ label, query: label, kind }));

  return {
    tags: top(tagCounts, 'tag'),
    tools: top(toolCounts, 'tool'),
    categories: top(categoryCounts, 'category'),
  };
}

export function flattenManifestTools(manifest: SearchManifestSection[]) {
  return [...new Set(manifest.flatMap((section) => section.subcategories.flatMap((sub) => sub.tools)))].sort((a, b) => a.localeCompare(b));
}

export function flattenManifestTags(manifest: SearchManifestSection[]) {
  return [...new Set(manifest.flatMap((section) => section.subcategories.flatMap((sub) => sub.tags)))].sort((a, b) => a.localeCompare(b));
}
