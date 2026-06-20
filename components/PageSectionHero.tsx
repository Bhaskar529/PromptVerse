import { SectionIcon } from '@/components/SectionIcon';
import type { SectionConfig } from '@/lib/sections';

const HEADING_CLASS: Record<string, string> = {
  'image-prompts': 'category-heading--image',
  'video-prompts': 'category-heading--video',
  'audio-prompts': 'category-heading--audio',
  'chat-prompts':  'category-heading--chat',
};

export function PageSectionHero({
  section,
  title,
  description,
  stats,
}: {
  section: SectionConfig;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
}) {
  const headingClass = HEADING_CLASS[section.slug] ?? 'verse-heading';

  return (
    <div className="hero-panel">
      {/* Top edge gradient line */}
      <div
        className="hero-panel__top-line"
        aria-hidden="true"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${section.accent}55 50%, transparent 95%)` }}
      />
      {/* Ambient orb */}
      <div
        className="hero-panel__orb"
        aria-hidden="true"
        style={{ backgroundColor: section.accent }}
      />

      {/* Eyebrow + icon + heading */}
      <p className="verse-kicker">{section.eyebrow}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <SectionIcon slug={section.slug} size={32} />
        <h1
          className={`${headingClass} font-display leading-none tracking-tight`}
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)' }}
        >
          {title}
        </h1>
      </div>
      <p
        className="mt-5 max-w-3xl leading-8 verse-muted"
        style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: 'var(--color-muted)' }}
      >
        {description}
      </p>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="hero-panel__stat">
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
              {stat.label}
            </p>
            <p className="verse-stat-number mt-3 font-display tracking-tight" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
