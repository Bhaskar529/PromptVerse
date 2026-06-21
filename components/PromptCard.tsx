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

const TITLE_GRADIENTS: Array<{ match: string; gradient: string }> = [
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

function getPromptTitleGradient(prompt: PromptLike) {
  const haystack = `${prompt.subcategory ?? ''} ${prompt.category ?? ''} ${prompt.title ?? ''}`.toLowerCase();
  return TITLE_GRADIENTS.find(({ match }) => haystack.includes(match))?.gradient
    ?? 'linear-gradient(135deg, #d7c8ff 0%, #b79cff 52%, #8a63ff 100%)';
}

export function PromptCard({ prompt }: { prompt: PromptLike }) {
  const href = prompt.href || '/search';
  const tags  = Array.isArray(prompt.tags) ? prompt.tags.filter(Boolean).slice(0, 4) : [];
  const tools = Array.isArray(prompt.tools) ? prompt.tools.filter(Boolean).slice(0, 2) : [];
  const diff  = (prompt.difficulty ?? 'intermediate').toLowerCase();
  const diffBg   = DIFFICULTY_COLORS[diff]  ?? DIFFICULTY_COLORS['intermediate'];
  const diffText = DIFFICULTY_TEXT[diff]    ?? DIFFICULTY_TEXT['intermediate'];
  const titleGradient = getPromptTitleGradient(prompt);

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
      <h3
        className="prompt-card__title verse-card-title font-display text-[1.9rem] tracking-[-0.035em]"
        style={{
          backgroundImage: titleGradient,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          textShadow: '0 10px 26px rgba(123, 120, 255, 0.12)',
        }}
      >
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
