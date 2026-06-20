import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { PaginationNav } from '@/components/PaginationNav';
import { PromptCard } from '@/components/PromptCard';
import { buildBreadcrumbJsonLd, buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { getTagArchivePage, getTagIndex } from '@/lib/tagArchive';

export const dynamicParams = false;

type Props = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getTagIndex().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  const page = getTagArchivePage(tag, 1);
  if (!page) return {};

  return buildMetadata({
    title: `${page.label} Prompts`,
    description: `Browse page 1 of ${page.totalPages} for ${page.label} prompts on PromptVerse.`,
    path: `/tags/${page.slug}`,
    keywords: [page.label, `${page.label} prompts`, 'AI prompt tag'],
  });
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const page = getTagArchivePage(tag, 1);
  if (!page) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <JsonLd data={buildCollectionJsonLd({ title: `${page.label} Prompts`, description: `Prompt pages tagged ${page.label}.`, path: `/tags/${page.slug}` })} />
      <JsonLd data={buildBreadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Browse', path: '/image-prompts' }, { name: page.label, path: `/tags/${page.slug}` }])} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Browse', href: '/image-prompts' }, { label: page.label, href: `/tags/${page.slug}` }]} />
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-verse sm:p-10">
        <p className="verse-kicker text-xs uppercase">Tag archive</p>
        <h1 className="verse-heading mt-4 font-display text-5xl tracking-[-0.05em] sm:text-6xl">{page.label}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-verse-muted">Showing {page.prompts.length} prompts per page, optimized for fast browsing and scalable indexing.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {page.prompts.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}
      </div>

      <PaginationNav basePath={`/tags/${page.slug}`} currentPage={page.page} totalPages={page.totalPages} />
    </section>
  );
}
