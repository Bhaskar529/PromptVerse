import type { PromptType, SectionSlug } from '@/lib/sections';

export type PromptRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  subcategorySlug: string;
  tags: string[];
  tools: string[];
  difficulty: string;
  template: string;
  examplePrompt: string;
  type: PromptType;
  sectionSlug: SectionSlug;
  href: string;
};

export type PromptBundle = {
  type: PromptType;
  sectionSlug: SectionSlug;
  subcategorySlug: string;
  subcategoryTitle: string;
  filePath: string;
  publicPath: string;
  promptCount: number;
  prompts: PromptRecord[];
  tags: string[];
  tools: string[];
  difficulties: string[];
};

export type SearchManifestSection = {
  slug: SectionSlug;
  type: PromptType;
  title: string;
  accent: string;
  description: string;
  subcategories: Array<{
    slug: string;
    title: string;
    count: number;
    fetchPath: string;
    tags: string[];
    tools: string[];
    difficulties: string[];
  }>;
};


export type SearchIndexEntry = {
  id: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  sectionSlug: string;
  subcategory: string;
  subcategorySlug: string;
  tags: string[];
  tools: string[];
  template: string;
  example: string;
  referenceTokens: string[];
  searchableText?: string;
};


export type StructuredSearchParams = {
  searchText: string;
  category: SectionSlug;
  subcategory: string;
};

export type StructuredSearchResult = {
  items: PromptRecord[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  categoryLabel: string;
  subcategoryLabel: string;
  query: string;
};
