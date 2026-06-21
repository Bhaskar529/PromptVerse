import { PromptCard } from '@/components/PromptCard';
import { JsonLd } from '@/components/JsonLd';
import { CategoryCard } from '@/components/CategoryCard';
import { BrandLogo } from '@/components/BrandLogo';
import { StructuredSearchForm } from '@/components/StructuredSearchForm';
import { buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { getFeaturedPrompts, getLibraryOverview, getStructuredSearchOptions } from '@/lib/content';
import Link from 'next/link';

export const metadata = buildMetadata({
  title: 'PromptVerse',
  description: "The World's Largest AI Prompt Library for image, video, audio, and chat workflows.",
  path: '/',
  keywords: ['AI prompts', 'prompt library', 'image prompts', 'video prompts', 'audio prompts', 'chat prompts'],
});

export default function HomePage() {
  const overview = getLibraryOverview();
  const featured = getFeaturedPrompts(3);
  const totalPrompts = overview.reduce((sum, section) => sum + section.promptCount, 0);
  const searchOptions = getStructuredSearchOptions();

  return (
    <>
      <JsonLd data={buildCollectionJsonLd({ title: 'PromptVerse', description: "The World's Largest AI Prompt Library", path: '/' })} />

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <div className="home-hero verse-fade-up">
          <div className="home-hero__backdrop" aria-hidden="true" />
          <div className="home-hero__grid" aria-hidden="true" />

          <div className="home-hero__badge-row">
            <p className="verse-kicker">PromptVerse</p>
          </div>

          <div className="home-hero__center">
            <div className="home-hero__icon-wrap">
              <div className="home-hero__brandmark"><BrandLogo compact /></div>
            </div>

            <h1 className="home-hero__title home-hero__title--brand">PromptVerse</h1>
            <h2 className="home-hero__library-title">Prompt Library</h2>

            <p className="home-hero__description home-hero__description--centered">
              {totalPrompts}+ ready-to-use prompts for image, video, audio, chat, &amp; more — designed for elegant discovery and fast browsing.
            </p>
          </div>
        </div>
      </section>

      <section id="structured-search" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-4 sm:px-6 lg:px-8">
        <div className="structured-home-search-shell">
          <div className="structured-home-search-copy">
            <p className="verse-kicker">Structured Search</p>
            <h2>Search by keyword, category, and subcategory.</h2>
            <p>
              Discover prompts with precise filtering before you browse categories. The same shared search flow powers both this section and the search results experience.
            </p>
          </div>
          <StructuredSearchForm options={searchOptions} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-4">
          {overview.map((section) => <CategoryCard key={section.slug} section={section} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="verse-kicker text-xs uppercase">Featured prompts</p>
            <h2 className="verse-heading-soft mt-3 font-display text-4xl tracking-[-0.04em]">High-intent landing pages built for discovery</h2>
          </div>
          <Link href="/image-prompts" className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/[0.08]">
            Explore categories
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.length ? featured.map((prompt) => <PromptCard key={prompt.slug} prompt={prompt} />) : (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-verse-muted md:col-span-2 xl:col-span-3">
              Add JSON bundles inside <code className="text-white">content/</code> to generate featured prompt cards automatically.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
