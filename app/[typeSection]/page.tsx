import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PromptCard } from '@/components/PromptCard';
import { JsonLd } from '@/components/JsonLd';
import { PageSectionHero } from '@/components/PageSectionHero';
import { BackLink } from '@/components/BackLink';
import { buildCollectionJsonLd, buildMetadata } from '@/lib/seo';
import { getSectionBySlug, getTypePageData } from '@/lib/contentFacade';

export const dynamicParams = false;

type Props = { params: Promise<{ typeSection: string }> };


const bubbleHueMap: Record<string, string> = {
  business: '#d7b66a', coding: '#6fa8ff', education: '#c7a7ff', finance: '#8bd7c8',
  marketing: '#f2a26e', productivity: '#d99ef1', research: '#8fb8ff', startup: '#ffb98e',
  writing: '#d9b9ff', ai: '#9b87ff', audio: '#f19fe3', video: '#88a0ff', chat: '#b6a8ff',
  image: '#d5b0ff', photography: '#d5b0ff', travel: '#88d0ff', food: '#f0c06a', nature: '#8bd79e',
  architecture: '#87cfe0', fashion: '#f09fc1', product: '#efd57a', music: '#d4a1ff', podcast: '#86dccd'
};
const getBubbleColor = (name: string) => bubbleHueMap[name.toLowerCase()] ?? '#d9d3ff';

// removed duplicate color map
const bubbleTextColorMap: Record<string, string> = {
  photography: '#cab8ff',
  portraits: '#c7a8ff',
  portrait: '#c7a8ff',
  nature: '#6ecf9a',
  travel: '#7fc8ff',
  food: '#e9b35f',
  architecture: '#73d4de',
  fashion: '#ec8fb3',
  'product photography': '#e3bf63',
  business: '#e7c85f',
  marketing: '#f09a56',
  coding: '#5ea5ff',
  ai: '#8d73ff',
  music: '#d89bf8',
  podcast: '#5ec9b6',
  video: '#8d82ff',
};

function getBubbleTextColor(name: string) {
  const lower = name.toLowerCase();
  const exact = bubbleTextColorMap[lower];
  if (exact) return exact;
  const partial = Object.entries(bubbleTextColorMap).find(([key]) => lower.includes(key));
  return partial?.[1] ?? '#d9d6f7';
}

export function generateStaticParams() {
  return ['image-prompts', 'video-prompts', 'audio-prompts', 'chat-prompts'].map((typeSection) => ({ typeSection }));
}

export async function generateMetadata({ params }: Props) {
  const { typeSection } = await params;
  const section = getSectionBySlug(typeSection);
  if (!section) return {};

  return buildMetadata({
    title: section.title,
    description: section.description,
    path: `/${section.slug}`,
    keywords: [section.title, `${section.singular} library`, `${section.type} prompts`],
  });
}

export default async function TypeSectionPage({ params }: Props) {
  const { typeSection } = await params;
  const section = getSectionBySlug(typeSection);
  if (!section) notFound();

  const data = getTypePageData(section.type);
  const sortedBundles = [...data.bundles].sort((a, b) => b.promptCount - a.promptCount);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <BackLink href="/" label="Back to home" className="mb-6" />
      <JsonLd data={buildCollectionJsonLd({ title: section.title, description: section.description, path: `/${section.slug}` })} />
      <PageSectionHero
        section={section}
        title={section.title}
        description={section.description}
        stats={[
          { label: 'Subcategories', value: data.bundles.length },
          { label: 'Prompts', value: data.prompts.length },
          
        ]}
      />

      <section className={`bubble-discovery bubble-discovery--${section.type} mt-12`} aria-labelledby="subcategory-bubbles-title">
        <div className="bubble-discovery__header">
          <div>
            <p className="verse-kicker text-xs uppercase">Bubble discovery</p>
            <h2 id="subcategory-bubbles-title" className="verse-heading-soft mt-3 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
              Explore the living subcategory ecosystem
            </h2>
          </div>
          <p className="bubble-discovery__intro text-sm leading-7 text-verse-muted sm:text-base">
            Each bubble reflects a creative cluster inside {section.title.toLowerCase()}, with larger forms surfacing broader demand and smaller ones revealing focused niches.
          </p>
        </div>

        {sortedBundles.length ? (
          <div className="bubble-field" role="list" aria-label={`${section.title} subcategories`}>
            {sortedBundles.map((bundle, index) => {
              const sizeClass = 'subcategory-bubble--uniform';

              const tags = bundle.tags.slice(0, sizeClass === 'subcategory-bubble--small' ? 1 : 2);

              return (
                <Link
                  key={bundle.subcategorySlug}
                  href={`/${section.slug}/${bundle.subcategorySlug}`}
                  prefetch
                  role="listitem"
                  className={`subcategory-bubble ${sizeClass}`}
                >
                  <span className="subcategory-bubble__orb" aria-hidden="true" />
                  <span className="subcategory-bubble__halo" aria-hidden="true" />
                  <span className="subcategory-bubble__ripple" aria-hidden="true" />
                  <span className="subcategory-bubble__inner">
                    <span className="subcategory-bubble__eyebrow">Subcategory</span>
                    <span className="subcategory-bubble__title">{bundle.subcategoryTitle}</span>
                    <span className="subcategory-bubble__meta">
                      <span>{bundle.promptCount} prompts</span>
                      <span>{bundle.tools.length} tools</span>
                    </span>
                    {tags.length ? (
                      <span className="subcategory-bubble__tags">
                        {tags.map((tag) => (
                          <span key={tag} className="subcategory-bubble__tag">{tag}</span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-verse-muted">
            No subcategory JSON bundles were found yet in <code className="text-white">content/{section.type}</code>.
          </div>
        )}
      </section>

      <div className="mt-16">
        <div className="mb-8">
          <p className="verse-kicker text-xs uppercase">Featured in {section.title}</p>
          <h2 className="verse-heading-soft mt-3 font-display text-4xl tracking-[-0.04em]">Editorially surfaced prompts</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.prompts.slice(0, 6).map((prompt) => (
            <PromptCard key={prompt.slug} prompt={prompt} />
          ))}
        </div>
      </div>

      <BackLink href="/" label="Back to home" className="mt-12" />
    </section>
  );
}
