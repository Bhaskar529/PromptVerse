import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, Sparkles, Tag, Wrench, BarChart3 } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { BackLink } from '@/components/BackLink';
import { PromptCard } from '@/components/PromptCard';
import { CopyButton } from '@/components/CopyButton';
import { PageSectionHero } from '@/components/PageSectionHero';
import { SectionIcon } from '@/components/SectionIcon';
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildMetadata,
  buildPromptJsonLd,
} from '@/lib/seo';
import {
  getAllPromptPaths,
  getAllSubcategoryPaths,
  getPromptPageData,
  getRelatedPrompts,
  getSubcategoryPageData,
} from '@/lib/content';
import { getSectionBySlug } from '@/lib/sections';


function getPromptTitleGradient(prompt: {
  title?: string;
  subcategory?: string;
  category?: string;
}) {
  const gradients: Array<{ match: string; gradient: string }> = [
    { match: 'photography', gradient: 'linear-gradient(135deg, #d7c8ff 0%, #b48cff 48%, #8f63ff 100%)' },
    { match: 'nature', gradient: 'linear-gradient(135deg, #7ee7a8 0%, #33d0a4 50%, #0ea5a4 100%)' },
    { match: 'travel', gradient: 'linear-gradient(135deg, #8ed0ff 0%, #4ab8ff 50%, #55f2ff 100%)' },
    { match: 'food', gradient: 'linear-gradient(135deg, #ffd36a 0%, #ffb347 48%, #ff8a3d 100%)' },
    { match: 'architecture', gradient: 'linear-gradient(135deg, #7ee7f8 0%, #42cfff 48%, #5a8cff 100%)' },
    { match: 'fashion', gradient: 'linear-gradient(135deg, #ffb1cb 0%, #ff7fb3 52%, #ff5fd2 100%)' },
    { match: 'product photography', gradient: 'linear-gradient(135deg, #ffe082 0%, #f7c654 48%, #ff9f43 100%)' },
    { match: 'automotive', gradient: 'linear-gradient(135deg, #79b6ff 0%, #4098ff 52%, #2b6fff 100%)' },
    { match: 'anime', gradient: 'linear-gradient(135deg, #ff99d6 0%, #d779ff 50%, #9f6bff 100%)' },
    { match: 'fantasy', gradient: 'linear-gradient(135deg, #ff6bb5 0%, #d04bff 48%, #8b5cf6 100%)' },
    { match: 'marketing', gradient: 'linear-gradient(135deg, #ffb15b 0%, #ff9736 48%, #ffc14d 100%)' },
    { match: 'business', gradient: 'linear-gradient(135deg, #f4cf62 0%, #ffd84f 52%, #fff08a 100%)' },
    { match: 'coding', gradient: 'linear-gradient(135deg, #7db7ff 0%, #4d95ff 48%, #5b5fff 100%)' },
    { match: 'ai', gradient: 'linear-gradient(135deg, #7f5cff 0%, #9b6dff 48%, #d3b8ff 100%)' },
    { match: 'music', gradient: 'linear-gradient(135deg, #ff9cb7 0%, #f18cff 48%, #d2b6ff 100%)' },
    { match: 'podcast', gradient: 'linear-gradient(135deg, #7be7d4 0%, #35d6c7 48%, #63d8ff 100%)' },
    { match: 'documentary', gradient: 'linear-gradient(135deg, #8b8dff 0%, #5f7cff 48%, #56b6ff 100%)' },
  ];

  const haystack = `${prompt.subcategory ?? ''} ${prompt.category ?? ''} ${prompt.title ?? ''}`.toLowerCase();
  return gradients.find(({ match }) => haystack.includes(match))?.gradient
    ?? 'linear-gradient(135deg, #d7c8ff 0%, #b79cff 52%, #8a63ff 100%)';
}

export const dynamicParams = false;

type Props = { params: Promise<{ typeSection: string; entrySlug: string }> };

export function generateStaticParams() {
  const seen = new Set<string>();
  const params: Array<{ typeSection: string; entrySlug: string }> = [];

  for (const entry of getAllSubcategoryPaths()) {
    const key = `${entry.sectionSlug}/${entry.slug}`;
    if (!seen.has(key)) { seen.add(key); params.push({ typeSection: entry.sectionSlug, entrySlug: entry.slug }); }
  }
  for (const entry of getAllPromptPaths()) {
    const key = `${entry.sectionSlug}/${entry.slug}`;
    if (!seen.has(key)) { seen.add(key); params.push({ typeSection: entry.sectionSlug, entrySlug: entry.slug }); }
  }
  return params;
}

export async function generateMetadata({ params }: Props) {
  const { typeSection, entrySlug } = await params;
  const section = getSectionBySlug(typeSection);
  if (!section) return {};

  const subcategory = getSubcategoryPageData(section.type, entrySlug);
  if (subcategory) {
    return buildMetadata({
      title: `${subcategory.subcategoryTitle} ${section.title}`,
      description: `${subcategory.promptCount} ${section.singular.toLowerCase()} pages in ${subcategory.subcategoryTitle}.`,
      path: `/${section.slug}/${subcategory.subcategorySlug}`,
      keywords: [subcategory.subcategoryTitle, section.title, `${subcategory.subcategoryTitle} prompts`],
    });
  }

  const prompt = getPromptPageData(section.type, entrySlug);
  if (prompt) {
    return buildMetadata({
      title: prompt.title,
      description: prompt.description || `${prompt.title} prompt template and example.`,
      path: prompt.href,
      keywords: [prompt.title, ...prompt.tags, ...prompt.tools],
    });
  }
  return {};
}

export default async function DynamicTypePage({ params }: Props) {
  const { typeSection, entrySlug } = await params;
  const section = getSectionBySlug(typeSection);
  if (!section) notFound();

  /* ── Subcategory listing page ── */
  const subcategory = getSubcategoryPageData(section.type, entrySlug);
  if (subcategory) {
    return (
      <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 lg:px-8">
        <BackLink href={`/${section.slug}`} label={`Back to ${section.title}`} className="mb-6" />
        <JsonLd data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: section.title, path: `/${section.slug}` },
          { name: subcategory.subcategoryTitle, path: `/${section.slug}/${subcategory.subcategorySlug}` },
        ])} />
        <JsonLd data={buildCollectionJsonLd({
          title: `${subcategory.subcategoryTitle} ${section.title}`,
          description: `${subcategory.promptCount} prompts in ${subcategory.subcategoryTitle}.`,
          path: `/${section.slug}/${subcategory.subcategorySlug}`,
        })} />
      <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: section.title, href: `/${section.slug}` },
          { label: subcategory.subcategoryTitle, href: `/${section.slug}/${subcategory.subcategorySlug}` },
        ]} />
        <PageSectionHero
          section={section}
          title={subcategory.subcategoryTitle}
          description={`Explore ${subcategory.promptCount} ${section.singular.toLowerCase()} pages, compatible tools, reusable templates, and related prompt variants in ${subcategory.subcategoryTitle}.`}
          stats={[
            { label: 'Prompt count', value: subcategory.promptCount },
            { label: 'Tools', value: subcategory.tools.length },
            { label: 'Tags', value: subcategory.tags.length },
          ]}
        />
        <div className="subcategory-prompts-grid mt-12 grid gap-6" style={{
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        }}>
          {subcategory.prompts.slice(0, 48).map((prompt, i) => (
            <PromptCard key={prompt.slug} prompt={prompt} />
          ))}
        </div>
        <p className="section-note mt-10">
          Showing the first 48 prompts for maximum speed. Browse the main category pages for broader discovery across the library.
        </p>
      </section>
    );
  }

  /* ── Individual prompt detail page ── */
  const prompt = getPromptPageData(section.type, entrySlug);
  if (!prompt) notFound();
  const related = getRelatedPrompts(prompt, 6);

  const hasTags  = Array.isArray(prompt.tags)  && prompt.tags.length  > 0;
  const hasTools = Array.isArray(prompt.tools) && prompt.tools.length > 0;
  const titleGradient = getPromptTitleGradient(prompt);

  return (
    <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6 lg:px-8">
      <JsonLd data={buildPromptJsonLd(prompt)} />
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: section.title, path: `/${section.slug}` },
        { name: prompt.subcategory, path: `/${section.slug}/${prompt.subcategorySlug}` },
        { name: prompt.title, path: prompt.href },
      ])} />
      <BackLink href={`/${section.slug}/${prompt.subcategorySlug}`} label={`Back to ${prompt.subcategory}`} className="mb-6" />
      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: section.title, href: `/${section.slug}` },
        { label: prompt.subcategory, href: `/${section.slug}/${prompt.subcategorySlug}` },
        { label: prompt.title, href: prompt.href },
      ]} />

      {/* ── Prompt article ── */}
      <article
        className="verse-fade-up rounded-[2rem] border p-8 sm:p-10"
        style={{
          borderColor: 'rgba(255,255,255,0.09)',
          background: 'linear-gradient(170deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.022) 100%)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Eyebrow + icon */}
        <div className="flex items-center gap-3">
          <SectionIcon slug={section.slug} size={26} />
          <p className="verse-kicker">{section.singular}</p>
        </div>

        {/* Title */}
        <h1
          className="verse-heading mt-5 font-display tracking-tight"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            lineHeight: 1.12,
            backgroundImage: titleGradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 10px 26px rgba(123, 120, 255, 0.12)',
          }}
        >
          {prompt.title}
        </h1>
        <p className="mt-4 max-w-3xl leading-8" style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: 'var(--color-muted)' }}>
          {prompt.description}
        </p>

        {/* Metadata pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {prompt.difficulty && (
            <span style={{
              background: 'rgba(183,156,255,0.12)',
              color: '#d8ccff',
              border: '1px solid rgba(183,156,255,0.22)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              <BarChart3 size={12} style={{ display:'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} aria-hidden="true" />
              {prompt.difficulty}
            </span>
          )}
          {prompt.subcategory && (
            <span style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 600,
            }}>
              {prompt.subcategory}
            </span>
          )}
        </div>

        <div className="mt-8 rounded-[1.4rem] border p-5 sm:p-6" style={{ borderColor: 'rgba(183,156,255,0.16)', background: 'rgba(183,156,255,0.055)' }}>
          <p className="panel-label panel-label--template mb-3">
            <Sparkles size={13} aria-hidden="true" /> Prompt structure
          </p>
          <p style={{ color: 'rgba(255,255,255,0.76)', lineHeight: 1.75 }}>
            Every PromptVerse prompt is now normalized to follow a structured framework: role, purpose, audience, context, length, specific requirements, keywords/tools, and tone.
          </p>
        </div>

        {/* Tags */}
        {hasTags && (
          <div className="mt-5">
            <p className="panel-label panel-label--template mb-2.5">
              <Tag size={13} aria-hidden="true" /> Tags
            </p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Tags">
              {prompt.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  role="listitem"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.75)',
                    padding: '0.22rem 0.7rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    transition: 'background 200ms, color 200ms',
                  }}
                  className="hover:bg-white/10 hover:text-white"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tools */}
        {hasTools && (
          <div className="mt-5">
            <p className="panel-label panel-label--template mb-2.5">
              <Wrench size={13} aria-hidden="true" /> Compatible tools
            </p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Compatible tools">
              {prompt.tools.map((tool: string) => (
                <Link
                  key={tool}
                  href={`/tools/${tool}`}
                  role="listitem"
                  style={{
                    background: 'rgba(183,156,255,0.1)',
                    border: '1px solid rgba(183,156,255,0.2)',
                    color: '#d8ccff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    transition: 'background 200ms, color 200ms',
                  }}
                  className="hover:bg-[rgba(183,156,255,0.18)] hover:text-white"
                >
                  {tool}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Template panel ── */}
        <div className="mt-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <p className="panel-label panel-label--template">
              <FileText size={13} aria-hidden="true" /> Template
            </p>
            <CopyButton value={prompt.template ?? ''} label="Copy Template" variant="default" />
          </div>
          <pre className="template-panel prompt-code-block" aria-label="Prompt template">
            {prompt.template || 'Template content will appear once the JSON bundle is populated.'}
          </pre>
        </div>

        {/* ── Example panel ── */}
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <p className="panel-label panel-label--example example-panel-header">
              <Sparkles size={13} aria-hidden="true" /> Example
            </p>
            <CopyButton value={prompt.examplePrompt ?? ''} label="Copy Example" variant="example" />
          </div>
          <pre className="example-panel prompt-code-block prompt-code-block--example" aria-label="Example prompt">
            {prompt.examplePrompt || 'Example prompt content will appear once the JSON bundle is populated.'}
          </pre>
        </div>
      </article>

      {/* ── Related prompts ── */}
      {related.length > 0 && (
        <div className="mt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="verse-kicker">Related prompts</p>
              <h2
                className="verse-heading-soft mt-3 font-display tracking-tight"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}
              >
                Keep the session moving
              </h2>
            </div>
            <Link
              href={`/${section.slug}/${prompt.subcategorySlug}`}
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.6rem 1.2rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                transition: 'background 200ms',
              }}
              className="hover:bg-white/[0.08]"
            >
              Back to {prompt.subcategory}
            </Link>
          </div>
          <div className="related-prompts-grid grid gap-6" style={{
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          }}>
            {related.map((item) => (
              <PromptCard key={item.slug} prompt={item} />
            ))}
          </div>
        </div>
      )}
      <div className="mt-10 flex justify-center">
        <BackLink href={`/${section.slug}`} label={`Back to ${section.title}`} />
      </div>
    </section>
  );
}
