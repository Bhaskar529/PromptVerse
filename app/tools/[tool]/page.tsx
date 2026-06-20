import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { PaginationNav } from '@/components/PaginationNav';
import { PromptCard } from '@/components/PromptCard';
import { buildBreadcrumbJsonLd, buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { getToolArchiveIndex, getToolArchivePage } from '@/lib/content';

export const dynamicParams = false;

type Props = { params: Promise<{ tool: string }> };

export function generateStaticParams() {
  return getToolArchiveIndex().map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { tool } = await params;
  const page = getToolArchivePage(tool, 1);
  if (!page) return {};
  return buildMetadata({
    title: `${page.label} Prompts`,
    description: `Browse page 1 of ${page.totalPages} for ${page.label} prompts on PromptVerse.`,
    path: `/tools/${page.slug}`,
    keywords: [page.label, `${page.label} prompts`, 'AI prompts'],
  });
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;
  const page = getToolArchivePage(tool, 1);
  if (!page) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <JsonLd data={buildCollectionJsonLd({ title: `${page.label} Prompts`, description: `Prompt pages compatible with ${page.label}.`, path: `/tools/${page.slug}` })} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools/chatgpt' },
        { name: page.label, path: `/tools/${page.slug}` },
      ])} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Browse', href: '/image-prompts' },
        { label: page.label, href: `/tools/${page.slug}` },
      ]} />

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-verse sm:p-10">
        <p className="verse-kicker text-xs uppercase">Tool library</p>
        <h1 className="verse-heading mt-4 font-display text-5xl tracking-[-0.05em] sm:text-6xl">{page.label}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-verse-muted sm:text-lg">
          Page 1 of {page.totalPages}. A new page loads only when requested, so the archive stays fast as the dataset grows.
        </p>
      </div>

      <div className="mt-12 grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px,100%), 1fr))' }}>
        {page.prompts.map((prompt) => <PromptCard key={prompt.id || prompt.slug} prompt={prompt} />)}
      </div>

      <PaginationNav basePath={`/tools/${page.slug}`} currentPage={page.page} totalPages={page.totalPages} />
    </section>
  );
}
