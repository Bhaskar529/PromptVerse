import Link from 'next/link';
import { ArrowUpRight, Layers3, Wrench, Zap } from 'lucide-react';

type PromptLike = {
  href?: string;
  title?: string;
  description?: string;
  tags?: string[];
  tools?: string[];
  difficulty?: string;
  subcategory?: string;
  category?: string;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     'rgba(74,222,128,0.16)',
  intermediate: 'rgba(183,156,255,0.14)',
  advanced:     'rgba(251,146,60,0.15)',
  expert:       'rgba(248,113,113,0.15)',
};
const DIFFICULTY_TEXT: Record<string, string> = {
  beginner:     '#86efac',
  intermediate: '#d8ccff',
  advanced:     '#fdba74',
  expert:       '#fca5a5',
};

export function PromptCard({ prompt }: { prompt: PromptLike }) {
  const href = prompt.href || '/search';
  const tags  = Array.isArray(prompt.tags) ? prompt.tags.filter(Boolean).slice(0, 4) : [];
  const tools = Array.isArray(prompt.tools) ? prompt.tools.filter(Boolean).slice(0, 2) : [];
  const diff  = (prompt.difficulty ?? 'intermediate').toLowerCase();
  const diffBg   = DIFFICULTY_COLORS[diff]  ?? DIFFICULTY_COLORS['intermediate'];
  const diffText = DIFFICULTY_TEXT[diff]    ?? DIFFICULTY_TEXT['intermediate'];

  return (
    <Link
      href={href}
      prefetch
      className="prompt-card group verse-fade-up"
      aria-label={`View prompt: ${prompt.title || 'Untitled'}`}
    >
      {/* Meta row */}
      <div className="prompt-card__meta">
        <span>{prompt.subcategory ?? 'Prompt'}</span>
        <span className="prompt-card__dot" aria-hidden="true" />
        <span
          style={{
            background: diffBg,
            color: diffText,
            padding: '0.18rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
          }}
        >
          {prompt.difficulty ?? 'Intermediate'}
        </span>
      </div>

      {/* Title */}
      <h3 className="prompt-card__title verse-card-title font-display text-[1.9rem] tracking-[-0.035em]">
        {prompt.title ?? 'Untitled prompt'}
      </h3>

      {/* Description */}
      <p className="prompt-card__desc">
        {prompt.description ?? 'Prompt details will appear once the content bundle is populated.'}
      </p>

      <span className="prompt-card__shine" aria-hidden="true" />
      <span className="prompt-card__orb" aria-hidden="true" />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="prompt-card__tags" role="list" aria-label="Tags" style={{ alignContent: 'flex-start' }}>
          {tags.map((tag) => (
            <span key={tag} className="prompt-card__tag prompt-chip" role="listitem">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="prompt-card__footer">
        <span className="prompt-card__footer-line" aria-hidden="true" />
        <div className="prompt-card__footer-meta">
          {tags.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Layers3 size={13} aria-hidden="true" />
              {tags.length} tag{tags.length !== 1 ? 's' : ''}
            </span>
          )}
          {tools.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Wrench size={13} aria-hidden="true" />
              {tools.join(', ')}
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'rgba(183,156,255,0.9)' }}
        >
          View
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
