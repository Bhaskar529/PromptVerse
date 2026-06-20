import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionIcon } from '@/components/SectionIcon';
import type { SectionConfig } from '@/lib/sections';

type Props = {
  section: SectionConfig & { promptCount: number; subcategoryCount: number };
};

const BADGES: Record<string, string> = {
  'image-prompts': 'Creative Studio',
  'video-prompts': 'Motion & Storytelling',
  'audio-prompts': 'Sound & Music',
  'chat-prompts':  'Reasoning & Intelligence',
};

// Per-section ambient glow colour
const GLOW_COLORS: Record<string, string> = {
  image: '#b79cff',
  video: '#6b8eff',
  audio: '#e879a8',
  chat:  '#7b78ff',
};

export function CategoryCard({ section }: Props) {
  const theme = section.slug.replace('-prompts', '') as keyof typeof GLOW_COLORS;
  const glowColor = GLOW_COLORS[theme] ?? '#b79cff';

  return (
    <Link
      href={`/${section.slug}`}
      prefetch
      className={`category-card category-card--${theme} group verse-fade-up`}
      aria-label={`Browse ${section.title}`}
    >
      {/* Noise texture */}
      <div className="category-card__particles" aria-hidden="true" />

      {/* Ambient glow orb */}
      <div
        className="category-card__glow"
        aria-hidden="true"
        style={{ backgroundColor: glowColor }}
      />

      {/* Header row: badge + icon */}
      <div className="flex items-start justify-between gap-3">
        <span className={`category-badge category-badge--${theme}`} aria-label="Category type">
          {BADGES[section.slug] ?? section.eyebrow}
        </span>
        <SectionIcon slug={section.slug} size={26} />
      </div>

      {/* Title + eyebrow + description */}
      <div className="mt-6 space-y-2.5">
        <p className="verse-kicker text-xs uppercase">{section.eyebrow}</p>
        <h2 className={`category-title category-title--${theme}`}>
          <SectionIcon slug={section.slug} size={20} className="category-title__icon" aria-hidden="true" />
          <span className={`category-heading--${theme}`}>{section.title}</span>
        </h2>
        <p className="text-sm leading-7 verse-muted" style={{ color: 'var(--color-muted)' }}>
          {section.description}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
        <div className="category-stat">
          <p className="text-xs uppercase tracking-widest verse-muted" style={{ color: 'var(--color-muted)', letterSpacing: '0.22em' }}>
            Prompts
          </p>
          <p className="verse-stat-number mt-2 font-display text-3xl tracking-tight">
            {section.promptCount}
          </p>
        </div>
        <div className="category-stat">
          <p className="text-xs uppercase tracking-widest verse-muted" style={{ color: 'var(--color-muted)', letterSpacing: '0.22em' }}>
            Styles
          </p>
          <p className="verse-stat-number mt-2 font-display text-3xl tracking-tight">
            {section.subcategoryCount}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-7 flex items-center justify-between text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
        <span className="font-medium">Browse collection</span>
        <ArrowUpRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </Link>
  );
}
