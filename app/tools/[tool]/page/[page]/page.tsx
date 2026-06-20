import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { PaginationNav } from '@/components/PaginationNav';
import { PromptCard } from '@/components/PromptCard';
import { buildBreadcrumbJsonLd, buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { getToolArchiveIndex, getToolArchivePage } from '@/lib/content';

export const dynamicParams = false;

type Props = { params: Promise<{ tool: string; page: string }> };

export function generateStaticParams() {
  const out: Array<{ tool: string; page: string }> = [];
  for (const tool of getToolArchiveIndex()) {
    const totalPages = Math.max(1, Math.ceil(tool.prompts.length / 18));
    for (let page = 2; page <= totalPages; page++) out.push({ tool: tool.slug, page: String(page) });
  }
  return out;
}

export async function generateMetadata({ params }: Props) {
  const { tool, page: rawPage } = await params;
  const pageNumber = Number.parseInt(rawPage, 10);
  const archive = getToolArchivePage(tool, Number.isFinite(pageNumber) ? pageNumber : 1);
  if (!archive) return {};
  return buildMetadata({
    title: `${archive.label} Prompts - Page ${archive.page}`,
    description: `Browse page ${archive.page} of ${archive.totalPages} for ${archive.label} prompts on PromptVerse.`,
    path: `/tools/${archive.slug}/page/${archive.page}`,
    keywords: [archive.label, `${archive.label} prompts`, `page ${archive.page}`],
  });
}

export default async function ToolArchivePage({ params }: Props) {
  const { tool, page: rawPage } = await params;
  const pageNumber = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(pageNumber) || pageNumber < 2) notFound();
  const archive = getToolArchivePage(tool, pageNumber);
  if (!archive || archive.page !== pageNumber) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <JsonLd data={buildCollectionJsonLd({ title: `${archive.label} Prompts`, description: `Prompt pages compatible with ${archive.label}.`, path: `/tools/${archive.slug}/page/${archive.page}` })} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools/chatgpt' },
        { name: archive.label, path: `/tools/${archive.slug}` },
        { name: `Page ${archive.page}`, path: `/tools/${archive.slug}/page/${archive.page}` },
      ])} />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Browse', href: '/image-prompts' },
        { label: archive.label, href: `/tools/${archive.slug}` },
        { label: `Page ${archive.page}`, href: `/tools/${archive.slug}/page/${archive.page}` },
      ]} />

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-verse sm:p-10">
        <p className="verse-kicker text-xs uppercase">Tool library</p>
        <h1 className="verse-heading mt-4 font-display text-5xl tracking-[-0.05em] sm:text-6xl">{archive.label}</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-verse-muted sm:text-lg">
          Page {archive.page} of {archive.totalPages}. A new page loads only when requested, so the archive stays fast as the dataset grows.
        </p>
      </div>

      <div className="mt-12 grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px,100%), 1fr))' }}>
        {archive.prompts.map((prompt) => <PromptCard key={prompt.id || prompt.slug} prompt={prompt} />)}
      </div>

      <PaginationNav basePath={`/tools/${archive.slug}`} currentPage={archive.page} totalPages={archive.totalPages} />
    </section>
  );
}
