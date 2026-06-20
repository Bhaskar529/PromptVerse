import type { MetadataRoute } from 'next';
import { getAllPromptPaths, getAllSubcategoryPaths } from '@/lib/content';
import { getTagIndex } from '@/lib/tagArchive';
import { siteUrl } from '@/lib/site';
import { SECTIONS } from '@/lib/sections';

export default function sitemap(): MetadataRoute.Sitemap {
  const core = [
    '',
    '/search',
    ...SECTIONS.map((section) => `/${section.slug}`),
    ...getAllSubcategoryPaths().map((entry) => `/${entry.sectionSlug}/${entry.slug}`),
    ...getAllPromptPaths().map((entry) => `/${entry.sectionSlug}/${entry.slug}`),
  ];

  const tagRoutes = getTagIndex().flatMap((tag) => {
    const pages = [`/tags/${tag.slug}`];
    for (let page = 2; page <= tag.totalPages; page += 1) pages.push(`/tags/${tag.slug}/page/${page}`);
    return pages;
  });

  return [...core, ...tagRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
