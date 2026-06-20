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

const bubbleSizeClasses = [
  'subcategory-bubble--hero',
  'subcategory-bubble--large',
  'subcategory-bubble--medium',
  'subcategory-bubble--small',
] as const;

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
          { label: 'Tools', value: Array.from(new Set(data.prompts.flatMap((prompt) => prompt.tools))).length },
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
              const sizeClass =
                index === 0
                  ? bubbleSizeClasses[0]
                  : index < 3
                    ? bubbleSizeClasses[1]
                    : index < 7
                      ? bubbleSizeClasses[2]
                      : bubbleSizeClasses[3];

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
