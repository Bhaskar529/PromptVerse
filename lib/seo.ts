import type { Metadata } from 'next';
import type { PromptRecord } from '@/lib/types';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const image = absoluteUrl('/og/cover.svg');

  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: 'website',
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: SITE_TAGLINE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildCollectionJsonLd({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function buildPromptJsonLd(prompt: PromptRecord) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt.title,
    description: prompt.description,
    url: absoluteUrl(prompt.href),
    keywords: prompt.tags.join(', '),
    about: prompt.category,
    genre: prompt.subcategory,
    learningResourceType: 'AI Prompt',
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildPromptFaqJsonLd(prompt: PromptRecord) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How should I adapt the ${prompt.title} prompt?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Start with the template, preserve the task structure, then replace the subject, constraints, and style details with your exact use case.`,
        },
      },
      {
        '@type': 'Question',
        name: `Which tools work with ${prompt.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: prompt.tools.length
            ? `This prompt is compatible with ${prompt.tools.join(', ')}.`
            : 'This prompt works best with tools that support structured prompting and iterative refinement.',
        },
      },
      {
        '@type': 'Question',
        name: `What makes this prompt ${prompt.difficulty.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The difficulty reflects how much structure, context, and prompt tuning is typically required to get high-quality results.`,
        },
      },
    ],
  };
}
